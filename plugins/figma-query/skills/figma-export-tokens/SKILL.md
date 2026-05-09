---
name: figma-export-tokens
description: Export Figma design tokens to CSS, JSON, or Tailwind format for integration into development workflows. 導出 Figma 設計令牌為 CSS、JSON 或 Tailwind 格式。 Use when: exporting design tokens, generating CSS custom properties, creating Tailwind config from Figma, integrating tokens into CI/CD, version controlling design tokens
---

# Figma Export Tokens Tool

`export_tokens` 工具從 Figma 變量與樣式中提取設計令牌（顏色、排版、間距等），以多種格式導出供開發集成。

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

1. **版本管理令牌**：導出令牌納入 git
2. **CI/CD 集成**：設計變更時自動重新導出
3. **優先 JSON**：靈活，可向下游任意格式轉換
4. **記錄映射**：標注 Figma 樣式與令牌的對應關係
