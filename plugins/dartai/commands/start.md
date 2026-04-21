---
name: start
description: Start the Ralph Wiggum adversarial cooperation loop on a dartboard with plan adjustment. 在看板上啟動Ralph Wiggum對抗合作循環，含計劃調整。 Use when: start execution loop, run dartboard tasks, begin adversarial loop, automate task execution, process task queue
argument-hint: "[dartboard-name]"
---

# Start Ralph Wiggum Adversarial Loop

啟動持續任務執行循環，以對抗合作模式處理Dart看板任務，各階段含計劃調整。

## Adversarial Cooperation Model

此循環使用對抗合作：
- **Implementer role**: 遵循正面/負面指令執行任務
- **Verifier role**: 挑戰實現以發現缺陷
- **Plan adjuster**: 依各階段發現更新任務

## Process

### 1. Determine Target Dartboard

If dartboard name provided as argument, use it and save as last used. Otherwise:

**Priority order for dartboard selection:**

1. **Check last used dartboard** from `.dartai/config.local.md` frontmatter (`last_dartboard` field)
2. **Check default dartboard** from `.dartai/config.local.md` frontmatter (`default_dartboard` field)
3. **Try directory name matching** - match current directory name to a dartboard
4. **Interactive selection** - ask user to select from available dartboards

**To read the config file:**
```
Read .dartai/config.local.md and parse YAML frontmatter between --- markers
Look for: last_dartboard, default_dartboard fields
```

**If no dartboard found in config, fetch available dartboards:**
```
Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
  mcp_name: "dart-query"
  tool_name: "get_config"
  parameters: {}
```

**After selecting a dartboard, save it as last used:**
```python
# Update .dartai/config.local.md frontmatter with:
# last_dartboard: "Selected/Dartboard"
# last_dartboard_used_at: "ISO timestamp"
```

### 1.5 Check for Interrupted Loop

Before starting a new loop, check if a previous session was interrupted:

```
Read .dartai/loop-state.json if it exists.
If status is "interrupted":
  1. Show the user: "Previous loop was interrupted at [interrupted_at]"
  2. Show loop_task_id and dartboard if available
  3. Ask: "Resume the interrupted loop, or start fresh?"

  If resume:
    - Reuse the existing loop_task_id
    - Query Dart for remaining To-do tasks on the same dartboard
    - Update loop state status back to "running"
    - Skip to Section 3 (Fetch Active Tasks)

  If start fresh:
    - Delete .dartai/loop-state.json
    - Continue normally to create a new loop
```

### 1.6 Check for Project Rules

Before scheduling any work, verify the project has rules installed:

```bash
test -d .claude/rules && test -f .claude/rules/karpathy-principles.md
```

If the check fails, warn:

```
Project has not run /dev-standards:setup-project (or the last run predates the
grill integration). The loop will run with default thresholds. Run the setup
command for project-specific tuning.
```

Do NOT block. The loop can run on default thresholds — the warning is informational.

### 2.5. Resolve Runner Identity

Identify this runner instance for multi-runner concurrency:

1. **Generate runner instance ID:**
   ```bash
   # hostname-pid format for uniqueness across terminals
   RUNNER_ID="$(hostname)-$$"
   ```

2. **Resolve Dart identity:**
   ```bash
   RUNNER_EMAIL=$(git config user.email)
   ```

3. **Match email to Dart assignee:**
   ```
   Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
     mcp_name: "dart-query"
     tool_name: "get_config"
     parameters: {"include": ["assignees"]}
   ```
   Match `runner_email` against assignee emails to find `runner_dart_id`.

4. **Check `.dartai/config.local.md`** for cached `runner_dart_id`. If cached and still valid, use it. Otherwise update the config with the matched value.

5. **Resolve agent identity 解析代理身份:**

   `runner_instance_id` disambiguates machine/PID concurrency, but N AI agents sharing one Dart user + shared git identity all resolve to the same `runner_instance_id` when hostname/PID happen to collide across launches. The **agent_id** layer identifies the agent persona itself (e.g. `ralph-risk-pipeline-v1`, `kibeth-planner`, `loop-runner-main`).

   ```bash
   # Preferred: explicit env var set by launcher / shell rc / CI
   # Fallback: reuse hostname-pid when CLAUDE_AGENT_ID unset
   AGENT_ID="${CLAUDE_AGENT_ID:-$(hostname)-$$}"
   ```

   Pseudocode for readers of claim entries (backward-compat):
   ```python
   # When agent_id is absent from a claim (legacy entry), treat it as equal to runner_instance_id
   agent_id = claim.get("agent_id") or claim["runner_instance_id"]
   ```

   Persist `agent_id` to:
   - `.dartai/config.local.md` frontmatter field `agent_id: "<value>"` alongside existing `runner_instance_id`
   - `.dartai/loop-state.json` top-level field `agent_id` (written in Section 4)

6. **Store in loop state** (written later in Section 4):
   - `runner_instance_id`: the hostname-pid value
   - `runner_email`: from git config
   - `runner_dart_id`: matched Dart assignee (or null)
   - `agent_id`: `CLAUDE_AGENT_ID` env or hostname-pid fallback

7. **If no email match found:** Warn and proceed without claiming. Tasks will still execute but without concurrency protection. Log: "No Dart assignee matches git email [email]. Running without claim protocol."

### 3. Fetch Active Tasks

Query Dart for **To-do tasks only** (not "In Progress"):

```
Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
  mcp_name: "dart-query"
  tool_name: "list_tasks"
  parameters: {
    "dartboard": "[selected dartboard]",
    "status": "To-do",
    "limit": 20
  }
```

**Filter returned tasks by claim status:**

Read `.dartai-locks.json` from the repo and check each task's `dart_id` against the `claims` map:
- **Not in claims** → eligible (unclaimed)
- **In claims with own `runner_instance_id`** → eligible (stale self-claim from crash, reclaim it)
- **In claims with different `runner_instance_id`** → skip (claimed by another runner)

### 4. Initialize Loop State in Dart

**Create a Loop Task** as the parent for all loop operations:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "create_task"
  parameters:
    item:
      title: "🔄 Loop: [dartboard-name]"
      description: |
        ## Ralph Wiggum Loop Session

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
      tags: ["loop-session", "loop-active", "runner:[runner_instance_id]"]
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
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters:
    dart_id: "[work-task-id]"
    tags: ["loop-task", "loop-id:[loop_task_id]", "loop-iteration:1"]
    # NOTE: Do NOT set parent_task - work task keeps its original structure
```

### Create Iteration Tracking Subtasks

For each Claude subagent execution, create a tracking subtask UNDER the loop task:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
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
  dart_id: "[iteration-subtask-id]"
  title: "📊 Iter [N]: [work-task-title] ✅"
  status: "Done"

# On failure
update_task:
  dart_id: "[iteration-subtask-id]"
  title: "📊 Iter [N]: [work-task-title] ❌"
  status: "Done"  # Iteration is done, even if work task failed
```

### Loop Progress Updates

Update the loop task description with progress after each iteration:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
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

#### 5.1 Pre-Spawn Validation

Before spawning subagent, verify prerequisites:

```yaml
pre_spawn_checks:
  - task_is_context_sized: "Max 5 files"
  - clear_acceptance_criteria: "Task has acceptance criteria"
  - previous_subagent_terminated: "No overlapping subagents"
  - loop_state_persisted: ".dartai/loop-state.json exists and is valid"
```

**If validation fails:**
- Context too large: Request task split, skip to next task
- Missing criteria: Add clarification comment to task, skip
- Previous subagent running: Wait or error (should not happen)
- State file corrupt: Reinitialize state file

**Only proceed to spawn if all checks pass.**

#### 5.1.5 Claim Task (Git-Locked)

The claim protocol uses **git push as an atomic compare-and-swap**. The lock file `.dartai-locks.json` is tracked in git — a successful push means the claim is exclusive.

**Step 1: Git pull and read lock file:**
```bash
git pull --rebase
```

Read `.dartai-locks.json` and check if `[task-id]` is already claimed:
- Key exists with a different `runner_instance_id` → skip task, move to next
- Key exists with own `runner_instance_id` → stale self-claim from crash, reclaim
- Key absent → proceed to claim

**On rebase conflict:** `git rebase --abort`, skip to next task.

**Step 2: Write claim to lock file + commit + push:**

Write the claim entry to `.dartai-locks.json` with the full 6-field meta shape:
```json
{
  "claims": {
    "[task-id]": {
      "runner_instance_id": "[hostname-pid]",
      "runner_email": "[email]",
      "claimed_at": "[ISO timestamp]",
      "agent_id": "[CLAUDE_AGENT_ID or hostname-pid fallback]",
      "parent_loop_id": "[loop_task_id from Section 4]",
      "purpose": "[short why string, e.g. 'risk-pipeline Phase 17 rollout']"
    }
  }
}
```

Field semantics 欄位語義：
- `runner_instance_id` — machine/PID level disambiguation (existing)
- `runner_email` — git identity for human-visible attribution (existing)
- `claimed_at` — ISO timestamp of claim acquisition (existing)
- `agent_id` — stable per-agent persona id; audit can aggregate by this
- `parent_loop_id` — Dart task id of the owning loop; enables tracing iteration → loop
- `purpose` — short free-text why string; filterable in audits

**Backward compat 向後兼容:** Old claim entries containing only the first 3 fields MUST still parse without crash. Readers treat missing `agent_id` as equal to `runner_instance_id`, missing `parent_loop_id` as null, missing `purpose` as empty string. See pseudocode in §2.5 step 5.

Then atomically commit and push:
```bash
git add .dartai-locks.json
git commit -m "claim: [task-id] by [runner_instance_id]"
git push
```

**Step 3: Handle push result:**
- **Push succeeds** → claim acquired, proceed to Step 4
- **Push fails** (another runner pushed first):
  1. `git pull --rebase`
  2. Re-read `.dartai-locks.json`
  3. If task now claimed by another runner → remove own entry, amend commit, push, skip to next task
  4. If task still unclaimed (other runner claimed a different task) → push again
  5. If second push fails → skip task (avoid infinite retry)

**Step 4: Update Dart for human visibility:**
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters:
    dart_id: "[task-id]"
    assignees: ["[runner_dart_id]"]
    status: "In Progress"
```

If `runner_dart_id` is null (no Dart identity match), skip the assignee update but still set status.

**Note:** The Dart update is best-effort for UI visibility. The git lock file is the source of truth for concurrency.

#### 5.2 Tag Task as Loop-Active

Tag the task with loop metadata (status already set to "In Progress" in 5.1.5). Include `agent:<id>` alongside the existing loop tags so Dart UI filters can group by agent persona even when multiple agents share one Dart assignee:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters:
    dart_id: "[task-id]"
    tags: ["loop-task", "loop-iteration:[N]", "loop-phase:starting", "agent:[agent_id]"]
```

The `agent:<id>` tag value comes from the resolved `agent_id` in §2.5 step 5 (env `CLAUDE_AGENT_ID` or hostname-pid fallback). Tag values must be lowercase-kebab to match Dart tag conventions; if `agent_id` contains uppercase or spaces, lowercase+kebab it before tagging.

#### 5.3 Spawn Task Executor Subagent

**Each task iteration MUST use the Task tool with subagent_type="dartai:task-executor":**

```yaml
subagent_execution:
  why: "Fresh context prevents accumulated state/confusion"
  max_turns: 50  # Timeout mechanism - agent returns after 50 API round-trips
  how: |
    Use the Task tool with:
      subagent_type: "dartai:task-executor"
      max_turns: 50  # Ensures agent returns even if stuck
      prompt: |
        Execute task [TASK_ID] from dartboard [DARTBOARD_NAME].

        ## Loop Context
        Loop Task ID: [loop_task_id]
        Iteration: [N]

        ## Task Details
        - Title: [title]
        - Description: [description]
        - Acceptance Criteria: [criteria]

        ## Instructions
        1. Use the adversarial quality loop pattern with RED/GREEN TDD
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
  max_turns: 50  # Timeout - ensures agent returns even if stuck
  prompt: |
    Execute task QiXCNniu7OQY from dartboard Personal/project-name.

    ## Loop Context
    Loop Task ID: abc123def456
    Iteration: 1

    ## Task Details
    - Title: Add user authentication
    - Description: Implement JWT-based auth...
    ...
```

#### 5.4 Task Sizing Check (done by subagent)
The task-executor subagent will verify task is context-sized:
- Maximum 3-5 files per task
- Clear acceptance criteria
- Bounded scope

**If task too large**: Subagent will request split and return

#### 5.5 Execute Quality Loop (done by subagent)

The task-executor subagent follows the adversarial-quality-loop skill:
```yaml
phases:
  0_git_hygiene_tdd:
    - Pull latest, rebase, verify green
    - Set up RED/GREEN TDD approach

  1_implementation_review:
    - Understand task scope and acceptance criteria
    - Identify files (max 5)

  2_tdd_implementation:
    - Write failing test (RED)
    - Implement minimum code (GREEN)
    - Refactor under GREEN
    - Repeat for each behavior

  3_concurrent_review:
    - Dispatch code-quality-reviewer and qa-reviewer (parallel), then post-task-reviewer (sequential)
    - All three run in parallel with fresh context
    - Fix issues, re-dispatch failing agents only

  4_quality_gates:
    - Linting, testing, coverage checks

  5_final_validation:
    - Verify all acceptance criteria met
    - Confirm no scope creep
```

**風險權威派遣 (authoritative risk dispatch when enabled; legacy fallback)**：派遣前讀 `.dartai/telemetry.jsonl` 最末一條該 `task_id` 之紀錄，摘 `risk.verdict`、`risk.pipeline_tier`、`risk.required_reviewers`、`risk.model`、`risk.tdd_required`。啟用時此裁決權威驅派遣——subagent 型、max_turns、review 集合、model 選擇皆依風險裁決。`enabled: false` 時退回既有層級邏輯：

```yaml
context_read:
  path: ".dartai/telemetry.jsonl"
  filter: "last record where task_id == <this task>"
  extract: ["risk.verdict", "risk.pipeline_tier", "risk.required_reviewers", "risk.model", "risk.tdd_required", "legacy_tier"]

telemetry_write:
  event: "start"
  legacy_tier: "<from existing logic>"
  risk: "<passthrough from plan record, or {enabled:false} if absent>"
  agreement: "<match|diverge>"
  authoritative: "risk"  # or "legacy" when enabled:false

if_enabled:
  - "Apply risk.model to subagent dispatch"
  - "Apply risk.required_reviewers to review set"
  - "Apply risk.tdd_required to TDD gating"
  - "Gate dispatch on risk.verdict (refuse on escalate/split_required)"

if_disabled:
  - "Fall back to legacy tier logic; write {authoritative:'legacy'} record"
```

風險管道缺或禁時，退化為既有派遣路徑（legacy fallback）。

#### 5.6 Handle Subagent Result (SubagentStop Hook Fires Here)

After the task-executor subagent returns, the `SubagentStop` hook fires and updates `.dartai/loop-state.json`.

**Dart is the source of truth for task state.** After SubagentStop fires:

1. **Query Dart for remaining To-do tasks:**
   ```yaml
   tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
   params:
     mcp_name: "dart-query"
     tool_name: "list_tasks"
     parameters:
       dartboard: "[dartboard]"
       status: "To-do"
       limit: 20
   ```

   Apply the same claim filter as Section 3: read `.dartai-locks.json` and skip tasks claimed by other runners.

2. **Check completed task status in Dart:**
   - Re-read the just-processed task via `get_task`
   - If task marked "Done" → success, proceed to git commit/push (5.6.5), then get next task
   - If task still "In Progress" with failure comment → replan, proceed to git stash (5.6.5)
   - Read failure details from task comments

3. **Local loop file contains orchestration metrics AND task results:**
   ```json
   # .dartai/loop-state.json - written by subagent before termination
   {
     "iterations": 3,
     "spawns": 3,
     "started_at": "ISO timestamp",
     "last_iteration_at": "ISO timestamp",
     "last_subagent": "subagent-id",
     "loop_task_id": "dart-task-id",
     "dartboard": "Personal/project",
     "runner_instance_id": "hostname-pid",
     "runner_email": "user@example.com",
     "runner_dart_id": "dart-assignee-id or null",
     "tasks": [
       {
         "task_id": "abc123",
         "iteration": 1,
         "status": "completed",
         "started_at": "ISO timestamp",
         "completed_at": "ISO timestamp",
         "phase_completed": "phase-9",
         "failed_phase": null,
         "files_changed": 3,
         "tests_added": 5,
         "plan_adjustments": 2,
         "completion_summary": "Implemented user auth with JWT",
         "failure_reason": null,
         "fix_task_created": false,
         "fix_task_id": null
       }
     ]
   }
   ```

   **Key change**: Subagents write structured completion data to this file BEFORE terminating.
   This eliminates string parsing and enables reliable autonomous continuation.

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
     mcp_name: "dart-query"
     tool_name: "update_task"
     parameters:
       dart_id: "[task-id]"
       status: "Blocked"
       tags: ["loop-task", "loop-blocked", "loop-iteration:[N]"]
   ```

3. **Create fix task as subtask of LOOP task** (not the work task):
   ```yaml
   # Fix tasks are NEW work created by the loop, so they belong under the loop task
   tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
   params:
     mcp_name: "dart-query"
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
     mcp_name: "dart-query"
     tool_name: "add_task_comment"
     parameters:
       dart_id: "[loop_task_id]"
       text: |
         ## 🔄 Replan at Iteration [N]

         **Task Failed:** [task-title]
         **Phase:** [phase]
         **Action:** Created fix task [fix-task-id]
         **Next:** Processing fix task
   ```

5. **CONTINUE to fix task or next actionable task**

**Only STOP if:**
- No claimable To-do tasks remain (all completed, blocked, or claimed by other runners)
- User explicitly says "stop"
- Critical security vulnerability found (tag: `security-critical`)
- No remaining tasks can be executed (all Blocked with no fix tasks)

**IMPORTANT: Never reuse subagent context - each task gets fresh execution.**

#### 5.6.5 Release Lock, Git Commit and Push After Task

**On success (task marked Done):**

1. **Release the claim** — remove the task entry from `.dartai-locks.json`
2. **Stage and commit all changes** (including the updated lock file):
   ```bash
   git add -A
   git commit -m "[DART-{task_id}] {task_title}" || true
   git push
   ```
3. If push fails (another runner pushed first):
   ```bash
   git pull --rebase && git push
   ```
4. If pull-rebase-push still fails: log error, continue (committed locally). Next iteration's git pull resolves it.
5. If nothing to commit: still update and push `.dartai-locks.json` to release the claim.

**On failure (task blocked/failed):**

1. **Release the claim** — remove the task entry from `.dartai-locks.json`
2. **Stash partial work** to keep working tree clean:
   ```bash
   git stash push -m "dartai: partial work on {task_id} {task_title}"
   ```
3. **Commit and push the lock release:**
   ```bash
   git add .dartai-locks.json
   git commit -m "release: [task_id] by [runner_instance_id] (failed)"
   git push
   ```
4. If push fails: `git pull --rebase && git push`. If still fails, log and continue.
5. If nothing to stash: skip silently.

#### 5.7 Documentation Update (optional)

If significant changes were made, spawn doc-updater agent:
```
Task tool call:
  subagent_type: "dartai:doc-updater"
  description: "Update docs for completed task"
  max_turns: 20  # Doc updates are simpler, shorter timeout
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

**How Autonomous Continuation Works:**

The loop continues autonomously via an **agent-based Stop hook** defined in `hooks.json`. When Claude attempts to stop:

1. Stop hook spawns a subagent with Read/Grep/Glob access
2. Subagent reads `.dartai/loop-state.json` to check loop status
3. If tasks remain: Returns `{"ok": false, "reason": "N remaining tasks..."}` → **Blocks stopping**, Claude continues
4. If all done: Returns `{"ok": true}` → Allows stopping

**Safety valve:** If `stop_hook_active` is `true` in the hook input, the agent allows stopping immediately to prevent infinite loops. This means the hook blocked once already and Claude still wants to stop.

**Crash recovery:** A separate `SessionEnd` command hook runs `mark-interrupted.js` to mark the loop state as interrupted. This fires even on user interrupts (Ctrl+C). The next session detects this in Section 1.5 and offers to resume.

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
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters:
    dart_id: "[loop_task_id]"
    status: "Done"
    tags: ["loop-session", "loop-complete"]
    comment: |
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
  mcp_name: "dart-query"
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
  - "SubagentStop hook updates .dartai/loop-state.json"
  - "Main loop reads state file and decides next action"
  - "Failure triggers REPLAN, not STOP"
  - "Loop continues until all tasks done or user stops"
```

## Usage Examples

```bash
# Start loop (uses last-used or default dartboard)
/dartai:start

# Start on specific dartboard
/dartai:start Personal/standardbeagle-tools

# Start on a named dartboard
/dartai:start "My Project"
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

說任意一個：
- "stop the loop"
- "cancel ralph wiggum"
- "pause execution"
- "/dartai:stop"

或安全問題立即停止：
- "security critical"（發現關鍵漏洞時）
