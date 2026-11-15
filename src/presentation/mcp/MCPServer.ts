import { readFileSync } from 'node:fs';
import { join } from 'node:path';
/**
 * MCPServer.ts
 *
 * @semantic-intent MCP Server for D1 Database introspection
 * Exposes domain capabilities via Model Context Protocol
 *
 * @observable-anchoring
 * - Tools expose observable domain operations
 * - Request parameters map to use case inputs
 * - Responses preserve domain semantics
 *
 * @intent-preservation
 * - Tool names reflect domain intent (analyze, validate, suggest)
 * - Parameters maintain semantic meaning from domain
 * - Errors preserve domain context
 *
 * @semantic-over-structural
 * - Focus on domain capabilities, not MCP internals
 * - Tool design based on user intent, not technical constraints
 * - Error messages convey semantic meaning
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ErrorCode,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { AnalyzeSchemaUseCase } from '../../application/use-cases/AnalyzeSchemaUseCase.js';
import { GetRelationshipsUseCase } from '../../application/use-cases/GetRelationshipsUseCase.js';
import { ValidateSchemaUseCase } from '../../application/use-cases/ValidateSchemaUseCase.js';
import { SuggestOptimizationsUseCase } from '../../application/use-cases/SuggestOptimizationsUseCase.js';
import { parseEnvironment } from '../../domain/value-objects/Environment.js';

// Reported to MCP clients; read from package.json so it cannot drift (3 levels up from src/ or dist/).
const PACKAGE_VERSION: string = JSON.parse(readFileSync(join(__dirname, '..', '..', '..', 'package.json'), 'utf-8')).version;

/**
 * MCP Server for D1 Database introspection
 *
 * Semantic Intent: Expose domain use cases as MCP tools
 * Observable Anchoring: Tools represent observable domain operations
 */
export class D1DatabaseMCPServer {
	private readonly server: Server;

	constructor(
		private readonly analyzeSchemaUseCase: AnalyzeSchemaUseCase,
		private readonly getRelationshipsUseCase: GetRelationshipsUseCase,
		private readonly validateSchemaUseCase: ValidateSchemaUseCase,
		private readonly suggestOptimizationsUseCase: SuggestOptimizationsUseCase,
	) {
		this.server = new Server(
			{
				name: 'semantic-d1-mcp',
				version: PACKAGE_VERSION,
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		this.registerTools();
		Object.freeze(this);
	}

	/**
	 * Register MCP tools
	 *
	 * Semantic: Map domain use cases to MCP tool interface
	 */
	private registerTools(): void {
		// List available tools
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: [
				{
					name: 'analyze_database_schema',
					description:
						'Analyze D1 database schema structure, tables, columns, indexes, and relationships with optional sample data',
					inputSchema: {
						type: 'object',
						properties: {
							environment: {
								type: 'string',
								enum: ['development', 'staging', 'production'],
								description: 'Database environment to analyze',
							},
							includeSamples: {
								type: 'boolean',
								default: true,
								description: 'Include sample data from tables (max 5 rows per table)',
							},
							maxSampleRows: {
								type: 'number',
								default: 5,
								description: 'Maximum number of sample rows per table',
							},
						},
						required: ['environment'],
					},
				},
				{
					name: 'get_table_relationships',
					description:
						'Extract and analyze foreign key relationships between tables in the database',
					inputSchema: {
						type: 'object',
						properties: {
							environment: {
								type: 'string',
								enum: ['development', 'staging', 'production'],
								description: 'Database environment to analyze',
							},
							tableName: {
								type: 'string',
								description: 'Optional: Filter relationships for specific table',
							},
						},
						required: ['environment'],
					},
				},
				{
					name: 'validate_database_schema',
					description:
						'Validate database schema integrity and detect potential issues (missing primary keys, orphaned foreign keys, etc.)',
					inputSchema: {
						type: 'object',
						properties: {
							environment: {
								type: 'string',
								enum: ['development', 'staging', 'production'],
								description: 'Database environment to validate',
							},
						},
						required: ['environment'],
					},
				},
				{
					name: 'suggest_schema_optimizations',
					description:
						'Analyze schema and suggest performance optimizations (missing indexes, redundant indexes, etc.)',
					inputSchema: {
						type: 'object',
						properties: {
							environment: {
								type: 'string',
								enum: ['development', 'staging', 'production'],
								description: 'Database environment to analyze for optimizations',
							},
						},
						required: ['environment'],
					},
				},
			],
		}));

		// Handle tool calls
		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			try {
				switch (request.params.name) {
					case 'analyze_database_schema':
						return await this.handleAnalyzeSchema(request.params.arguments);
					case 'get_table_relationships':
						return await this.handleGetRelationships(request.params.arguments);
					case 'validate_database_schema':
						return await this.handleValidateSchema(request.params.arguments);
					case 'suggest_schema_optimizations':
						return await this.handleSuggestOptimizations(request.params.arguments);
					default:
						throw new McpError(
							ErrorCode.MethodNotFound,
							`Unknown tool: ${request.params.name}`,
						);
				}
			} catch (error) {
				if (error instanceof McpError) {
					throw error;
				}
				throw new McpError(
					ErrorCode.InternalError,
					`Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		});
	}

	/**
	 * Handle analyze_database_schema tool
	 */
	private async handleAnalyzeSchema(args: unknown) {
		const { environment, includeSamples, maxSampleRows } = args as {
			environment: string;
			includeSamples?: boolean;
			maxSampleRows?: number;
		};

		const result = await this.analyzeSchemaUseCase.execute({
			environment: parseEnvironment(environment),
			includeSamples,
			maxSampleRows,
		});

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	}

	/**
	 * Handle get_table_relationships tool
	 */
	private async handleGetRelationships(args: unknown) {
		const { environment, tableName } = args as {
			environment: string;
			tableName?: string;
		};

		const result = await this.getRelationshipsUseCase.execute({
			environment: parseEnvironment(environment),
			tableName,
		});

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	}

	/**
	 * Handle validate_database_schema tool
	 */
	private async handleValidateSchema(args: unknown) {
		const { environment } = args as { environment: string };

		const result = await this.validateSchemaUseCase.execute({
			environment: parseEnvironment(environment),
		});

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	}

	/**
	 * Handle suggest_schema_optimizations tool
	 */
	private async handleSuggestOptimizations(args: unknown) {
		const { environment } = args as { environment: string };

		const result = await this.suggestOptimizationsUseCase.execute({
			environment: parseEnvironment(environment),
		});

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	}

	/**
	 * Start the MCP server
	 *
	 * Semantic: Begin listening for MCP protocol requests
	 */
	async start(): Promise<void> {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
	}

	/**
	 * Stop the MCP server
	 */
	async stop(): Promise<void> {
		await this.server.close();
	}
}
