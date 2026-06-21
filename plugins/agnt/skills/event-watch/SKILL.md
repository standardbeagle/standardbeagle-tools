---
name: agnt-event-watch
description: "Stream user interactions from browser overlay in real time via agnt watch + Monitor - panel messages, clicks, sketches, design chats. 透過agnt watch + Monitor即時串流瀏覽器覆蓋層用戶互動：面板訊息、點擊、草圖、設計對話。 Use when: watch user interactions, real-time browser events, panel message stream, sketch events, design mode stream"
disable-model-invocation: true
---

# 事件監視技能

持續串流來自浮動指示器、草圖模式與設計模式之用戶互動——讓瀏覽器無需輪詢即可與Claude雙向溝通。此為 run → watch → Monitor 模式之雙向半段。

**模式：** `proxy start` → `watch` → `Monitor`。

**需求：** Claude Code客戶端含 `Monitor` 工具。舊版客戶端須改以帶類型篩選器之 `proxylog` 輪詢。

---

## 此串流傳遞之內容

`target: "interactions"` 訂閱用戶與覆蓋層互動時 `window.__devtool` 發出之三種事件類型：

| Event type | Source | Typical payload |
|------------|--------|-----------------|
| `panel_message` | 用戶輸入至浮動指示器聊天框 | `{text, page_url, selected_element?}` |
| `interaction` | 用戶點擊指示器以選取元素或截圖 | `{event_type, target, position, screenshot_id?}` |
| `sketch` | 用戶從草圖模式儲存線框 | `{elements, json}` |

設計模式事件（`design_state`, `design_request`, `design_chat`）亦透過共享類別流過 `interactions` 頻道。

---

## 步驟一：向agnt請求命令

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "watch",
  "parameters": {
    "target": "interactions",
    "proxy_id": "dev"
  }
}
```

回應：

```json
{
  "command": "/home/user/.local/bin/agnt monitor --socket /run/user/1000/agnt.sock --types panel_message,interaction,sketch --proxy dev --format compact",
  "description": "User interactions on proxy dev"
}
```

`proxy_id` 可選。省略則監視所有代理之互動。

---

## 步驟二：以該命令啟動Monitor

```
Monitor({
  command: "/home/user/.local/bin/agnt monitor --socket /run/user/1000/agnt.sock --types panel_message,interaction,sketch --proxy dev --format compact",
  cwd: "/home/user/project"
})
```

始終使用 `watch` 回傳之確切命令——其編碼了正確daemon socket與事件類型篩選器。

---

## 步驟三：響應每個事件

每行為一次互動：

```
[panel_message] proxy=dev "The header overlaps the nav on mobile"
[interaction] proxy=dev click target=button.cta position=(312,178)
[sketch] proxy=dev elements=8 saved
```

典型響應：
- **`panel_message`** — 用戶請求變更。讀取頁面上下文（`currentpage` 或 `proxylog {types:["panel_message"]}` 取完整載荷），然後編輯程式碼並重新載入。
- **`interaction`** 含截圖 — 透過 `proxylog {types:["screenshot"]}` 取截圖，分析用戶所指。
- **`sketch`** — 透過 `proxylog {types:["sketch"]}` 導出線框JSON，轉譯為實際標記/樣式。
- **`design_chat`** — 視為設計模式中的對話輪次；透過proxy `exec` API以替代方案回應。

跨所有事件保持Monitor運行——單次設計審查session可能發出數十個事件。

---

## 端對端範例

用戶：「我要點擊運行中的應用並輸入指示器——一邊報一邊修。」

```
# 1. Assume a dev server is already running as process "app"
mcp__plugin_slop-mcp_slop-mcp__execute_tool { mcp_name:"agnt", tool_name:"proxy",
  parameters:{ action:"start", id:"dev", target_url:"http://localhost:3000" } }

# 2. Ask agnt for the interactions monitor command
mcp__plugin_slop-mcp_slop-mcp__execute_tool { mcp_name:"agnt", tool_name:"watch",
  parameters:{ target:"interactions", proxy_id:"dev" } }

# 3. Start Monitor with the returned command
Monitor({ command: "<paste command from step 2>", cwd: "." })
```

此後，每個面板訊息、點擊、截圖與已儲存草圖均以Monitor通知到達。

---

## 同時監視錯誤與互動

啟動兩個Monitor——一個用 `target: "errors"`（見 `error-watch` 技能），一個用 `target: "interactions"`。它們使用相同daemon socket但不同事件類型篩選器，互不衝突。

若需單一全部串流，改用 `target: "all"` 並在客戶端篩選。

---

## 舊版客戶端備用

無Monitor時，透過 `proxylog` 輪詢相關類型：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["panel_message","interaction","sketch"]
  }
}
```

配合 `schedule` 技能按固定間隔重複查詢。有Monitor可用時仍嚴格優先。

---

## 相關技能

> Invoke the `Skill` tool with `skill: agnt:error-watch` — 相同模式，用於錯誤與診斷。

> Invoke the `Skill` tool with `skill: agnt:interaction-tracking` — 互動歷史與DOM變動之按需查詢。

> Invoke the `Skill` tool with `skill: agnt:sketch-visual` — 提取與使用已儲存草圖。
