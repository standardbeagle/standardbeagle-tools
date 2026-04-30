---
name: condense-file
description: Compress local files via caveman-mcp with format-specific handlers for PDFs, presentations, spreadsheets, audio, and text. Use instead of Read when the file is too large for the context window or when only the gist matters. 以caveman壓縮本地文件，PDF/簡報/表格/音頻/文本專用處理. Use when: ingest large PDF, summarize slide deck, scan spreadsheet, transcribe audio file, condense long document for research, prep file content for downstream synthesis
---

# condense_file — Local File Compression

壓縮本地文件路徑。對PDF/PPT/XLSX/音頻/文本有專用處理；圖像見`condense-image`技能（同工具，分技能列因用法不同）。

## When to Prefer Over Read

| Use caveman `condense_file` | Use built-in Read |
|----|----|
| PDF（特別是>10頁） | 短文本、代碼文件 |
| 簡報PPT/PPTX | 需精確行號定位 |
| 大型表格XLSX/CSV要點 | 需完整單元格數據 |
| 音頻轉錄 | （Read不能） |
| 將存memory或引用 | 即用即棄、需逐字 |

代碼文件（`.py`, `.js`, `.go`等）一律用Read——caveman為散文設計，會破壞代碼。

## Access Pattern

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "caveman"
  tool_name: "condense_file"
  parameters:
    path: "<absolute-or-relative-path>"
```

直接安裝模式：`mcp__plugin_caveman_caveman__condense_file`

## Format Handlers

| Extension | Handler | Returns |
|----|----|----|
| `.pdf` | PDF text extract + 章節壓縮 | 章節標題+要點 |
| `.pptx`, `.ppt` | 幻燈頁文本提取 | 每頁標題+要點 |
| `.xlsx`, `.xls`, `.csv` | 表格→結構摘要 | 標題行+樣本+統計 |
| `.mp3`, `.wav`, `.m4a`, `.flac` | 語音轉錄 | 含時間戳轉錄壓縮 |
| `.txt`, `.md`, `.rst` | 文本兩階段壓縮 | 文言壓縮 |
| 其他 | 嘗試文本提取 | 同上或失敗 |

圖像（png/jpg/webp）見`condense-image`技能。

## Examples

### Summarize a PDF research paper
```yaml
tool_name: condense_file
parameters:
  path: "/home/beagle/Downloads/transformer-paper.pdf"
```

### Extract slide deck content
```yaml
tool_name: condense_file
parameters:
  path: "./docs/q4-roadmap.pptx"
```

### Scan a spreadsheet
```yaml
tool_name: condense_file
parameters:
  path: "./data/users-export.xlsx"
```

### Transcribe an audio meeting
```yaml
tool_name: condense_file
parameters:
  path: "./recordings/standup-2026-04-30.mp3"
```

## Tips

- **Path forms**: 絕對路徑最穩。相對路徑相對於MCP server cwd（通常項目根）
- **Large PDFs**: caveman處理整文件，不限頁數。若僅需特定頁，先複製子集
- **Spreadsheets**: 返回結構性摘要（標題+樣本行+列統計），非完整數據。需逐行用Read CSV
- **Audio**: 首次調用慢（下載whisper模型）。後續快
- **Failure**: 不存在或不可讀文件報錯——caveman不偽造內容
