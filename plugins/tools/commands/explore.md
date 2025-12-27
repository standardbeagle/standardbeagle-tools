---
name: explore
description: Explore the codebase structure using Lightning Code Index
allowed-tools:
  - mcp__cs__code_insight
  - mcp__cs__find_files
  - mcp__cs__search
  - mcp__cs__get_context
---

# Explore Codebase

Use the Lightning Code Index to explore and understand codebase structure.

## Instructions

1. Use `mcp__cs__code_insight mode="overview"` for high-level structure
2. Use `mcp__cs__find_files` to locate files by pattern
3. Use `mcp__cs__code_insight mode="detailed"` for specific areas
4. Use `mcp__cs__get_context` to dive into specific symbols

## Examples

- Get codebase overview: `mcp__cs__code_insight mode="overview"`
- Find test files: `mcp__cs__find_files pattern="*_test.go"`
- Analyze specific directory: `mcp__cs__code_insight mode="detailed" target="internal/api"`
- Get git hotspots: `mcp__cs__code_insight mode="git_hotspots"`
