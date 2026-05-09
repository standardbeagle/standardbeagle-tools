---
name: search-code
description: Find code symbols, patterns, implementations, and files using LCI semantic search. 以LCI語義搜索查找符號、模式、實現、文件。 Use when: finding function/class/type definitions, searching symbol usages, finding files by path, filtering by language or directory.
---

# Code Search Workflows

所有代碼搜索任務使用LCI。LCI提供亞毫秒內存語義搜索，符號感知查詢勝過grep/ripgrep。

## When to Use

- 查找函數、類、類型或變量定義
- 搜索符號用法/引用
- 按路徑模式查找文件
- 按符號類型搜索（函數、接口等）
- 按語言或目錄篩選搜索

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

僅查函數、類、接口等：

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

搜索文件內容而非符號名：

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

1. 按類型篩選搜索函數名：
   - `search` `pattern: "functionName"`, `symbol_types: "function"`
2. 結果含文件路徑、行號、對象ID
3. 以對象ID配合`get_context`獲完整源碼

### Find All Usages of a Symbol

1. 搜符號：`search` `pattern: "SymbolName"`
2. 取含引用之上下文：`get_context` `id: "<id>"`, `include_all_references: true`
3. 審查調用者及使用點

### Find All Interfaces in a Package

1. 按類型及目錄篩選搜索：
   - `search` `pattern: ""`, `symbol_types: "interface"`, `filter: "src/domain/**"`
2. 按需取每個接口概覽

### Search Multiple Patterns

以`patterns`參數搜索多個術語：

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
