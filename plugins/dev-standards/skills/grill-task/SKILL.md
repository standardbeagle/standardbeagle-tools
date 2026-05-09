---
name: dev-standards-grill-task
description: "Interrogate any new task before it is persisted — extract intent, flow, domain terms, design patterns, scope, and verification with tier-gated depth. 任務創建時審問之，層層深掘以求精確。 Use when: plugin creates task, schedule work, grill request, interrogate task before planning, task intake, dartai task creation"
---

# Grill-Task

任務創建時運行。量料兩度，執行一刀。

## Invocation

```
Called by:
  dartai: /dartai:task, skills/simple-planning, skills/adversarial-planning-loop
  workflow: /workflow:add-task
Delegates to:
  risk-pipeline:classify (optional; Step 5 — skipped if plugin absent or disabled)
Returns:
  task_spec (required)  — includes task_spec.risk from risk-pipeline:classify
                          or {enabled: false} when pipeline disabled/missing
  backflow_writes (list of {skill, path, changes}; may be empty)
```

## Step 0 — Read project context (silent)

詢問前先讀。上下文愈豐，問題愈少。

- `.claude/rules/*` — project posture (security, testing, TDD level, architecture style)
- `CLAUDE.md` or `.claude/CLAUDE.md` — project identity
- `docs/DOMAIN.md` or `docs/domain/*.md` — canonical domain terms
- `docs/user-stories/` — existing stories
- `docs/user-flows/` — existing flows
- `docs/design-guidelines.md` and any component library READMEs detected
- Recent related tasks (for dartai: same folder; for workflow: `.workflow/loop-state.json.tasks[]`)
- LCI search results for the nouns and verbs in the raw request

## Step 1 — Classify tier

判斷此請求屬何級：

| Tier | Indicators | Action |
|---|---|---|
| Minimal | 1 file, trivial, unambiguous (typo, text, one-line fix) | **Skip grill entirely**, return one-line spec, done |
| Standard | 2-5 files, single feature/fix, minor clarification needed | Run full layered interrogation |
| Comprehensive | 5+ files, multiple criteria, significant discussion | Run full layered interrogation, all layers |
| Architectural | cross-cutting, multiple subsystems, new patterns | Run full layered interrogation, plus escalation if too large |

Minimal 級立即返回：

```yaml
task_spec:
  requested: "<user's exact words>"
  tier: minimal
  scope:
    files_to_modify: [<single file>]
  acceptance: [<one-line criterion>]
backflow_writes: []
```

## Step 2 — Layered questions (standard tier and above)

每輪一問，依序審問。若「讀自」已答，摘要已知，問「此仍確乎？」勿重頭。

### Layer 1 — Intent

- **Reads from:** `docs/user-stories/`
- **If missing, asks:** Who benefits? What specific outcome? How is success measured?
- **Writes back via:** project-local `write-user-story` (if present)

### Layer 2 — Flow

- **Reads from:** `docs/user-flows/`
- **If missing, asks:** Entry point? What adjacent steps? What exit criteria?
- **Writes back via:** project-local `define-user-flow` (if present)

### Layer 3 — Domain

- **Reads from:** `docs/DOMAIN.md`
- **If missing, asks:** What is the canonical term for this concept? Are there synonyms to avoid?
- **Writes back via:** project-local `domain-update` (if present), or `domain-init` if no DOMAIN.md exists yet

### Layer 4 — Design

- **Reads from:** `docs/design-guidelines.md`, component library README, existing patterns via LCI
- **If missing, asks:** What pattern should this follow? Is there an existing component to reuse?
- **Writes back via:**

> Invoke the `Skill` tool with `skill: dev-standards:update-rules` — 將設計規範寫入項目規則。

### Layer 5 — Scope

- **Reads from:** LCI search on nouns/verbs
- **If missing, asks:** Which files need to change? What is explicitly NOT included?
- **Writes back:** task spec only (no permanent writeback)

### Layer 6 — Verification

- **Reads from:** `.claude/rules/testing.md`, `.claude/rules/tdd.md`
- **If missing, asks:** How is done measured? Is there a RED test planned? Any manual verification step?
- **Writes back:** task spec only (no permanent writeback)

## Step 3 — Graceful degradation for absent writers

調用任何**項目本地**寫手技能前，先探其是否存在：

```bash
test -f .claude/skills/<skill-name>/SKILL.md
```

若無，不中止。在任務規格中記 TODO：

```yaml
notes:
  - "TODO: install .claude/skills/write-user-story to persist Intent layer gap"
```

下次 grill-task 若項目已安裝（藉

> Invoke the `Skill` tool with `skill: dev-standards:add-skill` — 為項目添加缺失的寫手技能。

或後續 `setup-project` 運行），自動銜接。

**插件本地寫手**（`decide`、`update-rules`、`update-project`、`add-skill`）常備，無需探測。

## Step 4 — Hard caps

- 初輪後最多 **2 輪**追問
- 縱Architectural級，最多 **12 問**
- 若達上限仍模糊，上報：返回 `task_spec.verdict = "TOO_LARGE_TO_GRILL"`，建議拆分任務
- 若 Step 5 風險分級出 `risk.vector.scalar > 25`（顯超 architectural 預算），亦觸 `TOO_LARGE_TO_GRILL`，附 `reason: risk_budget_exceeded`；若 `risk.verdict == split_required`，將 `risk.split_proposal` 併入回報供呼叫方直接建片，併附 `recommended_action: "Split per proposal then re-run grill"`

## Step 5 — Risk classification (risk-pipeline integration; authoritative when enabled)

風險分級若插件在。啟用時風險裁決為權威——驅 `TOO_LARGE_TO_GRILL` 觸發（`risk.vector.scalar > 25` 或 `verdict == split_required`）及下游 `pipeline_tier` 路由。不在或 `enabled: false` 則舊流繼，`task_spec.risk = {enabled: false}` 顯記之，層級邏輯回退驅動管道（legacy fallback path）。

### 可用性檢 (Availability check)

先探二事：

- 技藝存否：`plugins/risk-pipeline/skills/risk-classify.md` 可達
- 配置啟否：`.claude/rules/risk.md` frontmatter `risk_pipeline.enabled == true`

二者缺一 → 跳此步，`task_spec.risk = {enabled: false}`，續舊流。無錯，禁用為合法態。

### 調用 (Invocation)

> Invoke the `Skill` tool with `skill: risk-pipeline:classify` — 任務級風險分級，出向量、裁決、管道層。

入參：

- `task_id` — dartai 上下文或合成識別符
- `task_spec` — 當前已審之規格主體
- `touched_files` — 自 Step 1 層級偵測導出

出二態之一：

- `{enabled: false}` → 插件或配置禁用，記「risk-pipeline disabled」，`task_spec.risk = {enabled: false}`，跳合併
- 完整分級輸出 → 併入 `task_spec.risk`

### 合入 (Merge into task_spec)

規格附：

```yaml
task_spec:
  # ... 原欄不動 ...
  risk:
    enabled: true
    vector: {b, d, s, r, u, scalar, crit_axes}
    verdict: ok | split_required | refactor_first_required | escalate
    pipeline_tier: smoke | light | dim_matched | architectural
    required_reviewers: [...]
    model: haiku-4.5 | sonnet-4.6 | opus-4.7
    tdd_required: <bool>
    split_proposal: [...]      # 僅 verdict == split_required 時出
    findability_notes: "..."   # 切片決策或 findability 檢查述
```

### 向後兼容 (Legacy fallback when disabled)

- `task_spec.risk = {enabled: false}` 顯記，非略 —— 呼叫方可查而無需揣
- 層級邏輯驅管道（fallback path），無風險驅動裁決
- 不報錯，禁用為合法態
- 其餘 `task_spec` 欄一如既往，`risk` 純加性
- 啟用時風險驅 verdict/scalar/pipeline_tier；禁用時層級驅，二態皆合法

## Step 6 — Planning-Time Quality Review

呈確認屏前，單輪自審 `task_spec`。不派對抗代理。

### Quality Review Checklist

```yaml
planning_quality_review:
  directness:
    check: "Does the spec attack the problem directly, or does it wander through indirection?"
    pass_if:
      - "The smallest change that delivers the request is identified"
      - "No preparatory 'setup' steps that don't directly advance the goal"
      - "Solution path is a straight line from problem to deliverable"
    fail_if:
      - "Introduces intermediary abstractions not required by the problem"
      - "Adds configuration or indirection without multiple immediate consumers"

  problem_solution_fit:
    check: "Is the proposed solution appropriate for this specific codebase?"
    pass_if:
      - "Uses patterns and libraries already present in the codebase"
      - "Leverages existing utilities rather than introducing new ones"
      - "Fits naturally into the existing architecture"
    fail_if:
      - "Imports a new pattern when an established one suffices"
      - "Creates a new subsystem for a localized change"
      - "Ignores existing conventions (error handling, logging, testing style)"

  testability:
    check: "Is every acceptance criterion extremely testable?"
    pass_if:
      - "Each criterion can be verified by a single RED→GREEN test cycle"
      - "Criteria are observable (output, behavior, state), not subjective"
      - "Edge cases are enumerated as separate criteria"
      - "Test approach matches the project's existing test runner and patterns"
    fail_if:
      - "Criteria use words like 'better', 'improved', 'user-friendly'"
      - "No clear pass/fail condition for a criterion"
      - "Testing would require manual verification or external coordination"

  overengineering_guard:
    check: "Is there any overengineering in the planned solution?"
    pass_if:
      - "No abstractions with only one consumer"
      - "No generic interfaces for a single implementation"
      - "No 'extensible' or 'configurable' additions not driven by current needs"
      - "No horizontal-layer planning; only vertical slices"
    fail_if:
      - "Plans to build frameworks instead of solutions"
      - "Adds parameterization for hypothetical future cases"
      - "Introduces classes/modules that don't simplify the immediate change"

  solution_depth:
    check: "Has the solution been thoroughly explored without overcomplicating?"
    pass_if:
      - "Trade-offs between at least two reasonable approaches were considered"
      - "The chosen approach is documented with a one-sentence rationale"
      - "Known edge cases and error paths are addressed in the plan"
      - "Integration points with existing code are identified"
    fail_if:
      - "Only one approach was considered"
      - "No mention of how errors or edge cases are handled"
      - "Integration points are vague or missing"
```

五項皆通方呈確認屏；不通則調整規格，重審。

## Step 7 — Confirmation screen

寫入任何通道前，呈任務規格與所有待回流寫入，合為一屏：

```
Grilled Task Spec
=================
<task spec YAML>

Pending backflow writes
=======================
- write-user-story: docs/user-stories/US-43.md  (new, 42 lines)
- domain-update:   docs/DOMAIN.md  (append LineItem definition)

Approve [y] / Edit field [e] / Another round [r] / Abort [x] ?
```

`y`：原子性執行所有回流寫入（暫存後一次提交），返回任務規格給調用者。
`e`：詢問修改哪個字段。
`r`：回 Step 2，追加問題（仍受上限約束）。
`x`：不寫任何內容，返回 `task_spec.verdict = "ABORTED"`。

## Output format

```yaml
task_spec:
  requested: "<user's exact words>"
  tier: standard | comprehensive | architectural
  refs:
    user_story: docs/user-stories/US-42.md    # or null
    flow: docs/user-flows/checkout.md         # or null
    domain: [Order, LineItem]
    design: rules/design-guidelines.md#buttons
  scope:
    files_to_modify: [<paths, max 5>]
    not_included: [<explicit exclusions>]
  acceptance:
    - <RED→GREEN criterion 1>
    - <RED→GREEN criterion 2>
  verification:
    runner: vitest                             # or pytest, go test, etc.
    manual: <optional manual check>
  risk:                                        # from risk-pipeline:classify (Step 5)
    enabled: true | false                      # false when pipeline missing/disabled — all other risk.* fields absent
    # when enabled: vector, verdict, pipeline_tier, required_reviewers, model, tdd_required, split_proposal?, findability_notes
  notes: []                                    # populated on graceful degradation
  verdict: OK | TOO_LARGE_TO_GRILL | ABORTED
  # TOO_LARGE_TO_GRILL may carry reason: risk_budget_exceeded + recommended_action + risk.split_proposal

backflow_writes:
  - skill: <skill-name>
    location: plugin-local | project-local
    path: <file path written>
    summary: <one line>
```

## Discipline

- 每輪一問。絕不在同一訊息中疊問。
- 有合理選項時用多選；無則開放作答。
- Minimal 級絕不審問。審問錯字修改，誤甚於帶錯上線。
- 決不將項目本地寫手技能內容嵌入此技能。調用之。
- 決不寫入部分回流——收集、確認、原子性提交。
- 遵守 `.claude/rules/karpathy-principles.md`：不確定時反推，呈現取捨，不「假設跑」。

## Related skills

> Invoke the `Skill` tool with `skill: dev-standards:refactor-first-assessment` — 規劃技能在 grill-task 後調用，決定是否需預備重構步驟。

> Invoke the `Skill` tool with `skill: dev-standards:decide` — 未決架構問題之回流寫手。

> Invoke the `Skill` tool with `skill: dev-standards:update-rules` — 新項目規則之回流寫手。

> Invoke the `Skill` tool with `skill: dev-standards:add-skill` — 新項目專屬技能之回流寫手。

> Invoke the `Skill` tool with `skill: dev-standards:update-project` — 項目描述變更之回流寫手。
