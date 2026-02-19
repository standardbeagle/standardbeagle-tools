---
name: accessibility-audit
description: Accessibility auditing with axe-core, ARIA inspection, contrast checks, tab order, and screen reader simulation
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Accessibility Audit Skill

This skill documents accessibility auditing and inspection functions available through the `__devtool` API. All functions are executed via the proxy exec action.

## Invocation Format

All accessibility functions are called using proxy exec:

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

**Prerequisites**: A proxy must be running and the browser must be connected via the proxy URL.

---

## Audit Modes Overview

The `auditAccessibility` function supports multiple audit modes optimized for different use cases:

| Mode | Engine | Rules | Speed | Use Case |
|------|--------|-------|-------|----------|
| **standard** | axe-core | 90+ WCAG 2.1 rules | 100-300ms | Default comprehensive audit |
| **fast** | Custom | Focus indicators, color schemes | 50-100ms | Quick checks during development |
| **comprehensive** | Extended | State-specific contrast, responsive | 500-2000ms | Pre-release audits |
| **basic** | Fallback | Minimal checks | 10-50ms | Fallback when axe-core fails |

### When to Use Each Mode

**Standard Mode** (default):
- Regular development workflow
- CI/CD pipeline integration
- First pass accessibility review
- Most common use case

**Fast Mode**:
- Rapid iteration during UI development
- Quick sanity checks between changes
- When you need immediate feedback
- Resource-constrained environments

**Comprehensive Mode**:
- Pre-release accessibility review
- Client deliverables
- When thoroughness matters more than speed
- Responsive design verification
- State-specific testing (hover, focus, active)

**Basic Mode**:
- Fallback when axe-core unavailable
- Minimal environments
- Quick existence checks for a11y attributes

---

## auditAccessibility

Run a full accessibility audit on the page with configurable modes.

**Signature**: `auditAccessibility(options?)`

**Parameters**:
- `options.mode`: string - Audit mode: `standard` (default), `fast`, `comprehensive`, `basic`
- `options.raw`: boolean - Return raw verbose output (default: false for AI-optimized grouped output)
- `options.selector`: string - Limit audit to elements within selector

**Returns**: `{issues: [...], summary: {critical, serious, moderate, minor}}`

### Standard Mode (Default)

Uses axe-core for WCAG 2.1 compliance with 90+ rules.

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

**With explicit mode**:
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

### Fast Mode

Quick checks for focus indicators and color schemes.

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

### Comprehensive Mode

Extended audit with state-specific contrast and responsive checks.

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

### Basic Mode

Minimal fallback checks when axe-core is unavailable.

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

### Raw Output Mode

Get verbose detailed output with all issues and context.

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

### Scoped Audit

Limit audit to a specific section of the page.

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

### Response Structure

**AI-optimized output (default)**:
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

**Raw output**:
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

Get ARIA and role information for a specific element.

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

**Use cases**:
- Verify button/link accessibility
- Check form field labeling
- Debug screen reader announcements
- Validate ARIA implementation

**Example - Check form field**:
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

**Example - Check navigation menu**:
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

Calculate color contrast ratio for text elements.

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

**WCAG Contrast Requirements**:
- **AA Normal Text**: 4.5:1 minimum
- **AA Large Text** (18pt+ or 14pt+ bold): 3:1 minimum
- **AAA Normal Text**: 7:1 minimum
- **AAA Large Text**: 4.5:1 minimum

**Example - Check heading contrast**:
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

**Example - Check link contrast**:
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

**Use cases**:
- Verify text readability
- Check link colors against backgrounds
- Validate design system colors
- Pre-launch accessibility review

---

## getTabOrder

Get focusable elements in keyboard tab order.

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

**Response includes for each element**:
- `element`: Selector path to the focusable element
- `tabIndex`: The tabindex attribute value (-1, 0, or positive)
- `natural`: Boolean - whether element is naturally focusable (buttons, links, inputs)

**Tab Order Rules**:
1. Elements with positive tabindex (in numerical order)
2. Elements with tabindex="0" and naturally focusable elements (in DOM order)
3. Elements with tabindex="-1" are focusable via JavaScript only

**Use cases**:
- Verify logical tab order
- Find skip links
- Debug keyboard navigation
- Identify focus traps
- Check for missing focusable elements

**Example - Check form tab order**:
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

**Common issues to look for**:
- Positive tabindex values (usually indicates problems)
- Important controls missing from tab order
- Visual order not matching tab order
- Interactive elements with tabindex="-1" that should be focusable

---

## getScreenReaderText

Get text as a screen reader would announce it.

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

**The function considers**:
- aria-label attribute
- aria-labelledby referenced content
- aria-describedby descriptions
- Visible text content
- alt text for images
- title attributes
- Hidden elements (aria-hidden="true")
- Visually hidden text (.sr-only, .visually-hidden)

**Use cases**:
- Verify button announces correctly
- Check image alt text
- Debug confusing screen reader output
- Test icon-only buttons
- Validate form field announcements

**Example - Check icon button**:
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

**Example - Check complex widget**:
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

## Interpreting Audit Results

### Impact Levels

| Level | Description | Action Required |
|-------|-------------|-----------------|
| **critical** | Completely blocks access for some users | Must fix immediately |
| **serious** | Significantly impacts usability | Should fix before release |
| **moderate** | Causes confusion or difficulty | Plan to fix |
| **minor** | Minor annoyance | Fix when convenient |

### Common Issues and Remediation

#### Color Contrast Issues

**Problem**: Insufficient contrast between text and background.

**Remediation**:
1. Use the getContrast function to check specific elements
2. Adjust foreground or background color to meet WCAG requirements
3. For AA compliance: 4.5:1 for normal text, 3:1 for large text
4. Consider adding high-contrast mode option

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

#### Missing Form Labels

**Problem**: Form inputs without associated labels.

**Remediation**:
1. Add `<label for="input-id">` elements
2. Or use aria-label for simple inputs
3. Or use aria-labelledby for complex labels

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

#### Images Without Alt Text

**Problem**: Images missing alt attribute.

**Remediation**:
1. Add descriptive alt text for informative images
2. Use alt="" for decorative images
3. Use aria-hidden="true" for purely decorative icons

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

#### Missing Button Names

**Problem**: Buttons without accessible names (icon-only buttons).

**Remediation**:
1. Add aria-label to describe the action
2. Or add visually hidden text inside the button
3. Or use aria-labelledby to reference visible text

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

#### Missing Focus Indicators

**Problem**: Focus state not visible for keyboard users.

**Remediation**:
1. Never remove outline without replacement
2. Add visible focus styles (:focus-visible)
3. Use sufficient contrast for focus indicator

**Check with fast mode**:
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

#### Keyboard Navigation Issues

**Problem**: Content not reachable via keyboard.

**Remediation**:
1. Use native interactive elements (button, a, input)
2. Add tabindex="0" to custom interactive elements
3. Implement keyboard event handlers for custom widgets

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

## Common Accessibility Workflows

### Workflow 1: Initial Page Audit

Run a comprehensive check on a new page:

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

### Workflow 2: Form Accessibility Check

Check each form field has proper labels:

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

Verify error messages are announced:

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

Check submit button is accessible:

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

### Workflow 3: Navigation Accessibility

Check main navigation:

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

Verify skip links exist:

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

Check dropdown menu accessibility:

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

### Workflow 4: Modal/Dialog Check

Check dialog has proper role:

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

Verify screen reader announcement:

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

Check focus is trapped in modal:

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

### Workflow 5: Pre-Release Comprehensive Audit

Run comprehensive mode for thorough check:

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

Get raw output for detailed remediation:

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

### Workflow 6: Quick Development Check

Use fast mode during active development:

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

## Quick Reference Table

| Function | Purpose | Key Return Values |
|----------|---------|-------------------|
| `auditAccessibility(opts)` | Full page audit | issues array, summary by impact |
| `getA11yInfo(sel)` | Element ARIA info | role, name, description, state |
| `getContrast(sel)` | Color contrast check | ratio, passesAA, passesAAA |
| `getTabOrder()` | Keyboard navigation | ordered focusable elements |
| `getScreenReaderText(sel)` | SR announcement | text string |

---

## WCAG Quick Reference

### WCAG 2.1 Principles (POUR)

1. **Perceivable**: Information must be presentable in ways users can perceive
2. **Operable**: Interface must be operable by various input methods
3. **Understandable**: Information and operation must be understandable
4. **Robust**: Content must be robust enough for various assistive technologies

### Key Success Criteria

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

## Tips for Effective Accessibility Testing

1. **Start with standard mode** - Catches most issues with reasonable speed
2. **Use fast mode during iteration** - Quick feedback while coding
3. **Run comprehensive before release** - Thorough check for edge cases
4. **Check tab order separately** - Logical order matters for keyboard users
5. **Verify screen reader text** - What you see is not always what's announced
6. **Test with real assistive tech** - Automated tools catch ~30% of issues
7. **Consider different user needs** - Low vision, motor impairments, cognitive
