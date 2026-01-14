---
name: component-extraction
description: Extract a complete component with CSS, assets, documentation, and HTML mockup
---

# Single Component Extraction

This skill extracts everything needed to implement a single Figma component in code.

## Extraction Process

### Phase 1: Discovery

Find and understand the component:

```yaml
# Option A: Search by name
search:
  file_key: "FILE_KEY"
  pattern: "ComponentName*"
  node_types: ["COMPONENT"]

# Option B: From tree navigation
get_tree:
  file_key: "FILE_KEY"
  depth: 4

# Result: component node_id
```

### Phase 2: Structure Analysis

Understand component structure:

```yaml
# Get wireframe with all annotations
wireframe:
  file_key: "FILE_KEY"
  node_id: "COMPONENT_ID"
  annotations: ["ids", "names", "dimensions", "spacing"]
  depth: 4

# Get full node details
get_node:
  file_key: "FILE_KEY"
  node_id: "COMPONENT_ID"
  select: ["@all"]
  depth: 3
```

### Phase 3: CSS Extraction

Get all styling information:

```yaml
# Extract CSS for component and children
get_css:
  file_key: "FILE_KEY"
  node_ids: ["COMPONENT_ID", "CHILD_IDS..."]
  style: "vanilla"
  include: ["all"]

# Get token references
get_tokens:
  file_key: "FILE_KEY"
  node_ids: ["COMPONENT_ID", "CHILD_IDS..."]
```

### Phase 4: Asset Export

Export any images or icons:

```yaml
# Export component render
download_image:
  file_key: "FILE_KEY"
  node_ids: ["COMPONENT_ID"]
  format: "png"
  output_dir: "./docs/components"

# Export child assets (icons, images)
export_assets:
  file_key: "FILE_KEY"
  node_ids: ["ASSET_IDS..."]
  formats: ["svg", "png"]
  scales: [1, 2, 3]
  output_dir: "./assets"
```

## Output Structure

```
components/ComponentName/
├── README.md           # Documentation
├── component.css       # Extracted CSS
├── tokens.json         # Token references
├── wireframe.txt       # ASCII structure
├── preview.png         # Visual preview
├── mockup.html         # HTML implementation mockup
└── assets/
    ├── icon-1.svg
    └── icon-2.svg
```

## Documentation Template

```markdown
# ComponentName

## Overview
[Component description from Figma]

## Preview
![Component Preview](./preview.png)

## Structure
\`\`\`
[Wireframe output]
\`\`\`

## Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| variant | enum | primary | Visual variant |
| size | enum | medium | Size variant |

## Variants
- **Primary**: Main action style
- **Secondary**: Supporting action style

## CSS
\`\`\`css
[Extracted CSS]
\`\`\`

## Tokens Used
| Token | Property | Value |
|-------|----------|-------|
| --color-primary | background | #3B82F6 |

## HTML Mockup
\`\`\`html
[Generated HTML]
\`\`\`

## Usage Notes
[Implementation notes]
```

## HTML Mockup Generation

Generate implementation-ready HTML from component data:

```html
<!-- Generated from Figma component: Button/Primary -->
<button class="button button--primary">
  <span class="button__icon">
    <svg><!-- icon-check.svg --></svg>
  </span>
  <span class="button__label">Submit</span>
</button>

<style>
.button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
}

.button--primary {
  background-color: var(--color-primary-500, #3B82F6);
  color: var(--color-white, #FFFFFF);
}

.button__icon {
  width: 20px;
  height: 20px;
}
</style>
```

## Variant Extraction

For component sets with variants:

```yaml
# Get all variants
list_components:
  file_key: "FILE_KEY"
  include_variants: true

# For each variant, extract:
# 1. CSS
# 2. Tokens
# 3. Wireframe
# 4. Preview image
```

## Integration with Design Library Loop

This skill is used by the adversarial design library loop for each component:

1. Discovery phase identifies component
2. Extraction produces all artifacts
3. Verification validates output
4. Documentation organizes results
