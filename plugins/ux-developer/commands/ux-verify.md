---
name: ux-verify
description: Pre-commit/pre-deploy UX verification checklist to catch issues before they ship
---

# UX Verify Command

Run a pre-deployment UX verification checklist. Use this before commits or deployments to catch UX and accessibility issues early.

## Quick Verification Mode

For rapid checks during development:

### 1. Start Verification Session

```
Use mcp__agnt__proxy to start proxy for local dev server
Navigate to the changed pages/components
```

### 2. Automated Checks

Run these via agnt proxy:

```javascript
// Accessibility audit
__devtool.auditAccessibility()

// Check for console errors
// (captured automatically by agnt)

// Performance check
__devtool.getPerformanceMetrics()
```

### 3. UX Verification Checklist

#### Accessibility (Must Pass)
- [ ] All images have meaningful alt text
- [ ] Form inputs have associated labels
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus states visible on all interactive elements
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] No keyboard traps
- [ ] Error messages are descriptive and helpful
- [ ] Dynamic content changes announced to screen readers

#### Interaction (Must Pass)
- [ ] All buttons/links have clear purpose
- [ ] Click/touch targets are at least 44x44px
- [ ] Loading states shown for async operations
- [ ] Form validation provides immediate feedback
- [ ] Destructive actions require confirmation
- [ ] Undo available where appropriate

#### Responsive (Must Pass)
- [ ] Content readable at 320px width
- [ ] No horizontal scrolling at mobile sizes
- [ ] Touch-friendly on mobile (no hover-only)
- [ ] Text readable without zooming

#### Performance UX (Should Pass)
- [ ] First contentful paint < 1.5s
- [ ] No layout shifts (CLS < 0.1)
- [ ] Interactive within 3s
- [ ] Images optimized and lazy-loaded

#### Content (Should Pass)
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)
- [ ] Link text is descriptive (not "click here")
- [ ] Error messages explain how to fix
- [ ] Success messages confirm action taken

### 4. Quick Test Protocol

#### 30-Second Keyboard Test
```
1. Press Tab from top of page
2. Can you reach all interactive elements?
3. Can you activate buttons with Enter/Space?
4. Can you close modals with Escape?
5. Is there a visible focus indicator?
```

#### 30-Second Screen Reader Test
```
1. Turn on VoiceOver (Cmd+F5 Mac) or NVDA (Windows)
2. Does the page title make sense?
3. Are headings announced with levels?
4. Are form fields properly labeled?
5. Are buttons and links clearly named?
```

#### 30-Second Mobile Test
```
1. Open in device mode (F12 → toggle device)
2. Is all content visible without scrolling right?
3. Are tap targets large enough?
4. Does the layout make sense at 375px?
```

### 5. Generate Verification Report

```markdown
## UX Verification Report

**Date**: [timestamp]
**Target**: [URL/component]
**Verified by**: [automated/manual]

### Status: [PASS/FAIL/WARNINGS]

### Automated Checks
| Check | Status | Details |
|-------|--------|---------|
| Accessibility Audit | PASS/FAIL | X issues |
| Console Errors | PASS/FAIL | X errors |
| Performance | PASS/FAIL | FCP: Xs, CLS: X |

### Manual Verification
| Check | Status | Notes |
|-------|--------|-------|
| Keyboard Navigation | | |
| Focus Visibility | | |
| Mobile Layout | | |
| Error Handling | | |

### Issues Found
[List any issues requiring fix before deploy]

### Approved for Deploy: YES/NO
```

## Pre-Commit Hook Integration

Suggest adding to pre-commit:

```bash
#!/bin/bash
# .git/hooks/pre-commit or via husky

# Run accessibility linting
npx eslint --plugin jsx-a11y .

# Check for console.log statements
git diff --cached | grep -E "console\.(log|debug|info)" && {
  echo "Remove console statements before committing"
  exit 1
}

# Check for TODO/FIXME in accessibility-related code
git diff --cached | grep -E "(aria-|alt=|role=).*TODO" && {
  echo "Complete accessibility TODOs before committing"
  exit 1
}
```

## CI/CD Integration

Recommend these checks in CI:

```yaml
# Example GitHub Actions
- name: Accessibility Audit
  run: |
    npx pa11y-ci ./urls.txt

- name: Lighthouse Audit
  run: |
    npx lhci autorun

- name: Visual Regression
  run: |
    npx percy snapshot ./storybook-static
```

## Severity Levels

**Blockers (Must fix before deploy):**
- Missing form labels
- Keyboard traps
- Insufficient contrast on essential elements
- Broken critical user flows

**High (Fix within 24 hours):**
- Missing alt text on meaningful images
- Poor error messages
- Missing focus indicators

**Medium (Fix within sprint):**
- Suboptimal touch targets
- Performance issues
- Minor heading hierarchy issues

**Low (Backlog):**
- Enhancement opportunities
- Nice-to-have improvements
