---
name: dartai-code-quality-reviewer
description: "Forked-context code-quality reviewer playbook — preloads verdict schema, codebase-coherence + bloat + completeness + duplication + cleanup lens for adversarial quality review subagents. 對抗代碼品質審查者技能：連貫性、臃腫、完整性、重複、清理視角，verdict-only輸出（fork上下文）。 Use when: dispatching code-quality-reviewer subagent, running adversarial code review, gating on code quality, when reviewer should not pollute main thread"
context: fork
agent: "dartai:code-quality-reviewer"
---

<!-- CC 2.1 fork decision: reviewer subagent reads many source files, runs LCI duplicate-detection queries, and surfaces structural findings across the diff. Forking keeps file payloads and intermediate analysis out of the main loop. Executor: dartai:code-quality-reviewer (preloads code-quality, testing-strategy, and this companion skill). Fallback: if `context: fork` is unsupported, the agent still emits the same verdict YAML — only token efficiency degrades. -->

# Code Quality Reviewer Skill (companion)

對抗性代碼品質審查的薄入口技能。當主循環fork出品質審查子代理時，此技能在fork上下文內預加載審查視角，使讀文件、LCI重複檢測、樣式對比等中間步驟不污染主線程，僅最終verdict YAML塊回流。

## Why this skill exists

1. **Context isolation** — Code-quality review opens many files and runs duplicate-detection queries. Without fork, every Read/Grep result accumulates in the main loop. Fork keeps the parent context clean.
2. **Single source of truth for output shape** — The agent file (`dartai:code-quality-reviewer`) describes *how to think*. This skill points at *what to emit* (verdict-schema) and *what playbook to load* (code-quality + testing-strategy).
3. **Feature detection** — When `context: fork` is unsupported, behavior is preserved (same verdict block); only token efficiency degrades. See "Fallback".

## Loaded context

When this skill activates inside the forked subagent:

- **Verdict schema** — `plugins/dartai/skills/verdict-schema.md`
- **Code quality playbook** — `plugins/dartai/skills/code-quality.md` (review checklist, simplification proposals, refactor-first assessment hooks)
- **Testing strategy** — `plugins/dartai/skills/testing-strategy.md` (cross-checks reviewer questions about test fitness)
- **Agent playbook** — `plugins/dartai/agents/code-quality-reviewer.md` (review areas, eagle-eye violations, codebase integration check)

## Review lens (one-liner)

代碼必與既有代碼庫無縫融合：無bloat、無scope creep、無TODO/FIXME、無over-engineering、無cop-out。發現重複、不一致、不完整即標blocker。

## Output contract

Emit a single fenced YAML block as the **final message body**, ≤30 lines. Schema and examples in `plugins/dartai/skills/verdict-schema.md`. No preamble.

```yaml
verdict: pass | fail | warn
confidence: high | med | low
blockers:
  - "<file:line> — <one-line description>"
advisories:
  - "<one-line nit or follow-up>"
evidence_path: ".dartai/reports/<task-id>/code-quality-reviewer.md"  # optional
```

## Fallback (pre-2.1 harness)

If the runtime does not honor `context: fork`:

- The skill still loads in the agent's prompt and provides the same playbook context.
- Reviewer still emits the verdict-only YAML; gate semantics unchanged.
- Only isolation benefit is lost; intermediate analysis may surface in the parent. Behavior preserving.

## Related

- `dartai:verdict-schema` — wire format
- `dartai:code-quality` — quality checklist + refactor proposal pipeline
- `dartai:agents/code-quality-reviewer` — the reviewer agent that binds this skill
