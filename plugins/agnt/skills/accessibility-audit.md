---
name: accessibility-audit
description: Accessibility auditing with axe-core, ARIA inspection, contrast checks, tab order, and screen reader simulation. 無障礙稽查：axe-core、ARIA檢查、對比度、Tab順序、屏讀模擬。 Use when: audit accessibility, check WCAG compliance, check color contrast, get tab order, check ARIA, simulate screen reader, check focus indicators, pre-release a11y review
---

# 無障礙稽查技能

記錄通過 `__devtool` API 可用之無障礙稽查與檢查函數。所有函數經代理exec操作執行。

## 調用格式

所有無障礙函數以代理exec調用：

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

## 稽查模式概覽

`auditAccessibility` 函數支持針對不同用途優化之多種稽查模式：

| Mode | Engine | Rules | Speed | Use Case |
|------|--------|-------|-------|----------|
| **standard** | axe-core | 90+ WCAG 2.1 rules | 100-300ms | Default comprehensive audit |
| **fast** | Custom | Focus indicators, color schemes | 50-100ms | Quick checks during development |
| **comprehensive** | Extended | State-specific contrast, responsive | 500-2000ms | Pre-release audits |
| **basic** | Fallback | Minimal checks | 10-50ms | Fallback when axe-core fails |

### 各模式適用時機

**Standard Mode**（默認）：
- 常規開發工作流
- CI/CD流水線集成
- 首次無障礙審查
- 最常見用例

**Fast Mode**：
- UI開發中快速迭代
- 更改間快速健全性檢查
- 需要即時反饋時
- 資源受限環境

**Comprehensive Mode**：
- 發布前無障礙審查
- 客戶交付物
- 徹底性比速度更重要時
- 響應式設計驗證
- 特定狀態測試（懸停、聚焦、激活）

**Basic Mode**：
- axe-core不可用時之備用
- 最小環境
- 無障礙屬性快速存在性檢查

---

## auditAccessibility

以可配置模式對頁面運行完整無障礙稽查。

**Signature**: `auditAccessibility(options?)`

**Parameters**:
- `options.mode`: string - Audit mode: `standard` (default), `fast`, `comprehensive`, `basic`
- `options.raw`: boolean - Return raw verbose output (default: false for AI-optimized grouped output)
- `options.selector`: string - Limit audit to elements within selector

**Returns**: `{issues: [...], summary: {critical, serious, moderate, minor}}`

### Standard模式（默認）

用axe-core進行WCAG 2.1合規，90+規則。

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility()"
  }
}
```

**明確指定模式**：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility({mode: 'standard'})"
  }
}
```

### Fast模式

聚焦指示器與配色方案快速檢查。

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility({mode: 'fast'})"
  }
}
```

### Comprehensive模式

含特定狀態對比度與響應式檢查之擴展稽查。

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility({mode: 'comprehensive'})"
  }
}
```

### Basic模式

axe-core不可用時之最小備用檢查。

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility({mode: 'basic'})"
  }
}
```

### 原始輸出模式

取得含所有問題及上下文之詳細輸出。

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility({raw: true})"
  }
}
```

### 範圍稽查

限定稽查至頁面特定區域。

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility({selector: '#main-content'})"
  }
}
```

### 響應結構

**AI優化輸出（默認）**：
```json
{
  "issues": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Elements must have sufficient color contrast",
      "count": 3,
      "examples": ["#header > h1", ".sidebar .link", "#footer p"],
      "help": "https://dequeuniversity.com/rules/axe/4.7/color-contrast"
    }
  ],
  "summary": {
    "critical": 0,
    "serious": 3,
    "moderate": 5,
    "minor": 2
  }
}
```

**原始輸出**：
```json
{
  "issues": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Elements must have sufficient color contrast",
      "element": "#header > h1",
      "html": "<h1 style=\"color: #999\">Welcome</h1>",
      "failureSummary": "Fix any of the following: Element has insufficient color contrast of 2.5:1",
      "help": "https://dequeuniversity.com/rules/axe/4.7/color-contrast",
      "helpUrl": "https://dequeuniversity.com/rules/axe/4.7/color-contrast?application=axeAPI"
    }
  ],
  "summary": {
    "critical": 0,
    "serious": 3,
    "moderate": 5,
    "minor": 2
  }
}
```

---

## getA11yInfo

取得特定元素之ARIA與角色信息。

**Signature**: `getA11yInfo(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{role, name, description, state, properties}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getA11yInfo('#submit-button')"
  }
}
```

**Response includes**:
- `role`: ARIA role (explicit or implicit)
- `name`: Accessible name (from label, aria-label, aria-labelledby, etc.)
- `description`: Accessible description (from aria-describedby)
- `state`: Current state (expanded, checked, selected, disabled, etc.)
- `properties`: Other ARIA properties (aria-required, aria-invalid, etc.)

**用例**：
- 驗證按鈕/鏈接無障礙性
- 查看表單字段標籤
- 除錯屏幕閱讀器公告
- 驗證ARIA實現

**Example - 查看表單字段**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getA11yInfo('#email-input')"
  }
}
```

**Example - 查看導航菜單**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getA11yInfo('[role=\"navigation\"]')"
  }
}
```

---

## getContrast

計算文字元素之顏色對比度。

**Signature**: `getContrast(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{ratio, foreground, background, passesAA, passesAAA}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getContrast('.body-text')"
  }
}
```

**Response includes**:
- `ratio`: Calculated contrast ratio (e.g., 4.5, 7.0)
- `foreground`: Computed foreground (text) color
- `background`: Computed background color
- `passesAA`: Boolean - meets WCAG AA requirements (4.5:1 normal text, 3:1 large text)
- `passesAAA`: Boolean - meets WCAG AAA requirements (7:1 normal text, 4.5:1 large text)

**WCAG對比度要求**：
- **AA Normal Text**: 4.5:1 minimum
- **AA Large Text** (18pt+ or 14pt+ bold): 3:1 minimum
- **AAA Normal Text**: 7:1 minimum
- **AAA Large Text**: 4.5:1 minimum

**Example - 查看標題對比度**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getContrast('h1')"
  }
}
```

**Example - 查看鏈接對比度**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getContrast('a.nav-link')"
  }
}
```

**用例**：
- 驗證文字可讀性
- 查看鏈接顏色與背景對比
- 驗證設計系統顏色
- 發布前無障礙審查

---

## getTabOrder

取得鍵盤Tab順序之可聚焦元素。

**Signature**: `getTabOrder()`

**Parameters**: None

**Returns**: `[{element, tabIndex, natural}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getTabOrder()"
  }
}
```

**Response各元素包含**：
- `element`: Selector path to the focusable element
- `tabIndex`: The tabindex attribute value (-1, 0, or positive)
- `natural`: Boolean - whether element is naturally focusable (buttons, links, inputs)

**Tab順序規則**：
1. 正tabindex元素（按數字順序）
2. tabindex="0"與自然可聚焦元素（按DOM順序）
3. tabindex="-1"元素僅可通過JavaScript聚焦

**用例**：
- 驗證邏輯Tab順序
- 找跳轉鏈接
- 除錯鍵盤導航
- 識別焦點陷阱
- 查找缺失可聚焦元素

**Example - 查看表單Tab順序**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getTabOrder()"
  }
}
```

**常見問題**：
- 正tabindex值（通常表示問題）
- Tab順序中缺少重要控件
- 視覺順序與Tab順序不符
- 應可聚焦但tabindex="-1"之互動元素

---

## getScreenReaderText

取得屏幕閱讀器公告之文字。

**Signature**: `getScreenReaderText(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `string` - The announced text

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getScreenReaderText('#nav-menu')"
  }
}
```

**函數考慮**：
- aria-label屬性
- aria-labelledby引用內容
- aria-describedby描述
- 可見文字內容
- 圖片alt文字
- title屬性
- 隱藏元素（aria-hidden="true"）
- 視覺隱藏文字（.sr-only, .visually-hidden）

**用例**：
- 驗證按鈕公告是否正確
- 查看圖片alt文字
- 除錯令人困惑的屏讀輸出
- 測試純圖標按鈕
- 驗證表單字段公告

**Example - 查看圖標按鈕**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getScreenReaderText('.icon-button')"
  }
}
```

**Example - 查看複雜組件**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getScreenReaderText('[role=\"dialog\"]')"
  }
}
```

---

## 解讀稽查結果

### 影響級別

| Level | Description | Action Required |
|-------|-------------|-----------------|
| **critical** | Completely blocks access for some users | Must fix immediately |
| **serious** | Significantly impacts usability | Should fix before release |
| **moderate** | Causes confusion or difficulty | Plan to fix |
| **minor** | Minor annoyance | Fix when convenient |

### 常見問題與修復

#### 顏色對比度問題

**問題**：文字與背景間對比度不足。

**修復**：
1. 用 getContrast 函數查看特定元素
2. 調整前景或背景顏色符合WCAG要求
3. AA合規：普通文字4.5:1，大文字3:1
4. 考慮添加高對比度模式選項

**Check**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getContrast('.low-contrast-text')"
  }
}
```

#### 缺失表單標籤

**問題**：表單輸入無關聯標籤。

**修復**：
1. 添加 `<label for="input-id">` 元素
2. 或對簡單輸入用 aria-label
3. 或對複雜標籤用 aria-labelledby

**Check**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getA11yInfo('#unlabeled-input')"
  }
}
```

#### 圖片缺失Alt文字

**問題**：圖片缺少alt屬性。

**修復**：
1. 為信息性圖片添加描述性alt文字
2. 裝飾性圖片用 alt=""
3. 純裝飾性圖標用 aria-hidden="true"

**Check**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getScreenReaderText('img.product-image')"
  }
}
```

#### 缺失按鈕名稱

**問題**：無可訪問名稱之按鈕（純圖標按鈕）。

**修復**：
1. 添加 aria-label 描述操作
2. 或在按鈕內添加視覺隱藏文字
3. 或用 aria-labelledby 引用可見文字

**Check**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getA11yInfo('.icon-only-button')"
  }
}
```

#### 缺失焦點指示器

**問題**：鍵盤用戶不可見焦點狀態。

**修復**：
1. 不可移除outline而不提供替代
2. 添加可見焦點樣式（:focus-visible）
3. 焦點指示器需有足夠對比度

**用fast模式查看**：
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility({mode: 'fast'})"
  }
}
```

#### 鍵盤導航問題

**問題**：內容無法通過鍵盤訪問。

**修復**：
1. 使用原生互動元素（button, a, input）
2. 對自定義互動元素添加 tabindex="0"
3. 為自定義組件實現鍵盤事件處理器

**Check**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getTabOrder()"
  }
}
```

---

## 常用無障礙工作流

### 工作流一：初始頁面稽查

對新頁面進行全面檢查：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility()"
  }
}
```

Then check tab order:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getTabOrder()"
  }
}
```

---

### 工作流二：表單無障礙查看

查看各表單字段是否有正確標籤：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getA11yInfo('#email-field')"
  }
}
```

驗證錯誤信息是否被公告：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getA11yInfo('.error-message')"
  }
}
```

查看提交按鈕是否可訪問：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getScreenReaderText('button[type=\"submit\"]')"
  }
}
```

---

### 工作流三：導航無障礙性

查看主導航：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getA11yInfo('nav')"
  }
}
```

驗證跳轉鏈接存在：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getTabOrder()"
  }
}
```

查看下拉菜單無障礙性：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getA11yInfo('[role=\"menu\"]')"
  }
}
```

---

### 工作流四：模態/對話框查看

查看對話框有正確角色：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getA11yInfo('[role=\"dialog\"]')"
  }
}
```

驗證屏讀公告：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getScreenReaderText('.modal')"
  }
}
```

查看焦點是否被模態框限制：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getTabOrder()"
  }
}
```

---

### 工作流五：發布前全面稽查

運行comprehensive模式進行徹底查看：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility({mode: 'comprehensive'})"
  }
}
```

取得詳細修復之原始輸出：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility({mode: 'comprehensive', raw: true})"
  }
}
```

---

### 工作流六：開發快速查看

積極開發時用fast模式：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility({mode: 'fast'})"
  }
}
```

Then spot-check specific elements:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getContrast('.new-component')"
  }
}
```

---

## 快速參考表

| Function | Purpose | Key Return Values |
|----------|---------|-------------------|
| `auditAccessibility(opts)` | Full page audit | issues array, summary by impact |
| `getA11yInfo(sel)` | Element ARIA info | role, name, description, state |
| `getContrast(sel)` | Color contrast check | ratio, passesAA, passesAAA |
| `getTabOrder()` | Keyboard navigation | ordered focusable elements |
| `getScreenReaderText(sel)` | SR announcement | text string |

---

## WCAG快速參考

### WCAG 2.1原則（POUR）

1. **Perceivable**: Information must be presentable in ways users can perceive
2. **Operable**: Interface must be operable by various input methods
3. **Understandable**: Information and operation must be understandable
4. **Robust**: Content must be robust enough for various assistive technologies

### 關鍵成功標準

| Level | Criteria | Test Function |
|-------|----------|---------------|
| A | Non-text content has alt text | `getScreenReaderText()` |
| A | Info not conveyed by color alone | `auditAccessibility()` |
| A | Keyboard accessible | `getTabOrder()` |
| AA | Contrast 4.5:1 minimum | `getContrast()` |
| AA | Focus visible | `auditAccessibility({mode: 'fast'})` |
| AA | Labels for inputs | `getA11yInfo()` |
| AAA | Contrast 7:1 | `getContrast()` |

---

## 有效無障礙測試技巧

1. **先用standard模式** - 以合理速度捕捉大多數問題
2. **迭代時用fast模式** - 編碼時快速反饋
3. **發布前運行comprehensive** - 邊緣情況徹底查看
4. **單獨查看Tab順序** - 邏輯順序對鍵盤用戶很重要
5. **驗證屏讀文字** - 你看到的不一定是公告的
6. **用真實輔助技術測試** - 自動化工具僅捕捉約30%問題
7. **考慮不同用戶需求** - 弱視、運動障礙、認知障礙
