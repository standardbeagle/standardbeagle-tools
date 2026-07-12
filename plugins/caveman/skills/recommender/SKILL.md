---
name: caveman-recommender
description: "Routes caveman / context-compression intent to right manual skill — sole auto gateway; others manual. caveman 唯一自動網關。 Use when: compress file/PDF/slides/spreadsheet/audio, condense git diff/log or PR URL, OCR/summarize image/screenshot/diagram, compress error logs/stack traces/notes, fetch+compress URL (YouTube/GitHub/arXiv), multi-source research, caveman-mcp setup, unsure which caveman skill."
---

# caveman Skill Recommender

此為 caveman 諸技藝之唯一**自動**網關。餘 7 技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝不執行壓縮，只路由。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「宜用 `caveman:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. 意圖含混（來源型別近義）→ 見 Disambiguation。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 壓本地文件（PDF/slides/spreadsheet/audio/text） | `caveman:condense-file`（見 Disambiguation） |
| 壓 git diff / log / blame / GitHub PR URL | `caveman:condense-git` |
| 壓圖像 / 截圖 / 圖表 OCR + 描述 | `caveman:condense-image`（見 Disambiguation） |
| 壓錯誤日誌 / 堆棧 / CI 失敗輸出 | `caveman:condense-log` |
| 壓任意原始文本 / 轉錄 / 筆記 | `caveman:condense-text`（見 Disambiguation） |
| 取 URL 並壓（YouTube/arXiv/HN/Reddit/RSS） | `caveman:condense-url`（見 Disambiguation） |
| 多源研究：並行採集、壓縮、含出處合成 | `caveman:research-workflow` |
| 初設 caveman-mcp / 註冊 condense 工具 | `caveman:setup-caveman` |

## Disambiguation

- **file vs text**：有磁碟路徑之文件（PDF/表/音檔）→ `condense-file`；已在手之原始字串/貼文 → `condense-text`。
- **image vs file**：圖像走 `condense-image`（OCR+描述+結構），即便亦為文件。
- **url vs git**：一般網址（含 YouTube/arXiv）→ `condense-url`；GitHub **PR** diff → `condense-git`（PR 專屬路由）。
- **單次壓縮 vs 研究流**：壓單一源 → 對應 condense-*；跨多源採集+壓+含出處合成 → `research-workflow`。

## Related

- `caveman:setup-caveman` — 任何壓縮前之伺服器安裝，宜先行。
- `caveman:research-workflow` — 與 `knowledge-hygiene` 配對行衝突檢測。
