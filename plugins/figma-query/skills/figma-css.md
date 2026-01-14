---
name: figma-css
description: Extract production-ready CSS from Figma nodes in multiple styling formats
---

# Figma Get CSS Tool

The `get_css` tool extracts production-ready CSS from Figma nodes in various styling formats including vanilla CSS, CSS Modules, Tailwind, and styled-components.

## Tool Parameters

```yaml
tool: get_css
parameters:
  file_key: "your-figma-file-key"  # required
  node_ids: ["1:234", "5:678"]      # required - node IDs
  style: "vanilla"                  # optional - output format
  include: ["all"]                  # optional - CSS categories
```

## Style Formats

| Format | Description | Output |
|--------|-------------|--------|
| `vanilla` | Standard CSS | `.button { ... }` |
| `cssmodules` | CSS Modules | `.button { composes: ... }` |
| `tailwind` | Tailwind classes | `className="bg-blue-500 ..."` |
| `styled-components` | styled-components | `const Button = styled.div\`...\`` |
| `tokens` | CSS custom properties | `--button-bg: #3B82F6` |

## Include Categories

| Category | CSS Properties |
|----------|----------------|
| `layout` | display, flex, grid, position |
| `spacing` | margin, padding, gap |
| `colors` | background, color, border-color |
| `typography` | font-family, font-size, font-weight, line-height |
| `effects` | box-shadow, backdrop-filter, opacity |
| `borders` | border, border-radius |
| `all` | All categories (default) |

## Usage Examples

### Extract Vanilla CSS
```yaml
mcp_name: figma-query
tool_name: get_css
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:234"]
  style: "vanilla"
```

### Tailwind Classes
```yaml
mcp_name: figma-query
tool_name: get_css
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:234"]
  style: "tailwind"
```

### Colors and Typography Only
```yaml
mcp_name: figma-query
tool_name: get_css
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:234"]
  include: ["colors", "typography"]
```

### Multiple Nodes
```yaml
mcp_name: figma-query
tool_name: get_css
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:234", "1:235", "1:236"]
  style: "vanilla"
```

### CSS Variables/Tokens
```yaml
mcp_name: figma-query
tool_name: get_css
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:234"]
  style: "tokens"
```

## Response

```json
{
  "css": {
    "1:234": ".Button_Primary {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 12px 24px;\n  background-color: #3B82F6;\n  border-radius: 8px;\n  color: #FFFFFF;\n  font-family: 'Inter', sans-serif;\n  font-size: 16px;\n  font-weight: 600;\n  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\n}",
    "1:235": "..."
  },
  "variables": {
    "--button-bg": "#3B82F6",
    "--button-text": "#FFFFFF",
    "--button-radius": "8px"
  },
  "warnings": [
    "Node 1:236: Auto-layout converted to flex"
  ]
}
```

## Output Examples

### Vanilla CSS
```css
.Button_Primary {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background-color: #3B82F6;
  border-radius: 8px;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
}
```

### Tailwind
```html
<div className="flex items-center justify-center px-6 py-3 bg-blue-500 rounded-lg text-white font-semibold text-base">
  Button
</div>
```

### styled-components
```javascript
const ButtonPrimary = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background-color: #3B82F6;
  border-radius: 8px;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
`;
```

### Tokens
```css
:root {
  --button-primary-bg: #3B82F6;
  --button-primary-text: #FFFFFF;
  --button-primary-padding-x: 24px;
  --button-primary-padding-y: 12px;
  --button-primary-radius: 8px;
  --button-primary-font-size: 16px;
  --button-primary-font-weight: 600;
}
```

## Common Workflows

### Component Implementation
```yaml
# 1. Find component
search: pattern: "Button*"

# 2. Get CSS
get_css: node_ids: ["1:234"], style: "vanilla"

# 3. Implement in codebase
```

### Design Token Extraction
```yaml
# 1. Get all component CSS as tokens
get_css: node_ids: [...], style: "tokens"

# 2. Export to tokens file
export_tokens: format: "css"
```

### Tailwind Migration
```yaml
# 1. Get Tailwind classes for components
get_css: node_ids: [...], style: "tailwind"

# 2. Apply to React components
```

## Figma → CSS Mapping

| Figma Property | CSS Property |
|----------------|--------------|
| Auto-layout | display: flex |
| Padding | padding |
| Item spacing | gap |
| Fill | background-color / background |
| Stroke | border |
| Corner radius | border-radius |
| Effects (shadow) | box-shadow |
| Effects (blur) | backdrop-filter |
| Text style | font-family, font-size, etc. |
