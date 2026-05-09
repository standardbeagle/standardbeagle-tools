---
name: dartai-qa-reviewer
description: "Forked-context QA reviewer — preloads verdict schema + testing-pyramid lens + assertion/edge-case/TDD checklist. 對抗QA審查（fork上下文）。 Use when: dispatch qa-reviewer subagent, adversarial QA review, gate on test quality, when reviewer must not pollute main thread"
context: fork
agent: "dartai:qa-reviewer"
---

<!-- CC 2.1 fork decision: reviewer subagent reads test files, runs LCI queries, and surfaces dozens of intermediate findings. Forking keeps that work isolated; main loop sees only the verdict YAML block defined in verdict-schema.md. Executor: dartai:qa-reviewer (preloads testing-strategy + this companion skill). Fallback: if `context: fork` is unsupported by the harness, the agent still emits the same verdict-only output, and the orchestrator absorbs the (smaller) prose context — behavior preserved, only token efficiency degraded. -->

# QA Reviewer Skill (companion)

對抗性QA審查的薄入口技能。當主循環fork出QA審查子代理時，此技能在fork上下文內預加載審查視角，使審查者讀文件、查詢LCI、對比驗收標準等中間步驟不污染主線程，僅最終verdict YAML塊回流。

## Why this skill exists 此技能存在之由

1. **Context isolation** — QA review reads many test files and emits many intermediate findings. Without fork, every Read/Grep payload accumulates in the main loop's context window, multiplied across N tasks per loop iteration.
2. **Single source of truth for output shape** — The agent file (`dartai:qa-reviewer`) describes *how to think*. This skill points at *what to emit* (verdict-schema) and *how to think about tests* (testing-strategy). The agent's `skills:` array binds both at fork time.
3. **Feature detection** — When `context: fork` is unsupported, the orchestrator still gets the same verdict block; only token-efficiency degrades. See "Fallback" below.

## Loaded context 加載之上下文

When this skill activates inside the forked subagent, the agent has access to:

- **Verdict schema** — `plugins/dartai/skills/verdict-schema.md` (canonical wire shape, ≤30-line budget, `verdict_mapping` rules)
- **Testing strategy** — `plugins/dartai/skills/testing-strategy.md` (three-tier pyramid, RED/GREEN, edge-case taxonomy)
- **Agent playbook** — `plugins/dartai/agents/qa-reviewer.md` (the 11 review areas, attack vectors, internal verdict mapping)

The agent does the deep analysis; this skill keeps the reviewer disciplined to emit only the verdict block.

## Review lens (one-liner)

假設測試不足，直至證明充分。每個行為均已測試，每個邊緣案例均已覆蓋，每個斷言均強而有力。

## Output contract

Emit a single fenced YAML block as the **final message body**, ≤30 lines. Schema and examples in `plugins/dartai/skills/verdict-schema.md`. No preamble, no postamble.

```yaml
verdict: pass | fail | warn
confidence: high | med | low
blockers:
  - "<file:line> — <one-line description>"
advisories:
  - "<one-line nit or follow-up>"
evidence_path: ".dartai/reports/<task-id>/qa-reviewer.md"  # optional
```

When findings exceed the budget, write detail to `.dartai/reports/<task-id>/qa-reviewer.md` and reference it via `evidence_path`.

## Fallback (pre-2.1 harness)

If the runtime does not honor `context: fork`:

- The skill is still loaded by the agent's `skills:` array and provides the same in-prompt context.
- The reviewer still emits the verdict-only YAML block; downstream parsing is unchanged.
- Only the *isolation* benefit is lost — intermediate Reads/Greps may surface in the parent transcript. Pass/fail gate semantics are preserved.

Detection (orchestrator-side, optional): a fork-aware harness reports a child-context delta near the size of the verdict block. A fork-unaware harness reports a delta closer to the full subagent transcript. Either way, the verdict drives the gate.

## Related

- `dartai:verdict-schema` — wire format and consumer contract
- `dartai:testing-strategy` — testing pyramid + RED/GREEN
- `dartai:agents/qa-reviewer` — the actual reviewer agent that binds this skill
