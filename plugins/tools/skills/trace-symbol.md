---
name: trace-symbol
description: Trace function call hierarchies, dependencies, side effects, and symbol relationships using LCI
---

# Symbol Tracing & Dependency Analysis

Use LCI to trace how symbols connect: what calls them, what they call, what side effects they have, and what they depend on. Essential for understanding impact before making changes.

## When to Use

- Understanding what a function does and how it works
- Finding all callers of a function before refactoring
- Checking if a function has side effects
- Tracing dependencies before making changes
- Understanding the call chain for debugging

## Tool Selection

| Need | Tool | Key Parameters |
|------|------|---------------|
| Full symbol context + source | `get_context` | `id`, `include_full_symbol` |
| Call hierarchy (callers/callees) | `get_context` | `include_call_hierarchy` |
| All references/usages | `get_context` | `include_all_references` |
| Dependencies | `get_context` | `include_dependencies` |
| Side effects/purity | `side_effects` | `symbol_name`, `mode` |
| Semantic labels | `semantic_annotations` | `label`, `category` |

---

## MCP Tool Calls

### Get Full Symbol Context

First, search for the symbol to get its ID, then get full context:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "search",
  "parameters": {
    "pattern": "handleRequest",
    "symbol_types": "function"
  }
}
```

Then use the ID from search results:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "get_context",
  "parameters": {
    "id": "VE",
    "include_full_symbol": true
  }
}
```

### Get Call Hierarchy

See what calls this function and what it calls:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "get_context",
  "parameters": {
    "id": "VE",
    "include_call_hierarchy": true
  }
}
```

### Get All References

Find every place a symbol is used:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "get_context",
  "parameters": {
    "id": "VE",
    "include_all_references": true
  }
}
```

### Get Dependencies

See what a symbol depends on (imports, types, other symbols):

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "get_context",
  "parameters": {
    "id": "VE",
    "include_dependencies": true
  }
}
```

### Get Everything at Once

Combine multiple includes for a complete picture:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "get_context",
  "parameters": {
    "id": "VE",
    "include_full_symbol": true,
    "include_call_hierarchy": true,
    "include_all_references": true,
    "include_dependencies": true
  }
}
```

### Look Up by Name (without search first)

If you know the exact symbol name:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "get_context",
  "parameters": {
    "name": "handleRequest",
    "include_call_hierarchy": true
  }
}
```

### Check Side Effects

Determine if a function is pure or has side effects:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "side_effects",
  "parameters": {
    "symbol_name": "handleRequest",
    "mode": "symbol",
    "include_reasons": true,
    "include_transitive": true
  }
}
```

### Find All Pure Functions in a File

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "side_effects",
  "parameters": {
    "mode": "pure",
    "file_path": "src/utils/helpers.ts"
  }
}
```

### Find All Impure Functions in a File

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "side_effects",
  "parameters": {
    "mode": "impure",
    "file_path": "src/api/handler.ts"
  }
}
```

### Find Functions by Side Effect Category

Categories: `param_write`, `global_write`, `io`, `network`, `throw`, `channel`, `external_call`

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "side_effects",
  "parameters": {
    "mode": "category",
    "category": "network"
  }
}
```

### Get Purity Summary for a File

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "side_effects",
  "parameters": {
    "mode": "summary",
    "file_path": "src/api/handler.ts"
  }
}
```

### Query Semantic Annotations

Find symbols by semantic labels (e.g., `@lci:` annotations):

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "semantic_annotations",
  "parameters": {
    "label": "api-endpoint",
    "include_propagated": true
  }
}
```

---

## CLI Commands

```bash
# Symbol context with call hierarchy
lci inspect handleRequest

# Call tree visualization
lci tree handleRequest

# Find references
lci refs handleRequest

# Find definition
lci def handleRequest
```

---

## Workflows

### Understand a Function Before Modifying It

1. **Find the function**: `search` with `pattern: "funcName"`, `symbol_types: "function"`
2. **Get full context**: `get_context` with `id`, `include_full_symbol: true`, `include_call_hierarchy: true`
3. **Check side effects**: `side_effects` with `symbol_name: "funcName"`, `include_transitive: true`
4. **Find all callers**: `get_context` with `include_all_references: true`
5. Now you know: what it does, what depends on it, and what it touches

### Trace a Bug Through the Call Chain

1. **Start at the symptom**: `search` for the function where the bug manifests
2. **Get callers**: `get_context` with `include_call_hierarchy: true`
3. **Walk up the chain**: For each caller, get its context and callers
4. **Check side effects**: `side_effects` on suspicious functions to identify state mutations
5. **Find the root cause**: The function with unexpected side effects or wrong dependencies

### Assess Refactoring Impact

1. **Find the target symbol**: `search` with `pattern: "TargetType"`
2. **Get all references**: `get_context` with `include_all_references: true`
3. **Get dependencies**: `get_context` with `include_dependencies: true`
4. **Check downstream**: For each reference site, check if it's in a public API or test
5. Count affected files and call sites to estimate refactoring scope

### Find Testable Pure Functions

1. **Get purity summary**: `side_effects` with `mode: "summary"`, `file_path: "src/module.ts"`
2. **List pure functions**: `side_effects` with `mode: "pure"`, `file_path: "src/module.ts"`
3. Pure functions are ideal for unit testing without mocks

---

## Quick Reference

### get_context Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `id` | Object ID from search | `"VE"` or `"VE,tG"` (multiple) |
| `name` | Symbol name (alt to id) | `"handleRequest"` |
| `include_full_symbol` | Full source code | `true` |
| `include_call_hierarchy` | Callers and callees | `true` |
| `include_all_references` | Every usage site | `true` |
| `include_dependencies` | What it depends on | `true` |
| `include_file_context` | Surrounding file info | `true` |
| `include_quality_metrics` | Complexity, etc. | `true` |
| `max_depth` | Hierarchy depth limit | `3` |

### side_effects Modes

| Mode | Purpose |
|------|---------|
| `symbol` | Check one symbol's effects |
| `file` | All effects in a file |
| `pure` | List pure functions |
| `impure` | List impure functions |
| `category` | Filter by effect type |
| `summary` | File-level purity overview |
