---
name: compound-review-maintainability-reviewer
description: "Forked-context maintainability reviewer — preloads verdict schema + premature-abstraction/dead-code/duplication/YAGNI lens. 對抗可維護性審查（fork上下文）。 Use when: dispatch compound-review:maintainability-reviewer subagent, gate on structural debt, when reviewer must not pollute main thread"
disable-model-invocation: true
context: fork
agent: "compound-review:maintainability-reviewer"
---

<!-- CC 2.1 fork decision: maintainability review runs jscpd duplicate detection, reads many files for coupling analysis, and produces intermediate findings across the diff. Forking keeps that work isolated from the main loop. Executor: compound-review:maintainability-reviewer (preloads dartai:code-quality + this companion skill). Fallback: if `context: fork` is unsupported, the agent still emits the same verdict file — only token efficiency degrades. -->

# Maintainability Reviewer Skill (compound-review companion)

對抗性可維護性審查的薄入口技能。當主循環fork出可維護性審查子代理時，此技能在fork上下文內預加載審查視角，使jscpd掃描、耦合分析等中間步驟不污染主線程，僅最終verdict檔案回流。

## Why this skill exists

1. **Context isolation** — Maintainability review runs duplicate detection scans and reads multiple files to assess coupling. Without fork, those payloads accumulate in the main loop.
2. **Single source of truth for output shape** — The agent file describes *how to think*. This skill points at *what to emit* (verdict-schema file channel).
3. **Feature detection** — Fallback below preserves behavior on pre-2.1 harness.

## Loaded context

When this skill activates inside the forked subagent:

- **Verdict schema** — `plugins/dartai/skills/verdict-schema.md` (canonical, file-streaming channel)
- **Code quality playbook** — `plugins/dartai/skills/code-quality.md` (complexity caps, scope-creep rules, simplification discipline)
- **Agent playbook** — `plugins/compound-review/agents/maintainability-reviewer.md` (premature abstraction, unnecessary indirection, dead code, coupling, naming, jscpd, YAGNI)

## Review lens (one-liner)

以六個月後須修改之下一開發者視角讀碼——捕獲使碼更難理解、變更或刪除之結構決策。

## Output contract

Write verdict to `.dartai/reports/<task-id>/maintainability.md` (line-oriented file channel). Stdout ≤5 lines: path pointer + one-line verdict.

```
verdict: pass|fail|warn
confidence: high|med|low
blocker: <file:line> <one-line description>
advisory: <one-line nit>
evidence: <path or inline body>
```

Verdict mapping: Objectively provable structural problem (dead code, single-impl abstraction, jscpd duplicate block) → `fail` + blocker when HIGH confidence. Naming/coupling judgments → `warn` + advisory. Low-confidence style preferences → suppress.

## Fallback (pre-2.1 harness)

If the runtime does not honor `context: fork`, the skill still loads, the reviewer still writes the verdict file, gate semantics unchanged. Only isolation benefit is lost.

## Related

- `dartai:verdict-schema` — wire format and file-streaming protocol
- `dartai:code-quality` — complexity caps + YAGNI rules
- `compound-review:agents/maintainability-reviewer` — the agent that binds this skill
