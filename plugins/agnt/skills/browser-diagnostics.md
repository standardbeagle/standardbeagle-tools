---
name: browser-diagnostics
description: Browser element inspection, layout diagnostics, tree walking, and visual checks via proxy exec. 瀏覽器元素檢測、佈局診斷、樹遍歷、視覺檢查（代理exec執行）。 Use when: inspect element, debug layout, check z-index, find overflow, element position, box model, flex debug, grid debug
---

# 瀏覽器診斷技能

記錄透過 `__devtool` API可用之瀏覽器元素檢測與佈局診斷函數。所有函數均透過proxy exec動作執行。

## 呼叫格式

所有診斷均以proxy exec呼叫：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "<proxy_id>",
    "code": "__devtool.<function>(...)"
  }
}
```

**前提條件**：代理必須運行且瀏覽器已透過代理URL連接。

---

## 元素檢測函數

### getElementInfo

取元素完整資訊：標籤、類別、屬性、尺寸、位置。

**Signature**: `getElementInfo(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `{tag, id, classes, attributes, text, html, dimensions, position}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getElementInfo('#submit-btn')"
  }
}
```

回應包含：
- `tag`：元素標籤名（如 "button", "div"）
- `id`：元素ID（若有）
- `classes`：類別名稱陣列
- `attributes`：所有屬性物件
- `text`：文字內容（截斷）
- `html`：內部HTML（截斷）
- `dimensions`：寬高
- `position`：邊界矩形座標

---

### getPosition

透過邊界用戶端矩形取元素位置。

**Signature**: `getPosition(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `{top, right, bottom, left, width, height, x, y}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getPosition('.modal')"
  }
}
```

適用：驗證元素位置、計算元素間距離、確認元素在預期位置。

---

### getComputed

取元素計算CSS樣式。

**Signature**: `getComputed(selector, properties?)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素
- `properties`: string[] — 指定屬性（預設：常用屬性）

**Returns**: `{property: value, ...}`

**取特定屬性：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getComputed('#header', ['display', 'position', 'z-index'])"
  }
}
```

**取所有常用屬性：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getComputed('.sidebar')"
  }
}
```

預設回傳常用屬性：
- display, position, float
- width, height, margin, padding
- color, background-color
- font-size, font-family
- z-index, opacity

---

### getBox

取盒模型尺寸：內容、padding、border、margin。

**Signature**: `getBox(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `{content, padding, border, margin}`，各含 `{top, right, bottom, left}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getBox('.container')"
  }
}
```

適用：除錯間距問題、驗證padding/margin值、了解元素總體佔用。

---

### getLayout

取佈局資訊：顯示類型、位置、flexbox/grid屬性。

**Signature**: `getLayout(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `{display, position, float, flexbox?, grid?}`

**檢查flex容器：**
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

flex容器回應包含：
- `display`："flex" 或 "inline-flex"
- `flexbox`：`{direction, wrap, justifyContent, alignItems, gap}`

grid容器回應包含：
- `display`："grid" 或 "inline-grid"
- `grid`：`{columns, rows, gap, areas}`

---

### getStacking

取堆疊上下文資訊：z-index及元素是否建立新堆疊上下文。

**Signature**: `getStacking(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `{zIndex, createsContext, reason?, parentContext}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getStacking('.modal-overlay')"
  }
}
```

回應包含：
- `zIndex`：當前z-index值（數字或 "auto"）
- `createsContext`：布林值，元素是否建立堆疊上下文
- `reason`：建立上下文之原因（如 "position: fixed", "opacity < 1", "transform"）
- `parentContext`：最近祖先堆疊上下文之選擇器

適用：除錯z-index問題、理解元素覆蓋原因、尋找堆疊上下文邊界。

---

### getContainer

取包含塊與捲動容器資訊。

**Signature**: `getContainer(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `{containingBlock, scrollContainer, offsetParent}`

**Example**:
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

回應包含：
- `containingBlock`：定位此元素之元素（用於absolute/fixed）
- `scrollContainer`：最近可捲動祖先
- `offsetParent`：offsetParent元素

適用：除錯絕對定位問題、找控制捲動之元素、了解定位上下文。

---

### getTransform

取CSS transform資訊。

**Signature**: `getTransform(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `{transform, transformOrigin, matrix}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getTransform('.rotated-element')"
  }
}
```

回應包含：
- `transform`：transform CSS屬性值
- `transformOrigin`：transform-origin值
- `matrix`：計算後之變換矩陣

---

### getOverflow

取溢出與捲動資訊。

**Signature**: `getOverflow(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `{overflow, overflowX, overflowY, scrollWidth, scrollHeight, isScrollable}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getOverflow('.scrollable-panel')"
  }
}
```

回應包含：
- `overflow`：overflow CSS屬性
- `overflowX`, `overflowY`：各軸溢出值
- `scrollWidth`, `scrollHeight`：可捲動總尺寸
- `isScrollable`：內容是否溢出之布林值

---

### inspect（複合）

一次呼叫合併多項檢測之綜合檢視。

**Signature**: `inspect(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `{info, position, box, layout, stacking, container, visibility, viewport}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.inspect('#main-form')"
  }
}
```

**適用時機**：需某元素多項資訊時。比多次獨立呼叫更有效率。

---

## 佈局診斷函數

### findOverflows

找引起水平溢出之元素（水平捲動條常見原因）。

**Signature**: `findOverflows()`

**Parameters**: None

**Returns**: `[{element, overflow, width, parentWidth}, ...]`

**Example**:
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

每個溢出項回應包含：
- `element`：溢出元素之選擇器路徑
- `overflow`：溢出像素數
- `width`：元素寬度
- `parentWidth`：父容器寬度

適用：除錯非預期水平捲動條、找破壞響應式佈局之元素、識別寬於視窗之元素。

---

### findStackingContexts

找文件中所有堆疊上下文。

**Signature**: `findStackingContexts()`

**Parameters**: None

**Returns**: `[{element, zIndex, reason}, ...]`

**Example**:
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

每個上下文回應包含：
- `element`：元素選擇器路徑
- `zIndex`：z-index值
- `reason`：建立堆疊上下文之屬性

常見原因：
- `position: relative/absolute/fixed` 含z-index
- `opacity` 小於1
- `transform`, `filter`, `backdrop-filter`
- `isolation: isolate`
- `will-change`

---

### findOffscreen

找定位於視窗外之元素。

**Signature**: `findOffscreen()`

**Parameters**: None

**Returns**: `[{element, position, distance}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.findOffscreen()"
  }
}
```

每個螢幕外元素回應包含：
- `element`：元素選擇器路徑
- `position`：元素邊界矩形
- `distance`：各邊超出距離（top, right, bottom, left）

適用：找無意間定位至螢幕外之隱藏元素、除錯從螢幕外滑入之導航選單、識別用戶看不見之內容。

---

### diagnoseLayout（複合）

執行綜合佈局診斷，合併所有佈局檢查。

**Signature**: `diagnoseLayout(selector?)`

**Parameters**:
- `selector`: string — 可選，聚焦分析之元素

**Returns**: `{overflows, stackingContexts, offscreen, element?}`

**全頁診斷：**
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

**聚焦特定元素：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.diagnoseLayout('#problem-section')"
  }
}
```

**適用時機**：需完整佈局健康檢查時。

---

## 樹遍歷函數

### walkChildren

取所有子元素，可選深度限制與篩選。

**Signature**: `walkChildren(selector, options?)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素
- `options`: `{maxDepth?, filter?}` — 遍歷選項

**Returns**: `[{element, depth, path}, ...]`

**取直接子元素：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.walkChildren('#container', {maxDepth: 1})"
  }
}
```

**遍歷至深度3：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.walkChildren('#nav', {maxDepth: 3})"
  }
}
```

每個元素回應包含：
- `element`：元素選擇器路徑
- `depth`：樹中深度（1 = 直接子元素）
- `path`：祖先元素陣列

---

### walkParents

取從元素至文件根之所有父元素。

**Signature**: `walkParents(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `[{element, depth}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.walkParents('.nested-element')"
  }
}
```

適用：找包含元素、追蹤元素在DOM層次中之位置、除錯樣式繼承問題。

---

### findAncestor

找符合選擇器或條件之最近祖先。

**Signature**: `findAncestor(selector, condition)`

**Parameters**:
- `selector`: string|Element — 起始元素
- `condition`: string|function — CSS選擇器或判斷函數

**Returns**: Element|null

**按選擇器查找：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.findAncestor('.button', '[data-modal]')"
  }
}
```

**找表單容器：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.findAncestor('#submit-btn', 'form')"
  }
}
```

適用：找按鈕所屬表單、找元素所屬模態框、找可捲動父元素。

---

## 視覺狀態函數

### isVisible

檢查元素是否可見（未被CSS隱藏）。

**Signature**: `isVisible(selector)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素

**Returns**: `{visible: boolean, reasons?: string[]}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.isVisible('.dropdown-menu')"
  }
}
```

檢查項目：
- `display: none`
- `visibility: hidden`
- `opacity: 0`
- 零尺寸
- `clip-path` 隱藏

隱藏時回應：
```json
{
  "visible": false,
  "reasons": ["display: none", "parent has visibility: hidden"]
}
```

---

### isInViewport

檢查元素是否在視窗內。

**Signature**: `isInViewport(selector, threshold?)`

**Parameters**:
- `selector`: string|Element — CSS選擇器或DOM元素
- `threshold`: number — 需可見百分比（預設：0，即任何部分可見即算）

**Returns**: `{inViewport: boolean, percentVisible: number, position}`

**檢查是否任何部分可見：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.isInViewport('#footer')"
  }
}
```

**檢查至少50%可見：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.isInViewport('#cta-button', 0.5)"
  }
}
```

適用：確認重要元素無需捲動即可見、驗證延遲載入內容可見性、除錯視窗依賴行為。

---

### checkOverlap

檢查兩元素是否重疊。

**Signature**: `checkOverlap(selector1, selector2)`

**Parameters**:
- `selector1`: string|Element — 第一個元素
- `selector2`: string|Element — 第二個元素

**Returns**: `{overlaps: boolean, intersection?: {x, y, width, height}}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.checkOverlap('.modal', '.tooltip')"
  }
}
```

重疊時回應：
```json
{
  "overlaps": true,
  "intersection": {
    "x": 100,
    "y": 200,
    "width": 50,
    "height": 30
  }
}
```

適用：偵測重疊UI元素、驗證模態框/下拉選單定位、除錯碰撞問題。

---

## 常見除錯情境

### 情境1：除錯水平捲動條

頁面出現非預期水平捲動條時：

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

再檢測問題元素：

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

---

### 情境2：除錯Z-Index問題

元素覆蓋順序與預期不符時：

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

3. 驗證重疊：
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

---

### 情境3：除錯Flexbox/Grid佈局

flex或grid佈局表現不如預期時：

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

2. 遍歷子元素查看尺寸：
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

3. 檢查特定子元素盒模型：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getBox('.flex-item')"
  }
}
```

---

### 情境4：除錯絕對定位

絕對定位元素位置非預期時：

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

3. 檢查計算後定位值：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getComputed('.absolute-element', ['position', 'top', 'left', 'right', 'bottom'])"
  }
}
```

---

### 情境5：完整元素調查

需某元素完整資訊時：

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

一次呼叫回傳：info、position、box、layout、stacking、container、visibility、viewport狀態。

---

### 情境6：完整佈局健康檢查

一次執行所有診斷：

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

回傳：溢出、堆疊上下文、螢幕外元素。

---

## 快速參考表

| Function | Purpose | Key Return Values |
|----------|---------|-------------------|
| `getElementInfo(sel)` | 基本元素資訊 | tag, classes, attributes, dimensions |
| `getPosition(sel)` | 邊界矩形 | top, left, width, height |
| `getComputed(sel, props)` | CSS值 | 計算後樣式值 |
| `getBox(sel)` | 盒模型 | content, padding, border, margin |
| `getLayout(sel)` | 佈局類型 | display, position, flexbox/grid props |
| `getStacking(sel)` | Z-index上下文 | zIndex, createsContext, reason |
| `getContainer(sel)` | 定位上下文 | containingBlock, scrollContainer |
| `getTransform(sel)` | Transform資訊 | transform, transformOrigin, matrix |
| `getOverflow(sel)` | 捲動狀態 | overflow, scrollWidth, isScrollable |
| `inspect(sel)` | 所有檢測合併 | 所有檢測資料 |
| `findOverflows()` | 找溢出問題 | 引起水平捲動之元素 |
| `findStackingContexts()` | 找z-index上下文 | 所有堆疊上下文元素 |
| `findOffscreen()` | 找隱藏元素 | 視窗外元素 |
| `diagnoseLayout(sel?)` | 完整佈局檢查 | overflows, contexts, offscreen |
| `walkChildren(sel, opts)` | 向下遍歷 | 含深度之子元素 |
| `walkParents(sel)` | 向上遍歷 | 至根之父元素 |
| `findAncestor(sel, cond)` | 找父元素 | 符合條件之祖先 |
| `isVisible(sel)` | 可見性檢查 | visible布林值, reasons |
| `isInViewport(sel, thresh)` | 視窗檢查 | inViewport, percentVisible |
| `checkOverlap(sel1, sel2)` | 碰撞檢查 | overlaps, intersection |
