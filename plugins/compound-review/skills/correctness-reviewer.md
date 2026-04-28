---
name: correctness-reviewer
description: "Forked-context correctness reviewer playbook — preloads verdict schema and logic/edge-case/state-management lens for adversarial correctness review subagents. 對抗正確性審查者技能：邏輯錯誤、邊界情況、狀態管理、錯誤傳播視角，verdict-only輸出（fork上下文）。 Use when: dispatching compound-review:correctness-reviewer subagent, gating on logic correctness, when reviewer should not pollute main thread"
context: fork
agent: compound-review:correctness-reviewer
---

<!-- CC 2.1 fork decision: correctness review traces input through branches, tracks state across calls, and produces intermediate analysis for every significant path. Forking keeps that work isolated from the main loop. Executor: compound-review:correctness-reviewer (preloads dartai:code-quality + this companion skill). Fallback: if `context: fork` is unsupported, the agent still emits the same verdict file — only token efficiency degrades. -->

# Correctness Reviewer Skill (compound-review companion)

對抗性正確性審查的薄入口技能。當主循環fork出正確性審查子代理時，此技能在fork上下文內預加載審查視角，使中間分析步驟不污染主線程，僅最終verdict檔案回流。

## Why this skill exists

1. **Context isolation** — Correctness review traces execution paths, checks null propagation, and identifies race conditions across multiple files. Without fork, every Read/Grep accumulates in the main loop.
2. **Single source of truth for output shape** — The agent file (`compound-review:correctness-reviewer`) describes *how to think*. This skill points at *what to emit* (verdict-schema file channel).
3. **Feature detection** — When `context: fork` is unsupported, behavior is preserved (same verdict file); only token efficiency degrades.

## Loaded context

When this skill activates inside the forked subagent:

- **Verdict schema** — `plugins/dartai/skills/verdict-schema.md` (canonical wire shape, file-streaming channel)
- **Code quality playbook** — `plugins/dartai/skills/code-quality.md` (error handling rules, edge-case discipline, intent-vs-implementation checks)
- **Agent playbook** — `plugins/compound-review/agents/correctness-reviewer.md` (hunt list: off-by-one, null propagation, race conditions, state transitions, swallowed errors)

## Review lens (one-liner)

以心智執行讀碼——追蹤輸入穿越分支、跨呼叫追蹤狀態、捕獲因無人測試該輸入而通過之bug。

## Output contract

Write verdict to `.dartai/reports/<task-id>/correctness.md` (line-oriented file channel). Stdout ≤5 lines: path pointer + one-line verdict. Schema in `plugins/dartai/skills/verdict-schema.md` ("Verdict File Delivery").

```
verdict: pass|fail|warn
confidence: high|med|low
blocker: <file:line> <one-line description>
advisory: <one-line nit>
evidence: <path or inline body>
```

Verdict mapping: HIGH-confidence bug (traceable from input to wrong output) → `fail` + blocker. Medium-confidence (depends on caller context) → `warn` + advisory. Low-confidence (runtime-condition dependent) → suppress.

## Fallback (pre-2.1 harness)

If the runtime does not honor `context: fork`:

- The skill still loads in the agent's prompt and provides the same playbook context.
- Reviewer still writes the verdict file; gate semantics unchanged.
- Only isolation benefit is lost. Behavior preserving.

## Related

- `dartai:verdict-schema` — wire format and file-streaming protocol
- `dartai:code-quality` — quality checklist used for error-handling cross-checks
- `compound-review:agents/correctness-reviewer` — the agent that binds this skill
