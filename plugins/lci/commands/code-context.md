---
name: code-context
description: Get detailed context for code symbols using Lightning Code Index. 以LCI取符號詳細上下文含調用層次、引用、依賴。 Use when: getting symbol details, call hierarchy, saving context manifests for handoff.
allowed-tools:
  - mcp__lci__get_context
  - mcp__lci__context
  - mcp__lci__search
---

# Get Code Context

以Lightning Code Index取代碼符號詳細上下文，含調用層次、引用、依賴。

## Instructions

1. 若需先搜索符號：`mcp__lci__search pattern="symbolName"`
2. 以對象ID使用`mcp__lci__get_context`取完整詳情
3. 以`mcp__lci__context`保存/加載上下文清單供代理交接

## Examples

- Get symbol context: `mcp__lci__get_context id="ABC" include_call_hierarchy=true`
- Get context by name: `mcp__lci__get_context name="ProcessManager" include_all_references=true`
- Save context manifest: `mcp__lci__context operation="save" refs=[{"f":"main.go","s":"main"}]`
