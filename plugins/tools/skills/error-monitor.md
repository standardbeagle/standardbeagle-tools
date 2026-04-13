---
name: error-monitor
description: Check errors across all proxies and processes with unified aggregation, deduplication, and periodic monitoring
---

# Error Monitor Skill

Check errors across browser JavaScript, HTTP responses, process output, and proxy diagnostics in one query.

## Quick Check

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {}
}
```

Returns compact output:

```
=== Errors (2) ===

[browser:js] TypeError (3x, latest 5s ago)
  Cannot read property 'map' of undefined
  → src/components/List.tsx:42:15

[proxy:http] 500 Internal Server Error (1x, 12s ago)
  POST /api/users → "database connection timeout"
```

---

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `proxy_id` | all | Filter to specific proxy |
| `process_id` | all | Filter to specific process |
| `since` | none | Time filter: `"5m"`, `"1h"`, RFC3339 timestamp |
| `include_warnings` | true | Include 4xx HTTP and warnings |
| `limit` | 25 | Max results |
| `raw` | false | Return full JSON |

---

## Common Queries

**Recent errors only:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "since": "5m"
  }
}
```

**Errors only, no warnings:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "include_warnings": false
  }
}
```

**Specific proxy:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "proxy_id": "dev"
  }
}
```

**Full JSON for analysis:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "raw": true,
    "limit": 50
  }
}
```

---

## Error Sources

| Source | Label | Captures |
|--------|-------|----------|
| Browser JS | `browser:js` | Runtime exceptions via `window.onerror` |
| HTTP | `proxy:http` | 4xx (warning) and 5xx (error) responses |
| Process | `process:<id>` | Compile errors, panics, exceptions |
| Proxy | `proxy:diagnostic` | Transport and connection failures |
| Custom | `browser:custom` | `__devtool.log("error", msg)` calls |

---

## Continuous Monitoring

### Preferred: real-time streaming via Monitor

For real-time error detection, use the `error-watch` skill. It asks agnt's `watch` tool for a monitor command, then streams errors through Claude Code's `Monitor` tool so every new error arrives as a notification instead of waiting for the next poll.

```
# 1. Ask agnt for the command
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "watch",
  "parameters": { "target": "errors", "proxy_id": "dev" }
}

# 2. Pipe the returned command into Monitor
Monitor({ command: "<command from step 1>", cwd: "." })
```

See the `error-watch` skill for the full pattern, target reference, and event handling guidance. Monitor is strictly preferred because errors are delivered the instant they happen rather than at a fixed polling interval.

### Fallback: scheduled polling

If the client does not have the `Monitor` tool (pre-v2.1.98 or non-Claude-Code clients), fall back to recurring `get_errors` checks via the `schedule` tool:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "schedule",
  "parameters": {
    "delay_seconds": 30,
    "message": "Run get_errors {} and report any new errors found"
  }
}
```

This is a fallback only — prefer `error-watch` + Monitor whenever available.

### Development Workflow

1. **Start dev environment:**
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "run",
     "parameters": {
       "script_name": "dev",
       "id": "app"
     }
   }
   ```

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

2. **Check errors after changes:**
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "get_errors",
     "parameters": {
       "since": "1m"
     }
   }
   ```

3. **Deep dive into browser errors:**
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "get_errors",
     "parameters": {
       "proxy_id": "dev",
       "raw": true
     }
   }
   ```

4. **Check process compilation errors:**
   ```
   mcp__plugin_slop-mcp_slop-mcp__execute_tool
   Parameters: {
     "mcp_name": "agnt",
     "tool_name": "get_errors",
     "parameters": {
       "process_id": "app",
       "include_warnings": false
     }
   }
   ```

---

## Built-in Intelligence

**Deduplication:** Identical errors merge. Count shows occurrences.

**Stack trace reduction:** First application frame only, skipping `node_modules/`, `webpack/`, runtime.

**Noise filtering:** Ignores 301/302/304, `.map` 404s, favicon 404s, webpack HMR.

---

## Integration with Other Skills

### Before Visual Diagnostics

Check errors first:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "include_warnings": false
  }
}
```

If errors exist, fix them before auditing layout.

### With Responsive Check

After running `checkResponsiveRisk()`, check for console errors that may indicate responsive JS failures:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "proxy_id": "dev",
    "since": "2m"
  }
}
```

### With Current Page

When inspecting a page, also check for errors:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "proxy_id": "dev",
    "include_warnings": false
  }
}
```

### With Full Audit

Include error check in comprehensive audit:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "limit": 50
  }
}
```

---

## Correlating with Proxy Logs

For detailed investigation:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "get_errors",
  "parameters": {
    "proxy_id": "dev"
  }
}
```

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxylog",
  "parameters": {
    "proxy_id": "dev",
    "types": ["http"],
    "status_codes": [500]
  }
}
```

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

---

## Raw JSON Output

With `raw: true`:

```json
[
  {
    "source": "browser:js",
    "severity": "error",
    "category": "TypeError",
    "message": "Cannot read property 'map' of undefined",
    "location": "src/components/List.tsx:42:15",
    "page": "http://localhost:3000/dashboard",
    "count": 3,
    "last_seen": "2024-01-15T10:30:05Z"
  }
]
```

---

## Quick Reference

| Query | Command |
|-------|---------|
| All errors | `get_errors {}` |
| Recent (5 min) | `get_errors {since: "5m"}` |
| Errors only | `get_errors {include_warnings: false}` |
| Specific proxy | `get_errors {proxy_id: "dev"}` |
| Full details | `get_errors {raw: true}` |

---

## Related Skills

- **`error-watch`** - Stream errors in real time via Monitor (preferred over polling)
- **`event-watch`** - Stream user interactions from the browser overlay
- **`browser-debug`** - Inspect elements causing errors
- **`current-page`** - Get page context for error investigation
- **`visual-diagnostics`** - Debug layout after fixing errors
