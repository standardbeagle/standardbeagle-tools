---
name: debug-logs
description: View recent MCP protocol JSON-RPC messages for debugging
arguments:
  - name: server
    description: Filter logs to specific server (optional)
    required: false
  - name: direction
    description: Filter by direction - "request" or "response" (optional)
    required: false
  - name: limit
    description: Number of messages to show (default 20, max 500)
    required: false
---

# View MCP Debug Logs

You are viewing recent MCP protocol traffic captured by mcp-debug.

## Instructions

1. Use the `mcp-debug` MCP server's `debug_logs` tool with:
   - `server`: {{server}} (if provided)
   - `direction`: {{direction}} (if provided - "request" or "response")
   - `limit`: {{limit}} (if provided, otherwise default 20)

2. Present the logs in a clear format showing:
   - Timestamp
   - Direction (request/response)
   - Server name
   - Message type (tool_call, initialize, etc.)
   - Tool name (if applicable)
   - Relevant message content

3. If there are errors or interesting patterns, highlight them.

## Usage Examples

```
/debug-logs                        # Show last 20 messages from all servers
/debug-logs myserver               # Show messages for specific server
/debug-logs --direction request    # Show only requests
/debug-logs --limit 50             # Show more messages
```

## Tips

- Use this to debug tool call failures and understand request/response flow
- The debug buffer holds up to 500 messages in a circular buffer
- Combine with `debug_status` to see buffer usage statistics
