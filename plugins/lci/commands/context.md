---
name: context
description: Get detailed context for code symbols using Lightning Code Index
allowed-tools:
  - mcp__lci__get_context
  - mcp__lci__context
  - mcp__lci__search
---

# Get Code Context

Use the Lightning Code Index to get detailed context for code symbols including call hierarchy, references, and dependencies.

## Instructions

1. First search for the symbol if needed: `mcp__lci__search pattern="symbolName"`
2. Use `mcp__lci__get_context` with the object ID to get full details
3. Use `mcp__lci__context` to save/load context manifests for agent handoff

## Examples

- Get symbol context: `mcp__lci__get_context id="ABC" include_call_hierarchy=true`
- Get context by name: `mcp__lci__get_context name="ProcessManager" include_all_references=true`
- Save context manifest: `mcp__lci__context operation="save" refs=[{"f":"main.go","s":"main"}]`
