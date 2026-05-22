---
name: dev-standards-to-issues
description: "Break a plan/PRD into independently-grabbable Dart tasks using tracer-bullet vertical slices (AFK/HITL). Use when: convert plan into tasks, create implementation tickets, break down work into Dart tasks, slice a feature"
disable-model-invocation: true
---

# To Issues

Break a plan into independently-grabbable **Dart tasks** using vertical slices (tracer bullets).

> Prefer `lci:explore` to understand current code state before slicing; fall back to Grep/Read if the lci plugin is unavailable. Use `.claude/rules/glossary.md` vocab in task titles; respect ADRs in the area.

## Process

### 1. Gather context
Work from what's in the conversation. If the user passes a plan/PRD reference (path or Dart task id), read it fully.

### 2. Draft vertical slices
Each slice is a **tracer bullet** — a thin path cutting through ALL layers end-to-end (schema, API, UI, tests), NOT a horizontal slice of one layer.
- Each slice delivers a narrow but COMPLETE path; a completed slice is demoable/verifiable on its own.
- Prefer many thin slices over few thick ones.
- Mark each slice **AFK** (implementable + mergeable with no human interaction) or **HITL** (needs an architectural decision or design review). Prefer AFK where possible.

### 3. Quiz the user
Present the breakdown as a numbered list. Per slice: Title, Type (AFK/HITL), Blocked-by, User-stories-covered. Ask: granularity right? dependencies correct? merge/split any? AFK/HITL correct? Iterate until approved.

### 4. Publish to Dart
For each approved slice, create a Dart task via dart-query `create_task` (routed through slop-mcp), per the repo task-management policy:
- `title` — short, glossary vocab. `dartboard` — the project's dartboard (ask or use the configured default; for this repo `Personal/agnt`).
- `priority` / `size` — **strings** (`high`/`medium`/`low`; `XS`/`S`/`M`/`L`/`XL`), never integers.
- Description — end-to-end behavior + acceptance criteria checkboxes. Avoid file paths/code snippets (they go stale); exception: a prototype-derived snippet that encodes a decision (state machine, schema, type shape).
- **Dependencies:** create children first, then set `subtask_ids` on the parent (dart-query ignores `parentId`). Publish in dependency order so "Blocked by" can reference real task ids.

Do NOT close or modify any parent task.

> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Original: `skills/engineering/to-issues` (retargeted to Dart).
