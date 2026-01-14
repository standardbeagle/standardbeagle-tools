---
name: figma-tokens
description: Get design token references and resolved values from Figma boundVariables
---

# Figma Get Tokens Tool

The `get_tokens` tool extracts design token references (boundVariables) from Figma nodes and resolves their actual values.

## Tool Parameters

```yaml
tool: get_tokens
parameters:
  file_key: "your-figma-file-key"  # required
  node_ids: ["1:234", "5:678"]      # required - node IDs
```

## Understanding Figma Variables

Figma Variables are design tokens that can be:
- **Colors**: Brand colors, semantic colors
- **Numbers**: Spacing, sizing, border radius
- **Strings**: Font families, text content
- **Booleans**: Feature flags, visibility

Nodes reference variables through `boundVariables`, which this tool extracts and resolves.

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
Maps node IDs to their bound variables:

| Field | Description |
|-------|-------------|
| `variableId` | Figma variable ID |
| `property` | CSS property the variable is bound to |
| `name` | Human-readable variable name |
| `collection` | Variable collection name |

### resolved Object
Full variable definitions:

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

While `get_tokens` returns token references per-node, `export_tokens` exports the full design token system:

```yaml
# Per-node tokens (for verification)
get_tokens: node_ids: ["1:234"]

# Full token system (for export)
export_tokens: format: "css"
```

## Best Practices

1. **Check before implementing**: Verify nodes use tokens, not raw values
2. **Audit components**: Ensure consistent token usage across variants
3. **Export resolved values**: Use for CSS custom properties
4. **Track collections**: Organize tokens by collection type
