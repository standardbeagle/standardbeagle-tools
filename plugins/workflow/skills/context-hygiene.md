---
name: context-hygiene
description: Context management and subagent isolation principles for clean execution
---

# Context Hygiene and Subagent Isolation

Principles and patterns for maintaining clean context throughout workflow loops.

## Core Principle

**Every loop iteration MUST execute in a fresh subagent with clean context.**

## Why Context Hygiene Matters

```yaml
problems_without_hygiene:
  context_pollution:
    - "Accumulated state from previous tasks confuses decisions"
    - "Implementation details leak across task boundaries"
    - "Error patterns repeat due to learned bad habits"

  context_overflow:
    - "Token usage grows unbounded across iterations"
    - "Relevant context gets buried in irrelevant details"
    - "Performance degrades over time"

  semantic_drift:
    - "Meaning of terms changes across long conversations"
    - "Assumptions accumulate without validation"
    - "Focus shifts away from original goals"
```

## Subagent Isolation Pattern

### Main Loop (Orchestrator)

**Role**: State machine that dispatches tasks to fresh subagents

**Persists:**
- Loop configuration (type, source)
- Task queue and ordering
- Completion statistics
- Iteration counts

**Discards:**
- ALL task-specific implementation details
- File contents from previous iterations
- Error messages and stack traces
- Code changes and diffs

**Implementation:**
```yaml
main_loop:
  state_file: ".claude/workflow-loop-state.json"

  loop_logic: |
    while tasks_remaining:
      task = next_task()
      subagent = spawn_fresh_executor(task)
      result = await subagent.complete()
      update_state(task, result)
      # Context barrier: discard subagent details

  never_accumulates:
    - "Task implementation knowledge"
    - "File-specific details"
    - "Previous task outcomes beyond success/failure"
```

### Task Executor Subagent

**Role**: Execute single task from scratch with clean context

**Receives:**
- Task specification from loop state file
- Loop type (which skill to use)
- Acceptance criteria
- Fresh codebase context (reads files itself)

**Returns:**
- Success or failure
- Completion report (written to state file)
- Adjustments made (written to state file)

**Lifetime:**
```yaml
subagent_lifecycle:
  spawn: "Main loop creates fresh subagent via Task tool"
  execute: "Subagent runs adversarial loop skill"
  terminate: "Subagent completes and exits"
  hook: "SubagentStop hook captures metrics"

duration: "Single task only (typically 10-30 minutes)"

key_point: "Subagent terminates completely, context is garbage collected"
```

## Context Barriers

Explicit barriers prevent context leakage:

### Between Tasks
```yaml
barrier_1_between_tasks:
  location: "After subagent termination, before next spawn"

  enforced_by: "Main loop only reads state file, not subagent memory"

  what_transfers:
    allowed:
      - "Task completed: yes/no"
      - "Iterations count: number"
      - "Adjustments: list of changes to task list"

    blocked:
      - "How task was implemented"
      - "What files were changed"
      - "What code was written"
      - "What errors occurred"
```

### Between Stages (Within Task)
```yaml
barrier_2_between_stages:
  location: "Between adversarial loop stages"

  enforced_by: "Explicit checkpoint and context reset points"

  technique: |
    1. Write stage output to file
    2. Explicitly forget details
    3. Read next stage input from file
    4. Proceed with only necessary context
```

## State Transfer via Files

**ONLY mechanism for transferring state:**

```yaml
state_file_protocol:
  file: ".claude/workflow-loop-state.json"

  writer: "Subagent before termination"
  reader: "Main loop after subagent terminates"

  content_example:
    task_result:
      task_id: "task-3"
      status: "completed"
      started_at: "ISO timestamp"
      completed_at: "ISO timestamp"
      iterations: 2
      adjustments:
        - type: "added_file"
          description: "Added validation helper"
        - type: "modified_criteria"
          description: "Clarified security requirement"
      completion_report:
        summary: "Added user authentication with JWT"
        acceptance_met: true
        verification_passed: true
        tests_added: 5
        tests_passed: 5

key_principle: "State file is CONTRACT, not implementation details"
```

## Verification Checklist

Before spawning next subagent:

```yaml
pre_spawn_checklist:
  - name: "Previous subagent terminated"
    check: "SubagentStop hook fired"
    why: "Ensures clean context boundary"

  - name: "State file updated"
    check: "task.completed_at is set"
    why: "Ensures results are persisted"

  - name: "Main loop context is clean"
    check: "No accumulated file contents or code"
    why: "Prevents context pollution"

  - name: "Task is context-sized"
    check: "Task scope <= 5 files"
    why: "Ensures subagent can complete within limits"

all_must_pass: true
```

## Anti-Patterns to Avoid

### ❌ Context Accumulation
```yaml
bad_pattern_1:
  what: "Main loop remembers implementation details"
  example: "Task 1 changed auth.ts to use JWT, so Task 2 assumes JWT"
  why_bad: "Creates implicit dependencies, breaks isolation"

  instead: "Each task reads codebase fresh, makes own decisions"
```

### ❌ Subagent Reuse
```yaml
bad_pattern_2:
  what: "Reusing same subagent for multiple tasks"
  example: "Keep subagent alive, feed it next task"
  why_bad: "Context accumulates, confusion grows, token usage explodes"

  instead: "Terminate subagent, spawn fresh for next task"
```

### ❌ Implicit State Transfer
```yaml
bad_pattern_3:
  what: "Relying on conversation memory"
  example: "Subagent mentions 'as we did in last task'"
  why_bad: "No last task in fresh context - breaks isolation"

  instead: "All context in task specification or codebase files"
```

### ❌ Shared Mutable State
```yaml
bad_pattern_4:
  what: "Multiple subagents writing to same state"
  example: "Parallel tasks updating shared config"
  why_bad: "Race conditions, lost updates, chaos"

  instead: "Sequential execution, single writer per state file"
```

## Best Practices

### ✓ Explicit Context Boundaries
```yaml
good_practice_1:
  technique: "Clearly mark where context resets"
  example: "// Context barrier: previous task details discarded"
  benefit: "Makes isolation visible and intentional"
```

### ✓ Minimal State Transfer
```yaml
good_practice_2:
  technique: "Transfer only essential state via state file"
  example: "Pass success/failure + metrics, not implementation"
  benefit: "Prevents accidental context leakage"
```

### ✓ Fresh File Reads
```yaml
good_practice_3:
  technique: "Each subagent reads files itself"
  example: "Don't pass file contents, pass file paths"
  benefit: "Ensures latest state, reduces context size"
```

### ✓ Context-Sized Tasks
```yaml
good_practice_4:
  technique: "Keep tasks small (1-5 files)"
  example: "Split large features into independent tasks"
  benefit: "Fits in subagent context, completes faster"
```

## Monitoring Context Hygiene

Track these metrics:

```yaml
hygiene_metrics:
  subagent_lifetime:
    target: "10-30 minutes"
    alarm: "> 60 minutes suggests context overflow"

  context_size:
    target: "< 50k tokens per subagent"
    alarm: "> 100k tokens suggests accumulation"

  state_file_size:
    target: "< 10kb per task"
    alarm: "> 50kb suggests over-sharing"

  subagent_spawns:
    target: "1 per task (plus retries)"
    alarm: "Multiple spawns without termination"

  termination_rate:
    target: "100% clean termination"
    alarm: "Subagents timing out or hanging"
```

## Implementation Reference

See `start-loop.md` command for concrete implementation of:
- Subagent spawning pattern
- Context barrier enforcement
- State file protocol
- Verification checklist

See `track-loop-iteration.sh` hook script for:
- SubagentStop tracking
- Context hygiene verification
- Metrics collection
