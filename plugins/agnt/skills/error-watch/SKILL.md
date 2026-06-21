---
name: agnt-error-watch
description: "Stream errors from proxies and processes in real time via agnt watch + Monitor - Claude reacts instantly when problems appear. 透過agnt watch + Monitor即時串流代理與進程錯誤，問題出現當下即響應。 Use when: real-time error stream, watch for errors, monitor errors live, error notification, instant error detection"
disable-model-invocation: true
---

# 錯誤監視技能

持續串流錯誤（JS執行時、HTTP 5xx/4xx、進程編譯錯誤、代理診斷），在發生當下即響應，無需以 `get_errors` 輪詢。問題出現瞬間即通知Claude。

**模式：** `run`（或 `proxy start`）→ `watch` → `Monitor`。

**需求：** Claude Code客戶端含 `Monitor` 工具（背景進程串流）。無Monitor之舊版客戶端須退而使用 `error-monitor` 技能中基於 `schedule` 之輪詢。

---

## 步驟一：向agnt請求命令

呼叫 `watch` 工具。它回傳含正確socket路徑與篩選器之即用 `agnt monitor` 命令字串。

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "watch",
  "parameters": {
    "target": "errors",
    "proxy_id": "dev"
  }
}
```

回應：

```json
{
  "command": "/home/user/.local/bin/agnt monitor --socket /run/user/1000/agnt.sock --types error,diagnostic --proxy dev --format compact",
  "description": "Errors on proxy dev"
}
```

`proxy_id` 可選。省略則監視所有代理與受管進程之錯誤。

---

## 步驟二：以該命令啟動Monitor

將回傳之 `command` 傳給 `Monitor` 工具作長期執行背景串流。Monitor以通知送達每一新行，Claude可即時響應而不阻塞。

```
Monitor({
  command: "/home/user/.local/bin/agnt monitor --socket /run/user/1000/agnt.sock --types error,diagnostic --proxy dev --format compact",
  cwd: "/home/user/project"
})
```

切勿手工構造此命令。始終取用 `watch` 回應中之字串——其嵌入當前session之正確daemon socket。

---

## 步驟三：響應串流事件

每行為一個錯誤，精簡格式：

```
[error] proxy=dev browser:js TypeError: Cannot read property 'map' of undefined (src/components/List.tsx:42:15)
[error] proxy=dev http 500 POST /api/users "database connection timeout"
[diagnostic] process=app panic: runtime error: invalid memory address
```

新行到達時：
1. 若為JS錯誤，呼叫 `get_errors {proxy_id:"dev", since:"1m", raw:true}` 取完整堆疊。
2. 若為5xx，呼叫 `proxylog {proxy_id:"dev", types:["http"], status_codes:[500]}` 取請求/回應主體。
3. 若為進程 `diagnostic`，呼叫 `proc {action:"output", process_id:"app", tail:200, grep:"error|panic"}`。
4. 修復根因，然後保持Monitor運行——不要因看到錯誤就重啟它。

---

## 端對端範例

用戶：「啟動開發伺服器，一旦崩潰立刻告訴我。」

```
# 1. Boot the dev server
mcp__plugin_slop-mcp_slop-mcp__execute_tool { mcp_name:"agnt", tool_name:"run",
  parameters:{ script_name:"dev", mode:"background", id:"app" } }

# 2. Front it with a proxy
mcp__plugin_slop-mcp_slop-mcp__execute_tool { mcp_name:"agnt", tool_name:"proxy",
  parameters:{ action:"start", id:"dev", target_url:"http://localhost:3000" } }

# 3. Ask agnt for the monitor command
mcp__plugin_slop-mcp_slop-mcp__execute_tool { mcp_name:"agnt", tool_name:"watch",
  parameters:{ target:"errors", proxy_id:"dev" } }

# 4. Start Monitor with the returned command
Monitor({ command: "<paste command from step 3>", cwd: "." })
```

此後，每個JS異常、5xx與進程panic均以Monitor通知到達。

---

## `watch` target參考

| target | Event types | Required params |
|--------|-------------|-----------------|
| `errors` | `error`, `diagnostic` | none（proxy_id可選） |
| `interactions` | `panel_message`, `interaction`, `sketch` | none（proxy_id可選）—見 `event-watch` 技能 |
| `process` | `process` 輸出 | `process_id` 必填 |
| `all` | 所有類型 | none |

僅此四個target有效。勿自創新target。

---

## 舊版客戶端備用

客戶端無Monitor工具（v2.1.98前或非Claude Code客戶端），退而使用 `error-monitor` 技能中基於 `schedule` 之輪詢迴圈。Monitor嚴格優先，因其即時送達錯誤而非固定輪詢間隔。

---

## 相關技能

> Invoke the `Skill` tool with `skill: agnt:error-monitor` — 即時點查 `get_errors` 與輪詢備用。

> Invoke the `Skill` tool with `skill: agnt:event-watch` — 相同模式，用於用戶互動（面板訊息、草圖、設計對話）。

> Invoke the `Skill` tool with `skill: agnt:process-proxy` — 設定受監視target所用之 `run` 與 `proxy` 工具。
