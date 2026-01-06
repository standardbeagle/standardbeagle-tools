---
name: proxy-start
description: Start mcp-debug development proxy for hot-swap and monitoring
argument-hint: "[config-file]"
---

# Start Development Proxy

Launch the mcp-debug development proxy for hot-swap development, server aggregation, and real-time monitoring.

## Process

### 1. Create Proxy Configuration

```yaml
# mcp-proxy-config.yaml
servers:
  # Your primary server under development
  my-server:
    command: go
    args: ["run", "./cmd/server"]

  # Additional servers to aggregate
  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "stdio", "/tmp"]

  # Remote server via SSE
  remote:
    url: http://localhost:8000/sse
```

### 2. Start Proxy

```bash
# Basic proxy
mcp-debug --proxy --config mcp-proxy-config.yaml

# With recording
mcp-debug --proxy --config mcp-proxy-config.yaml --record dev-session.jsonl

# With verbose logging
mcp-debug --proxy --config mcp-proxy-config.yaml --log debug.log
```

### 3. Connect Client

Point your MCP client (Claude Desktop, etc.) to the proxy instead of individual servers.

### 4. Hot-Swap During Development

Use proxy tools to manage servers without disconnecting:

```
# Reconnect with updated binary
server_reconnect my-server

# Temporarily disable a server
server_disconnect filesystem

# Add a new server dynamically
server_add new-server command="python server.py"

# List all servers and status
server_list
```

## Usage

```
/mcp-tester:proxy-start
/mcp-tester:proxy-start ./my-config.yaml
```

## Proxy Management Tools

Once running, the proxy exposes these MCP tools:

| Tool | Description |
|------|-------------|
| `server_list` | Show all servers and connection status |
| `server_add` | Register a new server dynamically |
| `server_remove` | Completely remove a server |
| `server_disconnect` | Temporarily disable (tools return errors) |
| `server_reconnect` | Restart with updated binary path |

## Benefits

- **No reconnection**: Hot-swap server code without client reconnection
- **Aggregation**: Combine multiple servers with tool name prefixing
- **Monitoring**: See all traffic in real-time
- **Recording**: Capture sessions for debugging
- **Isolation**: Test servers in controlled environment
