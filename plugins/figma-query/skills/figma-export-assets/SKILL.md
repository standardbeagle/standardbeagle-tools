---
name: figma-query-figma-export-assets
description: "Export images and icons from specific Figma nodes in multiple formats and scales. 從指定 Figma 節點導出圖像與圖標，支持多格式與多倍率。 Use when: exporting icons as SVG, exporting UI elements at multiple scales, batch exporting assets, rendering nodes as images, exporting for web and print"
disable-model-invocation: true
---

# Figma Export Assets Tool

`export_assets` 工具以多種格式與倍率從 Figma 節點導出圖像、圖標及視覺資產。

## Tool Parameters

```yaml
tool: export_assets
parameters:
  file_key: "your-figma-file-key"   # required
  node_ids: ["1:234", "5:678"]       # required - node IDs to export
  output_dir: "./assets"             # required - destination folder
  formats: ["svg", "png"]            # optional - png, svg, pdf, jpg
  scales: [1, 2, 3]                  # optional - scale multipliers
  naming: "name"                     # optional - id|name|path
```

## Supported Formats

| Format | Best For | Notes |
|--------|----------|-------|
| `svg` | Icons, logos, vector graphics | Scalable, smallest file size for vectors |
| `png` | UI elements, images with transparency | Default format, good quality/size balance |
| `jpg` | Photos, complex images | Smaller file size, no transparency |
| `pdf` | Print, high-fidelity export | Vector format for print workflows |

## Scale Multipliers

- `1` - 1x (base resolution)
- `2` - 2x (Retina/HiDPI)
- `3` - 3x (mobile high-density)
- `4` - 4x (extra high density)

## Naming Conventions

| Option | Example Output | Use Case |
|--------|---------------|----------|
| `id` | `1-234.svg` | Unique, predictable |
| `name` | `icon-search.svg` | Human-readable |
| `path` | `icons-navigation-search.svg` | Hierarchical context |

## Usage Examples

### Export Icons as SVG
```yaml
mcp_name: figma-query
tool_name: export_assets
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:100", "1:101", "1:102"]
  output_dir: "./icons"
  formats: ["svg"]
  naming: "name"
```

### Export UI Elements at Multiple Scales
```yaml
mcp_name: figma-query
tool_name: export_assets
parameters:
  file_key: "ABC123xyz"
  node_ids: ["5:500"]
  output_dir: "./images"
  formats: ["png"]
  scales: [1, 2, 3]
  naming: "name"
```

### Export for Both Web and Print
```yaml
mcp_name: figma-query
tool_name: export_assets
parameters:
  file_key: "ABC123xyz"
  node_ids: ["3:300"]
  output_dir: "./assets"
  formats: ["svg", "png", "pdf"]
  scales: [1, 2]
```

## Response

```json
{
  "exported": [
    {
      "node_id": "1:100",
      "name": "icon-search",
      "files": [
        "./icons/icon-search.svg",
        "./icons/icon-search@2x.png"
      ]
    }
  ],
  "failed": [],
  "manifest": {
    "total": 3,
    "formats": ["svg", "png"],
    "output_dir": "./icons"
  }
}
```

## Finding Node IDs

以下工具可獲取節點 ID：
1. `get_tree` - 返回帶 ID 的樹結構
2. `search` - 按名稱/模式查找節點
3. `wireframe` - 帶 ID 圖例的可視化
4. `list_components` - 所有組件 ID

## Best Practices

### Icon Export Workflow
1. 用 `search` 查找所有圖標：`pattern: "icon-*"`
2. 以 SVG 導出保持可縮放性
3. 用 `name` 命名提升可讀性

### UI Asset Export Workflow
1. 用 `list_components` 獲取組件 ID
2. 以 1x、2x、3x 倍率導出 PNG
3. 用 `path` 命名保留層級上下文

### Batch Export Strategy
- 每批 50-100 節點，避免觸及速率限制
- 大量導出前先 `sync_file`
- 檢查響應中的 `failed` 數組並重試
