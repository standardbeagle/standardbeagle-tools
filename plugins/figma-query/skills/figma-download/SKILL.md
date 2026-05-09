---
name: figma-query-figma-download
description: "Download images by imageRef ID or render Figma nodes as images. 按 imageRef ID 下載圖像，或將 Figma 節點渲染為圖像。 Use when: downloading image fills, rendering frames as PNG, creating documentation screenshots, exporting artboards, getting image fills for backgrounds"
disable-model-invocation: true
---

# Figma Download Image Tool

`download_image` 工具從 Figma 下載圖像：按 imageRef ID 下載填充圖像，或將節點渲染為圖像。

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
下載用作 Figma 節點填充或背景的圖像。

圖像引用存在於：
- 節點填充（image 類型）
- 背景圖像
- 圖案填充

### Mode 2: Node Renders
將 Figma 節點本身渲染為圖像。適用於：
- 導出複雜合成
- 截取框架/畫板
- 生成文檔截圖

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

通過查詢發現圖像引用：

```yaml
# Query for nodes with images
tool: query
parameters:
  file_key: "ABC123xyz"
  q:
    from: ["FRAME", "RECTANGLE"]
    select: ["@images"]
```

響應包含：
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
1. 用 `query` 加 `@images` 投影查找所有圖像填充
2. 收集結果中的 `image_refs`
3. 批量 `download_image` 下載

### Creating Documentation Screenshots
1. 從 `get_tree` 獲取框架 ID
2. 用 `download_image` 的 `node_ids` 渲染框架
3. 文檔使用 PNG 格式

### Exporting Marketing Materials
1. 用 `search` 模式查找畫板
2. 渲染為高質量 PNG 或 PDF
3. 用於演示或網頁
