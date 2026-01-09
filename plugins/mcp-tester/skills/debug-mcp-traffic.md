---
name: debug-mcp-traffic
description: Use this skill when analyzing MCP protocol traffic to debug issues
---

# Debugging MCP Protocol Traffic

You are helping a developer analyze and debug MCP protocol traffic using mcp-debug.

## Understanding the Debug Buffer

mcp-debug maintains a circular buffer of the last 500 JSON-RPC messages. Each message includes:
- Timestamp
- Direction (request/response)
- Server name
- Message type
- Full JSON-RPC content

## Debugging Techniques

### 1. View Recent Traffic

```
Use debug_logs tool:
- limit: 20 (default)
- server: (optional - filter to specific server)
- direction: (optional - "request" or "response")
```

### 2. Diagnose Tool Call Failures

When a tool call fails:

1. **Get recent logs**
   ```
   debug_logs with limit: 10
   ```

2. **Look for:**
   - Request with the failing tool call
   - Response with error details
   - Missing responses (timeout issues)
   - Malformed requests

3. **Check request structure:**
   - Correct method name
   - Valid JSON-RPC format
   - Required parameters present

### 3. Debug Connection Issues

```
Use debug_status tool to see:
- Buffer usage (indicates activity level)
- Request/response counts (mismatches indicate lost messages)
- Server connection states
```

### 4. Analyze Specific Server

```
debug_logs with:
- server: "myserver"
- limit: 50
```

Look for patterns:
- Slow responses (check timestamps)
- Error patterns
- Unusual message sequences

## Common Issues and Solutions

### No Response to Tool Calls
- Check server is connected: `server_list`
- Look for server errors in logs
- Verify server isn't blocking/deadlocked

### Invalid JSON-RPC Errors
- Use `schema_validate` to check tool schemas
- Review request format in debug_logs
- Check parameter types match schema

### Timeout Issues
- Look at timestamp gaps in logs
- Check server isn't doing long operations
- Consider increasing timeout in config

### Unexpected Tool Behavior
- Compare request parameters in logs to expected
- Check if tool schema changed
- Verify correct tool prefix is being used

## Advanced: Raw Message Testing

For edge cases, use `debug_send` to send raw JSON-RPC:

```
debug_send with:
- server: "myserver"
- message: '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
```

Then check `debug_logs` for the response.

## Session Statistics

`debug_status` provides:
- Buffer capacity usage
- Total message counts
- Can detect message imbalance (lost messages)
