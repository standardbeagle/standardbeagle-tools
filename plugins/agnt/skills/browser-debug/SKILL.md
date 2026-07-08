---
name: agnt-browser-debug
description: "Complete browser debugging workflow - element inspection, layout diagnostics, interaction tracking, visual tools via agnt proxy. 完整瀏覽器除錯工作流：元素檢測、佈局診斷、互動追蹤、視覺工具。 Use when: debug browser issue, inspect element, fix layout, debug click, debug form, debug modal, browser debugging workflow"
---

# 瀏覽器除錯技能

以agnt瀏覽器整合提供完整除錯工作流。合併元素檢測、佈局診斷、互動追蹤與視覺工具至實用除錯情境。

## 前提條件

代理必須運行且瀏覽器已連接：

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

---

## 首要：檢查錯誤

除錯前先查現有錯誤：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {"proxy_id": "dev", "include_warnings": false}
}
```

若有錯誤，先行調查。錯誤往往是視覺問題之根因。

---

## 快速開始：除錯任何問題

### 步驟一：了解當前狀態

截圖並取頁面上下文：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('debug-state')"
  }
}
```

### 步驟二：檢查JavaScript錯誤

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

### 步驟三：執行佈局診斷

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.diagnoseLayout()"
  }
}
```

---

## 元素檢測工具箱

### 檢測任何元素

取特定元素完整資訊：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.inspect('#problem-element')"
  }
}
```

回傳：info、position、盒模型、layout、堆疊上下文、container、visibility、視窗狀態。

### 取特定CSS屬性

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getComputed('.element', ['display', 'position', 'z-index', 'flex-direction'])"
  }
}
```

### 檢查盒模型

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getBox('.element')"
  }
}
```

回傳content、padding、border、margin值，用於除錯間距問題。

---

## 佈局問題工作流

### 工作流：修復水平捲動條

1. 找引起溢出之元素：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.findOverflows()"
  }
}
```

2. 高亮問題元素：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('.overflowing-element', {color: 'red', label: 'Overflow'})"
  }
}
```

3. 查其盒模型以理解問題：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getBox('.overflowing-element')"
  }
}
```

### 工作流：修復Z-Index問題

1. 找所有堆疊上下文：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.findStackingContexts()"
  }
}
```

2. 檢查特定元素堆疊：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getStacking('.dropdown-menu')"
  }
}
```

3. 檢查元素間重疊：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.checkOverlap('.dropdown-menu', '.modal')"
  }
}
```

### 工作流：除錯Flexbox/Grid佈局

1. 檢查容器佈局屬性：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getLayout('.flex-container')"
  }
}
```

2. 遍歷子元素：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.walkChildren('.flex-container', {maxDepth: 1})"
  }
}
```

### 工作流：除錯絕對定位

1. 找包含塊：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getContainer('.absolute-element')"
  }
}
```

2. 沿父鏈向上遍歷：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.walkParents('.absolute-element')"
  }
}
```

---

## 互動除錯工作流

### 工作流：除錯點擊不觸發

1. 確認哪個元素收到點擊：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getLastClick()"
  }
}
```

2. 點擊後DOM是否有變動：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getTriggeredBy('click')"
  }
}
```

3. 取含滑鼠軌跡之完整點擊上下文：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getLastClickContext()"
  }
}
```

**常見問題**：
- 點擊命中錯誤元素（檢查target選擇器）
- 事件冒泡被阻止
- mousedown與mouseup間元素移動
- 元素被不可見覆蓋層遮蔽

### 工作流：除錯模態框不開啟

1. 驗證觸發器點擊已被記錄：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getClicksOn('modal')"
  }
}
```

2. 檢查DOM新增（模態框渲染中）：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getAdded(Date.now() - 5000)"
  }
}
```

3. 啟用變動高亮後重試：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.enableHighlighting(); __devtool.mutations.highlightRecent(3000)"
  }
}
```

### 工作流：除錯表單驗證

1. 檢查表單互動：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getHistory(10)"
  }
}
```

2. 尋找類別變更（錯誤狀態）：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getModified(Date.now() - 3000)"
  }
}
```

3. 查blur觸發之變動：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getTriggeredBy('blur')"
  }
}
```

---

## 視覺除錯工具

### 高亮元素供討論

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('#navigation', {color: 'blue', label: 'Navigation'})"
  }
}
```

### 高亮多個元素

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "[__devtool.highlight('.sidebar', {color: 'green', label: 'Sidebar'}), __devtool.highlight('.content', {color: 'purple', label: 'Content'})]"
  }
}
```

### 含高亮截圖

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('highlighted-layout')"
  }
}
```

### 清除所有高亮

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.clearAllOverlays()"
  }
}
```

---

## 線框模式

### 開啟草圖模式

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.open()"
  }
}
```

### 可用工具

**基本形狀**：`select`, `rectangle`, `ellipse`, `line`, `arrow`, `freedraw`, `text`, `eraser`

**線框元素**：`button`, `input`, `note`, `image`

### 設定工具

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.setTool('note')"
  }
}
```

### 儲存草圖

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.save()"
  }
}
```

### 復原/重做

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.undo()"
  }
}
```

---

## 效能除錯

### 檢查變動速率

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getRateStats()"
  }
}
```

**健康等級**：
- `ok`：< 20次變動/秒
- `warning`：20-50次變動/秒
- `critical`：> 50次變動/秒（效能問題）

### 檢查關聯統計

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getCorrelationStats()"
  }
}
```

顯示哪種互動類型引發最多DOM更新及其延遲。

### 找自發變動

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getUntriggered()"
  }
}
```

找非用戶互動觸發之DOM變更（計時器、WebSocket更新、輪詢）。

---

## 快速參考

### 檢測函數

| Function | Purpose |
|----------|---------|
| `inspect(sel)` | 完整元素檢測 |
| `getElementInfo(sel)` | 基本標籤、類別、屬性 |
| `getPosition(sel)` | 邊界矩形座標 |
| `getComputed(sel, props)` | 計算CSS值 |
| `getBox(sel)` | 盒模型（margin, padding等） |
| `getLayout(sel)` | 顯示類型、flex/grid屬性 |
| `getStacking(sel)` | Z-index與堆疊上下文 |
| `getContainer(sel)` | 包含塊、捲動容器 |

### 佈局診斷

| Function | Purpose |
|----------|---------|
| `findOverflows()` | 引起水平捲動條之元素 |
| `findStackingContexts()` | 所有堆疊上下文元素 |
| `findOffscreen()` | 視窗外元素 |
| `diagnoseLayout(sel?)` | 所有佈局檢查合併 |

### 視覺函數

| Function | Purpose |
|----------|---------|
| `highlight(sel, opts)` | 新增彩色覆蓋層 |
| `removeHighlight(id)` | 移除特定覆蓋層 |
| `clearAllOverlays()` | 移除所有覆蓋層 |
| `screenshot(name, sel)` | 截圖 |

### 互動追蹤

| Function | Purpose |
|----------|---------|
| `interactions.getHistory(n)` | 近期互動 |
| `interactions.getLastClick()` | 最近點擊 |
| `interactions.getLastClickContext(ms)` | 點擊含滑鼠軌跡 |
| `interactions.getClicksOn(sel)` | 選擇器上之點擊 |

### 變動追蹤

| Function | Purpose |
|----------|---------|
| `mutations.getHistory(n)` | 近期DOM變動 |
| `mutations.getAdded(since)` | 新增元素 |
| `mutations.getRemoved(since)` | 移除元素 |
| `mutations.getModified(since)` | 屬性變更 |
| `mutations.getTriggeredBy(type)` | 互動類型篩選之變動 |
| `mutations.getRateStats()` | 效能指標 |
| `mutations.highlightRecent(ms)` | 視覺高亮近期變更 |

---

## 常見除錯清單

除錯任何瀏覽器問題時：

1. **捕獲狀態**
   - [ ] 截圖
   - [ ] 檢查proxylog中之JavaScript錯誤

2. **分析結構**
   - [ ] 執行 `diagnoseLayout()` 查佈局問題
   - [ ] 對特定元素使用 `inspect()`
   - [ ] 用 `getComputed()` 查計算樣式

3. **追蹤互動**
   - [ ] 驗證點擊命中正確目標
   - [ ] 檢查互動觸發之變動
   - [ ] 尋找自發DOM變更

4. **視覺化**
   - [ ] 高亮問題元素
   - [ ] 用草圖模式作標注
   - [ ] 截圖存檔

5. **清理**
   - [ ] 完成後清除覆蓋層
   - [ ] 必要時清除互動/變動歷史

---

## 相關技能

此為傘技能，合併下列原子技能於單一除錯工作流；深入單一面向時取對應原子技能：

> Invoke the `Skill` tool with `skill: agnt:browser-diagnostics` — 元素檢測與佈局診斷數據（inspect/getBox/findOverflows）。

> Invoke the `Skill` tool with `skill: agnt:visual-diagnostics` — 佈局視覺疊層（輪廓、網格、z序）。

> Invoke the `Skill` tool with `skill: agnt:interaction-tracking` — 互動歷史與DOM變動之按需查詢。

> Invoke the `Skill` tool with `skill: agnt:sketch-visual` — 草圖標注與視覺高亮工具。

> Invoke the `Skill` tool with `skill: agnt:error-monitor` — 聚合錯誤檢查（除錯前先查）。
