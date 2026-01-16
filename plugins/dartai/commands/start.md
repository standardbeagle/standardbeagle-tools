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

### 4. Initialize Loop State in Dart

**Create a Loop Task** as the parent for all loop operations:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart"
  tool_name: "create_task"
  parameters:
    item:
      title: "🔄 Loop: [loop-type] on [dartboard-name]"
      description: |
        ## Ralph Wiggum Loop Session

        **Loop Type:** [quality|test|security|refactor]
        **Dartboard:** [dartboard-name]
        **Started:** [ISO timestamp]
        **Status:** Running

        ### Configuration
        - Max iterations per task: 3
        - Stop on critical security: true

        ### Progress
        - Tasks processed: 0
        - Tasks completed: 0
        - Tasks failed: 0
        - Replans: 0
      dartboard: "[dartboard-name]"
      status: "In Progress"
      priority: "High"
      tags: ["loop-session", "loop-active", "loop-type:[type]"]
```

Save the returned `loop_task_id` for linking subtasks.

### Loop-Specific Tags

Use these tags to track loop state on tasks:

| Tag | Meaning |
|-----|---------|
| `loop-session` | This is the parent loop task |
| `loop-active` | Loop is currently running |
| `loop-task` | Task is being processed by loop |
| `loop-iteration:N` | Current iteration number |
| `loop-phase:X` | Current phase (implementation, testing, etc.) |
| `loop-blocked` | Task is blocked, needs replan |
| `loop-replanned` | Task was replanned |
| `loop-complete` | Loop finished |

### Architecture: Loop Task vs Work Tasks

**IMPORTANT:** The Loop task tracks Claude subagent execution state. It does NOT become a parent of existing work tasks.

```
Dart Dartboard: Personal/fit-track
├── Task A: "Add user auth"          ← Existing work (keeps its structure)
│   └── Subtask A1: "Setup JWT"      ← Existing subtask (unchanged)
├── Task B: "Fix login"              ← Existing work
├── Task C: "Add logout"             ← Existing work
│
└── 🔄 Loop: quality on fit-track    ← Loop tracking task (NEW)
    ├── 📊 Iter 1: Task A            ← Tracks Claude subagent #1
    ├── 📊 Iter 2: Task B (failed)   ← Tracks Claude subagent #2
    └── 🔧 Fix: Test failure         ← Fix task (created by loop)
```

### Tag Work Tasks (Don't Reparent)

Work tasks get TAGGED to associate with the loop, but keep their original parent/structure:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart"
  tool_name: "update_task"
  parameters:
    id: "[work-task-id]"
    tags: ["loop-task", "loop-id:[loop_task_id]", "loop-iteration:1"]
    # NOTE: Do NOT set parentId - work task keeps its original structure
```

### Create Iteration Tracking Subtasks

For each Claude subagent execution, create a tracking subtask UNDER the loop task:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart"
  tool_name: "create_task"
  parameters:
    item:
      title: "📊 Iter [N]: [work-task-title]"
      description: |
        ## Iteration Tracking

        **Work Task:** [work-task-title] ([work-task-id])
        **Claude Subagent:** dartai:task-executor
        **Started:** [timestamp]
        **Status:** In Progress
      dartboard: "[dartboard-name]"
      parentId: "[loop_task_id]"  # Subtask of LOOP task
      status: "In Progress"
      tags: ["loop-iteration", "tracks:[work-task-id]"]
```

Update this iteration subtask when the subagent completes:
```yaml
# On success
update_task:
  id: "[iteration-subtask-id]"
  title: "📊 Iter [N]: [work-task-title] ✅"
  status: "Done"

# On failure
update_task:
  id: "[iteration-subtask-id]"
  title: "📊 Iter [N]: [work-task-title] ❌"
  status: "Done"  # Iteration is done, even if work task failed
```

### Loop Progress Updates

Update the loop task description with progress after each iteration:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart"
  tool_name: "add_task_comment"
  parameters:
    taskId: "[loop_task_id]"
    text: |
      ## Iteration [N] Complete

      **Task:** [task-title]
      **Result:** [success|failed|blocked]
      **Phase:** [phase-name]
      **Duration:** [time]

      **Next Action:** [continue|replan|stop]
```

### 5. Execute Adversarial Loop

**CRITICAL: Each task MUST run in a subagent for fresh context.**

For each task in queue:

#### 5.1 Tag Task as Loop-Active

Before spawning subagent, tag the task:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart"
  tool_name: "update_task"
  parameters:
    id: "[task-id]"
    status: "In Progress"
    tags: ["loop-task", "loop-iteration:[N]", "loop-phase:starting"]
```

#### 5.2 Spawn Task Executor Subagent

**Each task iteration MUST use the Task tool with subagent_type="dartai:task-executor":**

```yaml
subagent_execution:
  why: "Fresh context prevents accumulated state/confusion"
  how: |
    Use the Task tool with:
      subagent_type: "dartai:task-executor"
      prompt: |
        Execute task [TASK_ID] from dartboard [DARTBOARD_NAME].

        ## Loop Context
        Loop Task ID: [loop_task_id]
        Loop Type: [quality|test|security|refactor]
        Iteration: [N]

        ## Task Details
        - Title: [title]
        - Description: [description]
        - Acceptance Criteria: [criteria]

        ## Instructions
        1. Use the [LOOP_TYPE] adversarial loop pattern
        2. Update task tags with phase progress: loop-phase:[phase]
        3. On completion: mark task Done, add summary comment
        4. On failure: leave In Progress, add failure comment with:
           - Which phase failed
           - Recommended fix (create subtask if needed)
           - What tasks are blocked
        5. Add completion comment to loop task [loop_task_id]

  result_handling:
    on_success: "Task marked Done in Dart, continue to next"
    on_failure: "Task stays In Progress with failure comment, replan"
```

**Example Task tool invocation:**
```
Task tool call:
  subagent_type: "dartai:task-executor"
  description: "Execute task: Add user authentication"
  prompt: |
    Execute task QiXCNniu7OQY from dartboard Personal/project-name.

    ## Loop Context
    Loop Task ID: abc123def456
    Loop Type: quality
    Iteration: 1

    ## Task Details
    - Title: Add user authentication
    - Description: Implement JWT-based auth...
    ...
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

#### 5.4 Handle Subagent Result (SubagentStop Hook Fires Here)

After the task-executor subagent returns, the `SubagentStop` hook fires and updates `.claude/dartai-loop-state.json`.

**Dart is the source of truth for task state.** After SubagentStop fires:

1. **Query Dart for updated task list:**
   ```yaml
   tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
   params:
     mcp_name: "dart"
     tool_name: "list_tasks"
     parameters:
       dartboard: "[dartboard]"
       is_completed: false
       limit: 20
   ```

2. **Check task statuses in Dart:**
   - If task marked "Done" → success, get next task
   - If task still "In Progress" with failure comment → replan
   - Read failure details from task comments

3. **Local loop file is just metrics:**
   ```python
   # .claude/dartai-loop.json - orchestration only, not task state
   {
     "iterations": N,
     "last_iteration_at": "...",
     "started_at": "..."
   }
   ```

**On Success:**
- The subagent already updated task to "Done" via Dart MCP
- Log the completion summary from subagent result
- **CONTINUE to next task** with a NEW subagent (fresh context)

**On Failure (REPLAN, DO NOT STOP):**

1. **Read failure details from task comment**
2. **Tag task as blocked:**
   ```yaml
   tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
   params:
     mcp_name: "dart"
     tool_name: "update_task"
     parameters:
       id: "[task-id]"
       status: "Blocked"
       tags: ["loop-task", "loop-blocked", "loop-iteration:[N]"]
   ```

3. **Create fix task as subtask of LOOP task** (not the work task):
   ```yaml
   # Fix tasks are NEW work created by the loop, so they belong under the loop task
   tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
   params:
     mcp_name: "dart"
     tool_name: "create_task"
     parameters:
       item:
         title: "🔧 Fix: [issue from failure comment]"
         description: |
           ## Fix Task (Auto-created by Loop)

           **Blocked Work Task:** [task-title] ([task-id])
           **Failed Phase:** [phase]
           **Error:** [error details]

           ## Suggested Fix
           [recommendation from failure comment]

           ## Acceptance Criteria
           - [ ] Error resolved
           - [ ] Blocked work task can proceed
         dartboard: "[dartboard-name]"
         parentId: "[loop_task_id]"  # Subtask of LOOP, not work task
         status: "To-do"
         priority: "High"
         tags: ["loop-fix", "unblocks:[work-task-id]"]
   ```

   **Note:** Fix tasks are subtasks of the Loop task because:
   - They're generated by the loop (not pre-existing work)
   - They track loop remediation efforts
   - Work tasks keep their original structure

4. **Add replan comment to loop task:**
   ```yaml
   tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
   params:
     mcp_name: "dart"
     tool_name: "add_task_comment"
     parameters:
       taskId: "[loop_task_id]"
       text: |
         ## 🔄 Replan at Iteration [N]

         **Task Failed:** [task-title]
         **Phase:** [phase]
         **Action:** Created fix task [fix-task-id]
         **Next:** Processing fix task
   ```

5. **CONTINUE to fix task or next actionable task**

**Only STOP if:**
- All tasks completed (check Dart for remaining To-do/In Progress)
- User explicitly says "stop"
- Critical security vulnerability found (tag: `security-critical`)
- No remaining tasks can be executed (all Blocked with no fix tasks)

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

**The loop NEVER stops on task failure. It replans and continues.**

The loop continues until:
- All tasks completed successfully
- Critical security issue found (immediate stop)
- User says "stop", "cancel", or "pause"
- No actionable tasks remain (all blocked on external dependencies)
- Session ends

**On task failure, the loop:**
1. Logs the failure details
2. Creates fix tasks if the failure is fixable
3. Moves to the next actionable task
4. Reports progress: "Task X failed, created fix task, continuing with Task Y"

### 8. Loop Completion

When loop ends (all tasks done OR user stops OR critical issue):

**Mark loop task complete:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart"
  tool_name: "update_task"
  parameters:
    id: "[loop_task_id]"
    status: "Done"
    tags: ["loop-session", "loop-complete", "loop-type:[type]"]
```

**Add final summary comment:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart"
  tool_name: "add_task_comment"
  parameters:
    taskId: "[loop_task_id]"
    text: |
      ## 🏁 Loop Complete

      **Duration:** [total time]
      **Total Iterations:** [N]

      ### Results
      | Metric | Count |
      |--------|-------|
      | Tasks Completed | X |
      | Tasks Failed | Y |
      | Fix Tasks Created | Z |
      | Replans | W |

      ### Completed Tasks
      - ✅ [task-1-title]
      - ✅ [task-2-title]

      ### Blocked Tasks (if any)
      - ⚠️ [blocked-task-title] - [reason]

      ### Notes
      [Any important observations]
```

**Query for final state:**
```yaml
# Get all loop-related tasks for summary
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart"
  tool_name: "list_tasks"
  parameters:
    dartboard: "[dartboard-name]"
    tag: "loop-task"
```

### 9. Status Reporting

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

Here's a concrete example of how the loop executes with replanning:

```yaml
main_loop_iteration:
  task_1:
    - action: "Spawn dartai:task-executor subagent"
      prompt: "Execute task ABC123 from dartboard Project/tasks using quality loop"
    - wait: "Subagent completes (SubagentStop hook fires)"
    - result: "Task completed successfully"
    - continue: "To task_2 with NEW subagent"

  task_2:
    - action: "Spawn NEW dartai:task-executor subagent"  # Fresh context!
      prompt: "Execute task DEF456 from dartboard Project/tasks using quality loop"
    - wait: "Subagent completes (SubagentStop hook fires)"
    - result: "Task failed at testing phase"
    - replan: |
        1. Log: "Task DEF456 failed at testing phase"
        2. Create fix task: "Fix test failures in DEF456"
        3. Add fix task to queue with high priority
        4. Continue to task_3 (or fix task if it's next)

  task_3_or_fix:
    - action: "Spawn NEW dartai:task-executor subagent"  # Fresh context!
      prompt: "Execute next actionable task"
    - wait: "Subagent completes"
    - result: "Continue processing..."

key_points:
  - "Each Task tool call creates isolated execution"
  - "Subagent has no memory of previous tasks"
  - "SubagentStop hook updates .claude/dartai-loop-state.json"
  - "Main loop reads state file and decides next action"
  - "Failure triggers REPLAN, not STOP"
  - "Loop continues until all tasks done or user stops"
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
