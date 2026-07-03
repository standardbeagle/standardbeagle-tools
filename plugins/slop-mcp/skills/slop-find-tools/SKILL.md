---
name: slop-mcp-find-tools
description: "Problem-first discovery: given a goal, find a registered slop-mcp tool that solves it, verify its schema, then run it. 由問題出發，覓已注冊 MCP 工具解之，驗 schema 而後執行。 Use when: is there a tool for X, find a tool to do X, solve a task via a registered MCP server, unsure which MCP capability exists, capability discovery before building custom."
disable-model-invocation: true
---

# Find a Registered Tool to Solve a Problem

由待解問題出發，於 slop-mcp 已注冊之諸服務器中覓可用工具，驗其 schema，而後執行。**先發現，後執行** — 恒遵 `slop-mcp:discovery-first` 守則。

> 用於：「有沒有能做 X 的工具？」在自建腳本或手工 shell 前，先問已注冊工具能否直解。

## Flow

### (1) 由問題抽關鍵字 → 跨服務器搜

```
mcp__plugin_slop-mcp_slop-mcp__search_tools
  query: "<問題之關鍵字，如 pdf extract text>"
  limit: 20
```

無命中 → 換近義詞重搜（如 parse/read/convert）。仍無 → 或需注冊新服務器（`slop-mcp:slop-add`），或改自定義工具（`slop-mcp:slop-customize`）。

### (2) 候選過多 → 列服務器縮範圍

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

擇對口服務器後，以 `mcp_name` 過濾重搜：

```
mcp__plugin_slop-mcp_slop-mcp__search_tools
  query: "<keywords>"
  mcp_name: "<server>"
```

### (3) 選定工具 → 驗 schema（不可省）

```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "<server>"
  tool_name: "<tool>"
  verbose: true
```

讀返回之 input schema：確切鍵名、類型、必填項。上游 schema 或已變，憑記憶必誤。

### (4) 執行

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "<server>"
  tool_name: "<tool>"
  parameters: { ... }   # keys 精確匹配 (3) 之 schema
```

> 參數欄為 `parameters`，非 `arguments`/`args`/`input`。

## When No Tool Fits

窮搜無果，依序考量：

1. **注冊新服務器** — 已知有現成 MCP 包可解 → `slop-mcp:slop-add`。
2. **自定義複合工具** — 需鏈多工具或封裝 SLOP 腳本 → `slop-mcp:slop-customize` / `slop-mcp:scripting`。
3. **回退常規** — 皆不宜方用 bash/內建工具，並向用戶說明已注冊工具無對口者。

勿默然自建而不告 — 明言「已注冊工具無解，回退 X」。

## Related

- `slop-mcp:discovery-first` — 執行前強制發現之守則（本工作流之根本）。
- `slop-mcp:slop-search` — 純關鍵字搜索（已知欲搜時之輕量版）。
- `slop-mcp:slop-add` — 無對口工具時注冊新服務器。
- `slop-mcp:slop-recommender` — 若意圖非「覓工具」而屬他類 slop 操作。
