---
name: browser-debug
description: Complete browser debugging workflow combining element inspection, layout diagnostics, interaction tracking, and visual tools via agnt proxy
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Browser Debugging Skill

This skill provides a comprehensive browser debugging workflow using agnt's browser integration. It combines element inspection, layout diagnostics, interaction tracking, and visual tools into practical debugging scenarios.

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

## Quick Start: Debug Any Issue

### Step 1: Understand the Current State

Take a screenshot and get page context:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('debug-state')"
  }
}
```

### Step 2: Check for JavaScript Errors

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["error"]
  }
}
```

### Step 3: Run Layout Diagnostics

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.diagnoseLayout()"
  }
}
```

---

## Element Inspection Toolkit

### Inspect Any Element

Get comprehensive info about a specific element:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.inspect('#problem-element')"
  }
}
```

Returns: info, position, box model, layout, stacking context, container, visibility, and viewport status.

### Get Specific CSS Properties

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getComputed('.element', ['display', 'position', 'z-index', 'flex-direction'])"
  }
}
```

### Check Box Model

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getBox('.element')"
  }
}
```

Returns content, padding, border, and margin values for debugging spacing issues.

---

## Layout Problem Workflows

### Workflow: Fix Horizontal Scrollbar

1. Find elements causing overflow:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.findOverflows()"
  }
}
```

2. Highlight the problematic element:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('.overflowing-element', {color: 'red', label: 'Overflow'})"
  }
}
```

3. Check its box model to understand the issue:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getBox('.overflowing-element')"
  }
}
```

### Workflow: Fix Z-Index Issues

1. Find all stacking contexts:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.findStackingContexts()"
  }
}
```

2. Check specific element's stacking:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getStacking('.dropdown-menu')"
  }
}
```

3. Check for overlap between elements:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.checkOverlap('.dropdown-menu', '.modal')"
  }
}
```

### Workflow: Debug Flexbox/Grid Layout

1. Check container layout properties:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getLayout('.flex-container')"
  }
}
```

2. Walk through children:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.walkChildren('.flex-container', {maxDepth: 1})"
  }
}
```

### Workflow: Debug Absolute Positioning

1. Find the containing block:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getContainer('.absolute-element')"
  }
}
```

2. Walk parent chain:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.walkParents('.absolute-element')"
  }
}
```

---

## Interaction Debugging Workflows

### Workflow: Debug Click Not Working

1. Check what element received the click:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getLastClick()"
  }
}
```

2. Check if DOM changed after click:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getTriggeredBy('click')"
  }
}
```

3. Get full click context with mouse trail:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getLastClickContext()"
  }
}
```

**Common Issues**:
- Click hit wrong element (check target selector)
- Event propagation stopped
- Element moved between mousedown and mouseup
- Element covered by invisible overlay

### Workflow: Debug Modal Not Opening

1. Verify click registered on trigger:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getClicksOn('modal')"
  }
}
```

2. Check for DOM additions (modal being rendered):
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getAdded(Date.now() - 5000)"
  }
}
```

3. Enable mutation highlighting and retry:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.enableHighlighting(); __devtool.mutations.highlightRecent(3000)"
  }
}
```

### Workflow: Debug Form Validation

1. Check interactions on form:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getHistory(10)"
  }
}
```

2. Look for class changes (error states):
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getModified(Date.now() - 3000)"
  }
}
```

3. Check blur-triggered mutations:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getTriggeredBy('blur')"
  }
}
```

---

## Visual Debugging Tools

### Highlight Elements for Discussion

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('#navigation', {color: 'blue', label: 'Navigation'})"
  }
}
```

### Highlight Multiple Elements

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "[__devtool.highlight('.sidebar', {color: 'green', label: 'Sidebar'}), __devtool.highlight('.content', {color: 'purple', label: 'Content'})]"
  }
}
```

### Take Screenshot with Highlights

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('highlighted-layout')"
  }
}
```

### Clear All Highlights

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.clearAllOverlays()"
  }
}
```

---

## Sketch Mode for Wireframing

### Open Sketch Mode

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.open()"
  }
}
```

### Available Tools

**Basic Shapes**: `select`, `rectangle`, `ellipse`, `line`, `arrow`, `freedraw`, `text`, `eraser`

**Wireframe Elements**: `button`, `input`, `note`, `image`

### Set Tool

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.setTool('note')"
  }
}
```

### Save Sketch

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.save()"
  }
}
```

### Undo/Redo

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.undo()"
  }
}
```

---

## Performance Debugging

### Check Mutation Rate

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
- `critical`: > 50 mutations/second (performance issue)

### Check Correlation Statistics

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getCorrelationStats()"
  }
}
```

Shows which interaction types cause the most DOM updates and their latency.

### Find Spontaneous Mutations

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getUntriggered()"
  }
}
```

Find DOM changes not triggered by user interaction (timers, WebSocket updates, polling).

---

## Quick Reference

### Inspection Functions

| Function | Purpose |
|----------|---------|
| `inspect(sel)` | Complete element inspection |
| `getElementInfo(sel)` | Basic tag, classes, attributes |
| `getPosition(sel)` | Bounding rect coordinates |
| `getComputed(sel, props)` | Computed CSS values |
| `getBox(sel)` | Box model (margin, padding, etc.) |
| `getLayout(sel)` | Display type, flex/grid properties |
| `getStacking(sel)` | Z-index and stacking context |
| `getContainer(sel)` | Containing block, scroll container |

### Layout Diagnostics

| Function | Purpose |
|----------|---------|
| `findOverflows()` | Elements causing horizontal scrollbar |
| `findStackingContexts()` | All stacking context elements |
| `findOffscreen()` | Elements outside viewport |
| `diagnoseLayout(sel?)` | All layout checks combined |

### Visual Functions

| Function | Purpose |
|----------|---------|
| `highlight(sel, opts)` | Add colored overlay |
| `removeHighlight(id)` | Remove specific overlay |
| `clearAllOverlays()` | Remove all overlays |
| `screenshot(name, sel)` | Capture screenshot |

### Interaction Tracking

| Function | Purpose |
|----------|---------|
| `interactions.getHistory(n)` | Recent interactions |
| `interactions.getLastClick()` | Most recent click |
| `interactions.getLastClickContext(ms)` | Click with mouse trail |
| `interactions.getClicksOn(sel)` | Clicks on selector |

### Mutation Tracking

| Function | Purpose |
|----------|---------|
| `mutations.getHistory(n)` | Recent DOM mutations |
| `mutations.getAdded(since)` | Added elements |
| `mutations.getRemoved(since)` | Removed elements |
| `mutations.getModified(since)` | Attribute changes |
| `mutations.getTriggeredBy(type)` | Mutations by interaction type |
| `mutations.getRateStats()` | Performance metrics |
| `mutations.highlightRecent(ms)` | Visual highlight recent changes |

---

## Common Debugging Checklist

When debugging any browser issue:

1. **Capture State**
   - [ ] Take screenshot
   - [ ] Check for JavaScript errors in proxylog

2. **Analyze Structure**
   - [ ] Run `diagnoseLayout()` for layout issues
   - [ ] Use `inspect()` on specific elements
   - [ ] Check computed styles with `getComputed()`

3. **Track Interactions**
   - [ ] Verify clicks hit correct targets
   - [ ] Check mutations triggered by interactions
   - [ ] Look for spontaneous DOM changes

4. **Visualize**
   - [ ] Highlight problematic elements
   - [ ] Use sketch mode for annotations
   - [ ] Take screenshots for documentation

5. **Clean Up**
   - [ ] Clear overlays when done
   - [ ] Clear interaction/mutation history if needed
