---
name: server-status
description: Show status of connected MCP servers and debug session statistics
---

# MCP Server Status

You are checking the status of all connected MCP servers and the debug session.

## Instructions

1. First, use the `mcp-debug` MCP server's `debug_status` tool to get:
   - Debug buffer usage (messages stored / capacity)
   - Total request and response counts
   - Session uptime and statistics

2. Then, use `server_list` to get:
   - All connected servers
   - Connection status for each server
   - Available tools from each server

3. Present a clear status report showing:
   - Overall debug session health
   - Each connected server with:
     - Name and prefix
     - Connection status (connected/disconnected/error)
     - Number of tools available
     - Any error messages

4. If there are issues with any servers, suggest troubleshooting steps.

## Example Output Format

```
Debug Session Status
====================
Buffer: 45/500 messages (9% used)
Requests: 123 | Responses: 120
Session uptime: 15m 32s

Connected Servers
=================
filesystem (fs_*)     : connected, 5 tools
myserver (myserver_*) : connected, 12 tools
broken-server         : error - "connection refused"
```
