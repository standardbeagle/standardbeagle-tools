---
name: send-raw
description: Send raw JSON-RPC message to an MCP server for low-level debugging
arguments:
  - name: server
    description: Server name to send the message to
    required: true
  - name: message
    description: Raw JSON-RPC message to send
    required: true
---

# Send Raw JSON-RPC Message

You are sending a raw JSON-RPC message directly to an MCP server for low-level debugging.

## Instructions

1. Use the `mcp-debug` MCP server's `debug_send` tool with:
   - `server`: {{server}}
   - `message`: {{message}}

2. This sends the message without validation - use carefully!

3. After sending, use `debug_logs` with `limit: 5` to see the request and any response.

4. Report the results including:
   - Whether the message was sent successfully
   - Any response received
   - Any errors or issues

## Example Usage

```
/send-raw myserver '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
```

## Warning

This bypasses normal validation. Use for:
- Testing edge cases and error handling
- Debugging protocol issues
- Exploring non-standard MCP extensions

Do NOT use for normal tool calls - use the regular prefixed tools instead.
