---
name: component-extraction
description: Extract single Figma component with CSS, assets, documentation, and HTML mockup. 單組件全量提取：CSS、資產、文檔、HTML。 Use when: extracting one component fully, generating component docs, exporting component CSS and assets, building HTML mockup from Figma component, component-level design library work
---

# Single Component Extraction

此技能提取實現單一 Figma 組件所需之全部物料。

## Extraction Process

### Phase 1: Discovery

探尋組件所在：

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

解析組件結構：

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

提取所有樣式信息：

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

導出圖像與圖標：

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

從組件數據生成可實施之 HTML：

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

組件集含多變體時：

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

此技能供對抗式設計庫循環逐組件調用：

1. 探索階段定位組件
2. 提取生成全部產物
3. 驗證對照 Figma
4. 文檔整理歸檔

> Invoke the `Skill` tool with `skill: figma-query:adversarial-design-library` — 啟動全庫對抗式提取循環，逐組件調用本技能。
