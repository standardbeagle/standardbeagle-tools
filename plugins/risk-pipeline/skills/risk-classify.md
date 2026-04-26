---
name: risk-classify
description: "Classify a task: (task spec + touched files) → risk vector + verdict + pipeline tier. Applies 8-check trivial-bypass pre-filter; on bypass returns smoke tier. Otherwise aggregates @risk tags (invoking risk-tag-unit inline for untagged units), computes task-level unknowns, delegates to risk-budget + risk-pipeline-dispatch, emits unified YAML. Returns enabled:false when risk-pipeline config absent."
context: fork
agent: general-purpose
---

<!-- CC 2.1 fork decision: workflow driver — orchestrates trivial-bypass pre-filter, @risk aggregation (invoking risk-tag-unit inline for untagged units), unknowns calculation, and delegation to risk-budget + risk-pipeline-dispatch. Called from grill-task / add-task / loop coordinators per task — forking keeps the calling planner's context clean; only the final unified YAML risk vector reaches the parent. Executor: general-purpose (deterministic classification, no specialist domain). -->


# risk-classify

## 概覽 (Overview)

任務級風險分級。輸入任務規格與觸及文件，出風險向量、裁決、管道層三件。呼叫方：`grill-task`、`add-task`、循環協調器、PostToolUse 鉤。流程：配置存否 → 前濳八檢 → 聚合 `@risk` 標（缺則 inline 調 `risk-tag-unit`）→ 計 unknowns → 調 `risk-budget` + `risk-pipeline-dispatch` → 合出 YAML（spec §Output of risk-classify）。

## 輸入 (Inputs)

呼叫方必供：

- `task_id` — Dart 任務 id 或規格識別符
- `task_spec` — 任務描述/正文
- `touched_files` — 列 `{path, line_range?, change_type: added|modified|renamed|deleted}`

**啓用前檢 (enabled precheck)**：讀 `.claude/rules/risk.md` 之 frontmatter。若檔缺、或 `risk_pipeline.enabled == false`，即返 `{enabled: false}`；呼叫方走遺留管道。此為向後兼容首門。

## 前濳 (Pre-filter — 8 trivial-bypass checks)

八項皆成 → `pipeline_tier: smoke`，跳 tagger 與 classify，出極簡結果。任一破 → 全分級。（spec §Pre-filter 313–331）

| # | Check | Rule |
|---|-------|------|
| 1 | new_file | `touched_files` 中無 `change_type=added` |
| 2 | new_export | LCI diff 無新導出符號 |
| 3 | rename | LCI diff 無符號重命名 |
| 4 | line_delta | 每文件 `added<20 && removed<20` |
| 5 | file_size | 變後文件 `<pre_filter.context_budget_lines`（默 800） |
| 6 | growth | 單文件增長 `<pre_filter.growth_ratio_max`（默 1.2×） |
| 7 | move | 無文件移位或重名 |
| 8 | security_path | 無觸 `pre_filter.security_paths_hardcoded`（默 `auth/**` `crypto/**` `migrations/**`） |

八成出：`{enabled:true, verdict:ok, pipeline_tier:smoke, task_risk:null, budget:n/a, required_reviewers:[], model:haiku-4.5, tdd_required:false}`。

## 全分級 (Full classify pipeline)

六步依序：

1. **載標**：對每觸單元，從其 codedoc 解 `@risk` 標（schema 見 `rules/risk-pipeline/codedoc-schema.md`）。
2. **補標**：未標或滯單元（`tagged:` 舊於 git mtime）inline 調 `risk-tag-unit`。
3. **聚軸**：blast 按 LCI 調用圖放大（spec §Per-axis 233–244）；data/security/reversibility 取 `max()` 跨單元。
4. **算 unknowns**：四信號見下節，累加封頂 3。
5. **定標**：調 `risk-budget` → scalar + verdict；調 `risk-pipeline-dispatch` → reviewers + model + tdd。
6. **出果**：合六步為統一 YAML（見 §輸出）。

## unknowns 軸 (Unknowns signal computation)

四信號獨立檢，各 `+1`，累加封頂 `3`。（spec §Per-axis 247–255）

| Signal | Condition | Contribution |
|--------|-----------|--------------|
| lci_symbol_miss | 規格引用之符號 LCI 索引中無 | +1 |
| low_coverage | 觸及模塊測試覆蓋 `<50%` | +1 |
| novel_domain | 規格引入之術語 `DOMAIN.md` 中無定義 | +1 |
| low_tagger_conf | 觸單元之 tagger 平均 `conf<0.75` | +1 |
|  | Cap at 3 |  |

累加結果映射為 `u` 軸：`0→.`、`1→-`、`2→+`、`3→!`。

## 裁決 (Verdict rules)

四裁決互斥，按優先序裁：

- `ok` — `scalar <= budget` 且無臨界軸（無 `!`）。走對應層管道。
- `split_required` — `scalar > budget` 且按 spec §Split SOP (287–311) 可切片（每片合預算、無 findability 違反）。伴 `split_proposal`。
- `refactor_first_required` — 單一主導單元（單位貢獻 `> budget` 獨力）使切無濟。前置一重構任務解構之。
- `escalate` — findability 違反（如切出孤文件持碎片）、或命中 architectural 層觸發（`scalar >= 15` 或任軸 `= !`）。升人工檢核點。

**臨界附則**：任一軸 `= !`，無論 scalar，必含專審（security/data/reversibility 之一），記於 `crit_axes`。（spec §Hard crit 283–285）

## 管道層 (Pipeline tier mapping)

四層自 scalar 與臨界軸映。（spec §Pipeline phase matrix 419–438）

| Tier | Condition | Flow |
|------|-----------|------|
| smoke | 前濳八成 | edit → lint → test-touched → commit |
| light | scalar 1–4，無 `!` | TDD (如觸)→ self-review → qa → lint+test → commit |
| dim_matched | scalar 5–14 | TDD → self-review → [qa + 維度審並行] → quality gates → commit |
| architectural | `scalar >= 15` 或任軸 `= !` | research (如 `u >= +`) → TDD → self-review → [qa+security+data+reversibility+novelty 按觸] → post-task-reviewer → human checkpoint (如 crit) → commit |

## 輸出 (Output schema)

```yaml
task_id: <id>
enabled: true
verdict: ok | split_required | refactor_first_required | escalate
task_risk:
  b: 0-3
  d: 0-3
  s: 0-3
  r: 0-3
  u: 0-3
  scalar: <int>
  crit_axes: [<axis_name>, ...]  # 列軸名 security|data|reversibility|blast|unknowns, 非 glyph
budget: 10
over_by: <int>                    # max(0, scalar - budget)
pipeline_tier: smoke | light | dim_matched | architectural
required_reviewers: [qa, security, data, reversibility, novelty, code-quality]
model: haiku-4.5 | sonnet-4.6 | opus-4.7
tdd_required: true | false
split_proposal:                   # 空陣列 if verdict != split_required
  - slice_1: {units: [...], scalar: <int>}
  - slice_2: {units: [...], scalar: <int>}
findability_notes: "<str>"        # 切片決策說明或 findability 檢查結果
```

欄義：`task_id` 來自輸入；`enabled:false` 時僅此欄出。`crit_axes` 用軸全名（`security` 非 `s`）供人讀。`over_by` 負值夾為 `0`。`required_reviewers` 來自 `risk-pipeline-dispatch`，默 `[qa, code-quality]`。`model` 三檔僅此。`split_proposal` 非 split 時空列。`findability_notes` 必備（即便空析亦述「no split needed」）。

## 錯誤與回退 (Error + fallback)

四回退態：

- **配置缺** `.claude/rules/risk.md` 不存或 `enabled: false` → 返 `{enabled: false}`，呼叫方走遺留管道。
- **Tagger 不可得** inline 調 `risk-tag-unit` 失敗 → 該單元記 `unknowns:high`（悲觀），不阻塞全流。
- **`risk-budget` 失敗** → 保守置 `verdict: escalate`，`pipeline_tier: architectural`，記 `findability_notes: "budget skill unavailable — defaulting to escalate"`。
- **`risk-pipeline-dispatch` 失敗** → 默 `required_reviewers: [qa, code-quality]`，`model: sonnet-4.6`，`tdd_required: true`（悲觀）。

## 範例 (Examples)

三例，三層。（spec §Examples 275–281）

**例 1 — trivial**：`b.d.s.r.u.`（全低），行增 5，無安全路徑。前濳八成 → `pipeline_tier: smoke`，`verdict: ok`，`model: haiku-4.5`，`tdd_required: false`，`required_reviewers: []`。

**例 2 — light**：`b+d.s.r.u.`（blast 高，餘低）。前濳破（行增 35）入全分級。`scalar = 2×2 = 4`，無 `!`，`over_by: 0`。→ `pipeline_tier: light`，`verdict: ok`，`model: haiku-4.5`，`tdd_required: true`（`b>=+`），`required_reviewers: [qa, code-quality]`。

**例 3 — architectural + split**：`b+d.s!r-u.`（security 臨界）。`scalar = 2×2 + 0×3 + 3×4 + 1×3 + 0×2 = 19`，`crit_axes: [security]`。`over_by: 9`，`scalar >= 15`。→ `pipeline_tier: architectural`，`verdict: split_required`（假設可切無 findability 違），`model: opus-4.7`（`!` 覆寫），`tdd_required: true`，`required_reviewers: [qa, security, code-quality]`，`split_proposal` 具。若不可切 → `verdict: escalate`。

## 依賴 (Dependencies)

技藝調用鏈：

- `risk-tag-unit`（Phase 03，已建）— inline 用於補標未標/滯單元
- `risk-budget`（Phase 07，pending，task `spRTJjH4LPHS`）— scalar + verdict 計算
- `risk-pipeline-dispatch`（Phase 08，pending，task `xC5x62LYetPW`）— reviewers/model/tdd 派發

Phase 07/08 未建之前，本技藝依 §錯誤與回退所述 fallback 行止：預算計算失 → `escalate`；派發失 → `[qa, code-quality] + sonnet-4.6 + tdd_required:true`。Phase 07/08 落地後，此條自動接入，無需改本檔。
