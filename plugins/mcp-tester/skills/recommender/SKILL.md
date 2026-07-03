---
name: mcp-tester-recommender
description: "Routes any MCP-testing / mcp-tester intent to the one right manual skill — the single auto-invoked gateway; all other mcp-tester skills are manual. mcp-tester 唯一自動網關，導向正確之手動技藝。 Use when: test or debug an MCP server, add server to debug proxy, view MCP JSON-RPC logs, inspect protocol traffic, hot-swap a server binary, send raw JSON-RPC, check server status, validate MCP implementation or tool schema, set up mcp-tester, unsure which mcp-tester skill."
---

# mcp-tester Skill Recommender

此為 mcp-tester 諸技藝之唯一**自動**網關。餘 10 技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝不執行 MCP 調用，只路由。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「宜用 `mcp-tester:<skill>`」並以 `Skill` 工具調之（或提示 `/<skill>`）。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. 意圖含混（如「熱換」「驗證」「看日誌」有近義兩者）→ 見 Disambiguation。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 初設 mcp-tester / 安裝 mcp-debug 伺服器 | `mcp-tester:setup-mcp` |
| 動態添 MCP 伺服器入除錯代理 | `mcp-tester:add-server` |
| 查連接伺服器狀態 / 除錯會話統計 | `mcp-tester:server-status` |
| 覽近期 JSON-RPC 訊息 / tail 協議日誌 | `mcp-tester:debug-logs`（見 Disambiguation） |
| 分析協議流量、診斷請求/回應異常 | `mcp-tester:debug-mcp-traffic`（見 Disambiguation） |
| 熱換伺服器二進位（單次命令） | `mcp-tester:hot-swap`（見 Disambiguation） |
| 迭代開發之熱換工作流（不斷客端） | `mcp-tester:hot-swap-development`（見 Disambiguation） |
| 發原始 JSON-RPC 訊息以底層除錯 | `mcp-tester:send-raw` |
| 驗伺服器連線/工具發現/功能行為 | `mcp-tester:validate-mcp-server`（見 Disambiguation） |
| 驗工具 JSON 綱要 / 測輸入合規 | `mcp-tester:validate-schema`（見 Disambiguation） |

## Disambiguation

- **日誌 vs 流量**：僅欲覽/篩原始 JSON-RPC 訊息 → `mcp-tester:debug-logs`；欲**分析**模式、診斷失敗調用之根因 → `mcp-tester:debug-mcp-traffic`。
- **熱換單次 vs 工作流**：一次替換某伺服器二進位 → `mcp-tester:hot-swap`；迭代開發之完整熱換流程（避免重連開銷、保會話狀態）→ `mcp-tester:hot-swap-development`。
- **驗證伺服器 vs 綱要**：驗整體實現（連線+工具發現+功能行為）→ `mcp-tester:validate-mcp-server`；僅驗某工具 JSON 綱要或測輸入合規 → `mcp-tester:validate-schema`。

## Related

- `mcp-tester:setup-mcp` — 任何測試前之環境安裝，宜先行。
- `mcp-tester:server-status` — 除錯前確認伺服器已連接。
