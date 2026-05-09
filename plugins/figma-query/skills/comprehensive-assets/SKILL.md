---
name: figma-query-comprehensive-assets
description: "Extract ALL assets from Figma including vectors, fills, backgrounds, and icons that don't have export settings. 全量提取 Figma 資產：向量、填充、背景、無導出設置圖標。 Use when: exporting all icons and images, finding assets without export settings, extracting vector icons, building complete asset manifest, comprehensive asset audit"
disable-model-invocation: true
---

# Comprehensive Asset Extraction

Figma 以多種方式存儲圖像與可導出資產。此技能說明如何找到並導出所有資產。

## Asset Types in Figma

### 1. Image Fills (`Paint.ImageRef`)
用作形狀、框架或矩形填充的圖像。

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
用作框架/畫布背景的圖像。

**Location:** `node.background[].imageRef`

**Detection:** 與上同，背景包含於 `@images` 投影中。

### 3. Image Strokes (`Paint.ImageRef` on strokes)
用作描邊圖案的圖像。

**Location:** `node.strokes[].imageRef`

**Detection:** `@images` 投影包含描邊圖像。

### 4. GIF Images (`Paint.GifRef`)
填充中的動態 GIF。

**Location:** `node.fills[].gifRef`

**Detection:** `@images` 投影已包含。

### 5. Vector Icons (NO ImageRef - need rendering)
**注意！** 向量形狀（VECTOR、STAR、ELLIPSE、LINE 等）無 `ImageRef`——其本身即圖像數據，須渲染導出。

**Location:** 類型為 `VECTOR`、`STAR`、`LINE`、`ELLIPSE`、`REGULAR_POLYGON`、`BOOLEAN_OPERATION` 的節點

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
圖標常為含向量子節點的 FRAME 節點，而非裸向量。

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

按尺寸檢測（圖標通常較小）：
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
已在 Figma 中顯式標記為導出的節點。

**Location:** `node.exportSettings[]`

**Detection:** `sync_file` 已自動處理，亦可查詢：
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
文本可含圖像填充以實現特效。

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

導出：
- 所有圖像填充/描邊/背景（via `GetImageFills` API）
- 含顯式 ExportSettings 的節點

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

提取後建立 Figma ID 到文件路徑的映射：

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
**原因：** 無 ExportSettings 的向量節點不自動導出。
**修復：** 查詢 VECTOR/BOOLEAN_OPERATION 節點並顯式導出。

### Missing backgrounds
**原因：** 框架背景在 `node.background[]`，非 `node.fills[]`。
**修復：** `sync_file` 已處理；`@images` 查詢可驗證。

### Broken image references in HTML
**原因：** HTML 引用了 Figma imageRef ID，非文件路徑。
**修復：** 用 manifest 映射 ID 到路徑，或在導出時使用 `naming: "name"`。

### Duplicate exports
**原因：** 同一 imageRef 用於多個節點。
**修復：** `sync_file` 已按 imageRef 去重。

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
