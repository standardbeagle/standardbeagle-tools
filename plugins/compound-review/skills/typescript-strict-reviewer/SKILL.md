---
name: compound-review-typescript-strict-reviewer
description: "Forked-context TypeScript-strict reviewer — preloads verdict schema + type-safety/any/unchecked-cast/nullable-flow lens. 對抗TS嚴格審查（fork上下文）。 Use when: dispatch compound-review:typescript-strict-reviewer for TS diff, gate on type safety, when reviewer must not pollute main thread"
disable-model-invocation: true
context: fork
agent: "compound-review:typescript-strict-reviewer"
---

<!-- CC 2.1 fork decision: TS-strict review reads source and type files, traces nullable flows, and checks for type-system loopholes across the diff. Forking keeps intermediate file reads out of the main loop. Executor: compound-review:typescript-strict-reviewer (preloads dartai:code-quality + this companion skill). Fallback: if `context: fork` is unsupported, the agent still emits the same verdict file — only token efficiency degrades. -->

# TypeScript Strict Reviewer Skill (compound-review companion)

對抗性TypeScript嚴格審查的薄入口技能。當主循環fork出TS審查子代理時，此技能在fork上下文內預加載審查視角，使類型流程分析等中間步驟不污染主線程，僅最終verdict檔案回流。

## Why this skill exists

1. **Context isolation** — TS-strict review traces nullable flows, reads related type definitions, and checks refactor regressions across multiple files. Without fork, those reads accumulate in the main loop.
2. **Single source of truth for output shape** — The agent file describes *how to think*. This skill points at *what to emit* (verdict-schema file channel).
3. **Feature detection** — Fallback below preserves behavior on pre-2.1 harness.

## Loaded context

When this skill activates inside the forked subagent:

- **Verdict schema** — `plugins/dartai/skills/verdict-schema.md` (canonical, file-streaming channel)
- **Code quality playbook** — `plugins/dartai/skills/code-quality.md` (completeness rules, no-cop-out discipline, structural complexity caps)
- **Agent playbook** — `plugins/compound-review/agents/typescript-strict-reviewer.md` (type-system loopholes, complexity, refactor regression risk, five-second rule, hard-to-test structure)

## Review lens (one-liner)

以嚴格之TypeScript類型安全門檻審視diff——關閉檢查器之漏洞（any、不安全轉型、unchecked nullable）直接可見即標blocker。

## Output contract

Write verdict to `.dartai/reports/<task-id>/ts-strict.md` (line-oriented file channel). Stdout ≤5 lines: path pointer + one-line verdict.

```
verdict: pass|fail|warn
confidence: high|med|low
blocker: <file:line> <one-line description>
advisory: <one-line nit>
evidence: <path or inline body>
```

Verdict mapping: Type loophole directly visible in diff (`any`, unchecked cast, removed nullable guard) → `fail` + blocker (HIGH confidence). Naming / abstraction boundary judgments → `warn` + advisory (MED confidence). Low-confidence style preference → suppress.

## Fallback (pre-2.1 harness)

If the runtime does not honor `context: fork`, the skill still loads, the reviewer still writes the verdict file, gate semantics unchanged. Only isolation benefit is lost.

## Related

- `dartai:verdict-schema` — wire format and file-streaming protocol
- `dartai:code-quality` — completeness + type-safety rules
- `compound-review:agents/typescript-strict-reviewer` — the agent that binds this skill
