---
name: using-superpowers
description: Use when starting any conversation — establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions. 啟話即用：定技能發現與調用之法，凡答（含反問）前必先察技能。
---

<SUBAGENT-STOP>
若汝為 subagent 受派執一具體任，略此 skill。
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
若一 skill 有 1% 可能適汝所為，汝**必**調之。

技能適任時，汝無選擇餘地 —— 必用之。此不可議，不可自圓其說繞過。
</EXTREMELY-IMPORTANT>

## The Rule

**於任何回應或動作前，調相關/請求之 skill** —— 含反問、探 codebase、查檔。若後證不合，不必續用。

**入 plan mode 前：** 若未 brainstorm，先調 `brainstorming` skill。

then 宣告 "Using [skill] to [purpose]"，遵 skill exact。有 checklist 則每項一 todo。

## Skill Priority

多 skill 適時，**process skills 先** —— 定法，後由 implementation skills 執。`brainstorming` 與 `systematic-debugging` 為最常之 process skill，然此則通用於任一。

- "Let's build X" → `brainstorming` 先，後 implementation skills。
- "Fix this bug" → `systematic-debugging` 先，後 domain skills。
- "Implement this feature" → `test-driven-development`（red→green→refactor）。

## Flow → worktrack-loop（非本地 flow skills）

規劃、執行、branch-finishing 委予 **worktrack-loop** plugin，非 superpowers：

- **設計 → 任務隊**：`/worktrack:plan`（`worktrack-scope-tasks` skill）—— 上下文預算切分、最輕 model+effort、測試先行、fresh-context 對抗審。
- **驅動任務**：`/worktrack:start`（或 `/loop /worktrack:start --max-tasks 1` 乾隊）。
- **單任務**：`/worktrack:task`。

brainstorming 之 terminal handoff 指 `/worktrack:plan`，代舊 `writing-plans → executing-plans` 鏈。

## Native Claude Code（勿造重複 skill）

下列由 harness 原生具，用之，勿另立 skill：

| 需 | 原生 |
|---|---|
| 驗證完成 | `/verify` skill |
| Code review | `/code-review`（含 `ultra` cloud）、`/review`、`/security-review` |
| 平行 subagent | `Agent` tool（`run_in_background`） |
| Git worktree 隔離 | `EnterWorktree`/`ExitWorktree`、`Agent isolation:"worktree"` |
| Plan mode | `EnterPlanMode`/`ExitPlanMode` |
| Skill 發現 | `Skill` tool、`find-skills` |
| 建/審 skill | `plugin-dev:skill-development`、`dev-standards:add-skill` |

## Red Flags

下列念頭 = STOP，汝在自圓：

| 念頭 | 實 |
|---|---|
| "此僅簡單問題" | 問即任。察 skill。 |
| "須先取 context" | Skill 察先於反問。 |
| "先探 codebase" | Skill 教汝如何探。先察。 |
| "快查 git/檔" | 檔缺對話 context。察 skill。 |
| "先蒐資訊" | Skill 教汝如何蒐。 |
| "此不需正式 skill" | Skill 存則用。 |
| "我記得此 skill" | Skill 會演進。讀現版。 |
| "此不算任務" | 動作即任。察 skill。 |
| "Skill 過度" | 簡事會轉繁。用之。 |
| "先做這一件" | 動前先察。 |

## User Instructions

User instructions（CLAUDE.md、AGENTS.md、直接請求）勝 skills，skills 勝 default behavior。唯 human partner 明令方可略 skill workflow。
