---
name: workflow-code-quality-reviewer
description: "Forked-context code-quality reviewer (workflow mirror) — preloads verdict schema + coherence/bloat/completeness/duplication/cleanup lens. 對抗代碼品質審查（workflow鏡像，fork上下文）。 Use when: dispatch workflow:code-quality-reviewer subagent, adversarial code review in workflow loop, gate on quality, when reviewer must not pollute main thread"
disable-model-invocation: true
context: fork
agent: "workflow:code-quality-reviewer"
---

<!-- CC 2.1 fork decision: workflow mirror of dartai:code-quality-reviewer. Reviewer subagent reads many source files and runs LCI duplicate-detection queries. Forking keeps file payloads and intermediate analysis out of the main loop. Executor: workflow:code-quality-reviewer (preloads adversarial-quality + this companion skill). Fallback: if `context: fork` is unsupported, the agent still emits the same verdict YAML — only token efficiency degrades. -->

# Code Quality Reviewer Skill (workflow mirror, companion)

對抗性代碼品質審查的薄入口技能（workflow plugin 鏡像）。當workflow主循環fork出品質審查子代理時，此技能在fork上下文內預加載審查視角，使讀文件、LCI重複檢測、樣式對比等中間步驟不污染主線程，僅最終verdict YAML塊回流。

## Why this skill exists

1. **Context isolation** — Code-quality review opens many files and runs duplicate-detection queries. Without fork, every Read/Grep result accumulates in the main loop. Fork keeps the parent context clean.
2. **Single source of truth for output shape** — The agent file (`workflow:code-quality-reviewer`) describes *how to think*. This skill points at *what to emit* (verdict-schema) and *what playbook to load* (adversarial-quality).
3. **Feature detection** — Fallback below preserves behavior on pre-2.1 harness.

## Loaded context

When this skill activates inside the forked subagent:

- **Verdict schema** — `plugins/dartai/skills/verdict-schema.md` (canonical, shared across plugins)
- **Adversarial quality** — `plugins/workflow/skills/adversarial-quality.md` (full quality loop playbook, attack vectors, completeness checklist)
- **Agent playbook** — `plugins/workflow/agents/code-quality-reviewer.md` (review areas, eagle-eye violations, codebase integration check)

## Review lens (one-liner)

代碼必與既有代碼庫無縫融合：無bloat、無scope creep、無TODO/FIXME、無over-engineering、無cop-out。發現重複、不一致、不完整即標blocker。

## Output contract

Emit a single fenced YAML block as the **final message body**, ≤30 lines. Schema in `plugins/dartai/skills/verdict-schema.md`. No preamble.

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

- `dartai:verdict-schema` — wire format (canonical, shared)
- `workflow:adversarial-quality` — full quality loop playbook
- `workflow:agents/code-quality-reviewer` — the reviewer agent that binds this skill
- Dart 後端孿生：`dartai:code-quality-reviewer`（Dart-backed 同一審查）。
