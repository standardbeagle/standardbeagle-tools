---
title: lci MCP Server - Lightning Code Intelligence for Claude Code
description: MCP server providing sub-millisecond semantic code search with 79.8% context reduction. Navigate codebases and understand dependencies instantly.
keywords: [MCP server, code search, semantic search, code intelligence, Lightning Code Index, symbol navigation]
sidebar_position: 3
---

# lci MCP Server

The **lci MCP server** provides sub-millisecond semantic code search with intelligent context reduction, enabling codebase navigation and dependency understanding.

## Installation

```bash
# Using npx (recommended)
npx @standardbeagle/lci@latest mcp

# Global installation
npm install -g @standardbeagle/lci
lci mcp
```

## Configuration

### Claude Code

```json
{
  "mcpServers": {
    "lci": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/lci@latest", "mcp"],
      "env": {
        "LCI_INDEX_PATH": ".lci-index"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LCI_INDEX_PATH` | Path to index storage | `.lci-index` |
| `LCI_EXCLUDE_PATTERNS` | Patterns to exclude | `node_modules,dist,build` |
| `LCI_MAX_FILE_SIZE` | Max file size to index | `1MB` |

## Available Tools

### Search

| Tool | Description | Parameters |
|------|-------------|------------|
| `search` | Semantic code search | `query: string`, `limit?: number` |
| `search_by_type` | Search by symbol type | `type: string`, `query?: string` |
| `search_files` | Search file names | `pattern: string` |

### Context

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_context` | Get symbol context | `symbol: string`, `depth?: number` |
| `get_definition` | Get symbol definition | `symbol: string` |
| `get_references` | Find all references | `symbol: string` |
| `get_callers` | Find callers | `symbol: string` |
| `get_callees` | Find callees | `symbol: string` |

### Exploration

| Tool | Description | Parameters |
|------|-------------|------------|
| `explore` | Explore codebase structure | `path?: string`, `depth?: number` |
| `list_symbols` | List symbols in file | `file: string` |
| `list_files` | List files in directory | `path?: string` |
| `get_file_info` | Get file metadata | `file: string` |

### Index Management

| Tool | Description | Parameters |
|------|-------------|------------|
| `index_status` | Check index status | - |
| `reindex` | Rebuild the index | `force?: boolean` |
| `add_to_index` | Add files to index | `paths: string[]` |

## Usage Examples

### Semantic Search

```javascript
// Search for authentication logic
const results = await search({
  query: "user authentication login",
  limit: 10
});

console.log(results);
// Output: {
//   results: [
//     { file: "src/auth/login.ts", symbol: "authenticate", score: 0.95 },
//     { file: "src/middleware/auth.ts", symbol: "verifyToken", score: 0.87 }
//   ],
//   context_reduction: 0.79
// }
```

### Get Symbol Context

```javascript
// Get context for a function
const context = await get_context({
  symbol: "UserService.authenticate",
  depth: 2
});

console.log(context);
// Output: {
//   definition: "async authenticate(email: string, password: string): Promise<User>",
//   file: "src/services/UserService.ts",
//   line: 45,
//   callers: ["AuthController.login", "AuthMiddleware.verify"],
//   callees: ["hashPassword", "generateToken"],
//   documentation: "Authenticates a user by email and password..."
// }
```

### Explore Structure

```javascript
// Explore directory structure
const structure = await explore({
  path: "src/components",
  depth: 2
});

console.log(structure);
// Output: {
//   directories: [...],
//   files: [...],
//   symbol_count: 156,
//   types: { class: 12, function: 89, interface: 15 }
// }
```

### Find References

```javascript
// Find all references to a symbol
const refs = await get_references({
  symbol: "config"
});

console.log(refs);
// Output: {
//   references: [
//     { file: "src/index.ts", line: 5, context: "import { config } from..." },
//     { file: "src/api/server.ts", line: 12, context: "const port = config.port" }
//   ],
//   count: 23
// }
```

## Index Building

The index is built automatically on first use. You can also trigger manually:

```javascript
// Check index status
const status = await index_status();
// { indexed: true, files: 234, symbols: 1567, last_updated: "..." }

// Force reindex
await reindex({ force: true });
```

## Supported Languages

| Language | File Extensions | Features |
|----------|-----------------|----------|
| TypeScript | `.ts`, `.tsx` | Full support |
| JavaScript | `.js`, `.jsx` | Full support |
| Python | `.py` | Full support |
| Go | `.go` | Full support |
| Rust | `.rs` | Full support |
| Java | `.java` | Partial support |
| C/C++ | `.c`, `.cpp`, `.h` | Partial support |

## Response Format

All tools return responses in this format:

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "query_time_ms": 0.5,
    "context_reduction": 0.79
  }
}
```

## Performance

| Operation | Typical Time |
|-----------|--------------|
| Search | `<1ms` |
| Get context | `<2ms` |
| Explore | `<5ms` |
| Reindex | ~100ms per 1000 files |

## Context Reduction

lci achieves 79.8% context reduction by:

1. **Symbol extraction**: Only relevant symbols
2. **Relationship filtering**: Related code only
3. **Documentation prioritization**: Comments and docs first
4. **Noise elimination**: Exclude boilerplate

## Error Codes

| Code | Description |
|------|-------------|
| `INDEX_NOT_READY` | Index not yet built |
| `SYMBOL_NOT_FOUND` | Symbol doesn't exist |
| `FILE_NOT_FOUND` | File doesn't exist |
| `PARSE_ERROR` | Failed to parse file |

## Version History

| Version | Changes |
|---------|---------|
| 0.3.0 | Cross-platform improvements |
| 0.2.0 | Added more languages |
| 0.1.0 | Initial release |

## Related Resources

- [lci Plugin](/docs/plugins/lci)
- [NPM Package](https://www.npmjs.com/package/@standardbeagle/lci)
- [GitHub Repository](https://github.com/standardbeagle/lci)
