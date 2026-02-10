---
name: search-code
description: Find code symbols, patterns, implementations, and files using LCI semantic search
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Code Search Workflows

Use LCI for all code search tasks. LCI provides sub-millisecond in-memory semantic search that outperforms grep/ripgrep for symbol-aware queries.

## When to Use

- Finding function, class, type, or variable definitions
- Searching for usage/references of a symbol
- Finding files by path pattern
- Searching by symbol type (functions, interfaces, etc.)
- Filtering search to specific languages or directories

## Choosing the Right Tool

| Need | Tool | Why |
|------|------|-----|
| Find a symbol by name | `search` | Semantic symbol matching |
| Find text/pattern in code | `search` with `flags: "content"` | Content-level search |
| Find files by path | `find_files` | File path fuzzy matching |
| Find all functions named X | `search` with `symbol_types` | Type-filtered search |
| Grep-style regex | `search` with `flags: "regex"` | Regex support |

---

## MCP Tool Calls

### Search for a Symbol

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "search",
  "parameters": {
    "pattern": "handleRequest"
  }
}
```

### Search with Symbol Type Filter

Find only functions, classes, interfaces, etc:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "search",
  "parameters": {
    "pattern": "handleRequest",
    "symbol_types": "function"
  }
}
```

Valid `symbol_types`: `function`, `class`, `method`, `variable`, `constant`, `interface`, `type`, `struct`, `module`, `namespace`, `property`, `enum`, `field`, `enum_member`. Aliases: `func`, `var`, `const`, `cls`, `meth`, `iface`, `def` (Python), `fn` (Rust).

### Search with Language Filter

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "search",
  "parameters": {
    "pattern": "handleRequest",
    "languages": ["typescript", "javascript"]
  }
}
```

### Search with Directory Filter

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "search",
  "parameters": {
    "pattern": "handleRequest",
    "filter": "src/api/**"
  }
}
```

### Content Search (grep-like)

Search file contents rather than symbol names:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "search",
  "parameters": {
    "pattern": "TODO: fix",
    "flags": "content"
  }
}
```

### Regex Search

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "search",
  "parameters": {
    "pattern": "handle[A-Z]\\w+Request",
    "flags": "regex"
  }
}
```

### Find Files by Path

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "find_files",
  "parameters": {
    "pattern": "config",
    "filter": "*.json"
  }
}
```

### Find Files in Directory

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "find_files",
  "parameters": {
    "pattern": "test",
    "directory": "src/api"
  }
}
```

---

## CLI Commands

```bash
# Symbol search
lci search handleRequest

# Content search (grep-like)
lci grep "TODO: fix"

# Find definition
lci def handleRequest

# Find references
lci refs handleRequest

# Find files
lci list "*.config.ts"
```

---

## Workflows

### Find Where a Function is Defined

1. Search for the function name with type filter:
   - `search` with `pattern: "functionName"`, `symbol_types: "function"`
2. Results include file path, line number, and object ID
3. Use the object ID with `get_context` for full source code

### Find All Usages of a Symbol

1. Search for the symbol: `search` with `pattern: "SymbolName"`
2. Get context with references: `get_context` with `id: "<id>"`, `include_all_references: true`
3. Review callers and usage sites

### Find All Interfaces in a Package

1. Search with type filter and directory:
   - `search` with `pattern: ""`, `symbol_types: "interface"`, `filter: "src/domain/**"`
2. Get overview of each interface as needed

### Search Multiple Patterns

Use the `patterns` parameter to search for multiple terms:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "search",
  "parameters": {
    "patterns": "handleRequest,processRequest,executeRequest"
  }
}
```

---

## Quick Reference

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `pattern` | Search term | `"handleRequest"` |
| `symbol_types` | Filter by type | `"function"`, `"class,interface"` |
| `languages` | Filter by language | `["go", "typescript"]` |
| `filter` | File/dir glob | `"src/**/*.ts"` |
| `flags` | Search mode | `"content"`, `"regex"`, `"ci"` |
| `max` | Result limit | `20` |
| `max_per_file` | Per-file limit | `3` |
| `include` | Extra data | `"source"`, `"docs"` |
