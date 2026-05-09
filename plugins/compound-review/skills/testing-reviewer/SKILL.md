---
name: compound-review-testing-reviewer
description: "Forked-context testing reviewer playbook — preloads verdict schema and test-coverage-gap/weak-assertion/brittle-test lens for adversarial testing review subagents. 對抗測試審查者技能：測試覆蓋缺口、弱斷言、脆弱測試視角，verdict-only輸出（fork上下文）。 Use when: dispatching compound-review:testing-reviewer subagent, gating on test quality, when reviewer should not pollute main thread"
disable-model-invocation: true
context: fork
agent: "compound-review:testing-reviewer"
---

<!-- CC 2.1 fork decision: testing review reads test files, traces branch coverage, and produces intermediate findings per untested path. Forking keeps that analysis out of the main loop. Executor: compound-review:testing-reviewer (preloads dartai:testing-strategy + this companion skill). Fallback: if `context: fork` is unsupported, the agent still emits the same verdict file — only token efficiency degrades. -->

# Testing Reviewer Skill (compound-review companion)

對抗性測試審查的薄入口技能。當主循環fork出測試審查子代理時，此技能在fork上下文內預加載審查視角，使測試文件讀取、覆蓋分析等中間步驟不污染主線程，僅最終verdict檔案回流。

## Why this skill exists

1. **Context isolation** — Testing review reads test and source files in parallel, traces coverage per branch, and surfaces many intermediate findings. Without fork, every Read accumulates in the main loop.
2. **Single source of truth for output shape** — The agent file describes *how to think*. This skill points at *what to emit* (verdict-schema file channel).
3. **Feature detection** — Fallback below preserves behavior on pre-2.1 harness.

## Loaded context

When this skill activates inside the forked subagent:

- **Verdict schema** — `plugins/dartai/skills/verdict-schema.md` (canonical, file-streaming channel)
- **Testing strategy** — `plugins/dartai/skills/testing-strategy.md` (three-tier pyramid, assertion strength rubric, RED/GREEN discipline, edge-case taxonomy)
- **Agent playbook** — `plugins/compound-review/agents/testing-reviewer.md` (hunt list: untested branches, vacuous tests, brittle assertions, missing error-path coverage, behavior-change without tests)

## Review lens (one-liner)

測試須真正證明碼可用——非僅存在。區分捕獲真實回歸之測試與提供虛假信心之測試。

## Output contract

Write verdict to `.dartai/reports/<task-id>/testing.md` (line-oriented file channel). Stdout ≤5 lines: path pointer + one-line verdict.

```
verdict: pass|fail|warn
confidence: high|med|low
blocker: <file:line> <one-line description>
advisory: <one-line nit>
evidence: <path or inline body>
```

Verdict mapping: Provable from diff — untested new branch, vacuous test (passes with implementation removed), behavior change with zero test files changed → `fail` + blocker (HIGH confidence). Inferred from file structure — missing test file for new module → `warn` + advisory (MED confidence). Cannot determine without full test infra → suppress.

## Fallback (pre-2.1 harness)

If the runtime does not honor `context: fork`, the skill still loads, the reviewer still writes the verdict file, gate semantics unchanged. Only isolation benefit is lost.

## Related

- `dartai:verdict-schema` — wire format and file-streaming protocol
- `dartai:testing-strategy` — three-tier pyramid + RED/GREEN + assertion strength rubric
- `compound-review:agents/testing-reviewer` — the agent that binds this skill
