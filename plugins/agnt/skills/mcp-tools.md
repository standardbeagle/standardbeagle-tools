---
name: mcp-tools
description: Complete reference for all agnt MCP tools with exact parameter schemas and copy-paste examples. agnt全部MCP工具完整參考，含精確參數模式與可複製示例。 Use when: need agnt tool parameter reference, look up tool schema, find correct parameter names, check tool invocation format
---

# Agnt MCP工具參考

精確參數模式及所有agnt MCP工具之即用示例。以 `mcp__plugin_slop-mcp_slop-mcp__execute_tool` 配合 `mcp_name: "agnt"` 調用這些工具。

## 工具調用格式

所有工具以slop-mcp execute_tool格式調用：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "<tool_name>",
  "parameters": { <tool_parameters> }
}
```

---

## ⚠️ 常見參數錯誤

以下為頻繁混淆之參數。用錯名稱導致驗證錯誤。

| Tool | ❌ WRONG | ✅ RIGHT | Notes |
|------|----------|----------|-------|
| `currentpage` | (no proxy_id) | `proxy_id: "dev"` | **Required** - always specify proxy_id |
| `currentpage` | `action: "info"` | `action: "list"` | Valid actions: list, get, summary, clear |
| `currentpage` | `include: [...]` | `detail: [...]` | Use `detail` for summary sections |
| `currentpage` | `js: "..."` | Use `proxy exec` with `code` | currentpage has no JS execution |
| `proxy` exec | `js: "..."` | `code: "..."` | Parameter is `code`, not `js` |
| `proxy` exec | `proxy_id: "dev"` | `id: "dev"` | proxy uses `id`, not `proxy_id` |
| `proxylog` | `last: 20` | `limit: 20` | Parameter is `limit`, not `last` |
| `snapshot` | `proxy_id: "dev"` | (not a parameter) | snapshot doesn't take proxy_id |
| `snapshot` | `pages: "page-10"` | `pages: [{url: "/", ...}]` | Must be array of objects |

**關鍵區別**：`proxy` 工具用 `id`，而 `proxylog`、`currentpage`、`get_errors` 用 `proxy_id`。

---

## 1. detect

探測項目類型及可用腳本。

### 參數

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | No | Directory path (defaults to current dir) |

### 輸出模式

```json
{
  "type": "string",           // go, node, python, unknown
  "name": "string",           // Project name
  "scripts": ["string"],      // Available script names
  "package_manager": "string", // npm, yarn, pnpm, etc.
  "metadata": {}              // Additional project metadata
}
```

### 示例

**探測當前項目：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "detect",
  "parameters": {}
}
```

**探測指定目錄：**
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

運行項目腳本或原始命令。

### 參數

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

### 執行模式

| Mode | Behavior |
|------|----------|
| `background` | Returns process_id immediately for tracking via proc tool (default) |
| `foreground` | Waits for completion, returns exit_code/state/runtime (output via proc) |
| `foreground-raw` | Waits for completion, returns exit_code/state/runtime + stdout/stderr |

### 輸出模式

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

### 示例

**後台運行項目腳本：**
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

**運行測試並等待結果：**
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

**帶完整輸出運行測試：**
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

**運行原始命令：**
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

**以自訂進程ID運行：**
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

管理運行中進程。

### 參數

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

### 操作

| Action | Description | Required Parameters |
|--------|-------------|---------------------|
| `list` | List all running processes | - |
| `status` | Get process status and info | `process_id` |
| `output` | Get process output with optional filters | `process_id` |
| `stop` | Gracefully stop a process | `process_id` |
| `cleanup_port` | Kill any process using a specific port | `port` |

### 輸出模式

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

### 示例

**列出所有進程：**
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

**全局列出進程：**
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

**取得進程狀態：**
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

**取得最後20行輸出：**
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

**正則過濾輸出：**
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

**僅取stderr：**
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

**優雅停止進程：**
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

**強制殺死進程：**
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

**清理端口3000：**
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

管理含流量日誌與前端儀器之反向代理服務器。

### 參數

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

### 隧道參數（start操作用）

| Parameter | Type | Description |
|-----------|------|-------------|
| `tunnel` | string | Tunnel provider: ngrok, cloudflared, tailscale, or custom |
| `tunnel_args` | string[] | Additional arguments for tunnel command |
| `tunnel_token` | string | Authentication token for tunnel |
| `tunnel_region` | string | Tunnel region |
| `tunnel_command` | string | Custom tunnel command (use `{{PORT}}` as placeholder) |

### 輸出模式

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

### 示例

**啟動代理：**
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

**指定端口啟動代理：**
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

**帶隧道啟動代理：**
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

**取得代理狀態：**
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

**列出所有代理：**
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

**在瀏覽器執行JavaScript：**
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

**截圖：**
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

**取得 __devtool API 幫助：**
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

**取得特定函數文檔：**
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

**顯示toast通知：**
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

**停止代理：**
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

查詢並分析代理流量日誌。

### 參數

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
| `raw` | boolean | No | Return full raw data instead of compact format (default: false) |
| `errors_only` | boolean | No | Filter to errors from all sources |
| `diagnostic_levels` | string[] | No | Filter diagnostics by level: info, warning, error |

### 日誌類型

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

### 輸出模式

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

### 示例

**查詢所有HTTP日誌：**
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

**僅查詢錯誤：**
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

**查詢有錯誤的API調用：**
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

**查詢最近5分鐘日誌：**
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

**查詢POST請求：**
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

**取得日誌摘要：**
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

**取得日誌統計：**
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

**清除日誌：**
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

取得含分組資源與指標之當前頁面會話。

### 參數

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `proxy_id` | string | Yes | Proxy ID to query pages from |
| `action` | string | No | Action: `list` (default), `get`, `summary`, `clear` |
| `session_id` | string | No* | Specific session ID (required for get/summary) |
| `detail` | string[] | No | For summary: sections to include (interactions, mutations, errors, resources) |
| `limit` | int | No | For summary: max items per detailed section (default: 5, max: 100) |
| `raw` | boolean | No | For get: return full raw data instead of compact format (default: false) |

### 輸出模式

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

### 示例

**列出活躍頁面會話：**
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

**取得特定會話詳情：**
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

**取得會話摘要：**
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

**帶互動詳情的摘要：**
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

**清除所有頁面會話：**
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

管理agnt運行會話並為AI代理排程消息。

### 參數

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Action: `list`, `get`, `send`, `schedule`, `tasks`, `cancel` |
| `code` | string | No* | Session code (required for get, send, schedule) |
| `message` | string | No* | Message to send or schedule (required for send, schedule) |
| `duration` | string | No* | Duration for scheduling (required for schedule) |
| `task_id` | string | No* | Task ID (required for cancel) |
| `global` | boolean | No | For list/tasks: include from all directories (default: false) |

### 時長格式

- `30s` - 30 seconds
- `5m` - 5 minutes
- `1h` - 1 hour
- `1h30m` - 1 hour 30 minutes

### 輸出模式

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

### 示例

**列出活躍會話：**
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

**全局列出所有會話：**
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

**取得會話詳情：**
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

**立即發送消息：**
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

**排程5分鐘後消息：**
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

**列出排程任務：**
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

**取消排程任務：**
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

## 8. daemon

管理agnt守護進程。

### 參數

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Action: `status`, `info`, `start`, `stop`, `restart` |

### 輸出模式

```json
{
  "running": true,
  "pid": 12345,
  "uptime": "5m 30s",
  "version": "string",

  "socket_path": "string",
  "log_path": "string",
  "config_path": "string"
}
```

### 示例

**查看守護進程狀態：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "daemon",
  "parameters": {
    "action": "status"
  }
}
```

**取得守護進程信息：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "daemon",
  "parameters": {
    "action": "info"
  }
}
```

---

## 9. get_errors

跨所有代理與進程匯聚錯誤，含去重與過濾。

### 參數

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `proxy_id` | string | No | Filter to specific proxy (default: all) |
| `process_id` | string | No | Filter to specific process (default: all) |
| `since` | string | No | Time filter: `"5m"`, `"1h"`, or RFC3339 timestamp |
| `include_warnings` | boolean | No | Include 4xx HTTP and warnings (default: true) |
| `limit` | int | No | Max results (default: 25) |
| `raw` | boolean | No | Return full JSON (default: false) |

### 錯誤來源

| Source | Label | Captures |
|--------|-------|----------|
| Browser JS | `browser:js` | Runtime exceptions via `window.onerror` |
| HTTP | `proxy:http` | 4xx (warning) and 5xx (error) responses |
| Process | `process:<id>` | Compile errors, panics, exceptions |
| Proxy | `proxy:diagnostic` | Transport and connection failures |
| Custom | `browser:custom` | `__devtool.log("error", msg)` calls |

### 輸出模式

```json
// Compact output (raw: false)
"=== Errors (2) ===\n[browser:js] TypeError (3x) ..."

// Raw output (raw: true)
[
  {
    "source": "browser:js",
    "severity": "error",
    "category": "TypeError",
    "message": "Cannot read property 'map' of undefined",
    "location": "src/components/List.tsx:42:15",
    "page": "http://localhost:3000/dashboard",
    "count": 3,
    "last_seen": "2024-01-15T10:30:05Z"
  }
]
```

### 示例

**查看所有錯誤：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {}
}
```

**查看近期錯誤（最近5分鐘）：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "since": "5m"
  }
}
```

**僅看錯誤（無警告）：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "include_warnings": false
  }
}
```

**過濾至特定代理：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "proxy_id": "dev",
    "since": "5m"
  }
}
```

**分析用完整JSON：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "raw": true,
    "limit": 50
  }
}
```

---

## 10. snapshot

含基線/比較截圖之視覺回歸測試。

### 參數

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Action: `baseline`, `compare`, `list`, `delete`, `get` |
| `name` | string | No* | Baseline name (required for baseline/compare/delete/get) |
| `baseline` | string | No | Baseline name to compare against (for compare action) |
| `pages` | object[] | No | Pages to capture: array of `{url, viewport, screenshot_data}` |
| `diff_threshold` | float | No | Diff sensitivity threshold 0.0-1.0 (default: 0.01) |

### 操作

| Action | Description | Required Parameters |
|--------|-------------|---------------------|
| `baseline` | Capture baseline screenshots | `name`, `pages` |
| `compare` | Compare current state against a baseline | `name`, `pages`, optionally `baseline` |
| `list` | List all saved baselines | - |
| `delete` | Delete a saved baseline | `name` |
| `get` | Get details of a saved baseline | `name` |

### Pages陣列格式

`pages` 中各條目必須為對象（非字符串）：

```json
{
  "url": "/dashboard",
  "viewport": "1440x900",
  "screenshot_data": "<base64 screenshot data>"
}
```

### 示例

**採集基線：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "snapshot",
  "parameters": {
    "action": "baseline",
    "name": "homepage-v1",
    "pages": [
      {"url": "/", "viewport": "1440x900", "screenshot_data": "<base64>"},
      {"url": "/", "viewport": "375x667", "screenshot_data": "<base64>"}
    ]
  }
}
```

**與基線比較：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "snapshot",
  "parameters": {
    "action": "compare",
    "name": "homepage-current",
    "baseline": "homepage-v1",
    "pages": [
      {"url": "/", "viewport": "1440x900", "screenshot_data": "<base64>"}
    ],
    "diff_threshold": 0.05
  }
}
```

**列出所有基線：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "snapshot",
  "parameters": {
    "action": "list"
  }
}
```

---

## 常用工作流

### 啟動開發環境

1. 探測項目並啟動開發服務器：
```
# Detect project
detect {}

# Start dev server
run {script_name: "dev", id: "dev-server"}

# Start proxy
proxy {action: "start", id: "dev", target_url: "http://localhost:3000"}
```

### 除錯前端問題

1. 查看JavaScript錯誤：
```
proxylog {proxy_id: "dev", types: ["error"]}
```

2. 取得當前頁面上下文：
```
currentpage {proxy_id: "dev", action: "summary", session_id: "page-1", detail: ["errors", "interactions"]}
```

3. 截圖以視覺檢查：
```
proxy {action: "exec", id: "dev", code: "__devtool.screenshot('debug')"}
```

### 重啟開發服務器

```
# Stop the running server
proc {action: "stop", process_id: "dev-server"}

# Start it again
run {script_name: "dev", id: "dev-server"}
```

### 帶輸出運行測試

```
# Run tests and wait for result
run {script_name: "test", mode: "foreground-raw"}

# Or run in background and check later
run {script_name: "test", id: "test-run"}
proc {action: "output", process_id: "test-run", grep: "FAIL|PASS"}
```

### 排程後續查看

```
# Schedule a reminder to check deployment
session {action: "schedule", code: "claude-1", duration: "10m", message: "Verify deployment status and health endpoints."}

# View pending tasks
session {action: "tasks"}
```

### 清理資源

```
# Stop all processes
proc {action: "list"}
proc {action: "stop", process_id: "dev-server", force: true}

# Stop proxy
proxy {action: "stop", id: "dev"}

# Clear logs
proxylog {proxy_id: "dev", action: "clear"}
```
