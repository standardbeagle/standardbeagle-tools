---
name: start
description: Start the Ralph Wiggum adversarial cooperation loop on a dartboard with plan adjustment
argument-hint: "[dartboard-name] [--loop=quality|test|security|refactor]"
---

# Start Ralph Wiggum Adversarial Loop

Start the continuous task execution loop that processes tasks from a Dart dartboard using adversarial cooperation patterns with plan adjustment at each phase.

## Adversarial Cooperation Model

This loop uses adversarial cooperation where:
- **Implementer role**: Executes tasks following positive/negative instructions
- **Verifier role**: Challenges implementations to find flaws
- **Plan adjuster**: Updates tasks based on discoveries at each phase

## Process

### 1. Determine Target Dartboard

If dartboard name provided as argument, use it and save as last used. Otherwise:

**Priority order for dartboard selection:**

1. **Check last used dartboard** from `.claude/dartai.local.md` frontmatter (`last_dartboard` field)
2. **Check default dartboard** from `.claude/dartai.local.md` frontmatter (`default_dartboard` field)
3. **Try directory name matching** - match current directory name to a dartboard
4. **Interactive selection** - ask user to select from available dartboards

**To read the config file:**
```
Read .claude/dartai.local.md and parse YAML frontmatter between --- markers
Look for: last_dartboard, default_dartboard fields
```

**If no dartboard found in config, fetch available dartboards:**
```
Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
  mcp_name: "dart"
  tool_name: "get_config"
  parameters: {}
```

**After selecting a dartboard, save it as last used:**
```python
# Update .claude/dartai.local.md frontmatter with:
# last_dartboard: "Selected/Dartboard"
# last_dartboard_used_at: "ISO timestamp"
```

### 2. Select Loop Type

If `--loop` argument provided, use it. Otherwise default to `quality` loop.

Available loops:
- **quality**: Full implementation quality verification (adversarial-quality-loop)
- **test**: Test coverage and quality verification (adversarial-test-loop)
- **security**: Security audit with OWASP patterns (adversarial-security-loop)
- **refactor**: Safe refactoring with behavior verification (adversarial-refactor-loop)

### 3. Fetch Active Tasks

Query Dart for tasks in the dartboard using SLOP:

```
Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
  mcp_name: "dart"
  tool_name: "list_tasks"
  parameters: {
    "dartboard": "[selected dartboard]",
    "is_completed": false,
    "limit": 20
  }
```

Filter results by status "To-do" or "In Progress".

### 4. Initialize Loop State

Track:
- Current dartboard
- Selected loop type
- Tasks queue (ordered by priority)
- Completed tasks count
- Failed tasks count
- Plan adjustments made
- Start time

### 5. Execute Adversarial Loop

**CRITICAL: Each task MUST run in a subagent for fresh context.**

For each task in queue:

#### 5.1 Spawn Task Executor Subagent

**Each task iteration MUST use the Task tool with subagent_type="dartai:task-executor":**

```yaml
subagent_execution:
  why: "Fresh context prevents accumulated state/confusion"
  how: |
    Use the Task tool with:
      subagent_type: "dartai:task-executor"
      prompt: |
        Execute task [TASK_ID] from dartboard [DARTBOARD_NAME].

        Task Details:
        - Title: [title]
        - Description: [description]
        - Acceptance Criteria: [criteria]

        Loop Type: [quality|test|security|refactor]

        Use the [LOOP_TYPE] adversarial loop pattern.
        Report success or failure with full details.

  result_handling:
    on_success: "Mark complete, continue to next task"
    on_failure: "Log failure, stop loop"
```

**Example Task tool invocation:**
```
Task tool call:
  subagent_type: "dartai:task-executor"
  description: "Execute task: [short task title]"
  prompt: "Execute task QiXCNniu7OQY from dartboard Personal/project-name..."
```

#### 5.2 Task Sizing Check (done by subagent)
The task-executor subagent will verify task is context-sized:
- Maximum 3-5 files per task
- Clear acceptance criteria
- Bounded scope

**If task too large**: Subagent will request split and return

#### 5.3 Execute Selected Loop (done by subagent)

**Quality Loop** (adversarial-quality-loop skill):
```yaml
phases:
  1_implementation_review:
    - Understand task scope
    - Identify all files
    - Create verification checklist
    - PLAN ADJUSTMENT: Update if scope changes

  2_adversarial_implementation:
    - Implement with positive instructions
    - Self-adversarial review
    - PLAN ADJUSTMENT: Add fix tasks if issues found

  3_adversarial_verification:
    - External code review (verifier role)
    - Challenge every assumption
    - PLAN ADJUSTMENT: Add fixes for findings

  4_quality_gates:
    - Run linting, testing, coverage
    - PLAN ADJUSTMENT: Add fixes for failures

  5_final_validation:
    - Verify acceptance criteria met
    - Complete or escalate
```

**Test Loop** (adversarial-test-loop skill):
```yaml
phases:
  1_test_planning: "Analyze coverage needs"
  2_happy_path: "50-60% of tests"
  3_edge_cases: "25-30% of tests"
  4_adversarial: "10-15% of tests"
  5_quality_verification: "Mutation testing"
  6_regression: "Bug regression tests"
  # PLAN ADJUSTMENT after each phase
```

**Security Loop** (adversarial-security-loop skill):
```yaml
phases:
  1_threat_modeling: "Map attack surface"
  2_injection: "OWASP A03 testing"
  3_auth: "OWASP A01, A07 testing"
  4_data_protection: "OWASP A02, A04 testing"
  5_configuration: "OWASP A05 testing"
  6_report: "Security findings"
  # PLAN ADJUSTMENT after each phase
  # STOP on critical findings
```

**Refactor Loop** (adversarial-refactor-loop skill):
```yaml
phases:
  1_analysis: "Identify refactoring scope"
  2_baseline: "Establish behavior baseline"
  3_incremental: "Execute atomic refactoring steps"
  4_verification: "Adversarial behavior comparison"
  5_validation: "Final quality checks"
  6_report: "Refactoring results"
  # PLAN ADJUSTMENT after each phase and each step
```

#### 5.4 Handle Subagent Result

After the task-executor subagent returns:

**On Success:**
- The subagent already updated task to "Done" via Dart MCP
- Log the completion summary from subagent result
- Continue to next task with a NEW subagent (fresh context)

**On Failure:**
- The subagent already added failure comment
- Log which phase failed from subagent result
- Create follow-up fix tasks if needed
- STOP loop

**IMPORTANT: Never reuse subagent context - each task gets fresh execution.**

#### 5.5 Documentation Update (optional)

If significant changes were made, spawn doc-updater agent:
```
Task tool call:
  subagent_type: "dartai:doc-updater"
  description: "Update docs for completed task"
  prompt: "Update documentation for task [TASK_ID]..."
```

### 6. Plan Adjustment Protocol

At each plan adjustment point:

```yaml
plan_adjustment:
  trigger: "End of each phase or major discovery"

  actions:
    - Review what was discovered
    - Identify new tasks needed
    - Re-prioritize existing tasks
    - Update task descriptions
    - Document adjustment reason

  record:
    - adjustment_type: "add|modify|remove|reorder"
    - reason: "What triggered adjustment"
    - tasks_affected: "List of task IDs"
```

### 7. Loop Control

**Subagent Execution Pattern:**
```yaml
loop_execution:
  for_each_task:
    action: "Spawn new dartai:task-executor subagent"
    context: "Fresh - no accumulated state from previous tasks"
    isolation: "Each task runs independently"

  between_tasks:
    action: "Main loop orchestrates, spawns next subagent"
    state: "Only loop metadata persists (completed count, etc.)"

  never_do:
    - "Execute multiple tasks in same subagent"
    - "Pass accumulated context between task subagents"
    - "Resume previous subagent for new task"
```

The loop continues until:
- All tasks completed successfully
- A task fails (stops with report)
- Critical security issue found (immediate stop)
- User says "stop", "cancel", or "pause"
- Session ends

### 8. Status Reporting

Display ongoing progress:
```
Ralph Wiggum Adversarial Loop
=============================
Dartboard: [name]
Loop Type: [quality|test|security|refactor]
Progress: [X] of [Y] tasks

Current Task: [title]
Current Phase: [phase name]

Completed Tasks:
- Task 1 (3 adjustments)
- Task 2 (1 adjustment)

Plan Adjustments This Session: [count]
Time elapsed: [duration]
```

## Loop Iteration Example

Here's a concrete example of how the loop executes:

```yaml
main_loop_iteration:
  task_1:
    - action: "Spawn dartai:task-executor subagent"
      prompt: "Execute task ABC123 from dartboard Project/tasks using quality loop"
    - wait: "Subagent completes (success or failure)"
    - result: "Task completed successfully"
    - continue: "To task_2 with NEW subagent"

  task_2:
    - action: "Spawn NEW dartai:task-executor subagent"  # Fresh context!
      prompt: "Execute task DEF456 from dartboard Project/tasks using quality loop"
    - wait: "Subagent completes"
    - result: "Task failed at testing phase"
    - stop: "Loop ends, report failure"

key_points:
  - "Each Task tool call creates isolated execution"
  - "Subagent has no memory of previous tasks"
  - "Main loop only tracks: which tasks done, which failed"
  - "All detailed work happens inside subagent"
```

## Usage Examples

```bash
# Start quality loop (default)
/dartai:start

# Start on specific dartboard
/dartai:start Personal/standardbeagle-tools

# Start security audit loop
/dartai:start "My Project" --loop=security

# Start test coverage loop
/dartai:start --loop=test
```

## Context-Sized Task Requirements

Every task must be:
```yaml
context_sized_task:
  scope:
    max_files: 5
    clear_acceptance: true
    bounded_changes: true

  instructions:
    positive: "List of DO instructions"
    negative: "List of DO NOT instructions"

  verification:
    criteria: "Clear pass/fail conditions"
    evidence: "How to verify"
```

## Stopping the Loop

Say any of:
- "stop the loop"
- "cancel ralph wiggum"
- "pause execution"
- "/dartai:stop"

Or for immediate stop on security:
- "security critical" (when critical vulnerability found)
