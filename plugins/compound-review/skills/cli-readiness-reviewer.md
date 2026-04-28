---
name: cli-readiness-reviewer
description: "Forked-context CLI agent-readiness reviewer playbook — preloads verdict schema and non-interactive/structured-output/actionable-errors/idempotent-retry lens for adversarial CLI review subagents. 對抗CLI代理就緒審查者技能：非交互式、結構化輸出、可操作錯誤、冪等重試視角，verdict-only輸出（fork上下文）。 Use when: dispatching compound-review:cli-readiness-reviewer subagent for a CLI diff, gating on agent ergonomics, when reviewer should not pollute main thread"
context: fork
agent: compound-review:cli-readiness-reviewer
---

<!-- CC 2.1 fork decision: CLI-readiness review reads command definitions, traces argument handling, and evaluates output ergonomics across CLI source and spec files. Forking keeps those reads isolated from the main loop. Executor: compound-review:cli-readiness-reviewer (preloads dartai:code-quality + this companion skill). Fallback: if `context: fork` is unsupported, the agent still emits the same verdict file — only token efficiency degrades. -->

# CLI Agent-Readiness Reviewer Skill (compound-review companion)

對抗性CLI代理就緒審查的薄入口技能。當主循環fork出CLI審查子代理時，此技能在fork上下文內預加載審查視角，使命令定義讀取、輸出形態分析等中間步驟不污染主線程，僅最終verdict檔案回流。

## Why this skill exists

1. **Context isolation** — CLI-readiness review reads command definitions, traces argument parsing, and evaluates output handling across CLI source files. Without fork, those payloads accumulate in the main loop.
2. **Single source of truth for output shape** — The agent file describes *how to think*. This skill points at *what to emit* (verdict-schema file channel).
3. **Feature detection** — Fallback below preserves behavior on pre-2.1 harness.

## Loaded context

When this skill activates inside the forked subagent:

- **Verdict schema** — `plugins/dartai/skills/verdict-schema.md` (canonical, file-streaming channel)
- **Code quality playbook** — `plugins/dartai/skills/code-quality.md` (error handling rules, completeness discipline)
- **Agent playbook** — `plugins/compound-review/agents/cli-readiness-reviewer.md` (7 principles: non-interactive defaults, structured output, help text, actionable errors, safe retries, pipeline behavior, bounded output)

## Review lens (one-liner)

以自主代理視角評CLI——代理須調用命令、解析輸出、處理錯誤、鏈接操作而無人類介入。

## Output contract

Write verdict to `.dartai/reports/<task-id>/cli-readiness.md` (line-oriented file channel). Stdout ≤5 lines: path pointer + one-line verdict.

Severity constraint: CLI-readiness findings never exceed P1. Map to verdict:
- Blocker (P1, directly visible) → `fail` + blocker (HIGH confidence)
- Friction (P2) → `warn` + advisory
- Optimization (P3) → `warn` + advisory (or suppress if LOW confidence)

```
verdict: pass|fail|warn
confidence: high|med|low
blocker: <file:line> <one-line description>
advisory: <one-line nit>
evidence: <path or inline body>
```

All findings are `autofix_class: manual` — CLI ergonomics are design decisions.

## Fallback (pre-2.1 harness)

If the runtime does not honor `context: fork`, the skill still loads, the reviewer still writes the verdict file, gate semantics unchanged. Only isolation benefit is lost.

## Related

- `dartai:verdict-schema` — wire format and file-streaming protocol
- `dartai:code-quality` — error-handling + completeness rules
- `compound-review:agents/cli-readiness-reviewer` — the agent that binds this skill
