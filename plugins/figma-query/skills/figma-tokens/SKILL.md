---
name: figma-query-figma-tokens
description: "Get design token references and resolved values from Figma boundVariables. 從 Figma boundVariables 提取設計令牌引用與解析值。 Use when: auditing token usage, checking variable bindings on nodes, verifying token consistency across variants, exporting per-node token data, multi-mode light/dark analysis"
disable-model-invocation: true
---

# Figma Get Tokens Tool

`get_tokens` 工具從 Figma 節點提取設計令牌引用（boundVariables）並解析其實際值。

## Tool Parameters

```yaml
tool: get_tokens
parameters:
  file_key: "your-figma-file-key"  # required
  node_ids: ["1:234", "5:678"]      # required - node IDs
```

## Understanding Figma Variables

Figma 變量為設計令牌，可為：
- **Colors**：品牌色、語義色
- **Numbers**：間距、尺寸、圓角
- **Strings**：字體族、文本內容
- **Booleans**：功能開關、可見性

節點通過 `boundVariables` 引用變量，本工具提取並解析之。

## Usage Examples

### Get Token References
```yaml
mcp_name: figma-query
tool_name: get_tokens
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:234"]
```

### Multiple Nodes
```yaml
mcp_name: figma-query
tool_name: get_tokens
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:234", "1:235", "1:236"]
```

## Response

```json
{
  "tokens": {
    "1:234": {
      "fills": [
        {
          "variableId": "VariableID:123:456",
          "property": "fills.0.color",
          "name": "Colors/Primary/500",
          "collection": "Brand Colors"
        }
      ],
      "cornerRadius": {
        "variableId": "VariableID:123:789",
        "property": "cornerRadius",
        "name": "Radii/Medium",
        "collection": "Sizing"
      },
      "paddingLeft": {
        "variableId": "VariableID:123:012",
        "property": "paddingLeft",
        "name": "Spacing/4",
        "collection": "Spacing"
      }
    }
  },
  "resolved": {
    "VariableID:123:456": {
      "name": "Colors/Primary/500",
      "type": "COLOR",
      "value": { "r": 0.231, "g": 0.510, "b": 0.965, "a": 1 },
      "hex": "#3B82F6",
      "collection": "Brand Colors",
      "mode": "Light"
    },
    "VariableID:123:789": {
      "name": "Radii/Medium",
      "type": "FLOAT",
      "value": 8,
      "collection": "Sizing"
    },
    "VariableID:123:012": {
      "name": "Spacing/4",
      "type": "FLOAT",
      "value": 16,
      "collection": "Spacing"
    }
  },
  "warnings": [
    "Node 1:235: No variables bound"
  ]
}
```

## Response Fields

### tokens Object
節點 ID 映射至其綁定變量：

| Field | Description |
|-------|-------------|
| `variableId` | Figma variable ID |
| `property` | CSS property the variable is bound to |
| `name` | Human-readable variable name |
| `collection` | Variable collection name |

### resolved Object
完整變量定義：

| Field | Description |
|-------|-------------|
| `name` | Variable path (e.g., "Colors/Primary/500") |
| `type` | COLOR, FLOAT, STRING, BOOLEAN |
| `value` | Actual value |
| `hex` | Hex color (for COLOR type) |
| `collection` | Collection the variable belongs to |
| `mode` | Mode name if multi-mode (Light/Dark) |

## Common Variable Bindings

| Property | Variable Type | Example |
|----------|--------------|---------|
| `fills.0.color` | COLOR | Brand colors |
| `strokes.0.color` | COLOR | Border colors |
| `cornerRadius` | FLOAT | Border radius |
| `paddingLeft/Right/Top/Bottom` | FLOAT | Spacing |
| `itemSpacing` | FLOAT | Gap |
| `opacity` | FLOAT | Transparency |

## Common Workflows

### Token Audit
```yaml
# 1. Get tokens for all components
list_components: {}

# 2. For each, get tokens
get_tokens: node_ids: [...]

# 3. Analyze variable usage
```

### Variable Consistency Check
```yaml
# 1. Get tokens for similar components
get_tokens: node_ids: ["button-primary", "button-secondary"]

# 2. Compare variable usage

# 3. Flag inconsistencies
```

### Design Token Export
```yaml
# 1. Get all tokens
get_tokens: node_ids: [all_components]

# 2. Collect resolved values

# 3. Export as CSS/JSON
export_tokens: format: "css"
```

### Multi-Mode Analysis
```yaml
# 1. Get tokens (includes mode info)
get_tokens: node_ids: ["1:234"]

# 2. Check Light vs Dark values

# 3. Verify mode consistency
```

## Integration with export_tokens

`get_tokens` 返回每節點令牌引用；`export_tokens` 導出完整設計令牌系統：

```yaml
# Per-node tokens (for verification)
get_tokens: node_ids: ["1:234"]

# Full token system (for export)
export_tokens: format: "css"
```

## Best Practices

1. **實施前先核查**：確認節點使用令牌而非硬編碼值
2. **審計組件**：確保各變體令牌用法一致
3. **導出解析值**：用於 CSS 自定義屬性
4. **按集合組織**：按集合類型分類令牌

## Related

- `figma-query:figma-export-tokens` — 核查完令牌用法後，導出完整令牌系統至 CSS/JSON/Tailwind。
