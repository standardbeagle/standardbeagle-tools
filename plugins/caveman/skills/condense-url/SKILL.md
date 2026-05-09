---
name: condense-url
description: Fetch and compress any URL via caveman-mcp with smart routing for YouTube, GitHub, arXiv, Hacker News, Reddit, RSS. Replaces WebFetch when token budget matters or when content will be cited later. 以caveman取URL並壓縮，智能路由YouTube/GitHub/arXiv/HN/Reddit/RSS. Use when: research URLs, summarize articles, capture YouTube transcripts, ingest arXiv papers, scan HN/Reddit threads, follow RSS feeds, prep citations for downstream tasks
---

# condense_url — URL Compression

取任意URL之內容，壓縮後返回。對YouTube/GitHub/arXiv/HN/Reddit/RSS有專用提取器。

## When to Prefer Over WebFetch

| Use caveman `condense_url` | Use built-in WebFetch |
|----|----|
| 內容大、僅需要點 | 短頁面、需逐字 |
| 多URL研究批量 | 單URL一次性查 |
| 將存入memory或引用 | 即用即棄 |
| YouTube/arXiv/PR專用提取 | 渲染JS或需認證 |

注：caveman為公開URL設計。私有/認證URL用對應MCP（GitHub MCP、Gmail MCP等）。

## Access Pattern

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "caveman"
  tool_name: "condense_url"
  parameters:
    url: "<https-url>"
```

直接安裝模式：`mcp__plugin_caveman_caveman__condense_url`

## Smart Routing

caveman自動檢測URL類型並選擇提取器：

| URL Pattern | Extractor | Returns |
|----|----|----|
| `youtube.com/watch?v=...` 或 `youtu.be/...` | YouTube transcript | 含時間戳之轉錄壓縮 |
| `github.com/<o>/<r>` 或 `/blob/...` 或 `/issues/N` | GitHub | README/file/issue壓縮 |
| `arxiv.org/abs/...` 或 `/pdf/...` | arXiv | abstract + 章節摘要 |
| `news.ycombinator.com/item?id=...` | HN | 主貼+top評論 |
| `reddit.com/r/...` | Reddit | 主貼+top評論 |
| `*.rss`, `*.xml`, `/feed` | RSS | 條目列表壓縮 |
| 其他 | 通用HTML→Markdown | 文本壓縮 |

無需指定類型——傳URL即可。

## Examples

### Research a YouTube talk
```yaml
tool_name: condense_url
parameters:
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

### Summarize an arXiv paper
```yaml
tool_name: condense_url
parameters:
  url: "https://arxiv.org/abs/2604.01007"
```

### Scan an HN discussion
```yaml
tool_name: condense_url
parameters:
  url: "https://news.ycombinator.com/item?id=42424242"
```

### Pull a GitHub README
```yaml
tool_name: condense_url
parameters:
  url: "https://github.com/standardbeagle/caveman-mcp"
```

## Tips

- 多URL：並行調用單訊息含多`execute_tool`，省回合
- 引用：返回壓縮含原URL，貼入memory或PR描述直接可追溯
- 失敗：404/超時報錯——caveman不偽造數據。報用戶並嘗試備用源
- 私有repo：用GitHub MCP；caveman看公開HTML
