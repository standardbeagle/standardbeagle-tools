---
name: context-handoff
description: Save and load code context manifests for agent handoff and session continuity
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Context Manifests for Agent Handoff

Use LCI's `context` tool to save compact code context manifests (2-5KB) that can be loaded later to instantly restore full context with source code and call graphs. Eliminates redundant exploration across agent sessions.

## When to Use

- Handing off an investigation to a subagent
- Saving your current understanding before a complex change
- Sharing code context between sessions
- Building up context incrementally during exploration
- Documenting which code areas need modification for a task

## Understanding Context Manifests

A manifest contains **refs** — pointers to code locations with metadata:

### Ref Roles

| Role | Meaning | Use For |
|------|---------|---------|
| `modify` | Code that needs to change | Files/functions you'll edit |
| `contract` | Interface/API that must be preserved | Public APIs, interfaces, types |
| `pattern` | Example to follow | Existing similar implementations |
| `boundary` | System boundary / integration point | External APIs, DB calls, I/O |

### Expansion Directives

When loading a manifest, refs can be expanded to include related context:

| Directive | What It Adds |
|-----------|-------------|
| `callers` | Functions that call this symbol |
| `callees` | Functions this symbol calls |
| `callees:2` | Callees with purity analysis |
| `implementations` | Concrete implementations of interface |
| `tests` | Related test files/functions |

---

## MCP Tool Calls

### Save a Context Manifest to File

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "save",
    "task": "Refactor authentication middleware to support JWT and session tokens",
    "refs": [
      {
        "f": "src/middleware/auth.ts",
        "s": "authenticateRequest",
        "role": "modify",
        "x": ["callers", "callees:2"],
        "note": "Main function to refactor"
      },
      {
        "f": "src/types/auth.ts",
        "s": "AuthConfig",
        "role": "contract",
        "note": "Interface must remain backward-compatible"
      },
      {
        "f": "src/middleware/session.ts",
        "s": "validateSession",
        "role": "pattern",
        "note": "Follow this pattern for JWT validation"
      }
    ],
    "to_file": ".lci/auth-refactor.json"
  }
}
```

### Save Manifest as Inline String

For passing directly to a subagent:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "save",
    "task": "Fix error handling in API layer",
    "refs": [
      {
        "f": "src/api/handler.ts",
        "s": "handleError",
        "role": "modify",
        "x": ["callers"]
      }
    ],
    "to_string": true
  }
}
```

### Load Context from File

Hydrates the manifest into full source code and call graphs:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "load",
    "from_file": ".lci/auth-refactor.json"
  }
}
```

### Load Context from Inline String

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "load",
    "from_string": "{\"task\":\"...\",\"refs\":[...]}"
  }
}
```

### Load with Format Control

Get different levels of detail:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "load",
    "from_file": ".lci/auth-refactor.json",
    "format": "signatures"
  }
}
```

Formats: `full` (default, complete source), `signatures` (declarations only), `outline` (structure overview).

### Load with Role Filter

Only load refs with specific roles:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "load",
    "from_file": ".lci/auth-refactor.json",
    "filter": ["modify", "contract"]
  }
}
```

### Load with Token Budget

Limit context size to fit within token constraints:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "load",
    "from_file": ".lci/auth-refactor.json",
    "max_tokens": 8000
  }
}
```

### Append to Existing Manifest

Add more refs to a saved manifest:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "save",
    "refs": [
      {
        "f": "src/api/routes.ts",
        "s": "authRoutes",
        "role": "boundary",
        "note": "Route definitions that wire up the middleware"
      }
    ],
    "to_file": ".lci/auth-refactor.json",
    "append": true
  }
}
```

---

## Workflows

### Investigate Then Hand Off to Agent

1. **Explore the problem** using search, get_context, code_insight
2. **Save what you found**:
   ```
   context save with refs listing each relevant symbol and its role
   ```
3. **Hand off to agent**: Agent loads the manifest to get instant context
4. **Agent works** with full understanding, no redundant exploration

### Incremental Context Building

1. **Start with known entry point**: Save initial ref
2. **As you discover related code**: Append refs with `append: true`
3. **Once investigation is complete**: Load full manifest to verify completeness
4. **Use the manifest** for implementation or handoff

### Multi-session Continuity

1. **End of session**: Save manifest capturing current understanding
   ```
   context save with task description and all discovered refs, to_file: ".lci/task-context.json"
   ```
2. **Next session**: Load manifest to restore context instantly
   ```
   context load with from_file: ".lci/task-context.json"
   ```
3. **Continue working** without re-exploring

### Build a Modification Plan

1. **Identify files to change**: Save with `role: "modify"`
2. **Identify contracts to preserve**: Save with `role: "contract"`, `x: ["implementations"]`
3. **Identify patterns to follow**: Save with `role: "pattern"`
4. **Identify boundaries**: Save with `role: "boundary"`, `x: ["callers"]`
5. **Load the full manifest**: Review the complete modification scope

---

## Quick Reference

### context Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `operation` | `"save"` or `"load"` | `"save"` |
| `task` | Task description | `"Refactor auth middleware"` |
| `refs` | Code references (save) | See ref format below |
| `to_file` | Save to file path | `".lci/task.json"` |
| `to_string` | Return as string | `true` |
| `from_file` | Load from file | `".lci/task.json"` |
| `from_string` | Load from string | `"{...}"` |
| `format` | Load format | `"full"`, `"signatures"`, `"outline"` |
| `filter` | Load only these roles | `["modify", "contract"]` |
| `exclude` | Skip these roles | `["pattern"]` |
| `max_tokens` | Token budget | `8000` |
| `append` | Add to existing file | `true` |

### Ref Format

```json
{
  "f": "path/to/file.ts",
  "s": "symbolName",
  "role": "modify",
  "l": {"start": 10, "end": 50},
  "x": ["callers", "callees:2"],
  "note": "Why this ref matters"
}
```

Required: `f` (file path). All other fields are optional.
