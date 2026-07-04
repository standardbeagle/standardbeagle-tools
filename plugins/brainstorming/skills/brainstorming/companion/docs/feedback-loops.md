# Companion Feedback Loops

The companion is a generic human-in-the-loop surface: Claude writes a
markdown+YAML *screen* into `$SESSION_DIR/screens/`, the local web UI renders it
as interactive widgets, the user acts, and the action appends a structured event
to `events.jsonl` that Claude reads back via `Monitor`. Today only the
`brainstorming` skill drives it. This document maps the screen kinds
(see [`screen-format.md`](./screen-format.md)) onto **standard development tasks**
so other skills can adopt the same loop.

The two loop shapes:

- **Ask loop** — Claude pre-structures the decision into a screen
  (`question` / `cards` / `strategy-card` / `summary-confirm` / `decision`); the
  user picks, sorts, ranks, or edits; Claude reads the choice. Best when the
  option space is known.
- **Mark-up loop** — Claude emits an artifact (`annotate-artifact`, gated by
  `layout-gate`); the user points at what is wrong; Claude revises in place and
  re-emits. Best when the output is unstructured (a diff, report, doc, diagram)
  and the user's feedback is "this specific part is off."

## Task → screen-kind matrix

| Dev task | Screen kind(s) | Loop | What the user does |
|---|---|---|---|
| PR / code review | `annotate-artifact` (rendered diff) + `decision` | mark-up | Marks bad hunks/lines inline, then approve / request-changes |
| Architecture / ADR review | `summary-confirm` (bullets + provenance) + `annotate-artifact` (mermaid nodes) | both | Edits claims inline; annotates diagram nodes |
| Refactor planning | `cards` (must/nice/drop) + `strategy-card` (approach) | ask | Sorts blast-radius items; ranks then picks an approach |
| Migration / rollout | `strategy-card` + `decision` (per step) | ask | Diverge-rank options, converge-pick; approves each step |
| API / schema design | `question` (code input, yaml/json) + `annotate-artifact` (API console) | both | Pastes/edits a schema; annotates a rendered console |
| UI / component iteration | `demo` + `layout-gate` | mark-up | Interacts with the live demo; layout audited before show |
| Config / secret setup | `question` (`file-edit`, `private: true`) | ask | Edits `.env` through the privacy path (0o600, never echoed) |
| Bug triage / backlog | `cards` (cluster) + `decision` | ask | Clusters and kills issues; approves triage |
| Dependency / lib selection | `strategy-card` (`seen_in` provenance) | ask | Compares bundles, picks one, optional single-knob override |
| Release notes / changelog | `summary-confirm` (editable bullets) | ask | Corrects wording inline; confirms |
| Data-model / ER review | `annotate-artifact` (mermaid ER) | mark-up | Annotates entities/relations by node |
| Onboarding / codebase tour | mermaid + file-open bridge | read | Clicks `file:line` provenance links → opens editor |

## The mark-up loop in detail

For any unstructured artifact:

1. Claude renders the artifact to HTML and emits a `kind: annotate-artifact`
   screen with `layout_audit: true`.
2. The `layout-gate` runs `auditLayout()`; if the layout is broken Claude gets
   `layout_findings` and repairs before the user ever sees it.
3. The user marks elements / text ranges / mermaid nodes; each becomes an
   `artifact_annotation` event carrying a `selector` + `text_excerpt`.
4. On `artifact_changes_requested`, Claude reads the annotation stream, edits the
   source at each `selector`, and re-emits the screen.
5. Repeat until `artifact_approved`.

Because every annotation is anchored to a concrete selector, Claude never has to
guess *which* part the user meant — the loop closes on specifics, not "make it
better."

## Wiring a skill to the companion

A skill adopts the loop by (a) writing screen files and (b) reading events. No
new companion code is required for the `ask` loop — the existing screen kinds
cover it. The `mark-up` loop needs the `annotate-artifact` / `layout-gate`
runtime (see the screen-format spec; runtime implementation tracked separately).

Candidate first adopters, in order of leverage:

1. **`code-review` / PR review** — highest frequency; `annotate-artifact` on the
   rendered diff is the single biggest capability gain over today's text review.
2. **`dartai:report`** — already emits HTML; add `annotate-artifact` so the user
   marks up the status report instead of replying in prose.
3. **`dev-standards` planning skills** (`grill-task`, `refactor-first`) — already
   decision-shaped; adopt `summary-confirm` + `strategy-card` directly.

## Provenance carries across screens

`summary-confirm` bullets, `strategy-card` `seen_in` entries, and
`annotate-artifact` targets all carry the brainstorming `<PROVENANCE-CONTRACT>`
tags (`file:<path>:<line>`, `memory:<id>`, `git:<sha>`, `web:<url>`, or the
literal `guess`). The file-open bridge turns `file:`/`git:` tags into clickable
links. Downstream consumers — the knowledge-hygiene conflict-detector and the
Tier-3 citation-verifier — read the same tags, so a feedback loop that preserves
provenance feeds the same audit surface brainstorming already does.

## Not yet built

- `annotate-artifact` and `layout-gate` are specified here and in
  `screen-format.md`; the companion **runtime** (server routes + React
  renderers + injected SDK) for these two kinds is a follow-on implementation
  phase. The `ask`-loop kinds are already implemented.
- Export / share of a reviewed artifact to a portable HTML file (Lavish's
  `export` / `share`) is out of scope for this phase.
