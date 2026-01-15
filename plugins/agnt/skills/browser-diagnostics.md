---
name: browser-diagnostics
description: Browser element inspection, layout diagnostics, tree walking, and visual checks via proxy exec
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Browser Diagnostics Skill

This skill documents browser element inspection and layout diagnostics functions available through the `__devtool` API. All functions are executed via the proxy exec action.

## Invocation Format

All diagnostics are called using proxy exec:

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

## Element Inspection Functions

### getElementInfo

Get comprehensive information about an element including tag, classes, attributes, dimensions, and position.

**Signature**: `getElementInfo(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{tag, id, classes, attributes, text, html, dimensions, position}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getElementInfo('#submit-btn')"
  }
}
```

**Response includes**:
- `tag`: Element tag name (e.g., "button", "div")
- `id`: Element ID if present
- `classes`: Array of class names
- `attributes`: Object of all attributes
- `text`: Text content (truncated)
- `html`: Inner HTML (truncated)
- `dimensions`: Width and height
- `position`: Bounding rect coordinates

---

### getPosition

Get element position via bounding client rect.

**Signature**: `getPosition(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{top, right, bottom, left, width, height, x, y}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getPosition('.modal')"
  }
}
```

**Use cases**:
- Verify element placement
- Calculate distances between elements
- Check if element is in expected location

---

### getComputed

Get computed CSS styles for an element.

**Signature**: `getComputed(selector, properties?)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element
- `properties`: string[] - Specific properties to get (default: common properties)

**Returns**: `{property: value, ...}`

**Example - Get specific properties**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getComputed('#header', ['display', 'position', 'z-index'])"
  }
}
```

**Example - Get all common properties**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getComputed('.sidebar')"
  }
}
```

**Common properties returned by default**:
- display, position, float
- width, height, margin, padding
- color, background-color
- font-size, font-family
- z-index, opacity

---

### getBox

Get box model dimensions including content, padding, border, and margin.

**Signature**: `getBox(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{content, padding, border, margin}` with `{top, right, bottom, left}` for each

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getBox('.container')"
  }
}
```

**Use cases**:
- Debug spacing issues
- Verify padding/margin values
- Understand element's total size footprint

---

### getLayout

Get layout information including display type, position, and flexbox/grid properties.

**Signature**: `getLayout(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{display, position, float, flexbox?, grid?}`

**Example - Check flex container**:
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

**Response for flex container includes**:
- `display`: "flex" or "inline-flex"
- `flexbox`: `{direction, wrap, justifyContent, alignItems, gap}`

**Response for grid container includes**:
- `display`: "grid" or "inline-grid"
- `grid`: `{columns, rows, gap, areas}`

---

### getStacking

Get stacking context information including z-index and whether the element creates a new stacking context.

**Signature**: `getStacking(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{zIndex, createsContext, reason?, parentContext}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getStacking('.modal-overlay')"
  }
}
```

**Response includes**:
- `zIndex`: Current z-index value (number or "auto")
- `createsContext`: Boolean indicating if element creates stacking context
- `reason`: Why it creates a context (e.g., "position: fixed", "opacity < 1", "transform")
- `parentContext`: Selector for nearest ancestor stacking context

**Use cases**:
- Debug z-index issues
- Understand why elements appear above/below others
- Find stacking context boundaries

---

### getContainer

Get containing block and scroll container information.

**Signature**: `getContainer(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{containingBlock, scrollContainer, offsetParent}`

**Example**:
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

**Response includes**:
- `containingBlock`: The element that positions this element (for absolute/fixed)
- `scrollContainer`: Nearest scrollable ancestor
- `offsetParent`: The offsetParent element

**Use cases**:
- Debug absolute positioning issues
- Find which element controls scrolling
- Understand positioning context

---

### getTransform

Get CSS transform information.

**Signature**: `getTransform(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{transform, transformOrigin, matrix}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getTransform('.rotated-element')"
  }
}
```

**Response includes**:
- `transform`: The transform CSS property value
- `transformOrigin`: The transform-origin value
- `matrix`: The computed transformation matrix

---

### getOverflow

Get overflow and scroll information.

**Signature**: `getOverflow(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{overflow, overflowX, overflowY, scrollWidth, scrollHeight, isScrollable}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getOverflow('.scrollable-panel')"
  }
}
```

**Response includes**:
- `overflow`: The overflow CSS property
- `overflowX`, `overflowY`: Individual axis overflow values
- `scrollWidth`, `scrollHeight`: Total scrollable dimensions
- `isScrollable`: Boolean indicating if content overflows

---

### inspect (Composite)

Get comprehensive inspection combining multiple inspection calls in one request.

**Signature**: `inspect(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{info, position, box, layout, stacking, container, visibility, viewport}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.inspect('#main-form')"
  }
}
```

**Use this when**: You need multiple pieces of information about a single element. More efficient than making separate calls.

---

## Layout Diagnostics Functions

### findOverflows

Find elements causing horizontal overflow (common cause of horizontal scrollbars).

**Signature**: `findOverflows()`

**Parameters**: None

**Returns**: `[{element, overflow, width, parentWidth}, ...]`

**Example**:
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

**Response includes for each overflow**:
- `element`: Selector path to the overflowing element
- `overflow`: How many pixels it overflows
- `width`: Element's width
- `parentWidth`: Parent container's width

**Use cases**:
- Debug unwanted horizontal scrollbars
- Find elements breaking responsive layouts
- Identify elements wider than viewport

---

### findStackingContexts

Find all stacking contexts in the document.

**Signature**: `findStackingContexts()`

**Parameters**: None

**Returns**: `[{element, zIndex, reason}, ...]`

**Example**:
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

**Response includes for each context**:
- `element`: Selector path to the element
- `zIndex`: The z-index value
- `reason`: What property creates the stacking context

**Common reasons**:
- `position: relative/absolute/fixed` with z-index
- `opacity` less than 1
- `transform`, `filter`, `backdrop-filter`
- `isolation: isolate`
- `will-change`

---

### findOffscreen

Find elements positioned outside the viewport.

**Signature**: `findOffscreen()`

**Parameters**: None

**Returns**: `[{element, position, distance}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.findOffscreen()"
  }
}
```

**Response includes for each offscreen element**:
- `element`: Selector path to the element
- `position`: The element's bounding rect
- `distance`: How far off each edge (top, right, bottom, left)

**Use cases**:
- Find hidden elements that may be unintentionally positioned off-screen
- Debug navigation menus that slide in from off-screen
- Identify content that users cannot see

---

### diagnoseLayout (Composite)

Run comprehensive layout diagnostics combining all layout checks.

**Signature**: `diagnoseLayout(selector?)`

**Parameters**:
- `selector`: string - Optional element to focus analysis on

**Returns**: `{overflows, stackingContexts, offscreen, element?}`

**Example - Full page diagnosis**:
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

**Example - Focus on specific element**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.diagnoseLayout('#problem-section')"
  }
}
```

**Use this when**: You need a complete layout health check.

---

## Tree Walking Functions

### walkChildren

Get all child elements with optional depth limiting and filtering.

**Signature**: `walkChildren(selector, options?)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element
- `options`: `{maxDepth?, filter?}` - Walk options

**Returns**: `[{element, depth, path}, ...]`

**Example - Get immediate children**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.walkChildren('#container', {maxDepth: 1})"
  }
}
```

**Example - Walk to depth 3**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.walkChildren('#nav', {maxDepth: 3})"
  }
}
```

**Response includes for each element**:
- `element`: Selector path to the element
- `depth`: How deep in the tree (1 = direct child)
- `path`: Array of ancestor elements

---

### walkParents

Get all parent elements up to document root.

**Signature**: `walkParents(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `[{element, depth}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.walkParents('.nested-element')"
  }
}
```

**Use cases**:
- Find containing elements
- Trace element's position in DOM hierarchy
- Debug styling inheritance issues

---

### findAncestor

Find the closest ancestor matching a selector or condition.

**Signature**: `findAncestor(selector, condition)`

**Parameters**:
- `selector`: string|Element - Starting element
- `condition`: string|function - CSS selector or predicate function

**Returns**: Element|null

**Example - Find by selector**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.findAncestor('.button', '[data-modal]')"
  }
}
```

**Example - Find form container**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.findAncestor('#submit-btn', 'form')"
  }
}
```

**Use cases**:
- Find containing form for a button
- Find modal container for an element
- Find scrollable parent

---

## Visual State Functions

### isVisible

Check if an element is visible (not hidden by CSS).

**Signature**: `isVisible(selector)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element

**Returns**: `{visible: boolean, reasons?: string[]}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.isVisible('.dropdown-menu')"
  }
}
```

**Checks for**:
- `display: none`
- `visibility: hidden`
- `opacity: 0`
- Zero dimensions
- `clip-path` hiding

**Response when hidden**:
```json
{
  "visible": false,
  "reasons": ["display: none", "parent has visibility: hidden"]
}
```

---

### isInViewport

Check if an element is within the viewport.

**Signature**: `isInViewport(selector, threshold?)`

**Parameters**:
- `selector`: string|Element - CSS selector or DOM element
- `threshold`: number - Percentage visible required (default: 0, meaning any part visible)

**Returns**: `{inViewport: boolean, percentVisible: number, position}`

**Example - Check if any part is visible**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.isInViewport('#footer')"
  }
}
```

**Example - Check if at least 50% visible**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.isInViewport('#cta-button', 0.5)"
  }
}
```

**Use cases**:
- Check if important elements are visible without scrolling
- Verify lazy-loaded content visibility
- Debug viewport-dependent behaviors

---

### checkOverlap

Check if two elements overlap.

**Signature**: `checkOverlap(selector1, selector2)`

**Parameters**:
- `selector1`: string|Element - First element
- `selector2`: string|Element - Second element

**Returns**: `{overlaps: boolean, intersection?: {x, y, width, height}}`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.checkOverlap('.modal', '.tooltip')"
  }
}
```

**Response when overlapping**:
```json
{
  "overlaps": true,
  "intersection": {
    "x": 100,
    "y": 200,
    "width": 50,
    "height": 30
  }
}
```

**Use cases**:
- Detect overlapping UI elements
- Verify modal/dropdown positioning
- Debug collision issues

---

## Common Debugging Scenarios

### Scenario 1: Debug Horizontal Scrollbar

When the page has an unwanted horizontal scrollbar:

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

Then inspect the problematic elements:

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

---

### Scenario 2: Debug Z-Index Issues

When elements appear above/below others unexpectedly:

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

3. Verify overlap:
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

---

### Scenario 3: Debug Flexbox/Grid Layout

When flex or grid layout isn't working as expected:

1. Check the container's layout properties:
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

2. Walk through children to see their dimensions:
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

3. Check specific child's box model:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getBox('.flex-item')"
  }
}
```

---

### Scenario 4: Debug Absolute Positioning

When an absolutely positioned element isn't where expected:

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

2. Walk up the parent chain:
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

3. Check computed position values:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.getComputed('.absolute-element', ['position', 'top', 'left', 'right', 'bottom'])"
  }
}
```

---

### Scenario 5: Full Element Investigation

When you need complete information about an element:

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

This returns info, position, box, layout, stacking, container, visibility, and viewport status in one call.

---

### Scenario 6: Complete Layout Health Check

Run all diagnostics at once:

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

This returns overflows, stacking contexts, and offscreen elements.

---

## Quick Reference Table

| Function | Purpose | Key Return Values |
|----------|---------|-------------------|
| `getElementInfo(sel)` | Basic element info | tag, classes, attributes, dimensions |
| `getPosition(sel)` | Bounding rect | top, left, width, height |
| `getComputed(sel, props)` | CSS values | computed style values |
| `getBox(sel)` | Box model | content, padding, border, margin |
| `getLayout(sel)` | Layout type | display, position, flexbox/grid props |
| `getStacking(sel)` | Z-index context | zIndex, createsContext, reason |
| `getContainer(sel)` | Positioning context | containingBlock, scrollContainer |
| `getTransform(sel)` | Transform info | transform, transformOrigin, matrix |
| `getOverflow(sel)` | Scroll state | overflow, scrollWidth, isScrollable |
| `inspect(sel)` | Everything combined | All inspection data |
| `findOverflows()` | Find overflow issues | Elements causing horizontal scroll |
| `findStackingContexts()` | Find z-index contexts | All stacking context elements |
| `findOffscreen()` | Find hidden elements | Elements outside viewport |
| `diagnoseLayout(sel?)` | Full layout check | overflows, contexts, offscreen |
| `walkChildren(sel, opts)` | Traverse down | Child elements with depth |
| `walkParents(sel)` | Traverse up | Parent elements to root |
| `findAncestor(sel, cond)` | Find parent | Matching ancestor element |
| `isVisible(sel)` | Visibility check | visible boolean, reasons |
| `isInViewport(sel, thresh)` | Viewport check | inViewport, percentVisible |
| `checkOverlap(sel1, sel2)` | Collision check | overlaps, intersection |
