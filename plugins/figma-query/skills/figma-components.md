---
name: figma-components
description: List all components in a Figma file with variants, usage statistics, and categorization
---

# Figma List Components Tool

The `list_components` tool returns a comprehensive inventory of all components in a Figma file, including variant information, usage statistics, and automatic categorization.

## Tool Parameters

```yaml
tool: list_components
parameters:
  file_key: "your-figma-file-key"  # required
  include_variants: true            # optional - include variant details
  include_usage: true               # optional - include instance counts
  limit: 100                        # optional - max results (default: 100)
  offset: 0                         # optional - pagination offset
```

## Usage Examples

### List All Components
```yaml
mcp_name: figma-query
tool_name: list_components
parameters:
  file_key: "ABC123xyz"
```

### With Variant Details
```yaml
mcp_name: figma-query
tool_name: list_components
parameters:
  file_key: "ABC123xyz"
  include_variants: true
```

### With Usage Statistics
```yaml
mcp_name: figma-query
tool_name: list_components
parameters:
  file_key: "ABC123xyz"
  include_usage: true
```

### Paginated Results
```yaml
mcp_name: figma-query
tool_name: list_components
parameters:
  file_key: "ABC123xyz"
  limit: 50
  offset: 100
```

## Response

```json
{
  "components": [
    {
      "id": "1:234",
      "name": "Button/Primary",
      "description": "Primary action button",
      "key": "abc123...",
      "variants": [
        {
          "id": "1:235",
          "name": "Button/Primary/Large",
          "properties": {
            "Size": "Large",
            "State": "Default"
          }
        }
      ],
      "usage": {
        "instance_count": 45,
        "pages_used": ["Home", "Dashboard", "Settings"]
      },
      "path": "Components / Buttons / Button/Primary"
    }
  ],
  "total": 156,
  "by_category": {
    "Buttons": 12,
    "Icons": 48,
    "Cards": 8,
    "Forms": 24,
    "Navigation": 16,
    "Other": 48
  }
}
```

## Response Fields

### Component Object
| Field | Description |
|-------|-------------|
| `id` | Unique node ID |
| `name` | Component name |
| `description` | Component description |
| `key` | Figma component key |
| `variants` | Array of variant definitions |
| `usage` | Instance count and page locations |
| `path` | Full path in file hierarchy |

### Variant Object
| Field | Description |
|-------|-------------|
| `id` | Variant node ID |
| `name` | Full variant name |
| `properties` | Property key-value pairs |

### Usage Object
| Field | Description |
|-------|-------------|
| `instance_count` | Number of instances in file |
| `pages_used` | Pages containing instances |

## Categorization

Components are automatically categorized by name patterns:

| Category | Name Patterns |
|----------|---------------|
| Buttons | Button, Btn, CTA |
| Icons | Icon, ico- |
| Cards | Card |
| Forms | Input, Form, Field, Select, Checkbox |
| Navigation | Nav, Menu, Tab, Link |
| Typography | Text, Heading, Title, Paragraph |
| Layout | Container, Grid, Stack, Spacer |

## Common Workflows

### Component Audit
```yaml
# 1. Get all components
list_components: include_usage: true

# 2. Identify unused components (instance_count: 0)

# 3. Document high-usage components
```

### Variant Analysis
```yaml
# 1. List with variants
list_components: include_variants: true

# 2. For each variant, get CSS
get_css: node_ids: ["1:235", "1:236"]

# 3. Document variant states
```

### Component Export
```yaml
# 1. List all components
list_components: {}

# 2. Extract IDs for export
export_assets: node_ids: [component_ids...]

# 3. Get tokens for each
get_tokens: node_ids: [component_ids...]
```

### Design System Documentation
```yaml
# 1. Get categorized inventory
list_components: include_variants: true, include_usage: true

# 2. For each category:
#    - wireframe for visual reference
#    - get_css for implementation
#    - get_node for full details
```

## Best Practices

1. **Start with overview**: Get all components without variants first
2. **Use pagination**: For large files, paginate to avoid timeouts
3. **Check usage**: Focus on high-usage components first
4. **Export by category**: Process similar components together
