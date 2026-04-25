# R4 — CE Review + Research Agent Uniqueness Audit

**Status:** Done
**Dart task:** [dF7fitliV0rh](https://app.dartai.com/task/dF7fitliV0rh)
**Parent epic:** `5M3PMcxNe1cB` — Consolidate superpowers + compound-engineering into standardbeagle-tools
**Author:** task-executor (auto), iteration 4
**Date:** 2026-04-25
**Time-boxed:** 2h
**Inputs:** R1 (manifest audit, 50-agent count + 36-agent bloat cap), R2 (sub-dispatch interface contracts), R3 (eval harness)

---

## 1. Executive Summary

CE ships **50 agents** across six directories. The R1 audit corrected the spec's "27 review" to a real count of **28 review + 9 research + 7 document-review + 3 design + 2 workflow + 1 docs**. R4 dedups two of those buckets (review and research, the two scoped by the task) plus an explicit scope decision on the other four.

**Headline numbers:**

| Bucket | CE has | After dedup | Cut |
|---|---:|---:|---:|
| Review | 28 | **17** | −11 |
| Research | 9 | **6** | −3 |
| Document-review | 7 | **7 (out of port scope for I1+I5)** | 0 |
| Workflow / design / docs | 6 | **0 (out of scope)** | 0 |
| **Total port (I2+I3)** | 37 | **23** | **−14** |

**Final port count:** **N = 17 reviewers + M = 6 research = 23 agents.** Comfortably under R1's 36-agent bloat cap (~64% of cap). Document-review (7) is recommended as a **separate later port** (I3b) because document-review and code-review have different orchestration entry points and shouldn't be co-mingled in I1's first wave.

**Naming decision:** **Rename maintainer-named reviewers to role-based names** (`rails-strict-reviewer`, `typescript-strict-reviewer`, `frontend-races-reviewer`). Preserves the strict-bar discipline; loses Kieran/DHH/Julik attribution. Rationale in §5.

---

## 2. Method

For each agent in `agents/review/` and `agents/research/`:

1. Read full frontmatter (`name`, `description`, `model`, `tools`, `color`).
2. Read full body — system prompt, "what we hunt", confidence calibration, "what we don't flag", output schema.
3. Cluster by **functional output**: what does this agent uniquely *find* that no other agent in the cluster would find?
4. Apply the adversarial verifier test: **for each merge proposal, can I describe a real diff/review case where the kept agent catches what the merged agent would miss?** If yes, the merge is rejected.

The "what we don't flag" sections were the strongest signal. Many CE review agents *explicitly* call out their non-overlap with sibling reviewers (e.g. `ce-adversarial-reviewer` lists 8 sibling reviewers and disclaims their domains). When CE itself documents the boundary, dedup becomes a source-of-truth comparison rather than a guess.

**Files inspected:**
- `~/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/review/*.md` (28 files)
- `~/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/research/*.md` (9 files)
- `~/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/document-review/*.md` (7 files; scope decision only)
- `~/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/workflow/*.md` (2 files; scope decision only)

---

## 3. Review Persona Dedup Table (28 → 17)

Decisions: **keep** (port as-is, normalize per R1 §2.2), **merge-into-X** (X is the canonical clustermate; this agent's distinct logic, if any, gets folded into X's body), **drop** (functionally redundant; nothing unique to fold in).

| # | Agent | Cluster | Decision | Rationale |
|---|---|---|---|---|
| 1 | `ce-correctness-reviewer` | correctness | **keep** | Always-on persona. Catches off-by-one, null/undefined, state machines, error swallowing. CE explicitly carves it out from `ce-adversarial-reviewer` ("individual logic bugs without cross-component impact"). |
| 2 | `ce-adversarial-reviewer` | correctness | **keep** | *Composition* failures across multiple reviewer domains — assumption violations + cascading failures + abuse cases. Body's "what we don't flag" lists 8 sibling reviewers — the explicit gap-finder *between* them. **Adversarial verifier test:** correctness catches `if (x === null) crash`; adversarial catches `payment timeout → unbounded retry → inventory desync`. Different findings, both real. **Merge rejected.** |
| 3 | `ce-pattern-recognition-specialist` | maintainability | **merge-into ce-maintainability-reviewer** | 80%+ overlap with maintainability ("dead code", "premature abstraction", "naming"). Unique parts: jscpd duplication detection (fold in as a §"Duplication" subsection) and "design pattern detection" (Factory/Singleton/Observer — naming patterns, not anti-patterns; low value, drop). |
| 4 | `ce-maintainability-reviewer` | maintainability | **keep** (canonical) | Always-on persona. Crisp scope: premature abstraction, indirection, dead code, naming-obscures-intent. R1's bilingual normalization works cleanly here. |
| 5 | `ce-code-simplicity-reviewer` | maintainability | **merge-into ce-maintainability-reviewer** | YAGNI / minimalism. The maintainability reviewer already hunts "premature abstraction" — code-simplicity is the same finding from a slightly different angle. Fold its "line-by-line necessity" pass as a §"Simplicity" subsection. |
| 6 | `ce-architecture-strategist` | architecture | **keep** | Distinct from maintainability: works at *system-boundary* level — service boundaries, module relationships, layer violations. Maintainability is file-local; architecture-strategist is cross-cutting. Verifier test: maintainability won't catch "service A is reaching into service B's database"; architecture-strategist will. |
| 7 | `ce-security-reviewer` | security | **keep** (canonical) | Diff-conditional persona, terse, surgical (~50 lines). Has crisp "don't flag" list (no defense-in-depth advisories, no theoretical attacks). |
| 8 | `ce-security-sentinel` | security | **merge-into ce-security-reviewer** | Same domain (OWASP, injection, auth, secrets). 90+ line body is a generic checklist; reviewer is targeted at diffs. Fold sentinel's "OWASP Top 10 systematic check" as an optional Phase 2 in the canonical reviewer. **Adversarial verifier test:** can sentinel catch a vuln reviewer misses? Sentinel's checklist could surface "missing CSRF token on a non-mutating endpoint" but reviewer's "what we don't flag" rules that out as defense-in-depth advisory. Reviewer's discipline is stricter and more useful. **Merge stands.** |
| 9 | `ce-performance-reviewer` | performance | **keep** (canonical) | Diff-conditional, sharp scope: N+1, unbounded growth, missing pagination, hot-path allocation. Confidence calibration explicitly tuned high (0.80+) to avoid optimization noise. |
| 10 | `ce-performance-oracle` | performance | **merge-into ce-performance-reviewer** | Same domain. Oracle is more verbose (113 lines) and more speculative ("project at 10×/100×/1000×"). Reviewer explicitly disowns "theoretical scale issues in MVP/prototype code" — oracle's headline output. Fold oracle's "scaling projection" as an optional appendix. |
| 11 | `ce-reliability-reviewer` | reliability | **keep** | Distinct from correctness (logic bugs) and adversarial (composition). Reliability is *I/O failure modes*: missing error handling, retry storms, cascading timeouts, partial-failure recovery. Verifier test: correctness catches `if (resp == null) crash`; reliability catches `no timeout on the HTTP call that produced resp`. Different findings. |
| 12 | `ce-testing-reviewer` | testing | **keep** | Always-on. No clustermate — testing-quality is its own axis (coverage gaps, weak assertions, brittle implementation-coupling). |
| 13 | `ce-api-contract-reviewer` | API | **keep** | Diff-conditional, narrow scope: breaking changes to public interfaces. Adversarial-reviewer explicitly disclaims this domain. No clustermate. |
| 14 | `ce-data-migrations-reviewer` | data-migration | **keep** (canonical) | Diff-conditional on migration files. Tightest scope of the three data-* agents. |
| 15 | `ce-data-migration-expert` | data-migration | **merge-into ce-data-migrations-reviewer** | Same domain (migration safety, swapped mappings). Expert is more checklist-heavy (rollback plans, dual-write windows, observability). Fold expert's "rollback safety + dual-write checklist" as a §"Pre-deploy verification" subsection. |
| 16 | `ce-data-integrity-guardian` | data-migration | **merge-into ce-data-migrations-reviewer** | Broader scope (PII, GDPR, transactions, referential integrity) but lower precision. The PII/GDPR portion is the only genuinely distinct piece — fold it as a §"Privacy/PII" check. The constraint/transaction portion is already covered by reviewer + reliability-reviewer. |
| 17 | `ce-deployment-verification-agent` | data-migration | **drop** | Output is a Go/No-Go checklist for risky data deploys, not a code-review finding. Deployment checklists belong in CI/release tooling, not in the per-PR review fleet. SBT's `risk-pipeline` plugin already handles deploy-risk gating; ce-deployment-verification-agent's checklist content can become a one-time *skill* in `dev-standards` if useful, but it's not a reviewer. |
| 18 | `ce-schema-drift-detector` | data-migration | **drop** | Catches "unrelated schema.rb changes from other branches" — a Rails-specific Git-hygiene problem. Out of scope for SBT (multi-language, no Rails-specific git ritual). If a Rails port arrives later, revisit; until then, drop. |
| 19 | `ce-cli-readiness-reviewer` | CLI | **keep** (canonical) | Diff-conditional, surgical (~70 lines). 7 principles, severity-mapped (Blocker/Friction/Optimization). Aligns with SBT's CLI-heavy plugin work. |
| 20 | `ce-cli-agent-readiness-reviewer` | CLI | **merge-into ce-cli-readiness-reviewer** | Same 7 principles, but 417 lines (vs. 70). The longer one reads more like a *skill* (full reference manual with framework-idiom appendix) than a reviewer agent. Keep the surgical reviewer; fold the framework-idiom reference into a separate skill (`cli-readiness-reference`) if/when needed. **Adversarial verifier test:** can the long version catch what the short one misses? The long version covers spec/plan review (not just code). Fold that as one extra trigger in the canonical reviewer's description: "Use when reviewing CLI source, plans, or specs." Done. |
| 21 | `ce-agent-native-reviewer` | agent-native | **keep** | Distinct: "every UI action has a matching agent tool". Fits SBT's `agnt`/MCP-heavy ecosystem perfectly. No clustermate. |
| 22 | `ce-project-standards-reviewer` | project-standards | **keep** | Reads `CLAUDE.md`/`AGENTS.md` and audits against project-specific rules. SBT *is* a CLAUDE.md-driven repo; this agent maps directly to enforcing the project memory + rule files. **High value-fit.** |
| 23 | `ce-previous-comments-reviewer` | PR-context | **keep** | Checks whether prior PR review feedback was addressed. Distinct mechanism (reads `<pr-context>` block); used during PR review cycles. No clustermate. Conditional on PR context. |
| 24 | `ce-dhh-rails-reviewer` | maintainer-named (Rails) | **drop** | Rails-specific *and* style-specific (DHH's omakase). SBT has zero Rails. If a Rails dartboard arrives later, revisit. |
| 25 | `ce-kieran-rails-reviewer` | maintainer-named (Rails) | **drop** | Same reason. |
| 26 | `ce-kieran-python-reviewer` | maintainer-named (Python) | **rename → `python-strict-reviewer`** | The "Kieran-strict bar" content is generally good Python review (type hints, clarity, modern idioms). Rename, drop the persona framing, keep the rules. See §5. |
| 27 | `ce-kieran-typescript-reviewer` | maintainer-named (TS) | **rename → `typescript-strict-reviewer`** | Same. Type-safety + strictness rules are language-general, not Kieran-personal. |
| 28 | `ce-julik-frontend-races-reviewer` | maintainer-named (frontend) | **rename → `frontend-races-reviewer`** | The lifecycle-cleanup + race-condition rules are framework-general (React, Stimulus, Vue all hit these). Drop persona, keep rules. |

### 3.1 Cluster summary

| Cluster | Canonical | Merged-in | Dropped |
|---|---|---|---|
| Correctness | `correctness-reviewer` | — | — |
| Adversarial | `adversarial-reviewer` | — | — |
| Maintainability | `maintainability-reviewer` | `pattern-recognition-specialist`, `code-simplicity-reviewer` | — |
| Architecture | `architecture-strategist` | — | — |
| Security | `security-reviewer` | `security-sentinel` | — |
| Performance | `performance-reviewer` | `performance-oracle` | — |
| Reliability | `reliability-reviewer` | — | — |
| Testing | `testing-reviewer` | — | — |
| API | `api-contract-reviewer` | — | — |
| Data-migration | `data-migrations-reviewer` | `data-migration-expert`, `data-integrity-guardian` | `deployment-verification-agent`, `schema-drift-detector` |
| CLI | `cli-readiness-reviewer` | `cli-agent-readiness-reviewer` | — |
| Agent-native | `agent-native-reviewer` | — | — |
| Project-standards | `project-standards-reviewer` | — | — |
| PR-context | `previous-comments-reviewer` | — | — |
| Python | `python-strict-reviewer` (renamed) | — | — |
| TypeScript | `typescript-strict-reviewer` (renamed) | — | — |
| Frontend-races | `frontend-races-reviewer` (renamed) | — | — |
| (Rails — dropped) | — | — | `dhh-rails-reviewer`, `kieran-rails-reviewer` |

**N = 17 unique reviewers** (5 merged, 4 dropped, 3 renamed). 28 → 17 is a 39% cut.

---

## 4. Research Agent Dedup Table (9 → 6)

| # | Agent | Cluster | Decision | Rationale |
|---|---|---|---|---|
| 1 | `ce-web-researcher` | external-research | **keep** (canonical) | The general-purpose external-research agent: prior art, market signals, cross-domain analogies. `tools: WebSearch, WebFetch`. Used by `ce-ideate` Phase 1. |
| 2 | `ce-best-practices-researcher` | external-research | **merge-into ce-web-researcher** | Both fetch external docs. "Best practices" is a *prompt template* on top of generic web research, not a separate agent. Fold its "industry standards / community conventions" prompt as a `--mode=best-practices` invocation inside the canonical web researcher. **Adversarial verifier test:** can best-practices catch what web-researcher misses? Both end up running `WebSearch` + `WebFetch`. The framing differs; the data source doesn't. **Merge stands.** |
| 3 | `ce-framework-docs-researcher` | external-research | **merge-into ce-web-researcher** | Same fetcher, narrower target (framework official docs, version-specific constraints). Fold as `--mode=framework-docs`. The narrow targeting is a useful *prompt* but not a useful *separate agent surface*. |
| 4 | `ce-repo-research-analyst` | repo-research | **keep** | Distinct mechanism: reads the *current* repository, not the web. No `WebSearch` tool. Targets onboarding + convention discovery. Used during planning. **Strong fit for SBT** (the marketplace itself benefits from a "what conventions does this repo follow?" agent). |
| 5 | `ce-git-history-analyzer` | repo-research | **keep** | Distinct: runs `git log`/`git blame`/etc. to extract *temporal* signal — code evolution, contributor patterns, "why does this exist". Verifier test: repo-research-analyst reads what's there *now*; git-history-analyzer reads what was there *and changed*. Different findings. |
| 6 | `ce-learnings-researcher` | institutional-knowledge | **keep** | Searches `docs/solutions/` for prior documented solutions by frontmatter metadata. SBT-relevant if SBT adopts the `docs/solutions/` pattern (CE's compounding mechanism). **Conditional keep:** include in port only if I4 also commits to adopting `docs/solutions/`. If not adopted, drop. **R4 recommendation:** keep — adopting `docs/solutions/` is cheap and aligns with SBT's `docs/research/` pattern. |
| 7 | `ce-session-historian` | institutional-knowledge | **keep** | Searches Claude Code / Codex / Cursor session histories for prior work on the same topic. Cross-session memory is a genuine novel capability — no SBT plugin currently does this. **Strong fit.** |
| 8 | `ce-issue-intelligence-analyst` | issue-research | **keep** | Fetches GitHub issues, surfaces themes/patterns. Distinct mechanism (GitHub API), distinct output (theme-level intel, not ticket-level). No clustermate. Used by `ce-ideate` for grounding. |
| 9 | `ce-slack-researcher` | external-knowledge | **drop** | Searches Slack via Slack MCP for org context. SBT does not have a Slack MCP integration in scope (it would be a separate plugin entirely, with auth/workspace setup). Drop until/unless someone wires up `slack-mcp`. The agent's prompt is reusable verbatim *if* that plugin lands later. |

### 4.1 Cluster summary

| Cluster | Canonical | Merged-in | Dropped |
|---|---|---|---|
| External research | `web-researcher` | `best-practices-researcher`, `framework-docs-researcher` | — |
| Repo research | `repo-research-analyst` | — | — |
| Git history | `git-history-analyzer` | — | — |
| Learnings | `learnings-researcher` | — | — |
| Session history | `session-historian` | — | — |
| Issue intelligence | `issue-intelligence-analyst` | — | — |
| Slack | — | — | `slack-researcher` |

**M = 6 unique research agents** (2 merged, 1 dropped). 9 → 6 is a 33% cut.

---

## 5. Naming Recommendation: Drop Maintainer Names

**Decision:** rename `ce-kieran-python-reviewer` → `python-strict-reviewer`, `ce-kieran-typescript-reviewer` → `typescript-strict-reviewer`, `ce-julik-frontend-races-reviewer` → `frontend-races-reviewer`. Drop `ce-dhh-rails-reviewer` and `ce-kieran-rails-reviewer` outright (Rails not in scope).

**Rationale:**

1. **Discoverability.** SBT's discovery index uses keyword search via `Skill`/`Task` tool descriptions. A user asking for "strict TypeScript review" will find `typescript-strict-reviewer` immediately. They will not find `ce-kieran-typescript-reviewer` unless they already know who Kieran is. R1's frontmatter cap (~1 KB) makes every byte of the discovery index count — proper-noun framing is dead weight to most readers.

2. **Identity.** R1 §6 caps the consolidation at N≈36 ports under the SBT brand. Keeping `ce-` prefix and maintainer names imports CE's branding and CE's authorial voice into a marketplace that has its own conventions (bilingual `Use when:` triggers, `${CLAUDE_PLUGIN_ROOT}`, slop-mcp). The SBT plugin should look like SBT.

3. **Content portability.** The Kieran-bar TypeScript rules ("no `any`, no unchecked casts, narrow nullable flows") are not Kieran-personal — they're standard strict-TS guidance. Keeping the maintainer attribution implies the rules are personal taste, which weakens the reviewer's authority when the user disagrees. A renamed `typescript-strict-reviewer` cites the rules on their merits.

4. **R1 frontmatter cap.** Description bytes saved by dropping "Kieran's strict bar for" and similar phrasing are ~30–50 B per agent, multiplied by 3 = ~150 B. Small but free.

5. **Attribution preserved in body.** The renamed agents can keep a one-line attribution at the top of their body (e.g. "Strict-TS rules originally codified by Kieran Klaassen (Compound Engineering)"). That keeps credit without paying the discovery-surface cost.

**Counter-argument considered (and rejected):** "Maintainer names give the reviewer a *voice* and make findings more memorable." True for human readers; irrelevant for the model that picks the agent from a description. The model selects based on capability keywords (`type-safety`, `strict`), not on persona. Voice in the *body* is fine; voice in the *name* is a discovery tax.

**Migration note for I5 (frontmatter normalization):** add the rename to I5's checklist. The body can keep the persona framing if it adds value to the prompt; the frontmatter `name` and `description` must be role-based.

---

## 6. Final Port Count Summary

| Component | Count | Notes |
|---|---:|---|
| Reviewers (I2 first wave) | 17 | §3.1 |
| Research (I3 first wave) | 6 | §4.1 |
| **Subtotal** | **23** | Below R1's 36-cap |
| Document-review (deferred to I3b) | 7 | Different orchestration entry; ports cleanly later |
| Workflow / design / docs (out of scope) | 6 | Not needed for the consolidation epic |

**At per-agent frontmatter ~600 B** (R1 §4.1 normalized estimate) **× 23 = ~13.8 KB added to the discovery index** (~3450 tokens). On a current 125 KB SBT base, that's **+11% growth** — within R1's 17% budget at N=36, and headroom remains for the deferred document-review wave.

**At full deferred set (23 + 7 = 30):** ~18 KB / ~4500 tokens / +14.4%. Still inside R1's budget.

---

## 7. Compatibility Check Against R1 + R2

**R1 §6 (conditional-dispatch only):** all 23 ported agents become *agents* (not skills) and ship their bodies in Layer 1 (loaded via `Task` tool dispatch). Frontmatter only at Layer 0. **Compatible.**

**R1 §2.2 (frontmatter normalization):** rewrite `tools:` → `allowed-tools:`, add bilingual `Use when:` triggers, target ~500–700 B. **Compatible.** The renames in §5 reduce a few descriptions further.

**R2 §3 (Task-tool dispatch):** all 23 agents are reachable via `Task(subagent_type="<agent-name>")`. Their output schemas conform to R2 §4.1 (`review_report`) for reviewers and §4.2 (`research_report`) for researchers. CE already uses a JSON-schema output convention (`{"reviewer": "...", "findings": [], "residual_risks": [], "testing_gaps": []}` for reviewers) — port maps 1:1 onto R2's `review_report` shape. **Compatible.**

**R2 §1 (INT1/INT2/INT3):**
- INT1 (fast-gate review): the 17 reviewers are exactly INT1's payload. R2's "fast gate" picks the always-on three (`correctness`, `maintainability`, `testing`) plus diff-conditional ones (`security`, `performance`, `api-contract`, `data-migrations`, `cli-readiness`, `python-strict`/`typescript-strict`/`frontend-races`/`agent-native`/`project-standards`/`previous-comments` per diff trigger).
- INT2 (planning research): the 6 researchers are exactly INT2's payload. `ce-ideate`-style Phase-1 parallel dispatch maps onto SBT's planner.
- INT3 (post-task doc-review): the 7 deferred document-review agents are exactly INT3's payload. **Document-review's deferral is what makes I3b a clean follow-up ticket.**

**Compatible.**

---

## 8. Adversarial Self-Review

Red-teaming the dedup decisions:

1. **Claim:** "`ce-correctness-reviewer` and `ce-adversarial-reviewer` are distinct." → **Challenge:** can I name a real review case where one catches what the other misses? Yes — correctness catches a single-function null deref (`user.profile.name` when profile is null). Adversarial catches a multi-step cascade (payment service times out, retry policy is unbounded, retry storm hits database, database connection pool exhausts, login starts failing). Both real, neither subset of the other. **Merge correctly rejected.**

2. **Claim:** "`ce-pattern-recognition-specialist` merges into `ce-maintainability-reviewer`." → **Challenge:** can pattern-recognition catch what maintainability misses? Pattern-recognition's distinct headline is `jscpd` duplicate-block detection. Maintainability's "dead code" check doesn't run a tokenizer. **Partial gap.** Resolution: fold pattern-recognition's jscpd subsection into the merged agent's body. Loss-free.

3. **Claim:** "`ce-security-sentinel` merges into `ce-security-reviewer`." → **Challenge:** can sentinel catch a vuln reviewer's "what we don't flag" rules out? Sentinel's checklist would surface "missing CSP header" — reviewer rules that out as defense-in-depth advisory. So sentinel produces *more* findings, but reviewer's discipline says many of them shouldn't be reported. The discipline is the value, not the breadth. **Merge stands.**

4. **Claim:** "`ce-performance-oracle` merges into `ce-performance-reviewer`." → **Challenge:** oracle's "10×/100×/1000× projection" — does reviewer cover that? Reviewer explicitly disowns it ("don't flag theoretical scale issues in MVP/prototype"). So oracle's scaling-projection is a legitimate distinct output. Resolution: fold as an optional appendix activated by an explicit trigger ("when scaling projection is requested"). Without that, projections are noise. **Merge stands with conditional fold.**

5. **Claim:** "`ce-data-migration-expert`, `ce-data-integrity-guardian`, `ce-data-migrations-reviewer` collapse to one." → **Challenge:** data-integrity-guardian's PII/GDPR portion — is that genuinely covered by the canonical reviewer? No — the canonical reviewer is migration-specific, not data-handling-general. Resolution: fold the PII/GDPR check as a §"Privacy" subsection in the merged agent. **Merge stands with explicit fold.** The other portions (constraints, transactions, referential integrity) are duplicates with reviewer + reliability.

6. **Claim:** "`ce-deployment-verification-agent` is dropped, not merged." → **Challenge:** is its output (Go/No-Go checklist) genuinely outside the reviewer fleet's contract? Yes — reviewers produce `findings`/`residual_risks`/`testing_gaps`. A Go/No-Go is an *artifact for the human deployer*, not a finding. SBT's `risk-pipeline` plugin is the right home for that artifact. **Drop stands.** Optionally rehome the prompt as a skill in `dev-standards`.

7. **Claim:** "`ce-best-practices-researcher` and `ce-framework-docs-researcher` merge into `ce-web-researcher`." → **Challenge:** the `tools:` frontmatter differs — `ce-web-researcher` has explicit `WebSearch, WebFetch`; the other two inherit. Are the prompts genuinely substitutable? Both call the same tools at runtime. The framing differs (best-practices = "industry standards"; framework-docs = "official docs + version constraints"). Resolution: keep the canonical tools list, fold both framings as `mode=` instruction stanzas in the body. Caller chooses mode at dispatch. **Merge stands.**

8. **Claim:** "Maintainer names should be dropped, not preserved." → **Challenge:** does style attribution matter for reviewer authority? The body still cites the rules; only the name changes. The argument that maintainer names "earn" reviewer authority is exactly the over-engineering R1 warns against — proper nouns in the discovery index pay tokens for branding, not capability. **Decision stands.**

9. **Claim:** "Document-review (7 agents) is out of scope for I1+I5." → **Challenge:** could SBT use document-review *now* during planning? Yes — but the dispatch entry point is different (called on a *document*, not a *diff*). Mixing it into I2's review fleet conflates two orchestration shapes. Cleaner to ship I2 first, then add I3b for document-review with its own integration ticket. **Deferral stands.**

10. **Claim:** "Final count fits R1's cap of 36." → **Challenge:** verify arithmetic. 17 + 6 = 23. 23 ≤ 36. With deferred 7 added: 30 ≤ 36. **Confirmed.** Discovery-index growth at 23: ~13.8 KB / 125 KB base = +11%. R1's budget is +17% at N=36. **Confirmed under budget.**

No claim was rejected after challenge.

---

## Appendix A — Raw Counts

```
CE agents directory:
  agents/review/             28 .md files
  agents/research/            9 .md files
  agents/document-review/     7 .md files
  agents/workflow/            2 .md files
  agents/design/              3 .md files
  agents/docs/                1 .md file
  TOTAL                      50

R4 dedup output:
  Reviewers kept:            17
  Reviewers merged:           5 (5 sources folded into 4 canonicals)
  Reviewers dropped:          4 (deployment-verification, schema-drift, dhh-rails, kieran-rails)
  Reviewers renamed:          3 (kieran-python, kieran-typescript, julik-frontend-races)

  Research kept:              6
  Research merged:            2 (best-practices, framework-docs → web)
  Research dropped:           1 (slack-researcher)

  Port total (I2+I3):        23
  Deferred (I3b doc-review):  7
  Out of scope:               6 (workflow, design, docs)
```

## Appendix B — Files Inspected

Frontmatter + body of all 50 CE agents under:
- `/home/beagle/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/review/*.agent.md`
- `/home/beagle/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/research/*.agent.md`
- `/home/beagle/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/document-review/*.agent.md`
- `/home/beagle/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/workflow/*.agent.md`

Cross-referenced against:
- `/home/beagle/work/standardbeagle-tools/docs/research/R1-plugin-manifest-audit.md`
- `/home/beagle/work/standardbeagle-tools/docs/research/R2-dartai-subdispatch-interface.md`
- `/home/beagle/work/standardbeagle-tools/docs/research/R3-eval-harness-decision.md`

## Appendix C — Inputs to Downstream Tickets

- **I1 (port SP skills):** unchanged.
- **I2 (port CE review agents):** port the 17 in §3.1 with merges/folds documented inline. Frontmatter normalization per R1 §2.2 + §5 renames.
- **I3 (port CE research agents):** port the 6 in §4.1. Web-researcher gets `mode=` parameter for best-practices and framework-docs.
- **I3b (NEW; not yet ticketed):** port the 7 document-review agents as a follow-up. Spawn this ticket from the parent epic after I2/I3 land. Apply same dedup discipline.
- **I5 (frontmatter normalization):** add §5's renames (`kieran-*` → `*-strict-reviewer`, `julik-*` → `frontend-races-reviewer`) to its checklist.
- **I6 (SessionStart decision):** unchanged (R1 confirmed: do not adopt).
- **NEW finding for the epic:** consider adopting `docs/solutions/` to give `learnings-researcher` (§4 #6) something to search. SBT already has `docs/research/` — `docs/solutions/` is the natural sibling.
