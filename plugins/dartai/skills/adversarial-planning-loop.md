---
name: adversarial-planning-loop
description: Adversarial cooperation loop for plan validation ensuring complete hierarchy with research tasks, while preventing over-design
---

# Adversarial Planning Loop (Ralph Wiggum Pattern)

A continuous planning refinement loop where a planner and challenger cooperate adversarially to ensure plans are complete, actionable, and minimal.

## Core Principles

Planning discipline lives in the project's rule files — do not duplicate it here:

- `.claude/rules/karpathy-principles.md` — goal-driven execution, push back, verify, no scope creep
- `.claude/rules/refactor-discipline.md` — A/B/C refactor rule
- `.claude/rules/code-quality.md` — code quality standards
- `.claude/rules/testing.md` — testing and TDD standards

When operational detail is needed, invoke the skill referenced by the rule (e.g., `dev-standards:grill-task`, `dev-standards:refactor-first-assessment`, `dev-standards:review-for-plan-updates`) via the `Skill` tool. Do not act on rule content alone.

## Planning Process

### Step 1: Grill the Task

Invoke `dev-standards:grill-task` with the raw request.

- If it returns `verdict: OK`, use the `task_spec` as the planning input.
- If it returns `verdict: TOO_LARGE_TO_GRILL`, stop planning and report that the task must be split.
- If it returns `verdict: ABORTED`, stop and return.

`grill-task` includes a **planning-time quality review** (directness, problem/solution fit, testability, overengineering guard, solution depth) before returning the spec. Do not duplicate that review here.

Commit any `backflow_writes` from the grill before proceeding.

### Step 2: Refactor-First Assessment

Invoke `dev-standards:refactor-first-assessment` with the grilled `task_spec`.

- If it returns "sign off", proceed to Step 3.
- If it returns refactor steps, insert them into the plan before implementation steps.

### Step 3: Build Task Hierarchy

Create the minimal plan:

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

**Validation rules:**
- Every task is context-sized: max 5 files, max 7 steps
- Every acceptance criterion has a task
- Every unknown has a research/spike task before implementation
- Research tasks come BEFORE dependent implementation tasks
- Implement full vertical slices, not horizontal layers

### Step 4: Context-Sized Task Validation

Verify constraints:

```yaml
size_check:
  files: "<= 5 per task"
  steps: "<= 7 per plan"
  estimated_changes: "< 200 lines added/modified"

  if_exceeds:
    action: "Split into multiple tasks"
```

### Step 5: Review for Plan Updates (comprehensive/architectural only)

For comprehensive and architectural tier tasks, invoke `dev-standards:review-for-plan-updates` on the proposed plan. Persist any returned proposals for the planner to evaluate at the next planning cycle.

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

After planning completes:

1. **Research tasks execute first** via standard task pipeline
2. **Research outputs inform implementation tasks** — adjust as needed
3. **Implementation follows the grilled spec** — the full adversarial quality loop is reserved for implementation-time verification
4. **Plan adjusts based on discoveries** — this is normal, not failure

```yaml
plan_to_execution:
  handoff:
    - "Create Dart tasks for each plan item"
    - "Set dependencies in Dart"
    - "Add plan context to each task description"
    - "Start execution with first research/spike task"
```
