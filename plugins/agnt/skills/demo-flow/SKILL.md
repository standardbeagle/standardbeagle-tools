---
name: agnt-demo-flow
description: "Record + replay interactive guided DEMO of shipped work — floating self-advancing walkthrough narrating each step, spotlighting live app element with labelled animated gesture affordances (hover/click/scroll/drag), advancing on timer, click, or app-state condition. 在瀏覽器疊層錄製可重播之互動導覽。 Use when: demo a feature, create walkthrough, run walkthrough tool, guided product tour, replay a flow, show what was built, onboarding tour, step-by-step demo overlay."
---

# 互動導覽技能 — Demo Flow / Walkthrough

`walkthrough` 工具在瀏覽器疊層彈出浮動、自捲之步驟清單：逐步敘述、高亮對應 app 元素、按計時/點擊/狀態條件推進。步可攜 `gesture`（hover/click/scroll/drag），於高亮上渲染動畫示意並附文字標籤（`gesture_label` 具名此步實際動作），步進自消；當前步敘述逐字顯現。把「我做了什麼」變成可點擊之導覽。已載入之腳本於疊層留重播啟動器，可日後重跑。

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
      "gesture": "click",
      "gesture_label": "Click to open your cart",
      "advance": { "type": "click-target" }
    },
    {
      "title": "Apply coupon",
      "body": "Coupon field now validates inline.",
      "target": ".coupon-input",
      "gesture": "hover",
      "gesture_label": "Watch the inline check",
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

- `type: "auto"` — 顯示 `ms` 毫秒後自動進；略 `ms` 則預設 5000。
- `type: "click-target"` — 用戶點高亮之 `target` 元素時進。
- `type: "wait"` — app 狀態滿足時進。`when`：`"url-contains"` / `"element-present"` / `"element-visible"`；`value`：匹配字串/選擇器。

`target`（選填）：高亮之 CSS 選擇器。略則步驟僅敘述、不高亮。

### gesture 語意 — Gesture affordances

`gesture`（選填，須配 `target`）：於高亮上渲染對應動畫示意，步進時自動消失。

- `"hover"` — 脈動圓點於目標中心（示懸停）。
- `"click"` — 雙漣漪環自中心擴散（示點擊）。
- `"scroll"` — 滑鼠滾輪形，輪點上下滑動（示滾動）。
- `"drag"` — 軌線上圓塊左右拖行（示拖拽）。

未知 gesture 拒載（`load`/`start` 回 error）；`prefers-reduced-motion` 下渲染靜態形。當前步之 `body` 敘述逐字顯現（read-through 動畫），引觀者目光隨文而動。

### gesture_label 語意 — Affordance text label

示意下方恆有文字標籤，使動畫形讀作「指示」而非「可點控件」。

`gesture_label`（選填，須配 `gesture`，上限 64 字元）：以此步真實動作命名，取代通用動詞短語。

| gesture | 略 `gesture_label` 之預設 | 宜寫之 `gesture_label` |
|---|---|---|
| `hover` | `Hover here` | `Hover the price to see the breakdown` |
| `click` | `Click here` | `Click to open your cart` |
| `scroll` | `Scroll this area` | `Scroll to the shipping section` |
| `drag` | `Drag to move` | `Drag the handle to reorder` |

寫法訣：**動詞 + 受詞 + 果**（"Click to open your cart"），非裸動詞（"Click"）。指名畫面上真有之物，令觀者不必猜高亮框何指。超長拒載（`load`/`start` 回 error，不截斷）；含控制字元拒載；標籤為單行不換行，故宜短（一短句）。發佈之公開導覽同讀此欄，唯超長者截斷而非報錯（公開頁不得崩）。

選 `advance` 訣：用戶須動作 → `click-target`；待非同步結果（路由變、元素現）→ `wait`；純敘述節奏 → `auto`。互動步宜配同義 `gesture`：`click-target` 配 `"click"`，待滾動之步配 `"scroll"`。

## 流程 — Workflow

1. 確認代理運行且站點已連接（`agnt:current-page`）。
2. 寫腳本：每步一 `title` + `body`，互動步配 `target` + 同義 `gesture` + 具名 `gesture_label` + 合宜 `advance`。
3. `load` 預覽（留啟動器）或 `start` 直播。錄製/展示用 `manual`，無人值守演示用 `auto`。
4. 直播中（`auto`/`wait` 推進）以 `proxylog {proxy_id, types:["walkthrough"]}` 追每步 `step`/`finish`/`warning` 事件即時知用戶所在，非只靠一次性 `status`。
5. `status` / `list` 查態，`stop` 收尾。
