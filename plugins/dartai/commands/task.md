---
name: task
description: "Execute a single task through the quality pipeline. 通過品質管道執行單個任務。 Use when: run single task, execute dart task by id, task pipeline, implement one task, quality pipeline single task"
argument-hint: "<task-id or title>"
context: fork
agent: dartai:task-executor
---

# Execute Single Task

在不啟動持續循環的情況下，對單個Dart任務運行完整品質管道。

## Agent Dispatch Prerequisites

This command dispatches `dartai:task-executor` and `dartai:doc-updater` via `Agent` (alias `Task`). Two prerequisites:

1. **Top-level only.** Subagents cannot spawn subagents — if `/dartai:task` fires inside a subagent, stop+report to parent.
2. **Check `Agent` schema.** Deferred-tools list: `Agent` absent → call directly; present → load first via `ToolSearch query="select:Agent" max_results=1`.

## Process

### 1. Find the Task

If argument looks like a Dart task ID (12 alphanumeric chars), fetch directly at full detail — the user named one task and we're about to execute it, so the full description is needed immediately:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "get_task"
  parameters:
    dart_id: "[argument]"
    include_relationships: true
    include_comments: false   # comments fetched only if §2 confirmation requires them
```

Otherwise, **search by title at minimal detail** so the disambiguation list stays compact. Only the chosen result is fetched at full detail in step 1.5:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "search_tasks"
  parameters:
    query: "[argument]"
    detail_level: "minimal"
    limit: 10
```

### 1.5. Resolve Chosen Task to Full Detail

After the user confirms which search result to execute (or if the ID lookup matched a single task), fetch full detail just-in-time:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "get_task"
  parameters:
    dart_id: "[chosen-id]"
    include_relationships: true
    include_comments: true
```

This is the standard "minimal-for-discovery, full-for-execution" pattern. Skip step 1.5 if step 1 already returned the full task (direct ID lookup with no disambiguation).

### 2. Confirm Task

Display task details and confirm:
- Title
- Description
- Current status
- Dartboard
- Assignee

### 2.5. Grill Task Spec

移交task-executor代理前，以任務原始描述調用`dev-standards:grill-task`。技能探測項目上下文，運行層級門控審訊，執行規劃時品質審查（直接性、問題/方案適配、可測試性、過度工程防護、方案深度），並返回已審查任務規格。

- 以`task_spec`代替原始描述傳遞給task-executor代理。
- grill返回的所有`backflow_writes`在執行開始前提交至項目。
- 若grill返回`verdict: TOO_LARGE_TO_GRILL`，更新Dart任務狀態為`Blocked`並添加建議拆分的評論，停止——不派發task-executor。

勿在此預分類層級。讓grill-task自身的層級分類決定。最小層級任務不變地通過grill-task，因此將所有任務路由通過它無額外成本。

### 3. Execute Pipeline

Use the task-executor agent to run the full quality pipeline.

#### Dispatch prompt compression 派發提示壓縮

Driver-to-subagent prompts are compressed to cut token cost ~50–70% with no fidelity loss. Subagents accept compressed input — see `plugins/dartai/agents/task-executor.md`.

| keep verbatim | compress / strip |
| --- | --- |
| file paths, line numbers | articles (a/an/the) |
| function/symbol names | filler (just/really/basically) |
| code blocks (fenced) | pleasantries, hedging |
| error messages | narrative recap |
| commit/PR text | role-prelude boilerplate |
| URLs, dart_ids, commit hashes | "please", "kindly", "as you know" |

**Sentence-preservation exceptions** — keep full sentences in:
- Acceptance criteria (ambiguity blocks verdict)
- Risk descriptions (mitigation depends on nuance)
- Spec sections inside `task_spec` (downstream reviewer reads these)

**Forbidden compression zones** — never compress:
- Code blocks (fenced ``` ... ```)
- Security text (auth flow, threat model, CVE refs)
- Error messages quoted verbatim from logs
- File contents quoted for review

**Final user-facing summary** stays normal English — compression is driver→subagent only.

**Task tool invocation (compressed form):**
```yaml
Task tool call:
  subagent_type: "dartai:task-executor"
  max_turns: 50
  description: "Execute task: [task-title]"
  prompt: |
    Execute Dart task [TASK_ID] via quality pipeline.

    Loop: [loop-id] iter [N]
    Active plan: .dartai/plan.md (active slice only — skip plan-archive.md)
    Working dir: [cwd]
    Branch: [branch]

    task_spec (full sentences preserved):
    [grilled spec from §2.5 — acceptance + risks intact]

    Touchpoints: [file paths verbatim]
    Acceptance: [criteria verbatim]

    Behavior:
    - Run adversarial-quality skill phases 0–9
    - Update tags loop-phase:<phase> at milestones
    - On done: status Done, comment summary, append .dartai/loop-state.json tasks[]
    - On fail: leave Doing, comment phase + recommendation
    - Fresh context — no prior task memory
```

The `description` field stays short (≤8 words). Headers like "Task Details:", "IMPORTANT:", and narrative scaffolding from earlier templates are dropped — the executor agent's spec already prescribes the pipeline.

**Pipeline phases:**

1. **Understand task**: Read grilled spec + `.dartai/plan.md` active phase. Do NOT read `.dartai/plan-archive.md`.
2. **Implement changes**: Make necessary code changes
3. **Code review**: Self-review with LCI search
4. **Run linting**: Execute project linter
5. **Run tests**: Execute test suite
6. **LCI evaluation**: Check code quality patterns
7. **Refactor check**: Clean code
8. **Deprecated cleanup**: Remove obsolete code

### 3.5. Plan File Rotation (if phase closed) 計劃文件輪轉

If this task closed out an active phase in `.dartai/plan.md`, rotate the phase to the archive **before** marking the task Done. The driver maintains three plan files:

| File | Content | Read by | Write semantics |
|------|---------|---------|-----------------|
| `.dartai/plan.md` | Active phase + open checkpoints + current spec | Executor, reviewers | Truncate-and-rewrite on rotation |
| `.dartai/plan-archive.md` | Completed phases (append-only history) | Explicit retrospectives only | Append-only |
| `.dartai/plan-meta.kdl` | Pointers, checkpoint markers, `last_rotated` timestamp | Driver | Atomic full-rewrite |

**Rotation trigger:** phase marked `done` AND no downstream phase still references this phase's open checkpoints.

**Atomic write order (CRITICAL — do not reverse):**

```yaml
atomic_rotation:
  step_1_archive_append:
    action: "Append phase block to .dartai/plan-archive.md"
    verify: "fsync + read-back of appended block matches"
    rollback: "If verify fails, abort — do not touch plan.md"

  step_2_meta_update:
    action: "Rewrite .dartai/plan-meta.kdl with new active_phase + archived_phases entry (record archive_offset = line where step 1 wrote)"
    verify: "Parse rewritten kdl, confirm archive_offset matches step 1's append location"
    rollback: "If verify fails, truncate plan-archive.md back to pre-append size, abort"

  step_3_plan_truncate:
    action: "Rewrite .dartai/plan.md without the rotated phase section"
    verify: "Re-read plan.md, confirm rotated phase absent and active_phase from meta is present"
    rollback: |
      1. Restore plan.md from the archive-appended block
      2. Revert plan-meta.kdl to prior contents
      3. Truncate plan-archive.md to pre-append size
      4. Surface mid-write failure as a Dart comment on this task

  invariant: "archive write FIRST, plan truncate LAST. Never reverse."
```

**Why:** crash after step 1 = duplicate (recoverable via dedup); crash after step 3 without 1-2 = lost phase (data loss). Durable copy first.

**If no phase closed**, skip this step — single-task execution does not always coincide with a phase boundary.

### 4. Update Task Status

On success:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters:
    dart_id: "[task-id]"
    status: "Done"
    comment: "[completion summary]"
```

On failure:
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "update_task"
  parameters:
    dart_id: "[task-id]"
    status: "Blocked"
    comment: "[failure details]"
```

### 5. Update Documentation

使用doc-updater代理更新文檔。同樣應用§3的壓縮規則——`task_spec`中的驗收/風險全句保留，路徑/標識符逐字。

```yaml
Task tool call:
  subagent_type: "dartai:doc-updater"
  max_turns: 20
  description: "Update docs: [task-title]"
  prompt: |
    Update docs for completed Dart task [TASK_ID].

    Files changed: [paths verbatim]
    Summary: [one-line completion summary]

    Actions:
    - Append CHANGELOG entry if feature/fix
    - Update README if user-facing
    - Add Dart task comment with summary
```

Actions:
- Add entry to CHANGELOG if feature/fix
- Update README if applicable
- Add Dart task comment with summary

## Usage Examples

```
/dartai:task QiXCNniu7OQY
/dartai:task "Color MCP Server"
/dartai:task "Fix login bug"
```

## Output

Task execution report:
```
Task Execution Report
=====================
Task: [title]
Status: SUCCESS / FAILED

Pipeline Results:
- Code Review: PASS
- Linting: PASS (0 errors)
- Tests: PASS (42 passed, 0 failed)
- LCI Check: PASS
- Refactor: PASS
- Cleanup: PASS (removed 3 deprecated functions)

Changes Made:
- [file1]: [description]
- [file2]: [description]

Documentation Updated:
- CHANGELOG.md: Added entry for [feature]
- Dart comment: Added completion summary
```
