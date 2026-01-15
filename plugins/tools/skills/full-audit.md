---
name: full-audit
description: Comprehensive page audit combining accessibility, DOM complexity, CSS architecture, security, and performance checks
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Full Audit Skill

This skill provides a comprehensive page audit workflow that combines accessibility, DOM complexity, CSS architecture, security, and performance audits into a complete quality review process.

## Prerequisites

A proxy must be running and the browser connected:

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

## Quick Full Audit

### Single Command Comprehensive Check

Run all quality checks in one call:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditPageQuality()"
  }
}
```

Returns scores for: DOM, TBT (Total Blocking Time), memory, event listeners, text fragility, responsive design, and CLS (Cumulative Layout Shift).

---

## Pre-Release Audit Workflow

### Step 1: Take Baseline Screenshot

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('pre-release-audit')"
  }
}
```

### Step 2: Run Comprehensive Quality Audit

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditPageQuality()"
  }
}
```

### Step 3: Run Accessibility Audit

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

### Step 4: Run Security Audit

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditSecurity()"
  }
}
```

### Step 5: Check Tab Order (Keyboard Navigation)

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

### Pass Criteria

| Category | Requirement |
|----------|-------------|
| Page Quality Grade | B or higher (score >= 80) |
| Security | No critical issues |
| Accessibility | No critical/serious issues |
| Tab Order | Logical navigation |

---

## Accessibility Audit

### Standard Audit (axe-core)

Uses 90+ WCAG 2.1 rules, runs in 100-300ms:

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

### Fast Mode (Quick Check)

For rapid iteration during development (50-100ms):

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

### Comprehensive Mode (Pre-Release)

Extended audit with state-specific contrast and responsive checks (500-2000ms):

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

### Scoped Audit

Limit audit to specific section:

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

### Raw Output for Detailed Remediation

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

### Accessibility Helper Functions

**Check ARIA Information**:
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

**Check Color Contrast**:
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

**Check Screen Reader Text**:
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

---

## DOM Complexity Audit

### Run DOM Audit

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditDOMComplexity()"
  }
}
```

### Thresholds (Lighthouse Standards)

| Metric | Optimal | Acceptable | Poor |
|--------|---------|------------|------|
| Total Nodes | < 800 | < 1500 | > 1500 |
| Max Depth | < 15 | < 32 | > 32 |
| Max Children | < 30 | < 60 | > 60 |

### Get Raw Details for Fixing

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditDOMComplexity({raw: true})"
  }
}
```

### Issue Types to Watch For

| Issue | Severity | Fix |
|-------|----------|-----|
| `duplicate-id` | Error | Ensure unique IDs |
| `excessive-children` | Warning/Error | Componentization |
| `excessive-depth` | Warning/Error | Flatten structure |
| `large-list` | Warning/Error | Virtualization |
| `large-table` | Warning/Error | Pagination |

---

## CSS Architecture Audit

### Run CSS Audit

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditCSS()"
  }
}
```

### Get Detailed Breakdown

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditCSS({raw: true})"
  }
}
```

### CSS Health Thresholds

| Metric | Good | Moderate | Poor |
|--------|------|----------|------|
| ID Selectors | < 5 | 5-10 | > 10 |
| !important | < 5 | 5-10 | > 10 |
| Unique Colors | < 15 | 15-30 | > 30 |
| Nesting Depth | < 4 | 4-6 | > 6 |

### Grade Interpretation

| Grade | Score | Interpretation |
|-------|-------|----------------|
| A | 90+ | Excellent architecture |
| B | 80-89 | Good, minor improvements |
| C | 70-79 | Needs improvement |
| D | 60-69 | Significant issues |
| F | <60 | Major refactoring needed |

---

## Security Audit

### Run Security Audit

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditSecurity()"
  }
}
```

### Get Detailed Security Report

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditSecurity({raw: true})"
  }
}
```

### Security Issues by Priority

**Deployment Blockers (Must Fix)**:
- `javascript-urls` - XSS vector
- `react-dev-build` - Production leak
- `mixed-content-active` - Scripts over HTTP

**Should Fix Before Release**:
- `missing-csp` - No Content-Security-Policy
- `inline-scripts` - CSP compatibility
- `missing-sri` - External script integrity

**Monitor/Plan**:
- `inline-event-handlers` - onclick, onload
- `unsandboxed-iframe` - External iframe security

---

## Performance Audit

### Check Mutation Rate (UI Responsiveness)

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

**Health Levels**:
- `ok`: < 20 mutations/second
- `warning`: 20-50 mutations/second
- `critical`: > 50 mutations/second

### Performance Thresholds

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| TBT | < 200ms | 200-600ms | > 600ms |
| LCP | < 2500ms | 2500-4000ms | > 4000ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |

---

## Audit Remediation Workflows

### Fix Accessibility Issues

1. Run audit to identify issues:
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

2. For color contrast issues:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getContrast('.low-contrast-element')"
  }
}
```

3. For missing labels:
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

4. Verify screen reader output:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getScreenReaderText('.icon-only-button')"
  }
}
```

### Fix DOM Complexity Issues

1. Identify problematic elements:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditDOMComplexity({raw: true})"
  }
}
```

2. Highlight heavy elements:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('ul.product-list', {color: 'red', label: 'Heavy list'})"
  }
}
```

3. Screenshot for documentation:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('dom-complexity-issues')"
  }
}
```

### Fix CSS Architecture Issues

1. Get detailed CSS report:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditCSS({raw: true})"
  }
}
```

**Key areas in raw output**:
- `architecture.idSelectors` - Refactor to classes
- `architecture.fragilePatterns` - Fix universal/positional selectors
- `consistency.colors` - Consolidate color palette
- `tailwind.usage.arbitraryValues` - Move to tailwind.config.js

---

## Audit Report Generation

### Generate Comprehensive Report

Run all audits and take screenshots:

```javascript
// 1. Quality audit
__devtool.auditPageQuality()

// 2. Accessibility audit
__devtool.auditAccessibility({mode: 'comprehensive'})

// 3. Security audit
__devtool.auditSecurity()

// 4. CSS audit
__devtool.auditCSS()

// 5. DOM complexity
__devtool.auditDOMComplexity()

// 6. Screenshot final state
await __devtool.screenshot('audit-complete')
```

### Audit Summary Template

After running audits, summarize:

| Category | Score | Grade | Issues |
|----------|-------|-------|--------|
| Page Quality | X | X | X critical, X serious |
| Accessibility | - | X | X violations |
| Security | X | X | X critical |
| CSS | X | X | X warnings |
| DOM | X | X | X issues |

---

## Quick Reference

### Audit Functions

| Function | Purpose | Speed |
|----------|---------|-------|
| `auditPageQuality(opts)` | Comprehensive quality | 500-2000ms |
| `auditAccessibility(opts)` | WCAG compliance | 100-2000ms |
| `auditSecurity(opts)` | Security vulnerabilities | 100-300ms |
| `auditCSS(opts)` | CSS architecture | 100-500ms |
| `auditDOMComplexity(opts)` | DOM structure | 50-100ms |

### Accessibility Helpers

| Function | Purpose |
|----------|---------|
| `getA11yInfo(sel)` | ARIA role, name, state |
| `getContrast(sel)` | Color contrast ratio |
| `getTabOrder()` | Keyboard navigation order |
| `getScreenReaderText(sel)` | Screen reader announcement |

### Output Modes

| Mode | Flag | Use Case |
|------|------|----------|
| Default | (none) | AI-optimized, token-efficient |
| Raw | `raw: true` | Detailed remediation |

---

## CI/CD Integration Checklist

For automated quality gates:

1. **Page Quality**
   - [ ] Overall score >= 80 (Grade B)
   - [ ] No critical DOM issues
   - [ ] TBT < 600ms

2. **Accessibility**
   - [ ] No critical violations
   - [ ] No serious violations
   - [ ] Tab order is logical

3. **Security**
   - [ ] No javascript: URLs
   - [ ] No development builds
   - [ ] HTTPS enabled
   - [ ] No mixed active content

4. **CSS**
   - [ ] Score >= 70 (Grade C)
   - [ ] < 10 !important declarations
   - [ ] No extreme specificity issues

5. **DOM**
   - [ ] Total nodes < 1500
   - [ ] Max depth < 32
   - [ ] No duplicate IDs
