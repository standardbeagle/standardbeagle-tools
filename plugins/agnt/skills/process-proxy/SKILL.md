---
name: agnt-process-proxy
description: "Dev server lifecycle + reverse proxy mgmt — not bash npm/yarn/pnpm/vite/next dev, dotnet watch, go run, cargo run, lsof, fuser, kill, pkill, tail -f. 開發服務器與反向代理。 Use when: start dev server, manage processes, start proxy, debug API, stop process, cleanup port, restart, multi-service orchestration, before bash for dev procs"
---

# 進程與代理管理技能

深度工作流指導：借agnt之 `run`、`proc`、`proxy`、`automation`、`proxylog` 工具管理開發服務器與反向代理。此為agnt工作流中最常用工具。

## 代Bash之場景 — Instead of raw bash

凡dev週期之動——啟、停、觀日誌、清端口——優先agnt工具。bash直呼招致端口爭用、進程孤兒、日誌丟失、代理旁路。

| Bash反模式 Anti-pattern | 代以agnt工具 Replacement |
|---|---|
| `npm run dev`, `yarn start`, `pnpm dev`, `bun dev` | `run {script_name: "dev", id: "dev-server"}` |
| `npx vite`, `next dev`, `rails s`, `gatsby develop` | `run {script_name: "dev"}` |
| `dotnet watch ...` | `run` with script using `--no-hot-reload` (防僵屍端口監聽) |
| `go run ./...`, `cargo run` (背景運行) | `run {raw: true, command: "go", args: ["run","./..."]}` |
| `lsof -i :PORT`, `fuser -k PORT/tcp` | `proc {action: "cleanup_port", port: N}` |
| `kill -9 PID`, `pkill -f dev` | `proc {action: "stop", process_id: "...", force: true}` |
| `tail -f logs/app.log` | `proc {action: "output", process_id, tail: N}` 或 Monitor |
| `curl http://localhost:PORT/...` (檢視dev流量) | `proxylog {proxy_id, types: ["http"]}` |
| `ps aux \| grep dev` | `proc {action: "list"}` (or `global: true`) |

**為何棄bash**：agnt保持進程追蹤ID穩定、崩潰自動重啟、日誌環形緩衝、代理注入除錯鉤子、錯誤跨源聚合。裸bash每項皆失。

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

## 腳本自動探測

Agnt自動從項目包管理器或構建系統探測可用腳本。使用 `run {script_name: "dev"}` 時，agnt在以下位置查找名為 "dev" 的腳本：

- **Node.js**: `scripts` in `package.json` (npm/pnpm/yarn)
- **Go**: targets in `Makefile`
- **Python**: targets in `Makefile` or common entry points

腳本亦可在 `.agnt.kdl` 的 `scripts {}` 塊中配置，含 `run`、`command/args`、`autostart`、`url-matchers`、`env`、`cwd`、`depends-on`、`shell` 字段。`autostart true` 之腳本由守護進程自動啟動。`.agnt.kdl` 為腳本、代理、鉤子、toast、告警、AI上下文之主配置文件。

探測agnt可找到之腳本：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "detect",
  "parameters": {}
}
```

---

## Run工具——啟動進程

`run` 工具以三種執行模式啟動腳本與命令。

### 參數

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

### 執行模式

| Mode | Behavior | Use Case |
|------|----------|----------|
| `background` | Returns immediately with process_id | Dev servers, watchers, long-running processes |
| `foreground` | Waits for completion, returns exit_code | Build scripts, test runs when you need result |
| `foreground-raw` | Waits and returns full stdout/stderr | Scripts where output content matters |

### 後台啟動開發服務器

最常見工作流——啟動持續運行之開發服務器：

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

**為何用自訂ID**：使用 `"id": "dev-server"` 創建可預測ID供後續命令使用。不設則自動生成如 `dev-abc123` 之ID。

### 前台運行測試

等待測試完成並取得結果：

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

### 取得完整輸出之測試運行

需查看測試失敗或構建錯誤時：

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

### 運行原始命令

非項目腳本之命令：

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

### 帶額外參數運行

向腳本傳遞額外參數：

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

### 禁用自動重啟啟動

後台進程默認崩潰後自動重啟，可禁用：

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

## Proc工具——進程管理

`proc` 工具監控並控制運行中進程。

### 參數

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

### 操作參考

| Action | Description | Required Parameters |
|--------|-------------|---------------------|
| `list` | List all processes | - |
| `status` | Get process state | `process_id` |
| `output` | Get process output | `process_id` |
| `stop` | Stop a process | `process_id` |
| `restart` | Restart a process | `process_id` |
| `autorestart` | Check/toggle auto-restart | `process_id` |
| `cleanup_port` | Kill process on port | `port` |

### 列出運行中進程

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

**注意**：默認僅列當前目錄進程。用 `global: true` 取全部。

### 全局列出所有進程

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

### 取得進程狀態

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

**進程狀態**: `pending`, `starting`, `running`, `stopping`, `stopped`, `failed`

### 取得進程輸出

含過濾選項之近期輸出：

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

### Grep過濾輸出

在測試輸出中找錯誤：

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

### 僅取stderr

用於找錯誤信息：

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

### 排除輸出噪音

過濾冗長日誌：

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

### 優雅停止進程

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

**行為**：發送SIGTERM，等待5秒，仍運行則SIGKILL。

### 強制停止進程

優雅關閉無效時：

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

**行為**：立即SIGKILL。

### 重啟進程

重啟運行中進程（停止後以相同配置啟動）：

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

### 配置自動重啟

檢查或切換進程自動重啟行為：

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

完整選項：
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

### 清理端口

殺死使用指定端口之進程（端口卡住時有用）：

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

## 自動重啟行為

後台進程默認崩潰後自動重啟。重啟速率限制為每分鐘5次，防止崩潰循環。

**啟動時禁用**：`run` 工具用 `no_auto_restart: true`：
```
run {script_name: "dev", id: "dev-server", no_auto_restart: true}
```

**對運行中進程禁用**：`proc` 工具用 `autorestart` 操作：
```
proc {action: "autorestart", process_id: "dev-server", auto_restart_enable: false}
```

**僅在錯誤時重啟**（非正常退出）：用 `only_on_error: true`：
```
proc {action: "autorestart", process_id: "dev-server", auto_restart_enable: true, only_on_error: true}
```

**調整速率限制**：用 `max_restarts` 改變每分鐘限制：
```
proc {action: "autorestart", process_id: "dev-server", max_restarts: 3}
```

---

## Proxy工具——反向代理管理

`proxy` 工具管理添加瀏覽器除錯能力之反向代理。

### 參數

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

### 操作參考

| Action | Description | Required Parameters |
|--------|-------------|---------------------|
| `start` | Start a proxy | `id`, `target_url` |
| `stop` | Stop a proxy | `id` |
| `status` | Get proxy status | `id` |
| `list` | List all proxies | - |
| `exec` | Execute JavaScript | `id`, `code` |
| `toast` | Show browser notification | `id`, `toast_message` |

**重要**：代理可在 `.agnt.kdl` 的 `proxies {}` 塊中配置，含 `url`/`port`、`script`（腳本鏈接用於URL探測）、`url-pattern`、`bind`、`autostart`、`fallback-port`。有明確目標或 `autostart true` 之代理自動啟動。鏈接腳本之代理在腳本URL於輸出中探測到時啟動。

### 啟動代理

啟動指向開發服務器之代理：

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

**端口行為**：未指定時，端口從目標URL確定性哈希（跨重啟穩定）。

### 指定端口啟動代理

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

### 對外訪問啟動代理

用於行動設備測試或分享：

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

### 取得代理狀態

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

### 列出所有代理

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

### 在瀏覽器中執行JavaScript

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

### 截圖

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

### 取得 __devtool API 幫助

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

### 描述特定函數

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

### 顯示Toast通知

在瀏覽器中通知用戶：

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

### 停止代理

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

## Automation工具——無頭瀏覽器

`automation` 工具通過代理啟動無頭Chrome會話，用於自動化瀏覽器測試與互動。

### 啟動自動化會話

啟動指向代理之無頭Chrome：

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

**Response** 包含後續命令用 `session_id`。

### 截圖

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

### 導航至URL

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

### 執行JavaScript

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

## Proxylog工具——流量分析

`proxylog` 工具查詢並分析代理流量日誌。

### 參數

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

### 日誌類型

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

### 查詢所有HTTP流量

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

### 查詢JavaScript錯誤

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

### 查詢失敗API調用

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

### 查詢POST/PUT請求

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

### 查詢近期活動

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

### 取得流量摘要

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

### 取得日誌統計

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

**注意**：`dropped` 表示因緩衝區溢出丟失之條目。默認緩衝區1000條。

### 清除日誌

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

## 常用工作流

### 工作流一：啟動開發環境

最常見工作流——共同啟動開發服務器與代理。腳本從 `package.json`（或同等）自動探測。

**步驟一：探測項目及可用腳本**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "detect",
  "parameters": {}
}
```

**步驟二：後台啟動開發服務器**（使用package.json中的腳本）
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

**步驟三：等待服務器啟動後查看輸出**
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

**步驟四：以target_url啟動代理**（非通過 .agnt.kdl 配置）
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

**結果**：瀏覽器以代理URL（如 http://localhost:12345）開啟，除錯已啟用。

---

### 工作流二：重啟開發服務器

代碼更改後需重啟：

**選項A：用restart操作**（首選）
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

**選項B：手動停止+啟動**

**步驟一：停止運行中服務器**
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

**步驟二：重新啟動服務器（相同ID）**
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

**注意**：代理在目標可用後自動重連。

---

### 工作流三：除錯JavaScript錯誤

**步驟一：查看代理日誌中的錯誤**
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

**步驟二：從流量摘要取得更多上下文**
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

**步驟三：截圖查看當前狀態**
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

### 工作流四：除錯API問題

**步驟一：找出失敗的API調用**
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

**步驟二：查看服務端錯誤**
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

**步驟三：查看相關前端錯誤**
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

### 工作流五：清潔關閉

清潔停止所有進程與代理：

**步驟一：列出運行中進程**
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

**步驟二：停止各進程**
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

**步驟三：停止代理**
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

### 工作流六：多服務編排

含多進程項目（如 .NET後端 + Vite前端），用shell腳本編排器。

**步驟一：創建編排器腳本**（如 `dev-ui.sh`）：

腳本應：
- 啟動前殺死過時端口監聽器
- 依依賴順序啟動服務（先後端）
- 在啟動依賴服務前等待健康檢查
- `dotnet watch` 用 `--no-hot-reload` 防止僵屍監聽器

示例結構：
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

**步驟二：在 package.json 中引用**，使agnt可自動探測：
```json
{
  "scripts": {
    "dev": "bash ./dev-ui.sh"
  }
}
```

**步驟三：用run啟動**
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

**步驟四：為前端啟動代理**
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

**要點**：
- `dotnet watch` 用 `--no-hot-reload` 防熱重載創建持有端口之僵屍進程
- 腳本啟動時殺死過時端口，處理非正常關閉
- 啟動前端前先對後端做健康檢查，避免連接錯誤
- 編排器腳本將多服務合併為單一 `run` 命令

---

## 排障模式

### 問題：端口已佔用

**症狀**：啟動開發服務器時出現 "address already in use" 錯誤

**方案一：殺死使用該端口的進程**
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

**方案二：若無效，查找僵屍進程**
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

### 問題：dotnet watch 僵屍監聽器

**症狀**：停止 `dotnet watch` 後端口仍被佔用。新啟動失敗，報 "address already in use"。

**原因**：啟用熱重載的 `dotnet watch` 可生成在父進程被殺後仍存活的子進程，持有端口。

**預防**：運行 `dotnet watch` 作後台進程時始終用 `--no-hot-reload` 標誌：
```bash
dotnet watch --no-hot-reload --project src/MyApp
```

**修復**：用 `cleanup_port` 殺死僵屍：
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

### 問題：進程啟動即崩潰

**症狀**：進程啟動後立即變為 `failed` 狀態

**步驟一：查看退出碼與狀態**
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

**步驟二：取得完整輸出查看錯誤信息**
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

**步驟三：特別查看stderr**
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

### 問題：代理無法連接

**症狀**：代理已啟動但瀏覽器顯示連接拒絕

**步驟一：查看代理狀態**
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

**步驟二：確認目標服務器運行中**
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

**步驟三：在服務器輸出中確認目標URL**
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

### 問題：進程停不下來

**症狀**：優雅停止超時

**方案：強制殺死**
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

### 問題：丟失進程追蹤

**症狀**：上下文切換後不知什麼在運行

**方案：全局列出所有進程**
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

**同時查看代理**：
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

### 問題：日誌緩衝區已滿

**症狀**：統計中 `dropped` 計數高，日誌丟失

**步驟一：查看當前統計**
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

**步驟二：清除日誌重置緩衝區**
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

**預防**：更頻繁查詢日誌，或在需要時以更大 `max_log_size` 重啟代理。

---

### 問題：查找特定日誌條目

**症狀**：需找特定請求或錯誤

**按URL模式搜尋**：
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

**按時間窗口搜尋**：
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

**組合過濾器**：
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

## 快速參考表

### 運行模式

| Mode | Returns | Blocks | Best For |
|------|---------|--------|----------|
| `background` | process_id, pid | No | Dev servers, watchers |
| `foreground` | exit_code, state, runtime | Yes | Builds, deploys |
| `foreground-raw` | + stdout, stderr | Yes | Tests, debugging |

### 進程狀態

| State | Meaning | Can Stop? |
|-------|---------|-----------|
| `pending` | Created, not started | Yes |
| `starting` | Launching | Yes |
| `running` | Active | Yes |
| `stopping` | Shutting down | No |
| `stopped` | Clean exit | No |
| `failed` | Crashed/error | No |

### 代理配置

| Setting | Default | Notes |
|---------|---------|-------|
| Port | Hash-based | Stable across restarts |
| Bind Address | `127.0.0.1` | Use `0.0.0.0` for LAN |
| Log Buffer | 1000 entries | Circular buffer |
| Max Body Log | 10KB | Truncated in logs |

### 輸出過濾

| Parameter | Effect | Example |
|-----------|--------|---------|
| `tail` | Last N lines | `tail: 20` |
| `head` | First N lines | `head: 10` |
| `grep` | Include matching | `grep: "ERROR|WARN"` |
| `grep_v` | Exclude matching | `grep_v: true` |
| `stream` | Select stream | `stream: "stderr"` |
