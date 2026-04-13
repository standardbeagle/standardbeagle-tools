---
name: error-watch
description: Stream errors from proxies and processes in real time via agnt's watch + Monitor, so Claude reacts the instant a problem appears
---

# Error Watch Skill

Continuously stream errors (JS runtime, HTTP 5xx/4xx, process compile errors, proxy diagnostics) as they happen instead of polling with `get_errors`. Claude reacts the instant the browser or dev server fails.

**Pattern:** `run` (or `proxy start`) → `watch` → `Monitor`.

**Requires:** Claude Code client with the `Monitor` tool (background process streaming). Older clients without Monitor must fall back to the `schedule`-based polling in the `error-monitor` skill.

---

## Step 1: Ask agnt for the command

Call the `watch` tool. It returns a ready-to-run `agnt monitor` command string with the correct socket path and filters baked in.

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "watch",
  "parameters": {
    "target": "errors",
    "proxy_id": "dev"
  }
}
```

Response:

```json
{
  "command": "/home/user/.local/bin/agnt monitor --socket /run/user/1000/agnt.sock --types error,diagnostic --proxy dev --format compact",
  "description": "Errors on proxy dev"
}
```

`proxy_id` is optional. Omit it to watch errors across every proxy and every managed process.

---

## Step 2: Start a Monitor with that command

Hand the returned `command` to the `Monitor` tool as a long-running background stream. Monitor delivers each new line as a notification Claude can react to without blocking.

```
Monitor({
  command: "/home/user/.local/bin/agnt monitor --socket /run/user/1000/agnt.sock --types error,diagnostic --proxy dev --format compact",
  cwd: "/home/user/project"
})
```

Never hand-craft this command. Always take the string from `watch`'s response — it embeds the correct daemon socket for the current session.

---

## Step 3: React to streaming events

Each line is one error, formatted compactly:

```
[error] proxy=dev browser:js TypeError: Cannot read property 'map' of undefined (src/components/List.tsx:42:15)
[error] proxy=dev http 500 POST /api/users "database connection timeout"
[diagnostic] process=app panic: runtime error: invalid memory address
```

When a new line arrives:
1. If it's a JS error, call `get_errors {proxy_id:"dev", since:"1m", raw:true}` for the full stack.
2. If it's a 5xx, call `proxylog {proxy_id:"dev", types:["http"], status_codes:[500]}` for the request/response bodies.
3. If it's a process `diagnostic`, call `proc {action:"output", process_id:"app", tail:200, grep:"error|panic"}`.
4. Fix the root cause, then keep the Monitor running — don't restart it just because you saw an error.

---

## End-to-end example

User: "Start the dev server and yell at me the moment it blows up."

```
# 1. Boot the dev server
mcp__plugin_slop-mcp_slop-mcp__execute_tool { mcp_name:"agnt", tool_name:"run",
  parameters:{ script_name:"dev", mode:"background", id:"app" } }

# 2. Front it with a proxy
mcp__plugin_slop-mcp_slop-mcp__execute_tool { mcp_name:"agnt", tool_name:"proxy",
  parameters:{ action:"start", id:"dev", target_url:"http://localhost:3000" } }

# 3. Ask agnt for the monitor command
mcp__plugin_slop-mcp_slop-mcp__execute_tool { mcp_name:"agnt", tool_name:"watch",
  parameters:{ target:"errors", proxy_id:"dev" } }

# 4. Start Monitor with the returned command
Monitor({ command: "<paste command from step 3>", cwd: "." })
```

From this point on, every JS exception, 5xx, and process panic arrives as a Monitor notification.

---

## `watch` target reference

| target | Event types | Required params |
|--------|-------------|-----------------|
| `errors` | `error`, `diagnostic` | none (proxy_id optional) |
| `interactions` | `panel_message`, `interaction`, `sketch` | none (proxy_id optional) — see `event-watch` skill |
| `process` | `process` output | `process_id` required |
| `all` | everything | none |

Only these four targets are valid. Don't invent new ones.

---

## Fallback for older clients

If the client has no Monitor tool (pre-v2.1.98 or non-Claude-Code clients), fall back to the `schedule`-based polling loop in the `error-monitor` skill. Monitor is strictly preferred because it delivers errors in real time instead of at a fixed polling interval.

---

## Related skills

- **`error-monitor`** — point-in-time `get_errors` queries and the polling fallback
- **`event-watch`** — same pattern, but for user interactions (panel messages, sketches, design chats)
- **`process-proxy`** — the `run` and `proxy` tools used to set up the watched targets
