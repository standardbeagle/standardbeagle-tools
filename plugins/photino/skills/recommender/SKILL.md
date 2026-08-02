---
name: photino-recommender
description: "Routes any Photino.NET / photino intent to the one right manual skill — the single auto-invoked gateway; all other photino skills are manual. photino 唯一自動網關，導向正確之手動技藝。 Use when: mention Photino or Photino.NET, scaffold or set up a desktop app, build/run/test/publish a Photino project, embed frontend or PowerShell, message routing, architecture questions, unsure which photino skill."
---

# photino Skill Recommender

此為 photino 諸技藝之唯一**自動**網關。餘皆手動 — 本技藝據意圖導向其一，並化解動作技藝與參考技藝之重疊。

> 職責：**判意圖 → 薦技藝 → 讀其 SKILL.md 而載之（見 Loading）**。動作/參考成對者眾，故 Disambiguation 節尤要。本技藝只路由，不執行。

## Loading a routed skill (載法)

諸目標技藝設 `disable-model-invocation: true` — 故**不可**以 `Skill` 工具喚之（喚則報
`cannot be used with Skill tool due to disable-model-invocation`）。技藝之身即 markdown，
**讀其檔**即載其令，效同而不佔常駐 context。

擇定一技藝後：

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/<skill>/SKILL.md`
2. `CLAUDE_PLUGIN_ROOT` 未解或解至他 plugin（Windows 有此患）→ 改 glob
   `~/.claude/plugins/cache/*/photino/*/skills/<skill>/SKILL.md`，取版本最高者
3. 依其身之令而行

用戶欲親調者，仍提示 `/photino:<skill>`（手動喚不受此限）。

## Flow

1. 辨意圖，對下表擇最近一行。
2. 告知：「宜用 `photino:<skill>`」並讀其 SKILL.md 而載之（見 Loading；或提示 `/<skill>`）。
3. 意圖含混（如「構建」未分執行動作/查配置）→ 見 Disambiguation 擇對應行。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 從零搭建新 Photino.NET 應用（解決方案/前端/橋/代理） | `photino:setup-photino-project`（或 `photino-scaffolder` 代理） |
| 配置既有工程供 AI 輔助開發（agnt.kdl 自啟、CLAUDE.md、記憶文件） | `photino:setup-photino-project` |
| 理解桌面架構（PhotinoWindow、線程模型、IMessageTransport、雙模 Program.cs、WebView 引擎表） | `photino:photino-architecture` |
| 啟動雙服務開發環境（熱重載、WebSocket 驗證） | `photino:photino-dev`（見 Disambiguation） |
| 開發工作流參考（DevServer 類、Vite 代理、MessageBridge 自檢、agnt.kdl） | `photino:photino-development`（見 Disambiguation） |
| 構建應用（檢測 csproj、構建前端、debug/release/平台編譯） | `photino:photino-build`（見 Disambiguation） |
| .NET 構建配置參考（csproj、MSBuild targets、包引用、版本釘定、構建錯誤） | `photino:dotnet-build-system`（見 Disambiguation） |
| 前端嵌入管道（Vite 構建至 wwwroot、基路徑、開發/生產加載、後備 HTML） | `photino:frontend-embedding` |
| 中央消息路由（{type,payload}、HandleMessage、Send 助手、事件接線、Svelte 5、IAsyncDisposable） | `photino:message-router-pattern` |
| 嵌入 PowerShell SDK（runspace、SessionManager、流式執行、TabExpansion2、函數注入、PSObject） | `photino:powershell-integration` |
| 運行測試（過濾模式、覆蓋率、前端類型檢查） | `photino:photino-test`（見 Disambiguation） |
| 測試策略參考（可測性層級、環境 trait、fixture 模式、過濾） | `photino:photino-testing`（見 Disambiguation） |
| 發布為跨平台自含可執行文件 | `photino:photino-publish`（見 Disambiguation） |
| 打包參考（RID 表、self-contained/single-file、平台 WebView、安裝器、CI、trimming） | `photino:photino-packaging`（見 Disambiguation） |

## Disambiguation

動作技藝（執行）與參考技藝（配置/背景）成對，勿混：

- **開發環境**：實際啟動雙服務、驗 WebSocket → `photino:photino-dev`；配置 Vite 代理/DevServer/agnt 自啟之背景讀 → `photino:photino-development`。
- **構建**：實際編譯（檢測 csproj + 構建前端 + .NET compile）→ `photino:photino-build`；調 csproj/MSBuild/包版本或診斷構建錯誤 → `photino:dotnet-build-system`。
- **測試**：實際運行測試 + 覆蓋率 + 類型檢查 → `photino:photino-test`；搭建測試工程、可測性分層、fixture 策略 → `photino:photino-testing`。
- **發布 / 打包**：實際發布可執行文件 → `photino:photino-publish`；查 RID/安裝器/CI 矩陣/trimming 配置參考 → `photino:photino-packaging`。
- **初建 vs 配置**：全新工程從零搭建 → `photino-scaffolder` 代理 或 `photino:setup-photino-project`；既有工程接入 AI 輔助（agnt.kdl/CLAUDE.md/記憶）→ `photino:setup-photino-project`。

## Related

- `photino-scaffolder` 代理 — 從零生成完整 Photino.NET 解決方案（前端、消息橋、代理配置）之協調者。
- `photino:photino-architecture` — 任何架構決策前宜先讀之基礎。
