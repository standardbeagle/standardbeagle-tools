---
name: mcp-tools
description: Complete reference for all agnt MCP tools with exact parameter schemas and copy-paste examples
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Agnt MCP Tools Reference

This skill provides exact parameter schemas and ready-to-use examples for all agnt MCP tools. Use `mcp__plugin_slop-mcp_slop-mcp__execute_tool` with `mcp_name: "agnt"` to call these tools.

## Tool Invocation Format

All tools are called using the slop-mcp execute_tool format:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "<tool_name>",
  "parameters": { <tool_parameters> }
}
```

---

## 1. detect

Detect project type and available scripts.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | No | Directory path (defaults to current dir) |

### Output Schema

```json
{
  "type": "string",           // go, node, python, unknown
  "name": "string",           // Project name
  "scripts": ["string"],      // Available script names
  "package_manager": "string", // npm, yarn, pnpm, etc.
  "metadata": {}              // Additional project metadata
}
```

### Examples

**Detect current project:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "detect",
  "parameters": {}
}
```

**Detect specific directory:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "detect",
  "parameters": {
    "path": "/home/user/projects/my-app"
  }
}
```

---

## 2. run

Run a project script or raw command.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | No | Project directory (defaults to current dir) |
| `script_name` | string | No* | Script name from detect (e.g., test, lint, build) |
| `raw` | boolean | No | Raw mode: use command and args directly |
| `command` | string | No* | Raw mode: executable to run |
| `args` | string[] | No | Extra args (appended in script mode, used directly in raw mode) |
| `id` | string | No | Process ID (auto-generated if empty) |
| `mode` | string | No | Execution mode: `background` (default), `foreground`, `foreground-raw` |

*Either `script_name` OR (`raw: true` + `command`) is required.

### Execution Modes

| Mode | Behavior |
|------|----------|
| `background` | Returns process_id immediately for tracking via proc tool (default) |
| `foreground` | Waits for completion, returns exit_code/state/runtime (output via proc) |
| `foreground-raw` | Waits for completion, returns exit_code/state/runtime + stdout/stderr |

### Output Schema

```json
{
  "process_id": "string",
  "pid": 12345,
  "command": "string",
  "exit_code": 0,           // foreground modes only
  "state": "string",        // foreground modes only
  "runtime": "string",      // foreground modes only
  "stdout": "string",       // foreground-raw mode only
  "stderr": "string"        // foreground-raw mode only
}
```

### Examples

**Run a project script (background):**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "run",
  "parameters": {
    "script_name": "dev"
  }
}
```

**Run tests and wait for result:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "run",
  "parameters": {
    "script_name": "test",
    "mode": "foreground"
  }
}
```

**Run tests with full output:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "run",
  "parameters": {
    "script_name": "test",
    "mode": "foreground-raw"
  }
}
```

**Run raw command:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "run",
  "parameters": {
    "raw": true,
    "command": "go",
    "args": ["mod", "tidy"],
    "mode": "foreground-raw"
  }
}
```

**Run with custom process ID:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "run",
  "parameters": {
    "script_name": "dev",
    "id": "dev-server"
  }
}
```

---

## 3. proc

Manage running processes.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Action: `status`, `output`, `stop`, `list`, `cleanup_port` |
| `process_id` | string | No* | Process ID (required for status/output/stop) |
| `stream` | string | No | For output: `stdout`, `stderr`, or `combined` (default) |
| `tail` | int | No | For output: last N lines only |
| `head` | int | No | For output: first N lines only |
| `grep` | string | No | For output: filter lines matching regex pattern |
| `grep_v` | boolean | No | For output: invert grep (exclude matching lines) |
| `force` | boolean | No | For stop: force kill immediately |
| `port` | int | No* | Port number (required for cleanup_port) |
| `global` | boolean | No | For list: include processes from all directories (default: false) |

### Actions

| Action | Description | Required Parameters |
|--------|-------------|---------------------|
| `list` | List all running processes | - |
| `status` | Get process status and info | `process_id` |
| `output` | Get process output with optional filters | `process_id` |
| `stop` | Gracefully stop a process | `process_id` |
| `cleanup_port` | Kill any process using a specific port | `port` |

### Output Schema

```json
{
  // For status
  "process_id": "string",
  "state": "string",
  "summary": "string",
  "exit_code": 0,
  "runtime": "string",

  // For output
  "output": "string",
  "lines": 100,
  "truncated": false,

  // For list
  "count": 3,
  "processes": [
    {
      "id": "string",
      "command": "string",
      "state": "string",
      "summary": "string",
      "runtime": "string",
      "project_path": "string"
    }
  ],
  "project_path": "string",
  "session_code": "string",
  "global": false,

  // For stop
  "success": true,

  // For cleanup_port
  "killed_pids": [1234, 5678],
  "message": "string"
}
```

### Examples

**List all processes:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "list"
  }
}
```

**List processes globally:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "list",
    "global": true
  }
}
```

**Get process status:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "status",
    "process_id": "dev"
  }
}
```

**Get last 20 lines of output:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "dev",
    "tail": 20
  }
}
```

**Get output filtered by regex:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "test",
    "grep": "FAIL|ERROR"
  }
}
```

**Get stderr only:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "dev",
    "stream": "stderr",
    "tail": 50
  }
}
```

**Stop a process gracefully:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "stop",
    "process_id": "dev"
  }
}
```

**Force kill a process:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "stop",
    "process_id": "dev",
    "force": true
  }
}
```

**Cleanup port 3000:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "cleanup_port",
    "port": 3000
  }
}
```

---

## 4. proxy

Manage reverse proxy servers with traffic logging and frontend instrumentation.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Action: `start`, `stop`, `status`, `list`, `exec`, `toast`, `chaos` |
| `id` | string | No* | Proxy ID (required for start/stop/status/exec/toast/chaos) |
| `target_url` | string | No* | Target URL to proxy (required for start) |
| `port` | int | No | Listen port (default: stable hash of target URL) |
| `max_log_size` | int | No | Maximum log entries (default: 1000) |
| `bind_address` | string | No | Bind address: `127.0.0.1` (default) or `0.0.0.0` (all interfaces) |
| `public_url` | string | No | Public URL for tunnel services |
| `verify_tls` | boolean | No | Verify TLS certificates (default: false) |
| `code` | string | No* | JavaScript code to execute (required for exec) |
| `global` | boolean | No | For list: include proxies from all directories |
| `help` | boolean | No | For exec: show __devtool API overview |
| `describe` | string | No | For exec: show detailed docs for a specific function |
| `toast_type` | string | No | For toast: notification type (success, error, warning, info) |
| `toast_title` | string | No | For toast: notification title |
| `toast_message` | string | No* | For toast: notification message (required for toast) |
| `toast_duration` | int | No | For toast: duration in milliseconds |

### Tunnel Parameters (for start action)

| Parameter | Type | Description |
|-----------|------|-------------|
| `tunnel` | string | Tunnel provider: ngrok, cloudflared, tailscale, or custom |
| `tunnel_args` | string[] | Additional arguments for tunnel command |
| `tunnel_token` | string | Authentication token for tunnel |
| `tunnel_region` | string | Tunnel region |
| `tunnel_command` | string | Custom tunnel command (use `{{PORT}}` as placeholder) |

### Output Schema

```json
{
  // For start
  "id": "string",
  "target_url": "string",
  "listen_addr": ":12345",
  "bind_address": "127.0.0.1",
  "public_url": "string",
  "tunnel_url": "string",

  // For status
  "running": true,
  "uptime": "5m 30s",
  "total_requests": 150,
  "log_stats": {
    "total_entries": 500,
    "available_entries": 500,
    "max_size": 1000,
    "dropped": 0
  },

  // For list
  "count": 2,
  "proxies": [
    {
      "id": "string",
      "target_url": "string",
      "listen_addr": "string",
      "running": true,
      "uptime": "string",
      "total_requests": 100
    }
  ],

  // For stop/exec
  "success": true,
  "message": "string",
  "execution_id": "string"
}
```

### Examples

**Start a proxy:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "start",
    "id": "dev",
    "target_url": "http://localhost:3000"
  }
}
```

**Start proxy on specific port:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "start",
    "id": "dev",
    "target_url": "http://localhost:3000",
    "port": 8080
  }
}
```

**Start proxy with tunnel:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "start",
    "id": "dev",
    "target_url": "http://localhost:3000",
    "tunnel": "cloudflared",
    "bind_address": "0.0.0.0"
  }
}
```

**Get proxy status:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "status",
    "id": "dev"
  }
}
```

**List all proxies:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "list"
  }
}
```

**Execute JavaScript in browser:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "document.title"
  }
}
```

**Take a screenshot:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.screenshot('homepage')"
  }
}
```

**Get __devtool API help:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "help": true
  }
}
```

**Get docs for specific function:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "describe": "screenshot"
  }
}
```

**Show toast notification:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "toast",
    "id": "dev",
    "toast_type": "success",
    "toast_title": "Build Complete",
    "toast_message": "Your application built successfully!"
  }
}
```

**Stop a proxy:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "stop",
    "id": "dev"
  }
}
```

---

## 5. proxylog

Query and analyze proxy traffic logs.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `proxy_id` | string | Yes | Proxy ID to query logs from |
| `action` | string | No | Action: `query` (default), `summary`, `clear`, `stats` |
| `types` | string[] | No | Filter by type: http, error, performance, custom, screenshot, execution, response, interaction, mutation |
| `methods` | string[] | No | Filter by HTTP method: GET, POST, etc. |
| `url_pattern` | string | No | URL substring to match |
| `status_codes` | int[] | No | Filter by HTTP status code |
| `since` | string | No | Start time (RFC3339 or duration like '5m') |
| `until` | string | No | End time (RFC3339) |
| `limit` | int | No | Maximum results (default: 100) |
| `detail` | string[] | No | For summary: sections to include full detail for |

### Log Types

| Type | Description |
|------|-------------|
| `http` | HTTP request/response pairs |
| `error` | Frontend JavaScript errors with stack traces |
| `performance` | Page load and resource timing metrics |
| `custom` | Custom log messages from `__devtool.log()` |
| `screenshot` | Screenshots captured via `__devtool.screenshot()` |
| `execution` | Results of executed JavaScript code |
| `response` | JavaScript execution responses |
| `interaction` | User interactions (clicks, scrolls, inputs) |
| `mutation` | DOM mutations |

### Output Schema

```json
{
  // For query
  "entries": [
    {
      "type": "string",
      "timestamp": "2024-01-15T10:30:00Z",
      "data": "{...}"
    }
  ],
  "count": 50,

  // For summary
  "summary": {
    "total_entries": 500,
    "entries_by_type": {"http": 300, "error": 50},
    "time_range": {"start": "...", "end": "..."},
    "error_count": 50,
    "unique_errors": [...],
    "http_count": 300,
    "http_by_status": {"2xx": 280, "4xx": 15, "5xx": 5}
  },

  // For stats
  "stats": {
    "total_entries": 500,
    "available_entries": 500,
    "max_size": 1000,
    "dropped": 0
  },

  // For clear
  "success": true,
  "message": "string"
}
```

### Examples

**Query all HTTP logs:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["http"]
  }
}
```

**Query errors only:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["error"]
  }
}
```

**Query API calls with errors:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["http"],
    "url_pattern": "/api",
    "status_codes": [500, 502, 503]
  }
}
```

**Query logs from last 5 minutes:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "since": "5m",
    "limit": 50
  }
}
```

**Query POST requests:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["http"],
    "methods": ["POST", "PUT"]
  }
}
```

**Get log summary:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "action": "summary"
  }
}
```

**Get log statistics:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "action": "stats"
  }
}
```

**Clear logs:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "action": "clear"
  }
}
```

---

## 6. currentpage

Get current page sessions with grouped resources and metrics.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `proxy_id` | string | Yes | Proxy ID to query pages from |
| `action` | string | No | Action: `list` (default), `get`, `summary`, `clear` |
| `session_id` | string | No* | Specific session ID (required for get/summary) |
| `detail` | string[] | No | For summary: sections to include (interactions, mutations, errors, resources) |
| `limit` | int | No | For summary: max items per detailed section (default: 5, max: 100) |

### Output Schema

```json
{
  // For list
  "sessions": [
    {
      "id": "string",
      "url": "string",
      "page_title": "string",
      "start_time": "2024-01-15T10:30:00Z",
      "last_activity": "2024-01-15T10:35:00Z",
      "active": true,
      "resource_count": 25,
      "error_count": 2,
      "has_performance": true,
      "load_time_ms": 1500,
      "interaction_count": 10,
      "mutation_count": 50
    }
  ],
  "count": 3,

  // For get
  "session": {
    "id": "string",
    "url": "string",
    "resources": ["url1", "url2"],
    "errors": [{"message": "...", "source": "..."}]
  },

  // For summary
  "summary": {
    "id": "string",
    "url": "string",
    "resource_count": 25,
    "resources_by_type": {"js": 5, "css": 3, "img": 10},
    "error_count": 2,
    "unique_errors": [...],
    "interaction_count": 10,
    "interactions_by_type": {"click": 5, "scroll": 3},
    "mutation_count": 50,
    "mutations_by_type": {"added": 30, "modified": 20}
  },

  // For clear
  "success": true,
  "message": "string"
}
```

### Examples

**List active page sessions:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "currentpage",
  "parameters": {
    "proxy_id": "dev"
  }
}
```

**Get specific session details:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "currentpage",
  "parameters": {
    "proxy_id": "dev",
    "action": "get",
    "session_id": "page-1"
  }
}
```

**Get session summary:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "currentpage",
  "parameters": {
    "proxy_id": "dev",
    "action": "summary",
    "session_id": "page-1"
  }
}
```

**Get summary with interaction details:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "currentpage",
  "parameters": {
    "proxy_id": "dev",
    "action": "summary",
    "session_id": "page-1",
    "detail": ["interactions", "errors"],
    "limit": 10
  }
}
```

**Clear all page sessions:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "currentpage",
  "parameters": {
    "proxy_id": "dev",
    "action": "clear"
  }
}
```

---

## 7. session

Manage agnt run sessions and schedule messages for AI agents.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Action: `list`, `get`, `send`, `schedule`, `tasks`, `cancel` |
| `code` | string | No* | Session code (required for get, send, schedule) |
| `message` | string | No* | Message to send or schedule (required for send, schedule) |
| `duration` | string | No* | Duration for scheduling (required for schedule) |
| `task_id` | string | No* | Task ID (required for cancel) |
| `global` | boolean | No | For list/tasks: include from all directories (default: false) |

### Duration Format

- `30s` - 30 seconds
- `5m` - 5 minutes
- `1h` - 1 hour
- `1h30m` - 1 hour 30 minutes

### Output Schema

```json
{
  // For list
  "sessions": [
    {
      "code": "claude-1",
      "overlay_path": "string",
      "project_path": "string",
      "command": "claude",
      "args": ["--flags"],
      "started_at": "2024-01-15T10:30:00Z",
      "status": "active",
      "last_seen": "2024-01-15T10:35:00Z"
    }
  ],
  "count": 2,

  // For get
  "session": {...},

  // For tasks
  "tasks": [
    {
      "id": "task-abc123",
      "session_code": "claude-1",
      "message": "Check the test results",
      "deliver_at": "2024-01-15T10:35:00Z",
      "created_at": "2024-01-15T10:30:00Z",
      "project_path": "string",
      "status": "pending",
      "attempts": 0
    }
  ],

  // For send/schedule
  "success": true,
  "message": "string",
  "task_id": "string",
  "deliver_at": "2024-01-15T10:35:00Z"
}
```

### Examples

**List active sessions:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "session",
  "parameters": {
    "action": "list"
  }
}
```

**List all sessions globally:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "session",
  "parameters": {
    "action": "list",
    "global": true
  }
}
```

**Get session details:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "session",
  "parameters": {
    "action": "get",
    "code": "claude-1"
  }
}
```

**Send message immediately:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "session",
  "parameters": {
    "action": "send",
    "code": "claude-1",
    "message": "Please check the test results and report any failures."
  }
}
```

**Schedule a message for 5 minutes:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "session",
  "parameters": {
    "action": "schedule",
    "code": "claude-1",
    "duration": "5m",
    "message": "Verify that the deployment completed successfully."
  }
}
```

**List scheduled tasks:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "session",
  "parameters": {
    "action": "tasks"
  }
}
```

**Cancel a scheduled task:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "session",
  "parameters": {
    "action": "cancel",
    "task_id": "task-abc123"
  }
}
```

---

## Common Workflows

### Start Development Environment

1. Detect project and start dev server:
```
# Detect project
detect {}

# Start dev server
run {script_name: "dev", id: "dev-server"}

# Start proxy
proxy {action: "start", id: "dev", target_url: "http://localhost:3000"}
```

### Debug Frontend Issues

1. Check for JavaScript errors:
```
proxylog {proxy_id: "dev", types: ["error"]}
```

2. Get current page context:
```
currentpage {proxy_id: "dev", action: "summary", session_id: "page-1", detail: ["errors", "interactions"]}
```

3. Take a screenshot for visual inspection:
```
proxy {action: "exec", id: "dev", code: "__devtool.screenshot('debug')"}
```

### Restart Dev Server

```
# Stop the running server
proc {action: "stop", process_id: "dev-server"}

# Start it again
run {script_name: "dev", id: "dev-server"}
```

### Run Tests with Output

```
# Run tests and wait for result
run {script_name: "test", mode: "foreground-raw"}

# Or run in background and check later
run {script_name: "test", id: "test-run"}
proc {action: "output", process_id: "test-run", grep: "FAIL|PASS"}
```

### Schedule Follow-up Checks

```
# Schedule a reminder to check deployment
session {action: "schedule", code: "claude-1", duration: "10m", message: "Verify deployment status and health endpoints."}

# View pending tasks
session {action: "tasks"}
```

### Clean Up Resources

```
# Stop all processes
proc {action: "list"}
proc {action: "stop", process_id: "dev-server", force: true}

# Stop proxy
proxy {action: "stop", id: "dev"}

# Clear logs
proxylog {proxy_id: "dev", action: "clear"}
```
