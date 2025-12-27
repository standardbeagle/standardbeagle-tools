---
name: context
description: Get detailed context for code symbols using Lightning Code Index
allowed-tools:
  - mcp__cs__get_context
  - mcp__cs__context
  - mcp__cs__search
---

# Get Code Context

Use the Lightning Code Index to get detailed context for code symbols including call hierarchy, references, and dependencies.

## Instructions

1. First search for the symbol if needed: `mcp__cs__search pattern="symbolName"`
2. Use `mcp__cs__get_context` with the object ID to get full details
3. Use `mcp__cs__context` to save/load context manifests for agent handoff

## Examples

- Get symbol context: `mcp__cs__get_context id="ABC" include_call_hierarchy=true`
- Get context by name: `mcp__cs__get_context name="ProcessManager" include_all_references=true`
- Save context manifest: `mcp__cs__context operation="save" refs=[{"f":"main.go","s":"main"}]`
