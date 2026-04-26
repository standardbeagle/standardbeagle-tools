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
      - {id: g1, text: "Add OAuth login to existing X service"}
  constraints:
    confidence: med
    bullets:
      - {id: c1, text: "Must coexist with existing session middleware"}
      - {id: c2, text: "Prefer hosted provider over self-built"}
      - {id: c3, text: "Two-week delivery target"}
  system_shape:
    confidence: med
    mermaid: |
      graph LR
        A[Browser] --> B[Express middleware]
        B --> C[(User table)]
        B --> D[OAuth provider]
    bullets:
      - {id: s1, text: "Express middleware + new oauth_provider column on users"}
  risks:
    confidence: low
    bullets:
      - {id: r1, text: "Existing session vs OAuth callback collision"}
      - {id: r2, text: "Migration impact on active users"}
      - {id: r3, text: "Provider lock-in"}
  alternative_framings:
    confidence: low
    bullets:
      - {id: a1, text: "Could be framed as session-system replacement"}
      - {id: a2, text: "Could be SSO-only for internal network, no public OAuth"}
---

## Notes

Free-form prose, mermaid diagrams, or tables render in the body. Each
bullet is editable inline; the confidence pill on each section is
read-only (Claude-authored).
```

The companion renders each section as a card with a confidence pill (`high`/`med`/`low`). Each bullet is editable inline; the user can also type a free-text reply that becomes a top-level revision note. The mermaid block in `system_shape.mermaid` renders inline in that section's card via the same lazy-loaded mermaid module other screens use.

| User action | API endpoint | Event appended |
|---|---|---|
| edit a bullet | `POST /api/summary/:screen_id/edit` body `{bullet_id, section, old_text, new_text}` | `{type:"summary_bullet_revised", screen_id, bullet_id, section, old_text, new_text}` |
| confirm summary as-is | `POST /api/summary/:screen_id/confirm` body `{}` | `{type:"summary_confirmed", screen_id}` |
| submit final revisions | `POST /api/summary/:screen_id/submit` body `{note?}` | `{type:"summary_revised", screen_id, diff: [{bullet_id, section, old_text, new_text}, ...], note}` |

The `summary_revised` event carries the full bullet-level diff in one payload so Claude does not have to reassemble the per-edit stream. `status` in frontmatter flips to `confirmed` (no edits) or `revised` (any edits) via atomic rename, mirroring the `decision` flow. Bullet IDs are stable across edits — when a bullet is revised, the same `id` keeps its place in the section list with new `text`.

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
