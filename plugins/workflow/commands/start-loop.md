---
name: start-loop
description: Start an adversarial Ralph Wiggum loop for general task automation
argument-hint: "[task-list-file] [--loop=quality|security|refactor|test]"
---

# Start Ralph Wiggum Adversarial Loop

Start a continuous adversarial cooperation loop that processes tasks with clean context isolation and multi-stage verification.

## Core Principles

### Context Hygiene (CRITICAL)
```yaml
context_management:
  rule: "Each loop iteration MUST run in a fresh subagent"
  why: "Prevents context pollution and accumulated confusion"
  how: "Main loop orchestrates, spawns new subagent per iteration"
  never: "Reuse subagent context across iterations"
```

### Adversarial Cooperation Model
```yaml
roles:
  implementer:
    responsibility: "Execute tasks following instructions"
    mindset: "Make it work correctly"

  verifier:
    responsibility: "Challenge implementation to find flaws"
    mindset: "Break it, find edge cases, question assumptions"

  adjuster:
    responsibility: "Update plans based on discoveries"
    mindset: "Learn and improve iteratively"
```

## Process

### 1. Load Task List

If task list file provided as argument, use it. Otherwise check for:
1. `.claude/workflow-tasks.md` (default location)
2. `TASKS.md` in current directory
3. Interactive creation mode

**Task list format:**
```markdown
# Task List

## Task 1: [Title]
**Priority:** High|Medium|Low
**Scope:** [max 5 files]
**Description:** Clear, actionable description

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Context:** Any additional context needed

---

## Task 2: [Title]
...
```

### 2. Select Loop Type

If `--loop` argument provided, use it. Otherwise default to `quality`.

**Available loops:**
- **quality**: Full implementation with adversarial verification (default)
- **security**: Security-focused audit with OWASP patterns
- **refactor**: Safe refactoring with behavior preservation
- **test**: Test coverage with mutation testing

### 3. Initialize Loop State

Create loop state file: `.claude/workflow-loop-state.json`

```json
{
  "loop_id": "unique-id",
  "started_at": "ISO timestamp",
  "loop_type": "quality|security|refactor|test",
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

### 4. Execute Adversarial Loop

**CRITICAL: Each task MUST run in a fresh subagent for clean context.**

For each task in list:

#### 4.1 Context Validation Check

Before spawning subagent, verify:
```yaml
pre_spawn_checks:
  - "Task is context-sized (max 5 files)"
  - "Clear acceptance criteria exist"
  - "Previous subagent has terminated (no context leakage)"
  - "Loop state is persisted to disk"
```

#### 4.2 Spawn Fresh Task Executor Subagent

**Pattern (MANDATORY):**
```yaml
subagent_execution:
  tool: Task
  subagent_type: "workflow:task-executor"
  description: "Execute task: [short title]"

  prompt: |
    Execute task from workflow loop.

    Loop ID: [loop-id]
    Task ID: [task-id]
    Task Index: [X of Y]
    Loop Type: [quality|security|refactor|test]

    Task Details:
    Title: [title]
    Priority: [priority]
    Scope: [scope]

    Description:
    [full description]

    Acceptance Criteria:
    [criteria list]

    Context:
    [additional context]

    IMPORTANT:
    - Use the [loop-type] adversarial skill
    - Report success/failure with full details
    - Update loop state file on completion
    - This is a FRESH context - no prior task memory
```

**Example:**
```
Task tool call:
  subagent_type: "workflow:task-executor"
  description: "Execute task: Add user authentication"
  prompt: "Execute task task-1 from workflow loop loop-abc123..."
```

#### 4.3 Wait for Subagent Completion

The subagent will:
1. Execute the selected adversarial loop skill
2. Track progress internally
3. Return success or failure with detailed report
4. Update `.claude/workflow-loop-state.json` before terminating

**Main loop waits synchronously - NO parallel task execution.**

#### 4.4 Process Subagent Result

After SubagentStop hook fires:

**On Success:**
```yaml
actions:
  - "Read subagent completion report from loop state file"
  - "Log completion summary"
  - "Mark task as completed with timestamp"
  - "Continue to NEXT task with NEW subagent (fresh context)"
```

**On Failure:**
```yaml
actions:
  - "Read subagent failure report from loop state file"
  - "Log which stage failed and why"
  - "Mark task as failed"
  - "Decide: retry, skip, or stop loop"
  - "If retry: spawn NEW subagent (still fresh context)"
```

**CRITICAL: Never resume or reuse subagent - always spawn fresh.**

#### 4.5 Context Barrier

Between tasks, the main loop:
```yaml
context_barrier:
  persists:
    - "Loop orchestration state (which tasks done)"
    - "Task completion statistics"
    - "Loop configuration (type, source file)"

  discards:
    - "ALL task-specific implementation details"
    - "File contents from previous task"
    - "Code changes from previous task"
    - "Error messages from previous task"

  principle: "Main loop is STATELESS executor, not context accumulator"
```

### 5. Loop Control

The loop continues until:
- All tasks completed successfully
- A task fails and user chooses to stop
- User says "stop loop", "cancel", or "pause"
- Session ends
- Critical security issue found (immediate stop)

**User can always interrupt:**
- "stop the loop"
- "pause execution"
- "skip current task"
- "/workflow:stop-loop"

### 6. Status Reporting

Display progress after each iteration:
```
Ralph Wiggum Workflow Loop
==========================
Loop ID: abc123
Loop Type: quality
Status: running

Progress: [X] of [Y] tasks
Current: Task 3 - Add user authentication

Completed:
✓ Task 1: Setup database (2 iterations, 1 adjustment)
✓ Task 2: Create API endpoints (1 iteration, 0 adjustments)

In Progress:
→ Task 3: Add user authentication (iteration 1)

Pending:
  Task 4: Implement authorization
  Task 5: Add logging

Stats:
- Total iterations: 3
- Total adjustments: 1
- Time elapsed: 45m 23s
- Avg time per task: 15m 7s
```

## Loop Iteration Example

Concrete example showing context isolation:

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

## Context-Sized Task Requirements

Every task MUST be:
```yaml
context_sized_task:
  max_files: 5
  max_scope: "Single feature or fix"
  clear_acceptance: true
  bounded_changes: true
  no_dependencies: "Can execute independently"

  if_too_large:
    action: "Split into multiple tasks"
    reason: "Keeps each iteration within context limits"
```

## Usage Examples

```bash
# Start with default quality loop
/workflow:start-loop

# Start with custom task list
/workflow:start-loop my-tasks.md

# Start security audit loop
/workflow:start-loop --loop=security

# Start refactor loop with specific file
/workflow:start-loop refactor-tasks.md --loop=refactor
```

## Integration with Loop State File

All state is persisted to `.claude/workflow-loop-state.json`:
- Main loop reads/writes orchestration state
- Subagents update task-specific state before termination
- Hooks track iterations and adjustments
- Status command reads this file for reporting

This enables:
- Resume after interruption
- Parallel status monitoring
- Historical analysis
- Audit trail

## Stopping the Loop

Say any of:
- "stop the loop"
- "cancel workflow"
- "pause execution"
- "/workflow:stop-loop"

Or for immediate stop:
- "security critical" (on critical vulnerability)
- "abort" (emergency stop)
