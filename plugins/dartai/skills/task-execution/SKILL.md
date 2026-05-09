---
name: dartai-task-execution
description: "Task execution workflow and quality pipeline for Dart task automation. Dart任務執行工作流與品質管道。 Use when: execute dart task, run quality pipeline, implement task, code review workflow, task automation"
context: fork
---

# Task Execution Workflow

此技能提供通過完整品質管道執行Dart任務之工作流。Skill body holds index + decision flow only. Detailed step instructions live in `references/` and are loaded on demand at decision points (see "Reference Pointers" below).

## Trigger

Use when executing a Dart task end-to-end through the quality pipeline. Caller is typically the `task-executor` agent under `dartai:start` or `dartai:task`.

## Pipeline Overview

```
Task Start
    ↓
-1. Read Project Rules (.claude/rules/*)
    ↓
0. Read Domain Model (docs/DOMAIN.md)
    ↓
1. Read Grilled Task Spec
    ↓
1.5. Refactor-First Assessment
    ↓
2. Implement Changes (Strict TDD: RED → GREEN → REFACTOR)
    ↓
3. Code Review (Self)
    ↓
4. Linting
    ↓
5. Testing
    ↓
6. LCI Evaluation (+ Findability)
    ↓
7. Refactor Check
    ↓
8. Deprecated Cleanup
    ↓
8.5. Domain Check
    ↓
9. Final Validation
    ↓
Task Complete / Failed
```

## Decision Flow & Reference Pointers

Each step is a decision point. **Load the corresponding reference only when entering that step** — do not pre-load.

| Step | When to enter | Load reference before proceeding |
|------|---------------|----------------------------------|
| -1 Project Rules | Always at task start | `references/examples.md` § "Step -1" |
| 0 Domain Model | Always before any code change | `references/examples.md` § "Step 0" |
| 1 Grilled Spec | After rules+domain loaded | `references/examples.md` § "Step 1" |
| 1.5 Refactor-First | Spec lists files that need restructuring before changes fit | `references/examples.md` § "Step 1.5" |
| 2 Implement (TDD) | Spec is clear; refactor-first done | `references/examples.md` § "Step 2" |
| 3 Self Review | Implementation compiles | `references/examples.md` § "Step 3" |
| 4 Linting | Self-review clean | `references/examples.md` § "Step 4" |
| 5 Testing | Lint clean | `references/examples.md` § "Step 5" |
| 6 LCI Eval | Tests green | `references/examples.md` § "Step 6" |
| 7 Refactor Check | LCI clean | `references/examples.md` § "Step 7" |
| 8 Deprecated Cleanup | Refactor check clean | `references/examples.md` § "Step 8" |
| 8.5 Domain Check | Cleanup done; domain model exists | `references/examples.md` § "Step 8.5" |
| 9 Final Validation | All gates green | `references/examples.md` § "Step 9" + Quality Gates table |

**Memory writes** (any step): if a step writes to `.dartai/loop-state.json`, project memory files, or Dart task memory comments, **load `references/memory-protocol.md` before writing** — it specifies the required `timestamp` + `source_event` fields and the canonical schema.

**Subagent-skip-fetch mitigation**: each table row is a fetch instruction the executor MUST follow before acting on that step. If the executor proceeds without loading the referenced section, it is operating without spec — surface as a protocol violation.

## Universal Rules (always in body)

These apply to every step regardless of which reference is loaded:

- **One step at a time.** Do not interleave steps. If a step's verification fails, fix and re-run that step before advancing.
- **Step ordering is mandatory.** Refactor-First (1.5) before Implement (2). Lint (4) before Test (5). Domain Check (8.5) before Final Validation (9).
- **Memory entries require timestamp + source_event.** No exceptions on loop iterations. Load `references/memory-protocol.md` at first write.
- **Project rules win.** When `.claude/rules/*.md` contradicts a default in this skill, project rule wins.
- **Skill-of-skill discipline.** When a step references another skill (e.g. `dev-standards:refactor-first-assessment`, `dev-standards:grill-task`, `dev-standards:verification-before-completion`), invoke that skill via the `Skill` tool — do not paraphrase its rules.

## Failure Handling

任何步驟失敗時：

1. **Log the failure** with specific error message and step number
2. **Update task in Dart** with failure details (status: Blocked, comment with phase + error)
3. **Stop the pipeline** — do not advance steps
4. **Report to user** with: which step failed, specific error, suggested fix, files affected

Do not retry the same fix more than twice. After two retries, surface as a blocker to the parent loop.

## Success Handling

管道完成時：

1. **Update task status** to "Done"
2. **Add completion comment** to Dart task
3. **Update documentation** (CHANGELOG, etc.) — only when the task touched user-visible behavior
4. **Report success** with summary
5. **Continue to next task** (if in loop) — return to the parent loop driver, do not chain in-context

**Note:** Git commit and push are handled by the main loop driver, not the executor subagent. The executor leaves changes staged or unstaged for the driver to commit.

## Companion References

- **`references/examples.md`** — full per-step instructions, checklists, and TDD/RED-GREEN-REFACTOR detail. Load on entry to each step.
- **`references/memory-protocol.md`** — `timestamp` + `source_event` schema and write examples. Load on first memory write per task.

## Quality Gates (summary)

| Step | Pass Criteria |
|------|---------------|
| Domain Model | New concepts named in DOMAIN.md before coding |
| Understand | Task is clear and actionable |
| Refactor First | Extension point exists naturally, existing tests pass |
| Implement | Changes compile/run without error |
| Review | No major issues found |
| Linting | Zero errors (warnings allowed) |
| Testing | All tests pass, coverage maintained |
| LCI | No duplicate code, consistent patterns, new code is findable |
| Domain Check | No rejected synonyms, new concepts in DOMAIN.md |
| Refactor | Clean code, no debug artifacts |
| Cleanup | No deprecated code remains |
| Validate | All criteria met, domain model updated, task complete |

Full pass-criteria narrative for each row: `references/examples.md` § "Quality Gates Reference Table".
