---
name: slop-exec
description: Execute a tool on a specific slop-mcp managed MCP server, with auto-discovery if server is unknown. 在 slop-mcp 管理之 MCP 服務器執行工具，可自動發現服務器。 Use when: running a known tool, testing a tool's output, executing server.tool format calls.
---

# Execute MCP Tool

以 `execute_tool` 在特定 MCP 服務器執行工具。

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "<server-name>"
  tool_name: "<tool-name>"
  parameters: { "param1": "value1", "param2": "value2" }
```

## Steps

1. 若用戶指定 `server.tool` 格式，分割為 mcp_name 和 tool_name。
2. 若僅給工具名，以 `search_tools` 查所在服務器：
   ```
   mcp__plugin_slop-mcp_slop-mcp__search_tools
     query: "<tool-name>"
   ```
3. 若工具參數不明，先取 schema：
   ```
   mcp__plugin_slop-mcp_slop-mcp__get_metadata
     mcp_name: "<server-name>"
     tool_name: "<tool-name>"
     verbose: true
   ```
4. 以已解析之服務器、工具及參數調用 `execute_tool`。
5. 向用戶呈現結果。

## Examples

```
# Read a file via filesystem server
mcp_name: "filesystem"
tool_name: "read_file"
parameters: { "path": "/home/user/README.md" }

# Search code via lci server
mcp_name: "lci"
tool_name: "search"
parameters: { "query": "function", "limit": 10 }
```
