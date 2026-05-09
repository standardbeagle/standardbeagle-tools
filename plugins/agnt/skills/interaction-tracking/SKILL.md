---
name: interaction-tracking
description: Track user interactions and DOM mutations for debugging click handlers, form inputs, and dynamic UI changes. 追蹤用戶互動與DOM變動，除錯點擊處理器、表單輸入、動態UI變化。 Use when: debug click handler, track interactions, DOM mutations, form validation debug, dynamic content debug, mutation rate
---

# 互動與變動追蹤技能

記錄如何透過 `__devtool` API追蹤並除錯用戶互動（點擊、鍵盤、捲動）與DOM變動（新增、移除、修改元素）。

## 呼叫格式

所有追蹤函數均以proxy exec呼叫：

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

## 互動追蹤函數

### interactions.getHistory

取近期互動歷史：點擊、鍵盤事件、捲動、表單輸入。

**Signature**: `interactions.getHistory(count?)`

**Parameters**:
- `count`: number — 回傳互動數（預設：50）

**Returns**: `[{event_type, target, position?, key?, timestamp}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getHistory(20)"
  }
}
```

**回應結構**：
```json
[
  {
    "event_type": "click",
    "target": {
      "selector": "button#submit",
      "tag": "button",
      "id": "submit",
      "classes": ["btn", "btn-primary"],
      "text": "Submit",
      "attributes": { "type": "submit" }
    },
    "position": {
      "client_x": 450,
      "client_y": 320,
      "page_x": 450,
      "page_y": 1120
    },
    "timestamp": 1705312456789
  },
  {
    "event_type": "keydown",
    "target": {
      "selector": "input#email",
      "tag": "input",
      "id": "email"
    },
    "key": {
      "key": "Tab",
      "code": "Tab"
    },
    "timestamp": 1705312456500
  }
]
```

**追蹤事件類型**：
- `click` — 滑鼠點擊
- `dblclick` — 雙擊
- `keydown` — 鍵盤按鍵
- `input` — 表單輸入變化（防抖）
- `focus` — 元素獲焦
- `blur` — 元素失焦
- `scroll` — 捲動事件（防抖）
- `submit` — 表單送出
- `contextmenu` — 右鍵選單

---

### interactions.getLastClick

取最近一次點擊事件。

**Signature**: `interactions.getLastClick()`

**Parameters**: None

**Returns**: `{event_type, target, position, timestamp}|null`

**Example**:
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

適用：除錯用戶點擊之元素、驗證點擊座標、確認按鈕是否收到點擊。

---

### interactions.getLastClickContext

取最近點擊含前後滑鼠移動軌跡，提供完整互動上下文。

**Signature**: `interactions.getLastClickContext(trailMs?)`

**Parameters**:
- `trailMs`: number — 滑鼠軌跡時間窗口（毫秒，預設：2000）

**Returns**: `{click, mouseTrail}|null`

**Example**:
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

**回應結構**：
```json
{
  "click": {
    "event_type": "click",
    "target": {
      "selector": "button.submit-btn",
      "tag": "button",
      "classes": ["submit-btn"]
    },
    "position": {
      "client_x": 450,
      "client_y": 320
    },
    "timestamp": 1705312456789
  },
  "mouseTrail": [
    {
      "event_type": "mousemove",
      "position": { "client_x": 200, "client_y": 300 },
      "wall_time": 1705312454789,
      "interaction_time": 0
    },
    {
      "event_type": "mousemove",
      "position": { "client_x": 350, "client_y": 310 },
      "wall_time": 1705312455500,
      "interaction_time": 711
    },
    {
      "event_type": "mousemove",
      "position": { "client_x": 445, "client_y": 318 },
      "wall_time": 1705312456700,
      "interaction_time": 1911
    }
  ]
}
```

適用：分析用戶到達點擊目標之路徑、除錯在點擊前消失之懸浮觸發UI、了解互動模式。

---

### interactions.getClicksOn

取符合選擇器模式之元素上的所有點擊。

**Signature**: `interactions.getClicksOn(selector)`

**Parameters**:
- `selector`: string — 目標中比對之選擇器模式

**Returns**: `[{event_type, target, position, timestamp}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getClicksOn('button')"
  }
}
```

適用：找所有按鈕點擊、追蹤導航連結點擊、除錯特定元素互動。

---

### interactions.getMouseTrail

取特定時間戳附近之滑鼠移動樣本。

**Signature**: `interactions.getMouseTrail(timestamp, windowMs?)`

**Parameters**:
- `timestamp`: number — 中心時間戳
- `windowMs`: number — 時間窗口（毫秒，預設：5000）

**Returns**: `[{position, wall_time, interaction_time}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getMouseTrail(Date.now() - 1000)"
  }
}
```

**注意**：每次點擊後60秒內，滑鼠移動每100ms取樣一次。

---

### interactions.clear

清除所有互動歷史。

**Signature**: `interactions.clear()`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.clear()"
  }
}
```

---

## 變動追蹤函數

### mutations.getHistory

取近期DOM變動歷史。

**Signature**: `mutations.getHistory(count?)`

**Parameters**:
- `count`: number — 回傳變動數（預設：50）

**Returns**: `[{mutation_type, target, added?, removed?, attribute?, triggered_by?, timestamp}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getHistory(20)"
  }
}
```

**回應結構**：
```json
[
  {
    "mutation_type": "added",
    "target": {
      "selector": "div.modal-container",
      "tag": "div",
      "id": "modal-container"
    },
    "added": [{
      "selector": "div.modal",
      "tag": "div",
      "html": "<div class=\"modal\">..."
    }],
    "triggered_by": {
      "type": "click",
      "timestamp": 1705312456700,
      "latency": 89,
      "target": "button#open-modal"
    },
    "timestamp": 1705312456789
  },
  {
    "mutation_type": "attributes",
    "target": {
      "selector": "input#email",
      "tag": "input"
    },
    "attribute": {
      "name": "class",
      "old_value": "form-input",
      "new_value": "form-input error"
    },
    "triggered_by": {
      "type": "blur",
      "timestamp": 1705312455000,
      "latency": 45
    },
    "timestamp": 1705312455045
  }
]
```

**變動類型**：
- `added` — 新增至DOM之元素
- `removed` — 從DOM移除之元素
- `attributes` — 現有元素之屬性變更

---

### mutations.highlightRecent

以綠色覆蓋層視覺高亮最近新增之元素。

**Signature**: `mutations.highlightRecent(duration?)`

**Parameters**:
- `duration`: number — 回溯時間（毫秒，預設：5000）

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
    "code": "__devtool.mutations.highlightRecent(3000)"
  }
}
```

適用：視覺化某動作後之變更、除錯動態內容載入、找JavaScript新增之元素。

**注意**：高亮預設停用（React相容性）。先啟用：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.enableHighlighting()"
  }
}
```

---

### mutations.getAdded

取自某時間戳後新增至DOM之元素。

**Signature**: `mutations.getAdded(since?)`

**Parameters**:
- `since`: number — 時間戳篩選（預設：0）

**Returns**: `[{mutation_type: 'added', target, added, timestamp}, ...]`

**取近5秒內新增：**
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

---

### mutations.getRemoved

取自某時間戳後從DOM移除之元素。

**Signature**: `mutations.getRemoved(since?)`

**Parameters**:
- `since`: number — 時間戳篩選（預設：0）

**Returns**: `[{mutation_type: 'removed', target, removed, timestamp}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getRemoved(Date.now() - 5000)"
  }
}
```

---

### mutations.getModified

取自某時間戳後之屬性變更。

**Signature**: `mutations.getModified(since?)`

**Parameters**:
- `since`: number — 時間戳篩選（預設：0）

**Returns**: `[{mutation_type: 'attributes', target, attribute, timestamp}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getModified(Date.now() - 5000)"
  }
}
```

適用：追蹤類別變更（CSS狀態變化）、除錯屬性驅動動畫、監控data屬性更新。

---

### mutations.getTriggeredBy

取由特定互動類型觸發之變動。

**Signature**: `mutations.getTriggeredBy(interactionType)`

**Parameters**:
- `interactionType`: string — 互動類型（click, keydown, input等）

**Returns**: `[{mutation_type, target, triggered_by, timestamp}, ...]`

**Example**:
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

適用：找點擊導致之DOM變更、除錯因果關係、了解UI對用戶動作之回應。

---

### mutations.getUntriggered

取無關聯用戶互動之變動（自發更新）。

**Signature**: `mutations.getUntriggered()`

**Returns**: `[{mutation_type, target, timestamp}, ...]`

**Example**:
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

適用：找輪詢/計時器驅動更新、識別WebSocket驅動變更、除錯非預期DOM修改。

---

### mutations.getCorrelationStats

取互動-變動關聯統計。

**Signature**: `mutations.getCorrelationStats()`

**Returns**: `{total, triggered, untriggered, by_type, avg_latency, max_latency}`

**Example**:
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

**回應結構**：
```json
{
  "total": 150,
  "triggered": 120,
  "untriggered": 30,
  "by_type": {
    "click": 80,
    "input": 25,
    "blur": 15
  },
  "avg_latency": {
    "click": 45,
    "input": 12,
    "blur": 8
  },
  "max_latency": {
    "click": 250,
    "input": 50,
    "blur": 20
  }
}
```

---

### mutations.getRateStats

取變動速率統計供效能監控。

**Signature**: `mutations.getRateStats(windows?)`

**Parameters**:
- `windows`: number[] — 時間窗口（毫秒，預設：[1000, 5000, 30000]）

**Returns**: `{windows, counts, acceleration, status, health, max}`

**Example**:
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

**回應結構**：
```json
{
  "windows": {
    "1s": 15,
    "5s": 8,
    "30s": 4
  },
  "counts": {
    "1s": 15,
    "5s": 40,
    "30s": 120
  },
  "acceleration": {
    "1s/5s": 1.88,
    "5s/30s": 2.0
  },
  "status": "accelerating",
  "health": "ok",
  "max": {
    "rate": 25.5,
    "timestamp": 1705312450000,
    "ago": "15s"
  }
}
```

**健康等級**：
- `ok`：< 20次變動/秒
- `warning`：20-50次變動/秒
- `critical`：> 50次變動/秒

---

### mutations.pause / mutations.resume

暫時暫停或恢復變動追蹤。

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.pause()"
  }
}
```

適用：批量DOM操作期間暫停、減少已知大量更新之雜訊、操作完成後恢復。

---

### mutations.clear

清除變動歷史。

**Signature**: `mutations.clear()`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.clear()"
  }
}
```

---

## 實際除錯情境

### 情境1：除錯點擊處理器不觸發

按鈕點擊似乎未觸發預期動作時：

1. 取最後點擊以驗證目標：
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

2. 檢查點擊後是否發生任何變動：
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

3. 若點擊目標非預期，取完整上下文：
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
- mousedown與mouseup間元素改變

---

### 情境2：除錯模態框不開啟

點擊按鈕應開啟模態框但無反應時：

1. 驗證點擊已被記錄：
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

2. 檢查近期DOM新增：
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

3. 啟用高亮後重試動作：
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

---

### 情境3：除錯表單驗證

表單驗證錯誤未正確顯示時：

1. 檢查表單元素近期互動：
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

3. 檢查blur與類別變更之關聯：
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

### 情境4：除錯動態內容載入

內容應動態載入但未出現時：

1. 檢查任何近期新增：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getAdded(Date.now() - 10000)"
  }
}
```

2. 檢查自發（非用戶觸發）變動：
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

3. 檢查變動速率是否有載入活動：
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

---

### 情境5：除錯過多DOM更新引發效能問題

頁面因過多DOM變更而遲緩時：

1. 取變動速率統計：
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

2. 檢查關聯統計：
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

3. 取完整變動歷史以識別模式：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getHistory(100)"
  }
}
```

**危險信號**：
- `health: "critical"` （> 50次變動/秒）
- `untriggered` 計數高（輪詢問題）
- `max_latency` 高（事件處理器緩慢）

---

### 情境6：除錯下拉選單/選單消失

懸浮UI在點擊前消失時：

1. 取含滑鼠軌跡之最後點擊上下文：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getLastClickContext(3000)"
  }
}
```

2. 檢查點擊前之元素移除：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getRemoved(Date.now() - 5000)"
  }
}
```

**診斷**：若下拉選單在點擊時間戳前被移除，可能是mouseout處理器過早關閉之。

---

## 快速參考表

| Function | Purpose | Key Return Values |
|----------|---------|-------------------|
| `interactions.getHistory(n)` | 所有互動 | event_type, target, position, key |
| `interactions.getLastClick()` | 最後點擊事件 | target, position, timestamp |
| `interactions.getLastClickContext(ms)` | 點擊含滑鼠軌跡 | click, mouseTrail |
| `interactions.getClicksOn(sel)` | 選擇器上之點擊 | 點擊事件陣列 |
| `interactions.getMouseTrail(ts, ms)` | 滑鼠移動 | positions, timestamps |
| `interactions.clear()` | 清除歷史 | void |
| `mutations.getHistory(n)` | 所有變動 | mutation_type, target, triggered_by |
| `mutations.highlightRecent(ms)` | 視覺高亮 | void |
| `mutations.getAdded(since)` | 新增元素 | added, target, timestamp |
| `mutations.getRemoved(since)` | 移除元素 | removed, target, timestamp |
| `mutations.getModified(since)` | 屬性變更 | attribute (name, old, new) |
| `mutations.getTriggeredBy(type)` | 觸發器篩選變動 | 已篩選之變動 |
| `mutations.getUntriggered()` | 自發變動 | 無觸發器之變動 |
| `mutations.getCorrelationStats()` | 觸發器統計 | by_type, latency統計 |
| `mutations.getRateStats()` | 效能統計 | rate, health, max |
| `mutations.pause()` | 暫停追蹤 | void |
| `mutations.resume()` | 恢復追蹤 | void |
| `mutations.clear()` | 清除歷史 | void |

---

## 設定說明

**互動追蹤**：
- 最大歷史：500次互動
- 捲動防抖：100ms
- 輸入防抖：300ms
- 滑鼠移動取樣：每點擊後100ms間隔，60秒窗口

**變動追蹤**：
- 最大歷史：200次變動
- 高亮持續：2000ms
- 高亮：預設停用（呼叫 `enableHighlighting()` 啟用）
- 忽略：devtool UI元素、script、style、link標籤
- 關聯窗口：500ms（此窗口內之互動與變動相關聯）

---

## 整合提示

**結合元素檢測**：
```javascript
// Get last click and inspect the target
var click = __devtool.interactions.getLastClick();
if (click && click.target.selector) {
  __devtool.inspect(click.target.selector);
}
```

**變動後截圖**：
```javascript
// After enabling highlighting
__devtool.mutations.highlightRecent(5000);
await __devtool.screenshot("recent-mutations");
```

**除錯工作流**：
1. 測試前清除歷史
2. 執行用戶動作
3. 檢查互動以驗證輸入
4. 檢查變動以驗證回應
5. 用關聯統計了解因果
