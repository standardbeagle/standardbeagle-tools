---
name: figma-query-extract-assets
description: "\"Comprehensive asset extraction from Figma - finds ALL images, icons, and vectors including those without export settings. 全量提取 Figma 資產：含無導出設置的圖標與矢量。 Use when: exporting figma icons, extracting all images from figma, finding vector nodes without export settings, building asset manifest, exporting SVG icons\""
disable-model-invocation: true
arguments: " - name: file_key description: \"Figma file key\" required: true - name: output_dir description: \"Output directory (default: ./assets)\" required: false"
---

# Extract All Assets from Figma

全量資產提取，補取默認導出所遺漏的圖像與圖標。

## The Problem

Figma 以多種方式存儲資產：
1. **Image fills** - 用作填充的圖像（背景、照片）
2. **Image strokes** - 用作描邊圖案的圖像
3. **Background images** - 框架/畫布背景
4. **Vector icons** - 須渲染（非下載）的 VECTOR/BOOLEAN 節點
5. **Icon components** - 含矢量的框架，通常無導出設置

默認 `sync_file` 僅導出：
- 通過 Figma `GetImageFills` API 的圖像填充
- 含顯式 `ExportSettings` 的節點

**無 ExportSettings 的矢量圖標默認不導出！**

## Asset Types in Figma

Figma 以多種方式存儲可導出資產。完整審計須覆蓋以下八類：

| # | 類型 / Type | 位置 / Location | 檢測 / Detection |
|---|---|---|---|
| 1 | Image Fills | `node.fills[].imageRef` | 查 FRAME/RECTANGLE/ELLIPSE，投影 `@images` |
| 2 | Background Images | `node.background[].imageRef` | 同上；背景含於 `@images` |
| 3 | Image Strokes | `node.strokes[].imageRef` | `@images` 投影含描邊圖 |
| 4 | GIF Images | `node.fills[].gifRef` | `@images` 已含 |
| 5 | Vector Icons | 節點自身即圖像數據（無 imageRef） | 查 `VECTOR/STAR/LINE/ELLIPSE/REGULAR_POLYGON/BOOLEAN_OPERATION`，須渲染導出 |
| 6 | Component Icons | 含矢量子節點之 FRAME/COMPONENT/INSTANCE | 按名 `*icon*` 或按尺寸 `≤64px` 搜索 |
| 7 | Export-Settings Nodes | `node.exportSettings[]` | `sync_file` 自動處理；亦可查 `exportSettings: {$exists: true}` |
| 8 | Text with Image Fills | `node.style.fills[].imageRef`（TEXT 節點） | 查 `TEXT`，投影 `@images` |

**要點：** 第 5 類（裸矢量）與第 8 類（文本圖像填充）最易漏——`sync_file` 僅取 imageRef 資源與顯式 exportSettings，須顯式查詢並渲染導出。

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

生成 manifest.json 映射 Figma ID 至導出文件路徑：

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
含 `exportSettings` 的節點遵循其設置。

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

執行 `/extract-assets` 後，`/build-docs` 與 `/extract-components` 中的 HTML 生成可引用已導出資產：

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
- 核查 Figma 文件含矢量節點或圖像填充
- 按名稱搜索：`/figma-search *icon*`

### "SVG export failed"
- 部分複雜矢量無法導出為 SVG
- 回退 PNG：`formats: ["png"]`

### "Missing icons in export"
- 嵌套於組件內的圖標需父組件 ID
- 改導出父 COMPONENT 節點而非子 VECTOR

### "Duplicate filenames"
- 用 `naming: "id"` 替代 `naming: "name"` 避免衝突
- 或用 `naming: "path"` 取完整路徑命名
