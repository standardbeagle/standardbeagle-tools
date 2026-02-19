---
name: interaction-tracking
description: Track user interactions and DOM mutations for debugging click handlers, form inputs, and dynamic UI changes
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Interaction & Mutation Tracking Skill

This skill documents how to track and debug user interactions (clicks, keyboard, scroll) and DOM mutations (added, removed, modified elements) through the `__devtool` API.

## Invocation Format

All tracking functions are called using proxy exec:

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

## Interaction Tracking Functions

### interactions.getHistory

Get recent interaction history including clicks, keyboard events, scroll, and form inputs.

**Signature**: `interactions.getHistory(count?)`

**Parameters**:
- `count`: number - Number of interactions to return (default: 50)

**Returns**: `[{event_type, target, position?, key?, timestamp}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getHistory(20)"
  }
}
```

**Response Structure**:
```json
[
  {
    "event_type": "click",
    "target": {
      "selector": "button#submit",
      "tag": "button",
      "id": "submit",
      "classes": ["btn", "btn-primary"],
      "text": "Submit",
      "attributes": { "type": "submit" }
    },
    "position": {
      "client_x": 450,
      "client_y": 320,
      "page_x": 450,
      "page_y": 1120
    },
    "timestamp": 1705312456789
  },
  {
    "event_type": "keydown",
    "target": {
      "selector": "input#email",
      "tag": "input",
      "id": "email"
    },
    "key": {
      "key": "Tab",
      "code": "Tab"
    },
    "timestamp": 1705312456500
  }
]
```

**Tracked Event Types**:
- `click` - Mouse clicks
- `dblclick` - Double clicks
- `keydown` - Keyboard key presses
- `input` - Form input changes (debounced)
- `focus` - Element focus
- `blur` - Element blur
- `scroll` - Scroll events (debounced)
- `submit` - Form submissions
- `contextmenu` - Right-click menu

---

### interactions.getLastClick

Get the most recent click event.

**Signature**: `interactions.getLastClick()`

**Parameters**: None

**Returns**: `{event_type, target, position, timestamp}|null`

**Example**:
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

**Use Cases**:
- Debug what element the user clicked
- Verify click coordinates
- Check if button received the click

---

### interactions.getLastClickContext

Get the last click with surrounding mouse movement trail for full interaction context.

**Signature**: `interactions.getLastClickContext(trailMs?)`

**Parameters**:
- `trailMs`: number - Time window for mouse trail in ms (default: 2000)

**Returns**: `{click, mouseTrail}|null`

**Example**:
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

**Response Structure**:
```json
{
  "click": {
    "event_type": "click",
    "target": {
      "selector": "button.submit-btn",
      "tag": "button",
      "classes": ["submit-btn"]
    },
    "position": {
      "client_x": 450,
      "client_y": 320
    },
    "timestamp": 1705312456789
  },
  "mouseTrail": [
    {
      "event_type": "mousemove",
      "position": { "client_x": 200, "client_y": 300 },
      "wall_time": 1705312454789,
      "interaction_time": 0
    },
    {
      "event_type": "mousemove",
      "position": { "client_x": 350, "client_y": 310 },
      "wall_time": 1705312455500,
      "interaction_time": 711
    },
    {
      "event_type": "mousemove",
      "position": { "client_x": 445, "client_y": 318 },
      "wall_time": 1705312456700,
      "interaction_time": 1911
    }
  ]
}
```

**Use Cases**:
- Analyze user's path to a click target
- Debug hover-triggered UI that disappeared before click
- Understand interaction patterns

---

### interactions.getClicksOn

Get all clicks on elements matching a selector pattern.

**Signature**: `interactions.getClicksOn(selector)`

**Parameters**:
- `selector`: string - Selector pattern to match in target

**Returns**: `[{event_type, target, position, timestamp}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getClicksOn('button')"
  }
}
```

**Use Cases**:
- Find all clicks on buttons
- Track clicks on navigation links
- Debug specific element interactions

---

### interactions.getMouseTrail

Get mouse movement samples around a specific timestamp.

**Signature**: `interactions.getMouseTrail(timestamp, windowMs?)`

**Parameters**:
- `timestamp`: number - Center timestamp
- `windowMs`: number - Time window in ms (default: 5000)

**Returns**: `[{position, wall_time, interaction_time}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getMouseTrail(Date.now() - 1000)"
  }
}
```

**Note**: Mouse movement is sampled every 100ms within a 60-second window after each click.

---

### interactions.clear

Clear all interaction history.

**Signature**: `interactions.clear()`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.clear()"
  }
}
```

---

## Mutation Tracking Functions

### mutations.getHistory

Get recent DOM mutation history.

**Signature**: `mutations.getHistory(count?)`

**Parameters**:
- `count`: number - Number of mutations to return (default: 50)

**Returns**: `[{mutation_type, target, added?, removed?, attribute?, triggered_by?, timestamp}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getHistory(20)"
  }
}
```

**Response Structure**:
```json
[
  {
    "mutation_type": "added",
    "target": {
      "selector": "div.modal-container",
      "tag": "div",
      "id": "modal-container"
    },
    "added": [{
      "selector": "div.modal",
      "tag": "div",
      "html": "<div class=\"modal\">..."
    }],
    "triggered_by": {
      "type": "click",
      "timestamp": 1705312456700,
      "latency": 89,
      "target": "button#open-modal"
    },
    "timestamp": 1705312456789
  },
  {
    "mutation_type": "attributes",
    "target": {
      "selector": "input#email",
      "tag": "input"
    },
    "attribute": {
      "name": "class",
      "old_value": "form-input",
      "new_value": "form-input error"
    },
    "triggered_by": {
      "type": "blur",
      "timestamp": 1705312455000,
      "latency": 45
    },
    "timestamp": 1705312455045
  }
]
```

**Mutation Types**:
- `added` - Elements added to DOM
- `removed` - Elements removed from DOM
- `attributes` - Attribute changes on existing elements

---

### mutations.highlightRecent

Visually highlight recently added elements with a green overlay.

**Signature**: `mutations.highlightRecent(duration?)`

**Parameters**:
- `duration`: number - How far back to look in ms (default: 5000)

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
    "code": "__devtool.mutations.highlightRecent(3000)"
  }
}
```

**Use Cases**:
- Visualize what changed after an action
- Debug dynamic content loading
- Find elements added by JavaScript

**Note**: Highlighting is disabled by default for React compatibility. Enable it first:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.enableHighlighting()"
  }
}
```

---

### mutations.getAdded

Get elements added to DOM since a timestamp.

**Signature**: `mutations.getAdded(since?)`

**Parameters**:
- `since`: number - Timestamp filter (default: 0)

**Returns**: `[{mutation_type: 'added', target, added, timestamp}, ...]`

**Example - Get additions in last 5 seconds**:
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

---

### mutations.getRemoved

Get elements removed from DOM since a timestamp.

**Signature**: `mutations.getRemoved(since?)`

**Parameters**:
- `since`: number - Timestamp filter (default: 0)

**Returns**: `[{mutation_type: 'removed', target, removed, timestamp}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getRemoved(Date.now() - 5000)"
  }
}
```

---

### mutations.getModified

Get attribute changes since a timestamp.

**Signature**: `mutations.getModified(since?)`

**Parameters**:
- `since`: number - Timestamp filter (default: 0)

**Returns**: `[{mutation_type: 'attributes', target, attribute, timestamp}, ...]`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getModified(Date.now() - 5000)"
  }
}
```

**Use Cases**:
- Track class changes (CSS state changes)
- Debug attribute-based animations
- Monitor data attribute updates

---

### mutations.getTriggeredBy

Get mutations triggered by a specific interaction type.

**Signature**: `mutations.getTriggeredBy(interactionType)`

**Parameters**:
- `interactionType`: string - Interaction type (click, keydown, input, etc.)

**Returns**: `[{mutation_type, target, triggered_by, timestamp}, ...]`

**Example**:
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

**Use Cases**:
- Find what DOM changes resulted from clicks
- Debug cause-and-effect relationships
- Understand UI response to user actions

---

### mutations.getUntriggered

Get mutations with no associated user interaction (spontaneous updates).

**Signature**: `mutations.getUntriggered()`

**Returns**: `[{mutation_type, target, timestamp}, ...]`

**Example**:
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

**Use Cases**:
- Find polling/timer-based updates
- Identify WebSocket-driven changes
- Debug unexpected DOM modifications

---

### mutations.getCorrelationStats

Get statistics about interaction-mutation correlations.

**Signature**: `mutations.getCorrelationStats()`

**Returns**: `{total, triggered, untriggered, by_type, avg_latency, max_latency}`

**Example**:
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

**Response Structure**:
```json
{
  "total": 150,
  "triggered": 120,
  "untriggered": 30,
  "by_type": {
    "click": 80,
    "input": 25,
    "blur": 15
  },
  "avg_latency": {
    "click": 45,
    "input": 12,
    "blur": 8
  },
  "max_latency": {
    "click": 250,
    "input": 50,
    "blur": 20
  }
}
```

---

### mutations.getRateStats

Get mutation rate statistics for performance monitoring.

**Signature**: `mutations.getRateStats(windows?)`

**Parameters**:
- `windows`: number[] - Time windows in ms (default: [1000, 5000, 30000])

**Returns**: `{windows, counts, acceleration, status, health, max}`

**Example**:
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

**Response Structure**:
```json
{
  "windows": {
    "1s": 15,
    "5s": 8,
    "30s": 4
  },
  "counts": {
    "1s": 15,
    "5s": 40,
    "30s": 120
  },
  "acceleration": {
    "1s/5s": 1.88,
    "5s/30s": 2.0
  },
  "status": "accelerating",
  "health": "ok",
  "max": {
    "rate": 25.5,
    "timestamp": 1705312450000,
    "ago": "15s"
  }
}
```

**Health Levels**:
- `ok`: < 20 mutations/second
- `warning`: 20-50 mutations/second
- `critical`: > 50 mutations/second

---

### mutations.pause / mutations.resume

Temporarily pause or resume mutation tracking.

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.pause()"
  }
}
```

**Use Cases**:
- Pause during bulk DOM operations
- Reduce noise during known heavy updates
- Resume after operation completes

---

### mutations.clear

Clear mutation history.

**Signature**: `mutations.clear()`

**Example**:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.clear()"
  }
}
```

---

## Practical Debugging Scenarios

### Scenario 1: Debug Click Handler Not Working

When a button click doesn't seem to trigger the expected action:

1. Get the last click to verify target:
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

2. Check if any mutations occurred after the click:
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

3. If click target is unexpected, check full context:
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
- Element changed between mousedown and mouseup

---

### Scenario 2: Debug Modal Not Opening

When clicking a button should open a modal but nothing happens:

1. Verify click was registered:
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

2. Check for recent DOM additions:
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

3. Enable highlighting and retry action:
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

---

### Scenario 3: Debug Form Validation

When form validation errors don't appear correctly:

1. Check recent interactions on form elements:
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

3. Check correlation between blur and class changes:
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

### Scenario 4: Debug Dynamic Content Loading

When content should load dynamically but doesn't appear:

1. Check for any recent additions:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getAdded(Date.now() - 10000)"
  }
}
```

2. Check for spontaneous (non-user-triggered) mutations:
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

3. Check mutation rate for loading activity:
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

---

### Scenario 5: Debug Performance Issue from Excessive DOM Updates

When page feels sluggish due to too many DOM changes:

1. Get mutation rate statistics:
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

2. Check correlation statistics:
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

3. Get full mutation history to identify patterns:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getHistory(100)"
  }
}
```

**Red Flags**:
- `health: "critical"` (> 50 mutations/second)
- High `untriggered` count (polling issues)
- High `max_latency` (slow event handlers)

---

### Scenario 6: Debug Dropdown/Menu Disappearing

When hover-based UI disappears before you can click:

1. Get last click context with mouse trail:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.interactions.getLastClickContext(3000)"
  }
}
```

2. Check for element removal before click:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.mutations.getRemoved(Date.now() - 5000)"
  }
}
```

**Diagnosis**: If dropdown was removed before the click timestamp, there's likely a mouseout handler closing it prematurely.

---

## Quick Reference Table

| Function | Purpose | Key Return Values |
|----------|---------|-------------------|
| `interactions.getHistory(n)` | All interactions | event_type, target, position, key |
| `interactions.getLastClick()` | Last click event | target, position, timestamp |
| `interactions.getLastClickContext(ms)` | Click + mouse trail | click, mouseTrail |
| `interactions.getClicksOn(sel)` | Clicks on selector | Array of click events |
| `interactions.getMouseTrail(ts, ms)` | Mouse movement | positions, timestamps |
| `interactions.clear()` | Clear history | void |
| `mutations.getHistory(n)` | All mutations | mutation_type, target, triggered_by |
| `mutations.highlightRecent(ms)` | Visual highlight | void |
| `mutations.getAdded(since)` | Added elements | added, target, timestamp |
| `mutations.getRemoved(since)` | Removed elements | removed, target, timestamp |
| `mutations.getModified(since)` | Attribute changes | attribute (name, old, new) |
| `mutations.getTriggeredBy(type)` | Mutations by trigger | filtered mutations |
| `mutations.getUntriggered()` | Spontaneous mutations | mutations without trigger |
| `mutations.getCorrelationStats()` | Trigger statistics | by_type, latency stats |
| `mutations.getRateStats()` | Performance stats | rate, health, max |
| `mutations.pause()` | Pause tracking | void |
| `mutations.resume()` | Resume tracking | void |
| `mutations.clear()` | Clear history | void |

---

## Configuration Notes

**Interaction Tracking**:
- Max history: 500 interactions
- Scroll debounce: 100ms
- Input debounce: 300ms
- Mouse move sampling: 100ms intervals, 60s window after click

**Mutation Tracking**:
- Max history: 200 mutations
- Highlight duration: 2000ms
- Highlighting: Disabled by default (call `enableHighlighting()` to enable)
- Ignored: devtool UI elements, script, style, link tags
- Correlation window: 500ms (mutations linked to interactions within this window)

---

## Integration Tips

**Combine with Element Inspection**:
```javascript
// Get last click and inspect the target
var click = __devtool.interactions.getLastClick();
if (click && click.target.selector) {
  __devtool.inspect(click.target.selector);
}
```

**Take Screenshot After Mutations**:
```javascript
// After enabling highlighting
__devtool.mutations.highlightRecent(5000);
await __devtool.screenshot("recent-mutations");
```

**Debug Workflow**:
1. Clear history before testing
2. Perform user action
3. Check interactions to verify input
4. Check mutations to verify response
5. Use correlation stats to understand cause-effect
