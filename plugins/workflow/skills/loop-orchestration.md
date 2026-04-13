---
name: loop-orchestration
description: Main loop orchestration logic and state management patterns
---

# Loop Orchestration

Patterns for orchestrating adversarial loops with clean context management.

## Orchestrator Responsibilities

The main loop (running in primary agent) has ONLY these responsibilities:

```yaml
orchestrator_role:
  responsibilities:
    - "Maintain task queue"
    - "Spawn fresh subagents"
    - "Wait for subagent completion"
    - "Update loop state file"
    - "Report progress"
    - "Handle user commands (stop, pause, skip)"

  does_not:
    - "Execute tasks directly"
    - "Accumulate implementation context"
    - "Remember task details"
    - "Make task-specific decisions"
```

## State Machine

```yaml
loop_states:
  initializing:
    actions: ["Load tasks", "Validate", "Setup state file"]
    next: "running"

  running:
    actions: ["Spawn subagent", "Wait", "Process result"]
    next: "running|completed|stopped|failed"

  completed:
    actions: ["Generate summary", "Archive state"]
    terminal: true

  stopped:
    actions: ["Save checkpoint", "Generate summary"]
    terminal: true

  failed:
    actions: ["Log failure", "Generate report"]
    terminal: true
```

## Subagent Lifecycle Management

```yaml
lifecycle:
  spawn:
    tool: "Task"
    subagent_type: "workflow:task-executor"
    context: "FRESH - no accumulated state"
    input: "Task spec from state file"

  monitor:
    technique: "Synchronous wait (blocking)"
    why: "Ensures sequential execution, no race conditions"

  terminate:
    trigger: "Subagent returns result"
    hook: "SubagentStop fires"
    cleanup: "Context is garbage collected"

  never:
    - "Reuse subagent for multiple tasks"
    - "Pass context between subagents"
    - "Run subagents in parallel"
```

## Plan-Update Presentation Between Ticks

Between each tick (after a subagent returns, before the next spawn), read `.workflow/loop-state.json` for any `pending_plan_updates` written by the last task's review step.

```yaml
tick_transition:
  read: ".workflow/loop-state.json"
  extract: "pending_plan_updates[]"
  if_any:
    present_to_user: |
      The last task surfaced <N> plan-update proposals:

      <for each proposal>
        <title> (<trigger>, urgency:<urgency>)
      </for>

      Schedule any of these now? (default: no, they stay in backlog)
    default_answer: "no"
    on_accept:
      action: "Invoke dev-standards:grill-task on the accepted proposal, insert as next task"
    on_defer:
      action: "Leave in pending_plan_updates with urgency tag"
    on_reject:
      action: "Remove from pending_plan_updates, append fingerprint to .claude/refactor-rejects.txt"

never:
  - "Auto-accept proposals"
  - "Block next tick on proposal decisions"
```

The goal is to surface the backlog without interrupting focus. Default "no" keeps the loop moving.

## State File Protocol

Single source of truth: `.workflow/loop-state.json`

**Writers**:
- Main loop: Updates orchestration state
- Subagents: Update task-specific state before termination

**Readers**:
- Main loop: Reads to decide next action
- Subagents: Read task spec at spawn
- Status command: Reads for reporting
- Hooks: Read for metrics

**Locking**: File-based locking to prevent concurrent writes

## Error Recovery

```yaml
error_handling:
  subagent_timeout:
    after: "2 hours"
    action: "Kill subagent, mark task failed, continue or stop"

  subagent_crash:
    detection: "No result returned"
    action: "Mark task failed, log crash, decide retry"

  state_file_corruption:
    detection: "JSON parse error"
    action: "Restore from backup, log error, alert user"

  critical_security:
    detection: "Task marked security-critical failure"
    action: "Stop loop immediately, alert user"
```

## Progress Reporting

Report after each iteration:
```
Progress: [X of Y] ▰▰▰▰▰▰▱▱▱▱ 60%
Current: Task 3 - [title]
Status: [stage]
Time: 15m elapsed
```

## Usage Patterns

See `start-loop.md` for concrete implementation of this orchestration pattern.
