---
name: record-session
description: Record MCP JSON-RPC traffic for debugging and replay
argument-hint: "<output-file> [server-config]"
---

# Record MCP Session

Capture all JSON-RPC interactions between client and server for debugging, documentation, or replay testing.

## Process

### 1. Setup Recording

Configure mcp-debug proxy with recording enabled:

```bash
# Record to a JSONL file
mcp-debug --proxy --config config.yaml --record session.jsonl

# With logging for additional context
mcp-debug --proxy --config config.yaml --record session.jsonl --log debug.log
```

### 2. Create Config File (if needed)

Generate a minimal config for the target server:

```yaml
# mcp-debug-config.yaml
servers:
  target:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-everything", "stdio"]
```

### 3. Connect and Interact

The proxy runs as an MCP server itself. Connect your client to the proxy:
- All tool calls are forwarded to the target server
- All requests and responses are recorded to the session file

### 4. Analyze Recording

Session file contains JSONL with:
- Timestamps for each message
- Direction (client→server or server→client)
- Full JSON-RPC payloads
- Tool call parameters and results

## Usage

```
/mcp-tester:record-session debug-session.jsonl
/mcp-tester:record-session my-test.jsonl --config ./servers.yaml
```

## Output Format

```jsonl
{"timestamp":"2024-01-15T10:30:00Z","direction":"request","method":"tools/list","id":1}
{"timestamp":"2024-01-15T10:30:01Z","direction":"response","id":1,"result":{"tools":[...]}}
{"timestamp":"2024-01-15T10:30:05Z","direction":"request","method":"tools/call","id":2,"params":{"name":"echo","arguments":{"message":"test"}}}
{"timestamp":"2024-01-15T10:30:05Z","direction":"response","id":2,"result":{"content":[{"type":"text","text":"test"}]}}
```

## Tips

- Use recordings to create regression tests
- Share recordings for bug reports
- Analyze timing for performance debugging
- Recordings can be replayed with `/mcp-tester:replay-session`
