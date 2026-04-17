---
name: agnt-companion
description: Use when lci is installed and the user needs a dev server, reverse proxy, browser debugging, screenshots, or accessibility/performance/security audits of a running page - points at the sibling agnt plugin which lci does not duplicate
---

# agnt — the browser and process companion to lci

lci gives you sub-millisecond code search and symbol intelligence. For **running the code and watching what it does** — dev servers, reverse proxies, browser debugging, screenshots, console errors, a11y/perf/security audits — use the sibling **agnt** plugin from the same marketplace.

## When to reach for agnt instead of lci

- "Start the dev server and proxy it so I can see browser errors" → agnt `dev-proxy`
- "Take a screenshot of the current page" → agnt `screenshot`
- "Are there JavaScript errors in the browser right now?" → agnt `check-errors` / `error-monitor`
- "Run an accessibility / performance / SEO / security audit" → agnt `audit-a11y`, `audit-performance`, `audit-seo`, `audit-security`
- "Wireframe this page" → agnt `sketch-mode`
- "Debug this UI interaction" → agnt `browser-debug`
- Anything that requires a live rendered DOM, not just source code

## Install

agnt ships in the same `standardbeagle-tools` marketplace as lci:

```
claude mcp add agnt --source ./plugins/agnt
```

Or install from the marketplace alongside lci. The two plugins are designed to coexist — no overlapping hooks, no MCP server conflicts.

## Typical split in a session

| task | plugin |
|---|---|
| Find where a React component is defined | **lci** |
| Start dev server, reverse proxy, watch browser errors | **agnt** |
| Trace what calls `processPayment()` across the repo | **lci** |
| Screenshot + a11y audit of the rendered page | **agnt** |
| `explore-codebase` before implementing a feature | **lci** |
| `qa-test` / `audit-security` on the running app | **agnt** |

If you find yourself needing to actually *run* the code and watch the result while using lci, that's the signal to pull in agnt too.
