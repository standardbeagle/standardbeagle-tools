---
name: comprehensive-assets
description: Extract ALL assets from Figma including vectors, fills, backgrounds, and icons that don't have export settings
---

# Comprehensive Asset Extraction

Figma stores images and exportable assets in multiple ways. This skill documents how to find and export ALL of them.

## Asset Types in Figma

### 1. Image Fills (`Paint.ImageRef`)
Images used as fills on shapes, frames, or rectangles.

**Location:** `node.fills[].imageRef`

**Detection:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["FRAME", "RECTANGLE", "ELLIPSE"]
      where:
        fills:
          $exists: true
      select: ["@structure", "@images"]
      depth: -1
```

**Export:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: download_image
  parameters:
    file_key: "<FILE_KEY>"
    image_refs: ["<COLLECTED_IMAGE_REFS>"]
    output_dir: "./assets/fills"
```

### 2. Background Images (`node.background[]`)
Images used as frame/canvas backgrounds.

**Location:** `node.background[].imageRef`

**Detection:** Same query as above, backgrounds are included in `@images` projection.

### 3. Image Strokes (`Paint.ImageRef` on strokes)
Images used as stroke patterns.

**Location:** `node.strokes[].imageRef`

**Detection:** Query with `@images` includes stroke images.

### 4. GIF Images (`Paint.GifRef`)
Animated GIFs in fills.

**Location:** `node.fills[].gifRef`

**Detection:** Included in `@images` projection.

### 5. Vector Icons (NO ImageRef - need rendering)
**This is the tricky one!** Vector shapes (VECTOR, STAR, ELLIPSE, LINE, etc.) don't have `ImageRef` - they ARE the image data and must be rendered.

**Location:** Nodes with type `VECTOR`, `STAR`, `LINE`, `ELLIPSE`, `REGULAR_POLYGON`, `BOOLEAN_OPERATION`

**Detection:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["VECTOR", "STAR", "LINE", "ELLIPSE", "REGULAR_POLYGON", "BOOLEAN_OPERATION"]
      select: ["@structure", "@bounds"]
      depth: -1
```

**Export as SVG:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_assets
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<VECTOR_NODE_IDS>"]
    output_dir: "./assets/icons"
    formats: ["svg"]
    naming: "name"
```

### 6. Component Icons (Frames containing vectors)
Icons are often FRAME nodes containing vector children, not raw vectors.

**Detection:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: search
  parameters:
    file_key: "<FILE_KEY>"
    pattern: "*icon*"
    node_types: ["FRAME", "COMPONENT", "INSTANCE"]
```

Or by size (icons are typically small):
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["FRAME", "COMPONENT"]
      where:
        width:
          $lte: 64
        height:
          $lte: 64
      select: ["@structure", "@bounds"]
```

### 7. Nodes with Export Settings
Nodes explicitly marked for export in Figma.

**Location:** `node.exportSettings[]`

**Detection:** Already handled by sync_file, but can query:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["COMPONENT", "FRAME", "VECTOR"]
      where:
        exportSettings:
          $exists: true
      select: ["@structure"]
```

### 8. Text with Image Fills
Text can have image fills for effects.

**Location:** `node.style.fills[].imageRef` (on TEXT nodes)

**Detection:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["TEXT"]
      select: ["@structure", "@images", "@typography"]
      depth: -1
```

## Complete Asset Extraction Workflow

### Step 1: Sync file with assets enabled (default)
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: sync_file
  parameters:
    file_key: "<FILE_KEY>"
    output_dir: "./figma-export"
    # assets is included by default in: ["pages", "components", "styles", "variables", "assets"]
```

This exports:
- All image fills/strokes/backgrounds via `GetImageFills` API
- Nodes with explicit ExportSettings

### Step 2: Find vector icons that weren't exported
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["VECTOR", "BOOLEAN_OPERATION"]
      where:
        exportSettings:
          $not:
            $exists: true
      select: ["@structure", "@bounds"]
```

### Step 3: Find icon-like frames (small frames, often components)
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: query
  parameters:
    file_key: "<FILE_KEY>"
    q:
      from: ["COMPONENT", "FRAME"]
      where:
        name:
          $match: "*icon*"
      select: ["@structure", "@bounds"]
```

### Step 4: Export discovered vectors as SVG
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_assets
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<ALL_ICON_NODE_IDS>"]
    output_dir: "./assets/icons"
    formats: ["svg"]
    naming: "name"
```

### Step 5: Export larger graphics as PNG
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: export_assets
  parameters:
    file_key: "<FILE_KEY>"
    node_ids: ["<IMAGE_NODE_IDS>"]
    output_dir: "./assets/images"
    formats: ["png"]
    scales: [1, 2]
    naming: "name"
```

## Asset Manifest

After extraction, create a manifest mapping Figma IDs to file paths:

```json
{
  "fills": {
    "imageRef123": "./assets/fills/imageRef123.png"
  },
  "icons": {
    "1:234": "./assets/icons/chevron-right.svg",
    "1:235": "./assets/icons/close.svg"
  },
  "images": {
    "1:456": "./assets/images/hero-background.png",
    "1:456@2x": "./assets/images/hero-background@2x.png"
  }
}
```

## Common Issues

### Icons not exporting
**Cause:** Vector nodes without ExportSettings aren't automatically included.
**Fix:** Query for VECTOR/BOOLEAN_OPERATION nodes and export explicitly.

### Missing backgrounds
**Cause:** Frame backgrounds use `node.background[]` not `node.fills[]`.
**Fix:** sync_file handles this, but verify with `@images` query.

### Broken image references in HTML
**Cause:** HTML references Figma imageRef IDs, not file paths.
**Fix:** Use the manifest to map IDs to paths, or use naming: "name" in export.

### Duplicate exports
**Cause:** Same imageRef used in multiple nodes.
**Fix:** sync_file already deduplicates by imageRef.

## Output Structure

```
assets/
├── fills/              # Image fills from GetImageFills API
│   ├── abc123.png      # Named by imageRef
│   └── def456.jpg
├── icons/              # Vector renders
│   ├── chevron-right.svg
│   ├── close.svg
│   └── menu.svg
├── images/             # Large image renders
│   ├── hero.png
│   ├── hero@2x.png
│   └── logo.png
└── manifest.json       # ID → path mapping
```
