---
name: explore-codebase
description: Understand codebase architecture, structure, and patterns using LCI code intelligence. 以LCI探索代碼庫架構結構。 Use when: first look at unfamiliar codebase, understanding module layout, finding entry points, assessing complexity.
---

# Codebase Exploration Workflows

以LCI之`code_insight`工具高效理解代碼庫。較直接讀取文件，節省79.8%上下文，獲架構理解而不耗令牌。

## When to Use

- 首次探索陌生代碼庫
- 理解項目架構及模塊結構
- 查找關鍵類型、接口、入口點
- 獲代碼庫組成統計
- 理解目錄間代碼組織

## Understanding code_insight Modes

| Mode | Purpose | Use When |
|------|---------|----------|
| `overview` | High-level architecture, key types, entry points | First look at a project |
| `detailed` | Deep analysis of specific area | Drilling into a module |
| `statistics` | Codebase metrics and composition | Understanding scale/complexity |
| `structure` | Directory and file organization | Understanding layout |
| `unified` | Combined overview + statistics | Complete picture in one call |
| `git_analyze` | Git change analysis | Reviewing recent changes |
| `git_hotspots` | Frequently changed files | Finding maintenance hotspots |

**先用`overview`或`unified`，再以`detailed`或`structure`深入。**

---

## MCP Tool Calls

### Get Project Overview

任新代碼庫皆從此始。回關鍵類型、入口點、架構摘要：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "code_insight",
  "parameters": {
    "mode": "overview"
  }
}
```

### Get Unified Overview + Statistics

一次調用獲全面理解：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "code_insight",
  "parameters": {
    "mode": "unified"
  }
}
```

### Analyze a Specific Directory/Module

深入特定區域：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "code_insight",
  "parameters": {
    "mode": "detailed",
    "target": "src/api"
  }
}
```

### Get Directory Structure

理解文件組織：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "code_insight",
  "parameters": {
    "mode": "structure"
  }
}
```

### Get Codebase Statistics

語言分布、文件數、複雜度指標：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "code_insight",
  "parameters": {
    "mode": "statistics"
  }
}
```

### Filter by Language

聚焦特定語言分析：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "code_insight",
  "parameters": {
    "mode": "overview",
    "languages": ["typescript"]
  }
}
```

### Focused Analysis

縮窄分析至特定關注點：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "code_insight",
  "parameters": {
    "mode": "detailed",
    "target": "src/auth",
    "focus": "interfaces and dependencies"
  }
}
```

### Find Git Hotspots

最頻繁變更之文件（維護目標）：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "code_insight",
  "parameters": {
    "mode": "git_hotspots"
  }
}
```

### Browse Files by Pattern

按模式查找並列出文件：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "find_files",
  "parameters": {
    "pattern": "",
    "directory": "src/api",
    "filter": "*.ts"
  }
}
```

---

## CLI Commands

```bash
# Overview of codebase
lci symbols --mode overview

# Browse file structure
lci browse

# List files in directory
lci list src/api/

# Statistics
lci symbols --mode statistics

# Browse by language
lci list --lang typescript
```

---

## Workflows

### First Look at a New Codebase

1. **取概覽**：`code_insight` `mode: "unified"` — 一次調用獲架構+統計
2. **理解結構**：`code_insight` `mode: "structure"` — 見目錄組織
3. **深入關鍵區域**：`code_insight` `mode: "detailed"`, `target: "<dir>"` — 每個重要模塊
4. **找入口點**：`search` `symbol_types: "function"`, `pattern: "main"`或`"handler"`或`"route"`

### Understand a Specific Module

1. **詳細分析**：`code_insight` `mode: "detailed"`, `target: "src/module"`
2. **列其文件**：`find_files` `directory: "src/module"`
3. **找其接口**：`search` `symbol_types: "interface"`, `filter: "src/module/**"`
4. **查依賴**：`get_context`於關鍵符號，`include_dependencies: true`

### Assess Codebase Health

1. **取統計**：`code_insight` `mode: "statistics"`
2. **找熱點**：`code_insight` `mode: "git_hotspots"`
3. **查複雜度**：`code_insight` `mode: "statistics"`, `metrics: ["complexity"]`
4. **審查發現，優先排定重構目標**

---

## Quick Reference

### code_insight Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `mode` | Analysis type | `"overview"`, `"detailed"`, `"unified"` |
| `target` | Directory/file to analyze | `"src/api"` |
| `focus` | Analysis focus area | `"interfaces and dependencies"` |
| `languages` | Language filter | `["go", "typescript"]` |
| `analysis` | Analysis type hint | `"architecture"` |
| `max_results` | Limit results | `20` |
| `metrics` | Specific metrics | `["complexity", "coupling"]` |

### find_files Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `pattern` | Path/name to match | `"config"`, `"handler"` |
| `directory` | Scope to directory | `"src/api"` |
| `filter` | File type glob | `"*.ts"`, `"*.go"` |
| `flags` | `"ci"` or `"exact"` | `"ci"` |
| `max` | Result limit (default 50) | `100` |
