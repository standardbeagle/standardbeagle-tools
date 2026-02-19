---
name: slop-config
description: slop-mcp configuration reference using KDL format
---

# slop-mcp Configuration Reference

slop-mcp stores persistent configuration in KDL format at two scopes.

## Config File Locations

| Scope | File | Purpose |
|-------|------|---------|
| User | `~/.config/slop-mcp/config.kdl` | Applies to all projects |
| Project | `.slop-mcp.kdl` (project root) | Applies to this project only |

Project-scope configs are loaded in addition to user-scope. If the same MCP name appears in both, project scope takes precedence.

## KDL Config Format

### Command-based MCP Server

```kdl
mcp "server-name" {
  command "npx"
  args "-y" "@namespace/package@latest" "mcp"
}
```

### Command with Environment Variables

```kdl
mcp "github" {
  command "npx"
  args "-y" "@modelcontextprotocol/server-github"
  env {
    GITHUB_TOKEN "${GITHUB_TOKEN}"
  }
}
```

### Local Binary

```kdl
mcp "my-server" {
  command "/usr/local/bin/my-mcp-server"
  args "--port" "3000"
}
```

### SSE or Streamable HTTP

```kdl
mcp "remote" type="sse" {
  url "https://mcp.example.com/sse"
}

mcp "streamable" type="streamable" {
  url "https://mcp.example.com/mcp"
}
```

### Dynamic Server (always re-fetch tools)

```kdl
mcp "evolving-server" dynamic=true {
  command "npx"
  args "-y" "@namespace/package@latest" "mcp"
}
```

## manage_mcps Parameters

The `manage_mcps` tool is the programmatic interface for managing servers.

### Register

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "register"
  name: "server-name"        # required, unique identifier
  type: "command"             # "command" (default), "sse", "streamable"
  command: "npx"              # executable (for command type)
  args: ["-y", "pkg", "mcp"] # command arguments
  url: "https://..."          # server URL (for sse/streamable)
  env: { "KEY": "val" }       # environment variables
  headers: { "K": "V" }      # HTTP headers (for sse/streamable)
  scope: "user"               # "memory" (default), "user", "project"
  dynamic: false              # true to always re-fetch tool list
```

### Unregister

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "unregister"
  name: "server-name"
```

### Reconnect

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "reconnect"
  name: "server-name"
```

### List All

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

### Status of One

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "status"
  name: "server-name"
```

## Authentication

For MCP servers that require OAuth:

```
mcp__plugin_slop-mcp_slop-mcp__auth_mcp
  action: "login"
  name: "server-name"
```

Check auth status:

```
mcp__plugin_slop-mcp_slop-mcp__auth_mcp
  action: "status"
  name: "server-name"
```

List all authenticated servers:

```
mcp__plugin_slop-mcp_slop-mcp__auth_mcp
  action: "list"
```

## Metadata Inspection

Get tool metadata for a server:

```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "server-name"          # optional: filter to one server
  tool_name: "tool-name"           # optional: filter to one tool
  verbose: true                    # include full input schemas
  file_path: "/tmp/metadata.json"  # optional: write to file
```

## Scope Behavior

- **memory**: Server exists only for the current slop-mcp session. Good for testing.
- **user**: Written to `~/.config/slop-mcp/config.kdl`. Survives restarts. Available in all projects.
- **project**: Written to `.slop-mcp.kdl` in the current working directory. Survives restarts. Available only in this project.

Servers from all scopes are merged at startup. Use `manage_mcps` with `action: "list"` to see the combined result.
