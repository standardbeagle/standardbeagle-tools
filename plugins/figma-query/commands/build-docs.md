---
name: build-docs
description: Interactive wizard to build a component and page documentation site from Figma using Go templates
arguments:
  - name: file_key
    description: Figma file key (optional - will prompt if not provided)
    required: false
---

# Build Documentation Site from Figma

This command guides you through creating a complete documentation site with HTML mockups and SASS/CSS from your Figma design system.

## Interactive Workflow

You will guide the user through these steps using AskUserQuestion:

### Step 1: Get Figma File

If `file_key` is not provided, ask the user:

```yaml
question: "What is your Figma file URL or key?"
header: "Figma File"
options:
  - label: "I'll paste the URL"
    description: "Paste the full Figma URL (e.g., figma.com/design/ABC123/...)"
  - label: "I have the file key"
    description: "Just the key part (e.g., ABC123xyz)"
```

Extract the file key from the URL if needed:
```
https://www.figma.com/design/ABC123xyz/Design-System
                            ^^^^^^^^^^^
```

### Step 2: Verify Figma Access

Use figma-query to check access:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: info
  parameters:
    topic: status
```

If not configured, guide user to set up token.

### Step 3: Choose Output Format

```yaml
question: "What CSS format do you want for your components?"
header: "CSS Format"
options:
  - label: "SCSS (Recommended)"
    description: "SASS with variables, nesting, and mixins"
  - label: "SASS"
    description: "Indented SASS syntax"
  - label: "Vanilla CSS"
    description: "Plain CSS with custom properties"
  - label: "Tailwind"
    description: "Tailwind utility classes"
```

### Step 4: Choose HTML Format

```yaml
question: "What HTML format do you want for mockups?"
header: "HTML Format"
options:
  - label: "Semantic HTML (Recommended)"
    description: "Clean, accessible HTML5 with proper elements"
  - label: "React Components"
    description: "JSX-ready component structure"
```

### Step 5: Choose Output Directory

```yaml
question: "Where should the documentation be saved?"
header: "Output Dir"
options:
  - label: "./docs (Recommended)"
    description: "Standard docs folder in project root"
  - label: "./design-system"
    description: "Dedicated design system folder"
  - label: "Custom path"
    description: "Specify a custom directory"
```

### Step 6: Sync File and Analyze

Sync the Figma file locally:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: sync_file
  parameters:
    file_key: "<FILE_KEY>"
    output_dir: "./figma-export"
    assets: true
```

Get the file structure:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_tree
  parameters:
    file_key: "<FILE_KEY>"
    depth: 3
```

List components:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: list_components
  parameters:
    file_key: "<FILE_KEY>"
    include_variants: true
```

### Step 7: Select What to Extract

Present discovered components and pages:

```yaml
question: "Which components do you want to document?"
header: "Components"
multiSelect: true
options:
  - label: "All components"
    description: "Extract all discovered components (X found)"
  - label: "Buttons only"
    description: "Button variants and states"
  - label: "Cards only"
    description: "Card components"
  - label: "Select specific"
    description: "I'll specify which ones"
```

### Step 8: Export Design Tokens

Export tokens in the chosen format:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_tokens
  parameters:
    file_key: "<FILE_KEY>"
    output_path: "<OUTPUT_DIR>/tokens/tokens.scss"  # or .css based on choice
    format: "scss"  # or css, tailwind based on choice
```

### Step 9: Extract Components

For each selected component, use the Go template-based extraction:

```yaml
# Get component CSS using template
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_css
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<COMPONENT_ID>"]
    style: "scss"  # Uses Go template: css/scss.tmpl
    namespace: "component-name"
    output_file: "<OUTPUT_DIR>/components/<name>/component.scss"
```

### Step 10: Export Assets

Export icons and images:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_assets
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<ICON_IDS>"]
    output_dir: "<OUTPUT_DIR>/assets"
    formats: ["svg"]
    naming: "name"
```

### Step 11: Generate HTML Mockups

For HTML mockup generation, you have two options:

**Option A: Use get_node with template rendering (if available)**
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

Then render using the template data structure to generate HTML.

**Option B: Use wireframe + CSS to build HTML**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: wireframe
  parameters:
    file_key: "<FILE_KEY>"
    node_id: "<COMPONENT_ID>"
    annotations: ["ids", "names", "dimensions"]
```

Use the wireframe structure to create semantic HTML with the extracted CSS classes.

### Step 12: Create Documentation Structure

Create the final documentation structure:

```
<OUTPUT_DIR>/
├── index.html              # Landing page with component gallery
├── tokens/
│   ├── tokens.scss         # Design tokens as SCSS variables
│   └── tokens.css          # CSS custom properties version
├── components/
│   ├── index.html          # Component index
│   ├── Button/
│   │   ├── index.html      # Component showcase
│   │   ├── component.scss  # Component styles
│   │   └── README.md       # Usage docs
│   └── Card/
│       └── ...
├── pages/
│   ├── index.html          # Page mockups index
│   └── Home/
│       ├── mockup.html     # Full page mockup
│       └── page.scss       # Page styles
└── assets/
    ├── icons/              # SVG icons
    └── images/             # Raster images
```

## Output Summary

At the end, present a summary:

```
Documentation Build Complete
============================
File: ABC123xyz
Output: ./docs

Exported:
- 45 components
- 12 pages
- 156 design tokens
- 234 assets

Files created:
- docs/index.html
- docs/tokens/tokens.scss
- docs/components/index.html
- docs/components/Button/index.html
- ...

Next steps:
1. Open docs/index.html in browser
2. Review generated SCSS in docs/tokens/
3. Copy component HTML from mockups
```

## Key Principles

1. **Use Go templates** - The figma-query MCP uses Go text/template for deterministic output
2. **No AI-generated code** - CSS and HTML come from templates, not LLM generation
3. **Interactive guidance** - Use AskUserQuestion to gather preferences
4. **Incremental extraction** - Let user choose what to extract
5. **Production-ready output** - BEM naming, SCSS variables, semantic HTML
