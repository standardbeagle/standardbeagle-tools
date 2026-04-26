---
name: Progressive Discovery
description: "Info/discovery tool pattern for layered MCP capability exploration. 漸進披露能力、info工具模式。Use when: user asks to implement info tool, create discovery tool, progressive disclosure, help system, enumerate MCP capabilities, info tool pattern, or discusses how users discover what an MCP server can do."
version: 0.1.0
---

# Progressive Discovery

## Purpose

實現info/discovery工具模式，使用戶逐層探索MCP服務器能力。防止工具過多令人茫然，以分層訪問提供概覽→類別→具體工具→詳細文檔。

## When to Use

適用情形：
- MCP服務器有5+工具
- 工具數將增長
- 工具可分邏輯類別
- 用戶需指引了解現有工具
- 工具發現存在困難

## The Info Tool Pattern

### Core Concept

**單一入口**（`info`）枚舉：
1. **現有內容** - 工具類別與計數
2. **如何深入** - 下一發現步驟
3. **常用工作流** - 典型使用模式

**Example sparse table output:**

```
Available Tools
===============

Query Tools (2)
  search      - Find code patterns
  find_files  - Search file names

Lookup Tools (2)
  get_definition  - Get symbol details
  find_references - Find usages

Use: get_help(tool_name) for detailed documentation
```

### Implementation Patterns

#### Pattern 1: Single Info Tool

**When:** 5-15 tools, simple organization

```typescript
// Pseudocode
function info() {
  return {
    categories: [
      {
        name: "Query Tools",
        count: 2,
        tools: [
          {name: "search", description: "Find code patterns"},
          {name: "find_files", description: "Search file names"}
        ]
      }
    ],
    next_steps: "Use get_help(tool_name) for details"
  }
}
```

#### Pattern 2: Layered Discovery

**When:** 15+ tools, complex organization

**Layer 1 - Categories:**
```
info()
  → Categories: query, lookup, analysis, management
```

**Layer 2 - Category details:**
```
info(category="query")
  → Tools in query category with descriptions
```

**Layer 3 - Tool details:**
```
get_help(tool="search")
  → Full documentation for search tool
```

#### Pattern 3: Mode-Based Discovery

**When:** Different user needs (quick ref vs comprehensive)

```typescript
// Pseudocode
function info(mode = "overview") {
  if (mode === "overview") {
    // Sparse: just counts and categories
    return summaryCounts()
  } else if (mode === "tools") {
    // Medium: all tool names and one-line descriptions
    return toolList()
  } else if (mode === "comprehensive") {
    // Full: everything including examples
    return fullDocumentation()
  }
}
```

## Output Format Examples

### Sparse Table (Recommended for Overview)

```
Tool Groups
===========

Group        | Count | Avg Tokens | Performance
------------ | ----- | ---------- | -----------
query        | 3     | ~100       | Fast
lookup       | 4     | ~200       | Medium
analysis     | 2     | ~500       | Slow

Common Workflows:
  1. search → get_definition
  2. search → find_references → get_context

Use info(category="query") for details
```

**Token cost:** ~50 tokens

**Benefits:**
- Quick scan of capabilities
- Performance expectations set
- Clear next steps

### JSON Array (Machine Parseable)

```json
{
  "tool_groups": [
    {
      "name": "query",
      "count": 3,
      "avg_tokens": 100,
      "performance": "fast",
      "tools": [
        {"name": "search", "description": "Find code patterns"},
        {"name": "find_files", "description": "Search file names"},
        {"name": "list_symbols", "description": "List all symbols"}
      ]
    }
  ],
  "workflows": [
    {"name": "Find Implementation", "steps": ["search", "get_definition"]},
    {"name": "Understand Usage", "steps": ["search", "find_references", "get_context"]}
  ],
  "next_steps": {
    "category_detail": "info(category='query')",
    "tool_help": "get_help('search')"
  }
}
```

**Token cost:** ~150 tokens

**Benefits:**
- Machine readable for AI agents
- Structured for automation
- Complete capability map

### Category Detail View

```
Query Tools
===========

search
  Purpose: Find code patterns across codebase
  Input: {pattern: string, filter?: string}
  Output: Array of {id, name, preview, confidence}
  Generates: result_id (use with get_definition)
  Performance: Fast (~100 tokens)

find_files
  Purpose: Search file names and paths
  Input: {pattern: string}
  Output: Array of {path, matches}
  Performance: Fast (~50 tokens)

list_symbols
  Purpose: List all symbols in a file
  Input: {file_path: string}
  Output: Array of {name, type, line}
  Performance: Medium (~200 tokens)
```

**Token cost:** ~200 tokens

**Benefits:**
- Focused on one category
- Shows input/output schemas
- Performance expectations
- Cross-tool relationships (IDs)

## Progressive Detail Levels

### Level 1: Counts Only (Most Sparse)

```
Tools: 12 total
  Query: 3
  Lookup: 4
  Analysis: 2
  Management: 3
```

**Token cost:** ~20 tokens
**When:** Initial exploration, "what's available?"

### Level 2: Names + One-Line (Sparse)

```
Query Tools (3):
  search       - Find code patterns
  find_files   - Search file names
  list_symbols - List symbols in file
```

**Token cost:** ~40 tokens
**When:** "Show me query tools"

### Level 3: Detailed Descriptions (Medium)

```
search
  Find code patterns across entire codebase
  Input: {pattern: string (regex), filter?: string}
  Output: {results: [{id, name, preview, confidence}], has_more, total}
  Generates: result_id for use with get_definition
  Example: search("function.*User")
```

**Token cost:** ~100 tokens
**When:** "Tell me about search tool"

### Level 4: Full Documentation (Verbose)

```
search - Code Pattern Search
============================

Purpose:
  Find code patterns using regex across entire codebase.
  Optimized for speed with result ranking by relevance.

Input Schema:
  {
    pattern: string (required) - Regex pattern to search
    filter: string (optional) - File filter (*.ts, src/**)
    max: integer (optional) - Max results (default: 50)
  }

Output Schema:
  {
    results: [{
      id: string - Use with get_definition
      name: string - Symbol name
      preview: string - Code snippet
      confidence: number - 0.0-1.0 match quality
    }],
    has_more: boolean - More results available
    total: integer - Total matches found
  }

Performance:
  Average: ~100 tokens
  Speed: <5ms typical

Cross-Tool Usage:
  1. search() → result_ids
  2. get_definition(id) → full details

Examples:
  Basic: search("User")
  Regex: search("function.*authenticate")
  Filtered: search("class", filter="src/**/*.ts")

Related Tools:
  - get_definition: Get full details for result
  - find_references: Find usages of symbol
```

**Token cost:** ~400 tokens
**When:** "Give me everything about search"

## Info Tool Implementation Guide

### Pseudocode Structure

```typescript
function info(options?: {
  mode?: "overview" | "category" | "tool",
  category?: string,
  tool?: string
}) {
  // Level 1: Overview (default)
  if (!options || options.mode === "overview") {
    return {
      format: "sparse_table",
      categories: getCategorySummary(),
      workflows: getCommonWorkflows(),
      next_steps: "info(category='name') for details"
    }
  }

  // Level 2: Category detail
  if (options.category) {
    return {
      format: "tool_list",
      category: options.category,
      tools: getToolsInCategory(options.category),
      next_steps: "get_help(tool_name) for full docs"
    }
  }

  // Level 3: Tool detail (redirect to get_help)
  if (options.tool) {
    return `Use get_help("${options.tool}") for detailed documentation`
  }
}

function get_help(tool_name: string) {
  // Full documentation for specific tool
  return getToolDocumentation(tool_name)
}
```

### Output Format Decision Tree

```
User asks: "What can this MCP do?"
  → info() - Sparse table, ~50 tokens

User asks: "What query tools exist?"
  → info(category="query") - Tool list, ~100 tokens

User asks: "How do I use search?"
  → get_help("search") - Full docs, ~400 tokens

User asks: "Tell me everything"
  → info(mode="comprehensive") - Everything, ~1000+ tokens
  → WARN: Consider if this is actually helpful
```

## Accept Extra Parameters Pattern

**Critical learned lesson:** 常接受額外/幻覺參數並警示。

```typescript
// Pseudocode
function info(options: any) {
  // Extract known parameters
  const {mode, category, tool, ...extra} = options || {}

  // Build response
  const response = buildInfoResponse(mode, category, tool)

  // Warn about unknown parameters (don't reject)
  if (Object.keys(extra).length > 0) {
    response.warnings = [
      `Unknown parameters ignored: ${Object.keys(extra).join(', ')}`
    ]
  }

  return response
}
```

**Why:** AI代理有時幻覺參數。除非造成嚴重問題，否則寬容接受。

## Common Workflows Section

概覽中常包含常用工作流：

```
Common Workflows
================

Find Implementation:
  1. search("pattern") → result_ids
  2. get_definition(id) → full code

Understand Usage:
  1. search("class") → result_id
  2. find_references(id) → usage locations
  3. get_context(reference_id) → full context

Analyze Dependencies:
  1. search("module") → result_id
  2. analyze_dependencies(id) → dependency graph
```

## Anti-Patterns to Avoid

### ❌ Dump Everything

```typescript
function info() {
  // Returns 3000+ tokens
  return getAllToolsWithFullDocumentation()
}
```

**Why bad:** 信息過載，浪費token

### ❌ No Categories

```typescript
function info() {
  return [
    "search", "get_definition", "find_references",
    "get_context", "trace_callers", ... // 20 more
  ]
}
```

**Why bad:** 無組織，難以掃視

### ❌ Reject Unknown Parameters

```typescript
function info(options) {
  if (options.unknownParam) {
    throw new Error("Unknown parameter")
  }
}
```

**Why bad:** 脆弱，拒絕AI幻覺參數

## Real-World Examples

### Lightning Code Index (lci)

```
info tool output (actual):
=========================

Search & Code Intelligence Tools
---------------------------------
  search          - Sub-ms semantic code search
  get_context     - Get detailed symbol context
  code_insight    - Multi-mode codebase analysis

Use search with --help flag for detailed options
```

**Token cost:** ~40 tokens
**Approach:** Minimal, points to --help for details

### Custom Info Tool Design

```typescript
// Pseudocode for comprehensive info tool
function info(category?: string, detail_level: "sparse" | "medium" | "full" = "sparse") {
  const tools = getToolMetadata()

  if (detail_level === "sparse") {
    // Counts only
    return {
      total: tools.length,
      by_category: groupCounts(tools)
    }
  }

  if (category) {
    // Category-specific
    const filtered = tools.filter(t => t.category === category)
    return {
      category,
      count: filtered.length,
      tools: filtered.map(t => ({
        name: t.name,
        description: t.description,
        generates: t.generates,
        consumes: t.consumes
      }))
    }
  }

  // Full overview
  return {
    categories: getCategoriesWithTools(tools),
    workflows: getWorkflows(),
    performance: getPerformanceGuide()
  }
}
```

## Quick Reference

**Info tool checklist:**

- [ ] Returns sparse overview by default
- [ ] Groups tools by category/domain
- [ ] Shows tool counts per category
- [ ] Includes common workflows
- [ ] Provides next steps for detail
- [ ] Accepts extra parameters with warnings
- [ ] Uses sparse tables for human readability
- [ ] Provides JSON format for automation
- [ ] Token cost < 100 for overview
- [ ] Progressive detail levels implemented

**Progressive layers:**

1. **Overview** - Categories, counts, workflows (~50 tokens)
2. **Category** - Tools in category with descriptions (~100 tokens)
3. **Tool** - Single tool full documentation (~400 tokens)
4. **Comprehensive** - Everything (use sparingly, ~1000+ tokens)

助用戶發現能力，勿以信息過載。
