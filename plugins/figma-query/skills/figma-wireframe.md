---
name: figma-wireframe
description: Generate visual wireframe representations of Figma nodes with annotations and ID legends
---

# Figma Wireframe Tool

The `wireframe` tool generates visual wireframe representations of Figma nodes in ASCII, SVG, or PNG format with annotations showing node IDs, names, dimensions, and spacing.

## Tool Parameters

```yaml
tool: wireframe
parameters:
  file_key: "your-figma-file-key"  # required
  node_id: "1:234"                  # required - node to wireframe
  style: "ascii"                    # optional - ascii|svg|png
  annotations: ["ids"]              # optional - ids|names|dimensions|spacing
  depth: 2                          # optional - child depth
  max_children: 10                  # optional - max children per node
```

## Output Styles

### ASCII (default)
```
┌─────────────────────────────────────────────────┐
│ [1:234] Button/Primary                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ [1:235] Icon                                │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ [1:236] Label                               │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### SVG
Visual SVG wireframe with color-coded boxes and annotations.

### PNG
Raster image of the wireframe for documentation.

## Annotations

| Option | Description |
|--------|-------------|
| `ids` | Node IDs in brackets |
| `names` | Node names |
| `dimensions` | Width x Height |
| `spacing` | Padding and gap values |

## Usage Examples

### Basic ASCII Wireframe
```yaml
mcp_name: figma-query
tool_name: wireframe
parameters:
  file_key: "ABC123xyz"
  node_id: "1:234"
```

### With All Annotations
```yaml
mcp_name: figma-query
tool_name: wireframe
parameters:
  file_key: "ABC123xyz"
  node_id: "1:234"
  annotations: ["ids", "names", "dimensions", "spacing"]
```

### Deep Component View
```yaml
mcp_name: figma-query
tool_name: wireframe
parameters:
  file_key: "ABC123xyz"
  node_id: "1:234"
  depth: 4
  max_children: 20
```

### SVG Output
```yaml
mcp_name: figma-query
tool_name: wireframe
parameters:
  file_key: "ABC123xyz"
  node_id: "1:234"
  style: "svg"
  annotations: ["ids", "names"]
```

### Names Only (Clean View)
```yaml
mcp_name: figma-query
tool_name: wireframe
parameters:
  file_key: "ABC123xyz"
  node_id: "1:234"
  annotations: ["names"]
```

## Response

```json
{
  "wireframe": "┌────────────────────...",
  "legend": {
    "1:234": "Button/Primary",
    "1:235": "Icon",
    "1:236": "Label"
  },
  "bounds": {
    "width": 120,
    "height": 48
  },
  "total_nodes": 3,
  "rendered_nodes": 3
}
```

## Response Fields

| Field | Description |
|-------|-------------|
| `wireframe` | The wireframe output (ASCII, SVG, or PNG path) |
| `legend` | Mapping of node IDs to names |
| `bounds` | Overall dimensions |
| `total_nodes` | Total nodes in subtree |
| `rendered_nodes` | Nodes actually rendered |

## ASCII Wireframe Example

With all annotations:
```
┌─────────────────────────────────────────────────┐
│ [1:234] Button/Primary (120×48)                 │
│ padding: 12 24 12 24                            │
│ ┌───────────────┐     ┌───────────────────────┐ │
│ │ [1:235] Icon  │ ─8─ │ [1:236] Label         │ │
│ │    (24×24)    │     │      (72×20)          │ │
│ └───────────────┘     └───────────────────────┘ │
└─────────────────────────────────────────────────┘

Legend:
  [1:234] Button/Primary - COMPONENT
  [1:235] Icon - INSTANCE
  [1:236] Label - TEXT
```

## Common Workflows

### Component Documentation
```yaml
# 1. Generate wireframe with IDs
wireframe: node_id: "1:234", annotations: ["ids", "names"]

# 2. Use legend for ID lookup

# 3. Get CSS for each node
get_css: node_ids: [from legend]
```

### Layout Analysis
```yaml
# 1. Wireframe with spacing
wireframe: node_id: "1:234", annotations: ["dimensions", "spacing"]

# 2. Analyze layout structure

# 3. Verify against design specs
```

### Navigation Discovery
```yaml
# 1. Wireframe component
wireframe: node_id: "1:234"

# 2. Note IDs from legend

# 3. Use IDs for get_node, get_css, etc.
```

### Visual Documentation
```yaml
# 1. Generate SVG wireframe
wireframe: node_id: "1:234", style: "svg"

# 2. Include in documentation

# 3. Reference ID legend
```

## Depth and max_children Guidelines

| depth | Use Case |
|-------|----------|
| 1 | Component overview |
| 2 | Basic structure (default) |
| 3-4 | Detailed component view |
| 5+ | Full nested structure |

| max_children | Use Case |
|--------------|----------|
| 5 | Quick preview |
| 10 | Standard view (default) |
| 20+ | Comprehensive view |

Higher values produce more detailed wireframes but may be harder to read.

## Best Practices

1. **Start with IDs**: Always include IDs for subsequent tool usage
2. **Use ASCII for exploration**: Quick and terminal-friendly
3. **Use SVG for docs**: Clean visual output
4. **Limit depth initially**: Expand as needed
5. **Reference legend**: Map IDs to names for clarity
