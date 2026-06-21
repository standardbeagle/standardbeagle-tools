---
name: agnt-error-monitor
description: "Cross-proxy/process error check with aggregation, dedup, periodic monitoring — not bash grep -r error / tail -f / journalctl -f / curl probes. 跨代理進程聚合去重監控錯誤。 Use when: check errors, monitor errors, browser errors, HTTP errors, process errors, error summary/dashboard, before bash grep/tail on logs"
disable-model-invocation: true
---

# 錯誤監控技能

一次查詢跨瀏覽器JavaScript、HTTP回應、進程輸出與代理診斷之錯誤。

## 代Bash之場景 — Instead of raw bash

agnt聚合前端JS、HTTP回應、進程stderr、代理診斷於一查詢，去重堆疊、濾噪音、跨源關聯。bash分散檢索遺漏關聯且噪音滿溢。

| Bash反模式 Anti-pattern | 代以agnt工具 Replacement |
|---|---|
| `grep -r 'error' logs/` | `get_errors {}` |
| `tail -f app.log \| grep -i error` | `watch {target: "errors"}` + `Monitor` 工具 |
| `journalctl -f -u service` | `proc {action: "output", process_id, grep: "error", stream: "stderr"}` |
| `curl -w '%{http_code}' http://localhost/...` | `proxylog {proxy_id, types: ["http"], status_codes: [500]}` |
| 人工瀏覽console | `get_errors {proxy_id}` (捕 `window.onerror`) |
| `grep -c FAIL test-output.log` | `proc {action: "output", grep: "FAIL\\|ERROR"}` |

**為何棄bash**：agnt去重（相同錯誤合併計數）、精簡堆疊（跳過`node_modules`）、濾雜訊（忽略HMR/favicon/301）、標記來源（browser:js、proxy:http、process:<id>）。bash grep無此智慧。

## 快速檢查

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {}
}
```

回傳精簡輸出：

```
=== Errors (2) ===

[browser:js] TypeError (3x, latest 5s ago)
  Cannot read property 'map' of undefined
  → src/components/List.tsx:42:15

[proxy:http] 500 Internal Server Error (1x, 12s ago)
  POST /api/users → "database connection timeout"
```

---

## 參數

| Parameter | Default | Description |
|-----------|---------|-------------|
| `proxy_id` | all | 篩選至特定代理 |
| `process_id` | all | 篩選至特定進程 |
| `since` | none | 時間篩選：`"5m"`, `"1h"`, RFC3339時間戳 |
| `include_warnings` | true | 含4xx HTTP及警告 |
| `limit` | 25 | 最大結果數 |
| `raw` | false | 回傳完整JSON |

---

## 常見查詢

**僅近期錯誤：**
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

**僅錯誤，不含警告：**
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

**特定代理：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
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
  "tool_name": "get_errors",
  "parameters": {
    "raw": true,
    "limit": 50
  }
}
```

---

## 錯誤來源

| Source | Label | Captures |
|--------|-------|----------|
| Browser JS | `browser:js` | 透過 `window.onerror` 之執行時異常 |
| HTTP | `proxy:http` | 4xx（警告）與5xx（錯誤）回應 |
| Process | `process:<id>` | 編譯錯誤、panic、異常 |
| Proxy | `proxy:diagnostic` | 傳輸與連線失敗 |
| Custom | `browser:custom` | `__devtool.log("error", msg)` 呼叫 |

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

客戶端無 `Monitor` 工具（v2.1.98前或非Claude Code客戶端），退而以 `schedule` 工具週期執行 `get_errors`：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "schedule",
  "parameters": {
    "delay_seconds": 30,
    "message": "Run get_errors {} and report any new errors found"
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

2. **變更後檢查錯誤：**
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "get_errors",
     "parameters": {
       "since": "1m"
     }
   }
   ```

3. **深入瀏覽器錯誤：**
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "get_errors",
     "parameters": {
       "proxy_id": "dev",
       "raw": true
     }
   }
   ```

4. **檢查進程編譯錯誤：**
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "get_errors",
     "parameters": {
       "process_id": "app",
       "include_warnings": false
     }
   }
   ```

---

## 內建智慧

**去重：** 相同錯誤合併。計數顯示發生次數。

**堆疊追蹤精簡：** 僅顯示第一個應用框架，略過 `node_modules/`、`webpack/`、執行時。

**雜訊過濾：** 忽略301/302/304、`.map` 404、favicon 404、webpack HMR。

---

## 與其他技能整合

### 視覺診斷前

先檢查錯誤：

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

若有錯誤，先修復再審查佈局。

### 配合響應式檢查

執行 `checkResponsiveRisk()` 後，查控制台錯誤以確認是否有響應式JS失敗：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "proxy_id": "dev",
    "since": "2m"
  }
}
```

### 配合當前頁面

檢查頁面時一併查錯誤：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "proxy_id": "dev",
    "include_warnings": false
  }
}
```

### 完整稽核

綜合稽核中含錯誤檢查：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "limit": 50
  }
}
```

再透過proxy exec工具執行 `__devtool_audit.auditPageQuality()`。

---

## 與代理日誌關聯

深入調查時：

**聚合錯誤：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
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

`raw: true` 時：

```json
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

---

## 快速參考

| Query | Description | Tool + Key Parameters |
|-------|-------------|----------------------|
| 所有錯誤 | 查全部 | `get_errors` with `{}` |
| 近期（5分鐘） | 5m前以來之錯誤 | `get_errors` with `since: "5m"` |
| 僅錯誤 | 排除4xx警告 | `get_errors` with `include_warnings: false` |
| 特定代理 | 限定某代理範圍 | `get_errors` with `proxy_id: "dev"` |
| 完整詳情 | 原始JSON輸出 | `get_errors` with `raw: true` |

所有查詢使用 `mcp__plugin_slop-mcp_slop-mcp__execute_tool`，`mcp_name: "agnt"`, `tool_name: "get_errors"`。

---

## 相關技能

> Invoke the `Skill` tool with `skill: agnt:error-watch` — 透過Monitor即時串流錯誤（優先於輪詢）。

> Invoke the `Skill` tool with `skill: agnt:event-watch` — 從瀏覽器覆蓋層串流用戶互動。

> Invoke the `Skill` tool with `skill: agnt:browser-debug` — 檢測引發錯誤之元素。

> Invoke the `Skill` tool with `skill: agnt:current-page` — 取錯誤調查之頁面上下文。

> Invoke the `Skill` tool with `skill: agnt:visual-diagnostics` — 修復錯誤後除錯佈局。
