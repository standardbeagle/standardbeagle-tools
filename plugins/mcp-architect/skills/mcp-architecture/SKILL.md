---
name: mcp-architect-mcp-architecture
description: "Patterns for organizing, naming, and structuring multi-tool MCP servers (10+ tools). 多工具MCP服務器架構、分組、命名慣例。Use when: user asks to organize MCP tools, structure multi-tool MCP, design MCP architecture, group MCP tools, organize 10+ tools, or discusses how to architect complex MCP servers with many tools."
disable-model-invocation: true
version: 0.1.0
---

# MCP Architecture

## Purpose

設計含多工具（10+）MCP服務器之整體架構與組織。提供相關工具分組、可發現性命名慣例及隨MCP服務器增長而擴展之結構方案。

## When to Use

適用情形：
- 設計含10+工具之MCP服務器
- 重組現有MCP以提升可發現性
- 規劃工具關係與數據流
- 為漸進式發現構建工具結構
- 在相關工具間建立一致命名

## Core Principles

### 1. Logical Grouping

按領域、工作流或數據類型分組，而非按技術實現。

**Example: Code Search MCP**

| Tool | Group | Purpose |
|------|-------|---------|
| search | query | Find code patterns |
| get_definition | lookup | Get symbol definition |
| find_references | lookup | Find symbol usages |
| get_context | enrichment | Get full context for symbol |
| info | discovery | Enumerate available tools |

**Sparse table format** - 人機皆可快速掃視關係。

**JSON array format** for automation:
```json
{
  "tool_groups": [
    {
      "name": "query",
      "tools": ["search"],
      "purpose": "Initial discovery operations"
    },
    {
      "name": "lookup",
      "tools": ["get_definition", "find_references"],
      "purpose": "Detailed symbol information"
    }
  ]
}
```

### 2. Naming Conventions

使用一致動詞-名詞模式，明示：
- **Action**: 工具所作何事 (search, get, find, list, create)
- **Target**: 操作對象 (file, symbol, process, session)

**Good naming patterns:**

```
Query tools:     search_*, find_*, list_*
Lookup tools:    get_*, fetch_*, retrieve_*
Creation tools:  create_*, start_*, init_*
Management:      update_*, delete_*, stop_*
Discovery:       info, help, describe_*
```

**Examples:**

| Tool Name | Pattern | Clear Purpose |
|-----------|---------|---------------|
| search_code | verb_noun | ✓ |
| get_definition | verb_noun | ✓ |
| code_search | noun_verb | ✗ Ambiguous order |
| find | verb_only | ✗ Too vague |
| get | verb_only | ✗ Get what? |

### 3. Tool Relationships

以token/ID系統定義工具間顯式關係，用於跨工具引用。

**Example: Browser Integration MCP**

```
proxy_start
  ↓ (generates: proxy_id)
proxy_status
  ↑ (consumes: proxy_id)
proxy_log
  ↑ (consumes: proxy_id)
  ↓ (generates: request_id)
proxy_replay
  ↑ (consumes: request_id)
```

**Sparse table representation:**

| Tool | Generates | Consumes | Relationship |
|------|-----------|----------|--------------|
| proxy_start | proxy_id | - | Root |
| proxy_status | - | proxy_id | Status query |
| proxy_log | request_id | proxy_id | Log retrieval |
| proxy_replay | - | request_id | Request replay |

一覽數據流與工具依賴。

### 4. Server Metadata

為清晰性與自動化構建服務器元數據結構。

**Minimal metadata:**
```json
{
  "name": "code-search",
  "version": "1.0.0",
  "description": "Lightning-fast semantic code search and analysis"
}
```

**Comprehensive metadata:**
```json
{
  "name": "code-search",
  "version": "1.0.0",
  "description": "Lightning-fast semantic code search and analysis",
  "tool_count": 12,
  "tool_groups": ["query", "lookup", "enrichment", "discovery"],
  "progressive_discovery": true,
  "has_info_tool": true,
  "token_systems": ["result_id", "symbol_id"],
  "max_response_tokens": 2000,
  "capabilities": {
    "search": true,
    "definitions": true,
    "references": true,
    "call_hierarchy": true
  }
}
```

`progressive_discovery`、`has_info_tool`等自動化標誌助AI代理有效使用服務器。

## Organizational Patterns

### Pattern 1: Layered Discovery

以遞進詳細層次組織工具：

**Layer 1: Discovery** - `info` tool
**Layer 2: Overview** - `search`, `list_*` tools
**Layer 3: Details** - `get_*`, `find_*` tools
**Layer 4: Deep Dive** - `analyze_*`, `trace_*` tools

**Example structure:**

| Layer | Tools | Token Cost | Use When |
|-------|-------|------------|----------|
| 1 | info | ~50 | Starting exploration |
| 2 | search_code | ~100 | Finding candidates |
| 3 | get_definition | ~200 | Understanding specific symbol |
| 4 | trace_callers | ~500 | Deep analysis |

### Pattern 2: Workflow Grouping

圍繞常用工作流組織工具：

**Code Search Workflows:**

```
Workflow: Find Implementation
  1. search_code("function name")
     → Generates: result_id[]
  2. get_definition(result_id)
     → Returns: Full definition

Workflow: Understand Usage
  1. search_code("class name")
  2. find_references(result_id)
  3. get_context(reference_id)
```

在服務器元數據或info工具輸出中記錄工作流。

### Pattern 3: Domain Separation

對處理多領域的服務器，使用前綴：

```
Code domain:     code_search, code_definition, code_references
File domain:     file_search, file_read, file_stats
Project domain:  project_info, project_structure, project_deps
```

**Sparse table:**

| Prefix | Domain | Tool Count |
|--------|--------|------------|
| code_* | Code analysis | 5 |
| file_* | File operations | 3 |
| project_* | Project metadata | 4 |

## Scaling Strategies

### When to Split an MCP Server

考慮拆分情形：
- 工具數超過20
- 不同領域有不同部署需求
- 不同認證/授權需求
- 工具性能特性差異大

**Example: Split recommendation**

```
Before (25 tools):
  unified-dev-server
    - Code tools (8)
    - Browser tools (7)
    - Process tools (6)
    - Session tools (4)

After (3 servers):
  code-search-server (8 tools)
  browser-proxy-server (7 tools)
  process-manager-server (10 tools, combining process + session)
```

### When to Keep Tools Together

保持合併情形：
- 共享公共數據/狀態
- 跨工具工作流頻繁
- 合計工具數 < 15
- 部署複雜度不值得拆分

## Naming Examples

### Good Tool Names (Following Patterns)

**Code Search Domain:**
```
search_code          - Search code by pattern
get_definition       - Get symbol definition by ID
find_references      - Find symbol references
list_symbols         - List all symbols in file
analyze_dependencies - Analyze code dependencies
```

**Process Management Domain:**
```
start_process   - Start a new process
get_status      - Get process status by ID
stop_process    - Stop running process
list_processes  - List all processes
tail_output     - Get recent process output
```

**Browser Integration Domain:**
```
start_proxy      - Start reverse proxy
get_incidents    - Pull the deduped, priority-ordered incident inbox
capture_screenshot - Capture browser screenshot
inject_script    - Inject JavaScript code
measure_performance - Get performance metrics
```

### Poor Tool Names (Avoid These)

```
search          - Too vague (search what?)
get             - Too vague (get what?)
find            - Too vague (find what?)
process         - Noun, not verb-noun
code            - Not clear what it does
run             - Ambiguous (run what?)
```

## Architecture Documentation

在服務器元數據、README或info工具輸出中記錄架構。

**Example info tool output (sparse table):**

```
Tool Groups
===========

Query Tools (Fast, <100 tokens)
  search_code      - Search code patterns
  search_files     - Search file names

Lookup Tools (Medium, ~200 tokens)
  get_definition   - Get symbol definition
  find_references  - Find symbol usages

Analysis Tools (Slow, ~500 tokens)
  trace_callers    - Trace call hierarchy
  analyze_deps     - Analyze dependencies

Use get_help(tool_name) for detailed tool documentation.
```

**JSON format for automation:**

```json
{
  "tool_groups": [
    {
      "name": "Query Tools",
      "performance": "fast",
      "avg_tokens": 100,
      "tools": [
        {"name": "search_code", "description": "Search code patterns"},
        {"name": "search_files", "description": "Search file names"}
      ]
    }
  ],
  "discovery": {
    "info_tool": "info",
    "help_tool": "get_help"
  }
}
```

## Additional Resources

### Reference Files

詳細模式與進階技術，參見：
- **`references/patterns.md`** - Comprehensive organizational patterns

### Examples

Working examples in `examples/`:
- **`code-search-architecture.json`** - Complete code search MCP structure
- **`browser-proxy-architecture.json`** - Browser integration MCP structure

## Quick Reference

**架構MCP服務器時：**

1. **Group logically** - By domain, workflow, or data type
2. **Name consistently** - Use verb-noun patterns
3. **Define relationships** - Document token/ID systems
4. **Layer discovery** - From overview to deep dive
5. **Document structure** - In metadata or info tool
6. **Use sparse tables** - For human readability
7. **Provide JSON** - For automation

**Tool organization checklist:**

- [ ] Tools grouped by logical domain
- [ ] Consistent verb-noun naming
- [ ] Token/ID relationships documented
- [ ] Progressive discovery layers defined
- [ ] Server metadata includes automation flags
- [ ] Info tool provides architecture overview
- [ ] Workflows documented
- [ ] Scaling strategy considered

以可發現性與漸進訪問為重，防止工具過多令用戶茫然。
