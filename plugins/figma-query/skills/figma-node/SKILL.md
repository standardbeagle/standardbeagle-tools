---
name: figma-query-figma-node
description: "Get full details for specific Figma node by ID with selective field projection. 按 ID 取節點詳情，支持字段投影。 Use when: inspecting specific node, getting CSS properties for node, retrieving layout or typography details, exploring node hierarchy, looking up node by ID"
disable-model-invocation: true
---

# Figma Get Node Tool

`get_node` 工具按 ID 取節點完整詳情，支持字段投影與遞歸子節點獲取。

## Tool Parameters

```yaml
tool: get_node
parameters:
  file_key: "your-figma-file-key"  # required
  node_id: "1:234"                  # required - node ID
  select: ["@structure", "@css"]    # optional - projections
  depth: 0                          # optional - child depth
```

## Projections

按需投影，僅取所需字段：

| Projection | Fields Included |
|------------|-----------------|
| `@structure` | id, name, type, visible, parent_id |
| `@bounds` | x, y, width, height, rotation |
| `@css` | fills, strokes, effects, cornerRadius, opacity, blendMode |
| `@layout` | layoutMode, padding*, itemSpacing, constraints |
| `@typography` | fontFamily, fontSize, fontWeight, lineHeight, letterSpacing |
| `@tokens` | boundVariables, resolvedTokens |
| `@images` | imageRefs, exportSettings |
| `@children` | Direct children (use depth for recursion) |
| `@all` | Everything |

## Usage Examples

### Basic Node Details
```yaml
mcp_name: figma-query
tool_name: get_node
parameters:
  file_key: "ABC123xyz"
  node_id: "1:234"
```

### Get CSS Properties Only
```yaml
mcp_name: figma-query
tool_name: get_node
parameters:
  file_key: "ABC123xyz"
  node_id: "1:234"
  select: ["@css"]
```

### Get Structure and Layout
```yaml
mcp_name: figma-query
tool_name: get_node
parameters:
  file_key: "ABC123xyz"
  node_id: "1:234"
  select: ["@structure", "@layout"]
```

### Include Children
```yaml
mcp_name: figma-query
tool_name: get_node
parameters:
  file_key: "ABC123xyz"
  node_id: "1:234"
  select: ["@structure"]
  depth: 2
```

### Get Everything
```yaml
mcp_name: figma-query
tool_name: get_node
parameters:
  file_key: "ABC123xyz"
  node_id: "1:234"
  select: ["@all"]
  depth: 3
```

## Response

```json
{
  "node": {
    "id": "1:234",
    "name": "Button/Primary",
    "type": "COMPONENT",
    "visible": true,
    "parent_id": "1:100",
    "x": 100,
    "y": 200,
    "width": 120,
    "height": 48,
    "fills": [
      {
        "type": "SOLID",
        "color": { "r": 0.231, "g": 0.510, "b": 0.965, "a": 1 }
      }
    ],
    "effects": [],
    "cornerRadius": 8,
    "children": [...]
  },
  "path": "Components / Buttons / Button/Primary",
  "children_count": 3
}
```

## Response Fields

| Field | Description |
|-------|-------------|
| `node` | Full node object with requested fields |
| `path` | Hierarchical path from root |
| `children_count` | Total children (even if not included) |

## Common Workflows

### Component Documentation
```yaml
# 1. Get component with all details
get_node: node_id: "1:234", select: ["@all"]

# 2. Extract CSS
get_css: node_ids: ["1:234"]

# 3. Get wireframe visualization
wireframe: node_id: "1:234"
```

### Style Analysis
```yaml
# 1. Get node CSS properties
get_node: node_id: "1:234", select: ["@css", "@tokens"]

# 2. Check token references

# 3. Validate against design system
```

### Layout Inspection
```yaml
# 1. Get layout properties
get_node: node_id: "1:234", select: ["@layout", "@bounds"]

# 2. Check auto-layout settings

# 3. Verify spacing and padding
```

### Hierarchical Exploration
```yaml
# 1. Get node with children
get_node: node_id: "1:234", depth: 1

# 2. For each child, get details
get_node: node_id: "child_id", select: [...]
```

## Depth Guidelines

| Depth | What's Included |
|-------|-----------------|
| 0 | Node only, no children |
| 1 | Node + direct children |
| 2 | Node + children + grandchildren |
| 3+ | Deeper recursion |

深度越大，返回數據越多。用投影限制響應體積。

## Finding Node IDs

節點 ID 可從以下途徑獲取：
- `get_tree` - 返回帶 ID 的文件結構
- `search` - 按模式查找節點
- `list_components` - 全部組件 ID
- `wireframe` - 帶 ID 圖例的可視化
- Figma URL: `figma.com/file/KEY?node-id=1:234`
