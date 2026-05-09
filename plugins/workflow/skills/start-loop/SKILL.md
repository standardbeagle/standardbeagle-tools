---
name: workflow-start-loop
description: "\"Start a Ralph Wiggum adversarial loop — context-isolated subagents, multi-stage verification, sequential task execution. 啟動Ralph Wiggum對抗循環：隔離子代理、多階段驗證、順序任務執行. Use when: start workflow loop, begin adversarial loop, run task list, start automation loop, execute tasks sequentially\""
disable-model-invocation: true
argument-hint: "\"[task-list-file]\""
---

<!-- Loop driver runs at top level. Setting `agent:` puts orchestrator INTO a subagent, where Agent/Task tool is unavailable for recursion — driver crashes per-task. Top-level keeps Agent dispatchable for fresh task-executor subagents per iteration. -->

# Start Ralph Wiggum Adversarial Loop

啟動持續對抗協作循環，以清潔上下文隔離和多階段驗證處理任務。

This command body holds the trigger conditions, top-level decision flow, dispatch prerequisites, and core principles. Detailed dispatch prompts, plan-rotation atomic write steps, plan-meta schema, full iteration examples, task-list format, loop-state schema, status report template, and Dart fetch discipline live in `references/dispatch-examples.md` and are loaded on demand at the matching decision branch.

## Agent Dispatch Prerequisites

**This loop must run from the top-level agent.** Subagents cannot spawn subagents — the harness scopes the deferred-tool list per-agent and does not surface `Agent`/`Task` to nested runners. If `/workflow:start-loop` fires inside a subagent, stop immediately and report to the parent. Do not fall back to inline execution.

**Verify `Agent` schema is callable before the first task dispatch:**

1. **Preloaded** — `Agent` (alias `Task`) appears in the top-level `<functions>` block. Use directly.
2. **Deferred** — listed by name in a `<system-reminder>` deferred-tools section but schema absent. Raw call fails with `InputValidationError`. Load first via `ToolSearch query="select:Agent" max_results=1`. The returned `<functions>` entry makes `Agent` callable for the rest of the turn.
3. **Neither** — surface to user; do not retry inline.

## Core Principles

### Context Hygiene (CRITICAL)

```yaml
context_management:
  rule: "Each loop iteration MUST run in a fresh subagent"
  why: "Prevents context pollution and accumulated confusion"
  how: "Main loop orchestrates, spawns new subagent per iteration"
  never: "Reuse subagent context across iterations"
```

### Adversarial Cooperation Roles

- **Implementer**: Execute tasks following instructions. Mindset: make it work correctly.
- **Verifier**: Challenge implementation to find flaws. Mindset: break it, find edge cases, question assumptions.
- **Adjuster**: Update plans based on discoveries. Mindset: learn and improve iteratively.

## Decision Flow

```
0.  Check for interrupted loop (.workflow/loop-state.json)
0.5 Check for project rules (.claude/rules/karpathy-principles.md)
1.  Load task list (arg | .workflow/tasks.md | TASKS.md | interactive)
2.  Initialize loop state (.workflow/loop-state.json)
3.  Plan File Layout (active vs archive vs meta)
4.  Execute adversarial loop (per-task fresh subagent)
    4.1 Context validation check
    4.2 Spawn fresh task-executor subagent
    4.3 Wait for subagent completion (sync)
    4.4 Process subagent result (success | failure)
    4.5 Context barrier (discard implementation details)
5.  Loop control (until all done | user stop | failure decision)
6.  Status reporting (per iteration)
```

## Reference Pointers

Each row is a fetch instruction the driver MUST follow before acting on that decision branch. Skipping the reference and improvising from this body alone is a protocol violation.

| Branch | Load reference before proceeding |
|--------|----------------------------------|
| §1 task list (file format spec) | `references/dispatch-examples.md` § "Task List Format (full)" |
| §2 loop state init (full schema) | `references/dispatch-examples.md` § "Loop State Schema (full)" |
| §3 plan-meta KDL shape | `references/dispatch-examples.md` § "Plan-Meta KDL Shape (full)" |
| §3 atomic rotation | `references/dispatch-examples.md` § "Atomic Rotation (full step-by-step)" |
| §3 driver read discipline | `references/dispatch-examples.md` § "Driver Read Discipline (full)" |
| §3 plan recovery | `references/dispatch-examples.md` § "Recovery" |
| §4.2 dispatch prompt template | `references/dispatch-examples.md` § "Executor Dispatch Pattern" + "Dispatch Prompt Compression" |
| §4 worked iteration example | `references/dispatch-examples.md` § "Loop Iteration Example (context isolation)" |
| §6 status report template | `references/dispatch-examples.md` § "Status Reporting Template" |
| Dart-backed fork | `references/dispatch-examples.md` § "Dart Fetch Discipline (if backed by Dart)" |

**Subagent-skip-fetch mitigation**: each row is mandatory. If the driver dispatches an executor without loading the dispatch prompt template (with compression rules), the executor receives a malformed prompt — surface as a protocol violation.

## Process

### 0. Check for Interrupted Loop

開始前，檢查上次會話是否被中斷：

```
Read .workflow/loop-state.json if it exists.
If status is "interrupted":
  1. Show the user: "Previous loop was interrupted at [interrupted_at]"
  2. Show completed/total task counts and current_task_index
  3. Ask: "Resume the interrupted loop, or start fresh?"
```

### 0.5 Check for Project Rules

`test -d .claude/rules && test -f .claude/rules/karpathy-principles.md`. If missing, warn (not block): the loop runs with default thresholds.

### 1. Load Task List

Argument > `.workflow/tasks.md` > `TASKS.md` > interactive creation. Format: `references/dispatch-examples.md` § "Task List Format (full)".

### 2. Initialize Loop State

Create `.workflow/loop-state.json`. Full schema: `references/dispatch-examples.md` § "Loop State Schema (full)".

### 3. Plan File Layout (Active vs Archive vs Meta)

Three files:

| File | Content | Read by | Write semantics |
|------|---------|---------|-----------------|
| `.workflow/plan.md` | Active phase + open checkpoints + current spec | Loop driver, executor, reviewers | Truncate-and-rewrite on rotation |
| `.workflow/plan-archive.md` | Completed phases (append-only history) | Explicit retrospectives only | Append-only |
| `.workflow/plan-meta.kdl` | Pointers, checkpoint markers, `last_rotated` timestamp | Loop driver | Atomic full-rewrite |

**Rotation rule**: when a phase is `done` AND no downstream phase blocked on its checkpoints, move it from `plan.md` → `plan-archive.md`, update `plan-meta.kdl`.

**Atomic write order (CRITICAL)**: archive append → meta update → plan truncate. Never reverse. Full step-by-step with verify+rollback per step: `references/dispatch-examples.md` § "Atomic Rotation (full step-by-step)".

**Driver read discipline**: loop driver reads `plan.md` only during normal iteration. `plan-archive.md` is for explicit retrospectives. `plan-meta.kdl` is the pointer file for state queries. Full rules: `references/dispatch-examples.md` § "Driver Read Discipline (full)".

### 4. Execute Adversarial Loop

**Each task runs in a fresh subagent. No context reuse across iterations.**

Per-task sequence:

#### 4.1 Pre-spawn checks
- Task is context-sized (max 5 files)
- Clear acceptance criteria exist
- Previous subagent has terminated (no context leakage)
- Loop state is persisted to disk

#### 4.2 Spawn fresh task-executor subagent

Dispatch via `Task` (or `Agent` alias) with `subagent_type: "workflow:task-executor"`. Compressed prompt template + sentence-preservation exceptions + forbidden compression zones: `references/dispatch-examples.md` § "Dispatch Prompt Compression" + "Executor Dispatch Pattern".

#### 4.3 Wait for subagent completion (sync)

Subagent runs the adversarial-quality skill, tracks progress internally, returns success/failure with detailed report, updates `.workflow/loop-state.json` before terminating. **Main loop waits synchronously — no parallel task execution.**

#### 4.4 Process result

On **success**: read completion report from loop state file; log summary; mark task completed with timestamp; rotate completed phase to archive if this task closed a plan phase (apply atomic order from §3); continue to next task with NEW subagent.

On **failure**: read failure report; log which stage failed and why; mark task failed; decide retry / skip / stop loop; if retry, spawn NEW subagent (still fresh context).

**絕不恢復或重用子代理——始終生成全新的。**

#### 4.5 Context barrier

Persist between tasks: loop orchestration state, task completion stats, loop config. **Discard**: all task-specific implementation details, file contents from previous task, code changes from previous task, error messages from previous task. Main loop is a STATELESS executor, not a context accumulator.

### 5. Loop Control

Continue until: all tasks done | user says "stop loop" / "cancel" / "pause" / `/workflow:stop-loop` | session ends | critical security finding (immediate stop).

### 6. Status Reporting

Per-iteration progress display. Template: `references/dispatch-examples.md` § "Status Reporting Template".

## Context-Sized Task Requirements

Every task must be: max 5 files, single feature or fix scope, clear acceptance, bounded changes, no cross-task dependencies. If too large, split — keeps each iteration within context limits.

## Usage Examples

```bash
# Start with default task list
/workflow:start-loop

# Start with custom task list
/workflow:start-loop my-tasks.md
```

## Stopping the Loop

Say any of: "stop the loop" | "cancel workflow" | "pause execution" | `/workflow:stop-loop`. Or for immediate stop: "security critical" | "abort".

## Companion Reference

- **`references/dispatch-examples.md`** — full task-list format spec, loop-state JSON schema, plan-meta KDL shape, atomic rotation step-by-step (with verify+rollback), driver read discipline, dispatch prompt compression rules + executor template, worked iteration example, Dart fetch discipline, status reporting template.
