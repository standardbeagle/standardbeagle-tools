---
name: search
description: Search the codebase using Lightning Code Index semantic search
allowed-tools:
  - mcp__lci__search
  - mcp__lci__get_context
  - mcp__lci__info
---

# Code Search

Use the Lightning Code Index for fast semantic code search.

## Instructions

1. Use `mcp__lci__search` with the user's search pattern
2. If they want more details on a result, use `mcp__lci__get_context` with the object ID
3. Present results in a clear, organized format

## Examples

- Search for function: `mcp__lci__search pattern="handleRequest"`
- Search with file filter: `mcp__lci__search pattern="validate" filter="*.go"`
- Search by symbol type: `mcp__lci__search pattern="User" symbol_types="struct,interface"`
- Get symbol details: `mcp__lci__get_context id="ABC" include_call_hierarchy=true`
