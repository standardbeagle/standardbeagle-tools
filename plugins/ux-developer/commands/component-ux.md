---
name: component-ux
description: "Design or review a UI component with UX best practices, accessibility, and interaction patterns. 設計或審查UI組件：狀態、鍵盤、ARIA、響應式、agnt實時分析。 Use when: building new components, reviewing accessibility of existing widgets, spec-ing interaction states."
---

# Component UX Command

設計新組件或審查現有組件，全面考量UX。

## Process

### 1. Understand the Component

收集需求：
- 組件的目的是什麼？
- 解決什麼用戶問題？
- 有哪些交互狀態？
- 使用上下文是什麼（表單、導航、展示）？

### 2. Component UX Checklist

#### Accessibility Foundation
- [ ] Semantic HTML element chosen (button, input, nav, etc.)
- [ ] Keyboard accessible (focusable, operable)
- [ ] ARIA attributes only when semantic HTML insufficient
- [ ] Role, name, and state communicated to assistive tech
- [ ] Focus management for complex widgets
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)

#### Interaction States
每個交互組件需定義以下狀態：

| State | Visual | Behavior | Screen Reader |
|-------|--------|----------|---------------|
| Default | | | |
| Hover | | | |
| Focus | visible ring/outline | | announced |
| Active/Pressed | | | |
| Disabled | reduced opacity, no pointer | not clickable | aria-disabled |
| Loading | spinner/skeleton | | aria-busy |
| Error | error styling | | aria-invalid + message |
| Success | success styling | | announced |

#### Touch & Click Targets
- Minimum 44x44px touch target
- Adequate spacing between targets (8px minimum)
- No hover-only functionality on touch devices

#### Responsive Behavior
- 定義斷點適配
- 觸控與鼠標交互
- 處理方向變化

#### Motion & Animation
- Respect `prefers-reduced-motion`
- 動畫服務目的（反饋、方向感）
- 時長適當（微交互150–300ms）

### 3. Component Design Template

```markdown
## [Component Name]

### Purpose
[What problem does this solve for users?]

### Anatomy
[Describe the parts of the component]
- Container
- Label
- Icon (optional)
- Helper text (optional)

### States
[Visual representation of each state]

### Behavior

#### Keyboard
- `Tab`: Focus the component
- `Enter/Space`: Activate
- `Escape`: Close/cancel (if applicable)
- Arrow keys: Navigate (if applicable)

#### Mouse/Touch
- Click: [action]
- Hover: [feedback]
- Long press: [action if applicable]

### Accessibility
- Role: [button/checkbox/etc.]
- Required attributes: [aria-label, aria-describedby, etc.]
- Announcements: [what screen reader should say]

### Variations
- Size: small, medium, large
- Style: primary, secondary, ghost
- State: default, loading, disabled

### Do's and Don'ts
| Do | Don't |
|----|-------|
| [Good practice] | [Anti-pattern] |

### Code Example
[Accessible implementation example]
```

### 4. Review Existing Component

審查現有代碼時：

1. **Analyze current implementation**
   ```
   Read the component code
   Identify HTML structure, event handlers, styles
   ```

2. **Test with agnt proxy**
   ```
   proxy {action: "start", id: "component-review", target_url: "<URL>"}
   proxy {action: "exec", id: "component-review", code: "__devtool.inspect()"}
   proxy {action: "exec", id: "component-review", code: "__devtool.auditAccessibility()"}
   get_errors {proxy_id: "component-review"}
   ```

3. **Generate improvement report**
   - 現狀評估
   - 發現的具體問題
   - 優先建議
   - 代碼修復

### 5. Generate Component Specification

輸出完整規格：

```markdown
# [Component] Specification

## Overview
[Purpose and usage context]

## Props/API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| | | | |

## Accessibility Specification
- **Role**:
- **Keyboard**:
- **Screen Reader**:
- **Focus**:

## Visual Specification
- **Dimensions**:
- **Colors**: (reference design tokens)
- **Typography**:
- **Spacing**:

## States
[Defined above]

## Testing Checklist
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Touch targets adequate
- [ ] All states implemented
- [ ] Reduced motion respected
- [ ] Error states accessible
```

### 6. Implementation Assistance

提供：
1. 生成無障礙組件代碼
2. 創建無障礙單元測試
3. 為每個狀態編寫Storybook stories
4. 創建文檔
