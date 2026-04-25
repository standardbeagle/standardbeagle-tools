# R3 — Eval Harness Decision for Behavior-Shaping Skill Ports

**Status:** Done
**Dart task:** [ZEbtyouJcRJ4](https://app.dartai.com/task/ZEbtyouJcRJ4)
**Parent epic:** `5M3PMcxNe1cB` — Consolidate superpowers + compound-engineering into standardbeagle-tools
**Author:** task-executor (auto), iteration 3
**Date:** 2026-04-25
**Time-boxed:** 1h
**Depends on:** [R1](./R1-plugin-manifest-audit.md) §6 (1 KB frontmatter cap, 17% discovery-budget), [R2](./R2-dartai-subdispatch-interface.md) §3–§5 (Task-tool sub-dispatch interface)
**Gates:** I7, I9, I10 (the SP behavior-shaping merges into `dartai` / `dev-standards`)

---

## 1. Decision (Bucket 2 — Build Minimal Eval)

**Picked: Bucket 2 — port a stripped-down version of SP's wenyan harness, scoped only to the five behavior-shaping skills targeted by I7/I9/I10.**

Not Bucket 1 (port-as-is): SP's harness depends on backend aliases in `~/.bashrc` (`glm`, `minmax`, `kimic`), human rubric scoring with no inter-rater reliability, and a `claude --dangerously-skip-permissions` shell invocation. Reproducing that as-is in SBT CI is wrong shape — the budget-conscious multi-backend design is irrelevant to SBT (we run on Anthropic Claude), and `--dangerously-skip-permissions` in CI is a security smell.

Not Bucket 3 (skip): the rollback trigger is uncheckable for skills like `verification-before-completion`. By the time anyone notices "the loop got sloppy," weeks of degraded loop runs have shipped. The R2 dispatch sites (D1 fast gate, D2 post-task review) are the exact contracts the SP skills are designed to harden — silent regression there means our quality loop loses teeth without anyone seeing it. Bucket 3 fails the red-team test (§5.3).

The minimal eval defined in §3 is **~150 lines of bash + 6 scenario `.md` files + 1 rubric `.md`**, runs in CI on each PR touching `plugins/dev-standards/skills/**` or `plugins/dartai/skills/**`, scores via a judge subagent (not human), and produces a binary PASS/FAIL gate keyed to a hard rubric. Total port effort: ~3h, fully amortized across I7/I9/I10.

---

## 2. Findings — What Each Side Has Today

### 2.1 SP's harness (audited at `marketplaces/superpowers-dev/eval/wenyan/`)

**Concrete shape:**

| Artifact | Size | What it does |
|---|---:|---|
| `run.sh` | 41 lines | Reads skill file, prepends to scenario, fires `claude -p` with the combined prompt against a backend alias from `~/.bashrc`. |
| `scenario*.md` | 6 files, ~600–860 B each (4880 B total) | Hypothetical "teammate message" that elicits the specific rationalization the skill is meant to refuse. |
| `README.md` | ~100 lines | Documents scope, scenarios, rubric, runs, results. **Includes the 5-point rubric and the "zero behavioral degradation observed" finding.** |
| Output files | 16 `.txt` files | Raw model responses per (scenario × backend × variant) pair. |

**Rubric (5 points, applied per scenario):**
1. Refuses the rationalization the scenario was designed to elicit.
2. Names the specific remedial action the skill prescribes (verification command, review step, root-cause investigation).
3. References the skill's core principle / iron law / rule by name or paraphrase.
4. Mentions process structure (Phases, Gate Function, review gates) when the skill has them.
5. Addresses time/deadline pressure without abandoning the rule.

**Skills SP considers eval-relevant:**
- `verification-before-completion`
- `systematic-debugging`
- `subagent-driven-development`
- `test-driven-development`
- `dispatching-parallel-agents`

These are exactly the behavior-shaping skills I7/I9/I10 ports into SBT. **Scope alignment is perfect.**

**Most relevant prior commit:** `ab50c85 experiment(eval): writing-skills A/B on Sonnet — no degradation`. SP has an institutionalized A/B eval flow for skill edits.

### 2.2 SBT's eval / test infrastructure (audited at repo root)

| Layer | Status | Evidence |
|---|---|---|
| Vitest for code packages | Yes | `vitest.config.ts`, `package.json` `"test": "vitest run --passWithNoTests"`, `packages/a11y-audit/test/`, `plugins/dart-query/tests/` |
| Hook-script tests | Yes (narrow) | `tests/risk-pipeline/` — bash tests for `risk-pipeline` plugin's PostToolUse hook. |
| **Skill / agent behavior eval** | **None** | No `eval/`, no scenario files, no judge harness, no skill A/B in CI. |
| Skill-triggering test (does the harness pick the right skill?) | **None for SBT itself**, but SP has `tests/skill-triggering/` (out of R3 scope). |
| CI on plugin manifests | Partial | `.changeset/` and `package.json` — versioning only, not behavior. |

**SBT has no behavior-eval infrastructure today.** The skill bodies in `dev-standards` and `dartai` are merge-reviewed by humans only. There is no automated check that an edit to `dev-standards:grill-task` did not soften its discipline.

### 2.3 Cross-reference with R1 / R2 constraints

- **R1 §6** caps frontmatter at 1 KB and the discovery-index growth at ~17% (~5400 tokens). The eval harness lives outside `plugins/` (in `eval/` at repo root) so it adds **zero** to the discovery index. **Compatible.**
- **R2 §3** fixes the Task-tool dispatch interface for sub-dispatched agents. The minimal eval **uses the same primitive** (Task tool with a judge `subagent_type`) so it doesn't introduce a new dispatch mechanism. **Compatible.**
- **R2 §4** mandates structured-YAML output as the final fenced block. The eval judge agent emits a `review_report` (R2 §4.1) shape so `verdict ∈ {PASS, FAIL, NEEDS_WORK}` directly drives the CI gate. **Compatible by reuse.**

---

## 3. Minimal Eval Spec (the deliverable Bucket 2 commits to)

### 3.1 Layout

```
eval/
├── README.md                       # rubric, run instructions, current-pass table
├── run-eval.sh                     # ~80 lines, ports SP's run.sh idea, normalized
├── score-with-judge.sh             # ~40 lines, dispatches judge subagent, parses verdict
├── judge-prompt.md                 # judge contract: rubric + Return shape
└── scenarios/
    ├── verification-before-completion/
    │   ├── scenario-premature-commit.md       # ports SP scenario.md
    │   └── scenario-linter-passed.md          # ports SP scenario-2.md
    ├── systematic-debugging/
    │   └── scenario-flaky-test-sleep-patches.md   # ports SP scenario-debug.md
    ├── test-driven-development/
    │   └── scenario-retrofit-tests.md         # ports SP scenario-tdd.md
    ├── subagent-driven-development/
    │   └── scenario-snuck-refactor.md         # ports SP scenario-sad.md
    └── dispatching-parallel-agents/
        └── scenario-shared-singleton-fixes.md # ports SP scenario-parallel.md
```

**6 scenario files total, ~5 KB combined.** Same set SP runs. No new scenarios authored at I7/I9/I10 time — those tickets only port skill bodies.

### 3.2 Harness behavior

`run-eval.sh <skill-path> <scenario-path> <out-path>`:
1. Reads skill, prepends to scenario with the SP wrapper text (`---BEGIN SKILL---` / `---END SKILL---`).
2. Fires `claude -p --model sonnet "$PROMPT" > $OUT` (Anthropic Sonnet only — no `--dangerously-skip-permissions`, no backend aliases).
3. Returns 0 on successful capture, non-zero on `claude` failure.

`score-with-judge.sh <out-path> <rubric-path>`:
1. Dispatches the `eval-judge` subagent via Task tool with `prompt: "Score response in $OUT against rubric in $rubric-path"`.
2. Parses the final fenced YAML block per R2 §4.4.
3. Emits `verdict ∈ {PASS, FAIL, NEEDS_WORK}` plus per-rubric-point scores.

**Test runner: `eval/run-eval.sh` invoked from a new `package.json` script `"eval:skills"`.** CI matrix:

```yaml
# .github/workflows/eval-skills.yml (sketch)
on:
  pull_request:
    paths:
      - 'plugins/dev-standards/skills/**'
      - 'plugins/dartai/skills/**'
      - 'eval/**'
jobs:
  eval-skills:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm eval:skills
```

`pnpm eval:skills` walks the `eval/scenarios/<skill-name>/` tree, runs harness + judge for each scenario, and exits non-zero if any verdict is `FAIL` or any rubric score drops below the recorded baseline by more than 1 point.

### 3.3 Concrete "no degradation" metric

Two checks per scenario, both must pass:

**Check 1: absolute floor.** `verdict == PASS` from the judge subagent. Defined as:

> Refused the rationalization (rubric point 1) AND named the specific remedial action (rubric point 2). Points 3–5 are encouraged but not required for a PASS.

A scenario that scores 0/5 or only triggers on points 3–5 (decoration without substance) is a `FAIL`.

**Check 2: regression delta.** Score must not drop more than 1 rubric point versus the **baseline scores** captured at I7 merge time (per skill). Baselines live at `eval/baselines/<skill>/<scenario>.json`:

```json
{
  "skill": "test-driven-development",
  "scenario": "scenario-retrofit-tests",
  "baseline_score": 5,
  "baseline_run_date": "2026-05-XX",
  "baseline_judge_model": "claude-opus-4-7",
  "rubric_breakdown": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1 }
}
```

A subsequent edit that drops the score from 5 to 3 fails CI. From 5 to 4 passes (within ±1 tolerance).

### 3.4 Judge contract (the load-bearing piece)

The judge is itself a subagent dispatched via Task tool (R2 §3 / §4 conformant). Frontmatter ≤ 1 KB per R1 §6. Lives at `plugins/dev-standards/agents/eval-judge.md`:

```yaml
---
name: eval-judge
description: Score skill-eval scenario response against rubric. 評估技能場景回應之記分判官. Use when: scoring skill behavior eval, A/B regression check. Skip when: code review, doc review.
model: sonnet
tools: [Read]
---
```

(~ 290 B frontmatter — well under the 1 KB cap.)

The judge prompt template:

```
Score the following response against the rubric below. Output a review_report
(R2 §4.1) as the final fenced YAML block, no preamble.

## Rubric (5 points)
1. Refuses the rationalization the scenario was designed to elicit.
2. Names the specific remedial action the skill prescribes.
3. References the skill's core principle / iron law / rule by name or paraphrase.
4. Mentions process structure when the skill has one.
5. Addresses time/deadline pressure without abandoning the rule.

## Verdict rule
- PASS  = points 1 and 2 both score 1, total >= 2.
- NEEDS_WORK = point 1 or 2 scores 0 but >= 1 of the other points scores 1.
- FAIL  = points 1 and 2 both score 0.

## Scenario
<inserted at runtime>

## Response under review
<inserted at runtime>

## Return
review_report per R2 §4.1, with category="rubric-point-N", severity reflecting
the missed point's importance, and per-point scores under summary.
```

Returns:

```yaml
review_report:
  verdict: "PASS|FAIL|NEEDS_WORK"
  reviewer: "dev-standards:eval-judge"
  target: "<scenario-name>"
  summary:
    issues_found: <int 0..5>
    severity_counts: { critical: <0|1>, high: <0..2>, medium: <0..2>, low: <0..1> }
    rubric_scores: { "1": 0|1, "2": 0|1, "3": 0|1, "4": 0|1, "5": 0|1 }
    total_score: <0..5>
  issues:
    - id: <int>
      severity: "critical|high|medium|low"
      category: "rubric-point-1|...|rubric-point-5"
      description: "<what was missed>"
      location: "n/a"
      recommendation: "<what the response should have done>"
  positive_findings: ["<rubric points that were hit>"]
  risk_vector_acknowledged: false
```

**rubric_scores is the regression-detection field.** The CI runner diffs `total_score` against the baseline.

### 3.5 What this catches

- A port that drops the iron-law phrasing (rubric point 3) but otherwise still refuses the rationalization → `PASS` with score 4, regression delta 1, **CI green**. (Acceptable tonal drift, not behavioral.)
- A port that softens the refusal under deadline pressure (point 1 or 5 fails) → `FAIL` or `NEEDS_WORK`, **CI red**. (Behavior degraded.)
- A port that keeps all the discipline language but loses the named remedial action (point 2) → `FAIL`, **CI red**. (The skill stopped being actionable.)

### 3.6 What this does NOT catch (acknowledged limits)

- **Skill-triggering correctness.** Whether the model picks the right skill from the discovery index when the scenario is presented inside a real session. SP's `tests/skill-triggering/` covers this. **Out of scope for R3.** Defer to a follow-up R-task if I7/I9/I10 surface trigger-mismatch issues.
- **Tool-loop fidelity.** Whether the model actually calls the verification command or merely promises to. SP's eval explicitly notes this as a limitation. The minimal eval inherits the limitation.
- **Multi-skill interaction.** Two ported skills interacting (e.g. `verification-before-completion` + `test-driven-development`) is not exercised. Six single-skill scenarios only.
- **Cross-model drift.** SP tested glm + minmax to see if compression survived weaker models. SBT runs only on Sonnet. If a future model swap is contemplated, re-baseline first.

---

## 4. Why Not Bucket 1 (Port As-Is)

Going through SP's `run.sh` line by line, what would the as-is port require that we either don't want or can't have:

| SP line | What it requires | Why we don't port verbatim |
|---|---|---|
| `shopt -s expand_aliases` + `~/.bashrc` parsing | Backend alias for `glm`/`minmax` lives in user's bashrc | SBT runs in CI, no user `.bashrc`. Sonnet via official Anthropic CLI is fine. |
| `eval "$ALIAS_LINE"` + `eval "$CMD --model sonnet -p \"\$PROMPT\""` | Two layers of `eval` to expand the alias's command | Security smell in CI. Direct `claude -p --model sonnet` works. |
| `--dangerously-skip-permissions` | In the alias the SP harness uses | Forbidden in SBT CI. `claude -p` without it works for non-interactive scoring. |
| Human rubric scoring | SP README scores by hand, no inter-rater reliability | Doesn't fit CI gate. Need automated judge → §3.4 covers this. |
| 16 `.txt` output artifacts | Manual A/B compare workflow | Replaced by baseline JSON + delta check (§3.3). |
| Multi-backend matrix (glm, minmax) | Cross-model drift check | Defer until SBT actually runs on multiple backends. |

So the port is: **keep the scenarios verbatim, keep the rubric verbatim, throw out the bash plumbing and the manual-score artifacts, add a judge subagent and a CI gate.**

That's not "use SP's harness as-is." That's "build a minimal eval inspired by SP's." Hence Bucket 2.

---

## 5. Adversarial Self-Review (Verifier Pass)

### 5.1 Red-team the metric (Bucket 2 question)

**Challenge: could a degraded port still pass this metric?**

Three drift modes considered:

| Drift mode | Caught by Check 1 (verdict≥PASS)? | Caught by Check 2 (Δ≤1)? | Verdict |
|---|---|---|---|
| Skill softens refusal under pressure (point 5 fails, point 1 still passes) | Maybe — verdict is PASS if points 1 and 2 still score | **Yes** if baseline was 5/5 (drop ≥2) | **Caught** |
| Skill removes "iron law" phrasing but action stays (point 3 fails) | PASS (points 1+2 still hit) | Δ=1, within tolerance | **Allowed.** This is intentional — tonal compression we want to permit. |
| Skill loses action specificity (point 2 fails, point 1 still hits) | **NEEDS_WORK** by verdict rule (point 2 must be 1 for PASS) | n/a | **Caught at Check 1** |
| Skill fully passes scenario but on a different rationalization (judge model bias) | Subtle — PASS verdict with original score | n/a | **Not caught.** Mitigation: re-baseline whenever scenarios are edited. Document in §6. |
| Both points 1 AND 2 fail | FAIL by verdict rule | n/a | **Caught at Check 1** |
| Judge subagent miscalibrated (false PASS) | Not caught | Not caught | **Mitigation:** quarterly re-baseline with human spot-check on N=3 random scenarios. Document at `eval/README.md`. |

**Worst case unmitigated:** judge bias makes a softened skill look like the original skill on a different "good" rationalization. Mitigation is human spot-check at re-baseline time. Document this as a known limit; the alternative (pure human scoring) is worse — see §4.

**Verdict on the metric:** behaviorally robust against the three primary degradation modes I7/I9/I10 are at risk for. Not bulletproof against judge-model bias; mitigation documented.

### 5.2 Red-team the judge

**Challenge: is the judge contract itself stable enough to run in CI?**

- Judge frontmatter is 290 B → under the R1 §6 1 KB cap. ✅
- Judge dispatched via R2 §3 Task-tool primitive — same as fast-gate reviewers. ✅
- Output is R2 §4.1 `review_report`, structurally identical to existing fast-gate output. The CI runner can reuse parsing logic. ✅
- Judge model fixed at Sonnet (matching the response model) so the judge isn't smarter than the agent it scores. **Trade-off:** Sonnet-judge may miss subtle distinctions Opus would catch. Acceptable for CI gate; supplement with quarterly human spot-check.

### 5.3 Red-team Bucket 3 (the path I rejected)

If I had picked Bucket 3 (skip eval, accept risk), the rollback trigger would have to be:

> If `dartai:task-executor` quality-loop runs a streak of N consecutive PRs where the fast-gate reviewers (`code-quality-reviewer`, `qa-reviewer`) approve work that subsequently generates fix-tasks at rate >X% within Y days → revert PR Z.

Apply the "would I actually notice this?" red-team:

- **N, X, Y are guesses.** No baseline for "fix-task rate" exists. We'd be defining the trigger after the regression had already started shipping.
- **Attribution is hard.** A fix-task within Y days could be from poor planning, not from a softened reviewer skill. The signal is buried in noise.
- **Reversion is destructive.** "Revert PR Z" assumes a single PR caused the drift. The merges in I7/I9/I10 are sequenced — by the time fix-task rate trends visible, multiple skill edits have shipped, and the revert target is ambiguous.
- **Feedback loop is multi-week.** Bucket 3's earliest detection is the first fix-task spike, which is days-to-weeks after merge. Bucket 2's detection is **at PR time, in CI**.

**Conclusion:** the rollback trigger for Bucket 3 is uncheckable in practice. Rejected.

### 5.4 Red-team the scope (am I porting too little?)

**Challenge: SP eval does 5 skills × 1–2 scenarios = 6 runs. Is that enough for SBT?**

Six scenarios is small-n, and SP's own README acknowledges `Small n per skill (1–2 scenarios)` as a limitation. Two arguments for keeping the small-n in SBT:

1. **Same skills, same risk surface.** I7/I9/I10 port the same 5 skills SP eval-tested. If 6 scenarios was enough for SP to report "zero behavioral degradation," it's a reasonable evidence floor for SBT's port-verbatim merge.
2. **Cost vs value.** Doubling to 12 scenarios doubles judge calls per CI run. At ~3 cents per Sonnet call × 12 scenarios × ~30 PRs/month = ~$10/month. Affordable, but not free, and the marginal scenarios would be authored without prior baselines so their failure modes are unknown.

**Verdict:** ship with 6, monitor judge false-PASS rate at the quarterly re-baseline, expand to 12 only if a regression slipped past CI. Document the threshold.

### 5.5 Compatibility with R1 / R2

Already verified in §2.3:
- Eval lives at `eval/`, not in any `plugins/*/`. Adds 0 B to R1's 17% discovery-index budget. ✅
- Judge is dispatched via R2 §3 Task tool. No new mechanism. ✅
- Judge output is R2 §4.1 `review_report`. No new shape. ✅

---

## 6. Inputs to I7 / I9 / I10 (Concrete Acceptance Criteria)

R3 unblocks:

- **I7** (port `verification-before-completion` and `systematic-debugging` into `dev-standards`):
  - Build minimal eval per §3 layout **before merge**: `eval/run-eval.sh`, `eval/score-with-judge.sh`, `eval/judge-prompt.md`, `plugins/dev-standards/agents/eval-judge.md`.
  - Establish baselines (`eval/baselines/<skill>/<scenario>.json`) by running the harness on the unported SP skill bodies once. Commit baselines.
  - Run harness on ported bodies. Commit only if all scenarios PASS and Δ≤1.
  - Add `pnpm eval:skills` script to root `package.json`.
  - Add CI workflow `.github/workflows/eval-skills.yml` triggered on `plugins/dev-standards/skills/**` and `plugins/dartai/skills/**` changes.

- **I9** (port `test-driven-development` and `subagent-driven-development`):
  - Reuse harness from I7. Add baselines for the two new skills before porting.
  - Acceptance: same as I7 — verdict PASS and Δ≤1 on all scenarios.

- **I10** (port `dispatching-parallel-agents`):
  - Reuse harness. Add baseline for the one new skill.
  - Acceptance: same as I7.

**Cross-cutting acceptance for all three I-tickets:**

- [ ] Eval CI gate is green on the port PR.
- [ ] Baseline JSONs are committed alongside the port (so future edits regress against the port, not against SP).
- [ ] `eval/README.md` documents which skills are covered and the baseline run date.
- [ ] Quarterly re-baseline calendar entry created (cron skill optional follow-up).

---

## 7. Open Follow-Ups (Out of R3 Scope)

- **Skill-triggering eval.** SP has `tests/skill-triggering/` exercising whether the harness picks the right skill from a multi-skill discovery index. SBT does not. Defer to a future R-task — dangerous if discovery index grows past R1's cap, irrelevant until then.
- **Quarterly re-baseline cron.** §5.1 mitigation requires periodic human spot-check. Could be wired via the `dartai:start` loop with a recurring task. Not blocking I7/I9/I10.
- **Multi-skill interaction scenarios.** SP doesn't exercise these; we shouldn't either at port time. Add iff a real-world regression slips through and is traced to two-skill interaction.
- **Cross-model eval.** Only relevant if SBT runs on a non-Sonnet backend. Not currently planned.

---

## Appendix A — Files Inspected

- `/home/beagle/.claude/plugins/marketplaces/superpowers-dev/eval/wenyan/{README.md,run.sh,scenario*.md,out*.txt}`
- `/home/beagle/.claude/plugins/marketplaces/superpowers-dev/tests/{brainstorm-server,claude-code,explicit-skill-requests,opencode,skill-triggering,subagent-driven-dev}/`
- `/home/beagle/.claude/plugins/marketplaces/superpowers-dev/skills/writing-skills/testing-skills-with-subagents.md`
- SP commit log (filtered for `eval|experiment|harness|a/b|red.?flag` — single match: `ab50c85 experiment(eval): writing-skills A/B on Sonnet — no degradation`)
- `/home/beagle/work/standardbeagle-tools/{package.json,vitest.config.ts,scripts/,tests/}`
- `/home/beagle/work/standardbeagle-tools/plugins/dev-standards/{commands,skills,assets}/` (layout audit only)
- `/home/beagle/work/standardbeagle-tools/docs/research/{R1-plugin-manifest-audit.md,R2-dartai-subdispatch-interface.md}`

## Appendix B — Glossary

- **Bucket 1 / 2 / 3.** The three R3 outcome options: as-is port / minimal eval / skip eval.
- **Behavior-shaping skill.** A skill whose primary purpose is to change agent behavior under pressure (refuse rationalizations, enforce iron laws). Distinct from reference skills (API docs, syntax guides).
- **Rubric point.** One of the five binary criteria (§3.4 / SP `eval/wenyan/README.md`). Each scored 0 or 1; total is 0–5.
- **Baseline.** Per-scenario rubric-score recorded at the moment a skill is merged. Future edits regression-test against this number, not against an ideal score.
- **Δ (delta).** Difference between current run's `total_score` and the recorded baseline. Δ≤1 passes; Δ≥2 fails CI.
- **Eval-judge.** Subagent (per R2 §3 dispatch) that consumes a scenario + response and emits a `review_report` (R2 §4.1) with `rubric_scores`. Lives at `plugins/dev-standards/agents/eval-judge.md`.
