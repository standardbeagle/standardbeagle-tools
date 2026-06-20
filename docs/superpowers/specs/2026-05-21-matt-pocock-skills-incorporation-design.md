# Design: Incorporate Matt Pocock Skills into dev-standards / dartai loop

**Date:** 2026-05-21
**Status:** Approved (brainstorming complete, pending spec review)
**Author:** Claude Code + andybrummer

## Goal

Incorporate selected skills from [mattpocock/skills](https://github.com/mattpocock/skills)
(MIT, Matt Pocock 2026) into this marketplace to improve the dartai
planning / execution / review loop. The unifying win is a **domain glossary +
ADR substrate that every dartai phase consults**, built incrementally during
grilling and navigated via LCI.

These skills are **not** a separate pre-planning silo and **not** a dartai
replacement. They thread INTO dartai's existing three phases. dartai stays the
orchestrator; the incorporated skills are phase-enhancers plus a shared
knowledge substrate.

## Decisions (from brainstorming)

1. **Home:** Everything lands in the existing `dev-standards` plugin. No new
   plugin. dartai already delegates plan/review augmentation to dev-standards
   (`grill-task`, `refactor-first-assessment`, `review-for-plan-updates`), so
   enhancing dev-standards skills in place makes dartai auto-benefit with
   near-zero dartai edits. Skills also stay independently invocable outside
   dartai.

2. **Substrate convention:**
   - Domain glossary → new `.claude/rules/glossary.md` (consistent with the
     dev-standards rules dir; glossary ONLY, no implementation detail).
   - ADRs keep existing one-line `DECISION:` / `REPLACING:` entries in
     `.claude/rules/architecture.md` as the index.
   - A DECISION is **promoted** to a full `docs/adr/NNNN-*.md` file ONLY when it
     passes Matt's 3-test: hard-to-reverse + surprising-without-context +
     result-of-a-real-tradeoff.

3. **LCI weave:** Each adapted skill's "explore the codebase" step is rewritten
   into concrete LCI calls at the right seam, each prefixed
   **"prefer LCI; fall back to Grep/Read if unavailable"** (matches the existing
   lci/agnt companion idiom + repo soft-guidance policy):
   - `lci:search` → term-vs-code vocab checks (glossary build)
   - `lci:explore` → module maps (architecture, exploration)
   - `lci:trace-symbol` → callers + side-effects (diagnose bug path, deletion-test)
   - `lci:context-handoff` → code manifest attached to handoff doc

4. **diagnose is a new skill** here, not an enhancement of
   `superpowers:systematic-debugging` — superpowers is an external install, not
   vendored in this repo, so it cannot be edited from here.

## Scope

### 6 new skills in `dev-standards`

| Skill | Source | Behavior | LCI / dartai tie |
|---|---|---|---|
| `handoff` | productivity/handoff | Conversation → handoff doc in OS temp dir (not repo). Suggested-skills section; reference artifacts (PRD/plan/ADR/issue/commit/diff) by path/URL, no duplication; redact secrets/PII. Arg = next-session focus. | Invokes `lci:context-handoff` for code manifest; references its path. Fires at dartai session boundaries. |
| `prototype` | engineering/prototype | Throwaway code answering one question. Branch A: terminal app (logic/state model). Branch B: multi-variant UI route (URL param + floating bar). Throwaway-from-day-one, no persistence, surface state, capture the answer to glossary/ADR/Dart task then delete. Bundles `LOGIC.md`, `UI.md`. | Plan-phase de-risk before committing a plan. |
| `diagnose` | engineering/diagnose | Feedback-loop-first debug discipline, 6 phases (build loop → reproduce → hypothesise → instrument → fix+regression-test → cleanup+post-mortem). Reads glossary + ADRs. Phase 6 hands off to `refactor-first-assessment` for architectural prevention. | `lci:trace-symbol` for bug path / callers / side-effects. Execution-phase debugging. |
| `git-guardrails` | misc/git-guardrails-claude-code | PreToolUse hook blocking destructive git (push, reset --hard, clean -f, branch -D, checkout ./restore .). Bundles `scripts/block-dangerous-git.sh`. **Soft-guidance reconcile:** opt-in scope (project/global) + user picks/edits the blocked-pattern list; not an absolute hard-coded block. | — |
| `to-issues` | engineering/to-issues | Plan/PRD → tracer-bullet vertical slices (each cuts ALL layers end-to-end), tagged AFK/HITL. **Adapted: writes Dart tasks** via dart-query `create_task`, not GitHub issues. HITL/AFK → priority/size; dependencies → `subtask_ids` on parent. Quiz user on granularity before publishing. | `lci:explore` for codebase context. Fills dartai's plan→tasks gap. |
| `glossary` | grill-with-docs (CONTEXT mgmt half) | Manage `.claude/rules/glossary.md` domain vocab — same list/add/sharpen pattern as `decide` manages architecture.md. Bundles `CONTEXT-FORMAT.md`. | `lci:search` term-vs-code. Substrate every phase reads. |

### 5 enhanced existing `dev-standards` skills

| Skill | Added behavior |
|---|---|
| `grill-task` | grill-with-docs discipline: challenge user terms vs glossary, sharpen fuzzy/overloaded terms to canonical names, stress-test with concrete scenarios, cross-reference code via `lci:search`, **update glossary.md inline** as terms resolve, offer ADR sparingly (3-test). The glossary/ADR construction engine. |
| `decide` | ADR **promotion path**: when a DECISION passes the 3-test, write a full `docs/adr/NNNN-*.md` and keep the one-line index entry in architecture.md. Bundles `ADR-FORMAT.md`. |
| `refactor-first-assessment` | improve-codebase-architecture **deepening lens**: deep vs shallow modules, deletion-test, seam/adapter/leverage/locality vocab, optional self-contained HTML before/after report to OS temp dir. Bundles `LANGUAGE.md`, `HTML-REPORT.md`, `INTERFACE-DESIGN.md`. `lci:explore` + `lci:trace-symbol` for the deletion-test (find all callers). |
| `review-for-plan-updates` | Post-task deepening discoveries framed in deep-module vocabulary (already surfaces C-class refactors; adds the architecture lens). |
| `setup-project` | Generate `glossary.md` stub alongside architecture.md; document the `docs/adr/` promotion convention in generated rules. |

### dartai wiring (minimal)

- Plan phase already calls `grill-task` + `refactor-first-assessment` → now
  glossary/ADR + deepening aware. **Zero dartai edit.**
- Plan→tasks: add `to-issues` mention to the dartai planning phase doc (light edit).
- Execution: add `diagnose` to task-executor debugging guidance (light edit).
- Review/replan: `review-for-plan-updates` already wired → deepening framing flows through. **Zero dartai edit.**
- `handoff` invocable at session boundaries (standalone, no dartai edit).

## Shared UI/presentation layer (new `present` plugin)

Added after a cross-skill audit found self-contained HTML-report generation
(Tailwind + Mermaid CDN → temp dir → open browser) duplicated across ~15 skills
(figma-query ×10, dartai:report + workspace-docs, design-utilities,
dev-standards:load-bearing-sources, agnt:quality-audits) plus ad-hoc
markdown/doc opening. These reusable UI elements are pulled out of their
specific flows into a standalone `present` plugin that any plugin can invoke by
name (skills reference each other at runtime, which works across the plugin
cache boundary).

| Skill | Type | Behavior |
|---|---|---|
| `present:html-report` | pure skill + bundled scaffold reference | Take structured data (title, sections, diagrams) → write a self-contained Tailwind+Mermaid HTML file to the OS temp dir → open in browser, print absolute path. The canonical home for the HTML-report scaffold that ~15 skills currently re-describe inline. |
| `present:doc` | pure skill + tiny render script | Render a given `.md` → HTML (or pass-through `.html`) → serve via the agnt proxy or `xdg-open`/`open`/`start` → fall back to printing the absolute path if no browser path is available. |

**Consumption decisions:**

- **Phase C retrofit is opportunistic.** Build `present:html-report` and point
  only the new `refactor-first-assessment` architecture report at it. The other
  ~15 consumers are retrofitted lazily when next touched — no big sweep.
- **Presentation wiring:** `handoff` and `prototype` (NOTES) call `present:doc`;
  `refactor-first-assessment` calls `present:html-report`. Each with a
  print-the-path fallback when `present`/agnt is unavailable (soft dependency).
- **Companion deferred.** The brainstorming bun mini-IDE (interactive
  questionnaire + markdown-screen engine) is the third reusable primitive, but
  extracting it cleanly requires publishing it as `@standardbeagle/ui-companion`
  (npm, npx-@latest like agnt/lci) in its own repo — it cannot live as shared
  files inside the marketplace repo because plugins are copied to an isolated
  cache. This is captured as a separate Dart follow-up task, not built in this
  plan. `present:companion` is a placeholder for that future work.

**`present` plugin metadata:** new plugin at `plugins/present/`, version `0.1.0`,
own `plugin.json` + marketplace entry, MIT, author Standard Beagle. The
`html-report` scaffold reference is adapted from Matt Pocock's
`improve-codebase-architecture/HTML-REPORT.md` (MIT) and lives here rather than
in `refactor-first-assessment`.

## Supporting files to fetch + adapt

From mattpocock/skills, fetch and adapt (GitHub→Dart vocab, add LCI seams,
two-pass compress descriptions):

- `LOGIC.md`, `UI.md` (prototype)
- `LANGUAGE.md`, `INTERFACE-DESIGN.md` (refactor-first-assessment)
- `HTML-REPORT.md` (→ `present:html-report`, not refactor-first-assessment)
- `CONTEXT-FORMAT.md` (glossary), `ADR-FORMAT.md` (decide)
- `scripts/block-dangerous-git.sh` (git-guardrails)
- `to-issues` issue template → adapt to a Dart task brief

## Cross-cutting requirements

- **Descriptions:** dev-standards is in the auto-invocable visibility tier →
  two-pass compression (conceptual + caveman/wenyan) per
  `dev-standards:skill-description-style`, 150–400 chars target, 1024 hard
  ceiling, Use-when triggers intact.
- **No `allowed-tools`** in any skill (per repo feedback) — recommend tools,
  don't block.
- **Soft guidance over hard limits** — "prefer N", "default toward X", escape
  valves; applies to git-guardrails patterns and all new prose.
- **Attribution:** credit line crediting Matt Pocock + the source repo in each
  adapted skill; repo-level NOTICE/attribution entry. MIT-compatible.

## Versioning / release

- New `present` plugin at `0.1.0` — add `plugins/present/.claude-plugin/plugin.json`
  + a marketplace.json entry.
- Bump `dev-standards` minor (`0.4.4` → `0.5.0`) in
  `plugins/dev-standards/.claude-plugin/plugin.json` and sync marketplace.json.
- Light `dartai` patch bump (`0.10.2` → `0.10.3`) for phase-doc edits.
- Bump catalog version in marketplace.json (`1.8.4` → `1.9.0`).

## Deferred (tracked)

- Companion extraction → Dart task `db3R4BBmlndp` (`Personal/standardbeagle-tools`).
  `present:companion` is a placeholder until that ships.

## Out of scope (YAGNI)

Covered elsewhere or ecosystem-bound, per the earlier overlap matrix:
`triage`, `to-prd`, `grill-me`, `zoom-out`, `write-a-skill`, `caveman`,
`setup-pre-commit`, `setup-matt-pocock-skills`, and all
deprecated/in-progress/personal skills.

## Success criteria

- Glossary + ADR substrate (`glossary.md`, architecture.md index, `docs/adr/`)
  is read by grill-task, refactor-first-assessment, diagnose, to-issues.
- A dartai planning run with grill-task produces/updates glossary entries and
  surfaces ADR-promotion candidates.
- All adapted skills prefer LCI with a Grep/Read fallback.
- `to-issues` writes Dart tasks (not GitHub issues).
- `claude plugin validate .` passes; descriptions within budget; versions synced.
