---
name: dev-standards-config
description: "dev-standards 設定網關，導向正確之手動配置技藝。Routes project-setup / config-CRUD intent to the right manual dev-standards skill. Use when: bootstrap project dev standards, re-detect tech stack, refresh CLAUDE.md/hooks, add/edit/remove project rules, create project-specific skill, SKILL.md description style, diagnose/configure compound-engineering env, /ce-setup, unsure which config skill."
---

# dev-standards Config Recommender

此為 dev-standards **配置/CRUD** 群之自動網關。該群諸技藝皆手動（`disable-model-invocation: true`）— 本技藝據意圖導向其一，免各描述每 turn 耗 context。行為守則類技藝（verification、grill-task、ponytail、decide 等）別自為自動，不經此網關。

> 職責：**判意圖 → 薦技藝 → 以 `Skill` 工具調之**。本技藝不執行配置，只路由。

## Flow

1. 辨用戶意圖，對下表擇最近一行。
2. 告知：「宜用 `dev-standards:<skill>`」並以 `Skill` 工具調之。
3. 意圖跨多行則列首選 + 次選，勿全羅列。
4. 意圖含混（見 Disambiguation）則先辨初設 vs 更新。

## Routing Table

| 意圖 / Intent | 技藝 / Skill |
|---|---|
| 初設項目開發規範（規則+技能+鉤子） | `dev-standards:setup-project` |
| 重測技術棧、比對現配置、更新規則/CLAUDE.md/鉤子 | `dev-standards:update-project` |
| 增/改/刪 `.claude/rules/` 中某規則 | `dev-standards:update-rules` |
| 於 `.claude/skills/` 新建項目專屬技能；亦含自 lesson / solved-problem / 反覆 procedure 材料固化為技能 | `dev-standards:add-skill` |
| 撰/審 SKILL.md `description` 之風格與壓縮 | `dev-standards:skill-description-style` |
| 診斷/配置 compound-engineering 環境、CLI 依賴、/ce-setup 復檢 | `dev-standards:ce-setup` |

## Disambiguation

- **初設 vs 更新**：項目未立規範、首次 bootstrap → `setup-project`；已有配置、欲隨技術棧演進刷新 → `update-project`。
- **整體更新 vs 單規則**：欲重測棧並協調多處（規則+CLAUDE.md+鉤子）→ `update-project`；僅增改刪某一條規則 → `update-rules`。
- **建技能 vs 環境設定**：欲固化模式為新 SKILL.md → `add-skill`；欲診斷/裝 CE 工具鏈與 repo 本地配置 → `ce-setup`。

> **Create-skill 流之終步**：`add-skill` 之末步（Step 6）向 repo 根 `AGENTS.md` 加一行 pointer——非-Claude agents 唯此可見項目技能。路由至 `add-skill` 時，確保此步不略。
