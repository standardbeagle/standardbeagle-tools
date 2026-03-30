---
name: responsive-check
description: Detect responsive layout risks before they cause problems - fixed widths, touch targets, horizontal scroll, positioning issues
---

# Responsive Layout Check Skill

This skill provides responsive design validation using agnt's responsive risk analysis. Detect layout issues that will cause problems at different viewport sizes before users encounter them.

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

## First: Check for Errors

Responsive layouts often fail due to JavaScript errors. Check first:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {"proxy_id": "dev", "include_warnings": false}
}
```

---

## Quick Check: Full Responsive Audit

Run a comprehensive responsive risk analysis:

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

Returns:
- `issues` - Array of elements with responsive problems
- `summary` - Total, errors, warnings count
- `currentViewport` - Width and height at time of check
- `breakpointsTested` - Standard breakpoints: [320, 375, 414, 768, 1024, 1280, 1440, 1920]

---

## Individual Checks

### Fixed Dimensions

Find elements with fixed pixel widths that may cause horizontal scroll:

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

### Touch Targets

Find interactive elements smaller than 44x44px (Apple HIG minimum):

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

Checks: `<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`, elements with `onclick`, `role="button"`, or `tabindex`.

### Horizontal Scroll

Find elements causing unintended horizontal overflow:

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

Detects elements where `scrollWidth > clientWidth` without intentional `overflow-x` settings.

### Positioning Issues

Find absolute/fixed elements that may go offscreen or obscure content:

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

Checks:
- Positioned elements extending past viewport edges
- Large fixed elements that may obscure content on mobile
- High z-index fixed elements

### Text Sizing

Find text that may be unreadable on mobile:

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

Flags:
- Font size < 12px (hard to read on mobile)
- Extreme font sizes (> 48px or < 10px) with viewport units

### Table Layout

Find tables that will cause horizontal scroll:

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

Detects:
- Tables wider than viewport
- Wide tables without scroll wrapper

---

## Issue Types Reference

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

## Workflow: Pre-Launch Mobile Check

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

## Workflow: Check Specific Element

Check responsive risks for a specific element:

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

## Viewport Context

Always check current viewport before running responsive checks:

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

## Quick Reference

### Check Functions

| Function | Purpose |
|----------|---------|
| `checkResponsiveRisk()` | Full audit of all elements |
| `checkFixedDimensions(el)` | Fixed width/min-width issues |
| `checkTouchTargets(el)` | Touch target size (< 44x44px) |
| `checkHorizontalScroll(el)` | Unintended horizontal overflow |
| `checkPositioning(el)` | Absolute/fixed positioning risks |
| `checkTextSizing(el)` | Font size readability |
| `checkTableLayout(el)` | Table responsiveness |

### Breakpoints Tested

```
[320, 375, 414, 768, 1024, 1280, 1440, 1920]
```

Standard device widths for comparison.

### When to Use

- **Before launch** - Run full `checkResponsiveRisk()`
- **Debugging mobile issues** - Check specific problem elements
- **Component development** - Validate new components for all breakpoints
- **Code review** - Add to pre-commit checks

---

## Related Skills

- **`visual-diagnostics`** - Visual overlays for layout debugging
- **`browser-debug`** - Element inspection and interaction tracking
- **`accessibility-audit`** - WCAG compliance (overlaps with touch targets)
