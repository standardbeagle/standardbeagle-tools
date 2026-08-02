---
name: agnt-skills
description: "Index + router for agnt browser skills — agnt drives real browser via reverse proxy: dev server, live page navigation and inspection, DOM/CSS/layout diagnostics, console and network errors, screenshots, sketch mode, a11y/performance/security/SEO audits. Use when: picking agnt skill, debugging browser issue, inspecting element, auditing page, starting dev server or proxy."
---

# agnt 技能索引 — Skill router

agnt 賦 Claude 於**真實運行瀏覽器**中之眼與手：經 reverse proxy 驅動 dev server、導航與檢視 live 頁（目標恆 iframe 包裹）、捕 JS/網絡錯誤、稽查品質、繪 UI、錄可點擊導覽、即時串流用戶互動。

多數 agnt 技能設 `disable-model-invocation: true` 以省每輪 context。此索引常駐：辨需求 → 指明確技能，讀其 SKILL.md 而載之（見 Loading）。少數高頻技能（process-proxy、browser-debug、browser-diagnostics、check-errors、current-page、screenshot）仍自動可喚，無需經此。

## Loading a routed skill (載法)

多數目標技藝設 `disable-model-invocation: true` — 故**不可**以 `Skill` 工具喚之（喚則報
`cannot be used with Skill tool due to disable-model-invocation`）。技藝之身即 markdown，
**讀其檔**即載其令，效同而不佔常駐 context。

例外：上列六高頻技能（process-proxy、browser-debug、browser-diagnostics、check-errors、
current-page、screenshot）未設此旗，`Skill` 工具直喚即可，無需讀檔。

餘者擇定後：

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/<skill>/SKILL.md`
2. `CLAUDE_PLUGIN_ROOT` 未解或解至他 plugin（Windows 有此患）→ 改 glob
   `~/.claude/plugins/cache/*/agnt/*/skills/<skill>/SKILL.md`，取版本最高者
3. 依其身之令而行

用戶欲親調者，仍提示 `/agnt:<skill>`（手動喚不受此限）。

## 何時喚哪個 — Route by intent

### 啟動與生命週期 — Setup & lifecycle
- **`agnt:setup-mcp`** — 安裝 agnt MCP server（本地二進制 / npx / slop-mcp）。
- **`agnt:setup-project`** — 配置 scripts/proxies 開項目自啟。
- **`agnt:dev-proxy`** — 啟 dev server + reverse proxy 以調試（process-proxy 多覆蓋之）。
- **`agnt:stop-all`** — 殺所有進程與代理。

### 檢視與調試 — Inspect & debug（多為熱技能，常自動）
- **`agnt:browser-debug`** — 完整除錯工作流（檢視+佈局+互動+視覺）。
- **`agnt:browser-diagnostics`** — `__devtool.*` 元素/佈局/樹/**導航(goto/back/reload)** + iframe target 語意。
- **`agnt:current-page`** — 取當前頁全覽（URL、內容、連結、效能、視覺）。
- **`agnt:check-errors`** — 查 JS 錯誤。
- **`agnt:interaction-tracking`** — 追蹤點擊/表單/DOM 變動以除錯處理器。
- **`agnt:analyze-frontend`** — DOM/CSS/佈局/結構綜析。
- **`agnt:review-api`** — 審 API 調用、響應、網絡流量。

### 品質稽查 — Quality audits
- **`agnt:quality-audits`** — 綜合：DOM 繁度、CSS 構、安全、SEO 元標。
- **`agnt:accessibility-audit`** / **`agnt:audit-a11y`** — axe-core、ARIA、對比、Tab 序、屏讀。
- **`agnt:audit-performance`** — 載時、網絡瀑布、慢資源。
- **`agnt:audit-security`** — XSS、CSP、auth 流。
- **`agnt:audit-seo`** — meta、標題、結構資料、排名。
- **`agnt:responsive-check`** — 固定寬、觸控目標、橫滾、定位風險。
- **`agnt:analyze-ux`** — 佈局、互動、可用性。
- **`agnt:qa-test`** — 綜合 QA 測試套件。

### 視覺與設計 — Visual & design
- **`agnt:screenshot`** — 截圖（熱技能）。
- **`agnt:visual-diagnostics`** — 視覺疊層：輪廓、網格/彈性、字排、z 序。
- **`agnt:sketch-mode`** / **`agnt:sketch-visual`** — 線框、標注、UI mockup。
- **`agnt:design-md`** — 由 live 前端提取真實令牌生成 DESIGN.md 設計系統規格。

### 導覽與展示 — Demo & narrate
- **`agnt:demo-flow`** — 錄可重播之互動導覽：浮動步驟、高亮元素、計時/點擊/狀態推進。

### 即時串流與自動化 — Live streams & automation
- **`agnt:error-monitor`** — 跨代理/進程錯誤聚合去重監控。
- **`agnt:error-watch`** — 即時錯誤串流（agnt watch + Monitor）。
- **`agnt:event-watch`** — 即時用戶互動串流（面板訊息、點擊、草圖）。
- **`agnt:chain`** — 事發自動鏈接命令。
- **`agnt:schedule`** — 延時排程代理訊息。
- **`agnt:workflow`** — 任務完成工作流，強制審查循環。

### 參考 — Reference
- **`agnt:mcp-tools`** — 全部 agnt MCP 工具精確參數模式 + 可複製示例。
- **`agnt:lci-companion`** — 需語義代碼搜索時導向 sibling lci plugin。

## 用法

1. 辨意圖 → 上表選技能。
2. 不確定先讀 **`agnt:mcp-tools`** 查工具能力。
3. 任何 live-page 操作前確認代理運行且站點已連接（`agnt:current-page`）。
