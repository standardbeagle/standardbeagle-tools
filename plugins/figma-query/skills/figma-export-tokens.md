---
name: figma-export-tokens
description: Export Figma design tokens to CSS, JSON, or Tailwind format for integration into development workflows
---

# Figma Export Tokens Tool

The `export_tokens` tool extracts design tokens (colors, typography, spacing, etc.) from Figma variables and styles, exporting them in various formats for development integration.

## Tool Parameters

```yaml
tool: export_tokens
parameters:
  file_key: "your-figma-file-key"  # required
  output_path: "./tokens"           # required - destination file/folder
  format: "css"                     # optional - css|json|tailwind
  include: ["colors", "typography", "spacing", "effects"]  # optional
```

## Output Formats

### CSS Custom Properties
```css
:root {
  /* Colors */
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;

  /* Typography */
  --font-family-heading: 'Inter', sans-serif;
  --font-size-lg: 1.125rem;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-4: 1rem;
  --spacing-8: 2rem;

  /* Effects */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### JSON Format
```json
{
  "colors": {
    "primary": {
      "500": { "value": "#3B82F6", "type": "color" },
      "600": { "value": "#2563EB", "type": "color" }
    }
  },
  "typography": {
    "heading": {
      "fontFamily": { "value": "Inter", "type": "fontFamily" }
    }
  }
}
```

### Tailwind Config
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3B82F6',
          600: '#2563EB'
        }
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif']
      }
    }
  }
}
```

## Usage Examples

### Export All Tokens as CSS
```yaml
mcp_name: figma-query
tool_name: export_tokens
parameters:
  file_key: "ABC123xyz"
  output_path: "./styles/tokens.css"
  format: "css"
```

### Export for Tailwind Integration
```yaml
mcp_name: figma-query
tool_name: export_tokens
parameters:
  file_key: "ABC123xyz"
  output_path: "./tailwind.tokens.js"
  format: "tailwind"
```

### Export Colors Only as JSON
```yaml
mcp_name: figma-query
tool_name: export_tokens
parameters:
  file_key: "ABC123xyz"
  output_path: "./tokens/colors.json"
  format: "json"
  include: ["colors"]
```

### Export Typography and Spacing
```yaml
mcp_name: figma-query
tool_name: export_tokens
parameters:
  file_key: "ABC123xyz"
  output_path: "./tokens/"
  format: "css"
  include: ["typography", "spacing"]
```

## Response

```json
{
  "file_path": "./styles/tokens.css",
  "token_count": 156,
  "categories": {
    "colors": 48,
    "typography": 32,
    "spacing": 24,
    "effects": 16,
    "radii": 8,
    "other": 28
  },
  "warnings": [
    "Skipped 3 tokens with unsupported types"
  ]
}
```

## Token Categories

| Category | Figma Source | CSS Output |
|----------|--------------|------------|
| `colors` | Color styles, variables | `--color-*` |
| `typography` | Text styles | `--font-*`, `--text-*` |
| `spacing` | Number variables | `--spacing-*` |
| `effects` | Effect styles | `--shadow-*`, `--blur-*` |
| `radii` | Corner radius | `--radius-*` |

## Integration Patterns

### CSS Import
```css
@import './tokens.css';

.button {
  background: var(--color-primary-500);
  font-family: var(--font-family-body);
}
```

### Tailwind Extend
```javascript
// tailwind.config.js
const tokens = require('./tailwind.tokens.js');

module.exports = {
  theme: {
    extend: tokens.theme.extend
  }
}
```

### JavaScript Import
```javascript
import tokens from './tokens.json';

const primaryColor = tokens.colors.primary['500'].value;
```

## Best Practices

1. **Version control tokens**: Include exported tokens in git
2. **CI/CD integration**: Re-export tokens on design changes
3. **Use JSON for flexibility**: Transform to any format downstream
4. **Document mappings**: Note which Figma styles map to which tokens
