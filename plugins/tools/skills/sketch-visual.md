---
name: sketch-visual
description: Wireframing with sketch mode and visual highlighting including screenshots, overlays, and UI annotation tools
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Sketch Mode & Visual Tools Skill

This skill documents sketch mode for wireframing annotations and visual highlighting functions available through the `__devtool` API.

## Invocation Format

All visual tools are called using proxy exec:

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

## Sketch Mode Overview

Sketch mode provides Excalidraw-like wireframing capabilities directly on top of web pages. Use it to:
- Annotate UI elements for feedback
- Draw wireframe mockups for proposed changes
- Create visual guides for UI discussions
- Export designs as JSON or PNG

**Keyboard Shortcuts**:
- `Escape` - Close sketch mode
- `Delete` - Erase selected element
- `Ctrl+Z` - Undo last action
- `Ctrl+Shift+Z` - Redo previously undone action

---

## Sketch Mode Functions

### sketch.open

Open sketch mode to start wireframing on the current page.

**Signature**: `sketch.open()`

**Parameters**: None

**Returns**: void

**Example**:
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

**Result**: A full-screen canvas overlay appears with drawing tools.

---

### sketch.close

Close sketch mode and return to normal page view.

**Signature**: `sketch.close()`

**Parameters**: None

**Returns**: void

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.close()"
  }
}
```

---

### sketch.toggle

Toggle sketch mode on or off.

**Signature**: `sketch.toggle()`

**Parameters**: None

**Returns**: void

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.toggle()"
  }
}
```

---

### sketch.setTool

Set the active drawing tool.

**Signature**: `sketch.setTool(tool)`

**Parameters**:
- `tool`: string - Tool name (see Available Tools below)

**Returns**: void

**Available Tools**:

**Basic Shape Tools**:
| Tool | Description |
|------|-------------|
| `select` | Select and move existing elements |
| `rectangle` | Draw rectangles and squares |
| `ellipse` | Draw ellipses and circles |
| `line` | Draw straight lines |
| `arrow` | Draw arrows with arrowheads |
| `freedraw` | Freehand drawing |
| `text` | Add text annotations |
| `eraser` | Erase elements |

**Wireframe UI Elements**:
| Tool | Description |
|------|-------------|
| `button` | Draw button wireframe components |
| `input` | Draw input field wireframes |
| `note` | Add sticky note annotations |
| `image` | Draw image placeholder areas |

**Example - Set rectangle tool**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.setTool('rectangle')"
  }
}
```

**Example - Set button wireframe tool**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.setTool('button')"
  }
}
```

**Example - Set note tool for annotations**:
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

---

### sketch.save

Save the current sketch and send it to the proxy server. The sketch data is logged and can be retrieved via proxylog.

**Signature**: `sketch.save()`

**Parameters**: None

**Returns**: void

**Example**:
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

**Note**: After saving, retrieve sketch data from proxy logs using:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["sketch"]
  }
}
```

---

### sketch.toJSON

Export the current sketch data as a JSON object. Useful for saving sketches for later use.

**Signature**: `sketch.toJSON()`

**Parameters**: None

**Returns**: object - Serialized sketch data containing all elements

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.toJSON()"
  }
}
```

**Response Structure**:
```json
{
  "elements": [
    {
      "type": "rectangle",
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 50,
      "strokeColor": "#000000",
      "fillColor": "transparent"
    },
    {
      "type": "text",
      "x": 120,
      "y": 215,
      "text": "Submit Button"
    }
  ],
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

---

### sketch.fromJSON

Load sketch data from a previously exported JSON object.

**Signature**: `sketch.fromJSON(data)`

**Parameters**:
- `data`: object - Sketch data from `toJSON()`

**Returns**: void

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.fromJSON({\"elements\":[{\"type\":\"rectangle\",\"x\":100,\"y\":100,\"width\":200,\"height\":100}]})"
  }
}
```

**Use Cases**:
- Restore a previous wireframe session
- Share wireframes between team members
- Create templates for common UI patterns

---

### sketch.toDataURL

Export the current sketch as a PNG image data URL.

**Signature**: `sketch.toDataURL()`

**Parameters**: None

**Returns**: string - PNG data URL (base64 encoded)

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.toDataURL()"
  }
}
```

**Use Cases**:
- Export wireframes for documentation
- Share visual mockups without JSON data
- Include in design review discussions

---

### sketch.undo

Undo the last sketch action.

**Signature**: `sketch.undo()`

**Parameters**: None

**Returns**: void

**Example**:
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

### sketch.redo

Redo a previously undone sketch action.

**Signature**: `sketch.redo()`

**Parameters**: None

**Returns**: void

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.redo()"
  }
}
```

---

### sketch.clear

Clear all sketch elements and start with a blank canvas.

**Signature**: `sketch.clear()`

**Parameters**: None

**Returns**: void

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.clear()"
  }
}
```

---

## Visual Overlay Functions

### highlight

Highlight an element with a colored overlay. Returns an ID for later removal.

**Signature**: `highlight(selector, options?)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element
- `options`: object - Highlight options
  - `color`: string - Overlay color (default: "yellow")
  - `label`: string - Text label to display on overlay
  - `duration`: number - Auto-remove after ms (optional)

**Returns**: string - Overlay ID for removal

**Example - Basic highlight**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('#submit-button')"
  }
}
```

**Example - Highlight with label and color**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('#form', {color: 'blue', label: 'Main Form'})"
  }
}
```

**Example - Temporary highlight (auto-removes after 3s)**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('.error-field', {color: 'red', label: 'Error', duration: 3000})"
  }
}
```

**Use Cases**:
- Mark elements during debugging
- Visually identify specific components
- Create guided walkthroughs

---

### removeHighlight

Remove a specific highlight overlay by its ID.

**Signature**: `removeHighlight(id)`

**Parameters**:
- `id`: string - Overlay ID returned by `highlight()`

**Returns**: void

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.removeHighlight('overlay-123')"
  }
}
```

---

### clearAllOverlays

Remove all highlight overlays from the page.

**Signature**: `clearAllOverlays()`

**Parameters**: None

**Returns**: void

**Example**:
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

**Use Cases**:
- Clean up after debugging session
- Reset visual state before new analysis
- Remove all annotations at once

---

## Screenshot Capture

### screenshot

Capture a screenshot of the page or a specific element.

**Signature**: `screenshot(name?, selector?)`

**Parameters**:
- `name`: string - Screenshot name (default: screenshot_<timestamp>)
- `selector`: string - CSS selector for element to capture (default: body, captures full page)

**Returns**: Promise<{name, width, height, selector}>

**Example - Full page screenshot**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('homepage')"
  }
}
```

**Example - Element screenshot**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('header', '#main-header')"
  }
}
```

**Example - Screenshot with auto-generated name**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot()"
  }
}
```

**Response**:
```json
{
  "name": "homepage",
  "width": 1920,
  "height": 1080,
  "selector": "body"
}
```

**Note**: Screenshots are saved to disk and logged. Retrieve screenshot entries from proxy logs:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["screenshot"]
  }
}
```

---

## Wireframing Workflows

### Workflow 1: Creating UI Feedback Annotations

When providing feedback on existing UI:

1. Open sketch mode:
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

2. Set the note tool for annotations:
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

3. Draw arrows to point out issues:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.setTool('arrow')"
  }
}
```

4. Save and export:
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

---

### Workflow 2: Wireframing a New UI Section

When proposing new UI elements:

1. Take a screenshot of the current state:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('before-wireframe')"
  }
}
```

2. Open sketch mode and draw wireframes:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.open(); __devtool.sketch.setTool('rectangle')"
  }
}
```

3. Add button wireframes:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.setTool('button')"
  }
}
```

4. Add input field wireframes:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.setTool('input')"
  }
}
```

5. Add labels with text tool:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.setTool('text')"
  }
}
```

6. Export as PNG and JSON:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "var png = __devtool.sketch.toDataURL(); var json = __devtool.sketch.toJSON(); __devtool.sketch.save()"
  }
}
```

---

### Workflow 3: Highlighting Elements for Discussion

When pointing out specific elements:

1. Highlight the main area of focus:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('#navigation', {color: 'blue', label: 'Navigation Area'})"
  }
}
```

2. Highlight related elements:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('.sidebar', {color: 'green', label: 'Sidebar'})"
  }
}
```

3. Take a screenshot with highlights:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "await __devtool.screenshot('highlighted-areas')"
  }
}
```

4. Clean up when done:
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

### Workflow 4: Iterative Design with Undo/Redo

When refining wireframes:

1. Draw initial layout:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.open(); __devtool.sketch.setTool('rectangle')"
  }
}
```

2. If a shape is wrong, undo it:
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

3. Changed your mind? Redo:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.redo()"
  }
}
```

4. Start fresh if needed:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.clear()"
  }
}
```

---

### Workflow 5: Saving and Restoring Wireframes

When working on complex wireframes across sessions:

1. Export current work before closing:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.toJSON()"
  }
}
```

2. Store the JSON response for later use.

3. Restore in a new session:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.sketch.open(); __devtool.sketch.fromJSON(<saved_json>)"
  }
}
```

---

## Quick Reference Table

### Sketch Functions

| Function | Purpose | Key Parameters |
|----------|---------|----------------|
| `sketch.open()` | Start sketch mode | None |
| `sketch.close()` | Exit sketch mode | None |
| `sketch.toggle()` | Toggle sketch mode | None |
| `sketch.setTool(tool)` | Select drawing tool | Tool name (see list) |
| `sketch.save()` | Save to proxy server | None |
| `sketch.toJSON()` | Export as JSON | None |
| `sketch.fromJSON(data)` | Import from JSON | Sketch data object |
| `sketch.toDataURL()` | Export as PNG | None |
| `sketch.undo()` | Undo last action | None |
| `sketch.redo()` | Redo undone action | None |
| `sketch.clear()` | Clear all elements | None |

### Available Sketch Tools

| Category | Tools |
|----------|-------|
| Selection | `select`, `eraser` |
| Shapes | `rectangle`, `ellipse`, `line`, `arrow` |
| Drawing | `freedraw`, `text` |
| Wireframe | `button`, `input`, `note`, `image` |

### Visual Overlay Functions

| Function | Purpose | Key Parameters |
|----------|---------|----------------|
| `highlight(sel, opts)` | Add colored overlay | selector, color, label, duration |
| `removeHighlight(id)` | Remove specific overlay | overlay ID |
| `clearAllOverlays()` | Remove all overlays | None |

### Screenshot Function

| Function | Purpose | Key Parameters |
|----------|---------|----------------|
| `screenshot(name, sel)` | Capture page/element | name, selector |

---

## Tips and Best Practices

**Sketch Mode Tips**:
- Use keyboard shortcuts for faster workflow (Escape, Delete, Ctrl+Z, Ctrl+Shift+Z)
- Export JSON to preserve complex wireframes
- Use the `note` tool for text annotations with backgrounds
- Combine `button` and `input` tools for form wireframes

**Highlight Tips**:
- Use distinct colors for different element types
- Add labels to make highlights self-documenting
- Use temporary highlights (duration option) for quick demos
- Clear all overlays before taking final screenshots

**Screenshot Tips**:
- Name screenshots descriptively for easy identification
- Use element selectors to capture specific components
- Combine with highlights for annotated screenshots
- Check proxylog for saved screenshot metadata

**Workflow Tips**:
- Take a "before" screenshot before making wireframe changes
- Save JSON exports frequently during complex sessions
- Use `clearAllOverlays()` to reset visual state
- Export both PNG and JSON for complete documentation
