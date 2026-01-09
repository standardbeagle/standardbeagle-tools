---
name: hot-swap-development
description: Use this skill when developing MCP servers with hot-swap workflow for rapid iteration
---

# Hot-Swap MCP Development Workflow

You are guiding a developer through the hot-swap development workflow using mcp-debug.

## Overview

Hot-swap development enables replacing MCP server implementations without:
- Restarting Claude Code or other MCP clients
- Losing debug session history
- Changing tool names or prefixes

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

mcp-debug enables hot-swap:
1. Make code change
2. Rebuild server
3. Call `server_disconnect` then `server_reconnect`
4. Test change immediately

Client stays connected, state preserved.

## Workflow Steps

### 1. Initial Setup

Start by adding your development server:

```
Use server_add tool:
- name: "myserver"
- command: "go run ./cmd/server" (or your dev command)
```

### 2. Development Cycle

When you make code changes:

1. **Build new version**
   ```bash
   go build -o ./bin/server-v2 ./cmd/server
   # or: npm run build
   # or: cargo build --release
   ```

2. **Disconnect current server**
   ```
   Use server_disconnect tool:
   - name: "myserver"
   ```
   Tools remain registered but calls will queue.

3. **Reconnect with new binary**
   ```
   Use server_reconnect tool:
   - name: "myserver"
   - command: "./bin/server-v2"
   ```

4. **Verify tools work**
   ```
   Use server_list tool to confirm connection
   Test a tool to verify functionality
   ```

### 3. Debugging Changes

Use debug tools to verify behavior:

- `debug_logs` - View request/response traffic
- `debug_status` - Check connection health
- `schema_validate` - Verify schema changes

## Server Management Tools

### server_add

Add a new server dynamically:
```
server_add with:
- name: "myserver"
- command: "python server.py"
```

### server_disconnect

Temporarily disable server (tools remain registered):
```
server_disconnect with:
- name: "myserver"
```

### server_reconnect

Reconnect with new binary:
```
server_reconnect with:
- name: "myserver"
- command: "./new-binary"
```

### server_list

Show all servers and their status:
```
server_list
```

### server_remove

Completely remove a server:
```
server_remove with:
- name: "myserver"
```

## Workflow Patterns

### Pattern 1: Watch and Rebuild

```bash
# Terminal 1: Watch and rebuild
watchexec -e go -- go build -o bin/myserver ./cmd/server

# In Claude Code: After each rebuild
# Call server_disconnect then server_reconnect
```

### Pattern 2: A/B Testing

1. Test version A
2. Hot-swap to version B with server_reconnect
3. Test version B
4. Compare behavior using debug_logs

### Pattern 3: Debug Mode Toggle

```
# Normal mode
server_reconnect with command="./server"

# Debug mode with extra logging
server_reconnect with command="./server --debug --verbose"
```

## Best Practices

1. **Use versioned binaries** - Name binaries with version for rollback
2. **Check logs after swap** - Verify no errors in traffic
3. **Test critical tools first** - Confirm key functionality works
4. **Keep previous binary** - Enable quick rollback if issues

## Troubleshooting

**Server won't reconnect:**
- Check command path is correct
- Verify binary has execute permissions
- Check for port conflicts if using network

**Tools missing after swap:**
- Server may have changed tool definitions
- Use `server_list` to see current tools
- Check server logs for initialization errors

**Unexpected behavior:**
- Use `debug_logs` to compare before/after requests
- Validate schemas haven't changed incompatibly
