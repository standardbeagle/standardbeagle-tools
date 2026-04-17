---
name: search
description: Search the codebase using Lightning Code Index semantic search. 以LCI語義搜索查找代碼庫符號。 Use when: searching for symbols, finding definitions, content search, regex search.
allowed-tools:
  - mcp__lci__search
  - mcp__lci__get_context
  - mcp__lci__info
---

# Code Search

以Lightning Code Index執行快速語義代碼搜索。

## Instructions

1. 以`mcp__lci__search`使用用戶搜索模式
2. 若需某結果更多詳情，以對象ID使用`mcp__lci__get_context`
3. 以清晰有序格式呈現結果

## Examples

- Search for function: `mcp__lci__search pattern="handleRequest"`
- Search with file filter: `mcp__lci__search pattern="validate" filter="*.go"`
- Search by symbol type: `mcp__lci__search pattern="User" symbol_types="struct,interface"`
