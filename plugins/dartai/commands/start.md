---
name: start
description: "Start the Ralph Wiggum adversarial cooperation loop on a dartboard with plan adjustment. 在看板上啟動Ralph Wiggum對抗合作循環，含計劃調整。 Use when: start execution loop, run dartboard tasks, begin adversarial loop, automate task execution, process task queue"
argument-hint: "[dartboard-name]"
---

# Start Ralph Wiggum Adversarial Loop

啟動持續任務執行循環，以對抗合作模式處理Dart看板任務，各階段含計劃調整。

## STOP — Read Before Anything Else 防遞迴

**You are inside `/dartai:start` right now.** Do NOT invoke `Skill(dartai:start)`, `Skill(dartai-cmd-start)`, or any sibling skill that re-enters this command — that recurses. `/start` aliases to `/dartai:start` (single command, single skill). There is no "outer" entry point to delegate to.

**Slash commands always run top-level.** Subagents cannot fire `/commands`. If you reached this section by typing `/start` or `/dartai:start`, you are top-level. The `<SUBAGENT-STOP>` block does NOT apply. Do not "report to parent" — you ARE the parent. Halt only on literal `<SUBAGENT-STOP>` reminder text.

**Agent tool resolution — do this before checking "is Agent available":**

1. Look at the top-level `<functions>` block. If `Agent` (alias `Task`) is there → use directly. → §5.3
2. Check `<system-reminder>` deferred-tools list. If `Agent` listed by name → call `ToolSearch query="select:Agent" max_results=1` FIRST, then `Agent` is callable. → §5.3
3. Only after **both** steps fail (Agent not in `<functions>` AND not in deferred list AND `ToolSearch` returned no schema) → §5.3.1 inline-delegation. Log: "Agent unavailable, running inline". Do NOT ask the user. Do NOT invoke a Skill alias of this command.

**Per-task dispatch:** try `Agent` once. On `InputValidationError` after step 2, treat as transient → §5.3.1. Never retry the same task.

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
  parameters: {"include": ["dartboards"]}
```

**Cache get_config for the loop session.** Workspace config (dartboards, assignees, statuses) rarely changes within a loop run. Fetch once at startup and reuse the result for the duration of the session. Prefer the `include` parameter to limit response sections to what's needed at each call site (e.g. `["dartboards"]` here, `["assignees"]` in §2.5, `["dartboards", "assignees", "statuses"]` if a single bulk fetch makes sense at startup).

**Cache invalidation 緩存失效:** Re-fetch with `cache_bust: true` only when:
1. A dartboard is created/renamed via this loop (write-then-invalidate)
2. Every 50 iterations as a safety refresh (default; tune via `.dartai/config.local.md` `config_cache_ttl_iterations`)
3. The user explicitly says "refresh config"

Do NOT call `get_config` per-iteration or per-task — that's the wasteful pattern this revision eliminates.

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

3. **Match email to Dart assignee** (reuse cached config from §1 if already fetched; otherwise scope to assignees only):
   ```
   Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
     mcp_name: "dart-query"
     tool_name: "get_config"
     parameters: {"include": ["assignees"]}
   ```
   Match `runner_email` against assignee emails to find `runner_dart_id`. If §1 already fetched `["dartboards", "assignees"]` together, skip this call and read from the cached result.

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

Query Dart for **To-do tasks only** (not "In Progress") at **minimal detail** — the loop driver only needs `id`, `title`, and `status` to pick the next claimable task. Full descriptions are fetched once, just-in-time, when the chosen task is dispatched to the executor (Section 5.3).

```
Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
  mcp_name: "dart-query"
  tool_name: "list_tasks"
  parameters: {
    "dartboard": "[selected dartboard]",
    "status": "To-do",
    "detail_level": "minimal",
    "limit": 20
  }
```

**Detail level:** `minimal` = queue scan (id+title+status only); `standard` = upgrade only if blocker tags visible; `full` = executor dispatch only (§5.3), never in queue sweep.

**DartQL escape valve:** When `list_tasks` params insufficient (priority ranges, multi-status OR, tag exclusion), use `batch_update_tasks` selector with `dry_run: true` to filter at source. Example:

```
batch_update_tasks(
  selector: "status = 'To-do' AND priority >= 4 AND created_at < '7 days ago'",
  updates: {},
  dry_run: true,
)
```

`dry_run: true` returns matched IDs without mutation — DartQL SELECT equivalent. See `dartai:batch-operations` for full syntax.

**Filter by claim status:**

Read `.dartai-locks.json` and check each `dart_id` against `claims`:
- Not in claims → eligible
- Own `runner_instance_id` → eligible (stale self-claim, reclaim)
- Different `runner_instance_id` → skip

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

### Plan File Layout (Active vs Archive vs Meta) 計劃文件分層

The loop driver reads **only the active plan slice**. Completed phases are rotated out to an append-only archive so reviewer and executor prompts see the current spec, not full history. Three files:

| File | Content | Read by | Write semantics |
|------|---------|---------|-----------------|
| `.dartai/plan.md` | Active phase + open checkpoints + current spec | Loop driver, executor, reviewers | Truncate-and-rewrite on rotation |
| `.dartai/plan-archive.md` | Completed phases (append-only history) | Explicit retrospectives only | Append-only |
| `.dartai/plan-meta.kdl` | Pointers, checkpoint markers, `last_rotated` timestamp | Loop driver | Atomic full-rewrite |

**plan-meta.kdl shape:**
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

`archive_offset` is the line number in `plan-archive.md` where the archived phase begins — enables explicit retrieval without scanning the whole archive.

#### Rotation Rule 輪轉規則

When a phase is marked `done` AND downstream phases are unblocked, the driver rotates the phase out:

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
    action: "Append phase block to .dartai/plan-archive.md"
    verify: "fsync + read-back the appended block matches"
    rollback: "If verify fails, abort — do not touch plan.md"

  step_2_meta_update:
    action: "Rewrite .dartai/plan-meta.kdl with new active_phase + archived_phases entry"
    verify: "Parse rewritten kdl, confirm archive_offset points to step_1's appended block"
    rollback: "If verify fails, truncate plan-archive.md back to pre-append size, abort"

  step_3_plan_truncate:
    action: "Rewrite .dartai/plan.md without the rotated phase section"
    verify: "Re-read plan.md, confirm rotated phase no longer present, active_phase from meta is present"
    rollback: |
      If verify fails:
      1. Restore plan.md from archive-append source (the rotated block is the diff)
      2. Revert plan-meta.kdl to prior contents
      3. Truncate plan-archive.md to pre-append size
      4. Surface mid-write failure to loop task as a comment

  invariant: "archive write FIRST, plan truncate LAST. Never reverse."
```

**Why:** crash after step 1 = duplicate (recoverable via dedup); crash after step 3 without 1-2 = lost phase (data loss). Durable copy first.

#### Driver Read Discipline 驅動讀取規範

```yaml
plan_read_rules:
  loop_driver_default:
    reads: ".dartai/plan.md (active slice only)"
    never: "Reads plan-archive.md during normal iteration"

  archive_access:
    when: "Explicit retrospective, debugging, or rollback investigation"
    how: "Operator (or explicit subagent prompt) reads plan-archive.md by name"
    never: "Auto-include archive in executor/reviewer prompts"

  reviewer_prompts:
    must_reference: "active phase only (.dartai/plan.md)"
    must_not_reference: "completed phases or full plan history"
    rationale: "Reviewer anchoring on prior attempts drifts judgment from current spec"

  meta_consultation:
    when: "Driver needs to know active phase id, checkpoint state, or rotation history"
    read: ".dartai/plan-meta.kdl"
    do_not: "Parse plan-archive.md for state queries — meta has the pointers"
```

#### Recovery 恢復

If `plan.md` is corrupted or lost mid-rotation:
1. Read `plan-meta.kdl` for `active_phase` id and `archived_phases[].archive_offset`
2. Reconstruct active slice: any phase in plan-meta.kdl marked active that's not in archived_phases must be rebuilt from operator memory or last commit
3. Archived phases remain recoverable from `plan-archive.md` at recorded offsets

Archive is the durable record. Plan.md is a working slice. Treat plan.md loss as a rebuild trigger, not catastrophic data loss.

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

**If validation fails:** too large → request split, skip; missing criteria → add comment, skip; corrupt state → reinitialize.

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

**Step 1.5: Pre-claim conflict check (knowledge-hygiene dispatch) 申領前衝突檢查:**

Before writing the claim, dispatch `knowledge-hygiene:conflict-detector` to surface any contradiction between this task's stated goal and prior memory/decisions for related tasks. This is the **surface-then-proceed pattern** — loops are autonomous, so detection logs to the loop task; it does NOT block the claim. The "no silent rationalization" rule from K2 §3.3 (also encoded as `risk-pipeline` rationalization-trap class, commit 4526ba5) applies: if a conflict is found, the loop comment MUST record it verbatim — do not paper over the contradiction by re-narrating it as agreement.

```yaml
dispatch:
  tool: Task
  subagent_type: "knowledge-hygiene:conflict-detector"
  description: "Pre-claim conflict scan for [task-id]"
  prompt: |
    Scan for conflicts between this task and prior memory.

    ## Task
    - id: [task-id]
    - title: [title]
    - description: [description]
    - acceptance_criteria: [criteria]

    ## Prior context (best-effort gather)
    - Recent Dart memory entries for related tasks
    - .dartai/loop-state.json prior task entries
    - Recent commits touching the same files (if file list known)

    Return: {conflicts: [...], severity: "none|low|medium|high"}

handling:
  no_conflict:
    action: "Proceed to Step 2 (write claim)"
  conflict_found:
    action: |
      1. Append a comment to the loop task (parent_loop_id) with:
         - Verbatim conflict text from the agent
         - Severity
         - Decision: "proceeding (autonomous loop)" — do NOT silently rationalize
      2. Continue to Step 2 (write claim) — surfacing is sufficient
    note: |
      MUST: record the conflict text verbatim. Do NOT rewrite or summarize
      it as if it were not a conflict. Surface-then-proceed only works if
      future readers can audit the original contradiction.
  agent_unavailable:
    action: "Skip conflict check, log skip reason, proceed to Step 2"
    note: "knowledge-hygiene plugin not installed → graceful degradation"
```

Cite: `knowledge-hygiene:conflict-detector` agent (commit b28aa0f), K2 §3.3 no-silent-rationalization, risk-pipeline rationalization-trap class (commit 4526ba5).

**Step 2: Write claim to lock file + commit + push:**

Write the claim entry to `.dartai-locks.json` with the full 7-field meta shape:
```json
{
  "claims": {
    "[task-id]": {
      "runner_instance_id": "[hostname-pid]",
      "runner_email": "[email]",
      "claimed_at": "[ISO timestamp]",
      "agent_id": "[CLAUDE_AGENT_ID or hostname-pid fallback]",
      "parent_loop_id": "[loop_task_id from Section 4]",
      "purpose": "[short why string, e.g. 'risk-pipeline Phase 17 rollout']",
      "source_event": {
        "loop_id": "[parent loop task-id]",
        "task_id": "[claim-target task-id]",
        "conversation_id": "[session-id if available, else null]"
      }
    }
  }
}
```

Field semantics 欄位語義：
- `runner_instance_id` — machine/PID level disambiguation (existing)
- `runner_email` — git identity for human-visible attribution (existing)
- `claimed_at` — ISO timestamp of claim acquisition (existing, mandatory)
- `agent_id` — stable per-agent persona id; audit can aggregate by this
- `parent_loop_id` — Dart task id of the owning loop; enables tracing iteration → loop
- `purpose` — short free-text why string; filterable in audits
- `source_event` — **mandatory on new claims**; `{loop_id, task_id, conversation_id}` triple. Pairs each claim with the orchestration event that triggered it, enabling provenance audits across loop runs. Required pair: `claimed_at` (when) + `source_event` (why-from-where). Cite: dev-standards `memories-require-timestamp-and-source` rule (commit 9ab9c47), brainstorming PROVENANCE-CONTRACT (commit ebd136a).

**Backward compat 向後兼容:** Old claim entries written before this revision are **grandfathered** — readers MUST still parse them without crash. Soft-deprecation rules:
- Missing `agent_id` → treat as equal to `runner_instance_id` (existing rule)
- Missing `parent_loop_id` → null (existing rule)
- Missing `purpose` → empty string (existing rule)
- Missing `source_event` → null on legacy entries; **MUST be present on any claim written after this revision**. Audit tools may flag legacy claims for migration but must not crash.

Migration guidance: when rewriting a legacy claim (e.g. on reclaim of a stale self-claim), populate `source_event` from current orchestration context. Do not retroactively backfill claims belonging to other runners.

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

**Just-in-time full fetch:** The queue sweep in §3 returned only minimal fields. Before dispatching the executor, fetch the chosen task at full detail so the prompt carries the complete description and acceptance criteria. This is the **only** point in the loop where `detail_level: "full"` (or omitted, since `get_task` returns full by default) is appropriate:

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "get_task"
  parameters:
    dart_id: "[chosen-task-id]"
    include_relationships: true   # need blocker/dependency state for executor
    expand_relationships: false   # titles not required for executor
```

Use the returned `description`, `acceptance_criteria` (parsed from description), and relationship state to build the executor prompt below.

**Each task iteration attempts the `Agent` tool (or `Task` alias) with subagent_type="dartai:task-executor". On `InputValidationError` (schema not loaded), retry once after `ToolSearch query="select:Agent"` per the prereq classification. On "not available" or persistent schema failure, fall back to inline delegation (§5.3.1).**

##### Dispatch prompt compression 派發提示壓縮

Driver-to-executor prompts are compressed to cut token cost ~50–70% per dispatch. The executor agent (`plugins/dartai/agents/task-executor.md`) accepts compressed input.

| keep verbatim | compress / strip |
| --- | --- |
| file paths, line numbers | articles (a/an/the) |
| function/symbol names | filler (just/really/basically) |
| code blocks (fenced) | pleasantries, hedging |
| error messages | narrative recap, role preludes |
| commit/PR text, dart_ids, loop-ids | "please", "kindly", "as you know" |
| URLs, hashes | step-by-step instruction lists already in agent spec |

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

**Compressed dispatch shape:**
```yaml
subagent_execution:
  why: "Fresh context prevents accumulated state/confusion"
  max_turns: 50
  tool: Agent
  subagent_type: "dartai:task-executor"
  description: "Execute task: [short title]"   # ≤8 words
  prompt: |
    Execute Dart task [TASK_ID] from dartboard [DARTBOARD_NAME].

    loop_task_id: [loop_task_id]
    iteration: [N]
    active_plan: .dartai/plan.md (active slice — skip plan-archive.md)

    task_spec (full sentences preserved):
      title: [title]
      description: [full description verbatim]
      acceptance: [criteria verbatim]

    Behavior: adversarial-quality skill with RED/GREEN TDD; tag
    loop-phase:<phase> at milestones; on done → Done + summary; on
    fail → leave In Progress + failure comment (phase, fix, blocked
    tasks); comment loop_task_id on completion.

  result_handling:
    on_success: "Task marked Done in Dart, continue to next"
    on_failure: "Task stays In Progress with failure comment, replan"
    on_agent_unavailable: "Add task to delegation_queue; continue to next task (§5.3.1)"
```

**Example (compressed):**
```
Task tool call:
  subagent_type: "dartai:task-executor"
  description: "Execute: Add user auth"
  max_turns: 50
  prompt: |
    Execute Dart task QiXCNniu7OQY from dartboard Personal/project-name.
    loop_task_id: abc123def456. iteration: 1.
    task_spec:
      title: Add user authentication
      description: Implement JWT-based auth ...
      acceptance: ...
```

Headers like "## Task Details" and numbered instruction lists are dropped — the executor agent's spec already prescribes the pipeline. Driver supplies ids + verbatim `task_spec` only.

#### 5.3.1 Inline Delegation 內嵌委派

Agent不可用時，僅執行適合當前窗口的小任務，其餘升級。

**規則：**
1. 取下一To-do任務（僅id, title, status）
2. **尺寸檢查：**
   - >3檔 OR 條件不明 OR 預估>10次工具調用 → 加入`delegation_queue`，跳過
   - ≤3檔 AND 條件明確 AND 範圍有界 → 內嵌執行task-executor流程
3. 每次完成後：更新Dart狀態 + loop state + 評估剩餘上下文
4. 上下文窗口<40% → **立即停止並上報**
5. 終止條件：隊列空 OR delegation_queue≥3 OR 上下文<40% OR 用戶停止 OR 安全問題

**終止時輸出此YAML（供父agent解析恢復）：**
```yaml
inline_delegation_report:
  dartboard: "[name]"
  completed_inline: [task_ids]
  blocked: [task_ids]
  needs_fresh_context: [task_ids]
  loop_task_id: "[id]"
  state_file: ".dartai/loop-state.json"
  context_remaining: "40%"
  summary: "Completed N small tasks inline. M tasks need fresh subagent context."
  recovery_request: |
    Agent tool unavailable. Spawn subagents for needs_fresh_context tasks,
    or restart /start in top-level conversation.
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

1. **Query Dart for remaining To-do tasks** (minimal detail — same rationale as §3, queue scan only needs id/title/status):
   ```yaml
   tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
   params:
     mcp_name: "dart-query"
     tool_name: "list_tasks"
     parameters:
       dartboard: "[dartboard]"
       status: "To-do"
       detail_level: "minimal"
       limit: 20
   ```

   Apply the same claim filter as Section 3: read `.dartai-locks.json` and skip tasks claimed by other runners. Full description is fetched at §5.3 dispatch, not here.

2. **Check completed task status in Dart** (status-only fetch — skip full description, the loop driver already dispatched it once):
   ```yaml
   tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
   params:
     mcp_name: "dart-query"
     tool_name: "get_task"
     parameters:
       dart_id: "[just-processed-task-id]"
       include_relationships: false   # not needed for status check
       include_comments: true         # needed only if status indicates failure
   ```
   - If task marked "Done" → success, proceed to git commit/push (5.6.5), then get next task
   - If task still "In Progress" with failure comment → replan, proceed to git stash (5.6.5); read failure details from comments returned above
   - Drop `include_comments: true` if status-only check is sufficient (executor already wrote the failure comment to Dart, so the loop driver may not need to re-read it)

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
- **Rotate completed phase to archive** if this task closed out a plan phase. Apply the atomic rotation order from the "Plan File Layout" section: append phase block to `.dartai/plan-archive.md` first, update `.dartai/plan-meta.kdl`, then truncate the rotated section from `.dartai/plan.md`. Skip rotation if downstream phases still reference open checkpoints in this phase.
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
  actions: [review findings, identify new tasks, re-prioritize, update descriptions, document reason]
  record: {adjustment_type: "add|modify|remove|reorder", reason: "trigger", tasks_affected: "[ids]"}
```

### 7. Loop Control

**Autonomous continuation via agent-based Stop hook** (`hooks.json`):
1. Stop hook spawns subagent (Read/Grep/Glob)
2. Subagent reads `.dartai/loop-state.json`
3. Tasks remain → `{"ok": false}` → blocks stop, Claude continues
4. All done → `{"ok": true}` → allows stop

**Safety valve:** `stop_hook_active: true` in hook input = hook already blocked once, allow stop now.

**Crash recovery:** `SessionEnd` hook runs `mark-interrupted.js` (fires on Ctrl+C too). Next session detects interrupted state at §1.5.

**Subagent Execution Pattern:**
```yaml
loop_execution:
  each_task: spawn fresh dartai:task-executor (no accumulated state from prior tasks)
  between_tasks: loop orchestrates, only metadata persists
  never: [multi-task same subagent, pass context between tasks, resume prior subagent]
```

**Loop NEVER stops on task failure — replans and continues.**

Stop only when: all tasks done, critical security issue, user says stop, no actionable tasks remain, or session ends.

**On task failure:** log details, create fix tasks if fixable, move to next actionable, report progress.

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

**Query for final state** (standard detail — summary needs status counts but not full descriptions):
```yaml
# Get all loop-related tasks for summary
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "list_tasks"
  parameters:
    dartboard: "[dartboard-name]"
    tag: "loop-task"
    detail_level: "standard"
```

**Bulk status flip at loop end:** If the summary needs to mark several iteration-tracking subtasks (e.g. all `tracks:[work-task-id]` rows whose status drifted), prefer a single `batch_update_tasks` call with a DartQL selector over N sequential `update_task` calls. Example:

```yaml
batch_update_tasks(
  selector: "tag = 'loop-iteration' AND status != 'Done' AND tag CONTAINS 'tracks:[work-task-id]'",
  updates: {status: "Done"},
  dry_run: false,
)
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
