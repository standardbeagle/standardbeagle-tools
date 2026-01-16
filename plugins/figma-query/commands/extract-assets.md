---
name: extract-assets
description: Comprehensive asset extraction from Figma - finds ALL images, icons, and vectors including those without export settings
arguments:
  - name: file_key
    description: Figma file key
    required: true
  - name: output_dir
    description: Output directory (default: ./assets)
    required: false
---

# Extract All Assets from Figma

This command performs comprehensive asset extraction, finding images and icons that the default export misses.

## The Problem

Figma stores assets in multiple ways:
1. **Image fills** - Images used as fills (backgrounds, photos)
2. **Image strokes** - Images used as stroke patterns
3. **Background images** - Frame/canvas backgrounds
4. **Vector icons** - VECTOR/BOOLEAN nodes that must be RENDERED (not downloaded)
5. **Icon components** - Frames containing vectors, often without export settings

The default `sync_file` only exports:
- Image fills via Figma's `GetImageFills` API
- Nodes with explicit `ExportSettings`

**Vector icons without ExportSettings are NOT exported by default!**

## Workflow

### Step 1: Initial sync to get image fills
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: sync_file
  parameters:
    file_key: "<FILE_KEY>"
    output_dir: "<OUTPUT_DIR>/figma-export"
    include: ["assets"]
```

### Step 2: Find vector nodes (icons without export settings)
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["VECTOR", "BOOLEAN_OPERATION", "STAR", "LINE", "ELLIPSE", "REGULAR_POLYGON"]
      select: ["@structure", "@bounds"]
      depth: -1
```

### Step 3: Find icon-like components
```yaml
# By name pattern
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: search
  parameters:
    file_key: "<FILE_KEY>"
    pattern: "*icon*"
    node_types: ["COMPONENT", "FRAME"]

# By size (icons are typically ≤64px)
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["COMPONENT"]
      where:
        width:
          $lte: 64
        height:
          $lte: 64
      select: ["@structure", "@bounds"]
```

### Step 4: Ask user what to export
```yaml
question: "What types of assets should be exported?"
header: "Asset Types"
multiSelect: true
options:
  - label: "All icons as SVG"
    description: "Export all vector/icon nodes as SVG files"
  - label: "Image fills"
    description: "Background images, photos (already in sync)"
  - label: "Components as PNG"
    description: "Render component previews as PNG"
  - label: "Specific nodes"
    description: "I'll specify which nodes to export"
```

### Step 5: Export icons as SVG
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_assets
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<ALL_ICON_IDS>"]
    output_dir: "<OUTPUT_DIR>/icons"
    formats: ["svg"]
    naming: "name"
```

### Step 6: Export larger images as PNG with @2x
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_assets
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<IMAGE_NODE_IDS>"]
    output_dir: "<OUTPUT_DIR>/images"
    formats: ["png"]
    scales: [1, 2]
    naming: "name"
```

### Step 7: Create asset manifest
Write a manifest.json mapping Figma IDs to exported file paths:

```json
{
  "version": "1.0",
  "generated": "2024-01-01T00:00:00Z",
  "fileKey": "<FILE_KEY>",
  "assets": {
    "icons": {
      "1:234": {
        "name": "chevron-right",
        "path": "./icons/chevron-right.svg",
        "type": "VECTOR",
        "dimensions": { "width": 24, "height": 24 }
      }
    },
    "images": {
      "1:567": {
        "name": "hero-background",
        "paths": {
          "1x": "./images/hero-background.png",
          "2x": "./images/hero-background@2x.png"
        },
        "type": "FRAME",
        "dimensions": { "width": 1920, "height": 1080 }
      }
    },
    "fills": {
      "imageRef123": {
        "path": "./fills/imageRef123.png",
        "usedIn": ["1:100", "1:200"]
      }
    }
  }
}
```

## Output Structure

```
<output_dir>/
├── manifest.json       # Asset ID → path mapping
├── icons/              # Vector icons as SVG
│   ├── arrow-left.svg
│   ├── arrow-right.svg
│   ├── chevron-down.svg
│   ├── close.svg
│   └── menu.svg
├── images/             # Larger graphics as PNG
│   ├── hero.png
│   ├── hero@2x.png
│   ├── logo.png
│   └── logo@2x.png
└── fills/              # Image fills (from sync)
    ├── abc123.png
    └── def456.jpg
```

## Asset Detection Strategies

### Strategy 1: By node type
```
VECTOR, BOOLEAN_OPERATION → SVG icons
FRAME with image fills → PNG images
COMPONENT (small) → SVG icons
COMPONENT (large) → PNG images
```

### Strategy 2: By name pattern
```
*icon*, *Icon*, Icon/* → SVG
*image*, *photo*, *bg* → PNG
*logo* → SVG (vector) or PNG (raster)
```

### Strategy 3: By size
```
≤ 64px → SVG icon
> 64px and ≤ 256px → PNG image
> 256px → PNG with @2x variant
```

### Strategy 4: By export settings
Nodes with `exportSettings` respect those settings.

## Summary Output

```
Asset Extraction Complete
=========================
File: ABC123xyz
Output: ./assets

Discovered:
- 47 vector icons (without export settings)
- 23 icon components
- 12 image fills
- 8 nodes with export settings

Exported:
- 70 SVG icons → ./assets/icons/
- 15 PNG images → ./assets/images/
- 12 image fills → ./assets/fills/

Manifest: ./assets/manifest.json

Usage in HTML:
  <img src="./assets/icons/chevron-right.svg" alt="Right">
  <img src="./assets/images/hero.png" srcset="./assets/images/hero@2x.png 2x">
```

## Integration with Other Commands

After running `/extract-assets`, the HTML generation in `/build-docs` and `/extract-components` can reference the exported assets:

```html
<!-- Icon reference -->
<svg class="icon">
  <use href="./assets/icons/chevron-right.svg#icon"></use>
</svg>

<!-- Or as img -->
<img src="./assets/icons/close.svg" alt="Close" width="24" height="24">

<!-- Image with srcset -->
<img
  src="./assets/images/hero.png"
  srcset="./assets/images/hero@2x.png 2x"
  alt="Hero background"
>
```

## Troubleshooting

### "No assets found"
- Check that the Figma file has vector nodes or image fills
- Try searching by name: `/figma-search *icon*`

### "SVG export failed"
- Some complex vectors can't be exported as SVG
- Fall back to PNG: `formats: ["png"]`

### "Missing icons in export"
- Icons nested inside components need parent component ID
- Try exporting the parent COMPONENT node instead of child VECTOR

### "Duplicate filenames"
- Use `naming: "id"` instead of `naming: "name"` to avoid conflicts
- Or use `naming: "path"` for full path-based names
