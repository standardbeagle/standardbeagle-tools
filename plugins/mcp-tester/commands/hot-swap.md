---
name: hot-swap
description: Hot-swap an MCP server binary without disconnecting clients
arguments:
  - name: server-name
    description: Name of the server to hot-swap
    required: true
  - name: new-command
    description: New command to launch the updated server
    required: true
---

# Hot-Swap MCP Server

You are performing a hot-swap of an MCP server, replacing its implementation without disrupting clients.

## Instructions

1. First, check current server status using `server_list` to confirm the server exists.

2. Use `server_disconnect` with:
   - `name`: {{server-name}}

   This gracefully disconnects the server while keeping tool registrations intact.

3. Use `server_reconnect` with:
   - `name`: {{server-name}}
   - `command`: {{new-command}}

   This connects to the new server implementation.

4. Verify the swap succeeded using `server_list` and report:
   - Whether tools are still available
   - Any changes in available tools
   - Connection status

## Hot-Swap Workflow

This enables rapid development without restarting the debug session:

```
1. Make code changes to your MCP server
2. Build new binary: go build -o server-v2 ./cmd/server
3. /hot-swap myserver "./server-v2"
4. Continue testing - tool names remain the same!
```

## Why Hot-Swap?

- No need to restart your MCP client (Claude Code, etc.)
- Tool names and prefixes stay consistent
- Faster development iteration cycles
- Test changes immediately without reconnection delays
