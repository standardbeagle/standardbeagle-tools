# Eval-Harness Scenarios — Wave-1 Reviewer Dispatch (INT1)

**Status:** Draft (per K1c)
**Dart task:** [9ZGkhWRzdne2](https://app.dartai.com/task/9ZGkhWRzdne2)
**Parent:** R3 eval-harness (`docs/research/R3-eval-harness-decision.md`) — adapted from skill-behavior eval to **reviewer dispatch verification**.
**Targets:** the 5 wave-1 reviewers wired into `dartai:adversarial-quality-loop` Phase 3 by K1c — `correctness-reviewer`, `maintainability-reviewer`, `testing-reviewer`, `typescript-strict-reviewer`, `cli-readiness-reviewer`.

---

## 1. Purpose

R3 sized an eval harness for **behavior-shaping skill ports** (verification-before-completion, systematic-debugging, etc. — I7/I9/I10). K1c reuses the same harness shape — judge-subagent + rubric + baseline — for a different unit: **dispatch-trigger correctness**.

We are not asking "did the reviewer find a bug?" (that is review-quality eval, out of scope). We are asking: **given a synthetic diff, did the quality-loop dispatch the right subset of reviewers?**

Two failure modes K1c's wiring (§INT1, R2 §6.1) is at risk for:

| Failure mode | What goes wrong | How this eval catches it |
|---|---|---|
| **Over-dispatch.** Conditional reviewer fires when it shouldn't (e.g. typescript-strict on a Python diff). | Wasted Sonnet calls, padded Phase-3 latency, unrelated findings noise. | Scenario asserts only the always-on three reviewers fire on non-TS diffs. |
| **Under-dispatch.** Conditional reviewer fails to fire when it should (e.g. cli-readiness skipped on a `.cli.ts` change). | Coverage gap. The reviewer's specialty goes un-applied. | Scenario asserts cli-readiness fires on CLI-shaped diffs. |

Reviewer-output quality (do they find real bugs?) is out of scope for K1c — that is downstream evaluation owned by I7/I9/I10's harness once those tickets land.

---

## 2. Layout

```
docs/research/eval-scenarios/
└── wave-1-reviewers.md          # this file (scenarios + expected dispatch)
```

When R3's repo-root `eval/` harness materializes (post I7/I9/I10), these scenarios migrate to `eval/scenarios/wave-1-dispatch/` and gain a runner. Until then, they document expected dispatch behavior for human verification at PR-review time and serve as the trigger-test seed list.

---

## 3. Scenario Set

Each scenario lists: a synthetic diff signal, the expected dispatched-reviewer set, and the **must-not-dispatch** set. Naming follows R3 §3.1: kebab-case, one scenario per failure mode worth distinguishing.

### scenario-pure-typescript-feature

**Diff signal:** new `*.ts` file with logic, plus `*.test.ts`. No CLI, no spec.

**Expected dispatch:**

```yaml
must_dispatch:
  - dartai:code-quality-reviewer
  - dartai:qa-reviewer
  - compound-review:correctness-reviewer
  - compound-review:maintainability-reviewer
  - compound-review:testing-reviewer
  - compound-review:typescript-strict-reviewer

must_not_dispatch:
  - compound-review:cli-readiness-reviewer

reason: "TS diff triggers ts-strict; no CLI signal in path patterns."
```

### scenario-pure-python-feature

**Diff signal:** new `*.py` file with logic, plus `tests/test_*.py`. No CLI imports.

**Expected dispatch:**

```yaml
must_dispatch:
  - dartai:code-quality-reviewer
  - dartai:qa-reviewer
  - compound-review:correctness-reviewer
  - compound-review:maintainability-reviewer
  - compound-review:testing-reviewer

must_not_dispatch:
  - compound-review:typescript-strict-reviewer
  - compound-review:cli-readiness-reviewer

reason: "Non-TS diff skips ts-strict; no CLI path tokens skip cli-readiness."
```

### scenario-cli-handler-edit

**Diff signal:** edit to `cli/commands/foo.ts` adding a new subcommand. New flag, new handler.

**Expected dispatch:**

```yaml
must_dispatch:
  - dartai:code-quality-reviewer
  - dartai:qa-reviewer
  - compound-review:correctness-reviewer
  - compound-review:maintainability-reviewer
  - compound-review:testing-reviewer
  - compound-review:typescript-strict-reviewer    # *.ts trigger
  - compound-review:cli-readiness-reviewer        # cli/ path trigger

must_not_dispatch: []

reason: "CLI source in TS — both conditional reviewers trigger."
```

### scenario-cli-spec-doc

**Diff signal:** new `docs/plans/2026-cli-redesign.md` describing proposed command surface. No source changes.

**Expected dispatch:**

```yaml
must_dispatch:
  - dartai:code-quality-reviewer
  - dartai:qa-reviewer
  - compound-review:correctness-reviewer
  - compound-review:maintainability-reviewer
  - compound-review:testing-reviewer
  - compound-review:cli-readiness-reviewer        # spec/plan trigger per R4 #20

must_not_dispatch:
  - compound-review:typescript-strict-reviewer

reason: |
  cli-readiness frontmatter (R4 §3 #20) extends trigger to CLI plans/specs.
  Doc-only diff has no TS code → ts-strict skipped.
```

### scenario-config-only-edit

**Diff signal:** `package.json` version bump, no source.

**Expected dispatch:**

```yaml
must_dispatch:
  - dartai:code-quality-reviewer
  - dartai:qa-reviewer
  - compound-review:correctness-reviewer
  - compound-review:maintainability-reviewer
  - compound-review:testing-reviewer

must_not_dispatch:
  - compound-review:typescript-strict-reviewer
  - compound-review:cli-readiness-reviewer

reason: |
  Always-on three still dispatch (their frontmatter has no Skip-when on config).
  Both conditional reviewers correctly skip — no TS source, no CLI path.
```

### scenario-tsx-react-component

**Diff signal:** new `src/components/Button.tsx` + test.

**Expected dispatch:**

```yaml
must_dispatch:
  - dartai:code-quality-reviewer
  - dartai:qa-reviewer
  - compound-review:correctness-reviewer
  - compound-review:maintainability-reviewer
  - compound-review:testing-reviewer
  - compound-review:typescript-strict-reviewer    # *.tsx trigger

must_not_dispatch:
  - compound-review:cli-readiness-reviewer

reason: "tsx triggers ts-strict via the typescript-strict-reviewer enabled_when alternation."
```

---

## 4. Verification Method (Pre-Harness)

Until the R3 harness materializes, verify dispatch correctness by:

1. **Static read of `enabled_when` predicates** in `plugins/dartai/skills/adversarial-quality-loop.md` Phase 3 against each scenario's diff signal.
2. **Pattern audit** — confirm the path-glob predicates (`**/*.ts`, `**/cli/**`, etc.) match the scenario's file list.
3. **Frontmatter cross-check** — confirm each reviewer's `description: "Use when:"` triggers align with the dispatch site's `enabled_when`.

---

## 5. Migration Path (Post I7/I9/I10)

Once `eval/run-eval.sh` ships per R3:

1. Move scenarios from this `.md` to `eval/scenarios/wave-1-dispatch/scenario-*.yaml` (one file per scenario, machine-readable).
2. Add a dispatch-eval runner: synthesize a fake diff matching the scenario, invoke the quality-loop with `--dry-run-dispatch` (new flag) emitting the dispatched reviewer set, diff against `must_dispatch` / `must_not_dispatch`.
3. Wire into `pnpm eval:dispatch` and add `.github/workflows/eval-dispatch.yml` triggering on changes to `plugins/dartai/skills/adversarial-quality-loop.md`.

Until then, this file is the seed.

---

## 6. Cross-references

- `docs/research/R2-dartai-subdispatch-interface.md` §6.1 — INT1 dispatch site recipe.
- `docs/research/R3-eval-harness-decision.md` §3 — judge-subagent + rubric pattern this eval reuses.
- `docs/research/R4-ce-agent-uniqueness-audit.md` — wave-1 reviewer scope and dedup decisions.
- `plugins/compound-review/agents/{correctness,maintainability,testing,typescript-strict,cli-readiness}-reviewer.md` — agent bodies under review.
- `plugins/dartai/skills/adversarial-quality-loop.md` Phase 3 — INT1 wire-up.
