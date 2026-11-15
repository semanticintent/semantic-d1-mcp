"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.D1DatabaseMCPServer = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
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
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const Environment_js_1 = require("../../domain/value-objects/Environment.js");
// Reported to MCP clients; read from package.json so it cannot drift (3 levels up from src/ or dist/).
const PACKAGE_VERSION = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, '..', '..', '..', 'package.json'), 'utf-8')).version;
/**
 * MCP Server for D1 Database introspection
 *
 * Semantic Intent: Expose domain use cases as MCP tools
 * Observable Anchoring: Tools represent observable domain operations
 */
class D1DatabaseMCPServer {
    analyzeSchemaUseCase;
    getRelationshipsUseCase;
    validateSchemaUseCase;
    suggestOptimizationsUseCase;
    server;
    constructor(analyzeSchemaUseCase, getRelationshipsUseCase, validateSchemaUseCase, suggestOptimizationsUseCase) {
        this.analyzeSchemaUseCase = analyzeSchemaUseCase;
        this.getRelationshipsUseCase = getRelationshipsUseCase;
        this.validateSchemaUseCase = validateSchemaUseCase;
        this.suggestOptimizationsUseCase = suggestOptimizationsUseCase;
        this.server = new index_js_1.Server({
            name: 'semantic-d1-mcp',
            version: PACKAGE_VERSION,
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.registerTools();
        Object.freeze(this);
    }
    /**
     * Register MCP tools
     *
     * Semantic: Map domain use cases to MCP tool interface
     */
    registerTools() {
        // List available tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'analyze_database_schema',
                    description: 'Analyze D1 database schema structure, tables, columns, indexes, and relationships with optional sample data',
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
                    description: 'Extract and analyze foreign key relationships between tables in the database',
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
                    description: 'Validate database schema integrity and detect potential issues (missing primary keys, orphaned foreign keys, etc.)',
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
                    description: 'Analyze schema and suggest performance optimizations (missing indexes, redundant indexes, etc.)',
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
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
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
                        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            }
            catch (error) {
                if (error instanceof types_js_1.McpError) {
                    throw error;
                }
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    /**
     * Handle analyze_database_schema tool
     */
    async handleAnalyzeSchema(args) {
        const { environment, includeSamples, maxSampleRows } = args;
        const result = await this.analyzeSchemaUseCase.execute({
            environment: (0, Environment_js_1.parseEnvironment)(environment),
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
    async handleGetRelationships(args) {
        const { environment, tableName } = args;
        const result = await this.getRelationshipsUseCase.execute({
            environment: (0, Environment_js_1.parseEnvironment)(environment),
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
    async handleValidateSchema(args) {
        const { environment } = args;
        const result = await this.validateSchemaUseCase.execute({
            environment: (0, Environment_js_1.parseEnvironment)(environment),
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
    async handleSuggestOptimizations(args) {
        const { environment } = args;
        const result = await this.suggestOptimizationsUseCase.execute({
            environment: (0, Environment_js_1.parseEnvironment)(environment),
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
    async start() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
    }
    /**
     * Stop the MCP server
     */
    async stop() {
        await this.server.close();
    }
}
exports.D1DatabaseMCPServer = D1DatabaseMCPServer;
//# sourceMappingURL=MCPServer.js.map