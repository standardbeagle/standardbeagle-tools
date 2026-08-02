---
name: slop-mcp-recommender
description: "Routes any slop-mcp / MCP intent to the one right manual slop skill — the single auto-invoked gateway; all other slop skills are manual. slop-mcp 唯一自動網關，導向正確之手動技藝。 Use when: mention MCP or slop, unsure which slop skill, want a registered MCP capability, register/discover/execute/customize/monitor an MCP server, import configs, MCP memory or scripting, before shelling out to an MCP binary."
---

# slop-mcp Skill Recommender

此為 slop-mcp 諸技藝之唯一**自動**網關。餘 21 技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，避免每技藝描述皆耗 per-turn context。

> 職責：**判意圖 → 薦技藝 → 令用戶或自身讀其 SKILL.md 而載之（見 Loading）**。本技藝不執行 MCP 調用，只路由。

## Loading a routed skill (載法)

諸目標技藝設 `disable-model-invocation: true` — 故**不可**以 `Skill` 工具喚之（喚則報
`cannot be used with Skill tool due to disable-model-invocation`）。技藝之身即 markdown，
**讀其檔**即載其令，效同而不佔常駐 context。

擇定一技藝後：

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/<skill>/SKILL.md`
2. `CLAUDE_PLUGIN_ROOT` 未解或解至他 plugin（Windows 有此患）→ 改 glob
   `~/.claude/plugins/cache/*/slop-mcp/*/skills/<skill>/SKILL.md`，取版本最高者
3. 依其身之令而行

用戶欲親調者，仍提示 `/slop-mcp:<skill>`（手動喚不受此限）。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「此屬 X，宜用 `slop-mcp:<skill>` 技藝」並讀其 SKILL.md 而載之（見 Loading）（或提示 `/<skill>`）。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. 若意圖為「有問題，未知有無工具可解」→ 徑導 `slop-mcp:slop-find-tools`。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 有待解問題，欲覓可用之已注冊 MCP 工具 | `slop-mcp:slop-find-tools` |
| 調用前必先驗 schema，禁繞道直呼二進製 | `slop-mcp:discovery-first` |
| 關鍵字搜工具（已知欲搜） | `slop-mcp:slop-search` |
| 執行某已知工具 | `slop-mcp:slop-exec` |
| 列已注冊服務器與連接狀態 | `slop-mcp:slop-list` |
| 查 slop-mcp 狀態 / 快速入門 | `slop-mcp:slop-init` |
| 注冊新 MCP 服務器 | `slop-mcp:slop-add` |
| KDL 配置 / scope / auth / 元數據參考 | `slop-mcp:slop-config` |
| 由 Claude Desktop/VS Code/Cursor 導入配置 | `slop-mcp:slop-migrate`（詳解 `slop-mcp:migration-guide`） |
| 壓縮冗長工具描述 / 定義複合自定義工具 | `slop-mcp:slop-customize`（背景 `slop-mcp:tool-customization`） |
| 導出定制包供分享 | `slop-mcp:slop-pack-export` |
| 導入他人定制包 | `slop-mcp:slop-pack-import` |
| 為某服務器生成工具參考技藝文件 | `slop-mcp:slop-skills` |
| SLOP 腳本 / run_slop / 多工具編排 | `slop-mcp:scripting` |
| 跨會話持久或會話內存 | `slop-mcp:memory-system` |
| 讀寫 project-config 記憶庫 | `slop-mcp:project-config` |
| 事件流化為通知（git/build/CI/watcher） | `slop-mcp:event-monitoring`（搭建 `slop-mcp:slop-monitor`） |
| Dart 任務工作流 | `slop-mcp:dart-task-workflow`（工具參考 `slop-mcp:dart-tools`） |

## Disambiguation

- **find-tools vs slop-search**：未知該用哪工具、由問題出發 → `find-tools`（含發現+驗+執行全程）。已知關鍵字、只欲列候選 → `slop-search`。
- **slop-exec vs discovery-first**：欲執行且已驗 schema → `slop-exec`。任何未驗調用之前置守則 → `discovery-first`（恆為執行前提）。
- **slop-migrate vs migration-guide**：實際導入用 `slop-migrate`；多客戶端遷移之背景讀 `migration-guide`。

## Related

- `slop-mcp:slop-find-tools` — 問題導向之工具發現+執行工作流。
- `slop-mcp:discovery-first` — 任何 MCP 執行前之強制發現守則。
- `mcp-orchestrator` 代理 — 注冊/發現/執行/排障之完整協調者。
