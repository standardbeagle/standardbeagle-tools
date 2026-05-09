---
name: qa-reviewer
description: "Forked-context QA reviewer playbook (workflow mirror) — preloads verdict schema + testing-pyramid lens + assertion/edge-case/TDD checklist for adversarial QA review subagents. 對抗QA審查者技能（workflow鏡像）：測試金字塔、斷言、邊緣案例、TDD合規（fork上下文）。 Use when: dispatching workflow:qa-reviewer subagent, running adversarial QA in workflow loop, gating on test quality, when reviewer should not pollute main thread"
context: fork
agent: workflow:qa-reviewer
---

<!-- CC 2.1 fork decision: workflow mirror of dartai:qa-reviewer. Reviewer subagent reads test files, runs LCI queries, and surfaces dozens of intermediate findings. Forking keeps that work isolated; main loop sees only the verdict YAML block. Executor: workflow:qa-reviewer (preloads testing-strategy + this companion skill). Fallback: if `context: fork` is unsupported, the agent still emits the same verdict-only output — only token efficiency degrades. -->

# QA Reviewer Skill (workflow mirror, companion)

對抗性QA審查的薄入口技能（workflow plugin 鏡像）。當workflow主循環fork出QA審查子代理時，此技能在fork上下文內預加載審查視角，使讀文件、查詢LCI、對比驗收標準等中間步驟不污染主線程，僅最終verdict YAML塊回流。

## Why this skill exists

1. **Context isolation** — QA review reads many test files and emits many intermediate findings. Without fork, every Read/Grep payload accumulates in the main loop, multiplied across N tasks per workflow iteration.
2. **Single source of truth for output shape** — The agent file (`workflow:qa-reviewer`) describes *how to think*. This skill points at *what to emit* (verdict-schema) and *how to think about tests* (testing-strategy).
3. **Feature detection** — Fallback below preserves behavior on pre-2.1 harness.

## Loaded context

When this skill activates inside the forked subagent:

- **Verdict schema** — `plugins/dartai/skills/verdict-schema.md` (canonical wire shape, shared across both plugins)
- **Testing strategy** — `plugins/workflow/skills/testing-strategy.md` (three-tier pyramid, RED/GREEN, edge-case taxonomy)
- **Agent playbook** — `plugins/workflow/agents/qa-reviewer.md` (review areas, attack vectors, internal verdict mapping)

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

- The skill still loads via the agent's `skills:` array and provides the same in-prompt context.
- The reviewer still emits the verdict-only YAML block; downstream parsing is unchanged.
- Only the *isolation* benefit is lost — intermediate Reads/Greps may surface in the parent transcript. Pass/fail gate semantics are preserved.

## Related

- `dartai:verdict-schema` — wire format and consumer contract (canonical, shared)
- `workflow:testing-strategy` — testing pyramid + RED/GREEN
- `workflow:agents/qa-reviewer` — the reviewer agent that binds this skill
