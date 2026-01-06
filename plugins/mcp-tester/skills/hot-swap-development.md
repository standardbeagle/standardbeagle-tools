---
name: hot-swap-development
description: Hot-swap MCP server development workflow
---

# Hot-Swap Development

Develop MCP servers rapidly using hot-swap capabilities without disconnecting clients.

## The Problem

Traditional MCP development workflow:
1. Make code change
2. Rebuild server
3. Restart server
4. Reconnect client
5. Restore state
6. Test change
7. Repeat...

Each iteration wastes time on reconnection and state restoration.

## The Solution

mcp-debug proxy enables hot-swap:
1. Make code change
2. Rebuild server
3. Call `server_reconnect`
4. Test change immediately

Client stays connected, state preserved.

## Setup

### 1. Create Proxy Config

```yaml
# dev-proxy.yaml
servers:
  myserver:
    command: ./bin/myserver
    args: ["--dev-mode"]
```

### 2. Start Proxy

```bash
mcp-debug --proxy --config dev-proxy.yaml --log dev.log
```

### 3. Connect Client

Point Claude Desktop or your client to the proxy.

### 4. Development Loop

```bash
# Terminal 1: Watch and rebuild
watchexec -e go -- go build -o bin/myserver ./cmd/server

# Terminal 2: Monitor proxy
tail -f dev.log

# In client: After each rebuild
# Call the server_reconnect tool
```

## Proxy Management Tools

### server_reconnect

Restart server with updated binary, preserving client connection:

```json
{
  "name": "server_reconnect",
  "arguments": {
    "server": "myserver",
    "command": "./bin/myserver",  // optional: new path
    "args": ["--new-flag"]        // optional: new args
  }
}
```

### server_disconnect

Temporarily disable server (tools return errors):

```json
{
  "name": "server_disconnect",
  "arguments": {
    "server": "myserver"
  }
}
```

Useful for testing error handling in clients.

### server_list

Show all servers and their status:

```json
{
  "name": "server_list"
}
```

Returns:
```json
{
  "servers": [
    {
      "name": "myserver",
      "status": "connected",
      "tools": 5,
      "uptime": "2h30m"
    }
  ]
}
```

### server_add

Add a new server dynamically:

```json
{
  "name": "server_add",
  "arguments": {
    "name": "newserver",
    "command": "python",
    "args": ["server.py"]
  }
}
```

### server_remove

Completely remove a server:

```json
{
  "name": "server_remove",
  "arguments": {
    "server": "newserver"
  }
}
```

## Workflow Patterns

### Pattern 1: Single Server Development

```bash
# Start proxy
mcp-debug --proxy --config single.yaml

# Development loop
while true; do
    # Wait for code change
    inotifywait -e modify src/

    # Rebuild
    go build -o bin/server ./cmd/server

    # Hot-swap (via client or curl)
    echo "Rebuilt - use server_reconnect in client"
done
```

### Pattern 2: Multi-Server Development

```yaml
# multi.yaml
servers:
  auth:
    command: ./auth-server
  data:
    command: ./data-server
  search:
    command: ./search-server
```

Develop each server independently, hot-swap as needed.

### Pattern 3: A/B Testing

```bash
# Start with version A
mcp-debug --proxy --config config.yaml

# Test version A
# ...

# Hot-swap to version B
# Use server_reconnect with new binary path

# Test version B
# Compare behavior
```

### Pattern 4: Debug Mode Toggle

```bash
# Normal mode
server_reconnect myserver command="./server"

# Debug mode with extra logging
server_reconnect myserver command="./server" args='["--debug", "--verbose"]'
```

## Best Practices

### 1. Fast Rebuilds

Use incremental compilation:
```bash
# Go
go build -o bin/server ./cmd/server

# Rust (debug builds)
cargo build

# TypeScript
tsc --incremental
```

### 2. State Management

Design servers to handle reconnection:
- Stateless tools when possible
- Persistent state in external stores
- Graceful shutdown handling

### 3. Logging

Enable proxy logging for debugging:
```bash
mcp-debug --proxy --config config.yaml --log /tmp/proxy.log
tail -f /tmp/proxy.log
```

### 4. Error Recovery

If hot-swap fails:
1. Check server logs
2. Verify binary exists and is executable
3. Test server standalone first
4. Use `server_remove` and `server_add` to reset

## Troubleshooting

### Server Won't Reconnect

```bash
# Check if binary exists
ls -la ./bin/server

# Test server standalone
./bin/server --help

# Check proxy logs
grep "reconnect" dev.log
```

### Tools Missing After Reconnect

- Server may have changed tool definitions
- Client may need to re-fetch tool list
- Check for initialization errors in logs

### State Lost

- Design for statelessness
- Use external state stores
- Implement state persistence if needed
