---
name: figma-export-assets
description: Export images and icons from specific Figma nodes in multiple formats and scales
---

# Figma Export Assets Tool

The `export_assets` tool exports images, icons, and visual assets from specific Figma nodes in various formats and scales.

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

Get node IDs using these tools:
1. `get_tree` - Returns tree structure with IDs
2. `search` - Find nodes by name/pattern
3. `wireframe` - Visual with ID legend
4. `list_components` - All component IDs

## Best Practices

### Icon Export Workflow
1. Use `search` to find all icons: `pattern: "icon-*"`
2. Export as SVG for scalability
3. Use `name` naming for readability

### UI Asset Export Workflow
1. Use `list_components` to find component IDs
2. Export PNG at 1x, 2x, 3x scales
3. Use `path` naming to preserve hierarchy

### Batch Export Strategy
- Export in batches of 50-100 nodes to avoid rate limits
- Use `sync_file` first for large exports
- Check `failed` array in response for retry
