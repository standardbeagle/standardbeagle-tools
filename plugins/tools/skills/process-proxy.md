---
name: process-proxy
description: Dev server lifecycle and reverse proxy management workflows with troubleshooting patterns
---

# Process and Proxy Management Skill

This skill provides deep workflow guidance for managing dev servers and reverse proxies using agnt's `run`, `proc`, `proxy`, `automation`, and `proxylog` tools. These are the most commonly used tools in the agnt workflow.

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

## Script Auto-Detection

Agnt auto-detects available scripts from your project's package manager or build system. When you use `run {script_name: "dev"}`, agnt looks for a script named "dev" in:

- **Node.js**: `scripts` in `package.json` (npm/pnpm/yarn)
- **Go**: targets in `Makefile`
- **Python**: targets in `Makefile` or common entry points

Scripts can also be configured in `.agnt.kdl` under the `scripts {}` block with `run`, `command/args`, `autostart`, `url-matchers`, `env`, `cwd`, `depends-on`, and `shell` fields. Scripts with `autostart true` are started automatically by the daemon. The `.agnt.kdl` file is the primary configuration for scripts, proxies, hooks, toast, alerts, and AI context.

To see what scripts agnt can find, use the `detect` tool:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "detect",
  "parameters": {}
}
```

---

## Run Tool - Starting Processes

The `run` tool starts scripts and commands with three execution modes.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | No | Project directory (defaults to current dir) |
| `script_name` | string | No* | Script name from package.json/Makefile (e.g., dev, test, build) |
| `raw` | boolean | No | Raw mode: use command and args directly |
| `command` | string | No* | Raw mode: executable to run |
| `args` | string[] | No | Extra arguments |
| `id` | string | No | Process ID (auto-generated if empty) |
| `mode` | string | No | Execution mode (see below) |
| `no_auto_restart` | boolean | No | Disable auto-restart on crash (default: false) |

*Either `script_name` OR (`raw: true` + `command`) is required.

### Execution Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `background` | Returns immediately with process_id | Dev servers, watchers, long-running processes |
| `foreground` | Waits for completion, returns exit_code | Build scripts, test runs when you need result |
| `foreground-raw` | Waits and returns full stdout/stderr | Scripts where output content matters |

### Start Dev Server (Background)

The most common workflow - start a dev server that runs continuously:

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

**Response**:
```json
{
  "process_id": "dev-server",
  "pid": 12345,
  "command": "npm run dev"
}
```

**Why use custom ID**: Using `"id": "dev-server"` creates a predictable ID for later commands. Without it, you get auto-generated IDs like `dev-abc123`.

### Run Tests (Foreground)

Wait for tests to complete and get the result:

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

**Response**:
```json
{
  "process_id": "test-abc123",
  "pid": 12346,
  "command": "npm test",
  "exit_code": 0,
  "state": "stopped",
  "runtime": "15.2s"
}
```

### Run Tests with Full Output

When you need to see test failures or build errors:

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

**Response includes**:
```json
{
  "process_id": "test-abc123",
  "exit_code": 1,
  "state": "failed",
  "runtime": "8.5s",
  "stdout": "Running tests...\n\nFAIL src/utils.test.js\n  ...",
  "stderr": "Error: Assertion failed..."
}
```

### Run Raw Commands

For commands not defined as project scripts:

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

### Run with Extra Arguments

Pass additional arguments to a script:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "run",
  "parameters": {
    "script_name": "test",
    "args": ["--watch", "--coverage"],
    "mode": "foreground"
  }
}
```

### Start Without Auto-Restart

By default, background processes auto-restart on crash. Disable this:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "run",
  "parameters": {
    "script_name": "dev",
    "id": "dev-server",
    "no_auto_restart": true
  }
}
```

---

## Proc Tool - Process Management

The `proc` tool monitors and controls running processes.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Action to perform |
| `process_id` | string | No* | Target process ID |
| `stream` | string | No | Output stream: `stdout`, `stderr`, `combined` |
| `tail` | int | No | Last N lines only |
| `head` | int | No | First N lines only |
| `grep` | string | No | Filter lines by regex |
| `grep_v` | boolean | No | Invert grep (exclude matches) |
| `force` | boolean | No | Force kill immediately |
| `port` | int | No* | Port number for cleanup_port |
| `global` | boolean | No | Include all directories (default: false) |
| `auto_restart_enable` | boolean | No | Enable/disable auto-restart (for autorestart action) |
| `max_restarts` | int | No | Max restarts per minute (for autorestart action) |
| `only_on_error` | boolean | No | Only restart on non-zero exit (for autorestart action) |

### Actions Reference

| Action | Description | Required Parameters |
|--------|-------------|---------------------|
| `list` | List all processes | - |
| `status` | Get process state | `process_id` |
| `output` | Get process output | `process_id` |
| `stop` | Stop a process | `process_id` |
| `restart` | Restart a process | `process_id` |
| `autorestart` | Check/toggle auto-restart | `process_id` |
| `cleanup_port` | Kill process on port | `port` |

### List Running Processes

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

**Response**:
```json
{
  "count": 2,
  "processes": [
    {
      "id": "dev-server",
      "command": "npm run dev",
      "state": "running",
      "summary": "Running for 5m 30s",
      "runtime": "5m 30s",
      "project_path": "/home/user/my-app"
    }
  ],
  "project_path": "/home/user/my-app",
  "global": false
}
```

**Note**: By default, lists only processes from current directory. Use `global: true` for all.

### List All Processes Globally

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

### Get Process Status

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "status",
    "process_id": "dev-server"
  }
}
```

**Response**:
```json
{
  "process_id": "dev-server",
  "state": "running",
  "summary": "Running for 10m 15s",
  "exit_code": -1,
  "runtime": "10m 15s"
}
```

**Process states**: `pending`, `starting`, `running`, `stopping`, `stopped`, `failed`

### Get Process Output

Get recent output with filtering options:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "dev-server",
    "tail": 30
  }
}
```

**Response**:
```json
{
  "output": "Server started on http://localhost:3000\n...",
  "lines": 30,
  "truncated": false
}
```

### Filter Output with Grep

Find errors in test output:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "test-run",
    "grep": "FAIL|ERROR|error:"
  }
}
```

### Get Only Stderr

Useful for finding error messages:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "dev-server",
    "stream": "stderr",
    "tail": 50
  }
}
```

### Exclude Noise from Output

Filter out verbose logging:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "dev-server",
    "grep": "GET|POST|OPTIONS",
    "grep_v": true,
    "tail": 50
  }
}
```

### Stop Process Gracefully

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "stop",
    "process_id": "dev-server"
  }
}
```

**Behavior**: Sends SIGTERM, waits 5 seconds, then SIGKILL if still running.

### Force Stop Process

When graceful shutdown doesn't work:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "stop",
    "process_id": "dev-server",
    "force": true
  }
}
```

**Behavior**: Immediate SIGKILL.

### Restart Process

Restart a running process (stop + start with same configuration):

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "restart",
    "process_id": "dev-server"
  }
}
```

### Configure Auto-Restart

Check or toggle auto-restart behavior for a process:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "autorestart",
    "process_id": "dev-server",
    "auto_restart_enable": false
  }
}
```

With full options:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "autorestart",
    "process_id": "dev-server",
    "auto_restart_enable": true,
    "max_restarts": 3,
    "only_on_error": true
  }
}
```

### Cleanup Port

Kill any process using a specific port (useful when port is stuck):

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

**Response**:
```json
{
  "killed_pids": [12345, 12346],
  "message": "Killed 2 processes using port 3000"
}
```

---

## Auto-Restart Behavior

Background processes auto-restart on crash by default. The restart is rate-limited to 5 restarts per minute to prevent crash loops.

**Disable at launch**: Use `no_auto_restart: true` on the `run` tool:
```
run {script_name: "dev", id: "dev-server", no_auto_restart: true}
```

**Disable for a running process**: Use the `autorestart` action on the `proc` tool:
```
proc {action: "autorestart", process_id: "dev-server", auto_restart_enable: false}
```

**Restart only on errors** (not clean exits): Use `only_on_error: true`:
```
proc {action: "autorestart", process_id: "dev-server", auto_restart_enable: true, only_on_error: true}
```

**Adjust rate limit**: Use `max_restarts` to change the per-minute limit:
```
proc {action: "autorestart", process_id: "dev-server", max_restarts: 3}
```

---

## Proxy Tool - Reverse Proxy Management

The `proxy` tool manages reverse proxies that add browser debugging capabilities.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Action to perform |
| `id` | string | No* | Proxy ID |
| `target_url` | string | No* | URL to proxy (for start) |
| `port` | int | No | Listen port (default: hash-based) |
| `bind_address` | string | No | `127.0.0.1` (default) or `0.0.0.0` |
| `public_url` | string | No | Public URL for tunnels |
| `verify_tls` | boolean | No | Verify TLS certificates |
| `code` | string | No* | JavaScript code (for exec) |
| `global` | boolean | No | Include all directories |
| `help` | boolean | No | Show __devtool API help |
| `describe` | string | No | Describe specific function |
| `toast_type` | string | No | Notification type |
| `toast_title` | string | No | Notification title |
| `toast_message` | string | No* | Notification message (for toast) |
| `toast_duration` | int | No | Duration in milliseconds |

### Actions Reference

| Action | Description | Required Parameters |
|--------|-------------|---------------------|
| `start` | Start a proxy | `id`, `target_url` |
| `stop` | Stop a proxy | `id` |
| `status` | Get proxy status | `id` |
| `list` | List all proxies | - |
| `exec` | Execute JavaScript | `id`, `code` |
| `toast` | Show browser notification | `id`, `toast_message` |

**Important**: Proxies can be configured in `.agnt.kdl` under the `proxies {}` block with `url`/`port`, `script` (link to script for URL detection), `url-pattern`, `bind`, `autostart`, and `fallback-port`. Proxies with explicit targets or `autostart true` start automatically. Script-linked proxies start when their script's URL is detected in output.

### Start Proxy

Start a proxy pointing to your dev server:

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

**Response**:
```json
{
  "id": "dev",
  "target_url": "http://localhost:3000",
  "listen_addr": ":12345",
  "bind_address": "127.0.0.1",
  "public_url": "http://localhost:12345"
}
```

**Port behavior**: If not specified, port is deterministically hashed from target URL (stable across restarts).

### Start Proxy on Specific Port

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

### Start Proxy for External Access

For testing on mobile devices or sharing:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "start",
    "id": "dev",
    "target_url": "http://localhost:3000",
    "bind_address": "0.0.0.0",
    "port": 8080
  }
}
```

### Get Proxy Status

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

**Response**:
```json
{
  "id": "dev",
  "running": true,
  "uptime": "15m 30s",
  "total_requests": 250,
  "target_url": "http://localhost:3000",
  "listen_addr": ":12345",
  "log_stats": {
    "total_entries": 500,
    "available_entries": 500,
    "max_size": 1000,
    "dropped": 0
  }
}
```

### List All Proxies

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

### Execute JavaScript in Browser

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

### Take Screenshot

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.screenshot('current-state')"
  }
}
```

### Get __devtool API Help

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

### Describe Specific Function

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "describe": "auditAccessibility"
  }
}
```

### Show Toast Notification

Notify the user in the browser:

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
    "toast_message": "Your changes have been compiled",
    "toast_duration": 5000
  }
}
```

**Toast types**: `success`, `error`, `warning`, `info`

### Stop Proxy

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

## Automation Tool - Headless Browser

The `automation` tool starts headless Chrome sessions through a proxy for automated browser testing and interaction.

### Start Automation Session

Launch headless Chrome pointing at a proxy:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "automation",
  "parameters": {
    "action": "start",
    "proxy_id": "dev"
  }
}
```

**Response** includes a `session_id` for subsequent commands.

### Take Screenshot

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "automation",
  "parameters": {
    "action": "screenshot",
    "session_id": "abc123",
    "type": "viewport",
    "label": "homepage"
  }
}
```

### Navigate to URL

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "automation",
  "parameters": {
    "action": "navigate",
    "session_id": "abc123",
    "url": "http://localhost:3000/settings"
  }
}
```

### Evaluate JavaScript

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "automation",
  "parameters": {
    "action": "evaluate",
    "session_id": "abc123",
    "script": "document.querySelectorAll('.error').length"
  }
}
```

---

## Proxylog Tool - Traffic Analysis

The `proxylog` tool queries and analyzes traffic logs from a proxy.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `proxy_id` | string | Yes | Proxy to query |
| `action` | string | No | `query` (default), `summary`, `clear`, `stats` |
| `types` | string[] | No | Filter by log type |
| `methods` | string[] | No | Filter by HTTP method |
| `url_pattern` | string | No | URL substring filter |
| `status_codes` | int[] | No | Filter by status codes |
| `since` | string | No | Start time (RFC3339 or duration) |
| `until` | string | No | End time (RFC3339) |
| `limit` | int | No | Maximum results (default: 100) |
| `detail` | string[] | No | Sections for full detail in summary |

### Log Types

| Type | Description |
|------|-------------|
| `http` | HTTP request/response pairs |
| `error` | Frontend JavaScript errors |
| `performance` | Page load timing metrics |
| `custom` | Custom logs from `__devtool.log()` |
| `screenshot` | Captured screenshots |
| `execution` | JavaScript execution requests |
| `response` | JavaScript execution responses |
| `interaction` | User interactions (clicks, scrolls) |
| `mutation` | DOM mutations |

### Query All HTTP Traffic

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

### Query JavaScript Errors

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

### Query Failed API Calls

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["http"],
    "url_pattern": "/api",
    "status_codes": [400, 401, 403, 404, 500, 502, 503]
  }
}
```

### Query POST/PUT Requests

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["http"],
    "methods": ["POST", "PUT", "DELETE"]
  }
}
```

### Query Recent Activity

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

### Get Traffic Summary

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

**Response**:
```json
{
  "summary": {
    "total_entries": 500,
    "entries_by_type": {"http": 400, "error": 20, "custom": 80},
    "time_range": {"start": "...", "end": "..."},
    "error_count": 20,
    "unique_errors": ["TypeError: Cannot read property 'x' of undefined"],
    "http_count": 400,
    "http_by_status": {"2xx": 380, "4xx": 15, "5xx": 5}
  }
}
```

### Get Log Statistics

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

**Response**:
```json
{
  "stats": {
    "total_entries": 1000,
    "available_entries": 1000,
    "max_size": 1000,
    "dropped": 150
  }
}
```

**Note**: `dropped` indicates entries lost due to buffer overflow. Default buffer is 1000 entries.

### Clear Logs

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

## Common Workflows

### Workflow 1: Start Development Environment

The most common workflow - start dev server and proxy together. Scripts are auto-detected from `package.json` (or equivalent).

**Step 1: Detect project and available scripts**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "detect",
  "parameters": {}
}
```

**Step 2: Start dev server in background** (uses script from package.json)
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

**Step 3: Wait for server to start, then check output**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "dev-server",
    "tail": 10
  }
}
```

**Step 4: Start proxy with target_url** (NOT via .agnt.kdl config)
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

**Result**: Browser opens proxy URL (e.g., http://localhost:12345) with debugging enabled.

---

### Workflow 2: Restart Dev Server

When you need to restart after code changes:

**Option A: Use the restart action** (preferred)
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "restart",
    "process_id": "dev-server"
  }
}
```

**Option B: Manual stop + start**

**Step 1: Stop running server**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "stop",
    "process_id": "dev-server"
  }
}
```

**Step 2: Start server again (same ID)**
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

**Note**: Proxy auto-reconnects when target becomes available again.

---

### Workflow 3: Debug JavaScript Errors

**Step 1: Check for errors in proxy logs**
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

**Step 2: Get more context from traffic summary**
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

**Step 3: Take screenshot to see current state**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.screenshot('error-state')"
  }
}
```

---

### Workflow 4: Debug API Issues

**Step 1: Find failing API calls**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["http"],
    "url_pattern": "/api",
    "status_codes": [400, 401, 403, 404, 500, 502, 503]
  }
}
```

**Step 2: Check server-side errors**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "dev-server",
    "stream": "stderr",
    "tail": 30
  }
}
```

**Step 3: Check for related frontend errors**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["error"],
    "since": "5m"
  }
}
```

---

### Workflow 5: Clean Shutdown

Stop all processes and proxies cleanly:

**Step 1: List running processes**
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

**Step 2: Stop each process**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "stop",
    "process_id": "dev-server"
  }
}
```

**Step 3: Stop proxy**
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

### Workflow 6: Multi-Service Orchestration

For projects with multiple processes (e.g., .NET backend + Vite frontend), use a shell script orchestrator.

**Step 1: Create an orchestrator script** (e.g., `dev-ui.sh`):

The script should:
- Kill stale port listeners before starting
- Start services in dependency order (backend first)
- Wait for health checks before starting dependent services
- Use `--no-hot-reload` for `dotnet watch` to prevent zombie listeners

Example structure:
```bash
#!/bin/bash
# Kill stale listeners
for port in 5000 5173; do
  lsof -ti:$port | xargs -r kill -9 2>/dev/null
done

# Start backend with --no-hot-reload (prevents zombie port listeners)
dotnet watch --no-hot-reload --project src/MyApp &
BACKEND_PID=$!

# Wait for backend health check
for i in $(seq 1 30); do
  curl -sf http://localhost:5000/health && break
  sleep 1
done

# Start frontend
npx vite --port 5173 &
FRONTEND_PID=$!

wait -n
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
```

**Step 2: Reference it in package.json** so agnt auto-detects it:
```json
{
  "scripts": {
    "dev": "bash ./dev-ui.sh"
  }
}
```

**Step 3: Start with run**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "run",
  "parameters": {
    "script_name": "dev",
    "id": "dev"
  }
}
```

**Step 4: Start proxy for the frontend**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "start",
    "id": "dev",
    "target_url": "http://localhost:5173"
  }
}
```

**Key points**:
- `--no-hot-reload` on `dotnet watch` prevents hot-reload from creating zombie processes that hold ports
- Kill stale ports at the start of the script to handle unclean shutdowns
- Health check the backend before starting the frontend to avoid connection errors
- The orchestrator script consolidates multiple services into a single `run` command

---

## Troubleshooting Patterns

### Problem: Port Already in Use

**Symptom**: "address already in use" error when starting dev server

**Solution 1: Kill process using the port**
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

**Solution 2: If that doesn't work, check for zombie processes**
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

Then force stop any stuck processes:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "stop",
    "process_id": "stuck-process",
    "force": true
  }
}
```

---

### Problem: dotnet watch Zombie Listeners

**Symptom**: After stopping `dotnet watch`, the port is still in use. New starts fail with "address already in use".

**Cause**: `dotnet watch` with hot-reload enabled can spawn child processes that survive the parent being killed, holding onto the port.

**Prevention**: Always use `--no-hot-reload` flag when running `dotnet watch` as a background process:
```bash
dotnet watch --no-hot-reload --project src/MyApp
```

**Fix**: Use `cleanup_port` to kill the zombie:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "cleanup_port",
    "port": 5000
  }
}
```

---

### Problem: Process Crashes on Start

**Symptom**: Process starts but immediately changes to `failed` state

**Step 1: Check the exit code and status**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "status",
    "process_id": "dev-server"
  }
}
```

**Step 2: Get the full output to see error message**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "dev-server"
  }
}
```

**Step 3: Check stderr specifically**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "dev-server",
    "stream": "stderr"
  }
}
```

---

### Problem: Proxy Not Connecting

**Symptom**: Proxy started but browser shows connection refused

**Step 1: Check proxy status**
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

**Step 2: Verify target server is running**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "status",
    "process_id": "dev-server"
  }
}
```

**Step 3: Check if target URL is correct in server output**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "output",
    "process_id": "dev-server",
    "grep": "localhost|http://|:3000",
    "tail": 20
  }
}
```

---

### Problem: Process Won't Stop

**Symptom**: Graceful stop times out

**Solution: Force kill**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proc",
  "parameters": {
    "action": "stop",
    "process_id": "stuck-server",
    "force": true
  }
}
```

---

### Problem: Lost Track of Processes

**Symptom**: Don't know what's running after context switch

**Solution: List all processes globally**
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

**Also check proxies**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "list",
    "global": true
  }
}
```

---

### Problem: Log Buffer Full

**Symptom**: `dropped` count is high in stats, missing logs

**Step 1: Check current stats**
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

**Step 2: Clear logs to reset buffer**
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

**Prevention**: Query logs more frequently, or restart proxy with larger `max_log_size` if needed.

---

### Problem: Finding Specific Log Entry

**Symptom**: Need to find a specific request or error

**Search by URL pattern**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["http"],
    "url_pattern": "/api/users"
  }
}
```

**Search by time window**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "since": "2m",
    "until": "1m"
  }
}
```

**Combine filters**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["http"],
    "methods": ["POST"],
    "url_pattern": "/api/auth",
    "status_codes": [401, 403]
  }
}
```

---

## Quick Reference Tables

### Run Modes

| Mode | Returns | Blocks | Best For |
|------|---------|--------|----------|
| `background` | process_id, pid | No | Dev servers, watchers |
| `foreground` | exit_code, state, runtime | Yes | Builds, deploys |
| `foreground-raw` | + stdout, stderr | Yes | Tests, debugging |

### Process States

| State | Meaning | Can Stop? |
|-------|---------|-----------|
| `pending` | Created, not started | Yes |
| `starting` | Launching | Yes |
| `running` | Active | Yes |
| `stopping` | Shutting down | No |
| `stopped` | Clean exit | No |
| `failed` | Crashed/error | No |

### Proxy Configuration

| Setting | Default | Notes |
|---------|---------|-------|
| Port | Hash-based | Stable across restarts |
| Bind Address | `127.0.0.1` | Use `0.0.0.0` for LAN |
| Log Buffer | 1000 entries | Circular buffer |
| Max Body Log | 10KB | Truncated in logs |

### Output Filtering

| Parameter | Effect | Example |
|-----------|--------|---------|
| `tail` | Last N lines | `tail: 20` |
| `head` | First N lines | `head: 10` |
| `grep` | Include matching | `grep: "ERROR|WARN"` |
| `grep_v` | Exclude matching | `grep_v: true` |
| `stream` | Select stream | `stream: "stderr"` |
