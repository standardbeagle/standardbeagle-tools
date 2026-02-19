---
name: visual-diagnostics
description: Visual overlays for layout debugging - outline elements, show grid/flex containers, typography audit, z-index analysis, interactive element visualization
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Visual Diagnostics Skill

This skill provides visual CSS-based debugging overlays using agnt's diagnostics module. Turn invisible layout concepts into visible patterns for rapid debugging.

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

Visual issues often stem from JavaScript errors. Check first:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {"proxy_id": "dev", "include_warnings": false}
}
```

Fix errors before auditing layout.

---

## Structure & Layout Diagnostics

### Outline All Elements

Color-code elements by depth level:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.outlineAll()"
  }
}
```

Colors cycle through: red → green → blue → yellow → cyan based on nesting depth.

### Show Semantic Elements

Highlight HTML5 semantic elements by type:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showSemanticElements()"
  }
}
```

Returns color legend:
- `div` - red
- `span` - blue
- `section` - green
- `article` - purple
- `header` - orange
- `footer` - cyan
- `nav` - magenta
- `aside` - lime
- `main` - pink

### Show Container Classes

Highlight container/wrapper elements:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showContainers()"
  }
}
```

Targets: `.container`, `.wrapper`, `[class*="container"]`, `[class*="wrapper"]`

### Show Grid Containers

Visualize CSS Grid layouts:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showGrid()"
  }
}
```

Adds "GRID" label and purple outline to grid containers.

### Show Flexbox Containers

Visualize Flexbox layouts:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showFlexbox()"
  }
}
```

Adds "FLEX" label and cyan outline to flex containers.

### Show Gap Usage

Highlight elements using CSS gap:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showGaps()"
  }
}
```

---

## Typography Diagnostics

### Typography Audit Panel

Open a panel showing all unique text styles on the page:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showTypographyPanel()"
  }
}
```

Returns:
- Count of unique style combinations
- Font size, family, weight, line-height, color for each
- Usage count (flag if only used once = potential inconsistency)
- Preview text in each style

### Highlight Inconsistent Text

Find text styles used only once (likely inconsistent):

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.highlightInconsistentText()"
  }
}
```

Highlights one-off font sizes in red.

### Show Text Bounds

Outline all text elements:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showTextBounds()"
  }
}
```

Blue dotted outline on `<p>`, `<h1>`-`<h6>`, `<span>`, `<a>`.

---

## Stacking & Layering

### Show Z-Index Elements

Find and highlight all elements with z-index:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showStacking()"
  }
}
```

Returns sorted list of elements by z-index value (highest first).

### Show Positioned Elements

Highlight elements by position type:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showPositioned()"
  }
}
```

Color legend:
- `absolute` - red outline
- `fixed` - orange outline
- `sticky` - purple outline

### Reduce Opacity

Fade all elements to see layering:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.opacity(0.3)"
  }
}
```

Useful for seeing overlapping elements.

---

## Interactive Element Diagnostics

### Show Interactive Elements

Highlight all clickable/focusable elements:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showInteractive()"
  }
}
```

Lime outline on: `<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`, `[onclick]`, `[role="button"]`.

### Show Focus Order

Number all focusable elements by tab order:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showFocusOrder()"
  }
}
```

Adds numbered badges (1, 2, 3...) showing keyboard navigation sequence.

### Show Click Targets

Enforce minimum 44x44px click target visualization:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showClickTargets()"
  }
}
```

Shows dashed orange outline where 44x44 minimum would be.

---

## Color & Spacing Analysis

### Show Color Palette

Open panel with all colors used on page:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showColorPalette()"
  }
}
```

Shows color swatches with hex/rgb values and usage counts.

### Show Spacing Scale

Open panel with all margin/padding values:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showSpacingScale()"
  }
}
```

Shows values in px and rem with usage counts. Helps identify spacing inconsistencies.

---

## Viewport Information

### Show Viewport Panel

Display current viewport info in a panel:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showViewportInfo()"
  }
}
```

Shows: viewport dimensions, screen dimensions, device pixel ratio.

---

## Control Functions

### Clear Specific Mode

Remove one diagnostic overlay:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.clear('grid')"
  }
}
```

### Clear All Diagnostics

Remove all overlays and panels:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.clearAll()"
  }
}
```

### List Active Modes

See what diagnostics are currently active:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.list()"
  }
}
```

---

## Quick Reference

### Structure Diagnostics

| Function | Purpose |
|----------|---------|
| `outlineAll()` | Color-code by depth |
| `showSemanticElements()` | Highlight HTML5 elements |
| `showContainers()` | Container/wrapper classes |
| `showGrid()` | CSS Grid containers |
| `showFlexbox()` | Flexbox containers |
| `showGaps()` | Gap properties |

### Typography Diagnostics

| Function | Purpose |
|----------|---------|
| `showTypographyPanel()` | All unique text styles |
| `highlightInconsistentText()` | One-off font sizes |
| `showTextBounds()` | Text element bounds |

### Stacking Diagnostics

| Function | Purpose |
|----------|---------|
| `showStacking()` | Z-index elements |
| `showPositioned()` | Absolute/fixed/sticky |
| `opacity(level)` | Fade all elements |

### Interactive Diagnostics

| Function | Purpose |
|----------|---------|
| `showInteractive()` | Clickable elements |
| `showFocusOrder()` | Tab sequence numbers |
| `showClickTargets()` | 44x44px minimum |

### Analysis Panels

| Function | Purpose |
|----------|---------|
| `showColorPalette()` | All colors used |
| `showSpacingScale()` | Margin/padding values |
| `showViewportInfo()` | Viewport dimensions |

---

## Common Workflows

### Debug Layout Structure

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.outlineAll()"
  }
}
```

Then:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showGrid()"
  }
}
```

### Audit Typography Consistency

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showTypographyPanel()"
  }
}
```

### Check Keyboard Navigation

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showFocusOrder()"
  }
}
```

### Find Z-Index Conflicts

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool_diagnostics.showStacking()"
  }
}
```

---

## Related Skills

- **`responsive-check`** - Responsive layout risk detection
- **`browser-debug`** - Element inspection and interaction tracking
- **`quality-audits`** - DOM complexity and CSS architecture audits
