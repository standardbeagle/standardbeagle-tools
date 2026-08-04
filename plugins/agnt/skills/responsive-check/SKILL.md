---
name: agnt-responsive-check
description: "Detect responsive layout risks before they cause problems - fixed widths, touch targets, horizontal scroll, positioning issues. 響應式佈局風險預檢：固定寬度、觸控目標、橫向滾動、定位問題。 Use when: check responsive layout, detect mobile issues, validate touch targets, pre-launch mobile check, check horizontal scroll, audit fixed widths"
disable-model-invocation: true
---

# 響應式佈局檢查技能

借agnt響應式風險分析，提供響應式設計驗證。在不同視口尺寸下引發問題之前，預先探測佈局問題。

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

響應式佈局常因JS錯誤而失效，先查：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_incidents",
  "parameters": {"proxy_id": "dev", "severity": ["critical", "error"]}
}
```

---

## 快速檢查：完整響應式稽查

執行全面響應式風險分析：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_responsive_risk.checkResponsiveRisk()"
  }
}
```

返回：
- `issues` - 含響應式問題之元素陣列
- `summary` - 總計、錯誤、警告數
- `currentViewport` - 檢查時之寬高
- `breakpointsTested` - 標準斷點：[320, 375, 414, 768, 1024, 1280, 1440, 1920]

---

## 個別檢查

### 固定尺寸

找可能引起橫向滾動之固定像素寬度元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "(function() { var issues = []; document.querySelectorAll('*').forEach(function(el) { var w = window.getComputedStyle(el).width; var minWidth = parseFloat(window.getComputedStyle(el).minWidth) || 0; if (w && w.endsWith('px') && parseFloat(w) > 320) { issues.push({ selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').join('.') : ''), width: w, severity: parseFloat(w) > 768 ? 'error' : 'warning' }); } if (minWidth > 320) { issues.push({ selector: el.tagName.toLowerCase(), minWidth: minWidth + 'px', severity: 'warning' }); } }); return issues.slice(0, 20); })()"
  }
}
```

### 觸控目標

找小於44x44px之互動元素（Apple HIG最小值）：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_responsive_risk.checkTouchTargets(document.body)"
  }
}
```

檢查：`<a>`、`<button>`、`<input>`、`<select>`、`<textarea>`、含 `onclick`、`role="button"` 或 `tabindex` 之元素。

### 橫向滾動

找引起非預期橫向溢出之元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_responsive_risk.checkHorizontalScroll(document.body)"
  }
}
```

探測 `scrollWidth > clientWidth` 且無意圖性 `overflow-x` 設置之元素。

### 定位問題

找可能離屏或遮蔽內容之絕對/固定元素：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_responsive_risk.checkPositioning(document.body)"
  }
}
```

檢查：
- 定位元素超出視口邊緣
- 可能在移動端遮蔽內容之大型固定元素
- 高z-index固定元素

### 文字大小

找移動端可能不可讀之文字：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_responsive_risk.checkTextSizing(document.body)"
  }
}
```

標記：
- 字號 < 12px（移動端難以閱讀）
- 極端字號（> 48px 或 < 10px）含視口單位

### 表格佈局

找引起橫向滾動之表格：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_responsive_risk.checkTableLayout(document.body)"
  }
}
```

探測：
- 寬於視口之表格
- 無滾動包裹之寬表格

---

## 問題類型參考

| Type | Severity | Description | Fix |
|------|----------|-------------|-----|
| `fixed-width` | error/warning | Fixed pixel width > 320px | Use `max-width: 100%` or responsive units |
| `min-width-too-large` | warning | min-width may cause scroll | Reduce min-width or use media queries |
| `exceeds-viewport` | error | Element wider than viewport | Add `overflow-x: auto` or responsive sizing |
| `small-touch-target` | warning | Interactive element < 44x44px | Increase padding/min dimensions |
| `unintended-horizontal-scroll` | error | Unintended horizontal overflow | Fix content width or add `overflow-x: auto` |
| `positioned-offscreen-right` | warning | Positioned element past right edge | Use responsive positioning |
| `large-fixed-element` | warning | Large fixed element obscures content | Make collapsible or reduce size |
| `small-font` | warning | Font < 12px | Use minimum 14px for body text |
| `extreme-font-size` | warning | Very large/small with vw/vh | Add `clamp()` for viewport units |
| `wide-table` | error | Table wider than viewport | Add horizontal scroll wrapper |
| `table-not-scrollable` | warning | Wide table without wrapper | Wrap in `overflow-x: auto` container |

---

## 工作流：發布前移動端檢查

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "(function() { var result = __devtool_responsive_risk.checkResponsiveRisk(); var critical = result.issues.filter(function(i) { return i.issues.some(function(x) { return x.severity === 'error'; }); }); return { viewport: result.currentViewport, errors: result.summary.errors, warnings: result.summary.warnings, criticalIssues: critical.map(function(c) { return { selector: c.selector, problems: c.issues.filter(function(x) { return x.severity === 'error'; }).map(function(x) { return x.type; }) }; }), recommendation: result.summary.errors > 0 ? 'Fix ' + result.summary.errors + ' errors before launch' : 'Review ' + result.summary.warnings + ' warnings' }; })()"
  }
}
```

---

## 工作流：檢查特定元素

檢查特定元素之響應式風險：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "(function() { var el = document.querySelector('.my-component'); return { fixed: __devtool_responsive_risk.checkFixedDimensions(el), touch: __devtool_responsive_risk.checkTouchTargets(el), scroll: __devtool_responsive_risk.checkHorizontalScroll(el), position: __devtool_responsive_risk.checkPositioning(el) }; })()"
  }
}
```

---

## 視口上下文

運行響應式檢查前始終先查當前視口：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "({ width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio, breakpoint: window.innerWidth < 576 ? 'xs' : window.innerWidth < 768 ? 'sm' : window.innerWidth < 992 ? 'md' : window.innerWidth < 1200 ? 'lg' : window.innerWidth < 1400 ? 'xl' : 'xxl' })"
  }
}
```

---

## 快速參考

### 檢查函數

| Function | Purpose |
|----------|---------|
| `checkResponsiveRisk()` | Full audit of all elements |
| `checkFixedDimensions(el)` | Fixed width/min-width issues |
| `checkTouchTargets(el)` | Touch target size (< 44x44px) |
| `checkHorizontalScroll(el)` | Unintended horizontal overflow |
| `checkPositioning(el)` | Absolute/fixed positioning risks |
| `checkTextSizing(el)` | Font size readability |
| `checkTableLayout(el)` | Table responsiveness |

### 測試斷點

```
[320, 375, 414, 768, 1024, 1280, 1440, 1920]
```

標準設備寬度供比較。

### 適用時機

- **發布前** - 運行完整 `checkResponsiveRisk()`
- **除錯移動端問題** - 檢查特定問題元素
- **組件開發** - 驗證新組件在所有斷點
- **代碼審查** - 加入預提交檢查

---

## 相關技能

> Invoke the `Skill` tool with `skill: agnt:visual-diagnostics` — 佈局除錯視覺疊層。

> Invoke the `Skill` tool with `skill: agnt:browser-debug` — 元素檢查與互動追蹤。

> Invoke the `Skill` tool with `skill: agnt:accessibility-audit` — WCAG合規（與觸控目標重疊）。
