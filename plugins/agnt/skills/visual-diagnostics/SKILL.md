---
name: agnt-visual-diagnostics
description: "Visual overlays for layout debugging - outline elements, show grid/flex containers, typography audit, z-index analysis, interactive element visualization. 視覺疊層排版除錯：輪廓、網格、彈性、字排、z序、互動元素。 Use when: debug layout, outline elements, show grid containers, show flexbox, audit typography, check z-index, visualize interactive elements, debug spacing"
disable-model-invocation: true
---

# Visual Diagnostics Skill

視覺CSS疊層除錯，借agnt診斷模組。使不可見之佈局概念可視，以速除錯。

## 先決條件

代理須運行且瀏覽器已連：

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

## 先查錯誤

視覺問題常源於JS錯誤，先查：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {"proxy_id": "dev", "include_warnings": false}
}
```

修錯後再稽查佈局。

---

## 結構與佈局診斷

### 輪廓所有元素

按嵌套深度色碼標示元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.outlineAll()"
  }
}
```

色彩循環：紅→綠→藍→黃→青，按嵌套深度。

### 顯示語義元素

按類型高亮HTML5語義元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showSemanticElements()"
  }
}
```

返回色彩圖例：
- `div` - red
- `span` - blue
- `section` - green
- `article` - purple
- `header` - orange
- `footer` - cyan
- `nav` - magenta
- `aside` - lime
- `main` - pink

### 顯示容器類

高亮容器/包裹元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showContainers()"
  }
}
```

目標：`.container`、`.wrapper`、`[class*="container"]`、`[class*="wrapper"]`

### 顯示網格容器

可視化CSS Grid佈局：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showGrid()"
  }
}
```

於網格容器添加 "GRID" 標籤及紫色輪廓。

### 顯示彈性容器

可視化Flexbox佈局：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showFlexbox()"
  }
}
```

於彈性容器添加 "FLEX" 標籤及青色輪廓。

### 顯示間距用法

高亮使用CSS gap之元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showGaps()"
  }
}
```

---

## 字排診斷

### 字排稽查面板

開啟面板顯示頁面所有唯一文字樣式：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showTypographyPanel()"
  }
}
```

返回：
- 唯一樣式組合計數
- 各組字號、字族、字重、行高、顏色
- 使用次數（僅用一次=疑為不一致）
- 各樣式預覽文字

### 高亮不一致文字

找僅用一次之文字樣式（疑為不一致）：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.highlightInconsistentText()"
  }
}
```

以紅色高亮單次出現字號。

### 顯示文字邊界

輪廓所有文字元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showTextBounds()"
  }
}
```

藍色虛線輪廓 `<p>`、`<h1>`-`<h6>`、`<span>`、`<a>`。

---

## 疊層分析

### 顯示Z序元素

找出並高亮所有有z-index之元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showStacking()"
  }
}
```

返回按z-index值排序之元素列表（最高在前）。

### 顯示定位元素

按定位類型高亮元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showPositioned()"
  }
}
```

色彩圖例：
- `absolute` - red outline
- `fixed` - orange outline
- `sticky` - purple outline

### 降低透明度

淡化所有元素以查看疊層：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.opacity(0.3)"
  }
}
```

用於查看重疊元素。

---

## 互動元素診斷

### 顯示互動元素

高亮所有可點擊/可聚焦元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showInteractive()"
  }
}
```

青綠輪廓標示：`<a>`、`<button>`、`<input>`、`<select>`、`<textarea>`、`[onclick]`、`[role="button"]`。

### 顯示焦點順序

對所有可聚焦元素按Tab順序編號：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showFocusOrder()"
  }
}
```

添加編號徽章（1, 2, 3...）顯示鍵盤導航順序。

### 顯示點擊目標

強制顯示最小 44x44px 點擊目標：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showClickTargets()"
  }
}
```

橙色虛線輪廓標示44x44最小範圍。

---

## 顏色與間距分析

### 顯示色板

開啟面板顯示頁面所用所有顏色：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showColorPalette()"
  }
}
```

顯示色樣及hex/rgb值與使用次數。

### 顯示間距比例

開啟面板顯示所有margin/padding值：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showSpacingScale()"
  }
}
```

以px和rem顯示值及使用次數。助識間距不一致。

---

## 視口資訊

### 顯示視口面板

面板顯示當前視口資訊：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showViewportInfo()"
  }
}
```

顯示：視口尺寸、螢幕尺寸、設備像素比。

---

## 控制函數

### 清除指定模式

移除單一診斷疊層：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.clear('grid')"
  }
}
```

### 清除所有診斷

移除所有疊層與面板：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.clearAll()"
  }
}
```

### 列出活躍模式

查看當前活躍診斷：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.list()"
  }
}
```

---

## 快速參考

### 結構診斷

| Function | Purpose |
|----------|---------|
| `outlineAll()` | Color-code by depth |
| `showSemanticElements()` | Highlight HTML5 elements |
| `showContainers()` | Container/wrapper classes |
| `showGrid()` | CSS Grid containers |
| `showFlexbox()` | Flexbox containers |
| `showGaps()` | Gap properties |

### 字排診斷

| Function | Purpose |
|----------|---------|
| `showTypographyPanel()` | All unique text styles |
| `highlightInconsistentText()` | One-off font sizes |
| `showTextBounds()` | Text element bounds |

### 疊層診斷

| Function | Purpose |
|----------|---------|
| `showStacking()` | Z-index elements |
| `showPositioned()` | Absolute/fixed/sticky |
| `opacity(level)` | Fade all elements |

### 互動診斷

| Function | Purpose |
|----------|---------|
| `showInteractive()` | Clickable elements |
| `showFocusOrder()` | Tab sequence numbers |
| `showClickTargets()` | 44x44px minimum |

### 分析面板

| Function | Purpose |
|----------|---------|
| `showColorPalette()` | All colors used |
| `showSpacingScale()` | Margin/padding values |
| `showViewportInfo()` | Viewport dimensions |

---

## 常用工作流

### 除錯佈局結構

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.outlineAll()"
  }
}
```

Then:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showGrid()"
  }
}
```

### 字排一致性稽查

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showTypographyPanel()"
  }
}
```

### 鍵盤導航檢查

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showFocusOrder()"
  }
}
```

### 查找Z序衝突

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showStacking()"
  }
}
```

---

## 相關技能

> Invoke the `Skill` tool with `skill: agnt:responsive-check` — 響應式佈局風險檢測。

> Invoke the `Skill` tool with `skill: agnt:browser-debug` — 元素檢查與互動追蹤。

> Invoke the `Skill` tool with `skill: agnt:quality-audits` — DOM複雜度與CSS架構稽查。
