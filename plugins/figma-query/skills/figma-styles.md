---
name: figma-styles
description: List all styles in a Figma file including colors, typography, effects, and grids
---

# Figma List Styles Tool

The `list_styles` tool returns all defined styles in a Figma file, organized by type with usage information.

## Tool Parameters

```yaml
tool: list_styles
parameters:
  file_key: "your-figma-file-key"  # required
  style_types: ["color", "text"]   # optional - filter by type
  limit: 100                        # optional - max results
```

## Style Types

| Type | Description | Properties |
|------|-------------|------------|
| `color` | Fill and stroke colors | RGB/RGBA values, opacity |
| `text` | Typography styles | Font family, size, weight, line height |
| `effect` | Visual effects | Shadows, blur, inner shadows |
| `grid` | Layout grids | Column/row grids, margins |

## Usage Examples

### List All Styles
```yaml
mcp_name: figma-query
tool_name: list_styles
parameters:
  file_key: "ABC123xyz"
```

### Colors Only
```yaml
mcp_name: figma-query
tool_name: list_styles
parameters:
  file_key: "ABC123xyz"
  style_types: ["color"]
```

### Typography Only
```yaml
mcp_name: figma-query
tool_name: list_styles
parameters:
  file_key: "ABC123xyz"
  style_types: ["text"]
```

### Colors and Effects
```yaml
mcp_name: figma-query
tool_name: list_styles
parameters:
  file_key: "ABC123xyz"
  style_types: ["color", "effect"]
```

## Response

```json
{
  "styles": {
    "color": [
      {
        "id": "S:abc123",
        "name": "Primary/500",
        "key": "abc123...",
        "description": "Main brand color",
        "definition": {
          "type": "SOLID",
          "color": {
            "r": 0.231,
            "g": 0.510,
            "b": 0.965,
            "a": 1
          },
          "hex": "#3B82F6"
        },
        "usage_count": 156
      }
    ],
    "text": [
      {
        "id": "S:def456",
        "name": "Heading/H1",
        "key": "def456...",
        "definition": {
          "fontFamily": "Inter",
          "fontWeight": 700,
          "fontSize": 48,
          "lineHeight": { "value": 56, "unit": "PIXELS" },
          "letterSpacing": { "value": -1.2, "unit": "PIXELS" }
        },
        "usage_count": 24
      }
    ],
    "effect": [
      {
        "id": "S:ghi789",
        "name": "Shadow/Medium",
        "definition": {
          "type": "DROP_SHADOW",
          "color": { "r": 0, "g": 0, "b": 0, "a": 0.1 },
          "offset": { "x": 0, "y": 4 },
          "radius": 6,
          "spread": -1
        },
        "usage_count": 87
      }
    ],
    "grid": [
      {
        "id": "S:jkl012",
        "name": "Desktop/12-Column",
        "definition": {
          "pattern": "COLUMNS",
          "count": 12,
          "gutter": 24,
          "margin": 64
        },
        "usage_count": 12
      }
    ]
  },
  "total": 89,
  "by_type": {
    "color": 32,
    "text": 24,
    "effect": 18,
    "grid": 15
  }
}
```

## Color Style Properties

```json
{
  "type": "SOLID|GRADIENT_LINEAR|GRADIENT_RADIAL",
  "color": { "r": 0-1, "g": 0-1, "b": 0-1, "a": 0-1 },
  "hex": "#RRGGBB",
  "opacity": 0-1,
  "gradientStops": [...]  // for gradients
}
```

## Text Style Properties

```json
{
  "fontFamily": "Inter",
  "fontWeight": 400-900,
  "fontSize": 16,
  "lineHeight": { "value": 24, "unit": "PIXELS|PERCENT|AUTO" },
  "letterSpacing": { "value": 0, "unit": "PIXELS|PERCENT" },
  "textCase": "ORIGINAL|UPPER|LOWER|TITLE",
  "textDecoration": "NONE|UNDERLINE|STRIKETHROUGH"
}
```

## Effect Style Properties

```json
{
  "type": "DROP_SHADOW|INNER_SHADOW|LAYER_BLUR|BACKGROUND_BLUR",
  "color": { "r": 0, "g": 0, "b": 0, "a": 0.1 },
  "offset": { "x": 0, "y": 4 },
  "radius": 6,
  "spread": 0,
  "visible": true
}
```

## Common Workflows

### Design Token Export
```yaml
# 1. Get all styles
list_styles: {}

# 2. Export as CSS/JSON/Tailwind
export_tokens: format: "css"
```

### Color Audit
```yaml
# 1. Get color styles
list_styles: style_types: ["color"]

# 2. Identify low-usage colors

# 3. Find consolidation opportunities
```

### Typography System Review
```yaml
# 1. Get text styles
list_styles: style_types: ["text"]

# 2. Analyze font family usage

# 3. Check scale consistency
```

### Style Usage Analysis
```yaml
# 1. Get all styles with usage counts

# 2. Identify unused styles (usage_count: 0)

# 3. Find over-used styles that need variants
```
