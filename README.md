[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/semanticintent-semantic-d1-mcp-badge.png)](https://mseep.ai/app/semanticintent-semantic-d1-mcp)

# Semantic D1 MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/semanticintent/semantic-d1-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/semanticintent/semantic-d1-mcp/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x+-green.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-398%20passing-brightgreen.svg)](https://github.com/semanticintent/semantic-d1-mcp)

[![Semantic Intent](https://img.shields.io/badge/Pattern-Semantic%20Intent-blue.svg)](https://github.com/semanticintent)
[![Hexagonal Architecture](https://img.shields.io/badge/Architecture-Hexagonal-purple.svg)](ARCHITECTURE.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **Reference implementation of Semantic Intent as Single Source of Truth patterns**
>
> A Model Context Protocol (MCP) server for Cloudflare D1 database introspection, demonstrating semantic anchoring, observable properties, and domain-driven design for AI-assisted database development.

## 📚 Table of Contents

- [What Makes This Different](#-what-makes-this-different)
- [Quick Start](#-quick-start)
- [MCP Tools](#-mcp-tools)
- [Architecture](#-architecture)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Security](#-security)
- [License](#license)

## 🎯 What Makes This Different

This isn't just another database introspection tool—it's a **reference implementation** of proven semantic intent patterns:

- ✅ **Semantic Anchoring**: Schema analysis based on meaning (table purpose, relationships), not technical metrics (row counts, sizes)
- ✅ **Observable Properties**: Decisions anchored to directly observable schema markers (foreign keys, indexes, constraints)
- ✅ **Intent Preservation**: Database semantics maintained through all transformations (development → staging → production)
- ✅ **Domain Boundaries**: Clear semantic ownership (Schema Domain ≠ Query Optimization Domain ≠ MCP Protocol Domain)

Built on research from [Semantic Intent as Single Source of Truth](https://github.com/semanticintent), this implementation demonstrates how to build maintainable, AI-friendly database tools that preserve intent.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- Cloudflare account with D1 databases
- Cloudflare API token with D1 access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/semanticintent/semantic-d1-mcp.git
   cd semantic-d1-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**

   Copy the example configuration:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Cloudflare credentials:
   ```bash
   # Cloudflare Configuration
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

   # D1 Database Configuration - Development
   D1_DEV_DATABASE_ID=your_dev_database_id
   D1_DEV_DATABASE_NAME=your_dev_database_name

   # D1 Database Configuration - Staging (Optional)
   D1_STAGING_DATABASE_ID=your_staging_database_id
   D1_STAGING_DATABASE_NAME=your_staging_database_name

   # D1 Database Configuration - Production (Optional)
   D1_PROD_DATABASE_ID=your_prod_database_id
   D1_PROD_DATABASE_NAME=your_prod_database_name
   ```

   **Note**: At least one database environment must be configured.

4. **Build the server**
   ```bash
   npm run build
   ```

5. **Start the MCP server**
   ```bash
   npm start
   ```

   Or use the provided shell script:
   ```bash
   ./start-d1-mcp.sh
   ```

### Get Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use the **Edit Cloudflare Workers** template
5. Add **D1** permissions: `D1:Read`
6. Copy the token to your `.env` file

### Get D1 Database IDs

```bash
# List all your D1 databases
wrangler d1 list

# Get specific database info
wrangler d1 info <database-name>
```

Copy the database IDs to your `.env` file.

---

## 🛠️ MCP Tools

This server provides **4 comprehensive MCP tools** for D1 database introspection:

### 1. **analyze_database_schema**
Analyze complete database schema structure with metadata and optional sample data.

**Parameters:**
- `environment` (required): `"development"` | `"staging"` | `"production"`
- `includeSamples` (optional, default: `true`): Include sample data from tables
- `maxSampleRows` (optional, default: `5`): Maximum rows per table sample

**Returns:**
- Complete schema analysis
- Table structures with columns, types, constraints
- Indexes and foreign keys
- Sample data from each table (if enabled)
- Schema metadata and statistics

**Example:**
```json
{
  "name": "analyze_database_schema",
  "arguments": {
    "environment": "development",
    "includeSamples": true,
    "maxSampleRows": 5
  }
}
```

### 2. **get_table_relationships**
Extract and analyze foreign key relationships between tables.

**Parameters:**
- `environment` (required): Database environment
- `tableName` (optional): Filter relationships for specific table

**Returns:**
- Foreign key relationships with cardinality (one-to-many, many-to-one)
- Referential integrity rules (CASCADE, SET NULL, etc.)
- Relationship metadata and statistics

**Example:**
```json
{
  "name": "get_table_relationships",
  "arguments": {
    "environment": "production",
    "tableName": "users"
  }
}
```

### 3. **validate_database_schema**
Validate database schema for common issues and anti-patterns.

**Parameters:**
- `environment` (required): Database environment

**Returns:**
- Schema validation results
- Missing primary keys
- Foreign keys without indexes
- Naming convention violations
- Tables without relationships

**Example:**
```json
{
  "name": "validate_database_schema",
  "arguments": {
    "environment": "production"
  }
}
```

### 4. **suggest_database_optimizations**
Generate schema optimization recommendations based on structure analysis.

**Parameters:**
- `environment` (required): Database environment

**Returns:**
- Prioritized optimization suggestions (high/medium/low)
- Missing index recommendations
- Primary key suggestions
- Schema improvement opportunities
- Performance optimization tips

**Example:**
```json
{
  "name": "suggest_database_optimizations",
  "arguments": {
    "environment": "production"
  }
}
```

---

## 🔌 Connect to Claude Desktop

Connect this MCP server to Claude Desktop for AI-assisted database development.

### Configuration

1. **Edit Claude Desktop config** - Go to Settings → Developer → Edit Config

2. **Add MCP server configuration**:

```json
{
  "mcpServers": {
    "semantic-d1": {
      "command": "node",
      "args": [
        "/absolute/path/to/semantic-d1-mcp/dist/index.js"
      ],
      "env": {
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id",
        "CLOUDFLARE_API_TOKEN": "your_api_token",
        "D1_DEV_DATABASE_ID": "your_dev_db_id",
        "D1_DEV_DATABASE_NAME": "your_dev_db_name",
        "D1_STAGING_DATABASE_ID": "your_staging_db_id",
        "D1_STAGING_DATABASE_NAME": "your_staging_db_name",
        "D1_PROD_DATABASE_ID": "your_prod_db_id",
        "D1_PROD_DATABASE_NAME": "your_prod_db_name"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Verify tools are available** - You should see 4 D1 tools in Claude's tool list

### Usage Example

In Claude Desktop:
> "Analyze my production database schema and suggest optimizations for tables with foreign keys"

Claude will use the `analyze_database_schema` and `suggest_database_optimizations` tools automatically.

---

## 🏗️ Architecture

This project demonstrates **Domain-Driven Hexagonal Architecture** with clean separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│              (MCP Server - Protocol Handling)            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Application Layer                       │
│        (Use Cases - Schema Analysis Orchestration)      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    Domain Layer                          │
│     (Schema Entities, Relationship Logic, Services)     │
│              Pure Business Logic                         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                Infrastructure Layer                      │
│       (Cloudflare D1 REST API, HTTP Client)             │
│           Technical Adapters                             │
└─────────────────────────────────────────────────────────┘
```

### Implementation Status

**Status**: ✅ Hexagonal architecture refactoring complete

**Current Structure**:
```
src/
├── domain/              # Business logic (entities, services)
│   ├── entities/        # DatabaseSchema, TableInfo, Column, etc.
│   ├── services/        # SchemaAnalyzer, RelationshipAnalyzer, etc.
│   ├── repositories/    # Port interfaces
│   └── value-objects/   # Environment enum
├── application/         # Use cases and orchestration
│   ├── use-cases/       # AnalyzeSchema, GetRelationships, etc.
│   └── ports/           # Cache provider interface
├── infrastructure/      # External adapters
│   ├── adapters/        # CloudflareD1Repository, Cache
│   ├── config/          # CloudflareConfig, DatabaseConfig
│   └── http/            # CloudflareAPIClient
├── presentation/        # MCP protocol layer
│   └── mcp/             # D1DatabaseMCPServer
└── index.ts             # Composition root (DI)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed design documentation.

### Layer Responsibilities

**Domain Layer**:
- Database schema entities (Schema, Table, Relationship, Index)
- Schema analysis business logic
- Relationship extraction logic
- Optimization recommendation rules

**Application Layer**:
- Orchestrate domain services
- Execute use cases (AnalyzeSchema, GetRelationships, etc.)
- Coordinate infrastructure adapters

**Infrastructure Layer**:
- Cloudflare D1 REST API integration
- HTTP client for API calls
- Cache provider (in-memory)

**Presentation Layer**:
- MCP server initialization
- Tool registration and routing
- Request/response formatting

### Semantic Intent Principles

This codebase follows strict semantic anchoring rules:

1. **Semantic Over Structural**
   ```typescript
   // ✅ SEMANTIC: Based on observable schema properties
   const needsIndex = table.hasForeignKey() && !table.hasIndexOnForeignKey()

   // ❌ STRUCTURAL: Based on technical metrics
   const needsIndex = table.rowCount > 10000 && table.queryCount > 100
   ```

2. **Intent Preservation**
   ```typescript
   // ✅ Environment semantics preserved through transformations
   const schema = await fetchSchema(Environment.PRODUCTION)
   // Schema analysis preserves "production" intent - no overrides
   ```

3. **Observable Anchoring**
   ```typescript
   // ✅ Based on directly observable properties
   const relationships = extractForeignKeys(sqliteMaster)

   // ❌ Based on inferred behavior
   const relationships = inferFromQueryPatterns(logs)
   ```

See [SEMANTIC_ANCHORING_GOVERNANCE.md](SEMANTIC_ANCHORING_GOVERNANCE.md) for complete governance rules.

---

## 🧪 Testing

**Status**: ✅ Comprehensive test suite with 398 tests passing

### Test Coverage

- ✅ **Domain Layer**: 212 tests (entities, services, validation)
- ✅ **Infrastructure Layer**: 64 tests (D1 adapter, API client, config)
- ✅ **Application Layer**: 35 tests (use cases, orchestration)
- ✅ **Presentation Layer**: 13 tests (MCP server, tool routing)
- ✅ **Integration**: 15 tests (end-to-end flows)
- ✅ **Value Objects**: 59 tests (Environment, immutability)

**Total**: 398 tests (all passing ✅)

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Framework

- **Vitest**: Fast unit testing framework
- **@vitest/coverage-v8**: Code coverage reports
- **Mock Strategy**: Mock Cloudflare D1 API responses via interface implementations

---

## 📖 Learning from This Implementation

This codebase serves as a **reference implementation** for semantic intent patterns in database tooling.

### Key Files to Study

**Hexagonal Architecture Implementation**:
- [src/index.ts](src/index.ts) - Composition root with dependency injection
- [src/domain/entities/](src/domain/entities/) - Domain entities with semantic validation
- [src/domain/services/](src/domain/services/) - Pure business logic services
- [src/application/use-cases/](src/application/use-cases/) - Orchestration layer
- [src/infrastructure/adapters/](src/infrastructure/adapters/) - External adapters
- [src/presentation/mcp/](src/presentation/mcp/) - MCP protocol layer

**Reference Documentation**:
- [D1_MCP_REFACTORING_PLAN.md](D1_MCP_REFACTORING_PLAN.md) - Complete refactoring plan
- [SEMANTIC_ANCHORING_GOVERNANCE.md](SEMANTIC_ANCHORING_GOVERNANCE.md) - Governance rules
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture details

### Related Projects

- [semantic-context-mcp](https://github.com/semanticintent/semantic-context-mcp) - Sibling reference implementation for context management

---

## 🤝 Contributing

We welcome contributions! This is a **reference implementation**, so contributions should maintain semantic intent principles.

### How to Contribute

1. **Read the guidelines**: [CONTRIBUTING.md](CONTRIBUTING.md)
2. **Check refactoring plan**: [D1_MCP_REFACTORING_PLAN.md](D1_MCP_REFACTORING_PLAN.md)
3. **Follow the architecture**: Maintain layer boundaries and semantic anchoring
4. **Add tests**: All changes need comprehensive test coverage
5. **Document intent**: Explain WHY, not just WHAT

### Contribution Standards

- ✅ Follow semantic intent patterns
- ✅ Maintain hexagonal architecture (post-refactoring)
- ✅ Add comprehensive tests (90%+ coverage target)
- ✅ Include semantic documentation
- ✅ Pass all CI checks

**Quick Links:**
- [Contributing Guide](CONTRIBUTING.md) - Detailed guidelines
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards
- [Architecture Guide](ARCHITECTURE.md) - Design principles
- [Security Policy](SECURITY.md) - Report vulnerabilities

### Community

- 💬 [Discussions](https://github.com/semanticintent/semantic-d1-mcp/discussions) - Ask questions
- 🐛 [Issues](https://github.com/semanticintent/semantic-d1-mcp/issues) - Report bugs
- 🔒 [Security](SECURITY.md) - Report vulnerabilities privately

---

## 🔒 Security

Security is a top priority. Please review our [Security Policy](SECURITY.md) for:

- API token management best practices
- What to commit / what to exclude
- Reporting security vulnerabilities
- Security checklist for deployment

**Found a vulnerability?** Email: security@semanticintent.dev

---

## 🔬 Research Foundation

This implementation is based on the research paper **"Semantic Intent as Single Source of Truth: Immutable Governance for AI-Assisted Development"**.

### Core Principles Applied

1. **Semantic Over Structural** - Schema analysis based on meaning, not metrics
2. **Intent Preservation** - Environment semantics maintained through transformations
3. **Observable Anchoring** - Decisions based on directly observable schema properties
4. **Immutable Governance** - Protect semantic integrity at runtime

### Related Resources

- [Research Paper](https://github.com/semanticintent) (coming soon)
- [Semantic Anchoring Governance](SEMANTIC_ANCHORING_GOVERNANCE.md)
- [semanticintent.dev](https://semanticintent.dev) (coming soon)

---

## 📊 Project Roadmap

### ✅ Phase 0: Initial Implementation (Complete)
- Monolithic MCP server with 6 tools
- D1 REST API integration
- Basic schema analysis

### ✅ Phase 1: Domain Layer (Complete)
- 10 domain entities with semantic validation
- 3 domain services (SchemaAnalyzer, RelationshipAnalyzer, OptimizationService)
- 212 passing tests

### ✅ Phase 2: Infrastructure Layer (Complete)
- CloudflareD1Repository adapter
- CloudflareAPIClient HTTP client
- InMemoryCacheProvider
- 64 passing tests

### ✅ Phase 3: Application Layer (Complete)
- 4 use cases (AnalyzeSchema, GetRelationships, ValidateSchema, SuggestOptimizations)
- Port interfaces (ICloudflareD1Repository, ICacheProvider)
- 35 passing tests

### ✅ Phase 4: Presentation Layer (Complete)
- D1DatabaseMCPServer with 4 MCP tools
- Request/response DTOs
- 13 passing tests

### ✅ Phase 5: Integration & Composition Root (Complete)
- Dependency injection in index.ts
- Environment configuration
- 15 integration tests

### ✅ Phase 6: CI/CD & Documentation (Complete)
- TypeScript build verification
- README updated
- 398 total tests passing

### 🎯 Phase 7: Production Readiness (Planned)
- GitHub Actions CI/CD workflow
- Dependabot automation
- Security scanning
- GitHub repository setup

See [D1_MCP_REFACTORING_PLAN.md](D1_MCP_REFACTORING_PLAN.md) for detailed roadmap.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built on [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- Inspired by [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) (Alistair Cockburn)
- Based on [Domain-Driven Design](https://www.domainlanguage.com/ddd/) principles (Eric Evans)
- Part of the [Semantic Intent](https://github.com/semanticintent) research initiative

---

**This is a reference implementation demonstrating semantic intent patterns for database introspection. Study the code, learn the patterns, and apply them to your own projects.** 🏗️
