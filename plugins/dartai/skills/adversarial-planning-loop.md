---
name: adversarial-planning-loop
description: Adversarial cooperation loop for plan validation - complete hierarchy with research tasks, preventing over-design. 對抗規劃環：驗證計劃完整性，含研究任務，防過度設計。 Use when: validate plan, build task hierarchy, planning loop, refactor-first assessment, prevent scope creep
---

# Adversarial Planning Loop (Ralph Wiggum Pattern)

規劃者與挑戰者對抗合作之持續精化環，確保計劃完整、可行、最小。

## Core Principles

規劃紀律存於項目規則文件——勿在此重複：

- `.claude/rules/karpathy-principles.md` — goal-driven execution, push back, verify, no scope creep
- `.claude/rules/refactor-discipline.md` — A/B/C refactor rule
- `.claude/rules/code-quality.md` — code quality standards
- `.claude/rules/testing.md` — testing and TDD standards

需操作細節時，以`Skill`工具調用規則所引用技能（如`dev-standards:grill-task`、`dev-standards:refactor-first-assessment`、`dev-standards:review-for-plan-updates`）。勿僅憑規則內容行事。

## Planning Process

### Step 1: Grill the Task

> Invoke the `Skill` tool with `skill: dev-standards:grill-task` — 以原始請求作為輸入。

- 返回`verdict: OK`：以`task_spec`為規劃輸入。
- 返回`verdict: TOO_LARGE_TO_GRILL`：停止規劃，報告須拆分。
- 返回`verdict: ABORTED`：停止並返回。

`grill-task`含**規劃時品質審查**（直接性、問題/方案適配、可測試性、過度工程防護、方案深度）後返回規格。勿在此重複該審查。

繼續前提交grill返回的所有`backflow_writes`。

### Step 2: Refactor-First Assessment

> Invoke the `Skill` tool with `skill: dev-standards:refactor-first-assessment` — 以已審查的`task_spec`作為輸入。

- 返回「sign off」：進入Step 3。
- 返回重構步驟：在實現步驟前插入計劃。

### Step 3: Build Task Hierarchy

創建最小計劃：

```yaml
plan:
  deliverable: "Single concrete outcome"

  research_tasks:
    - title: "RESEARCH: {question}"
      output: "Decision document"
      blocks: [implementation_task_ids]

  implementation_tasks:
    - title: "Implement {specific thing}"
      acceptance_criteria:
        - "Criterion 1 - verified by RED→GREEN test cycle"
      files_affected: ["specific/files.ts"]
      steps:
        - "Write RED test for smallest behavior"
        - "GREEN: Minimum implementation"
        - "Refactor while GREEN"

  not_included:
    - "Explicitly list what we won't do"
```

**驗證規則：**
- 每任務上下文大小：最多5文件，最多7步驟
- 每個驗收標準有對應任務
- 每個未知有研究/探究任務在實現前
- 研究任務在依賴實現任務**之前**
- 按完整縱向切片實現，非橫向分層

### Step 4: Context-Sized Task Validation

驗證約束：

```yaml
size_check:
  files: "<= 5 per task"
  steps: "<= 7 per plan"
  estimated_changes: "< 200 lines added/modified"

  if_exceeds:
    action: "Split into multiple tasks"
```

**風險預算權威（authoritative budget check when enabled; legacy fallback）**：若風險管道裝且啟（見 simple-planning Step 0.6 之可用性檢），調用 `risk-pipeline:budget` 以同入參，風險裁決為權威驅動切片決策；`enabled: false` 時退回既有 `size_check` 邏輯：

```yaml
if_risk_pipeline_available:
  invoke: "risk-pipeline:budget with {touched_units, config, lci_client}"
  authoritative_action:
    - "Apply risk.split_proposal when verdict == split_required"
    - "Apply risk.refactor_proposal when verdict == refactor_first_required"
    - "Legacy size_check retained as secondary signal; diffs written to telemetry"
  telemetry:
    path: ".dartai/telemetry.jsonl"
    record:
      event: "budget"
      legacy_tier: "<minimal|standard|comprehensive|architectural>"
      risk: { enabled: true, verdict: "...", pipeline_tier: "...", scalar: 0, vector: {} }
      agreement: "<match|diverge>"
      authoritative: "risk"

if_unavailable:
  action: "Write {event:'budget', risk:{enabled:false}, authoritative:'legacy'} record; legacy size_check drives split (fallback path)"
```

啟用時風險裁決權威驅切片；`enabled: false` 時 `size_check` 為後備。

### Step 5: Review for Plan Updates (comprehensive/architectural only)

對於comprehensive及architectural層級任務，以提議計劃調用`dev-standards:review-for-plan-updates`。持久化返回的提案供規劃者在下一規劃週期評估。

## Plan Output Format

```yaml
plan:
  title: "One-line description"
  requested: "Exact user request (verbatim)"
  deliverable: "Concrete outcome when done"
  complexity_tier: "minimal|standard|comprehensive|architectural"

  tasks:
    research:
      - id: "R1"
        title: "RESEARCH: {question}"
        time_box: "2 hours"
        output: "Decision document"
        blocks: ["I1"]

    implementation:
      - id: "I1"
        title: "Implement {specific thing}"
        depends_on: ["R1"]
        files: ["path/to/file.ts"]
        acceptance_criteria:
          - "Criterion - how verified"
        steps:
          1: "First specific action"
          2: "Second specific action"

  not_included:
    - "Feature X (not requested)"

  execution_order:
    1: "R1 - Research"
    2: "I1 - Implementation"
```

## Plan Adjustment Protocol

```yaml
plan_adjustment_rules:
  automatic_continuation:
    description: "Planning phases are automatic refinement cycles"
    behavior: "Identify issues, fix plan, continue"

  when_to_stop:
    - "Cannot determine scope without user input"
    - "Conflicting requirements with no resolution"
    - "External dependency blocking all approaches"

  when_to_continue:
    - "Missing research tasks (add them, continue)"
    - "Vague steps found (make specific, continue)"
    - "Scope creep detected (trim back, continue)"
    - "Dependencies discovered (reorder, continue)"

  never_ask:
    - "Is this plan okay?"
    - "Should I add more detail?"
    - "Do you want research tasks?"
    - "Ready for next phase?"
```

## Integration with Task Execution

規劃完成後：

1. **研究任務先執行**，經標準任務管道
2. **研究輸出指導實現任務**——按需調整
3. **實現遵循已審查規格**——完整對抗品質環保留用於實現時驗證
4. **計劃依發現調整**——此為正常，非失敗

```yaml
plan_to_execution:
  handoff:
    - "Create Dart tasks for each plan item"
    - "Set dependencies in Dart"
    - "Add plan context to each task description"
    - "Start execution with first research/spike task"
```
