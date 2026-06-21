---
name: agnt-demo-flow
disable-model-invocation: true
description: "Record and replay an interactive guided DEMO of work just shipped — a floating, self-advancing walkthrough that narrates each step, spotlights the live app element, and advances on timer, click, or app-state condition. Turn 'here's what I built' into a clickable tour. 在瀏覽器疊層錄製可重播之互動導覽。 Use when: demo a feature, create a walkthrough, guided product tour, replay a flow, show what was built, onboarding tour, step-by-step demo overlay"
---

# 互動導覽技能 — Demo Flow / Walkthrough

`walkthrough` 工具在瀏覽器疊層彈出浮動、自捲之步驟清單：逐步敘述、高亮對應 app 元素、按計時/點擊/狀態條件推進。把「我做了什麼」變成可點擊之導覽。已載入之腳本於疊層留重播啟動器，可日後重跑。

所有動作經 agnt MCP `walkthrough` 工具，內部對 chrome-frame 之 `window.__devtool.walkthrough.*` 派發。

## 呼叫格式

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "walkthrough",
  "parameters": {
    "action": "<action>",
    "id": "<proxy_id>",
    ...
  }
}
```

`proxy_id` 亦接受 `id`。

## 動作 — Actions

| action | 用 |
|---|---|
| `load` | 註冊腳本不啟動（疊層顯重播啟動器） |
| `start` | 開始播放（inline `script` 或 `script_id`）；`mode` 定自動/手動 |
| `stop` | 結束並隱藏面板 |
| `next` / `prev` | 手動逐步 |
| `play` / `pause` | 控自動推進 |
| `status` | 查當前步/模式/運行態 |
| `list` | 列所有已註冊腳本 |

- `mode`（`start` 用）：`"auto"`（自動播放，預設）或 `"manual"`（用戶以 next/prev 步進）。
- `script_id`（`start` 用）：啟動既載腳本。

## 腳本結構 — Script shape

`load` / `start` 之 `script`：

```json
{
  "id": "demo-checkout",
  "title": "New Checkout Flow",
  "steps": [
    {
      "title": "Open cart",
      "body": "Click the cart icon to review items.",
      "target": "#cart-button",
      "advance": { "type": "click-target" }
    },
    {
      "title": "Apply coupon",
      "body": "Coupon field now validates inline.",
      "target": ".coupon-input",
      "advance": { "type": "wait", "when": "element-visible", "value": ".coupon-success" }
    },
    {
      "title": "Done",
      "body": "Order confirmed.",
      "advance": { "type": "auto", "ms": 4000 }
    }
  ]
}
```

### advance 語意 — Advance semantics

- `type: "auto"` — 顯示 `ms` 毫秒後自動進。
- `type: "click-target"` — 用戶點高亮之 `target` 元素時進。
- `type: "wait"` — app 狀態滿足時進。`when`：`"url-contains"` / `"element-present"` / `"element-visible"`；`value`：匹配字串/選擇器。

`target`（選填）：高亮之 CSS 選擇器。略則步驟僅敘述、不高亮。

## 流程 — Workflow

1. 確認代理運行且站點已連接（`agnt:current-page`）。
2. 寫腳本：每步一 `title` + `body`，互動步配 `target` + 合宜 `advance`。
3. `load` 預覽（留啟動器）或 `start` 直播。錄製/展示用 `manual`，無人值守演示用 `auto`。
4. `status` / `list` 查態，`stop` 收尾。

選 `advance` 訣：用戶須動作 → `click-target`；待非同步結果（路由變、元素現）→ `wait`；純敘述節奏 → `auto`。
