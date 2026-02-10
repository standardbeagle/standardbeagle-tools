---
name: explore-codebase
description: Understand codebase architecture, structure, and patterns using LCI code intelligence
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Codebase Exploration Workflows

Use LCI's `code_insight` tool to understand codebases efficiently. It provides 79.8% context reduction compared to reading files directly, giving you architecture understanding without token bloat.

## When to Use

- Exploring an unfamiliar codebase for the first time
- Understanding project architecture and module structure
- Finding key types, interfaces, and entry points
- Getting statistics on codebase composition
- Understanding how code is organized across directories

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

**Start with `overview` or `unified`, then drill down with `detailed` or `structure`.**

---

## MCP Tool Calls

### Get Project Overview

Start here for any new codebase. Returns key types, entry points, and architecture summary:

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

Best single-call option for comprehensive understanding:

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

Drill into a specific area:

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

Understand file organization:

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

Language breakdown, file counts, complexity metrics:

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

Focus analysis on specific languages:

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

Narrow analysis to specific concerns:

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

Files that change most frequently (maintenance targets):

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

Find and list files matching a pattern:

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

1. **Get the overview**: `code_insight` with `mode: "unified"` — gives architecture + statistics in one call
2. **Understand structure**: `code_insight` with `mode: "structure"` — see directory organization
3. **Drill into key areas**: `code_insight` with `mode: "detailed"`, `target: "<dir>"` — for each important module
4. **Find entry points**: `search` with `symbol_types: "function"`, `pattern: "main"` or `"handler"` or `"route"`

### Understand a Specific Module

1. **Detailed analysis**: `code_insight` with `mode: "detailed"`, `target: "src/module"`
2. **List its files**: `find_files` with `directory: "src/module"`
3. **Find its interfaces**: `search` with `symbol_types: "interface"`, `filter: "src/module/**"`
4. **Check dependencies**: `get_context` on key symbols with `include_dependencies: true`

### Assess Codebase Health

1. **Get statistics**: `code_insight` with `mode: "statistics"`
2. **Find hotspots**: `code_insight` with `mode: "git_hotspots"`
3. **Check complexity**: `code_insight` with `mode: "statistics"`, `metrics: ["complexity"]`
4. **Review findings and prioritize refactoring targets**

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
