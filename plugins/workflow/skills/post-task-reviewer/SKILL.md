---
name: workflow-post-task-reviewer
description: "Forked-context deep post-task reviewer (workflow mirror) — preloads verdict schema + OWASP + deep code + PM/docs + replan lens. 對抗深度後任務審查（workflow鏡像，fork上下文）。 Use when: dispatch workflow:post-task-reviewer subagent, deep review after fast gates, OWASP audit, PM/docs accuracy check, replan recommendation"
disable-model-invocation: true
context: fork
agent: "workflow:post-task-reviewer"
---

<!-- CC 2.1 fork decision: workflow mirror of dartai:post-task-reviewer. Deep reviewer is the longest-running adversarial pass — OWASP walkthrough, architecture analysis, doc cross-check, replan generation. Fork is essential to keep the workflow main loop bounded. Executor: workflow:post-task-reviewer (preloads adversarial-quality, testing-strategy, and this companion skill). Fallback: if `context: fork` is unsupported, the agent still emits the same verdict YAML — only token efficiency degrades. -->

# Post-Task Reviewer Skill (workflow mirror, companion)

對抗性深度後任務審查的薄入口技能（workflow plugin 鏡像）。當workflow主循環在快速門通過、品質門綠色後fork出深度審查子代理時，此技能在fork上下文內預加載審查視角，使OWASP遍歷、架構分析、文檔交叉檢查、重新規劃等大量中間步驟不污染主線程，僅最終verdict YAML塊回流（深度細節通過`evidence_path`離線）。

## Why this skill exists

1. **Context isolation** — Post-task review is the heaviest reviewer. Without fork, intermediate findings would dwarf the main loop's window.
2. **Single source of truth for output shape** — The agent file (`workflow:post-task-reviewer`) describes *how to think*. This skill points at *what to emit* (verdict-schema) and *what playbooks to load* (adversarial-quality + testing-strategy).
3. **Evidence_path is non-optional in practice** — Deep review typically generates findings beyond the ≤30-line verdict budget. Reviewers SHOULD write to `.dartai/reports/<task-id>/post-task-reviewer.md` and reference it via `evidence_path`.
4. **Feature detection** — Fallback below.

## Loaded context

When this skill activates inside the forked subagent:

- **Verdict schema** — `plugins/dartai/skills/verdict-schema.md` (canonical, shared)
- **Adversarial quality** — `plugins/workflow/skills/adversarial-quality.md` (architecture lens, completeness checklist)
- **Testing strategy** — `plugins/workflow/skills/testing-strategy.md` (test-tier verification cross-check)
- **Agent playbook** — `plugins/workflow/agents/post-task-reviewer.md` (security audit, deep code analysis, PM/docs review, replan)

## Review lens (one-liner)

代碼通過快速門。以更深分析破解之。發現並行審查者遺漏之處，然後依所有發現更新計劃。

## Output contract

Emit a single fenced YAML block as the **final message body**, ≤30 lines. Schema in `plugins/dartai/skills/verdict-schema.md`. **Strongly prefer** writing depth to `.dartai/reports/<task-id>/post-task-reviewer.md` and setting `evidence_path`.

```yaml
verdict: pass | fail | warn
confidence: high | med | low
blockers:
  - "<file:line> — <one-line description>"
advisories:
  - "<one-line nit or follow-up>"
evidence_path: ".dartai/reports/<task-id>/post-task-reviewer.md"
```

Replan recommendations belong in the evidence file (under a `## Replan` heading); the orchestrator surfaces them to the operator on demand.

## Fallback (pre-2.1 harness)

If the runtime does not honor `context: fork`:

- The skill still loads via the agent's `skills:` array; same playbooks in scope.
- Reviewer still emits verdict-only YAML; gate semantics unchanged.
- Only isolation benefit is lost. Because this reviewer is the heaviest, the cost is most visible here — but behavior is preserving and the gate still works.

## Related

- `dartai:verdict-schema` — wire format (canonical, shared)
- `workflow:adversarial-quality` — full quality loop playbook
- `workflow:testing-strategy` — testing pyramid + RED/GREEN
- `workflow:agents/post-task-reviewer` — the reviewer agent that binds this skill
- Dart 後端孿生：`dartai:post-task-reviewer`（Dart-backed 同一審查）。
