---
name: lci-companion
description: Use when agnt is installed and the user needs semantic code search, symbol lookup, or call-hierarchy analysis in an unfamiliar codebase - points at the sibling lci plugin which agnt does not duplicate
---

# LCI — the code intelligence companion to agnt

agnt gives you browser and process control. For **reading and understanding code** — symbol definitions, references, call graphs, architectural exploration — use the sibling **lci** plugin (Lightning Code Index) from the same marketplace.

## When to reach for lci instead of agnt

- "Where is `foo` defined?" → lci `search` / `code-context`
- "What calls this function?" → lci `code-context` (call hierarchy)
- "How does this codebase fit together?" → lci `explore`
- Anything you'd otherwise solve with repeated `Grep` passes on a medium-or-larger repo

LCI is typically **sub-millisecond** on warm indexes and cuts context use by ~80% vs Grep-based exploration, which matters on long-running agent turns.

## Install

LCI ships in the same `standardbeagle-tools` marketplace as agnt:

```
claude mcp add lci --source ./plugins/lci
```

Or install from the marketplace alongside agnt. The two plugins are designed to coexist — no overlapping hooks, no MCP server conflicts.

## Typical split in a session

| task | plugin |
|---|---|
| Start dev server, reverse proxy, watch browser errors | **agnt** |
| Find where a React component is defined | **lci** |
| Screenshot + a11y audit of a rendered page | **agnt** |
| Trace what calls `processPayment()` across the repo | **lci** |
| Run `qa-test` / `audit-security` on the running app | **agnt** |
| `explore-codebase` before implementing a feature | **lci** |

If you find yourself Grepping repeatedly inside an agnt-driven session, that's the signal to pull in lci instead.
