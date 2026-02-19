---
name: slop-exec
description: Execute a tool on a slop-mcp managed MCP server
---

# Execute MCP Tool

Execute a tool on a specific MCP server using `execute_tool`.

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "<server-name>"
  tool_name: "<tool-name>"
  parameters: { "param1": "value1", "param2": "value2" }
```

## Steps

1. If the user specifies `server.tool` format, split into mcp_name and tool_name.
2. If only a tool name is given, use `search_tools` to find which server provides it:
   ```
   mcp__plugin_slop-mcp_slop-mcp__search_tools
     query: "<tool-name>"
   ```
3. If the tool's parameters are not clear, get the schema first:
   ```
   mcp__plugin_slop-mcp_slop-mcp__get_metadata
     mcp_name: "<server-name>"
     tool_name: "<tool-name>"
     verbose: true
   ```
4. Call `execute_tool` with the resolved server, tool, and parameters.
5. Present the result to the user.

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
