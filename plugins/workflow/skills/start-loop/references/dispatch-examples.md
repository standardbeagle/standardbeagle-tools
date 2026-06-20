---
description: Reference material for /workflow:start-loop. Loaded on demand by the driver when entering task dispatch (§4.2) or plan-rotation atomic write (§3). Contains dispatch-prompt compression rules, executor prompt templates, plan-meta schema, and full iteration examples. Not a user-invocable command — this file is read by the start-loop driver, not invoked directly.
disable-model-invocation: true
---

# Workflow Start-Loop: Dispatch Examples & Detail

Loaded by `/workflow:start-loop` when the driver enters task dispatch (§4.2 Spawn Fresh Task Executor) or the plan-rotation atomic write (§3 Plan File Layout). Compression rules, executor prompt templates, plan-meta schema, and full iteration examples live here.

## Dispatch Prompt Compression

Driver-to-executor prompts are compressed to cut token cost ~50–70% per dispatch. The executor agent (`plugins/workflow/agents/task-executor.md`) accepts compressed input.

| keep verbatim | compress / strip |
| --- | --- |
| file paths, line numbers | articles (a/an/the) |
| function/symbol names | filler (just/really/basically) |
| code blocks (fenced) | pleasantries, hedging |
| error messages | narrative recap |
| commit/PR text, loop-ids, task-ids | role-prelude boilerplate |
| URLs, hashes | "please", "kindly", "as you know" |

**Sentence-preservation exceptions** — keep full sentences in:
- Acceptance criteria (disambiguates verdict)
- Risk descriptions (mitigation depends on nuance)
- Spec sections inside `task_spec`

**Forbidden compression zones** — never compress:
- Code blocks (fenced ``` ... ```)
- Security text (auth flow, threat model, CVE refs)
- Error messages quoted verbatim from logs
- File contents quoted for review

**Final user-facing summary** stays normal English — compression is driver→subagent only.

## Executor Dispatch Pattern (compressed form, mandatory)

```yaml
subagent_execution:
  tool: Task
  subagent_type: "workflow:task-executor"
  description: "Execute task: [short title]"   # ≤8 words

  prompt: |
    Execute workflow task.

    loop_id: [loop-id]
    task_id: [task-id]
    task_index: [X of Y]
    active_plan: .workflow/plan.md (active slice — skip plan-archive.md)

    task_spec (full sentences preserved):
      title: [title]
      priority: [priority]
      scope: [scope]
      description: [full description verbatim]
      acceptance: [criteria list verbatim]
      context: [additional context verbatim]

    Behavior: run adversarial-quality skill; report success/failure;
    update .workflow/loop-state.json; fresh context, no prior memory.
```

### Worked Example

```
Task tool call (or Agent — alias in Claude Code harnesses):
  subagent_type: "workflow:task-executor"
  description: "Execute: Add user auth"
  prompt: "Execute workflow task. loop_id: loop-abc123. task_id: task-1. ..."
```

## Plan-Meta KDL Shape (full)

```kdl
plan {
    active_phase "phase-3-implementation"
    last_rotated "2026-04-27T23:00:00Z"
    archived_phases {
        phase id="phase-1-design" rotated_at="2026-04-26T10:00:00Z" archive_offset="1"
        phase id="phase-2-scoping" rotated_at="2026-04-27T09:30:00Z" archive_offset="142"
    }
    checkpoints {
        checkpoint id="ck-7" phase="phase-3-implementation" status="open"
    }
}
```

`archive_offset` is the line number in `plan-archive.md` where the archived phase begins — explicit retrieval without scanning the whole archive.

## Atomic Rotation (full step-by-step)

When a phase is marked `done` AND downstream phases are unblocked:

```yaml
rotation_trigger:
  conditions_all:
    - "phase.status == 'done'"
    - "no downstream phase blocked on this phase's checkpoints"
  result: "Move phase from plan.md → plan-archive.md, update plan-meta.kdl"
```

**Atomic write order (CRITICAL):**

```yaml
atomic_rotation:
  step_1_archive_append:
    action: "Append phase block to .workflow/plan-archive.md"
    verify: "fsync + read-back of appended block matches"
    rollback: "If verify fails, abort — do not touch plan.md"

  step_2_meta_update:
    action: "Rewrite .workflow/plan-meta.kdl with new active_phase + archived_phases entry"
    verify: "Parse rewritten kdl, confirm archive_offset points to step_1's appended block"
    rollback: "If verify fails, truncate plan-archive.md back to pre-append size, abort"

  step_3_plan_truncate:
    action: "Rewrite .workflow/plan.md without the rotated phase section"
    verify: "Re-read plan.md, confirm rotated phase absent and active_phase from meta present"
    rollback: |
      1. Restore plan.md from the archive-appended block
      2. Revert plan-meta.kdl to prior contents
      3. Truncate plan-archive.md to pre-append size
      4. Surface mid-write failure to loop state as an `errors[]` entry

  invariant: "archive write FIRST, plan truncate LAST. Never reverse."
```

**Why this order:** A crash after step 1 leaves a duplicate phase (recoverable via dedup). A crash after step 3 with steps 1–2 incomplete loses the phase. Always write the durable copy before mutating the working copy.

## Driver Read Discipline (full)

```yaml
plan_read_rules:
  loop_driver_default:
    reads: ".workflow/plan.md (active slice only)"
    never: "Reads plan-archive.md during normal iteration"

  archive_access:
    when: "Explicit retrospective, debugging, or rollback investigation"
    how: "Operator (or explicit subagent prompt) reads plan-archive.md by name"
    never: "Auto-include archive in executor/reviewer prompts"

  reviewer_prompts:
    must_reference: "active phase only (.workflow/plan.md)"
    must_not_reference: "completed phases or full plan history"
    rationale: "Reviewer anchoring on prior attempts drifts judgment from current spec"

  meta_consultation:
    when: "Driver needs active phase id, checkpoint state, or rotation history"
    read: ".workflow/plan-meta.kdl"
    do_not: "Parse plan-archive.md for state queries — meta has the pointers"
```

## Recovery

If `plan.md` is corrupted or lost mid-rotation:
1. Read `plan-meta.kdl` for `active_phase` id and `archived_phases[].archive_offset`
2. Reconstruct active slice; archived phases recoverable from `plan-archive.md` at recorded offsets

Archive is the durable record. Plan.md is a working slice — its loss is a rebuild trigger, not catastrophic data loss.

## Loop Iteration Example (context isolation)

展示上下文隔離的具體示例：

```yaml
main_loop_execution:

  task_1_first_attempt:
    - action: "Spawn workflow:task-executor subagent"
      context: "FRESH - no prior state"
      prompt: "Execute task-1: Setup database schema"
    - wait: "Subagent completes (returns failure)"
    - result: "Failed at testing stage - missing migration"
    - decision: "Retry with adjusted task"

  task_1_retry:
    - action: "Spawn NEW workflow:task-executor subagent"
      context: "FRESH - learns from loop state file, NOT subagent memory"
      prompt: "Execute task-1 (retry): Setup database schema + migration"
    - wait: "Subagent completes (returns success)"
    - result: "Completed successfully"
    - continue: "To task_2 with NEW subagent"

  task_2:
    - action: "Spawn NEW workflow:task-executor subagent"
      context: "FRESH - knows nothing about database schema implementation"
      prompt: "Execute task-2: Create API endpoints"
    - wait: "Subagent completes (returns success)"
    - result: "Completed successfully"
    - continue: "To task_3 with NEW subagent"

key_principles:
  isolation: "Each subagent is completely isolated"
  state_transfer: "Only via explicit loop state file, not context"
  main_loop_role: "Orchestrator, not executor"
  no_accumulation: "Main loop doesn't accumulate implementation details"
```

## Dart Fetch Discipline (if backed by Dart)

This loop drives off a local task-list file (`.workflow/tasks.md`), so it does not call `dart-query` directly. **If a fork or extension reads tasks from Dart instead**, apply the same compaction discipline as the dartai loop driver (`/dartai:start`):

```yaml
fetch_pattern:
  queue_sweep:
    detail_level: minimal           # id + title + status only
    rationale: "Driver only needs to pick the next task; full descriptions wait until dispatch"

  filter_at_source:
    use: DartQL via batch_update_tasks(dry_run: true)
    rationale: "Don't fetch-then-filter — push the WHERE clause to the API"

  full_fetch_point:
    when: "Just-in-time, before dispatching the executor subagent"
    detail_level: full              # description, acceptance criteria, relationships
    rationale: "Executor needs the whole task; everything else can stay minimal"

  config_caching:
    fetch: "Once at startup with include: ['dartboards', 'assignees', 'statuses']"
    invalidate_when:
      - "A dartboard is created/renamed via this loop (write-then-invalidate)"
      - "Every 50 iterations as a safety refresh"
      - "User says 'refresh config'"
    never: "Don't call get_config per-iteration or per-task"

  bulk_status_flips:
    use: batch_update_tasks
    when: "3+ tasks need the same status change"
    rationale: "Single API call beats N sequential update_task calls"
```

See `dartai:dart-query-reference` and `dartai:task-filtering` skills for parameter details.

## Task List Format (full)

```markdown
# Task List

## Task 1: [Title]
**Priority:** High|Medium|Low
**Scope:** [context-sized — ~5 files typical, judged by context cost not count]
**Description:** Clear, actionable description

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Context:** Any additional context needed

---

## Task 2: [Title]
...
```

## Loop State Schema (full)

`.workflow/loop-state.json`:

```json
{
  "loop_id": "unique-id",
  "started_at": "ISO timestamp",
  "task_source": "path/to/tasks.md",
  "status": "running",
  "current_task_index": 0,
  "tasks": [
    {
      "id": "task-1",
      "title": "...",
      "status": "pending|in_progress|completed|failed",
      "started_at": null,
      "completed_at": null,
      "subagent_id": null,
      "iterations": 0,
      "adjustments": []
    }
  ],
  "stats": {
    "total_tasks": 0,
    "completed": 0,
    "failed": 0,
    "total_iterations": 0,
    "total_adjustments": 0
  }
}
```

## Status Reporting Template

每次迭代後顯示進度：

```
Ralph Wiggum Workflow Loop
==========================
Loop ID: abc123
Status: running

Progress: [X] of [Y] tasks
Current: Task 3 - Add user authentication

Completed:
[done] Task 1: Setup database (2 iterations, 1 adjustment)
[done] Task 2: Create API endpoints (1 iteration, 0 adjustments)

In Progress:
> Task 3: Add user authentication (iteration 1)

Pending:
  Task 4: Implement authorization
  Task 5: Add logging

Stats:
- Total iterations: 3
- Total adjustments: 1
- Time elapsed: 45m 23s
- Avg time per task: 15m 7s
```
