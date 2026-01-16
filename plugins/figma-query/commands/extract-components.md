---
name: extract-components
description: Interactively extract components from Figma with SCSS/CSS using Go templates
arguments:
  - name: file_key
    description: Figma file key
    required: true
  - name: output_dir
    description: Output directory (default: ./components)
    required: false
---

# Extract Components from Figma

Extract specific components with SCSS/CSS and HTML mockups using deterministic Go templates.

## Workflow

### Step 1: List Available Components

First, get all components in the file:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: list_components
  parameters:
    file_key: "<FILE_KEY>"
    include_variants: true
    include_usage: true
```

### Step 2: Ask User to Select Components

Present the components and let user choose:

```yaml
question: "Which components would you like to extract?"
header: "Components"
multiSelect: true
options:
  - label: "All components"
    description: "Extract all N components found"
  - label: "Buttons"
    description: "Button components and variants"
  - label: "Form elements"
    description: "Inputs, selects, checkboxes"
  - label: "Cards"
    description: "Card components"
```

If user selects specific components, use search to find them:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: search
  parameters:
    file_key: "<FILE_KEY>"
    pattern: "Button*"
    node_types: ["COMPONENT", "COMPONENT_SET"]
```

### Step 3: Choose CSS Format

```yaml
question: "What CSS format?"
header: "CSS Style"
options:
  - label: "SCSS (Recommended)"
    description: "SCSS with variables and nesting"
  - label: "SASS"
    description: "Indented SASS syntax"
  - label: "Vanilla CSS"
    description: "Plain CSS with custom properties"
  - label: "Tailwind"
    description: "Tailwind utility classes"
```

### Step 4: Extract Design Tokens First

Always extract tokens first - components depend on them:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_tokens
  parameters:
    file_key: "<FILE_KEY>"
    output_path: "<OUTPUT_DIR>/tokens/_tokens.scss"
    format: "scss"
```

### Step 5: Extract Each Component

For each selected component:

#### 5a. Get Component Structure (Wireframe)

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: wireframe
  parameters:
    file_key: "<FILE_KEY>"
    node_id: "<COMPONENT_ID>"
    annotations: ["ids", "names", "dimensions", "spacing"]
```

#### 5b. Get CSS Using Go Template

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_css
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<COMPONENT_ID>"]
    style: "scss"  # Uses templates/css/scss.tmpl
    namespace: "<component-name>"
    output_file: "<OUTPUT_DIR>/<ComponentName>/_component.scss"
```

The `get_css` tool with `style: "scss"` uses the Go template at `templates/css/scss.tmpl`:

```scss
// Component: {{ .Node.Name }}
{{- range $name, $value := .Variables }}
${{ $name }}: {{ $value }};
{{- end }}

.{{ .ClassName }} {
{{- range $prop, $value := .CSS }}
  {{ $prop }}: {{ $value }};
{{- end }}

  &:hover {
    // Hover state placeholder
  }

  &:active {
    // Active state placeholder
  }
}
```

#### 5c. Get Full Node Data for HTML Generation

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_node
  parameters:
    file_key: "<FILE_KEY>"
    node_id: "<COMPONENT_ID>"
    select: ["@all"]
    depth: 3
```

#### 5d. Export Component Assets

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_assets
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<ASSET_NODE_IDS>"]
    output_dir: "<OUTPUT_DIR>/<ComponentName>/assets"
    formats: ["svg"]
```

#### 5e. Generate Preview Image

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: download_image
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<COMPONENT_ID>"]
    output_dir: "<OUTPUT_DIR>/<ComponentName>"
    format: "png"
    scale: 2
```

### Step 6: Create Component HTML Mockup

Using the node structure and CSS, create the HTML mockup file.

The Go template `templates/html/semantic.tmpl` produces:

```html
{{- /* TEXT nodes */ -}}
{{- if $isText -}}
<{{ $tag }} data-figma-id="{{ .Node.ID }}" class="{{ .ClassName }}"
    style="{{ template "renderTypographyStyle" .Typography }}">
{{ escapeHTML .Text }}
</{{ $tag }}>

{{- /* VECTOR nodes (icons) */ -}}
{{- else if $isVector -}}
<span data-figma-id="{{ .Node.ID }}" class="{{ .ClassName }}">
{{ template "renderSVG" .SVG }}
</span>

{{- /* FRAME/COMPONENT nodes */ -}}
{{- else -}}
<{{ $tag }} data-figma-id="{{ .Node.ID }}" class="{{ .ClassName }}"
    style="{{ .InlineStyle }}">
{{- range .Children }}
{{ template "renderNode" . }}
{{- end }}
</{{ $tag }}>
{{- end -}}
```

Write the HTML mockup:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ ComponentName }} - Component</title>
  <link rel="stylesheet" href="../tokens/_tokens.css">
  <link rel="stylesheet" href="./_component.css">
</head>
<body>
  <main class="component-showcase">
    <h1>{{ ComponentName }}</h1>

    <section class="variant">
      <h2>Default</h2>
      <div class="preview">
        <!-- Generated HTML from Go template -->
        {{ GENERATED_HTML }}
      </div>
    </section>

    <section class="variant">
      <h2>Variants</h2>
      <!-- Additional variants -->
    </section>
  </main>
</body>
</html>
```

### Step 7: Create Component Index

Create an index file listing all extracted components:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Components</title>
  <link rel="stylesheet" href="./tokens/_tokens.css">
</head>
<body>
  <h1>Component Library</h1>
  <ul class="component-grid">
    {{- range .Components }}
    <li>
      <a href="./{{ .Name }}/index.html">
        <img src="./{{ .Name }}/preview.png" alt="{{ .Name }}">
        <span>{{ .Name }}</span>
      </a>
    </li>
    {{- end }}
  </ul>
</body>
</html>
```

## Output Structure

```
<output_dir>/
├── index.html              # Component gallery
├── tokens/
│   ├── _tokens.scss        # SCSS variables
│   └── _tokens.css         # CSS custom properties
├── Button/
│   ├── index.html          # Component showcase
│   ├── _component.scss     # Component SCSS
│   ├── preview.png         # Visual preview
│   └── assets/             # Icons used in component
├── Card/
│   └── ...
└── Input/
    └── ...
```

## Summary Output

```
Component Extraction Complete
=============================
File: ABC123xyz
Output: ./components

Extracted 12 components:
- Button (5 variants)
- Card (3 variants)
- Input (4 variants)
...

Files created:
- components/tokens/_tokens.scss
- components/Button/_component.scss
- components/Button/index.html
- ...

Usage:
1. Import tokens: @use 'tokens/tokens';
2. Import component: @use 'Button/component';
3. Use in HTML: <button class="button button--primary">
```

## Error Handling

If extraction fails for a component:
1. Log the error
2. Continue with next component
3. Report partial success at end

```yaml
on_error:
  component_not_found:
    action: "Skip and continue"
    message: "Component X not found, skipping..."

  css_extraction_failed:
    action: "Note and continue"
    message: "CSS extraction failed for X, using fallback..."

  asset_export_failed:
    action: "Retry once, then continue"
    max_retries: 1
```
