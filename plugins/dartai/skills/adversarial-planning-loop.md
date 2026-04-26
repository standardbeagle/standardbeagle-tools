---
name: adversarial-planning-loop
description: Adversarial cooperation loop for plan validation - complete hierarchy with research tasks, preventing over-design. 對抗規劃環：驗證計劃完整性，含研究任務，防過度設計。 Use when: validate plan, build task hierarchy, planning loop, refactor-first assessment, prevent scope creep
context: fork
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

### Step 3.5: Dispatch Research Agents (INT2)

當規劃者識別出需在創建上下文適配任務層級前回答之開放知識缺口時，以Task工具並行派遣研究代理。每缺口→一研究代理調用。

研究代理集群（`compound-research:*` + `research:*`）以新鮮上下文並行運行，返回R2 §4.2 `research_report`形狀，規劃者消費`proposed_subtasks`創建Dart任務。

**Parallel research dispatch:**

```yaml
research_dispatch:
  # Dispatch research agents in parallel — each with fresh context, returns
  # research_report (R2 §4.2). Planner consumes proposed_subtasks for
  # task creation under parent epic.

  session_historian:
    # INT2 wave-1: surface prior-session context before planning anew.
    # Run early so historian findings can inform other researchers' scope.
    # Always-dispatched when Step 3.5 runs — the agent self-reports
    # verdict: BLOCKED if no session history is accessible (fresh machine,
    # first session in repo). Caller does not gate; agent gates internally
    # via its Skip-when frontmatter clause.
    subagent_type: "research:session-historian"
    description: "Search prior sessions for [task-title] context"
    prompt: |
      Search prior session history for context relevant to this planning task.

      ## Task / Topic
      [parent_task_title]

      ## Research Question
      What was previously tried, decided, or attempted regarding this
      problem in earlier Claude Code / Codex / Cursor sessions?

      ## Time Range
      Default 7 days; widen to 30/90 days only if narrow scan empty
      and request implies feature-level history.

      ## Context (from planning so far)
      [planner-accumulated context: domain, prior findings, constraints]

      ## Acceptance for this research
      - At least 2 prior sessions surveyed (or "no prior sessions" reported)
      - Cross-tool blindspots called out when present
      - Stale findings flagged with caveat
      - Investigation journey, user redirections, decisions extracted

      ## Return
      Return structured research_report (per R2 §4.2) as the final message
      body, no preamble. verdict ∈ {COMPLETE, PARTIAL, BLOCKED}.

  web_researcher:
    # Optional: dispatch when external research needed (web, framework docs).
    # Mode flag selects sub-behavior (general | best-practices | framework-docs).
    enabled_when: "gap.requires_external_research == true"
    subagent_type: "research:web-researcher"
    description: "External research for [gap.question]"
    prompt: |
      Run external research for question: [gap.question]

      ## Mode
      [general | best-practices | framework-docs]

      ## Parent Task
      [parent_task_id] — [parent_task_title]

      ## Research Question
      [gap.question]

      ## Context
      [planner-accumulated context]

      ## Acceptance
      - At least 3 sources consulted
      - Each finding has ≥1 source citation
      - Each high-confidence finding has an adversarial counter-claim

      ## Return
      Return structured research_report (per R2 §4.2) as the final message
      body, no preamble. verdict ∈ {COMPLETE, PARTIAL, BLOCKED}.
```

**Result handling:**

```yaml
result_handling:
  complete:
    action: "Apply proposed_subtasks — create Dart tasks under parent epic"
    next: "Continue to Step 4"
    note: |
      Per project memory: parentage is set by adding subtask_ids to the
      parent after children are created (NOT via parentId on creation).

  partial:
    action: "Create open-question tasks + apply any proposed_subtasks"
    next: "Continue to Step 4 with reduced confidence flag"

  blocked:
    action: "RETURN with failure to outer planning loop"
    note: "Researcher couldn't make progress — escalate to human review"
```

**Skipping rule:** if Step 3 produced no research gap and the planner has no novel context to seed historian search, skip Step 3.5 entirely. When dispatched, session-historian self-reports `verdict: BLOCKED` if no session history is accessible (fresh machine, first session in repo) — treat that as a no-op, not a failure.

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
