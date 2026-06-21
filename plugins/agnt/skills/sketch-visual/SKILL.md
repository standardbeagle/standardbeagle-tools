---
name: agnt-sketch-visual
description: "Wireframing with sketch mode and visual highlighting including screenshots, overlays, and UI annotation tools. 線框圖模式與視覺高亮：截圖、疊層、UI標注工具。 Use when: create wireframe, annotate UI, sketch mode, highlight elements, take screenshot, export wireframe, draw UI mockup"
disable-model-invocation: true
---

# 草圖模式與視覺工具技能

記錄草圖模式線框標注及通過 `__devtool` API 可用之視覺高亮函數。

## 調用格式

所有視覺工具以代理exec調用：

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

**先決條件**：代理須運行且瀏覽器已通過代理URL連接。

---

## 草圖模式概覽

草圖模式直接在網頁上方提供類Excalidraw線框能力。用於：
- 標注UI元素以提供反饋
- 繪製建議更改之線框原型
- 為UI討論創建視覺指南
- 導出為JSON或PNG

**鍵盤快捷鍵**：
- `Escape` - Close sketch mode
- `Delete` - Erase selected element
- `Ctrl+Z` - Undo last action
- `Ctrl+Shift+Z` - Redo previously undone action

---

## 草圖模式函數

### sketch.open

開啟草圖模式，在當前頁面開始線框繪製。

**Signature**: `sketch.open()`

**Parameters**: None

**Returns**: void

**Example**:
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

**結果**：全屏畫布疊層與繪圖工具出現。

---

### sketch.close

關閉草圖模式，返回正常頁面視圖。

**Signature**: `sketch.close()`

**Parameters**: None

**Returns**: void

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.close()"
  }
}
```

---

### sketch.toggle

切換草圖模式開/關。

**Signature**: `sketch.toggle()`

**Parameters**: None

**Returns**: void

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.toggle()"
  }
}
```

---

### sketch.setTool

設置活躍繪圖工具。

**Signature**: `sketch.setTool(tool)`

**Parameters**:
- `tool`: string - Tool name (see Available Tools below)

**Returns**: void

**基本形狀工具**：
| Tool | Description |
|------|-------------|
| `select` | Select and move existing elements |
| `rectangle` | Draw rectangles and squares |
| `ellipse` | Draw ellipses and circles |
| `line` | Draw straight lines |
| `arrow` | Draw arrows with arrowheads |
| `freedraw` | Freehand drawing |
| `text` | Add text annotations |
| `eraser` | Erase elements |

**線框UI元素**：
| Tool | Description |
|------|-------------|
| `button` | Draw button wireframe components |
| `input` | Draw input field wireframes |
| `note` | Add sticky note annotations |
| `image` | Draw image placeholder areas |

**Example - 設置矩形工具**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.setTool('rectangle')"
  }
}
```

**Example - 設置按鈕線框工具**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.setTool('button')"
  }
}
```

**Example - 設置便條工具用於標注**:
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

---

### sketch.save

保存當前草圖並發送至代理服務器。草圖數據被記錄，可通過proxylog取回。

**Signature**: `sketch.save()`

**Parameters**: None

**Returns**: void

**Example**:
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

**注意**：保存後，從代理日誌取回草圖數據：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["sketch"]
  }
}
```

---

### sketch.toJSON

以JSON對象導出當前草圖數據。用於保存草圖供後用。

**Signature**: `sketch.toJSON()`

**Parameters**: None

**Returns**: object - Serialized sketch data containing all elements

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.toJSON()"
  }
}
```

**Response Structure**:
```json
{
  "elements": [
    {
      "type": "rectangle",
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 50,
      "strokeColor": "#000000",
      "fillColor": "transparent"
    },
    {
      "type": "text",
      "x": 120,
      "y": 215,
      "text": "Submit Button"
    }
  ],
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

---

### sketch.fromJSON

從先前導出之JSON對象加載草圖數據。

**Signature**: `sketch.fromJSON(data)`

**Parameters**:
- `data`: object - Sketch data from `toJSON()`

**Returns**: void

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.fromJSON({\"elements\":[{\"type\":\"rectangle\",\"x\":100,\"y\":100,\"width\":200,\"height\":100}]})"
  }
}
```

**用例**：
- 恢復先前線框會話
- 團隊成員間分享線框
- 為常見UI模式創建模板

---

### sketch.toDataURL

以PNG圖片數據URL導出當前草圖。

**Signature**: `sketch.toDataURL()`

**Parameters**: None

**Returns**: string - PNG data URL (base64 encoded)

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.toDataURL()"
  }
}
```

---

### sketch.undo

撤銷最後草圖操作。

**Signature**: `sketch.undo()`

**Example**:
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

### sketch.redo

重做先前撤銷之草圖操作。

**Signature**: `sketch.redo()`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.redo()"
  }
}
```

---

### sketch.clear

清除所有草圖元素，從空白畫布開始。

**Signature**: `sketch.clear()`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.clear()"
  }
}
```

---

## 視覺疊層函數

### highlight

以彩色疊層高亮元素。返回ID供後續移除。

**Signature**: `highlight(selector, options?)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element
- `options`: object - Highlight options
  - `color`: string - Overlay color (default: "yellow")
  - `label`: string - Text label to display on overlay
  - `duration`: number - Auto-remove after ms (optional)

**Returns**: string - Overlay ID for removal

**Example - 基本高亮**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('#submit-button')"
  }
}
```

**Example - 帶標籤與顏色高亮**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('#form', {color: 'blue', label: 'Main Form'})"
  }
}
```

**Example - 臨時高亮（3秒後自動移除）**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('.error-field', {color: 'red', label: 'Error', duration: 3000})"
  }
}
```

---

### removeHighlight

按ID移除特定高亮疊層。

**Signature**: `removeHighlight(id)`

**Parameters**:
- `id`: string - Overlay ID returned by `highlight()`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.removeHighlight('overlay-123')"
  }
}
```

---

### clearAllOverlays

移除頁面上所有高亮疊層。

**Signature**: `clearAllOverlays()`

**Example**:
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

## 截圖採集

### screenshot

採集頁面或特定元素截圖。

**Signature**: `screenshot(name?, selector?)`

**Parameters**:
- `name`: string - Screenshot name (default: screenshot_<timestamp>)
- `selector`: string - CSS selector for element to capture (default: body, captures full page)

**Returns**: Promise<{name, width, height, selector}>

**Example - 全頁截圖**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('homepage')"
  }
}
```

**Example - 元素截圖**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('header', '#main-header')"
  }
}
```

**Response**:
```json
{
  "name": "homepage",
  "width": 1920,
  "height": 1080,
  "selector": "body"
}
```

**注意**：截圖保存至磁盤並被記錄。從代理日誌取回截圖條目：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["screenshot"]
  }
}
```

---

## 線框工作流

### 工作流一：創建UI反饋標注

為現有UI提供反饋時：

1. 開啟草圖模式；2. 設置便條工具；3. 繪製箭頭指出問題；4. 保存導出。

### 工作流二：為新UI區域繪製線框

提議新UI元素時：

1. 截圖當前狀態；2. 開啟草圖模式繪製線框；3. 添加按鈕線框；4. 添加輸入字段線框；5. 用文字工具添加標籤；6. 導出PNG和JSON。

### 工作流三：高亮元素以供討論

指出特定元素時：

1. 高亮主要焦點區域；2. 高亮相關元素；3. 帶高亮截圖；4. 完成後清理。

---

## 快速參考表

### 草圖函數

| Function | Purpose | Key Parameters |
|----------|---------|----------------|
| `sketch.open()` | Start sketch mode | None |
| `sketch.close()` | Exit sketch mode | None |
| `sketch.toggle()` | Toggle sketch mode | None |
| `sketch.setTool(tool)` | Select drawing tool | Tool name (see list) |
| `sketch.save()` | Save to proxy server | None |
| `sketch.toJSON()` | Export as JSON | None |
| `sketch.fromJSON(data)` | Import from JSON | Sketch data object |
| `sketch.toDataURL()` | Export as PNG | None |
| `sketch.undo()` | Undo last action | None |
| `sketch.redo()` | Redo undone action | None |
| `sketch.clear()` | Clear all elements | None |

### 可用草圖工具

| Category | Tools |
|----------|-------|
| Selection | `select`, `eraser` |
| Shapes | `rectangle`, `ellipse`, `line`, `arrow` |
| Drawing | `freedraw`, `text` |
| Wireframe | `button`, `input`, `note`, `image` |

### 視覺疊層函數

| Function | Purpose | Key Parameters |
|----------|---------|----------------|
| `highlight(sel, opts)` | Add colored overlay | selector, color, label, duration |
| `removeHighlight(id)` | Remove specific overlay | overlay ID |
| `clearAllOverlays()` | Remove all overlays | None |

### 截圖函數

| Function | Purpose | Key Parameters |
|----------|---------|----------------|
| `screenshot(name, sel)` | Capture page/element | name, selector |

---

## 技巧與最佳實踐

**草圖模式技巧**：
- 使用鍵盤快捷鍵提速（Escape, Delete, Ctrl+Z, Ctrl+Shift+Z）
- 導出JSON保存複雜線框
- 用 `note` 工具添加帶背景之文字標注
- 組合 `button` 和 `input` 工具繪製表單線框

**高亮技巧**：
- 對不同元素類型使用不同顏色
- 添加標籤使高亮自文檔化
- 快速演示用臨時高亮（duration選項）
- 最終截圖前清除所有疊層

**截圖技巧**：
- 用描述性名稱命名截圖便於識別
- 用元素選擇器採集特定組件
- 與高亮組合取得帶標注截圖
- 查看proxylog取得保存截圖元數據

**工作流技巧**：
- 更改前先截「前」圖
- 複雜會話中頻繁保存JSON導出
- 用 `clearAllOverlays()` 重置視覺狀態
- 同時導出PNG和JSON供完整記錄
