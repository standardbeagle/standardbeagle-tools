---
name: caveman-condense-image
description: "Extract description, OCR text, structural summary from images via caveman-mcp condense_file. For screenshots/diagrams/charts/photos when token budget rules out raw image. 以caveman提取圖像描述/OCR/結構。 Use when: ingest screenshot, summarize diagram, extract chart data, photo OCR, archive image as text, prep image for text-only synthesis"
disable-model-invocation: true
---

# condense_file (Image Mode) — Image Compression

`condense_file`對圖像文件返回：描述、OCR文本、結構元素（圖表軸、表格、UI組件）。

## When to Prefer Over Reading Image Directly

| Use caveman | Read image directly (multimodal) |
|----|----|
| 多圖批量摘要 | 單圖深度分析 |
| 將存memory或引用 | 即看即答 |
| 圖內主要為文字（截圖、文檔） | 圖內為視覺細節（藝術、UX審查） |
| 後續純文本流程消費 | 需逐像素判斷 |

UI設計反饋、像素對比、手繪識別——直接Read，因需視覺判斷。

## Access Pattern

同`condense-file`，傳圖像路徑：

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "caveman"
  tool_name: "condense_file"
  parameters:
    path: "<image-path>"
```

直接：`mcp__plugin_caveman_caveman__condense_file`

## Supported Formats

`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.bmp`

返回含：
- **Description** — 場景/UI/圖表類型
- **OCR text** — 抽取所有可讀文字
- **Structure** — 圖表軸標、表格行列、UI布局

## Examples

### OCR a screenshot
```yaml
tool_name: condense_file
parameters:
  path: "/tmp/error-dialog.png"
```

### Extract chart data
```yaml
tool_name: condense_file
parameters:
  path: "./reports/q4-revenue-chart.png"
```

### Summarize a diagram
```yaml
tool_name: condense_file
parameters:
  path: "./docs/architecture-diagram.svg.png"
```

### Batch process a screenshots folder
並行多調用單訊息：
```yaml
# Three execute_tool calls in one message
- tool_name: condense_file
  parameters: { path: "./screens/01-login.png" }
- tool_name: condense_file
  parameters: { path: "./screens/02-dashboard.png" }
- tool_name: condense_file
  parameters: { path: "./screens/03-settings.png" }
```

## Tips

- **Hand-drawn sketches**: caveman OCR有限，識別文字而非草圖意圖。複雜草圖直接Read
- **Charts without labels**: 無軸標的圖表caveman僅返回類型描述，不可從像素估數
- **Sensitive images**: caveman本地處理，不上傳。安全可用
- **SVG**: 先轉PNG，caveman直接消費SVG有限
