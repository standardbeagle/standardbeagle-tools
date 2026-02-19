---
name: slop-init
description: Check slop-mcp status and display configuration overview
---

# Initialize slop-mcp

Check the current state of slop-mcp and display registered MCP servers.

## Steps

1. Call `manage_mcps` with `action: "list"` to get all registered MCP servers.
2. Report the results: how many servers are registered, their names, and connection status.
3. If no servers are registered, explain how to add them.

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

## Configuration

slop-mcp uses KDL format for persistent configuration at two scopes:

- **User scope**: `~/.config/slop-mcp/config.kdl` -- applies to all projects
- **Project scope**: `.slop-mcp.kdl` in the project root -- applies to this project only
- **Memory scope**: runtime only, lost when slop-mcp restarts

Example KDL config:

```kdl
mcp "filesystem" {
  command "npx"
  args "-y" "@modelcontextprotocol/server-filesystem" "/home/user"
}

mcp "lci" {
  command "npx"
  args "-y" "@standardbeagle/lci@latest" "mcp"
}
```

## After Init

- Use `/slop-add` to register new MCP servers
- Use `/slop-migrate` to import existing Claude Code MCP configs
- Use `/slop-list` to see detailed server info
- Use `/slop-search` to find tools across all servers
