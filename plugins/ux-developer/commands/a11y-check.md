---
name: a11y-check
description: "Run comprehensive accessibility audit against WCAG 2.2 with actionable fix recommendations. 執行WCAG 2.2無障礙審計：自動化axe審計、手動清單、修復代碼。 Use when: pre-deploy a11y check, reviewing new component, fixing accessibility bugs."
---

# Accessibility Check Command

使用agnt瀏覽器工具與WCAG 2.2指南進行全面無障礙審計。

## Process

### 1. Setup and Capture

審查實時頁面時：
```
1. proxy {action: "start", id: "a11y", target_url: "<URL>"}
2. Navigate to the page through the proxy
3. proxy {action: "exec", id: "a11y", code: "__devtool.auditAccessibility()"}
```

審查代碼時：
- 直接分析HTML結構、ARIA使用與語義標記

### 2. Automated Audit

運行全面無障礙檢查：

```javascript
// Via agnt proxy exec
__devtool.auditAccessibility()
```

檢查項目：
- Color contrast ratios
- Missing alt text
- Form label associations
- ARIA attribute validity
- Heading hierarchy
- Link text quality
- Focus management

### 3. WCAG 2.2 Criteria Evaluation

#### Level A (Minimum)
- [ ] **1.1.1 Non-text Content**: All images have alt text
- [ ] **1.3.1 Info and Relationships**: Semantic HTML used correctly
- [ ] **1.4.1 Use of Color**: Color not sole means of conveying info
- [ ] **2.1.1 Keyboard**: All functionality keyboard accessible
- [ ] **2.4.1 Bypass Blocks**: Skip links or landmarks present
- [ ] **3.1.1 Language of Page**: Lang attribute set
- [ ] **4.1.1 Parsing**: Valid HTML
- [ ] **4.1.2 Name, Role, Value**: Custom controls properly labeled

#### Level AA (Target)
- [ ] **1.4.3 Contrast (Minimum)**: 4.5:1 for text, 3:1 for large text
- [ ] **1.4.4 Resize Text**: Text resizable to 200% without loss
- [ ] **1.4.10 Reflow**: Content reflows at 320px width
- [ ] **1.4.11 Non-text Contrast**: UI components have 3:1 contrast
- [ ] **2.4.6 Headings and Labels**: Descriptive headings
- [ ] **2.4.7 Focus Visible**: Focus indicator visible
- [ ] **3.2.3 Consistent Navigation**: Navigation consistent across pages
- [ ] **3.2.4 Consistent Identification**: Components identified consistently

#### Level AAA (Enhanced)
記錄已達到之AAA準則作為加分項。

### 4. Manual Testing Checklist

引導用戶完成手動檢查：

#### Keyboard Navigation
```
Test: Tab through entire page
- Can reach all interactive elements?
- Focus order logical?
- No keyboard traps?
- Skip link works?
```

#### Screen Reader Testing
```
Recommended: Test with NVDA (Windows) or VoiceOver (Mac)
- Page title announced?
- Headings navigable?
- Form fields properly labeled?
- Dynamic content announced?
```

#### Visual Testing
```
- Zoom to 200%: Content still usable?
- High contrast mode: Content visible?
- Reduce motion: Animations respect preference?
```

### 5. Generate Accessibility Report

```markdown
## Accessibility Audit Report

**Target**: [URL or component]
**Date**: [date]
**WCAG Target Level**: AA

### Compliance Summary

| Level | Criteria | Pass | Fail | N/A |
|-------|----------|------|------|-----|
| A     | 30       | X    | X    | X   |
| AA    | 20       | X    | X    | X   |
| AAA   | 28       | X    | X    | X   |

### Critical Violations (Level A)

1. **[Criterion]**: [Issue]
   - Location: [element/selector]
   - Impact: [who is affected]
   - Fix: [specific recommendation]
   ```html
   <!-- Before -->
   <img src="photo.jpg">

   <!-- After -->
   <img src="photo.jpg" alt="Description of image content">
   ```

### Serious Violations (Level AA)

[Similar format]

### Moderate Issues

[Similar format]

### Passed Criteria
- [List of passing criteria]

### Testing Notes
- Tested with: [tools used]
- Browser: [browser/version]
- Screen reader: [if used]
```

### 6. Fix Assistance

對每項違規，提供：
1. 生成修復代碼
2. 解釋無障礙要求
3. 提供測試驗證步驟

## Continuous Monitoring

建議設置：
- 預提交無障礙lint
- CI/CD無障礙測試
- 定期手動審計計劃
