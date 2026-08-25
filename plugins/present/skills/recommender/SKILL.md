---
name: present-recommender
description: "Routes present / browser-presentation intent to the right manual skill — sole auto gateway; others manual. present 唯一自動網關。 Use when: present an HTML report, render audit/review/findings, show a dashboard, reopen a generated .md/.html, need browser-based card sort, decision review, artifact annotation or HITL feedback, before hand-rolling report HTML."
---

# present Skill Recommender

此為 present 諸技藝之唯一**自動**網關。餘 3 技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一。

> 職責：**判意圖 → 薦技藝 → 讀其 SKILL.md 而載之（見 Loading）**。本技藝不渲染，只路由。

**設立之由**：`present:html-report` 之描述曰「before hand-rolling report HTML」，然其身為手動，Claude 側無任何可見入口 — 故 agent 屢自撰報告 HTML 而不知有此技藝。flat store 之 finder 僅濟 codex/opencode/kimi/crush；Claude 讀 plugin cache，不讀 flat store。此網關即 Claude 側之入口。

## Loading a routed skill (載法)

諸目標技藝設 `disable-model-invocation: true` — 故**不可**以 `Skill` 工具喚之（喚則報
`cannot be used with Skill tool due to disable-model-invocation`）。技藝之身即 markdown，
**讀其檔**即載其令。

擇定一技藝後：

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/<skill>/SKILL.md`
2. `CLAUDE_PLUGIN_ROOT` 未解或解至他 plugin（Windows 有此患）→ 改 glob
   `~/.claude/plugins/cache/*/present/*/skills/<skill>/SKILL.md`，取版本最高者
3. 依其身之令而行

用戶欲親調者，仍提示 `/present:<skill>`（手動喚不受此限）。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「宜用 `present:<skill>`」並讀其 SKILL.md 而載之。
3. 意圖含混 → 見 Disambiguation。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 生成報告：審計、評審、發現、儀表板、排序構想、決策樹、計劃摘要 | `present:html-report` |
| 重開既存 `.md` / `.html`（資料已在檔，不需重生） | `present:doc` |
| 需用戶互動：卡片分選、策略卡、決策審閱、標註產物、demo、HITL 回饋 | `present:mini-ide` |

## Disambiguation

- **html-report vs doc**：生**新**報告 → `html-report`；開**既有**檔案（含 html-report 前次所生者）→ `doc`。
- **html-report vs mini-ide**：只讀呈現 → `html-report`；需用戶輸入、編輯、排序、決策 → `mini-ide`。
- **present vs Claude Artifact**：`present:*` 寫入 OS temp 並開本機瀏覽器 — 快、離線、不留倉庫產物，然**無分享連結**。用戶需可分享之 URL、需他人閱覽、或需留存者 → 用 Artifact（先載 `artifact-design`）。二者不互斥：先 `html-report` 本機驗看，滿意後再發 Artifact。
- **可複製之標記 ≠ 本技藝**：`html-report` 之樣式出自 **Tailwind CDN**，貼入郵件、Google Docs、CMS 即失樣式。用戶索「可複製之 HTML 表格/區塊」者，須逐 cell 內聯 style — 此不在本 plugin 範圍，直接手寫即可。

## Related

- `ideation:recommender` — 構想工作流之產物多由 `present:html-report` 呈現。
- `artifact-design` — 發 Artifact 前必載。
