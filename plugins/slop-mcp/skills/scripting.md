---
name: scripting
description: SLOP scripting language for automating multi-MCP tool workflows via run_slop. SLOP 腳本語言指南，自動化跨 MCP 服務器工作流。 Use when: writing inline scripts, running .slop files, chaining MCP tool calls, exploring built-in functions.
---

# SLOP Scripting Guide

SLOP 語言令多工具工作流跨所有已注冊 MCP 服務器自動化。腳本經 `run_slop` 工具運行，可訪問每個已注冊 MCP。

## Running Scripts

### Inline Script

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
  script: "tools.list()"
```

### Script File

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
  file_path: "/path/to/script.slop"
```

## SLOP Language Basics

SLOP 為腳本語言，內置數據操作、字串處理及 MCP 工具執行函數。

### Exploring Built-in Functions

列函數類別：

```
mcp__plugin_slop-mcp_slop-mcp__slop_reference
  list_categories: true
```

Categories: math, string, list, map, random, type, json, regex, time, encoding, functional, crypto, slop.

搜索函數：

```
mcp__plugin_slop-mcp_slop-mcp__slop_reference
  query: "split"
  verbose: true
```

取單個函數詳情：

```
mcp__plugin_slop-mcp_slop-mcp__slop_help
  name: "map"
```

### Calling MCP Tools from SLOP

SLOP 腳本可調用任何已注冊 MCP 服務器上的任何工具。確切語法取決於 SLOP 運行時中工具的暴露方式。用 `slop_reference` 加 `category: "slop"` 查 MCP 集成函數：

```
mcp__plugin_slop-mcp_slop-mcp__slop_reference
  category: "slop"
  verbose: true
```

### Example: Sequential Workflow

```slop
// Read a file, process it, write the result
content = tools.call("filesystem", "read_file", { "path": "input.txt" })
lines = split(content, "\n")
filtered = filter(lines, fn(line) { contains(line, "TODO") })
result = join(filtered, "\n")
tools.call("filesystem", "write_file", { "path": "todos.txt", "content": result })
```

### Example: Search and Aggregate

```slop
// Search across multiple servers
results = tools.call("lci", "search", { "query": "error handling" })
count = len(results)
print("Found " + str(count) + " matches")
```

### Example: Data Processing Pipeline

```slop
// Use built-in functions for data transformation
data = json_parse(tools.call("filesystem", "read_file", { "path": "data.json" }))
names = map(data, fn(item) { item.name })
sorted = sort(names)
json_stringify(sorted)
```

## Built-in Function Reference

以下工具探索完整標準庫：

| Tool | Purpose |
|------|---------|
| `slop_reference` with `list_categories: true` | 查所有函數類別 |
| `slop_reference` with `query: "..."` | 按名稱/描述搜索函數 |
| `slop_reference` with `category: "string"` | 列某類別函數 |
| `slop_help` with `name: "fn_name"` | 單個函數完整文檔 |

### Common Categories

- **string**: split, join, trim, replace, contains, starts_with, ends_with, upper, lower
- **list**: map, filter, reduce, sort, reverse, flatten, unique, zip
- **map**: keys, values, entries, merge, get, set
- **json**: json_parse, json_stringify
- **regex**: regex_match, regex_replace, regex_find
- **time**: now, format_time, parse_time
- **type**: type_of, to_string, to_number, to_bool
- **functional**: map, filter, reduce, compose, pipe

## Script Files

存腳本為 `.slop` 文件，以 `run_slop` 運行：

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
  file_path: "./scripts/my-workflow.slop"
```

腳本最終表達式值作為結果返回。

## Practical Patterns

### Tool Discovery Script

```slop
// Find all file-related tools
tools.search("file")
```

### Multi-Server Coordination

```slop
// Get data from one server, process with another
raw = tools.call("api-server", "fetch_data", { "endpoint": "/users" })
parsed = json_parse(raw)
tools.call("filesystem", "write_file", {
  "path": "users.json",
  "content": json_stringify(parsed, 2)
})
```

### Error Handling

SLOP 腳本應處理 MCP 工具調用錯誤。查 SLOP 參考中錯誤處理構造：

```
mcp__plugin_slop-mcp_slop-mcp__slop_reference
  query: "error"
  verbose: true
```
