---
name: lci-trace-symbol
description: "Trace function call hierarchies, dependencies, side effects, and symbol relationships using LCI. 以LCI追蹤函數調用層次、依賴、副作用、符號關係。 Use when: understanding function before modifying, finding all callers before refactoring, checking side effects, tracing call chain for debugging."
---

# Symbol Tracing & Dependency Analysis

以LCI追蹤符號連接：調用者、被調者、副作用、依賴。更改前理解影響之必備工具。

## When to Use

- 理解函數作用及工作方式
- 重構前找到函數所有調用者
- 查函數是否有副作用
- 更改前追蹤依賴
- 調試時理解調用鏈

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

先搜符號獲ID，再取完整上下文：

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

使用搜索結果中之ID：

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

見調用此函數者及此函數所調：

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

查符號每處使用：

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

見符號所依賴（導入、類型、其他符號）：

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

組合多個include獲完整圖像：

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

若知確切符號名：

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

判函數是否純函數或有副作用：

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

按語義標籤查找符號（如`@lci:`注解）：

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

1. **找函數**：`search` `pattern: "funcName"`, `symbol_types: "function"`
2. **取完整上下文**：`get_context` `id`, `include_full_symbol: true`, `include_call_hierarchy: true`
3. **查副作用**：`side_effects` `symbol_name: "funcName"`, `include_transitive: true`
4. **找所有調用者**：`get_context` `include_all_references: true`
5. 至此知曉：其作用、依賴者、所觸及

### Trace a Bug Through the Call Chain

1. **從症狀入手**：`search`問題顯現之函數
2. **取調用者**：`get_context` `include_call_hierarchy: true`
3. **逐層上溯**：每個調用者，取其上下文及調用者
4. **查副作用**：對可疑函數運行`side_effects`，識別狀態突變
5. **找根因**：含意外副作用或錯誤依賴之函數

### Assess Refactoring Impact

1. **找目標符號**：`search` `pattern: "TargetType"`
2. **取所有引用**：`get_context` `include_all_references: true`
3. **取依賴**：`get_context` `include_dependencies: true`
4. **查下游**：每個引用點，查是否在公開API或測試中
5. 計受影響文件數及調用點數，估重構範圍

### Find Testable Pure Functions

1. **取純度摘要**：`side_effects` `mode: "summary"`, `file_path: "src/module.ts"`
2. **列純函數**：`side_effects` `mode: "pure"`, `file_path: "src/module.ts"`
3. 純函數最適合無mock單元測試

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
