---
name: slop-list
description: List all MCP servers managed by slop-mcp
---

# List slop-mcp Servers

Display all registered MCP servers and their status.

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

For detailed info about a specific server:

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "status"
  name: "<server-name>"
```

## Displaying Results

Present the server list in a clear format showing:
- Server name
- Connection status
- Transport type (command/sse/streamable)
- Command or URL

For each connected server, optionally call `get_metadata` to show available tools:

```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "<server-name>"
```

## Related Commands

- `/slop-add` -- register a new server
- `/slop-search` -- search tools across all servers
- `/slop-exec` -- execute a tool on a server
