---
name: mcp-architect-context-compression
description: "Maximize info per token in MCP responses via abbreviation, schema optimization, selective fields, efficient formatting. 壓縮MCP響應、token預算分配。 Use when: token efficiency, compress responses, reduce token usage, minimize context, compact format, token optimization, reducing MCP response token consumption while preserving value."
disable-model-invocation: true
version: 0.1.0
---

# Context Compression

## Purpose

以縮寫、模式優化、選擇性字段包含及高效格式化，最大化MCP響應中每token的信息價值。

## When to Use

適用情形：
- token預算受限
- 響應重複或冗長
- 需要表示大型數據集
- 多工具共享相似數據結構
- 響應大小直接影響性能

## Compression Techniques

### 1. Abbreviate Field Names

**Before compression:**
```json
{
  "searchResults": [
    {
      "identifier": "a1b2",
      "symbolName": "authenticate",
      "fileLocation": "/src/models/user.ts",
      "lineNumber": 42,
      "confidenceScore": 0.95
    }
  ]
}
```

**After compression:**
```json
{
  "results": [
    {
      "id": "a1b2",
      "name": "authenticate",
      "file": "/src/models/user.ts",
      "line": 42,
      "conf": 0.95
    }
  ]
}
```

**Savings:** ~30% fewer tokens

### 2. Flatten Nested Structures

**Before:**
```json
{
  "response": {
    "data": {
      "results": {
        "items": [...]
      }
    }
  }
}
```

**After:**
```json
{
  "results": [...]
}
```

**Savings:** ~40% fewer tokens

### 3. Use Arrays for Uniform Data

**Verbose (objects):**
```json
[
  {"id": "a1", "name": "foo", "type": "fn"},
  {"id": "b2", "name": "bar", "type": "fn"},
  {"id": "c3", "name": "baz", "type": "fn"}
]
```

**Compact (table):**
```json
{
  "cols": ["id", "name", "type"],
  "rows": [
    ["a1", "foo", "fn"],
    ["b2", "bar", "fn"],
    ["c3", "baz", "fn"]
  ]
}
```

**Savings:** ~35% fewer tokens for 10+ rows

### 4. Selective Field Inclusion

**Full response:**
```json
{
  "id": "a1",
  "name": "authenticate",
  "type": "function",
  "file": "user.ts",
  "line": 42,
  "column": 5,
  "endLine": 48,
  "endColumn": 3,
  "signature": "...",
  "docs": "...",
  "created": "2024-01-15",
  "modified": "2024-02-10",
  "author": "...",
  "complexity": 7
}
```

**Minimal response:**
```json
{
  "id": "a1",
  "name": "authenticate",
  "type": "function",
  "file": "user.ts",
  "line": 42
}
```

**Savings:** ~70% fewer tokens (use get_details(id) for full version)

### 5. Reference-Based Compression

**Without references:**
```json
{
  "results": [
    {
      "name": "User.authenticate",
      "file": "/very/long/path/to/src/models/user.ts",
      "package": "com.example.userservice"
    },
    {
      "name": "User.validate",
      "file": "/very/long/path/to/src/models/user.ts",
      "package": "com.example.userservice"
    }
  ]
}
```

**With references:**
```json
{
  "refs": {
    "f1": "/very/long/path/to/src/models/user.ts",
    "p1": "com.example.userservice"
  },
  "results": [
    {"name": "User.authenticate", "file": "f1", "pkg": "p1"},
    {"name": "User.validate", "file": "f1", "pkg": "p1"}
  ]
}
```

**Savings:** ~50% for repeated values

## Compression Patterns by Use Case

### Search Results

```json
{
  "r": [  // results
    {"i": "a1", "n": "authenticate", "c": 0.95},  // id, name, confidence
    {"i": "b2", "n": "validate", "c": 0.70}
  ],
  "m": true,  // has_more
  "t": 127    // total
}
```

### Status Checks

```json
{
  "p": "running",  // status
  "u": "2h15m",     // uptime
  "m": "245MB",     // memory
  "c": 15           // cpu_percent
}
```

### Lists with Metadata

```json
{
  "items": ["a", "b", "c", "d", "e"],
  "t": 127,   // total
  "s": 5,     // showing
  "m": true   // more available
}
```

## Token Budget Allocation

按信息價值分配token預算：

| Information | Priority | Budget % | Example |
|-------------|----------|----------|---------|
| Core data | High | 60% | Search results, IDs |
| Metadata | Medium | 25% | Counts, flags |
| Help text | Low | 15% | Next steps, tips |

**Example allocation (200 token budget):**
- Results: 120 tokens (60%)
- Metadata: 50 tokens (25%)
- Guidance: 30 tokens (15%)

## Abbreviation Dictionary

標準縮寫以保一致性：

```
id       → i
name     → n
type     → t
file     → f
line     → l
confidence → c
results  → r
total    → t
has_more → m
description → desc
reference → ref
function → fn
class    → cls
interface → ifc
```

**Use in schemas:**
```json
{
  "i": "id",
  "n": "name",
  "t": "type",
  "c": "confidence"
}
```

## When NOT to Compress

以下情形避免過度壓縮：
- 小型響應（<100 tokens）— 開銷不值
- 關鍵錯誤消息 — 清晰優先於簡潔
- 安全相關字段 — 顯式更安全
- 面向用戶的文檔 — 可讀性重要

**Example - Don't compress:**
```json
{
  "error": "Authentication failed",  // Keep clear
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "The provided credentials are invalid"
}
```

## Compression + Readability Balance

**Extreme compression (hard to read):**
```json
{"r":[{"i":"a1","n":"auth","t":"fn","c":0.95}],"m":1,"t":127}
```

**Balanced compression:**
```json
{
  "results": [
    {"id": "a1", "name": "auth", "type": "fn", "conf": 0.95}
  ],
  "has_more": true,
  "total": 127
}
```

**Recommendation:** 適度壓縮字段名，保持結構清晰。

## Quick Reference

**Compression checklist:**

- [ ] Abbreviate verbose field names
- [ ] Flatten unnecessary nesting
- [ ] Use reference system for repeated values
- [ ] Select only needed fields by default
- [ ] Provide full version via get_details(id)
- [ ] Balance compression with readability
- [ ] Don't compress critical errors/security
- [ ] Document abbreviations in schema

**Token savings hierarchy:**

1. **ID references** - 70-90% savings (biggest win)
2. **Selective fields** - 50-70% savings
3. **Flattening** - 30-50% savings
4. **Abbreviation** - 20-35% savings
5. **Table format** - 25-40% savings for lists

優先以ID引用與選擇性字段取得最大收益。
