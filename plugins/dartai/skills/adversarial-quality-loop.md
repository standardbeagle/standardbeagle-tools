---
name: adversarial-quality-loop
description: Adversarial cooperation loop for code quality verification with plan adjustment at each phase. 對抗協作循環：實施者與驗證者互相制衡，逐階調整計劃，確保代碼品質。 Use when: execute dart task, run quality pipeline, adversarial review, implement with verification
context: fork
---

# Adversarial Quality Loop (Ralph Wiggum Pattern)

實施者與驗證者對抗協作之持續執行環，確保代碼品質。驗證者主動尋缺，實施者守護與修復。

This skill body holds trigger conditions, the phase index, dispatch prerequisites, and core principles. Per-phase DO/DO-NOT detail, eagle-eye violation patterns, reviewer dispatch prompts, and cite-verify rules live in `references/*.md` and are loaded on demand at the matching decision branch.

## Trigger

Use when the task-executor agent runs the full adversarial pipeline on a Dart task. Caller is `task-executor` under `dartai:start`, `dartai:task`, or `workflow:start-loop`.

## Agent Dispatch Prerequisites

This loop dispatches reviewer subagents in parallel via `Agent` (alias `Task`). Two prerequisites apply at the dispatch site:

1. **Top-level driver only.** Subagents cannot spawn subagents — the harness scopes the deferred-tool list per-agent and does not surface `Agent`/`Task` to nested runners. If this skill executes inside a subagent, stop and report to the parent. Do not fall back to inline reviewer logic — that would collapse the adversarial separation the loop depends on.
2. **先試 `Agent`（alias `Task`）。** 無預檢，毋查 deferred-tools。成則直行；若報 `not available`、`no such tool`、或 schema error，乃入降級路。若真無此工具，再告 user.

## Core Principles

### Context-Sized Tasks

每環中任務須：
- **Scoped**: 單次專注會話可完成
- **Isolated**: 與其他並發工作獨立
- **Measurable**: 完成定義明確
- **Bounded**: 每任務最多3-5個文件

### Plan Adjustment Protocol

每階段結束後，**自動**（勿停待確認）：審視所發現內容；依發現更新餘下任務；若發現阻塞問題則重新排序；在任務評論中記錄調整；**立即繼續**下一階段，除非BLOCKED。

```yaml
plan_adjustment_rules:
  automatic_continuation:
    description: "Phase transitions are automatic, not approval gates"
    behavior: "Adjust plan silently and continue"

  when_to_stop:
    - "Task scope exceeds limits (split required)"
    - "Critical blocker found (cannot proceed)"
    - "Security vulnerability discovered (must fix first)"
    - "All tests failing with no clear fix"

  when_to_continue:
    - "Minor issues found (add fix tasks, continue)"
    - "Scope clarification needed (note and continue)"
    - "New edge cases discovered (add to plan, continue)"
    - "Pattern conflicts found (note for later, continue)"

  never_ask:
    - "Should I continue?"
    - "Do you want me to proceed?"
    - "Is this plan okay?"
    - "Ready for next phase?"
```

## Phase Index & Reference Pointers

```
Phase 0 — Git Hygiene & TDD Setup
Phase 1 — Read Grilled Task Spec
Phase 2 — Adversarial Implementation
Phase 3 — Concurrent Adversarial Review (verdict-file channel)
Phase 4 — Quality Gate Verification (lint, test, coverage, static analysis)
Phase 4.5 — Review for Plan Updates (C-class refactor discovery)
Phase 5 — Post-Task Deep Review (security, performance, PM, replan)
Phase 5.5 — Lightweight Cite Verify (post-commit, pre-Done)
Phase 6 — Final Validation
```

**Each phase entry is a fetch instruction** the executor MUST follow before acting on that phase. Skipping the reference and improvising from this body alone is a protocol violation.

| Entering | Load reference before proceeding |
|----------|----------------------------------|
| Phase 0 (git + TDD setup) | `references/phases.md` § "Phase 0" |
| Phase 1 (spec confirm) | `references/phases.md` § "Phase 1" |
| Phase 2 (implementation + self-review) | `references/phases.md` § "Phase 2" + `references/eagle-eye.md` (verifier role) |
| Phase 3 (parallel reviewers) | `references/dispatch.md` (full prompts, verdict-file channel, result handling) |
| Phase 4 (quality gates) | `references/phases.md` § "Phase 4" |
| Phase 4.5 (refactor discovery) | `references/phases.md` § "Phase 4.5" |
| Phase 5 (post-task deep review) | `references/phases.md` § "Phase 5" |
| Phase 5.5 (cite verify) | `references/cite-verify.md` |
| Phase 6 (final validation) | `references/phases.md` § "Phase 6" + "Loop Continuation Protocol" |
| Any verifier moment (self-review, Phase 3, Phase 5) | `references/eagle-eye.md` for the seven violation classes |

## Eagle-Eye Violations (rejection grounds)

When the verifier role activates (Phase 2 self-review, Phase 3 parallel reviewers, Phase 5 deep review), **load `references/eagle-eye.md` before approving anything**. Seven violation classes — any single occurrence is grounds for immediate rejection:

1. Scope creep & gold plating
2. Over-engineering & complexity
3. Incomplete work markers (TODO/FIXME/XXX/HACK/STUB/...)
4. Giving up / "too hard" cop-outs
5. Codebase integration failure (code doesn't blend)
6. Test ownership violations (blame, "not my test")
7. Eagle-eye verification checklist (automated + manual)

Detection rules, pattern lists, and verdict semantics for each class live in `references/eagle-eye.md`. The body of this skill names the classes; do not approve from class names alone — load the reference for detection rules.

## Verdict-File Channel (Phase 3 + Phase 5)

Reviewers write verdicts to `.dartai/reports/<task-id>/<role>.md` (line-oriented per `verdict-schema.md`). The driver gates on file content, not stdout body. **Always clear the reports dir at Phase 3 entry**, even on retry-after-fix — stale verdict files would otherwise be parsed as the current decision.

Full protocol (clear/recreate, parallel dispatch prompts for all five always-on + two conditional reviewers, Monitor fallback, retry rules, conditional-skip handling): `references/dispatch.md`.

## Loop Continuation Protocol (Phase 6 close)

1. **On Success**: Update task status to Done; add completion comment with summary; log metrics; **RETURN to main loop** (it spawns the next task subagent).
2. **On Failure**: Document the specific failure point; add failure comment with details; recommend whether a fix task is needed; identify blocked downstream tasks; **RETURN to main loop** (do NOT stop the loop — the loop owns continuation decisions). You are one iteration.
3. **Plan Adjustment Summary** is logged into `.dartai/loop-state.json` under the task entry — see `references/phases.md` § "Loop Continuation Protocol" for the full schema.

## Metrics

每任務追蹤：每階段耗時、各點所作調整、各類別發現問題、修復有效率。
跨任務追蹤：常見失敗模式、階段瓶頸、調整頻率、品質趨勢。

## Companion References

- **`references/phases.md`** — full Phase 0/1/2/4/4.5/5/6 spec (DO/DO-NOT, verification criteria, plan adjustment checkpoints, loop continuation schema).
- **`references/dispatch.md`** — Phase 3 reviewer dispatch playbook: prepare reports dir, parallel reviewer prompts (5 always-on + 2 conditional), verdict-file consumption rules, Monitor fallback, retry/skip handling.
- **`references/eagle-eye.md`** — seven violation classes with full detection rules, pattern lists, examples, and verdict semantics. Load whenever the verifier role is active.
- **`references/cite-verify.md`** — Phase 5.5 lightweight citation verification: form-specific check rules (file:line, symbol, git_sha, memory_id), retry budget, Tier separation.
