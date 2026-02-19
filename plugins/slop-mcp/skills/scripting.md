---
name: scripting
description: SLOP scripting language guide for automating MCP tool workflows
---

# SLOP Scripting Guide

The SLOP language lets you automate multi-tool workflows across all registered MCP servers. Scripts run via the `run_slop` tool and have access to every registered MCP.

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

SLOP is a scripting language with built-in functions for data manipulation, string processing, and MCP tool execution.

### Exploring Built-in Functions

List function categories:

```
mcp__plugin_slop-mcp_slop-mcp__slop_reference
  list_categories: true
```

Categories: math, string, list, map, random, type, json, regex, time, encoding, functional, crypto, slop.

Search for functions:

```
mcp__plugin_slop-mcp_slop-mcp__slop_reference
  query: "split"
  verbose: true
```

Get details for a specific function:

```
mcp__plugin_slop-mcp_slop-mcp__slop_help
  name: "map"
```

### Calling MCP Tools from SLOP

SLOP scripts can call any tool on any registered MCP server. The exact syntax depends on how tools are exposed in the SLOP runtime. Use `slop_reference` with `category: "slop"` to find the MCP integration functions:

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

Use these tools to explore the full standard library:

| Tool | Purpose |
|------|---------|
| `slop_reference` with `list_categories: true` | See all function categories |
| `slop_reference` with `query: "..."` | Search functions by name/description |
| `slop_reference` with `category: "string"` | List functions in a category |
| `slop_help` with `name: "fn_name"` | Full docs for one function |

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

Save scripts as `.slop` files and run them with `run_slop`:

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
  file_path: "./scripts/my-workflow.slop"
```

The script's final expression value is returned as the result.

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

SLOP scripts should handle errors from MCP tool calls. Check the SLOP reference for error handling constructs:

```
mcp__plugin_slop-mcp_slop-mcp__slop_reference
  query: "error"
  verbose: true
```
