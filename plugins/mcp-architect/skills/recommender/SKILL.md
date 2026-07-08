---
name: mcp-architect-recommender
description: "Routes any MCP-server design/architecture intent to the one right manual mcp-architect skill — the single auto-invoked gateway; all other mcp-architect skills are manual. mcp-architect 唯一自動網關，導向正確之手動技藝。 Use when: design or analyze an MCP server, organize multi-tool MCP, tool schema/error/response design, token-efficient responses, progressive discovery, retrieval modes, citation or conflict response shapes, MCP examples, unsure which mcp-architect skill."
---

# mcp-architect Skill Recommender

此為 mcp-architect 諸技藝之唯一**自動**網關。餘 12 技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝不設計，只路由。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「此屬 X，宜用 `mcp-architect:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. 設計/響應/檢索多有近義，見 Disambiguation。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 設計全新 MCP 服務器（交互引導 + JSON 骨架） | `mcp-architect:design-mcp`（見 Disambiguation） |
| 分析現有 MCP 實現、覓優化與合規 | `mcp-architect:analyze-mcp` |
| 組織/命名/結構化多工具（10+）服務器 | `mcp-architect:mcp-architecture`（見 Disambiguation） |
| 設計單個工具之 I/O 模式、驗證、錯誤處理 | `mcp-architect:tool-design`（見 Disambiguation） |
| info/discovery 工具、分層披露能力 | `mcp-architect:progressive-discovery` |
| 檢索型 MCP 多索引模式（dense/lexical/symbolic/multiview 選入） | `mcp-architect:multiview-retrieval-pattern` |
| 錯誤響應漸進引導、did-you-mean、模糊匹配、模式提示 | `mcp-architect:client-guidance` |
| 人機雙讀響應、自動化標誌、跨工具 token/ID、置信分層 | `mcp-architect:response-optimization`（見 Disambiguation） |
| 壓縮響應、token 預算、每 token 信息最大化 | `mcp-architect:context-compression`（見 Disambiguation） |
| 帶引用之響應形（source-exists/derivable/no-over-extension/no-cite-hallucination） | `mcp-architect:citation-verification-pattern`（見 Disambiguation） |
| 多源合成響應形、結構化呈現矛盾（conflicts[]） | `mcp-architect:conflict-aware-response`（見 Disambiguation） |
| 產品級 MCP 實例（lci 搜碼、agnt 瀏覽器代理、進程管理） | `mcp-architect:mcp-examples` |

## Disambiguation

近義技藝抉擇（依範圍/層級）：

- **設計層級**（由粗至細）：
  - 從零建服務器 → `mcp-architect:design-mcp`
  - 多工具整體架構/分組/命名 → `mcp-architect:mcp-architecture`
  - 單一工具之模式與響應 → `mcp-architect:tool-design`
- **響應之 token**：泛談人機雙讀 + 自動化標誌 + 漸進詳情 → `response-optimization`；專於壓縮/token 預算/縮寫 → `context-compression`。二者互補：先定形（response-optimization），後省字（context-compression）。
- **多源響應形**：帶引用、驗每 claim 可溯源 → `citation-verification-pattern`；跨 2+ 源、須結構化暴露矛盾 → `conflict-aware-response`。研究/合成服務器常二者並用。
- **檢索 vs 發現**：語料多索引之檢索模式選入 → `multiview-retrieval-pattern`；服務器能力之分層探索（info 工具）→ `progressive-discovery`。

## Related

- `mcp-architect:design-mcp` — 新服務器之端到端設計入口。
- `mcp-architect:mcp-examples` — 諸模式之真實產品級參照。
- `mcp-tester` 插件 — 設計既定後，測試運行中之伺服器（連線、綱要、流量、熱換）。
