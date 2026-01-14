---
name: figma-download
description: Download images by imageRef ID or render Figma nodes as images
---

# Figma Download Image Tool

The `download_image` tool downloads images from Figma, either by imageRef ID (for fills/backgrounds) or by rendering nodes as images.

## Tool Parameters

```yaml
tool: download_image
parameters:
  file_key: "your-figma-file-key"  # required
  image_refs: ["0:1", "0:2"]       # optional - download by imageRef
  node_ids: ["1:234", "5:678"]     # optional - render nodes as images
  output_dir: "./images"           # required - destination folder
  format: "png"                    # optional - png|jpg|svg|pdf
```

## Two Download Modes

### Mode 1: Image Refs (Fills/Backgrounds)
Download images that are used as fills or backgrounds in Figma nodes.

Image refs are found in:
- Node fills (image type)
- Background images
- Pattern fills

### Mode 2: Node Renders
Render Figma nodes themselves as images. Useful for:
- Exporting complex compositions
- Capturing frames/artboards
- Creating documentation screenshots

## Usage Examples

### Download Image Fills
```yaml
mcp_name: figma-query
tool_name: download_image
parameters:
  file_key: "ABC123xyz"
  image_refs: ["0:abc123", "0:def456"]
  output_dir: "./images/fills"
```

### Render Nodes as PNG
```yaml
mcp_name: figma-query
tool_name: download_image
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:100", "1:200"]
  output_dir: "./images/renders"
  format: "png"
```

### Render as SVG for Vectors
```yaml
mcp_name: figma-query
tool_name: download_image
parameters:
  file_key: "ABC123xyz"
  node_ids: ["1:300"]
  output_dir: "./images"
  format: "svg"
```

## Response

```json
{
  "downloaded": [
    {
      "ref_or_id": "0:abc123",
      "file": "./images/fills/0-abc123.png",
      "size": 45678
    },
    {
      "ref_or_id": "1:100",
      "file": "./images/renders/1-100.png",
      "size": 123456
    }
  ],
  "manifest": {
    "total": 2,
    "format": "png",
    "output_dir": "./images"
  },
  "errors": []
}
```

## Finding Image Refs

Image refs are discovered through queries:

```yaml
# Query for nodes with images
tool: query
parameters:
  file_key: "ABC123xyz"
  q:
    from: ["FRAME", "RECTANGLE"]
    select: ["@images"]
```

Response includes:
```json
{
  "results": [
    {
      "id": "1:100",
      "imageRefs": ["0:abc123", "0:def456"]
    }
  ]
}
```

## Comparison: download_image vs export_assets

| Feature | download_image | export_assets |
|---------|----------------|---------------|
| Purpose | Get existing images | Render nodes as images |
| Image fills | Yes (via image_refs) | No |
| Multiple formats | Yes | Yes |
| Multiple scales | No | Yes (1x, 2x, 3x) |
| Naming options | ID only | id, name, path |
| Batch export | Yes | Yes |

## Use Cases

### Extracting Brand Assets
1. Use `query` with `@images` projection to find all image fills
2. Collect image_refs from results
3. Download all with `download_image`

### Creating Documentation Screenshots
1. Identify frame IDs from `get_tree`
2. Render frames with `download_image` using node_ids
3. Use PNG format for documentation

### Exporting Marketing Materials
1. Find artboards with `search` pattern
2. Render as high-quality PNG or PDF
3. Use for presentations or web
