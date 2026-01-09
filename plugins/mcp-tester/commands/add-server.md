---
name: add-server
description: Dynamically add an MCP server to the debug proxy for testing
arguments:
  - name: server-name
    description: Name to identify this server (used as tool prefix)
    required: true
  - name: command
    description: Command to launch the MCP server
    required: true
---

# Add MCP Server to Debug Proxy

You are adding a new MCP server to the mcp-debug proxy for testing and development.

## Instructions

1. Use the `mcp-debug` MCP server's `server_add` tool with:
   - `name`: The server name provided by the user ({{server-name}})
   - `command`: The command to launch the server ({{command}})

2. After adding the server, use `server_list` to confirm it was added successfully and show available tools.

3. Report to the user:
   - The server name and prefix that will be used for its tools
   - All tools now available from the server (they will be prefixed with the server name)
   - Any connection errors or issues

## Example Usage

```
/add-server myserver "npx @modelcontextprotocol/filesystem /home/user"
```

This will add the filesystem MCP server with tools prefixed as `myserver_read_file`, `myserver_write_file`, etc.
