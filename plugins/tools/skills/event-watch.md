---
name: event-watch
description: Stream user interactions (panel messages, clicks, sketches, design chats) from the browser to Claude in real time via agnt's watch + Monitor
---

# Event Watch Skill

Continuously stream user interactions from the floating indicator, sketch mode, and design mode — so the browser can talk back to Claude without polling. This is the bidirectional half of the run → watch → Monitor pattern.

**Pattern:** `proxy start` → `watch` → `Monitor`.

**Requires:** Claude Code client with the `Monitor` tool. Older clients must poll `proxylog` with type filters instead.

---

## What flows through this stream

`target: "interactions"` subscribes to three event types emitted by `window.__devtool` when the user interacts with the overlay:

| Event type | Source | Typical payload |
|------------|--------|-----------------|
| `panel_message` | User types into the floating indicator's chat input | `{text, page_url, selected_element?}` |
| `interaction` | User clicks the indicator to select an element or take a screenshot | `{event_type, target, position, screenshot_id?}` |
| `sketch` | User saves a wireframe from sketch mode | `{elements, json}` |

Design mode events (`design_state`, `design_request`, `design_chat`) also flow through the `interactions` channel via their shared category.

---

## Step 1: Ask agnt for the command

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "watch",
  "parameters": {
    "target": "interactions",
    "proxy_id": "dev"
  }
}
```

Response:

```json
{
  "command": "/home/user/.local/bin/agnt monitor --socket /run/user/1000/agnt.sock --types panel_message,interaction,sketch --proxy dev --format compact",
  "description": "User interactions on proxy dev"
}
```

`proxy_id` is optional. Omit it to watch interactions across every proxy.

---

## Step 2: Start a Monitor with that command

```
Monitor({
  command: "/home/user/.local/bin/agnt monitor --socket /run/user/1000/agnt.sock --types panel_message,interaction,sketch --proxy dev --format compact",
  cwd: "/home/user/project"
})
```

Always use the exact command returned by `watch` — it encodes the correct daemon socket and event-type filters.

---

## Step 3: React to each event

Each line is one interaction:

```
[panel_message] proxy=dev "The header overlaps the nav on mobile"
[interaction] proxy=dev click target=button.cta position=(312,178)
[sketch] proxy=dev elements=8 saved
```

Typical reactions:
- **`panel_message`** — The user is asking for a change. Read the page context (`currentpage` or `proxylog {types:["panel_message"]}` for the full payload), then edit the code and reload.
- **`interaction`** with a screenshot — Fetch it via `proxylog {types:["screenshot"]}` and analyze what the user is pointing at.
- **`sketch`** — Export the wireframe JSON via `proxylog {types:["sketch"]}` and translate it into real markup/styles.
- **`design_chat`** — Treat it as a conversation turn inside design mode; respond with an alternative via the proxy `exec` API.

Keep the Monitor running across all of these — a single design-review session can emit dozens of events.

---

## End-to-end example

User: "I'm going to click around the running app and type into the indicator — fix stuff as I report it."

```
# 1. Assume a dev server is already running as process "app"
mcp__plugin_slop-mcp_slop-mcp__execute_tool { mcp_name:"agnt", tool_name:"proxy",
  parameters:{ action:"start", id:"dev", target_url:"http://localhost:3000" } }

# 2. Ask agnt for the interactions monitor command
mcp__plugin_slop-mcp_slop-mcp__execute_tool { mcp_name:"agnt", tool_name:"watch",
  parameters:{ target:"interactions", proxy_id:"dev" } }

# 3. Start Monitor with the returned command
Monitor({ command: "<paste command from step 2>", cwd: "." })
```

From this point on, every panel message, click, screenshot, and saved sketch arrives as a Monitor notification.

---

## Watching errors and interactions at the same time

Start two Monitors — one with `target: "errors"` (see `error-watch` skill), one with `target: "interactions"`. They use the same daemon socket but different event-type filters, so they don't conflict.

If you want a single stream of everything, use `target: "all"` instead and filter client-side.

---

## Fallback for older clients

Without Monitor, poll the relevant types via `proxylog`:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["panel_message","interaction","sketch"]
  }
}
```

Pair it with the `schedule` skill to re-run the query on a fixed interval. Monitor is still strictly preferred when available.

---

## Related skills

- **`error-watch`** — same pattern, but for errors and diagnostics
- **`interaction-tracking`** — on-demand queries for interaction history and DOM mutations
- **`sketch-visual`** — extracting and using saved sketches
