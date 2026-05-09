---
name: context-handoff
description: Save and load code context manifests for agent handoff and session continuity. 保存/加載代碼上下文清單供代理交接。 Use when: handing off to subagent, saving investigation state, building incremental context, multi-session continuity.
---

# Context Manifests for Agent Handoff

以LCI之`context`工具保存緊湊代碼上下文清單（2-5KB），後續加載即刻恢復含源碼及調用圖之完整上下文。消除代理會話間冗餘探索。

## When to Use

- 將調查移交子代理
- 複雜更改前保存當前理解
- 會話間共享代碼上下文
- 探索中增量積累上下文
- 記錄任務需修改之代碼區域

## Understanding Context Manifests

清單含**refs**——附元數據之代碼位置指針：

### Ref Roles

| Role | Meaning | Use For |
|------|---------|---------|
| `modify` | Code that needs to change | Files/functions you'll edit |
| `contract` | Interface/API that must be preserved | Public APIs, interfaces, types |
| `pattern` | Example to follow | Existing similar implementations |
| `boundary` | System boundary / integration point | External APIs, DB calls, I/O |

### Expansion Directives

加載清單時，refs可展開含關聯上下文：

| Directive | What It Adds |
|-----------|-------------|
| `callers` | Functions that call this symbol |
| `callees` | Functions this symbol calls |
| `callees:2` | Callees with purity analysis |
| `implementations` | Concrete implementations of interface |
| `tests` | Related test files/functions |

---

## MCP Tool Calls

### Save a Context Manifest to File

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "save",
    "task": "Refactor authentication middleware to support JWT and session tokens",
    "refs": [
      {
        "f": "src/middleware/auth.ts",
        "s": "authenticateRequest",
        "role": "modify",
        "x": ["callers", "callees:2"],
        "note": "Main function to refactor"
      },
      {
        "f": "src/types/auth.ts",
        "s": "AuthConfig",
        "role": "contract",
        "note": "Interface must remain backward-compatible"
      },
      {
        "f": "src/middleware/session.ts",
        "s": "validateSession",
        "role": "pattern",
        "note": "Follow this pattern for JWT validation"
      }
    ],
    "to_file": ".lci/auth-refactor.json"
  }
}
```

### Save Manifest as Inline String

直接傳遞給子代理：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "save",
    "task": "Fix error handling in API layer",
    "refs": [
      {
        "f": "src/api/handler.ts",
        "s": "handleError",
        "role": "modify",
        "x": ["callers"]
      }
    ],
    "to_string": true
  }
}
```

### Load Context from File

將清單水化為完整源碼及調用圖：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "load",
    "from_file": ".lci/auth-refactor.json"
  }
}
```

### Load Context from Inline String

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "load",
    "from_string": "{\"task\":\"...\",\"refs\":[...]}"
  }
}
```

### Load with Format Control

獲不同詳細程度：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "load",
    "from_file": ".lci/auth-refactor.json",
    "format": "signatures"
  }
}
```

Formats: `full`（默認，完整源碼）、`signatures`（僅聲明）、`outline`（結構概覽）。

### Load with Role Filter

僅加載特定角色之refs：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "load",
    "from_file": ".lci/auth-refactor.json",
    "filter": ["modify", "contract"]
  }
}
```

### Load with Token Budget

限制上下文大小以符令牌約束：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "load",
    "from_file": ".lci/auth-refactor.json",
    "max_tokens": 8000
  }
}
```

### Append to Existing Manifest

向已保存清單追加refs：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "context",
  "parameters": {
    "operation": "save",
    "refs": [
      {
        "f": "src/api/routes.ts",
        "s": "authRoutes",
        "role": "boundary",
        "note": "Route definitions that wire up the middleware"
      }
    ],
    "to_file": ".lci/auth-refactor.json",
    "append": true
  }
}
```

---

## Workflows

### Investigate Then Hand Off to Agent

1. **探索問題**，使用search、get_context、code_insight
2. **保存所得**：
   ```
   context save，refs列每個相關符號及其角色
   ```
3. **移交代理**：代理加載清單即刻獲取上下文
4. **代理工作**，充分理解，無冗餘探索

### Incremental Context Building

1. **從已知入口點開始**：保存初始ref
2. **發現關聯代碼時**：以`append: true`追加refs
3. **調查完成後**：加載完整清單驗完整性
4. **使用清單**實現或移交

### Multi-session Continuity

1. **會話結束**：保存清單記錄當前理解
   ```
   context save，含任務描述及所有已發現refs，to_file: ".lci/task-context.json"
   ```
2. **下次會話**：加載清單即刻恢復上下文
   ```
   context load，from_file: ".lci/task-context.json"
   ```
3. **繼續工作**，無需重新探索

### Build a Modification Plan

1. **識別待改文件**：以`role: "modify"`保存
2. **識別待保契約**：以`role: "contract"`, `x: ["implementations"]`保存
3. **識別可循模式**：以`role: "pattern"`保存
4. **識別邊界**：以`role: "boundary"`, `x: ["callers"]`保存
5. **加載完整清單**：審查完整修改範圍

---

## Quick Reference

### context Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `operation` | `"save"` or `"load"` | `"save"` |
| `task` | Task description | `"Refactor auth middleware"` |
| `refs` | Code references (save) | See ref format below |
| `to_file` | Save to file path | `".lci/task.json"` |
| `to_string` | Return as string | `true` |
| `from_file` | Load from file | `".lci/task.json"` |
| `from_string` | Load from string | `"{...}"` |
| `format` | Load format | `"full"`, `"signatures"`, `"outline"` |
| `filter` | Load only these roles | `["modify", "contract"]` |
| `exclude` | Skip these roles | `["pattern"]` |
| `max_tokens` | Token budget | `8000` |
| `append` | Add to existing file | `true` |

### Ref Format

```json
{
  "f": "path/to/file.ts",
  "s": "symbolName",
  "role": "modify",
  "l": {"start": 10, "end": 50},
  "x": ["callers", "callees:2"],
  "note": "Why this ref matters"
}
```

必填：`f`（文件路徑）。其餘字段可選。
