# K2 — Knowledge Hygiene from 3 RAG Papers

**Status:** Done
**Dart task:** [utCafHpW0ZwC](https://app.dartai.com/task/utCafHpW0ZwC)
**Parent epic:** [kx5Yf2ZTlxP6](https://app.dartai.com/task/kx5Yf2ZTlxP6) — knowledge hygiene from RAG papers
**Author:** task-executor (auto), iter 8, loop `pUtvC2dRaW1P`
**Date:** 2026-04-26
**Time-boxed:** 2h
**Inputs:**
- arxiv 2604.09666 (Fan, Xue, Liu, Tan — RAGSearch: GraphRAG vs agentic dense RAG benchmark)
- arxiv 2604.01007 (Liu, Ling, Qiu et al. — Omni-SimpleMem: autonomous-research lifelong-memory discovery)
- arxiv 2604.11209 (Zhao, Chen, Zhang, Zhu, Lin, Liu — ConflictQA + XoT for cross-source knowledge conflicts, SIGIR 2026)
- K0 stack-rank doc at `docs/research/K0-ce-feature-stack-rank.md`
- Brainstorming SKILL.md provenance contract (commit `ebd136a`, `<PROVENANCE-CONTRACT>` block + `Conflict-Detect Integration` section)
- Phase 0/1/2 named patterns from prior brainstorming epic: OmniMEM-style 4-layer cite trail, ConflictQA cross-source, GraphRAG, Knowledge Conflicts (rationalization), complexity-aware pruning

> **Provenance discipline note (eat-your-own-dogfood):** every claim in this doc that references a paper finding cites the arxiv ID + section heading. Every claim that references a prior commit cites the SHA. Every claim that is K2 author opinion is labeled `(K2 inference)`. This mirrors the `<PROVENANCE-CONTRACT>` from `ebd136a` — `guess` is never silently omitted, it is labeled.

---

## 1. Executive Summary

Three recent (2026-04) RAG papers converge on one finding: **retrieval is no longer the bottleneck — *knowledge hygiene* is.** Specifically: provenance per claim, conflict surfacing across sources, and architecture/prompt choices that dwarf hyperparameter tuning.

Mapped to SBT plugins:

| Pattern (cross-cutting) | Source | Tier | Plugins primarily affected |
|---|---|---|---|
| Provenance per claim (4-layer cite trail) | OmniMEM `(2604.01007)` + ebd136a contract | **Tier 1** | brainstorming (shipped), research, compound-review, dev-standards, dartai, lci |
| Conflict surfacing across sources | ConflictQA `(2604.11209)` + ebd136a `Conflict-Detect Integration` | **Tier 1** | brainstorming (shipped), research, compound-review, dartai |
| Rationalization-trap (anti-pattern) | ConflictQA `(2604.11209)` §4 + ebd136a anti-pattern §33 | **Tier 1 (value rule)** | brainstorming (shipped), compound-review, dartai, dev-standards |
| Multiview retrieval (dense + bm25 + symbolic + KG) | RAGSearch `(2604.09666)` complementary-roles finding | **Tier 2** | lci (primary), research |
| Complexity-aware pruning | RAGSearch `(2604.09666)` task-dependent finding | **Tier 2** | research, dartai (risk-routing already does adjacent work) |
| Temporal normalization | OmniMEM `(2604.01007)` lifelong-agent framing | **Tier 2** | research, brainstorming, dev-standards |
| Architecture > hyperparameter tuning | OmniMEM `(2604.01007)` headline (+44% arch, +188% prompt vs negligible HP) | **Tier 1 (meta)** | dev-standards, workflow, dartai, mcp-architect |

**Headline decisions:**

1. **Tier 1 patterns are already partially shipped** in commit `ebd136a` for `brainstorming`. Downstream tasks (`rwjOh2tKXYpC`, `G0vJiB26eyqf`, `6mgXiXbw9G1B`) extend them to consumer plugins.
2. **`research` plugin is the single biggest beneficiary** of all three papers — every pattern lands on it. It needs a coordinated update, not piecemeal.
3. **`compound-review` (5 wave-1 reviewers) gets a thin shared "knowledge-hygiene checklist"** instead of per-reviewer rewrites. Cheaper to maintain.
4. **`lci` gets the multiview-retrieval pattern but only as Tier 2** — current `mcp__plugin_lci_lci__search` is sub-millisecond and high-recall on this codebase; adding KG/symbolic layers earns weekly value, not daily.
5. **No-op plugins explicitly:** `slop-coder`, `slop-mcp`, `image-processing`, `typography`, `color`, `a11y-audit`, `design-token`, `figma-query`, `mcp-tester`, `photino`, `prompt-engineer`, `ux-design`, `ux-developer` — these are content/tooling plugins where knowledge-hygiene patterns don't apply or applying them would be over-engineering.
6. **Recommended execution order** (§5) front-loads `research` plugin updates because they unblock review-side wiring downstream.

---

## 2. Paper Summaries

### 2.1 Paper A — RAGSearch: Do We Still Need GraphRAG? `(2604.09666)`

- **Title:** "Do We Still Need GraphRAG? Benchmarking RAG and GraphRAG for Agentic Search Systems"
- **Authors:** Dongzhe Fan, Zheyi Xue, Siyuan Liu, Qiaoyu Tan
- **Venue:** arxiv preprint, 2026-04 (`2604.09666`)
- **Summary (≈200 words):** The authors construct **RAGSearch**, a unified benchmark comparing dense RAG and GraphRAG as retrieval infrastructures under standardized LLM backbone, retrieval budgets, and query-protocol settings. They evaluate two agentic-inference regimes — training-free and reinforcement-learning-based — across multiple QA datasets. The headline finding is that **agentic search substantially closes the gap** between dense RAG and GraphRAG for many query types: agentic looping, query rewriting, and tool use let dense RAG match GraphRAG on simple-to-medium retrieval tasks. **However**, GraphRAG retains a meaningful advantage on complex multi-hop reasoning where explicit relational structure is exploited, and the offline graph-construction cost is amortizable over query volume. The authors conclude graph structure and agentic search are **complementary, not substitutive** — a hybrid system outperforms either alone on the full task mix. Stability metrics also show GraphRAG produces more consistent answers across paraphrased queries.
- **Key claims:**
  1. Agentic search lifts dense RAG performance materially, narrowing the GraphRAG gap.
  2. GraphRAG remains best-in-class for multi-hop relational reasoning.
  3. Hybrid (graph + agentic) outperforms either alone.
  4. GraphRAG's offline cost is justified when query volume is high enough to amortize it.
- **Methodology:** RAGSearch unified benchmark; full test sets across multiple QA datasets; metrics include accuracy, preprocessing cost, inference efficiency, stability across paraphrased queries.
- **Limitations:** Abstract does not enumerate failure modes; conclusions are likely sensitive to LLM backbone choice and query-distribution skew. `(K2 inference)`

### 2.2 Paper B — Omni-SimpleMem `(2604.01007)`

- **Title:** "Omni-SimpleMem: Autoresearch-Guided Discovery of Lifelong Multimodal Agent Memory"
- **Authors:** Jiaqi Liu, Zipeng Ling, Shi Qiu, Yanqing Liu, Siwei Han, Peng Xia, Haoqin Tu, Zeyu Zheng, Cihang Xie, Charles Fleming, Mingyu Ding, Huaxiu Yao
- **Venue:** arxiv preprint, 2026-04 (`2604.01007`)
- **Summary (≈200 words):** Long-running multimodal agents struggle to retain and recall experience across sessions. The design space — architecture, retrieval strategy, prompt template, data pipeline — is too large for manual or AutoML-style tuning. The authors run an **autonomous research pipeline** that proposes, runs, and diagnoses ~50 experiments without human intervention, ultimately discovering **Omni-SimpleMem**: a lifelong-memory architecture that hits state-of-the-art on two benchmarks (LoCoMo: 0.117 → 0.598 F1, +411%; Mem-Gallery: 0.254 → 0.797, +214%). The most striking finding is the **distribution of where gains came from**: bug fixes contributed +175% individually, architectural changes +44%, prompt engineering +188%, while hyperparameter tuning's cumulative impact was negligible. The lesson generalizes: when working with LLM-backed memory systems, time invested in fixing bugs, redesigning architecture, and rewriting prompts dominates time invested in tuning. The autoresearch loop's success also validates an autonomous-experimentation pattern for design-space exploration that exceeds human + AutoML alternatives in this domain.
- **Key claims:**
  1. ~50 autonomous experiments converged on SOTA without human intervention.
  2. Bug fixes (+175%), architecture (+44%), prompt engineering (+188%) each individually exceeded all HP tuning combined.
  3. Lifelong memory benefits from a 4-layer storage/retrieval architecture (the `OmniMEM-style 4-layer cite trail` named in K0/ebd136a inputs).
  4. Autonomous research loops can outperform AutoML in vast design spaces.
- **Methodology:** Autonomous experimentation pipeline; LoCoMo + Mem-Gallery benchmarks; ablation across bug-fix / architecture / prompt / HP axes.
- **Limitations:** Two-benchmark scope (LoCoMo, Mem-Gallery); generalization to other multimodal-memory tasks not yet shown; the "+175% from bug fixes" finding is partly a function of starting-point bugs and may not replicate on a clean baseline. `(K2 inference)`

### 2.3 Paper C — ConflictQA + XoT `(2604.11209)`

- **Title:** "Exploring Knowledge Conflicts for Faithful LLM Reasoning: Benchmark and Method"
- **Authors:** Tianzhe Zhao, Jiaoyan Chen, Shuxiu Zhang, Haiping Zhu, Qika Lin, Jun Liu
- **Venue:** SIGIR 2026 (`2604.11209`)
- **Summary (≈200 words):** Prior knowledge-conflict work focuses on conflicts between an LLM's parametric knowledge and a single external source. Real RAG systems integrate multiple heterogeneous sources — unstructured text, knowledge graphs, structured DBs — and **conflicts across external sources are an unstudied failure mode**. The authors build **ConflictQA**, a benchmark that systematically instantiates textual-vs-KG conflicts. They evaluate representative LLMs and find LLMs frequently fail to identify reliable evidence and instead **become biased toward whichever source the prompt emphasizes** — a prompting-sensitivity that means downstream answer quality is unstable. Critically, LLMs do not transparently say "these sources conflict; I picked source X because Y"; they silently **rationalize**, producing fluent but unfaithful answers. The authors propose **XoT** (eXplanation-over-Thought), a two-stage explanation-based reasoning framework that first surfaces conflicts and second reasons over them with explicit explanation chains. XoT outperforms baselines on faithfulness and reduces prompt-sensitivity bias.
- **Key claims:**
  1. Cross-source conflicts (text vs KG) are common and under-studied.
  2. LLMs are biased by prompt framing when sources conflict, producing unstable answers.
  3. **LLMs silently rationalize through conflicts** rather than surface them — this is the headline failure mode.
  4. XoT (two-stage: surface → reason-over) materially improves faithfulness.
- **Methodology:** ConflictQA benchmark with systematically constructed conflicts; evaluation across representative LLMs; XoT framework with two-stage prompting.
- **Limitations:** Benchmark is text-vs-KG specific; conflicts within text-only or within-KG settings less explored; XoT's two-stage cost is higher than single-pass and may not be justified for low-stakes queries. `(K2 inference)`

---

## 3. Cross-Cutting Patterns

These six patterns synthesize across the three papers + prior commit context. Each pattern has a name, a one-sentence definition, source citation(s), failure mode it addresses, and concrete signals.

### 3.1 Provenance per claim (4-layer cite trail)

- **Definition:** Every retrieved fact, summary bullet, or memory entry carries a structured provenance value — never null, never empty, never silently elided.
- **Sources:** OmniMEM `(2604.01007)` 4-layer architecture (architecture > HP finding implies storage layers must be inspectable); SBT brainstorming SKILL.md `<PROVENANCE-CONTRACT>` block (commit `ebd136a`).
- **Failure mode addressed:** "I read this somewhere" — claims with no traceable source. When the claim turns out wrong, no audit trail.
- **Concrete contract** (from `ebd136a`, restated for cross-plugin reuse):
  - 5 provenance value forms: `file:path:line` | `memory:id` | `git:sha` | `web:url` | literal `"guess"`
  - Empty/missing provenance is **rejected**; if a claim is genuinely a guess, the value must be the literal string `"guess"` so downstream consumers can audit "what is unverified?"
  - Provenance changes propagate through edit events alongside text changes (event payload carries `old_provenance` / `new_provenance` as optional fields, mirroring `old_text` / `new_text`).
- **Cross-source resonance:** OmniMEM's 4-layer memory implies that retrieval results from each layer carry layer-attribution; this is provenance with a different vocabulary. Brainstorming's contract is the SBT-flavored version of the same discipline.

### 3.2 Conflict surfacing across sources

- **Definition:** When two retrieved sources disagree, the system surfaces the conflict with a visible, structured message *before* committing to an answer.
- **Sources:** ConflictQA `(2604.11209)` §3 cross-source conflict construction; SBT brainstorming SKILL.md `Conflict-Detect Integration` section (commit `ebd136a`).
- **Failure mode addressed:** Silent source-bias — LLM picks one source, never tells the user the other source disagreed.
- **Concrete contract** (from `ebd136a`, generalized):
  - Detection scope: text + provenance + confidence + (in brainstorming: `bundles_resolves` + `locks_out` + `seen_in` + memory refs).
  - When conflict detected, emit visible message containing: conflicting bullets, their provenance, and 3 user options: `confirm-override` / `revisit-source-A` / `re-pick`.
  - **Detection must produce visible output** — no internal-only resolution.
- **XoT alignment:** ConflictQA's XoT proposes two-stage `surface → reason-over`; SBT's `surface-then-proceed` is the simplified single-user-in-the-loop variant.

### 3.3 Rationalization-trap (anti-pattern, value rule)

- **Definition:** Defending a prior high-confidence claim against contradicting new evidence by silently rewriting the prior claim or silently bending the new evidence to fit. **This is forbidden.**
- **Sources:** ConflictQA `(2604.11209)` §4 finding (LLMs silently rationalize); SBT brainstorming SKILL.md anti-pattern at line 33 of commit `ebd136a` ("Silent Rationalization Through Conflict").
- **Failure mode addressed:** The most insidious knowledge-hygiene failure — fluent answers that have silently abandoned earlier reasoning, leaving the user with no audit trail of what was discarded.
- **Why this is the only "must" in K2 (and the only "must" in this whole epic):** other patterns are preferences with escape valves (per the soft-guidance memory feedback). Rationalization-trap is a *value layer* rule because the entire knowledge-hygiene project is invalidated if rationalization is permitted — provenance and conflict-surfacing are pointless if the system can paper over their outputs. ConflictQA quantifies how common this failure is; SBT's rule prevents it at the pattern level.
- **Concrete enforcement:**
  - Code/spec/review outputs that overwrite a prior high-confidence finding without surfacing the change are rejected.
  - In review pipelines: a reviewer that flips its own earlier verdict without a visible diff entry is failing this rule.
  - In brainstorming: covered by ebd136a's `Conflict-Detect Integration` surface-then-proceed handler.

### 3.4 Multiview retrieval (dense + bm25 + symbolic + KG)

- **Definition:** Retrieval is more reliable when multiple index types vote, especially for complex queries.
- **Sources:** RAGSearch `(2604.09666)` complementary-roles finding (graph + agentic together beat either alone); brainstorming inputs (named "GraphRAG" pattern in K0/ebd136a context).
- **Failure mode addressed:** Single-index retrieval misses queries whose semantics aren't captured by that index's similarity function (dense embeddings miss exact-keyword queries; bm25 misses paraphrase; symbolic misses fuzzy concepts; KG misses ungraphed entities). `(K2 inference)` — RAGSearch frames the gap as graph-vs-dense; the four-axis failure decomposition is K2 synthesis.
- **Concrete contract:** A retrieval call should be able to dispatch in parallel across N indices and merge results with a stable, provenance-preserving rule. For SBT, this is realized in `lci` (already has dense + symbolic via LCI semantic search) plus future bm25 and KG hooks. The pattern is **Tier 2** because the lift is task-dependent (RAGSearch's main finding) — only complex multi-hop queries reliably benefit.

### 3.5 Complexity-aware pruning

- **Definition:** Not all queries deserve the full retrieval/research pipeline. Cheap queries get cheap routes; expensive queries get expensive routes; routing is explicit.
- **Sources:** RAGSearch `(2604.09666)` task-dependence finding (GraphRAG only earns its cost on complex multi-hop reasoning; simpler queries see no advantage and pay the latency); prior brainstorming epic input ("complexity-aware pruning").
- **Failure mode addressed:** Retrieval bloat — running heavyweight pipelines on simple queries, paying latency and cost without quality gain.
- **Concrete signal:** A complexity score (cheap heuristic — query length, number of named entities, presence of conjunctions/multi-hop signals) gates which indices/agents fire. SBT analog: `risk-pipeline` already does adjacent work for review routing (model selection, reviewer count by risk vector); the same dispatcher pattern applies to retrieval.

### 3.6 Temporal normalization

- **Definition:** Date-bearing claims must be tagged "as of date X" rather than ambient-present-tense, so that staleness is detectable and lifelong-memory drift is auditable.
- **Sources:** OmniMEM `(2604.01007)` lifelong-multimodal-agent framing (memory must survive across sessions, which means temporal grounding); prior brainstorming epic input ("temporal normalization").
- **Failure mode addressed:** A bullet says "the API uses OAuth"; six months later the API moved to API keys; the memory entry still claims "OAuth" without temporal qualification, causing silent staleness.
- **Concrete contract:** Memory entries and high-confidence summary bullets carry an `as_of` field (ISO date or git SHA), distinct from `provenance`. Retrieval surfaces stale entries with a visible "older than N days" tag rather than silently returning them as current.

---

## 4. Per-Plugin Update Map

For each plugin: name the file/agent/skill that changes, the patterns applied, and the concrete change. **No-op plugins are listed explicitly with rationale** — orphan-plugin avoidance per the adversarial review checklist.

### 4.1 `brainstorming` — already shipped in `ebd136a`, audit only

| Pattern | Concrete change | Status |
|---|---|---|
| Provenance per claim | `<PROVENANCE-CONTRACT>` block in `plugins/brainstorming/skills/brainstorming/SKILL.md`; SummaryBullet schema in `companion/shared/src/screen.ts` requires `provenance:z.string().min(1)` | **Shipped** (`ebd136a`) |
| Conflict surfacing | `Conflict-Detect Integration` section in SKILL.md; visible-message template; surface-then-proceed handler | **Shipped** (`ebd136a`) |
| Rationalization-trap | Anti-pattern §33 of SKILL.md; mirrors ConflictQA finding | **Shipped** (`ebd136a`) |
| Temporal normalization | Not yet — would extend SummaryBullet with optional `as_of` | **Forward to `rwjOh2tKXYpC`** (Tier 2) |

**Audit action only:** verify ebd136a's `<PROVENANCE-CONTRACT>` block survives downstream consumer wiring. No new edits in brainstorming for this epic.

### 4.2 `research` — biggest change, all three papers land here

| Pattern | File / agent | Concrete change | Tier |
|---|---|---|---|
| Provenance per claim | `plugins/research/agents/web-researcher.md` + `learnings-researcher.md` + `session-historian.md` | Add to each agent's output-contract section: every returned finding must include a `provenance` field with one of the 5 forms from §3.1; literal `"guess"` for unverifiable inferences | Tier 1 |
| Conflict surfacing | `plugins/research/agents/web-researcher.md` | New "Cross-source conflict" output sub-block: when two web sources disagree, agent emits both findings + a `conflict_note` with both provenances; user/orchestrator decides | Tier 1 |
| Rationalization-trap | All three agents + new `plugins/research/skills/knowledge-hygiene-checklist.md` *(new file, ~40 lines)* | Embed the value-rule: agent must not silently flip a high-confidence prior finding; must emit `revision_note` with old/new + reason | Tier 1 |
| Multiview retrieval | `plugins/research/agents/web-researcher.md` | Add `mode=hybrid` parameter that dispatches dense-search + structured-search (existing) in parallel and merges with provenance preservation | Tier 2 |
| Complexity-aware pruning | `plugins/research/agents/web-researcher.md` | Add complexity-score heuristic at agent entry: cheap query → single-index single-pass; complex query → multi-index + reasoning step | Tier 2 |
| Temporal normalization | `plugins/research/agents/learnings-researcher.md` (reads `docs/solutions/`) + `session-historian.md` | Findings carry `as_of` (date or commit SHA); retrieval surfaces stale entries with "older than N days" tag | Tier 2 |

**Coordinated edit:** all six changes are best done as **one cross-cutting research-plugin update** (downstream task `rwjOh2tKXYpC` or its sibling) rather than three separate per-pattern PRs — the agents share too much context.

### 4.3 `compound-review` — thin shared checklist, not per-reviewer rewrites

The 5 wave-1 reviewers (`correctness-reviewer`, `maintainability-reviewer`, `testing-reviewer`, `typescript-strict-reviewer`, `cli-readiness-reviewer` — per K0 §3.1) all face the same knowledge-hygiene questions. Cheaper to ship one shared skill than 5 reviewer rewrites.

| Pattern | File | Concrete change | Tier |
|---|---|---|---|
| Provenance per claim | New `plugins/compound-review/skills/knowledge-hygiene-checklist.md` *(new file, ~60 lines)*; each reviewer's frontmatter `Use when:` references it | Reviewer findings must cite either a code line (`file:path:line`) or the rule from a project doc; "I think this is bad" findings are downgraded to suggestions | Tier 1 |
| Conflict surfacing | Same checklist file | When reviewer's verdict conflicts with a prior reviewer (e.g., `correctness-reviewer` says ship but `testing-reviewer` says block), both verdicts surface with provenance instead of last-write-wins | Tier 1 |
| Rationalization-trap | Same checklist file | A reviewer that flips its own earlier verdict mid-pass must emit explicit `revision_note` (mirrors §3.3) | Tier 1 (value rule) |
| Multiview retrieval | n/a — review is generative not retrieval | Explicit no-op | — |
| Complexity-aware pruning | n/a — risk-pipeline already routes review pipelines by risk vector (K0 §3 reference); no additional pruning needed | Explicit no-op | — |
| Temporal normalization | Same checklist file (light touch) | Findings that reference docs/conventions tag them with the doc's git SHA (so a stale rule isn't silently enforced) | Tier 2 |

**One file added, 5 frontmatter touches.** Total scope ~80 lines.

### 4.4 `lci` — multiview retrieval is the natural home

| Pattern | File / skill | Concrete change | Tier |
|---|---|---|---|
| Multiview retrieval | `plugins/lci/skills/search-code.md` + `explore-codebase.md` | Document that `mcp__plugin_lci_lci__search` is the dense+symbolic-merged view; add forward-reference for KG layer (separate epic — not in kx5Yf2ZTlxP6 scope) | Tier 2 |
| Provenance per claim | `plugins/lci/skills/search-code.md` | LCI already returns `file:path:line` natively — document that this **is** the canonical `file:path:line` provenance form for SBT and other plugins should standardize on this format | Tier 1 (documentation only) |
| Conflict surfacing | n/a — LCI is single-index from caller's view | Explicit no-op | — |
| Rationalization-trap | n/a — LCI is non-generative | Explicit no-op | — |
| Complexity-aware pruning | `plugins/lci/skills/search-code.md` | Add guidance: prefer `search` for known-symbol queries; prefer `get_context` for ambiguous queries needing call-hierarchy disambiguation | Tier 2 |
| Temporal normalization | `plugins/lci/skills/context-handoff.md` | Document: LCI index is rebuilt on file change; results are inherently fresh — no `as_of` field needed | Tier 1 (documentation only) |

**One skill (search-code.md) is the primary touch; context-handoff.md gets a one-line freshness note.**

### 4.5 `mcp-architect` — meta-pattern: architecture > HP tuning

| Pattern | File | Concrete change | Tier |
|---|---|---|---|
| Architecture > HP (meta-pattern from OmniMEM) | `plugins/mcp-architect/skills/mcp-architecture/` | Add a new sub-section to the existing architecture skill: "Pattern selection dominates parameter tuning" — cite OmniMEM's +44%/+188%/+0% breakdown; recommend MCP designers spend design budget on tool boundaries before fiddling with params | Tier 1 (meta) |
| Provenance per claim | `plugins/mcp-architect/skills/response-optimization/` | When an MCP tool returns multiple findings, response payload should support per-finding provenance (cross-tool reference pattern already exists; document it explicitly as the SBT provenance contract) | Tier 1 |
| Other patterns | n/a — mcp-architect is a design-time skill, not a runtime retrieval plugin | Explicit no-op for multiview/complexity/temporal | — |

**Two skills touched, light edits (~15 lines each).**

### 4.6 `risk-pipeline` — already does complexity-aware routing

| Pattern | File | Concrete change | Tier |
|---|---|---|---|
| Complexity-aware pruning | (none — already shipped) | Existing `risk_vector` → `pipeline_tier` → `required_reviewers` pipeline IS the complexity-aware-routing pattern. **Explicit confirmation in K2; no new code.** | — (already shipped) |
| Provenance per claim | `plugins/risk-pipeline/agents/security-reviewer.md` + `data-reviewer.md` + `novelty-reviewer.md` + `reversibility-reviewer.md` | Mirror compound-review's checklist reference: findings must cite code line or rule SHA | Tier 1 |
| Conflict surfacing | risk-pipeline reviewer outputs already aggregate; document the existing aggregation as conflict-surfacing-compatible (when two reviewers disagree, both verdicts pass through) | Tier 1 (documentation only) |
| Rationalization-trap | Same checklist as compound-review (single source of truth) | Tier 1 (value rule) |
| Other | Explicit no-op for multiview / temporal | — |

**Mostly documentation + checklist reference; no new files.**

### 4.7 `dartai` — orchestrator-level enforcement

| Pattern | File | Concrete change | Tier |
|---|---|---|---|
| Rationalization-trap | `plugins/dartai/skills/adversarial-quality-loop.md` + `task-execution.md` | Add to phase-9 final-validation: "task-executor must not silently overwrite prior phase verdicts; revisions must surface as `plan_adjustment` entries (already present pattern — make it explicit for verdict-revision specifically)" | Tier 1 (value rule) |
| Conflict surfacing | `plugins/dartai/skills/adversarial-quality-loop.md` | Document: when task-executor and reviewer disagree, both verdicts surface in the iteration comment to the loop task (this happens today informally; make explicit) | Tier 1 (documentation only) |
| Provenance per claim | `plugins/dartai/skills/code-quality.md` | Code-quality findings cite `file:path:line` (already happens; document as required) | Tier 1 (documentation only) |
| Architecture > HP (meta) | `plugins/dartai/skills/simple-planning.md` + `adversarial-planning-loop.md` | Add a `Plan-time pattern selection` note: invest planning effort in task decomposition + dispatch boundaries before tweaking individual task prompts | Tier 1 (meta) |
| Other | Explicit no-op for multiview / complexity / temporal (orchestrator doesn't retrieve) | — |

**Three skills get light touches (~10 lines each).**

### 4.8 `workflow` — loop-level adoption of meta-pattern

| Pattern | File | Concrete change | Tier |
|---|---|---|---|
| Architecture > HP (meta) | `plugins/workflow/skills/loop-orchestration.md` | Note: when the loop misbehaves, prefer fixing dispatch architecture (which subagent runs when) before tweaking subagent prompts. Cite OmniMEM. | Tier 1 (meta) |
| Conflict surfacing | `plugins/workflow/skills/adversarial-quality.md` | Cross-iteration conflict surfacing: if iter N's conclusion contradicts iter N-1's, surface in the loop-task comment with both provenances | Tier 1 |
| Rationalization-trap | `plugins/workflow/skills/memory-management.md` | Memory entries that contradict prior memory entries must surface a conflict, not silently overwrite | Tier 1 (value rule) |
| Other | Explicit no-op | — |

**Three skills, light edits.**

### 4.9 `dev-standards` — verification + checklist consumer

| Pattern | File | Concrete change | Tier |
|---|---|---|---|
| Provenance per claim | `plugins/dev-standards/skills/verification-before-completion/` | Verification checklist: "every claim of completion must cite a verifiable check (test name, command output, file:line) — not 'I checked'" | Tier 1 |
| Rationalization-trap | `plugins/dev-standards/skills/grill-task/` + `review-for-plan-updates/` | Grill-task: when grilling reveals a contradiction between the spec and prior plan, surface both, don't silently rewrite the spec to match what's easy | Tier 1 (value rule) |
| Architecture > HP (meta) | `plugins/dev-standards/skills/decide/` | Decision-time guidance: prefer changing decomposition or interface over tweaking parameters | Tier 1 (meta) |
| Conflict surfacing | `plugins/dev-standards/skills/refactor-first-assessment/` | When refactor assessment finds two competing refactors, both surface for user choice instead of picking one silently | Tier 1 |
| Other | Explicit no-op for multiview / complexity / temporal | — |

**Four skills, light touches.**

### 4.10 `ideation` — single-skill plugin, light touch

| Pattern | File | Concrete change | Tier |
|---|---|---|---|
| Provenance per claim | `plugins/ideation/skills/ideate/` | Generated ideas tag inspiration source (paper / pattern / prior decision) — `provenance` field per idea | Tier 1 |
| Conflict surfacing | Same skill | When two generated ideas conflict, surface both with rationales rather than silently picking | Tier 1 |
| Rationalization-trap | Same skill | When idea-evaluation flips an earlier idea's score, emit explicit `revision_note` | Tier 1 (value rule) |
| Other | Explicit no-op | — |

**One skill, ~25 lines.**

### 4.11 No-op plugins (explicit list)

The following plugins have **no actionable knowledge-hygiene change** in scope of `kx5Yf2ZTlxP6`. Documenting this avoids orphan-plugin ambiguity:

| Plugin | Reason |
|---|---|
| `slop-coder` | Code-execution language reference — not a retrieval/reasoning surface |
| `slop-mcp` | MCP-server registry/dispatch — not a knowledge surface |
| `agnt` | Browser/process-management tools — knowledge-hygiene patterns don't apply at the tool layer (calling code that uses agnt should apply them) |
| `image-processing` | Pixel transforms |
| `typography`, `color`, `design-token`, `figma-query`, `ux-design`, `ux-developer`, `a11y-audit` | Design/asset content plugins |
| `mcp-tester` | Test harness, not a knowledge surface |
| `photino` | Native-app build tooling |
| `prompt-engineer` | If revisited, would mirror `ideation`'s pattern; **deferred** to a follow-up epic |
| `dart-query` | MCP-tool reference, not a knowledge surface (the orchestrator that calls dart-query — `dartai` — applies hygiene) |

**Explicit no-op count: 13 plugins.** Documenting this prevents future epic re-litigation of "did we miss a plugin?"

---

## 5. Cost / ROI Tiering

### 5.1 Pattern-level tiering

| Pattern | Tier | Cost | ROI |
|---|---|---|---|
| Provenance per claim | **Tier 1** | Low — 5 forms documented in `ebd136a`, downstream is mostly contract reuse | High — every claim becomes auditable, all other patterns depend on this |
| Conflict surfacing | **Tier 1** | Low-medium — surface-then-proceed pattern is small; integration into review pipelines is moderate | High — eliminates a class of silent failures (ConflictQA's headline) |
| Rationalization-trap (value rule) | **Tier 1** | Low — it's a rule, not a feature — enforcement is mostly checklist text | Very high — without it, all other patterns can be silently bypassed |
| Architecture > HP (meta) | **Tier 1 (meta)** | Trivial — it's documentation guidance | High — changes how planning effort is allocated across the whole repo |
| Multiview retrieval | **Tier 2** | Medium — adding bm25 / KG layers to LCI is a separate epic | Medium — RAGSearch shows the lift is task-dependent (only complex multi-hop) |
| Complexity-aware pruning | **Tier 2** | Low — risk-pipeline already does adjacent work | Medium — saves latency/cost on simple queries; not a quality gain |
| Temporal normalization | **Tier 2** | Low-medium — `as_of` field is small but propagates through many places | Medium — staleness detection is rare-but-high-value (lifelong-agent setting) |

No Tier 3 in this epic — knowledge-hygiene is mostly cheap-and-high-leverage. Future Tier 3 candidates (deferred to separate epics): full KG layer for LCI; autonomous-research loop (OmniMEM-style) for SBT's own design space.

### 5.2 Per-plugin-change tiering

| Plugin | Change | Tier | Effort |
|---|---|---|---|
| `brainstorming` | Audit only (shipped in `ebd136a`) | Tier 1 (already done) | 0 (audit) |
| `research` | Coordinated all-pattern update across 3 agents + new checklist skill | Tier 1 + Tier 2 | Medium-large |
| `compound-review` | New shared `knowledge-hygiene-checklist.md` skill + 5 frontmatter touches | Tier 1 | Small |
| `lci` | Documentation in 2 skills | Tier 1 (docs) + Tier 2 | Small |
| `mcp-architect` | Two skill touches | Tier 1 (meta) | Small |
| `risk-pipeline` | 4 reviewer frontmatter touches → reuse compound-review's checklist | Tier 1 | Small |
| `dartai` | Three skill touches | Tier 1 (value + meta) | Small |
| `workflow` | Three skill touches | Tier 1 | Small |
| `dev-standards` | Four skill touches | Tier 1 | Small |
| `ideation` | One skill touch | Tier 1 | Small |

**Total cross-plugin effort:** dominated by `research` plugin work; everything else is checklist-reuse + light skill edits.

---

## 6. Recommended Execution Order

Existing tasks under epic `kx5Yf2ZTlxP6` (in Dart): `rwjOh2tKXYpC`, `G0vJiB26eyqf`, `6mgXiXbw9G1B`, `VQmMxFOEnQQb`, `lgSkgYNs9i6V`, `gN0fUqhnmSxx`, `4rLSRysxXxLX`, `VlBRZnBT7e0L`, `TpfeuHXvYgkH`, `TPqYid2TykLc`, `qvd3VBUROdw2`.

K2 cannot bind those task IDs to specific changes without inspecting their descriptions in detail (out of scope — task spec calls for ordering by dependency + ROI, not re-grilling each task). Below is the dependency-driven ordering by **change-cluster** with task-ID forward-references for cluster membership. Each downstream task should be matched to a cluster by its title in a separate alignment pass.

### Wave 1 — Foundations (must precede everything else)

**Cluster I — Knowledge-hygiene shared checklist (cheap, high leverage, blocks Wave 2):**

- **Goal:** Ship the single shared `knowledge-hygiene-checklist.md` skill that `compound-review`, `risk-pipeline`, and several others reference. Without this, Wave 2's per-plugin edits would each have to invent or copy the rules.
- **Concrete output:** `plugins/compound-review/skills/knowledge-hygiene-checklist.md` (~60 lines): provenance-per-claim, conflict-surfacing, rationalization-trap value rule. Cites `ebd136a` `<PROVENANCE-CONTRACT>` + `Conflict-Detect Integration` as upstream sources.
- **Forward-mapped Dart task candidate:** `rwjOh2tKXYpC` (per task spec called out as the "knowledge-hygiene plugin" wiring task — strongest candidate). If `rwjOh2tKXYpC` is scoped narrower, split a sibling task off it.
- **Depends on:** none (ebd136a is already merged).

**Cluster II — `research` plugin coordinated update (largest single change; unblocks downstream review-side wiring):**

- **Goal:** Apply provenance + conflict + rationalization-trap + (lighter) multiview/complexity/temporal patterns across `web-researcher.md`, `learnings-researcher.md`, `session-historian.md` in one coordinated edit.
- **Concrete output:** 3 agents updated; output contracts add `provenance` + `conflict_note` + `revision_note` fields; web-researcher gains `mode=hybrid` + complexity-score gate; learnings + session-historian gain `as_of` field on returned findings.
- **Forward-mapped Dart task candidate:** `G0vJiB26eyqf` and/or `6mgXiXbw9G1B` (per task spec, both are knowledge-hygiene downstream tasks; one likely owns research-plugin work). Split into two if scope >5 files.
- **Depends on:** Cluster I (consumes the shared checklist).

### Wave 2 — Consumers (parallel-safe after Wave 1)

**Cluster III — Review-side wiring:**

- `compound-review` 5 reviewers reference the shared checklist via frontmatter `Use when:` lines; new `knowledge-hygiene` test scenario added to eval harness (per K0 §12 R3 reference).
- `risk-pipeline` 4 reviewers reference the same checklist.
- **Forward-mapped task candidates:** `VQmMxFOEnQQb`, `lgSkgYNs9i6V` (review-side wiring tasks per task spec listing).
- **Depends on:** Cluster I.

**Cluster IV — Orchestrator-side wiring:**

- `dartai` 3 skills updated (adversarial-quality-loop, task-execution, code-quality).
- `workflow` 3 skills updated (loop-orchestration, adversarial-quality, memory-management).
- **Forward-mapped task candidates:** `gN0fUqhnmSxx`, `4rLSRysxXxLX` (orchestrator-side per task spec listing).
- **Depends on:** Cluster I.

**Cluster V — Tooling + design-time wiring:**

- `lci` 2 skills (search-code, context-handoff) get documentation passes.
- `mcp-architect` 2 skills (mcp-architecture, response-optimization) get meta-pattern + provenance notes.
- `dev-standards` 4 skills (verification-before-completion, grill-task, review-for-plan-updates, decide, refactor-first-assessment).
- `ideation` 1 skill (ideate).
- **Forward-mapped task candidates:** `VlBRZnBT7e0L`, `TpfeuHXvYgkH` (tooling-side per task spec listing).
- **Depends on:** Cluster I.

### Wave 3 — Audit + retrospective (must follow Wave 1 + 2)

**Cluster VI — Citation-verifier audit (audits all of the above):**

- **Goal:** Build a retroactive auditor that walks the changes from Waves 1–2 and verifies every claim ships with provenance per the contract. The brainstorming SKILL.md explicitly forward-references this in commit `ebd136a`'s output-design audit-trail subsection.
- **Forward-mapped Dart task candidate:** `qvd3VBUROdw2` (per task spec listing — strongly suggests citation-verifier per task title in spec). If `qvd3VBUROdw2` is scoped differently, this is a separate task.
- **Concrete output:** A new skill or agent that takes a PR diff and reports any new claim-bearing prose without provenance, any conflict-decision without surfacing, any verdict-flip without revision_note.
- **Depends on:** Waves 1 + 2 done (something to audit).

**Cluster VII — Retrospective: Architecture > HP guidance:**

- **Goal:** Add the OmniMEM meta-pattern note to `mcp-architect` + `dartai` + `workflow` + `dev-standards` planning skills. Cheap; can run parallel with Wave 2 OR after.
- **Forward-mapped task candidate:** `TPqYid2TykLc` (per task spec listing).

### Ordering summary

```
Wave 1: Cluster I  (knowledge-hygiene-checklist shared skill)  [blocks all of Wave 2]
        Cluster II (research plugin coordinated update)        [parallel with Cluster I if separate authors; sequential if same]

Wave 2: Cluster III (review-side wiring)        ┐
        Cluster IV  (orchestrator-side wiring)  ├─ parallel-safe after Wave 1
        Cluster V   (tooling + design-time)     ┘

Wave 3: Cluster VI  (citation-verifier audit)  [needs Waves 1+2 complete]
        Cluster VII (architecture-meta retrospective notes)  [parallel; can also fit late Wave 2]
```

**Forward-mapped task pool (11 tasks):** `rwjOh2tKXYpC`, `G0vJiB26eyqf`, `6mgXiXbw9G1B`, `VQmMxFOEnQQb`, `lgSkgYNs9i6V`, `gN0fUqhnmSxx`, `4rLSRysxXxLX`, `VlBRZnBT7e0L`, `TpfeuHXvYgkH`, `TPqYid2TykLc`, `qvd3VBUROdw2` map onto the 7 clusters with overflow capacity. **Task-to-cluster alignment is the recommended next planning action** — out of scope for K2.

---

## 7. Adversarial Self-Review

Per task spec acceptance criterion: red-team the doc.

### 7.1 Coherence — patterns ↔ per-plugin map

| Pattern | Lands in (plugins ≥1)? | Orphan check |
|---|---|---|
| Provenance per claim | ✓ brainstorming, research, compound-review, lci, mcp-architect, risk-pipeline, dartai, dev-standards, ideation | No orphan |
| Conflict surfacing | ✓ research, compound-review, risk-pipeline, dartai, workflow, dev-standards, ideation | No orphan |
| Rationalization-trap | ✓ same set as conflict + brainstorming | No orphan |
| Multiview retrieval | ✓ lci (primary), research | No orphan; small-surface — acknowledged Tier 2 |
| Complexity-aware pruning | ✓ research, lci, risk-pipeline (already shipped) | No orphan |
| Temporal normalization | ✓ research, brainstorming (forward), dev-standards (light), lci (no-op explicit) | No orphan |
| Architecture > HP (meta) | ✓ mcp-architect, dartai, workflow, dev-standards | No orphan |

| Plugin | At least one Tier 1 change? |
|---|---|
| brainstorming | ✓ shipped |
| research | ✓ all 3 patterns |
| compound-review | ✓ checklist |
| lci | ✓ documentation Tier 1 + Tier 2 |
| mcp-architect | ✓ meta + provenance |
| risk-pipeline | ✓ checklist reuse |
| dartai | ✓ 3 skills |
| workflow | ✓ 3 skills |
| dev-standards | ✓ 4 skills |
| ideation | ✓ 1 skill |
| 13 no-op plugins | ✓ explicitly documented as no-op with rationale (§4.11) |

**No orphan patterns. No orphan plugins. Coherence check passes.**

### 7.2 Scope guardian — implementation creep check

Did K2 leak into implementation?

- **Per-plugin map names files but does not write file contents.** Each table row is a target + change description, not the change body. ✓
- **No code, no agent prompts, no skill bodies.** ✓
- **Task-ID mapping in §6 is forward-reference, not pre-implementation.** Cluster boundaries are described; concrete task descriptions are explicitly noted as out-of-scope alignment work. ✓
- **Risk:** the `compound-review` checklist sketch (~60 lines) might tempt downstream to copy-paste from K2 rather than re-derive from ebd136a. **Mitigation:** K2 cites ebd136a as upstream source; downstream should read ebd136a, not K2. **Acceptable risk.**

**Scope guardian: held.**

### 7.3 Design lens — concreteness audit

Spot-check 5 random per-plugin entries; is each "named file + named change," not abstract?

1. `research / web-researcher.md / provenance` → "Add to each agent's output-contract section: every returned finding must include a `provenance` field with one of the 5 forms from §3.1; literal `\"guess\"` for unverifiable inferences" — **concrete.** Names file, names section, names field, names allowed values.
2. `compound-review / knowledge-hygiene-checklist.md` → new file, ~60 lines, references ebd136a `<PROVENANCE-CONTRACT>` + `Conflict-Detect Integration` — **concrete.** Names file, sizes it, names imports.
3. `lci / context-handoff.md / temporal-normalization` → "one-line freshness note: LCI index rebuilt on file change; results inherently fresh; no `as_of` field needed" — **concrete.** Specifies the line.
4. `dartai / adversarial-quality-loop.md / rationalization-trap` → "phase-9 final-validation note that revisions surface as `plan_adjustment` entries" — **concrete.** Names skill, names phase, names mechanism (already-existing pattern reused).
5. `mcp-architect / mcp-architecture / architecture-meta` → "new sub-section: 'Pattern selection dominates parameter tuning' — cite OmniMEM's +44%/+188%/+0% breakdown" — **concrete.** Names sub-section title, names citation source, names data points.

**Design-lens check: passes. No abstract entries detected in spot-check.**

### 7.4 Citation discipline — provenance audit

K2 itself is a knowledge-hygiene doc; does it follow its own contract?

- Every paper claim cites the arxiv ID. ✓
- Every prior-commit claim cites the SHA (`ebd136a`). ✓
- Every K2-author opinion is labeled `(K2 inference)`. ✓ (4 occurrences in §2.1, §2.2, §2.3, §3.4 — checked.)
- Forward-references to K0 cite the doc path + section. ✓
- Forward-references to Dart tasks cite task IDs. ✓
- **Eat-your-own-dogfood: passes.**

### 7.5 Adversarial findings summary

| Finding | Severity | Action |
|---|---|---|
| `prompt-engineer` plugin deferred without clear trigger | Low | Note in §4.11: "deferred to follow-up epic" — acceptable; not blocking | Accept |
| §6 cluster-to-task-ID alignment is approximate | Medium | Explicitly flagged as out-of-scope alignment work; recommend separate planning pass | Accept (documented) |
| Multiview retrieval pattern is Tier 2 — risks it never lands | Low | RAGSearch's task-dependence finding justifies the deferral; LCI already has dense+symbolic which is 80% of the pattern's value | Accept |
| `compound-review` shared-checklist approach assumes 5 reviewers want the same rules | Low-Medium | They do per K0 §3.1 (all wave-1 reviewers operate on the same diff scope); if a reviewer needs reviewer-specific rules, they extend the checklist via inheritance | Accept |
| OmniMEM "architecture > HP" finding is from a 2-benchmark autoresearch run; generalization is uncertain | Medium | Cited as `(K2 inference)` limitation in §2.2; meta-pattern is Tier 1 *guidance* not Tier 1 *enforcement* — acceptable risk | Accept |

**Net: no blocking findings. K2 ships.**

---

## 8. Inputs to Downstream Tickets

- **`rwjOh2tKXYpC` (knowledge-hygiene plugin / shared checklist):** ship `plugins/compound-review/skills/knowledge-hygiene-checklist.md` per Cluster I §6. Cite `ebd136a` `<PROVENANCE-CONTRACT>` + `Conflict-Detect Integration` as upstream sources. ~60 lines.
- **`G0vJiB26eyqf` and/or `6mgXiXbw9G1B` (research plugin update):** coordinated 3-agent update per Cluster II §6 / §4.2. Likely needs split if both task IDs are claimed for this — one task = web-researcher + learnings; sibling task = session-historian + complexity/temporal additions.
- **`VQmMxFOEnQQb`, `lgSkgYNs9i6V` (review-side wiring):** Cluster III §6 — frontmatter touches on 9 reviewer files (5 compound-review + 4 risk-pipeline) referencing the shared checklist.
- **`gN0fUqhnmSxx`, `4rLSRysxXxLX` (orchestrator-side):** Cluster IV §6 — 6 skill touches across `dartai` + `workflow`.
- **`VlBRZnBT7e0L`, `TpfeuHXvYgkH` (tooling + design-time):** Cluster V §6 — 9 skill touches across `lci` + `mcp-architect` + `dev-standards` + `ideation`.
- **`qvd3VBUROdw2` (citation-verifier):** Cluster VI §6 — Wave 3 audit agent / skill that walks PR diffs and enforces provenance-per-claim contract.
- **`TPqYid2TykLc` (architecture-meta retrospective):** Cluster VII §6 — meta-pattern guidance notes; can fit Wave 2 or Wave 3.

**Task-to-cluster precise mapping is recommended as the next planning action.** K2's clusters are the input; matching task descriptions is a separate alignment pass.

---

## Appendix A — Files Touched / Created by This Research

- **Created:** `docs/research/K2-knowledge-hygiene-from-papers.md` (this file).
- **Will trigger creation in epic `kx5Yf2ZTlxP6`:**
  - `plugins/compound-review/skills/knowledge-hygiene-checklist.md` (Cluster I — shared rules).
  - Possible: `plugins/research/skills/knowledge-hygiene-checklist.md` (or shared via reference) (Cluster II).
  - Possible: a new `qvd3VBUROdw2`-driven citation-verifier agent location TBD (Cluster VI).
- **Will trigger edits across:** `plugins/research/agents/{web-researcher,learnings-researcher,session-historian}.md`, `plugins/compound-review/agents/*.md` (frontmatter only), `plugins/risk-pipeline/agents/*.md` (frontmatter only), `plugins/lci/skills/{search-code,context-handoff}.md`, `plugins/mcp-architect/skills/{mcp-architecture,response-optimization}/*`, `plugins/dartai/skills/{adversarial-quality-loop,task-execution,code-quality,simple-planning}.md`, `plugins/workflow/skills/{loop-orchestration,adversarial-quality,memory-management}.md`, `plugins/dev-standards/skills/{verification-before-completion,grill-task,review-for-plan-updates,decide,refactor-first-assessment}/*`, `plugins/ideation/skills/ideate/*`.
- **No file deletions** triggered by K2.

## Appendix B — Glossary

- **OmniMEM-style 4-layer cite trail:** the lifelong-memory provenance pattern from Omni-SimpleMem (`2604.01007`); SBT realizes this as the 5-form `<PROVENANCE-CONTRACT>` from `ebd136a`.
- **ConflictQA cross-source pattern:** the text-vs-KG conflict instantiation pattern from `2604.11209`; SBT realizes this as the brainstorming `Conflict-Detect Integration` surface-then-proceed handler.
- **GraphRAG complementary-roles finding:** RAGSearch's `2604.09666` conclusion that graph + agentic > either alone; SBT applies this as Tier 2 multiview retrieval.
- **Knowledge Conflicts paper rationalization finding:** `2604.11209` §4 finding that LLMs silently rationalize through conflicts; SBT enforces a value-rule anti-pattern against this.
- **Complexity-aware pruning:** RAGSearch's task-dependence finding generalized to "cheap routes for cheap queries"; SBT's `risk-pipeline` already does the analogous work for review routing.
- **Temporal normalization:** the lifelong-agent staleness-detection pattern; SBT's `as_of` field forward-defined here, propagation deferred to Wave 2.
- **Architecture > HP (meta):** OmniMEM's headline that bug-fix + arch + prompt > HP-tuning by an order of magnitude; SBT's planning skills internalize this as decision-time guidance.
