---
name: agnt-error-monitor
description: "Cross-source incident inbox check with dedup, priority ordering, remediation hints, periodic monitoring — not bash grep -r error / tail -f / journalctl -f / curl probes. 跨源事件收件匣去重監控。 Use when: check errors, monitor errors, browser errors, HTTP errors, process errors, error summary/dashboard, before bash grep/tail on logs"
disable-model-invocation: true
---

# 錯誤監控技能

一次查詢跨瀏覽器JavaScript、HTTP回應、進程輸出與代理診斷之事件收件匣（incident inbox）。

## 代Bash之場景 — Instead of raw bash

agnt聚合前端JS、HTTP回應、進程stderr、代理診斷於一收件匣，去重堆疊、優先排序、附修復提示、跨源關聯。bash分散檢索遺漏關聯且噪音滿溢。

| Bash反模式 Anti-pattern | 代以agnt工具 Replacement |
|---|---|
| `grep -r 'error' logs/` | `get_incidents {}` |
| `tail -f app.log \| grep -i error` | `watch {target: "errors"}` + `Monitor` 工具 |
| `journalctl -f -u service` | `proc {action: "output", process_id, grep: "error", stream: "stderr"}` |
| `curl -w '%{http_code}' http://localhost/...` | `proxylog {proxy_id, types: ["http"], status_codes: [500]}` |
| 人工瀏覽console | `get_incidents {proxy_id}` (捕 `window.onerror`) |
| `grep -c FAIL test-output.log` | `proc {action: "output", grep: "FAIL\\|ERROR"}` |

**為何棄bash**：agnt去重（相同事件合併計數、指紋定址）、優先分帶（critical/error/warning/info）、附修復提示（`next:` 工具與技藝）、標記來源（browser_js、http_5xx、process_crash…）。bash grep無此智慧。

## 快速檢查

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {}
}
```

回傳精簡輸出：

```
=== Incidents (2) === [inbox: crit=0 err=2 warn=0 info=0 new=2]

[error:browser_js] TypeError (3x, 5s ago)
  id: 3f9a1c07e2b4d886
  Cannot read property 'map' of undefined
  at: src/components/List.tsx:42:15
  → http://localhost:3000/dashboard
  next: currentpage {action:"get"}

[error:http_5xx] 500 (1x, 12s ago)
  id: 9c22e0517ab3f1d4
  POST /api/users → "database connection timeout"
  next: proxylog {proxy_id:"dev", types:["http"], status_codes:[500]}

=== Next ===
tool: proxylog {proxy_id:"dev"}
```

`id:` 為指紋（fingerprint）— pin/unpin 之定址目標。輸出含 `!! PARTIAL VIEW` 段時，視圖不全（bus溢出或blob逐出），事件有缺席。

---

## 參數

| Parameter | Default | Description |
|-----------|---------|-------------|
| `action` | `query` | `query` / `pin` / `unpin` / `clear`（保留與清退） |
| `error_id` | none | pin/unpin 目標指紋 |
| `severity` | all | 篩選：`["critical","error","warning","info"]` 任意子集 |
| `since` | none | 前次拉取之游標（RFC3339）或時距 `"5m"` |
| `sources` | all | 篩源：`browser_js`/`http_5xx`/`http_4xx`/`transport_err`/`proxy_diag`/`process_alert`/`process_crash`/`build_fail`/`port_conflict`/`shutdown`/`hook_stop_failure` |
| `proxy_id` | all | 篩選至特定代理 |
| `process_id` | all | 篩選至特定進程 |
| `detail` | `summary` | `full` 自blob store水合完整payload（盡力而為） |
| `mark_read` | false | 推進游標、標記已讀 |
| `limit` | 20 | 最大結果數（上限100） |
| `raw` | false | 回傳完整JSON |

收件匣每會話硬隔離——無 `global` 參數；隔離保證強於項目範圍。

---

## 常見查詢

**僅近期事件：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {
    "since": "5m"
  }
}
```

**僅錯誤，不含警告：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {
    "severity": ["critical", "error"]
  }
}
```

**特定代理：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {
    "proxy_id": "dev"
  }
}
```

**完整JSON供分析：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {
    "raw": true,
    "limit": 50
  }
}
```

**增量排空（游標循環）：** 每次回應含 `replay_cursor`；下次以 `since: "<cursor>"` + `mark_read: true` 拉取，僅得新事件。收件匣每帶上限100條，舊者被逐——輪詢須以游標排空。

**保留重要事件：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {
    "action": "pin",
    "error_id": "<fingerprint>",
    "tag": "root-cause candidate"
  }
}
```

pin 使事件越過逐出與保留清退（build成功、proc停止、會話終了之自動清退）存活；`action: "clear"` 清退未pin事件。

---

## 事件來源

| Source | Severity | Captures |
|--------|----------|----------|
| `browser_js` | error | 透過 `window.onerror` 之執行時異常（含 `context.location` `file:line:col` 與 `frame_id`） |
| `http_5xx` / `http_4xx` | error / warning | 代理HTTP回應 |
| `transport_err` / `proxy_diag` | error | 傳輸與連線失敗、代理診斷 |
| `process_alert` / `process_crash` / `build_fail` | warning–critical | 進程輸出告警、崩潰、編譯失敗 |
| `port_conflict` / `shutdown` / `hook_stop_failure` | varies | 埠衝突、關停事件、hook失敗 |

同一錯誤發於兩個content frame為兩事件（frame屬指紋之一部）。

---

## 持續監控

### 首選：透過Monitor即時串流

即時錯誤偵測用 `error-watch` 技能。該技能向agnt `watch` 工具請求monitor命令，再透過Claude Code `Monitor` 工具串流錯誤，每個新錯誤即時以通知送達，無需等待下次輪詢。

```
# 1. Ask agnt for the command
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "watch",
  "parameters": { "target": "errors", "proxy_id": "dev" }
}

# 2. Pipe the returned command into Monitor
Monitor({ command: "<command from step 1>", cwd: "." })
```

> Invoke the `Skill` tool with `skill: agnt:error-watch` — 完整模式、target參考、事件處理指引。Monitor嚴格優先，因錯誤在發生瞬間送達而非固定輪詢間隔。

### 備用：排程輪詢

客戶端無 `Monitor` 工具（v2.1.98前或非Claude Code客戶端），退而以 `schedule` 工具週期執行 `get_incidents`：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "schedule",
  "parameters": {
    "delay_seconds": 30,
    "message": "Run get_incidents {since: \"<last replay_cursor>\", mark_read: true} and report any new incidents found"
  }
}
```

此為備用——有Monitor可用時優先使用 `error-watch`。

### 開發工作流

1. **啟動開發環境：**

   啟動開發伺服器：
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "run",
     "parameters": {
       "script_name": "dev",
       "id": "app"
     }
   }
   ```

   啟動代理：
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "proxy",
     "parameters": {
       "action": "start",
       "target_url": "http://localhost:3000",
       "id": "dev"
     }
   }
   ```

2. **變更後檢查事件：**
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "get_incidents",
     "parameters": {
       "since": "1m"
     }
   }
   ```

3. **深入瀏覽器錯誤（水合完整payload）：**
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "get_incidents",
     "parameters": {
       "proxy_id": "dev",
       "detail": "full",
       "raw": true
     }
   }
   ```

4. **檢查進程編譯錯誤：**
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "get_incidents",
     "parameters": {
       "process_id": "app",
       "severity": ["critical", "error"]
     }
   }
   ```

---

## 內建智慧

**去重：** 相同事件按指紋合併。計數顯示發生次數。

**優先分帶：** critical/error/warning/info 四帶，各帶上限100條，臨界者先出。

**修復提示：** 每事件附 `next:` 首選工具與 `skill:` 技藝提示；聚合 `=== Next ===` 段列主導修復路徑。

**誠實不全：** `collection_warnings` 明示視圖缺失（bus溢出丟棄、blob無法水合）——靜默缺席禁絕。

---

## 與其他技能整合

### 視覺診斷前

先檢查事件：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {
    "severity": ["critical", "error"]
  }
}
```

若有錯誤，先修復再審查佈局。

### 配合響應式檢查

執行 `checkResponsiveRisk()` 後，查控制台錯誤以確認是否有響應式JS失敗：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {
    "proxy_id": "dev",
    "since": "2m"
  }
}
```

### 配合當前頁面

檢查頁面時一併查事件：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {
    "proxy_id": "dev",
    "severity": ["critical", "error"]
  }
}
```

### 完整稽核

綜合稽核中含事件檢查：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {
    "limit": 50
  }
}
```

再透過proxy exec工具執行 `__devtool.auditPageQuality()`。

---

## 與代理日誌關聯

深入調查時：

**收件匣事件：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {
    "proxy_id": "dev"
  }
}
```

**原始HTTP流量取上下文（500s）：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["http"],
    "status_codes": [500]
  }
}
```

**原始前端錯誤條目：**
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

---

## 原始JSON輸出

`raw: true` 時（要點欄位）：

```json
{
  "incidents": [
    {
      "id": "3f9a1c07e2b4d886",
      "fingerprint": "3f9a1c07e2b4d886",
      "severity": "error",
      "source": "browser_js",
      "category": "TypeError",
      "summary": "Cannot read property 'map' of undefined",
      "count": 3,
      "context": {
        "location": "src/components/List.tsx:42:15",
        "url": "http://localhost:3000/dashboard",
        "frame_id": "content-1"
      },
      "remediation": {"primary_tool": "currentpage"},
      "read": false
    }
  ],
  "inbox_after": {"critical": 0, "error": 1, "warning": 0, "info": 2},
  "replay_cursor": "2026-08-04T21:00:00Z",
  "collection_warnings": []
}
```

---

## 快速參考

| Query | Description | Tool + Key Parameters |
|-------|-------------|----------------------|
| 所有事件 | 查全部 | `get_incidents` with `{}` |
| 近期（5分鐘） | 5m前以來之事件 | `get_incidents` with `since: "5m"` |
| 僅錯誤 | 排除警告帶 | `get_incidents` with `severity: ["critical","error"]` |
| 特定代理 | 限定某代理範圍 | `get_incidents` with `proxy_id: "dev"` |
| 完整詳情 | 原始JSON+payload水合 | `get_incidents` with `raw: true, detail: "full"` |
| 保留事件 | 越過逐出存活 | `get_incidents` with `action: "pin", error_id` |
| 增量排空 | 游標循環 | `get_incidents` with `since: "<replay_cursor>", mark_read: true` |

所有查詢使用 `mcp__plugin_slop-mcp_slop-mcp__execute_tool`，`mcp_name: "agnt"`, `tool_name: "get_incidents"`。

---

## 相關技能

錯誤技能三態軸：**快照 snapshot** / **聚合 aggregate** / **串流 stream**。此技能為**聚合**——`get_incidents` 收件匣跨源去重、優先排序。

> Invoke the `Skill` tool with `skill: agnt:check-errors` — **快照**：單一代理 `proxylog` 點查。

> Invoke the `Skill` tool with `skill: agnt:error-watch` — **串流**：`watch` + Monitor 即時推送（優先於輪詢）。

> Invoke the `Skill` tool with `skill: agnt:event-watch` — 從瀏覽器覆蓋層串流用戶互動。

> Invoke the `Skill` tool with `skill: agnt:browser-debug` — 檢測引發錯誤之元素。

> Invoke the `Skill` tool with `skill: agnt:current-page` — 取錯誤調查之頁面上下文。

> Invoke the `Skill` tool with `skill: agnt:visual-diagnostics` — 修復錯誤後除錯佈局。
