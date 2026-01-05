---
name: a11y-check
description: Run comprehensive accessibility audit against WCAG 2.2 guidelines with actionable fix recommendations
---

# Accessibility Check Command

Perform a thorough accessibility audit using agnt's browser tools and WCAG 2.2 guidelines.

## Process

### 1. Setup and Capture

If reviewing a live page:
```
1. Use mcp__agnt__proxy to start proxy for the target URL
2. Navigate to the page through the proxy
3. Use mcp__agnt__proxy exec with __devtool.auditAccessibility()
```

If reviewing code:
- Analyze HTML structure, ARIA usage, and semantic markup directly

### 2. Automated Audit

Run comprehensive accessibility checks:

```javascript
// Via agnt proxy exec
__devtool.auditAccessibility()
```

This checks:
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
Note which AAA criteria are met as bonus.

### 4. Manual Testing Checklist

Guide user through manual checks:

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

For each violation, offer to:
1. Generate the fix code
2. Explain the accessibility requirement
3. Provide testing verification steps

## Continuous Monitoring

Suggest setting up:
- Pre-commit accessibility linting
- CI/CD accessibility testing
- Regular manual audits schedule
