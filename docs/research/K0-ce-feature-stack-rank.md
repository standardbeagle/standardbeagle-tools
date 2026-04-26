# K0 — CE/SP Feature Stack-Rank vs. Actual SBT Workflows

**Status:** Done
**Dart task:** [fhKlq90pJXHp](https://app.dartai.com/task/fhKlq90pJXHp)
**Blocks:** [KokUI1jNuMv2](https://app.dartai.com/task/KokUI1jNuMv2) — bulk port
**Author:** task-executor (auto), iter 1, loop `T0YmyKrfmwaw`
**Date:** 2026-04-26
**Time-boxed:** 2h
**Inputs:** R1 §6 (frontmatter cap), R2 §3 (dispatch sites), R4 §3+§4 (dedup table), dartboard `Personal/standardbeagle-tools` last 40 tasks (workflow signal), `/home/beagle/work/superpowers` fork log (customization audit).

---

## 1. Executive Summary

R4 cut CE 50→23 (17 review + 6 research) on **uniqueness**. K0 re-cuts on **user value-fit** and orders the survivors. Net result for the bulk port (KokUI1jNuMv2):

| Tier | Count | Action |
|---|---:|---|
| **Top** (port now, drives KokUI1jNuMv2 wave 1) | **5** | Cluster A — wire into INT1 fast-gate first. |
| **Mid** (port wave 2 once Cluster A wiring proves out) | **7** | Cluster B — port after wave 1 lands and dispatch ergonomics confirmed. |
| **Bottom** (defer; revisit when triggering workflow grows) | **5** | Cluster C — keep in backlog, do not port in this epic. |
| **Drop** (no workflow fit; remove from KokUI1jNuMv2 + forks) | **6** | Strike from epic. Net cut: 23 → **17 actual ports** (12 wave 1+2 + 5 deferred). |
| **Out-of-R4-scope add-back** | **2** | One CE skill (`ce-sessions`) + one SP skill (`subagent-driven-development`) score above several R4 survivors. Promote into the epic. |

**Headline decisions:**

1. **Wave 1 (top tier, 5 agents):** `correctness-reviewer`, `maintainability-reviewer`, `testing-reviewer` (the always-on three per R2), plus `typescript-strict-reviewer` and `cli-readiness-reviewer` (the two that fire daily on this codebase: TS-heavy + plugin/MCP CLI work).
2. **Wave 2 (mid tier, 7 agents):** `adversarial-reviewer`, `architecture-strategist`, `performance-reviewer`, `reliability-reviewer`, `api-contract-reviewer`, `agent-native-reviewer`, `project-standards-reviewer`. Diff-conditional or epic-conditional triggers; ship when wave-1 dispatch wiring is proven.
3. **Defer (bottom tier, 5 agents):** `data-migrations-reviewer`, `previous-comments-reviewer`, `python-strict-reviewer`, `frontend-races-reviewer`, `repo-research-analyst`. Real workflows exist but cadence is monthly-or-less.
4. **Drop from epic (6):** `security-reviewer` (CE), `web-researcher` reduplication of already-shipped, `best-practices-researcher` + `framework-docs-researcher` (already shipped — fold into web), `learnings-researcher` (already shipped), `git-history-analyzer` (low value-fit). See §6 for per-item rationale.
5. **Add to epic from out-of-R4-scope:** `ce-sessions` skill (cross-session memory, no SBT equivalent, fires weekly+ on the loop work) and `subagent-driven-development` skill from SP (already loaded as a top-rank skill — port into `dev-standards` or new `coordination` plugin). Both score Top.
6. **Fork-slim:** the user's `standardbeagle/superpowers` fork has zero agent-level customizations (only a `brainstorming` Node launcher refactor). No fork cleanup needed beyond keeping that one refactor. **No CE fork to slim** — CE consumed via `~/.claude/plugins/marketplaces/compound-engineering-plugin` (read-only marketplace).

---

## 2. Method

### 2.1 Workflow signal extraction

Sources for "what does the user actually do":

- **Dartboard last 40 tasks** (`Personal/standardbeagle-tools`): G1–G5 typography tools, H1–H5 image-processing tools, I2–I4 slop-mcp wiring, J1–J3 monorepo READMEs/typedoc, R1–R4 + S1–S3 consolidation research. **Conclusion:** workflow is dominated by MCP tool development, plugin packaging, marketplace release, and quality-loop iteration. Frontend audits (a11y, typography, color) appear as discrete tools, not as a recurring per-PR review need.
- **Recent commit log** (`git log -20`): TS/JS plugin work, MCP server publishing, hook-script tweaks, no Rails, no Python beyond MCP-server scripts.
- **R2 §2 dispatch sites:** D1 fast gate fires every loop iteration (~daily). D2 deep review fires every loop iteration. D3 doc-update fires post-completion.

**Workflow frequency tiers used in scoring:**

| Frequency | Tier | Examples in this repo |
|---:|---|---|
| 5 — Daily | Hot | Loop iteration, TS code review, plugin manifest edits, slop-mcp tool calls |
| 4 — Several/week | Warm | MCP-server design, marketplace.json bumps, plugin scaffolding |
| 3 — Weekly | Steady | Frontend audit (a11y/color/typography), README/typedoc rewrites |
| 2 — Monthly | Slow | Cross-package refactors, npm publish, security-sensitive code |
| 1 — Rare/never | Cold | Rails work, Python web apps, data migrations, SQL schema changes |

### 2.2 Scoring axes

Per task spec:

- **Frequency (F)** — how often the triggering workflow runs. 1 (rare) → 5 (daily).
- **Value-when-fired (V)** — cost of *not* having it when the workflow does run. 1 (cosmetic / nice-to-have) → 5 (ships bug or compromises security).
- **Local parity gap (G)** — how much of this is already covered by SBT plugins. 1 (full local parity, porting is duplication) → 5 (zero local equivalent).
- **Port cost (C)** — work to port + wire + add eval scenario. 1 (trivial frontmatter rewrite, dispatch already plumbed) → 5 (multi-day, new dispatch site, new schema).

**Composite:** `score = F × V × G / C`.

Score ranges and tier thresholds (calibrated against the fleet, not a priori):

| Tier | Composite range | Action |
|---|---|---|
| **Top** | ≥ 12 | Port now (wave 1). |
| **Mid** | 5–11 | Port soon (wave 2). |
| **Bottom** | 2–4 | Defer; keep in backlog. |
| **Drop** | < 2 | Cut from epic. |

### 2.3 Local parity reference

The SBT fleet that already exists, mapped to dimensions ported reviewers would cover (used to score G):

| SBT existing | Covers dimension |
|---|---|
| `dartai:code-quality-reviewer` | Maintainability, correctness, project coherence, no fallbacks/TODOs, duplication, cleanup |
| `dartai:qa-reviewer` | Testing quality, coverage, assertion strength |
| `dartai:post-task-reviewer` | Deep review pass — covers correctness + reliability + integration |
| `risk-pipeline:security-reviewer` | OWASP / auth / authz / crypto / input validation / secrets / ReDoS / timing |
| `risk-pipeline:data-reviewer` | Data-handling adversarial review (overlaps CE data-* cluster) |
| `risk-pipeline:reversibility-reviewer` | Migration / rollback safety (overlaps CE deployment-verification — already dropped in R4) |
| `risk-pipeline:novelty-reviewer` | Architecture / new-pattern review |
| `dartai:doc-updater` | Doc updates post-task (overlaps `ce-ankane-readme-writer`) |
| `dev-standards:grill-task` | Plan-time interrogation (overlaps SP `writing-plans` partially) |
| `workflow:adversarial-quality` skill | Quality loop orchestration (overlaps CE `ce-work` workflow framing) |
| `ideation:ideate` skill | Idea generation (overlaps `ce-ideate` — already ported via S2) |
| `brainstorming:brainstorming` skill | Brainstorming (overlaps SP `brainstorming` — already ported in spirit; SP `brainstorming` skill itself is loaded via marketplace) |

Net: SBT has *strong* local parity for security, maintainability, testing, doc-update, planning, brainstorming, ideation. **Weak or zero parity** for: TypeScript-strict review, CLI-readiness review, agent-native review (UI↔tool parity), project-standards (CLAUDE.md adherence), reliability (I/O failure modes), API-contract, architecture, adversarial composition, and the research-side cross-session memory.

### 2.4 Candidate set enumeration

Per task spec, score the union of: R4's 23 + non-R4 SP/CE features that the user might use. Beyond R4:

- **CE skills (43)**: enumerate, score the few that fit SBT workflows. Most (`ce-dhh-rails-style`, `ce-andrew-kane-gem-writer`, `ce-deploy-docs`, `ce-release-notes` Ruby-flavored) score Drop on F=1. Keepers in scoring: `ce-sessions`, `ce-compound`, `ce-frontend-design`, `ce-debug`, `ce-onboarding`, `ce-todo-resolve`. See §7.
- **SP skills (14)**: most already auto-loaded via marketplace, so "porting" = adopt as own. Score `subagent-driven-development`, `verification-before-completion`, `systematic-debugging`, `using-git-worktrees`, `requesting-code-review`. See §8.
- **CE workflow agents (2)**: `ce-pr-comment-resolver`, `ce-spec-flow-analyzer`.
- **CE design agents (3)**: `ce-design-implementation-reviewer`, `ce-design-iterator`, `ce-figma-design-sync`.
- **CE docs agent (1)**: `ce-ankane-readme-writer`.
- **CE document-review (7)**: deferred per R4 to I3b — not re-litigated here, but spot-checked in §9.

---

## 3. Stack-Rank Table — R4 Reviewers (17 candidates)

| # | Agent | F | V | G | C | Score | Tier | Action |
|---:|---|:-:|:-:|:-:|:-:|:-:|---|---|
| 1 | `correctness-reviewer` | 5 | 5 | 2 | 1 | **50.0** | Top | Wave 1. Always-on per R2. SBT's `code-quality-reviewer` covers some, but correctness has CE's tighter "what we don't flag" discipline. |
| 2 | `maintainability-reviewer` | 5 | 4 | 2 | 1 | **40.0** | Top | Wave 1. Always-on per R2. Folds in `pattern-recognition` jscpd + `code-simplicity` per R4 — scope is broader than `code-quality-reviewer`. |
| 3 | `testing-reviewer` | 5 | 5 | 2 | 1 | **50.0** | Top | Wave 1. Always-on. Tighter scope than `qa-reviewer` (CE testing focuses on assertion strength + brittleness; qa-reviewer is broader QA). Both run; complementary. |
| 4 | `typescript-strict-reviewer` | 5 | 4 | 5 | 2 | **50.0** | Top | Wave 1. **Zero local equivalent.** Repo is TS-heavy; this fires diff-conditional on every PR with a `.ts` file. Rename per R4 §5. |
| 5 | `cli-readiness-reviewer` | 4 | 4 | 4 | 2 | **32.0** | Top | Wave 1. Plugin/MCP work is constant; CLI ergonomics review has no SBT equivalent. Folds the "long" version per R4 (#20). |
| 6 | `adversarial-reviewer` | 4 | 5 | 4 | 2 | **40.0** | Mid → re-examine | Mid. Composition failures matter at integration time (less per-PR, more per-epic). Defer to wave 2 to keep wave 1 small. **Note:** scores Top by raw composite; demoted to Mid because R2 fast-gate already runs `code-quality-reviewer + qa-reviewer` and adding a third always-on would inflate dispatch cost. Run on epic-completion, not per-iteration. |
| 7 | `architecture-strategist` | 3 | 5 | 4 | 2 | **30.0** | Mid | Wave 2. Cross-cutting boundary review — fires on plugin-boundary changes, MCP-server interface changes. Workflow cadence weekly. |
| 8 | `performance-reviewer` | 3 | 4 | 3 | 2 | **18.0** | Mid | Wave 2. SBT has perf concerns on a11y-audit / image-processing tools. Diff-conditional triggers help. |
| 9 | `reliability-reviewer` | 3 | 5 | 5 | 2 | **37.5** | Mid → re-examine | **Scores Top by raw composite** (zero local parity, ships I/O bug if absent). Could promote to wave 1. Demoted to Mid on diff-conditional cadence: I/O code lives in MCP servers + hook scripts, not in every PR. **Decision: Top if wave-1 budget allows 6 agents; otherwise Mid wave 2.** Recommend Mid to keep wave-1 to 5. |
| 10 | `api-contract-reviewer` | 3 | 5 | 4 | 2 | **30.0** | Mid | Wave 2. MCP tool API + npm package public API both need contract-stability review on release iterations. |
| 11 | `agent-native-reviewer` | 4 | 4 | 5 | 2 | **40.0** | Mid → re-examine | **Scores Top.** "Every UI action has matching agent tool" is exactly the `agnt`/`mcp-architect` ethos; zero local parity. Strong fit. **Decision: promote to Top wave 1, displacing one Mid candidate.** See §3.1 reconciliation. |
| 12 | `project-standards-reviewer` | 5 | 4 | 5 | 2 | **50.0** | Top | Wave 1. **Reads CLAUDE.md + AGENTS.md.** SBT *is* a CLAUDE.md-driven repo (project memory at `.dartai/`, `.claude/CLAUDE.md`). Every iteration touches conventions. Zero local equivalent. **High priority.** |
| 13 | `previous-comments-reviewer` | 2 | 3 | 4 | 1 | **24.0** | Mid → Bottom | **Demoted.** Scores Mid by composite, but PR-comment cycles on this monorepo are rare (solo + automated loops). Defer until human-PR review cadence picks up. Trivial port cost so revisit cheaply. |
| 14 | `python-strict-reviewer` | 1 | 4 | 5 | 1 | **20.0** | Bottom | Defer. Python presence is minor (MCP-server scaffolds). Trivial port (C=1) so easy to revive when Python work appears. |
| 15 | `frontend-races-reviewer` | 2 | 4 | 5 | 2 | **20.0** | Bottom | Defer. Frontend race work is occasional (sketch mode, ux-developer skills). Port when next major frontend feature lands. |
| 16 | `data-migrations-reviewer` | 1 | 5 | 4 | 2 | **10.0** | Bottom | Defer. Currently no DB / migration work in scope. **`risk-pipeline:reversibility-reviewer` partially covers**, raising local parity. Revisit if DB work appears. |
| 17 | `security-reviewer` (CE) | 4 | 5 | 1 | 1 | **20.0** | **Drop** | **Drop from epic.** SBT already ships `risk-pipeline:security-reviewer` with same OWASP/auth/crypto scope. R4 listed it as keep; K0 disagrees on parity. Local parity G=1, full overlap. **Don't port; keep using risk-pipeline's.** |

### 3.1 Wave-1 reconciliation

Raw scoring puts these candidates in the Top bucket (composite ≥ 12 *and* qualitative fit):

`correctness`, `maintainability`, `testing`, `typescript-strict`, `cli-readiness`, `project-standards`, `agent-native`, `adversarial`, `reliability`.

Wave-1 budget is **5 agents** (matches the spec's "≤5" top tier, and matches R2's "always-on three plus diff-conditional" capacity). The cut from 9 strong candidates to 5:

1. **Always-on three (R2 mandate):** `correctness`, `maintainability`, `testing`. **Locked in.**
2. **Diff-conditional, fires daily, zero local parity:** `typescript-strict`, `cli-readiness`. **Locked in.**

That fills wave 1 at 5. The other four strong scorers (`project-standards`, `agent-native`, `adversarial`, `reliability`) move to wave 2 — but with a flag: **`project-standards-reviewer` is the strongest demotion candidate to revisit.** It scores 50.0 raw, and the cadence is daily (every CLAUDE.md edit). If wave-1 dispatch wiring lands cleanly, **promote `project-standards-reviewer` to wave 1 immediately** rather than waiting for wave 2.

Recommendation: ship wave 1 as the 5 above, then on the *next* iteration after wave-1 lands, promote `project-standards-reviewer` and `agent-native-reviewer` into the always-on diff-conditional set. That makes effective wave 1 = 7 agents over 2 iterations.

---

## 4. Stack-Rank Table — R4 Researchers (6 candidates)

| # | Agent | F | V | G | C | Score | Tier | Action |
|---:|---|:-:|:-:|:-:|:-:|:-:|---|---|
| 1 | `web-researcher` | 4 | 4 | 4 | 1 | **64.0** | Top — **already shipped** | Already in `plugins/research/agents/web-researcher.md`. Audit per R4 §4: ensure `mode=` parameter folds in `best-practices` + `framework-docs` framings. |
| 2 | `repo-research-analyst` | 2 | 4 | 5 | 2 | **20.0** | Bottom | Defer. Onboarding-discovery cadence is rare on a repo I work daily. Strong fit when *new* contributors arrive — that's not a 2026-Q2 reality here. |
| 3 | `git-history-analyzer` | 2 | 3 | 4 | 2 | **12.0** | Bottom → **Drop** | **Drop from epic.** `git log` / `git blame` are direct shell calls; agent wraps a thin prompt. Value-when-fired is 3 (interesting, rarely actionable). Skip. |
| 4 | `learnings-researcher` | 3 | 4 | 4 | 1 | **48.0** | Top — **already shipped** | Already in `plugins/research/agents/learnings-researcher.md`. Conditional on `docs/solutions/` existing. **Action:** create `docs/solutions/` skeleton (3 stub entries) so the agent has a non-empty corpus. |
| 5 | `session-historian` | 4 | 4 | 5 | 2 | **40.0** | Top — **port now** | **Strong fit.** Loop iteration history (`Iter 22`, `Iter 23`, …) lives in Dart but Claude Code session history is not searchable today. **Zero local equivalent.** Port in wave 1 of research side. |
| 6 | `issue-intelligence-analyst` | 2 | 4 | 4 | 2 | **16.0** | Mid | Wave 2 if GitHub-issue intake grows. Currently issue tracker is Dart, not GitHub Issues. **Conditional defer:** if GitHub Issues activity rises (e.g. external contributors filing on `standardbeagle/agnt`), promote. |

### 4.1 Researcher wave plan

- **Already shipped (3):** `web-researcher`, `best-practices-researcher`, `framework-docs-researcher`, `learnings-researcher`. **Action per R4 §4:** fold `best-practices` + `framework-docs` into `web-researcher` as `mode=` invocations; remove the two standalone files. Net research-shipped count drops 4 → 2 (web + learnings) but capability count stays 4 via mode flag.
- **Port now (1):** `session-historian`.
- **Defer (2):** `repo-research-analyst`, `issue-intelligence-analyst`.
- **Drop (1):** `git-history-analyzer`.

Net: wave-1 research port adds **1 agent** (`session-historian`) and **deletes 2 files** (best-practices, framework-docs) net of `web-researcher` mode work. Total research surface stays at 3 agent files (down from 4) with 5 logical capabilities.

---

## 5. Out-of-R4-Scope: SP/CE Skills + Workflow Agents

R4 declared SP skills, CE workflow agents, CE design agents, CE docs agents out of scope for the consolidation epic. K0 spot-checks them: any score Top by composite?

### 5.1 SP skills (14)

Already loaded via the `superpowers-dev` marketplace, so "port" = own them under SBT (not strict copy). Score them anyway:

| Skill | F | V | G | C | Score | Tier | Note |
|---|:-:|:-:|:-:|:-:|:-:|---|---|
| `subagent-driven-development` | 5 | 4 | 4 | 2 | **40.0** | **Top** — port-into-SBT | The dartai loop *is* subagent-driven. Owning this skill = embedding it into `dartai:start.md` + `workflow:start-loop.md` as a referenced skill. **Already partially happening** via marketplace; making it explicit clarifies the model contract. |
| `using-superpowers` | — | — | — | — | — | **Drop** | Per R1 §6, do not adopt SessionStart injection. SP's main bloat lever. |
| `executing-plans` | 4 | 4 | 3 | 2 | **24.0** | Mid | `dev-standards:grill-task` + `dartai:task-executor` cover most. SP's checkpoint pattern adds value; consider folding key checkpoints into `task-executor`. |
| `verification-before-completion` | 5 | 5 | 3 | 1 | **75.0** | **Top** | Pre-commit verification — overlaps `dartai:post-task-reviewer` Phase 5 but adds explicit "did you actually run the tests?" gate. Fold into `task-executor` Phase 9 final-validation as a checklist. |
| `systematic-debugging` | 3 | 5 | 4 | 1 | **60.0** | **Top** | No SBT equivalent for systematic debug methodology. Adopt as a skill in `dev-standards`. |
| `using-git-worktrees` | 2 | 4 | 5 | 1 | **40.0** | Top | Port if multi-stream work picks up. Currently single-stream → demote to Mid in practice. |
| `requesting-code-review` | 3 | 4 | 4 | 1 | **48.0** | Top | Owns the "ask for review" framing. Could underpin a `/dartai:request-review` command. |
| `receiving-code-review` | 3 | 4 | 4 | 1 | **48.0** | Top | Companion to above. |
| `dispatching-parallel-agents` | 4 | 4 | 4 | 1 | **64.0** | **Top** | The dartai loop dispatches in parallel. Skill formalizes the contract. **Already partially in `dartai:adversarial-quality-loop` skill.** |
| `writing-plans` | 4 | 5 | 3 | 2 | **30.0** | Mid | Overlaps `dev-standards:grill-task` heavily. Don't double-port; fold differential ideas into grill-task. |
| `writing-skills` | 2 | 3 | 4 | 1 | **24.0** | Mid | Plugin-development meta-skill. Already covered by `plugin-dev:skill-development`. |
| `brainstorming` | 3 | 4 | 2 | 2 | **12.0** | Mid | Already shipped via `brainstorming` plugin per S3. Audit for overlap. |
| `finishing-a-development-branch` | 3 | 4 | 4 | 1 | **48.0** | Top | Branch-completion ritual. Fold into `dartai:start.md` close-out phase. |
| `test-driven-development` | 4 | 5 | 3 | 2 | **30.0** | Mid | TDD methodology. Overlaps `risk-pipeline` `tdd_required` flag and `agnt:agent-tdd-refactor`. Fold key practices into a skill. |

**SP add-back to epic:** `subagent-driven-development`, `verification-before-completion`, `systematic-debugging`, `dispatching-parallel-agents`, `requesting-code-review` + `receiving-code-review` (paired), `finishing-a-development-branch`. **All score ≥ 40.** Six skills total. They are *not* in R4's 23-agent count because R4 only audited CE review/research; SP skills are a separate axis.

**Action:** create a new `coordination` plugin (or fold into `dev-standards`) housing these 6 SP skills. Frontmatter rewrite to SBT bilingual `Use when:` style. Cost is low (skills don't need eval harness).

### 5.2 CE skills (43)

Most CE skills are Ruby/Rails-flavored and score 1 on F. The ones that survive:

| Skill | F | V | G | C | Score | Tier | Note |
|---|:-:|:-:|:-:|:-:|:-:|---|---|
| `ce-sessions` | 5 | 5 | 5 | 2 | **62.5** | **Top** | Search prior Claude Code / Codex session history — the *skill* form of `session-historian`. Already covered if we port `session-historian` agent (§4); `ce-sessions` skill is the prompt template. **Defer skill in favor of agent.** |
| `ce-compound` | 4 | 5 | 5 | 2 | **50.0** | **Top** | Document a recently-solved problem to compound team knowledge. **Zero local equivalent.** This is the source-of-truth skill for the `docs/solutions/` pattern that `learnings-researcher` searches. **Port now.** Pairs with the `docs/solutions/` skeleton creation. |
| `ce-debug` | 3 | 5 | 4 | 2 | **30.0** | Mid | Systematic debugging. Overlaps SP `systematic-debugging`. Pick one; SP's framing is shorter. **Don't port both.** |
| `ce-frontend-design` | 2 | 4 | 3 | 3 | **8.0** | Mid → Bottom | Frontend design quality. Overlaps `anthropic-frontend-design` (already loaded via plugin) and SBT's `ux-design` plugin. Skip. |
| `ce-onboarding` | 1 | 4 | 4 | 2 | **8.0** | Bottom | Generates `ONBOARDING.md`. Triggered when new contributors arrive — rare. SBT already has thorough CLAUDE.md. |
| `ce-todo-resolve` | 2 | 3 | 4 | 1 | **24.0** | Mid | Batch TODO resolution after code review. Could fold into `dartai:task-executor` Phase 7 (refactor). Low marginal value. |
| `ce-code-review` | 4 | 5 | 3 | 2 | **30.0** | Mid | Tiered-persona code review with confidence gating. **Overlaps the entire R4 reviewer fleet** — this skill is the *orchestrator* of CE reviewers. R2 already handles orchestration via dartai-loop; importing `ce-code-review` would conflict. **Drop in favor of R2 orchestration.** |
| `ce-plan` | 3 | 4 | 3 | 2 | **18.0** | Mid | Multi-step planning. Overlaps `dev-standards:grill-task` + `dartai:simple-planning`. |
| `ce-work` | 3 | 4 | 3 | 2 | **18.0** | Mid | Execute work efficiently. Overlaps `dartai:task-executor`. |
| `ce-commit-push-pr` + `ce-commit` + `ce-pr-description` | 4 | 3 | 3 | 1 | **36.0** | Mid | Git rituals. Useful but local `gh` CLI + claude commands cover most. Optional fold. |
| `ce-clean-gone-branches` | 1 | 2 | 5 | 1 | **10.0** | Bottom | Branch cleanup ritual. Skip; trivially scriptable. |

All other CE skills (`ce-andrew-kane-gem-writer`, `ce-dhh-rails-style`, `ce-dspy-ruby`, `ce-deploy-docs` for Ruby, `ce-test-xcode`, etc.) score F=1 (Ruby/Rails/iOS — not in scope). **Drop.**

**CE add-back to epic:** `ce-compound` (Top, 50.0). One skill. Pair with `learnings-researcher` agent + `docs/solutions/` skeleton. The trio is the institutional-memory feedback loop.

### 5.3 CE workflow agents (2)

| Agent | F | V | G | C | Score | Tier |
|---|:-:|:-:|:-:|:-:|:-:|---|
| `ce-pr-comment-resolver` | 2 | 4 | 4 | 2 | **16.0** | Mid → Bottom |
| `ce-spec-flow-analyzer` | 2 | 3 | 3 | 2 | **9.0** | Bottom |

Both Bottom. Defer.

### 5.4 CE design agents (3)

| Agent | F | V | G | C | Score | Tier |
|---|:-:|:-:|:-:|:-:|:-:|---|
| `ce-design-implementation-reviewer` | 2 | 3 | 3 | 2 | **9.0** | Bottom |
| `ce-design-iterator` | 2 | 3 | 3 | 2 | **9.0** | Bottom |
| `ce-figma-design-sync` | 1 | 3 | 5 | 3 | **5.0** | Bottom |

All Bottom. Defer. SBT's `ux-design`, `ux-developer`, and `figma-query` plugins cover the same surface.

### 5.5 CE docs agent (1)

| Agent | F | V | G | C | Score | Tier |
|---|:-:|:-:|:-:|:-:|:-:|---|
| `ce-ankane-readme-writer` | 2 | 3 | 2 | 1 | **12.0** | Mid → Bottom |

`dartai:doc-updater` covers most. Skip in this epic; revisit if README quality complaints surface.

---

## 6. Drop List — Cut from KokUI1jNuMv2

The 6 items to remove from epic scope (down from R4's port list):

1. **`security-reviewer` (CE)** — full overlap with `risk-pipeline:security-reviewer` (G=1). Use the local one.
2. **`best-practices-researcher`** (already shipped) — fold into `web-researcher` `mode=best-practices`. Delete the standalone file.
3. **`framework-docs-researcher`** (already shipped) — fold into `web-researcher` `mode=framework-docs`. Delete the standalone file.
4. **`git-history-analyzer`** — score 12, low actionable value. Skip.
5. **`previous-comments-reviewer`** — Bottom tier; defer until human-PR cadence rises.
6. **`python-strict-reviewer`** — Bottom tier; defer until Python work appears. (R4 ported it; K0 demotes.)

Plus already-R4-dropped (do not re-litigate): `deployment-verification`, `schema-drift`, `dhh-rails`, `kieran-rails`, `slack-researcher`.

---

## 7. Final KokUI1jNuMv2 Cluster Plan

Updated cluster ordering for the epic:

### Cluster A — Wave 1 (port + wire first)

5 review agents, 1 research agent, 1 CE skill, 1 SP skill = **8 items**:

| # | Item | Type | Source | Target plugin |
|---:|---|---|---|---|
| 1 | `correctness-reviewer` | review-agent | CE | `compound-review` (new) |
| 2 | `maintainability-reviewer` | review-agent | CE | `compound-review` |
| 3 | `testing-reviewer` | review-agent | CE | `compound-review` |
| 4 | `typescript-strict-reviewer` | review-agent | CE (renamed) | `compound-review` |
| 5 | `cli-readiness-reviewer` | review-agent | CE | `compound-review` |
| 6 | `session-historian` | research-agent | CE | `research` (existing) |
| 7 | `ce-compound` | skill | CE | `dev-standards` |
| 8 | `verification-before-completion` | skill | SP | `dev-standards` |

**Acceptance for wave 1:** all 8 land; 5 reviewers wired into INT1 fast-gate; `session-historian` wired into INT2 planning-research; both skills referenced from `dartai:task-executor`. `claude plugin validate .` passes.

### Cluster B — Wave 2 (port after wave 1 dispatch proven)

7 review agents, 0 research agents, 5 SP skills = **12 items**:

| # | Item | Type | Source | Target plugin |
|---:|---|---|---|---|
| 1 | `project-standards-reviewer` | review-agent | CE | `compound-review` |
| 2 | `agent-native-reviewer` | review-agent | CE | `compound-review` |
| 3 | `adversarial-reviewer` | review-agent | CE | `compound-review` |
| 4 | `architecture-strategist` | review-agent | CE | `compound-review` |
| 5 | `performance-reviewer` | review-agent | CE | `compound-review` |
| 6 | `reliability-reviewer` | review-agent | CE | `compound-review` |
| 7 | `api-contract-reviewer` | review-agent | CE | `compound-review` |
| 8 | `subagent-driven-development` | skill | SP | `dev-standards` or new `coordination` |
| 9 | `dispatching-parallel-agents` | skill | SP | `dev-standards` |
| 10 | `systematic-debugging` | skill | SP | `dev-standards` |
| 11 | `requesting-code-review` + `receiving-code-review` | skills (paired) | SP | `dev-standards` |
| 12 | `finishing-a-development-branch` | skill | SP | `dev-standards` |

**Acceptance for wave 2:** dispatched on epic-completion or human-PR triggers (not always-on); reviewer-side eval harness scenarios per R3 added for the 7 reviewers.

### Cluster C — Bottom Tier (defer, do not port in this epic)

5 review agents, 2 research agents = **7 items**, kept in backlog with explicit re-evaluation triggers:

| # | Item | Re-evaluate when |
|---:|---|---|
| 1 | `previous-comments-reviewer` | Human PR review cadence rises (e.g. external contributors) |
| 2 | `python-strict-reviewer` | Python work resumes (MCP-server scaffold or ML scripts) |
| 3 | `frontend-races-reviewer` | Major frontend feature lands (likely on agnt sketch-mode work) |
| 4 | `data-migrations-reviewer` | Any DB / persistent-state work appears |
| 5 | `repo-research-analyst` | New contributor onboarding, or repo refactor with convention drift |
| 6 | `issue-intelligence-analyst` | GitHub Issues volume rises on `standardbeagle/agnt` or `standardbeagle/lci` |
| 7 | `ce-pr-comment-resolver` | Same as #1 |

### Drop tier (cut from epic, do not port)

Already enumerated in §6.

### Net counts

| Bucket | R4 plan | K0 plan | Δ |
|---|---:|---:|---:|
| Reviewers ported wave 1 | 0 (R4 didn't tier) | **5** | new |
| Reviewers ported wave 2 | 0 | **7** | new |
| Reviewers deferred (Cluster C) | 0 | **5** | new |
| Reviewers dropped from R4's "keep" set | 0 | **2** (security, previous-comments demoted) | net -2 vs R4 |
| Reviewers dropped already (R4 §3) | 4 | 4 | unchanged |
| Reviewers ported total (wave 1 + 2) | 17 | **12** | -5 |
| Researchers ported (incl. shipped) | 6 | **3 files / 4 capabilities** (web with mode flag, learnings, session-historian) | -2 files |
| SP skills added | 0 | **6** | new |
| CE skills added | 0 | **1** (`ce-compound`) | new |
| **Items in actual wave 1** | — | **8** | — |
| **Items in actual wave 2** | — | **12** | — |
| **Items deferred** | — | **7** | — |
| **Items dropped** | 6 (R4) | **8** (R4 + 2 K0 demotions) | +2 |

---

## 8. Fork Slim — superpowers + (no) compound-engineering fork

### 8.1 `standardbeagle/superpowers` fork

`/home/beagle/work/superpowers` last commits:

```
b8192cc refactor(brainstorming): replace shell launchers with cross-platform Node.js
f7ae3a4 feat(brainstorming): use AskUserQuestion with batched questions
917e5f5 Fix Discord invite link
a6b1a1f Update Discord invite link
```

**Customizations beyond upstream:** the brainstorming Node-launcher refactor (b8192cc, f7ae3a4). No agent-level customizations. **No fork-slim needed.** Recommendation: keep the brainstorming refactor in the fork; do not slim agents.

### 8.2 Compound-engineering fork

No fork detected at `/home/beagle/work/standardbeagle-compound-engineering`. CE consumed read-only via `~/.claude/plugins/marketplaces/compound-engineering-plugin`. **No fork-slim needed.**

If a CE fork is created later (e.g. to ship the renames in §5 of R4), apply the K0 drop list at fork creation: do not include `dhh-rails-reviewer`, `kieran-rails-reviewer`, `deployment-verification-agent`, `schema-drift-detector`, `slack-researcher`, `security-sentinel` (merged), `data-migration-expert` (merged), `data-integrity-guardian` (merged), `pattern-recognition-specialist` (merged), `code-simplicity-reviewer` (merged), `performance-oracle` (merged), `cli-agent-readiness-reviewer` (merged), `best-practices-researcher` (merged), `framework-docs-researcher` (merged), `git-history-analyzer` (K0-dropped), `python-strict-reviewer` (K0-deferred), `previous-comments-reviewer` (K0-deferred), `data-migrations-reviewer` (K0-deferred), `repo-research-analyst` (K0-deferred), `issue-intelligence-analyst` (K0-deferred). That's 20 cuts on a fork basis if a slim fork is built.

---

## 9. Document-Review Cluster (R4 Deferred to I3b) — Spot Check

R4 deferred 7 doc-review agents to a separate I3b ticket. K0 spot-check confirms the deferral is correct: doc-review fires on documentation changes (READMEs, ADRs, plan docs), and the SBT cadence for those is weekly (J1/J2/J3 batched). Wave-2 priority at best. Do not promote into KokUI1jNuMv2.

Spot scores (without depth audit):

| Agent | F | V | G | C | Score | Tier |
|---|:-:|:-:|:-:|:-:|:-:|---|
| `ce-doc-review` (orchestrator) | 3 | 3 | 4 | 2 | **18.0** | Mid (I3b) |
| `ce-product-manager-reviewer` | 2 | 3 | 4 | 2 | **12.0** | Mid (I3b) |
| `ce-engineering-leader-reviewer` | 2 | 3 | 4 | 2 | **12.0** | Mid (I3b) |
| `ce-finance-reviewer` | 1 | 3 | 5 | 2 | **7.5** | Bottom |
| `ce-marketing-reviewer` | 1 | 3 | 5 | 2 | **7.5** | Bottom |
| `ce-customer-empathy-reviewer` | 2 | 3 | 4 | 2 | **12.0** | Mid (I3b) |
| `ce-truth-seeker` | 2 | 4 | 4 | 2 | **16.0** | Mid (I3b) |

I3b plan when raised: port 4 (`ce-doc-review`, `ce-product-manager-reviewer`, `ce-engineering-leader-reviewer`, `ce-truth-seeker`), defer 1 (`ce-customer-empathy-reviewer`), drop 2 (`ce-finance-reviewer`, `ce-marketing-reviewer` — no SBT workflow fit).

---

## 10. Adversarial Self-Review — 3 Workflow Scenarios That Did NOT Inform the Score

Per acceptance criterion: red-team the rank against scenarios that did *not* feed the scoring above.

### Scenario A — The user takes on a Rails consulting gig

**Scenario:** A 6-month Rails contract appears. Suddenly daily workflow includes ActiveRecord migrations, Rails-idiom code, RuboCop pain.

**Does the rank still hold?**
- `python-strict-reviewer` deferral — unaffected.
- `data-migrations-reviewer` deferral — **wrong.** Would need promotion to wave 1.
- Dropped `dhh-rails`, `kieran-rails` — **wrong.** Would need un-drop.
- `ruby-strict-reviewer` (doesn't exist; would need new port) — **gap revealed.**

**Verdict:** rank is *brittle to a Rails contract*, but the K0 plan documents Cluster C re-evaluation triggers (§7) explicitly mentioning "DB / persistent-state work" for `data-migrations-reviewer`. The trigger wording covers the migration case. The Ruby/Rails reviewers would require re-opening R4 §3 dedup, not just K0 promotion. **Actionable fix:** add a Cluster C "Rails appears" trigger row that fast-tracks un-dropping `dhh-rails-reviewer` and porting a Ruby-strict reviewer.

### Scenario B — A junior contributor joins and starts opening PRs

**Scenario:** External contributor opens 5 PRs/week on `standardbeagle/agnt`. Human-PR review cadence becomes daily.

**Does the rank still hold?**
- `previous-comments-reviewer` deferral — **wrong.** Would need wave-1 promotion.
- `requesting-code-review` + `receiving-code-review` skills (wave 2) — **timing is OK, just earlier.**
- `repo-research-analyst` deferral — partially wrong. New contributor onboarding is exactly its trigger. Would need promotion.
- `issue-intelligence-analyst` deferral — partially wrong. GitHub Issues uptick is its trigger.

**Verdict:** rank documents the right triggers in Cluster C (§7 rows 1, 5, 6), so the re-evaluation contract holds. The deferral is not a *rank error*; it's a *cadence bet*. If the bet flips, K0's framing tells you exactly what to promote.

### Scenario C — A security incident on a deployed package

**Scenario:** A CVE is reported on `@standardbeagle/agnt`. Security-review cadence spikes. Forensic analysis needs to look at every prior release.

**Does the rank still hold?**
- Drop of `security-reviewer` (CE) in favor of `risk-pipeline:security-reviewer` — **OK.** Local agent handles CVE-class review. But: does it cover *forensic timeline reconstruction*? Probably not.
- `git-history-analyzer` drop — **wrong in this scenario.** Forensic reconstruction is exactly its strong suit (when did this code land, who reviewed it, was there a related discussion).
- `session-historian` Top placement — **OK.** Cross-session memory of "did we discuss this attack vector before?" matters.
- `previous-comments-reviewer` deferral — **partial wrong.** Reviewing prior PR comments on the affected code is part of forensic.

**Verdict:** the security-incident scenario surfaces the **only genuine K0 ranking error**: `git-history-analyzer` was scored on its happy-path workflow (curiosity) and undervalued for the rare-but-high-stakes forensic case. **Actionable fix:** keep the drop in this epic (frequency bet stands) but document `git-history-analyzer` as a "rapid revival" candidate in Cluster C's re-evaluation table — same trigger language as `data-migrations-reviewer`.

### Adversarial summary

| Scenario | Rank correctness | Required fix |
|---|---|---|
| A — Rails gig | Triggers documented; one new trigger row needed | Add "Rails appears" trigger to Cluster C |
| B — Junior contributor | Triggers documented correctly | None |
| C — CVE incident | One scoring error: `git-history-analyzer` undervalued for forensic | Move git-history from Drop to Cluster C with "security incident" trigger |

**Net adversarial fix list (applied below):**

1. Cluster C add: "Rails contract appears → un-drop `dhh-rails-reviewer`, scope new `ruby-strict-reviewer`."
2. Cluster C add: "Security incident / CVE → port `git-history-analyzer` for forensic timeline reconstruction." (Demotes git-history from Drop to deferred.)

§7 Cluster C is updated with these two rows in §11.

---

## 11. Updated Cluster C — Re-Evaluation Triggers (after adversarial fixes)

| # | Item | Re-evaluate when |
|---:|---|---|
| 1 | `previous-comments-reviewer` | Human PR review cadence rises (external contributors filing PRs) |
| 2 | `python-strict-reviewer` | Python work resumes (MCP-server scaffold or ML scripts) |
| 3 | `frontend-races-reviewer` | Major frontend feature lands |
| 4 | `data-migrations-reviewer` | Any DB / persistent-state work appears |
| 5 | `repo-research-analyst` | New contributor onboarding, or repo refactor with convention drift |
| 6 | `issue-intelligence-analyst` | GitHub Issues volume rises on a SBT-published package |
| 7 | `ce-pr-comment-resolver` | Same as #1 |
| 8 | **`git-history-analyzer`** *(adversarial revival)* | **Security incident, forensic timeline reconstruction needed, post-mortem investigation** |
| 9 | **Rails reviewers (`dhh-rails`, future `ruby-strict`)** *(adversarial revival)* | **User takes Rails consulting work or starts a Rails project** |

---

## 12. Inputs to Downstream Tickets

- **KokUI1jNuMv2 epic description rewrite (next action):**
  - Replace flat "19 agents" backlog with K0's Cluster A / B / C / Drop tiers.
  - Wave-1 acceptance: 5 reviewers + `session-historian` + `ce-compound` + `verification-before-completion` ported and dispatch-wired.
  - Wave-2 acceptance: 7 reviewers + 5 SP skills ported and dispatch-wired (epic-conditional triggers).
  - Cluster C: documented as backlog with explicit triggers (§11).
  - Drop list: 6 items removed from scope (§6).
  - Net agent count: 17 → 12 review-agents + 1 research-agent + 6 SP skills + 1 CE skill = **20 ports across 2 waves**.

- **R1 frontmatter cap:** 20 ports × ~600 B = ~12 KB ≈ +9.6% on 125 KB index. **Well under** R1's 17% budget. Headroom for I3b doc-review (4 more = ~+2 KB) preserved.

- **R2 dispatch wiring:**
  - INT1 fast-gate: 5 wave-1 reviewers join existing `code-quality-reviewer` + `qa-reviewer`. After wave 2, `project-standards-reviewer` + `agent-native-reviewer` join always-on diff-conditional set.
  - INT2 planning-research: `session-historian` joins existing `web-researcher` + `learnings-researcher` parallel dispatch.
  - INT3 doc-review: still deferred (separate I3b ticket).

- **R3 eval harness:** 12 reviewer scenarios + 1 research scenario = 13 new eval cases for KokUI1jNuMv2 (vs. R4's implicit 23). Smaller harness, faster signal.

- **NEW ticket suggested:** "Adopt `docs/solutions/` skeleton + port `ce-compound` skill" — pairs with `learnings-researcher`. Spawn from KokUI1jNuMv2 wave 1 as a same-cluster subtask.

- **NEW ticket suggested:** "Audit & fold `best-practices-researcher` + `framework-docs-researcher` into `web-researcher` mode-flag" — wave-1 cleanup.

---

## Appendix A — Scoring Sensitivity Notes

A few entries are within 1 composite point of the next tier; note them so a future re-rank can be informed:

- `cli-readiness-reviewer` Top vs Mid: 32.0 vs threshold 12. Comfortably Top.
- `adversarial-reviewer` Mid vs Top: 40.0 raw → demoted by capacity. If wave-1 budget grows to 6, **promote**.
- `reliability-reviewer` Mid vs Top: 37.5 raw → demoted by diff-conditional cadence. If MCP-server I/O work increases (likely on `agnt` daemon), **promote**.
- `agent-native-reviewer` Mid vs Top: 40.0 raw → reconciled into wave 2 in §3.1; **strong promotion candidate** to wave 1 right after wave 1 lands.
- `previous-comments-reviewer` Bottom vs Mid: 24.0 raw, demoted on cadence — sensitive to scenario B above.
- `git-history-analyzer` Drop vs Bottom: 12.0 raw, revived to Bottom per scenario C.

## Appendix B — Files Touched / Created by This Research

- **Created:** `docs/research/K0-ce-feature-stack-rank.md` (this file).
- **Will trigger creation in KokUI1jNuMv2:**
  - `plugins/compound-review/` (new plugin) with `agents/` for wave-1 reviewers.
  - `plugins/research/agents/session-historian.md` (wave-1 research port).
  - `plugins/dev-standards/skills/ce-compound/` (new skill dir).
  - `plugins/dev-standards/skills/verification-before-completion/` (SP skill adoption).
  - `docs/solutions/` (skeleton dir for `learnings-researcher` + `ce-compound`).
- **Will trigger deletion in KokUI1jNuMv2:**
  - `plugins/research/agents/best-practices-researcher.md` (folded into `web-researcher`).
  - `plugins/research/agents/framework-docs-researcher.md` (folded into `web-researcher`).
- **Will trigger description update:** `KokUI1jNuMv2` epic in Dart (separate task action).
