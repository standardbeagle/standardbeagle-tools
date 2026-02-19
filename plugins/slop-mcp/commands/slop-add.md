---
name: slop-add
description: Register an MCP server with slop-mcp
---

# Add MCP Server

Register a new MCP server with slop-mcp using `manage_mcps`.

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "register"
  name: "<server-name>"
  type: "command"           # or "sse" or "streamable"
  command: "<executable>"   # for command type
  args: ["<arg1>", ...]     # command arguments
  url: "<server-url>"       # for sse/streamable types
  env: { "KEY": "value" }   # environment variables
  headers: { "K": "V" }    # HTTP headers (for sse/streamable)
  scope: "user"             # "memory" | "user" | "project"
  dynamic: false            # true to always re-fetch tool list
```

## Scope Options

- **memory** (default) -- runtime only, lost on restart. Good for testing.
- **user** -- saved to `~/.config/slop-mcp/config.kdl`. Persists across projects.
- **project** -- saved to `.slop-mcp.kdl` in project root. Persists for this project.

## Examples

Ask the user for the server details, then register it. Common patterns:

**NPX package:**
```
name: "filesystem"
command: "npx"
args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user"]
scope: "user"
```

**Local binary:**
```
name: "my-server"
command: "/usr/local/bin/my-mcp-server"
args: ["mcp"]
scope: "project"
```

**SSE server:**
```
name: "remote-server"
type: "sse"
url: "https://mcp.example.com/sse"
headers: { "Authorization": "Bearer token" }
scope: "user"
```

**Python package:**
```
name: "my-python-mcp"
command: "uvx"
args: ["my-mcp-package"]
scope: "user"
```

## After Adding

- Use `/slop-list` to verify the server is registered
- Use `/slop-search` to find its tools
- Use `/slop-exec` to run a tool
