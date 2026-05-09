---
name: figma-query-figma-info
description: "Get help documentation, tool information, and status from figma-query MCP server. 從 figma-query MCP 服務器獲取幫助文檔、工具信息與狀態。 Use when: first-time discovery of figma-query tools, checking server status, looking up query DSL operators, browsing workflow examples, debugging connection issues"
disable-model-invocation: true
---

# Figma Info Tool

`info` 工具提供 figma-query 能力的漸進式發現，含幫助文檔、工具列表、查詢 DSL 參考與服務器狀態。

## Tool Parameters

```yaml
tool: info
parameters:
  topic: "overview|tools|projections|query|operators|export|examples|status"  # optional
  format: "text|json"  # optional, default: text
```

## Topics

### overview (default)
figma-query 能力與可用工具的總體介紹。

### tools
所有 15 個 MCP 工具的完整列表，含描述與參數。

### projections
內建查詢投影參考：
- `@structure` - id, name, type, visible, parent_id
- `@bounds` - x, y, width, height, rotation
- `@css` - fills, strokes, effects, cornerRadius, opacity
- `@layout` - layoutMode, padding, itemSpacing, constraints
- `@typography` - fontFamily, fontSize, fontWeight, lineHeight
- `@tokens` - boundVariables, resolvedTokens
- `@images` - imageRefs, exportSettings
- `@children` - 帶深度的遞歸子節點
- `@all` - 所有字段合集

### query
含 FROM、WHERE、SELECT 語法的查詢 DSL 文檔。

### operators
WHERE 子句過濾操作符：
- `$eq` - exact match
- `$match` - glob pattern matching
- `$regex` - regular expression
- `$contains` - substring match
- `$in` - value in array
- `$gt`, `$gte`, `$lt`, `$lte` - comparisons
- `$exists` - field presence
- `$not` - negation

### export
資產、令牌與本地緩存的導出能力文檔。

### examples
多工具組合的工作流示例。

### status
服務器健康狀態、連接狀態與緩存狀態。

## Usage Examples

### Get Tool Overview
```yaml
mcp_name: figma-query
tool_name: info
parameters: {}
```

### List All Tools (JSON)
```yaml
mcp_name: figma-query
tool_name: info
parameters:
  topic: tools
  format: json
```

### Check Query DSL Reference
```yaml
mcp_name: figma-query
tool_name: info
parameters:
  topic: query
```

### Check Server Status
```yaml
mcp_name: figma-query
tool_name: info
parameters:
  topic: status
```

## When to Use

- **首次設置**：獲取概覽了解能力
- **查詢前**：查閱投影與操作符
- **調試**：核查連接與緩存狀態
- **學習**：瀏覽常用工作流示例

## Response Format

### Text Format (default)
含示例與說明的可讀文檔。

### JSON Format
適合程序化消費的結構化數據：
```json
{
  "topic": "tools",
  "tools": [
    {
      "name": "info",
      "description": "...",
      "parameters": {...}
    }
  ]
}
```
