# Screen Format Reference

Claude writes markdown + YAML frontmatter files into `$SESSION_DIR/screens/`. This document is the canonical reference for the schema. When writing a screen, always start with the `kind:` field.

## Screen format

Everything Claude authors is a markdown file with YAML frontmatter. The `kind` field picks the renderer. Three kinds in v1.

### `kind: question`

```markdown
---
kind: question
id: deployment-target
title: Where are we deploying?
inputs:
  - {type: radio,   name: target,   options: [k8s, lambda, desktop]}
  - {type: multi,   name: flags,    options: [ssl, cdn, backups]}
  - {type: text,    name: notes,    multiline: true}
  - {type: code,    name: manifest, language: yaml, placeholder: paste a manifest}
  - {type: file-edit, path: .env,   private: true}
---

## Context

Prose, mermaid diagrams, tables, and images render in the body.
```

Input types in v1:

| type | widget | event value |
|---|---|---|
| `radio` | `<fieldset>` + radios | selected option value |
| `multi` | checkbox group | array of values |
| `text` | `<input>` or `<textarea>` if `multiline: true` | string |
| `code` | CodeMirror 6 with the given `language` | string |
| `file-edit` | CodeMirror 6 bound to a real filesystem path | routes through privacy path; see below |

Any input marked `private: true` routes through the privacy path instead of the public answer path.

### `kind: demo`

```markdown
---
kind: demo
id: login-form-v2
title: Login form — does this feel right?
demo:
  type: srcdoc
  html: ./login.html
  css:  ./login.css
  js:   ./login.js
  viewport: {width: 420, height: 640}
actions:
  - {type: approve, label: Looks good}
  - {type: revise,  label: Needs changes, requires_note: true}
---

## What changed since v1

- …
```

The companion loads the referenced files, inlines them into a sandboxed `<iframe sandbox="allow-scripts">` with no network and no parent access. A tiny `postMessage` bridge lets the demo emit events (e.g. `submitted`, `clicked_signup`) that become `demo_event` entries in `events.jsonl`, so Claude sees what the user did inside the demo, not just that they approved.

v1 supports only `type: srcdoc`. A `type: sandpack` variant for live React/Preact demos is out of scope and can be added later without a format change.

### `kind: cards`

```markdown
---
kind: cards
id: feature-ideas
title: Card-sort the feature ideas
items:
  - {id: c1, text: "Single-tenant on-prem deploy", order: 0}
  - {id: c2, text: "Multi-tenant SaaS with row-level security", order: 1}
  - {id: c3, text: "Hybrid with bring-your-own-cluster", order: 2}
clusters:
  - {id: must,  label: Must have}
  - {id: nice,  label: Nice to have}
  - {id: drop,  label: Drop}
---

## Brief

Prose describing the divergent-thinking question. The companion
renders each card as a draggable item; users move cards between
clusters, kill the ones that do not survive, and create new clusters
from the input on the page.
```

The companion mutates the screen frontmatter in place via atomic
rename (write to `.tmp`, then `renameat2`) on each user action and
appends a structured event to `events.jsonl` so Claude can read the
result without polling files.

| User action | API endpoint | Event appended |
|---|---|---|
| drag card to cluster | `POST /api/cards/:screen_id/move` body `{card_id, to_cluster, order}` | `{type:"card_moved", screen_id, card_id, from_cluster, to_cluster, order}` |
| click ✕ on a card | `POST /api/cards/:screen_id/kill` body `{card_id}` | `{type:"card_killed", screen_id, card_id}` |
| add a new cluster | `POST /api/cards/:screen_id/cluster` body `{cluster_id, label}` | `{type:"cluster_created", screen_id, cluster_id, label}` |

Killed cards keep their entry in the frontmatter with `killed: true`
so history is preserved; the renderer hides them. Cards with no
`cluster` field render in an "Unclustered" bucket. The card list is
the authoritative state on disk; the event log is a history stream
identical in shape to the `decision` flow.

### `kind: summary-confirm`

```markdown
---
kind: summary-confirm
id: phase-0-architect-summary
title: Architect summary — please confirm or correct
status: pending             # pending | confirmed | revised
sections:
  goal:
    confidence: high
    bullets:
      - {id: g1, text: "Add OAuth login to existing X service", provenance: "memory:project_x_oauth_request"}
  constraints:
    confidence: med
    bullets:
      - {id: c1, text: "Must coexist with existing session middleware", provenance: "file:src/middleware/session.ts:1"}
      - {id: c2, text: "Prefer hosted provider over self-built", provenance: "guess"}
      - {id: c3, text: "Two-week delivery target", provenance: "memory:sprint_25_planning"}
  system_shape:
    confidence: med
    mermaid: |
      graph LR
        A[Browser] --> B[Express middleware]
        B --> C[(User table)]
        B --> D[OAuth provider]
    bullets:
      - {id: s1, text: "Express middleware + new oauth_provider column on users", provenance: "file:src/middleware/auth.ts:42"}
  risks:
    confidence: low
    bullets:
      - {id: r1, text: "Existing session vs OAuth callback collision", provenance: "guess"}
      - {id: r2, text: "Migration impact on active users", provenance: "guess"}
      - {id: r3, text: "Provider lock-in", provenance: "guess"}
  alternative_framings:
    confidence: low
    bullets:
      - {id: a1, text: "Could be framed as session-system replacement", provenance: "guess"}
      - {id: a2, text: "Could be SSO-only for internal network, no public OAuth", provenance: "guess"}
---

## Notes

Free-form prose, mermaid diagrams, or tables render in the body. Each
bullet is editable inline; the confidence pill on each section is
read-only (Claude-authored).
```

The companion renders each section as a card with a confidence pill (`high`/`med`/`low`). Each bullet is editable inline; the user can also type a free-text reply that becomes a top-level revision note. The mermaid block in `system_shape.mermaid` renders inline in that section's card via the same lazy-loaded mermaid module other screens use.

Each bullet also carries a **`provenance`** field — a string tag identifying the source the inference came from. Valid forms (per brainstorming `SKILL.md` `<PROVENANCE-CONTRACT>`):

| value form | meaning |
|---|---|
| `file:<path>:<line>` | codebase reference |
| `memory:<id>` | memory entry reference |
| `git:<sha>` | git commit reference |
| `web:<url>` | web cite |
| `guess` | literal — Claude's pure inference, no verifiable source |

The companion renders the `provenance` value as a small inline tag on each bullet. `file:` / `memory:` / `git:` / `web:` tags render as clickable provenance links via the existing file-open bridge (where the link target resolves locally) or as plain-text labels otherwise. The literal `guess` tag renders with a distinct visual treatment (separate from the section confidence pill — confidence and provenance are orthogonal dimensions).

`provenance` is required on every bullet — empty / missing / `null` is a schema violation. Authors must use the literal string `"guess"` when no verifiable source exists; this preserves the contract surface for downstream `rwjOh2tKXYpC` (knowledge-hygiene plugin's conflict-detector) and `qvd3VBUROdw2` (Tier 3 citation-verifier).

Bullets are inline-editable for both `text` and `provenance` independently. The two edit paths emit the same event shape — see the table below; the optional `provenance_old` / `provenance_new` fields on each event payload distinguish provenance edits from text edits.

| User action | API endpoint | Event appended |
|---|---|---|
| edit a bullet's text | `POST /api/summary/:screen_id/edit` body `{bullet_id, section, old_text, new_text}` | `{type:"summary_bullet_revised", screen_id, bullet_id, section, old_text, new_text}` |
| edit a bullet's provenance | `POST /api/summary/:screen_id/edit` body `{bullet_id, section, old_provenance, new_provenance}` | `{type:"summary_bullet_revised", screen_id, bullet_id, section, old_provenance, new_provenance}` |
| confirm summary as-is | `POST /api/summary/:screen_id/confirm` body `{}` | `{type:"summary_confirmed", screen_id}` |
| submit final revisions | `POST /api/summary/:screen_id/submit` body `{note?}` | `{type:"summary_revised", screen_id, diff: [{bullet_id, section, old_text?, new_text?, old_provenance?, new_provenance?}, ...], note}` |

The `summary_revised` event carries the full bullet-level diff in one payload so Claude does not have to reassemble the per-edit stream. Each diff entry may include `old_text`/`new_text`, `old_provenance`/`new_provenance`, or both — fields are optional and present only when that dimension actually changed. `status` in frontmatter flips to `confirmed` (no edits) or `revised` (any edits) via atomic rename, mirroring the `decision` flow. Bullet IDs are stable across edits — when a bullet is revised, the same `id` keeps its place in the section list with new `text` and/or `provenance`.

When to use: Phase 0 architect summary (see brainstorming `SKILL.md` Phase 0 section). Not for general decisions — use `kind: decision` for those.

### `kind: strategy-card`

A specialization of `kind: cards` for Phase 1 / Phase 2 strategy bundles. Each card carries the strategy-bundle fields from `SKILL.md` (`bundles_resolves`, `unlocks`, `locks_out`, `seen_in`, `reconsider_when`, `recommendation_confidence`). Use `kind: cards` for free-form card sorts; use `kind: strategy-card` when the cards are strategy-bundle options for a divergent / convergent decision.

```markdown
---
kind: strategy-card
id: phase-1-shape
title: How should this fit into the existing system?
stage: diverge              # diverge | converge
options:
  - id: standalone
    label: "Standalone service / new repo"
    summary: "Own deploy, own data store, REST/RPC boundary"
    recommendation_confidence: med
    bundles_resolves:
      - "Own deploy and release cadence"
      - "Own data store"
      - "REST/RPC boundary with main app"
    unlocks:
      - "Independent release cadence"
      - "Independent scaling"
    locks_out:
      - "Shared transactions with main app"
    seen_in:
      - {label: "internal billing service", path: "services/billing/README.md"}
    reconsider_when:
      - "Cross-service transaction needs emerge"
      - "Ops cost of N services exceeds team capacity"
    rank: 0
  - id: embedded
    label: "Embedded module in existing app"
    summary: "Shared deploy, shared db, in-process calls"
    recommendation_confidence: high
    bundles_resolves:
      - "Shared deploy and shared db"
      - "In-process calls to existing services"
    unlocks:
      - "Easy transactions"
      - "Simpler ops surface"
    locks_out:
      - "Independent scaling of this module"
    seen_in:
      - {label: "auth middleware pattern", path: "src/middleware/auth.ts"}
    reconsider_when:
      - "Module starts to dominate deploy time or memory"
    rank: 1
  - id: plugin
    label: "Plugin / extension to existing platform"
    summary: "Piggyback on host platform's auth / data / ops"
    recommendation_confidence: low
    bundles_resolves:
      - "Host-platform auth, data, and ops"
    unlocks:
      - "Zero new infra"
    locks_out:
      - "Independence from host's release cycle"
    seen_in: []
    reconsider_when:
      - "Host platform deprecates required extension API"
    rank: 2
selected_option: null       # set on tap-to-select; null until converge
user_comments: null         # optional free-text on selection
---

## Brief

Prose framing the question. The companion renders each option as a
flippable card. Front: label + summary + recommendation pill.
Back: bundles_resolves / unlocks / locks_out / seen_in / reconsider_when.
```

The companion renders each option as a flippable card. The front shows `label`, `summary`, and a recommendation pill driven by `recommendation_confidence` (`high` / `med` / `low`). The back shows the strategy-bundle fields. Cards are flipped via a tap on the card body (not the rank handle), so flipping does not conflict with the drag-to-rank affordance.

`seen_in` entries with a `path` field render as clickable provenance links — clicking opens the referenced file in the user's editor via the companion's existing file-open bridge. Entries without `path` render as plain-text labels. `seen_in: []` (empty array) renders as "novel — no direct analogue" per the schema convention in `SKILL.md`. The provenance links are surface-only display here; the broader provenance plumbing (cross-screen citation graph, conflict detection) is owned by a separate task and is out of scope for this screen.

Two interaction stages, controlled by the `stage` field in frontmatter:

| `stage` value | UI affordance | Purpose |
|---|---|---|
| `diverge` | drag handle on each card; user reorders cards by `rank` | Phase 1 / 2 widening — user surfaces preferences without committing |
| `converge` | tap-to-select on each card; selected card highlights, others fade | Final pick — sets `selected_option` and emits `strategy-selected` |

Drag-to-rank during `diverge` updates `rank` on each option in place via atomic rename. Tap-to-select during `converge` writes `selected_option` and freezes the screen.

| User action | API endpoint | Event appended |
|---|---|---|
| drag to reorder (diverge stage) | `POST /api/strategy/:screen_id/rank` body `{option_id, new_rank}` | `{type:"strategy_ranked", screen_id, option_id, old_rank, new_rank}` |
| tap to select (converge stage) | `POST /api/strategy/:screen_id/select` body `{option_id, user_comments?}` | `{type:"strategy_selected", screen_id, option_id, user_comments}` |
| flip card (no-op for state) | client-only, no event | UI affordance only |

The `strategy_selected` event is the converge signal Claude reads. `user_comments` is the optional free-text override channel from `SKILL.md` Phase 2 mechanics ("but use TTL=1hr instead of 5min") — when present, Claude treats it as a single-knob override on top of the selected strategy, not a rejection of the bundle.

When to use: Phase 1 strategy-bundle big questions and Phase 2 detail-layer strategy selection (see brainstorming `SKILL.md`). Not for atomic single-knob questions — use `kind: question` with `radio` input for those.

### `kind: decision`

```markdown
---
kind: decision
id: 2026-04-12-auth-strategy
title: Auth strategy for v1
status: proposed          # proposed | approved | revised | rejected
options:
  - {id: magic-link, label: Magic link only, recommended: true}
  - {id: oauth,      label: OAuth (Google, GitHub)}
  - {id: both,       label: Both, gated by env}
---

## Context
...

## Recommendation
Magic link only, because ...

## Tradeoffs
| Option | Pros | Cons |
|--------|------|------|
...
```

Decisions live in `$SESSION_DIR/decisions/` and accumulate across screens. The sidebar has a dedicated Decisions section that renders them with status badges. On user action, the server:

1. Updates the `status:` field in-place via atomic rename (write to `.tmp`, `renameat2`)
2. Appends `{type:"decision", id, status, chosen_option, note, ts}` to `events.jsonl`
3. If revised, leaves the file open so Claude addresses the note in a subsequent turn

Decisions are the authoritative state of the session; the event log is a history stream.

### `kind: annotate-artifact`

Lavish-derived. Renders an agent-authored HTML artifact and lets the user point at individual elements, text ranges, or mermaid nodes and attach contextual feedback — instead of choosing from Claude-authored options. Use when the thing under review is *unstructured* output Claude did not pre-decompose into fields: a rendered report, a diff, a doc, a data table, a diagram. This is the human-in-the-loop review surface for "here is what I made — mark up what is wrong."

```markdown
---
kind: annotate-artifact
id: pr-1423-review
title: Review the rendered diff — mark anything off
artifact:
  type: srcdoc            # srcdoc (inlined html/css/js) — same sandbox as kind: demo
  html: ./diff.html
  css:  ./diff.css
  js:   ./diff.js         # optional; may be the injected annotation SDK's host page
mode: annotate            # annotate | explore (Cmd/Ctrl+I toggles at runtime)
layout_audit: true        # run the layout gate at render time (see kind: layout-gate)
actions:
  - {type: approve,          label: Looks good}
  - {type: request-changes,  label: Needs changes, requires_note: true}
---

## What to look at

Prose framing. The artifact loads into a sandboxed `<iframe sandbox="allow-scripts">`
(no network, no parent access) with the annotation SDK injected. Hovering highlights
elements in annotate mode; clicking an element, selecting text, or clicking a mermaid
node opens an annotation card whose note the user types inline.
```

The injected SDK exposes annotation primitives on the artifact: element select (hover-highlight → click), text-range selection (anchored with start/end boundaries), and mermaid node select (diagram id + node id + rendered label). Each annotation carries a stable `target_uid` (SDK-assigned) plus a CSS `selector` so Claude can locate the target in the source. Elements marked `data-lavish-question` bound the annotation scope; native controls (radios, inputs, buttons) stay interactive.

| User action | API endpoint | Event appended |
|---|---|---|
| annotate an element | `POST /api/artifact/:screen_id/annotate` body `{anchor:"element", target_uid, selector, tag, text_excerpt, note}` | `{type:"artifact_annotation", screen_id, anchor:"element", target_uid, selector, note}` |
| annotate a text range | `POST /api/artifact/:screen_id/annotate` body `{anchor:"text", target_uid, selector, range:{start,end}, text_excerpt, note}` | `{type:"artifact_annotation", screen_id, anchor:"text", target_uid, range, text_excerpt, note}` |
| annotate a mermaid node | `POST /api/artifact/:screen_id/annotate` body `{anchor:"mermaid", diagram_id, node_id, label, note}` | `{type:"artifact_annotation", screen_id, anchor:"mermaid", diagram_id, node_id, note}` |
| approve as-is | `POST /api/artifact/:screen_id/approve` body `{}` | `{type:"artifact_approved", screen_id}` |
| request changes | `POST /api/artifact/:screen_id/request-changes` body `{note}` | `{type:"artifact_changes_requested", screen_id, note, annotation_count}` |

Annotations accumulate in `$SESSION_DIR/screens/<id>.annotations.jsonl` (append-only) so the full mark-up set survives reload; the frontmatter `status` flips `pending → approved | changes-requested` via atomic rename. Because each annotation carries `selector` + `text_excerpt`, Claude reads the annotation stream and revises the artifact in place, then re-emits the screen — the **write → annotate → revise** loop. Scroll position and queued-but-unsent annotations persist across a live reload.

`mode: explore` disables annotation and enables mermaid drag-pan / scroll-zoom for reading large diagrams; `mode: annotate` freezes mermaid so node selection is precise. `demo_event`-style payloads from the artifact iframe are fully echoed — do not put secrets in an annotated artifact.

### `kind: layout-gate`

Lavish-derived. Not usually authored standalone — it is the `layout_audit: true` behavior on `kind: demo` and `kind: annotate-artifact`. At render time the companion runs `auditLayout()` inside the artifact iframe and classifies findings before the user sees the artifact, so broken layout never reads as "approved."

Audit classes (from the injected SDK):

| finding `kind` | detector | meaning |
|---|---|---|
| `clipped-text` | `classifyHorizontalOverflow` / `classifyVerticalOverflow` | text cut off by a fixed-size box |
| `element-scroll-overflow` | `auditElementOverflow` (`scrollWidth > clientWidth`) | content overflows a non-scroll container |
| `overlapping-text` | `auditOverlappingText` (fragment-aware `getClientRects()` collision) | two text runs visually collide |

Each finding carries `{selector, kind, overflowPx, viewportWidth, severity, persistent}`. Intentional scrollers (`overflow-x/y: auto|scroll`) are excluded. If any finding is `severity: warn` or higher, the companion masks the artifact with a gate overlay listing the findings; the user chooses:

| User action | API endpoint | Event appended |
|---|---|---|
| fix-first (bounce back to Claude) | `POST /api/layout/:screen_id/fix-first` body `{}` | `{type:"layout_findings", screen_id, findings:[...], resolution:"fix-first"}` |
| override (show anyway) | `POST /api/layout/:screen_id/override` body `{}` | `{type:"layout_findings", screen_id, findings:[...], resolution:"override"}` |

On `fix-first`, Claude reads the `findings` array — each with a `selector` and `overflowPx` — repairs the artifact, and re-emits the screen; the gate re-runs. `override` records the user's acceptance and reveals the artifact for annotation. The gate is advisory, never a hard block — the user can always override.

### Mermaid

Fenced mermaid blocks in any markdown body render as SVG client-side via lazy-loaded mermaid ESM. Caching: first mermaid block triggers a one-time ~300KB fetch; subsequent blocks reuse the loaded module.

## Privacy model

### Invariant

> The process that holds private contents (the Bun server) never writes them into `events.jsonl`, and the process that reads events (Claude, via Monitor) never touches the target file.

### Two write paths

1. **Public** — `/api/answer` parses the body, strips any input whose frontmatter marked `private:true`, appends `{type:"answer", inputs}` to `events.jsonl`.
2. **Private** — `/api/private-save` writes contents directly to the target path with `mode: 0o600`, computes `sha256`, and appends `{type:"saved", name, path, bytes, sha256}` to `events.jsonl`. Contents are never stored anywhere except the target path.

The frontend enforces this split: `FileEditInput` submits through `/api/private-save` only. A unit test asserts that given a screen with `private: true`, no answer payload ever reaches `/api/answer`, and a property test greps `events.jsonl` after a private save and fails if the original contents appear anywhere.

### What the privacy model does not defend against

- Claude can `Read` the file directly via its own file tools — they bypass the companion entirely. Privacy only means "not echoed through the conversation channel". For real secrecy, `.gitignore` and do not ask Claude to read the file.
- `demo_event` payloads from the iframe are fully echoed. Do not put secrets in demos.
- `sha256` in `saved` events reveals whether the same content was used twice. Acceptable for `.env` flows.
