---
name: figma-query-figma-css
description: "Extract production-ready CSS from Figma nodes in multiple styling formats. 從 Figma 節點提取多種格式的生產就緒 CSS。 Use when: extracting CSS from components, generating Tailwind classes, getting SCSS with variables, extracting CSS for specific categories, writing CSS directly to output files"
disable-model-invocation: true
---

# Figma Get CSS Tool

`get_css` 工具從 Figma 節點提取多種樣式格式的生產就緒 CSS，包括原生 CSS、CSS Modules、Tailwind 與 styled-components。

## Tool Parameters

```yaml
tool: get_css
parameters:
  file_key: "your-figma-file-key"  # required
  node_ids: ["1:234", "5:678"]      # required - node IDs
  format: "text"                    # optional - response format: text (default) or json
  style: "vanilla"                  # optional - CSS output style (see Style Formats)
  include: ["all"]                  # optional - CSS categories to include
  namespace: "my-component"         # optional - prefix for class names to avoid collisions
  output_file: "./components/button.scss"  # optional - write CSS to file
  append: false                     # optional - append to output_file instead of replacing (default: false)
```

### Parameter Reference

| Parameter | Required | Type | Default | Description |
|-----------|----------|------|---------|-------------|
| `file_key` | yes | string | - | Figma file key |
| `node_ids` | yes | string[] | - | Node IDs to extract CSS for |
| `format` | no | string | `"text"` | Response format: `text` returns readable CSS, `json` returns structured data |
| `style` | no | string | `"vanilla"` | CSS output style (see Style Formats below) |
| `include` | no | string[] | `["all"]` | CSS categories to include (see Include Categories below) |
| `namespace` | no | string | - | Prefix for generated class names to avoid naming collisions |
| `output_file` | no | string | - | File path to write CSS output to (used with `append`) |
| `append` | no | boolean | `false` | When `true`, append CSS to `output_file` instead of replacing its contents |

## Style Formats

| Format | Description | Output |
|--------|-------------|--------|
| `vanilla` | Standard CSS (default) | `.button { ... }` |
| `scss` | SCSS with variables and nesting | `$var: value; .button { &:hover { ... } }` |
| `sass` | Indented SASS syntax | `.button\n  display: flex` |
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

### SCSS with Namespace
```yaml
mcp_name: figma-query
tool_name: get_css
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:234"]
  style: "scss"
  namespace: "btn-primary"
```

### Write CSS to File
```yaml
mcp_name: figma-query
tool_name: get_css
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:234"]
  style: "scss"
  namespace: "card"
  output_file: "./components/Card/_component.scss"
```

### Append Section Styles to Existing File
```yaml
mcp_name: figma-query
tool_name: get_css
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:300", "1:301", "1:302"]
  style: "scss"
  namespace: "homepage"
  output_file: "./pages/Homepage/_sections.scss"
  append: true
```

### JSON Response Format
```yaml
mcp_name: figma-query
tool_name: get_css
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:234"]
  format: "json"
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

### SCSS
```scss
// Component: Button_Primary
$btn-primary-bg: #3B82F6;
$btn-primary-text: #FFFFFF;
$btn-primary-radius: 8px;

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background-color: $btn-primary-bg;
  border-radius: $btn-primary-radius;
  color: $btn-primary-text;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;

  &:hover {
    // Hover state placeholder
  }

  &:active {
    // Active state placeholder
  }
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

## File Output

指定 `output_file` 時，CSS 直接寫入指定路徑：

- **Replace mode** (default)：創建或覆寫文件。
- **Append mode** (`append: true`)：追加至現有文件，保留原有內容。提取多個區塊或組件至同一樣式表時尤為有用。

增量構建頁面樣式表的示例工作流：

```yaml
# 1. Extract layout CSS (creates the file)
get_css:
  node_ids: ["1:100"]
  style: "scss"
  namespace: "homepage"
  output_file: "./pages/Homepage/_styles.scss"

# 2. Append section styles (adds to the file)
get_css:
  node_ids: ["1:200", "1:201"]
  style: "scss"
  namespace: "homepage"
  output_file: "./pages/Homepage/_styles.scss"
  append: true
```

## Namespace

`namespace` 參數為生成的類名添加前綴，防止多組件提取至同一作用域時命名衝突。例如，`namespace: "card"` 下，名為 "Title" 的子節點生成 `.card-Title` 而非 `.Title`。

尤其適用於：
- 提取多個可能共享子節點名的組件
- 構建多個 Figma 節點的合併樣式表
- 生成 CSS Modules 或作用域樣式

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

## Related

- `figma-query:figma-node` — 上游：按 ID 取節點詳情，再抽其 CSS。
- `figma-query:figma-export-tokens` — 將 CSS 中之值提升為可複用設計令牌（CSS/JSON/Tailwind）。
