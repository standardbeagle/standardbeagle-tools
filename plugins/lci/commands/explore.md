---
name: explore
description: "Explore the codebase structure using Lightning Code Index. 以LCI探索代碼庫結構。 Use when: understanding codebase architecture, finding files by pattern, drilling into specific areas."
allowed-tools:
  - mcp__lci__code_insight
  - mcp__lci__find_files
  - mcp__lci__search
---

# Explore Codebase

以Lightning Code Index探索理解代碼庫結構。

## Instructions

1. 以`mcp__lci__code_insight` `mode="overview"`取高層結構
2. 以`mcp__lci__find_files`按模式定位文件
3. 以`mcp__lci__code_insight` `mode="detailed"`深入特定區域

## Examples

- Get codebase overview: `mcp__lci__code_insight mode="overview"`
- Find test files: `mcp__lci__find_files pattern="*_test.go"`
- Analyze specific directory: `mcp__lci__code_insight mode="detailed" target="internal/api"`
