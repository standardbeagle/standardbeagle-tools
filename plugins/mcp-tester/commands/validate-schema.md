---
name: validate-schema
description: "Validate MCP tool JSON schemas and optionally test input against schemas. 驗MCP工具JSON綱要，可測輸入合規。 Use when: validate mcp schema, check tool schema, test schema input, mcp json schema error, verify tool parameters"
arguments:
  - name: server
    description: Server name to validate
    required: true
  - name: tool
    description: Specific tool to validate (optional - validates all if omitted)
    required: false
  - name: input
    description: JSON input to validate against tool schema (optional)
    required: false
---

# Validate MCP Tool Schemas

驗 MCP 伺服器工具之 JSON 模式。

## Instructions

1. 以 `mcp-debug` MCP 伺服器之 `schema_validate` 工具，傳入：
   - `server`：{{server}}
   - `tool`：{{tool}}（若提供）
   - `input`：{{input}}（若提供——須為有效 JSON 字串）

2. 報告驗證結果：
   - 模式驗證：工具輸入模式是否為有效 JSON Schema
   - 輸入驗證：提供之輸入是否符合工具模式
   - 任何驗證錯誤，含具體位置與問題詳情

3. 驗所有工具時（未指定工具），彙整：
   - 已查工具總數
   - 有效與無效模式數
   - 列出有模式問題之工具

## Usage Examples

```
/validate-schema myserver                                    # Validate all tool schemas
/validate-schema myserver process_data                       # Validate specific tool
/validate-schema myserver process_data '{"data": [1, 2]}'   # Validate input against schema
```

## Why Schema Validation Matters

- 無效模式可致工具呼叫意外失敗
- 輸入驗證確保資料符合伺服器預期
- 部署前及早捕捉模式問題
