# Adoption example: code review via annotate-artifact

The first adopter of the mark-up loop (see [`../feedback-loops.md`](../feedback-loops.md)).
A review skill renders the diff to HTML, emits one `annotate-artifact` screen, and
reads the annotation stream to revise. No new companion code is needed — the
runtime landed with the `annotate-artifact` / `layout-gate` kinds.

## 1. Render the diff and write the screen

The skill writes `$SESSION_DIR/screens/pr-review.md`:

```markdown
---
kind: annotate-artifact
id: pr-review
title: Review the diff — mark anything off
status: pending
artifact:
  type: srcdoc
  html: ./diff.html        # skill renders `git diff` to a self-contained HTML file
  css:  ./diff.css         # syntax-highlight + line-number styling
layout_audit: true         # catch a diff table that overflows before the user sees it
mode: annotate
actions:
  - {type: approve,          label: LGTM}
  - {type: request-changes,  label: Request changes, requires_note: true}
---

## Scope

`feat/auth` — 6 files, +182 / −40. Focus on the session-middleware collision
risk called out in the task.
```

`diff.html` marks each changed line with a stable anchor (e.g.
`<tr id="src/auth.ts-L42">`) so an element annotation's `selector` maps straight
back to a file and line.

## 2. User marks up the diff

In annotate mode the user clicks a changed line (element anchor), selects a token
(text anchor), or clicks a node in an embedded mermaid call-graph (mermaid
anchor). Each becomes an `artifact_annotation` event:

```json
{"type":"artifact_annotation","screen_id":"pr-review","anchor":"element",
 "selector":"#src\\/auth.ts-L42","tag":"tr","text_excerpt":"const s = req.session",
 "note":"this reuses the old session before the OAuth callback runs","seq":7,"ts":...}
```

If `layout_audit` fires first, the skill gets a `layout_findings` event with
`resolution: "fix-first"` and repairs the diff rendering before the user reviews.

## 3. Skill reads events and revises

The skill tails `events.jsonl` (via `Monitor`). On `artifact_changes_requested`:

```json
{"type":"artifact_changes_requested","screen_id":"pr-review",
 "note":"see inline notes","annotation_count":3}
```

it reads the 3 `artifact_annotation` entries (also mirrored in
`screens/pr-review.annotations.jsonl`), edits the code at each `selector`'s
file\:line, re-renders `diff.html`, and re-emits the screen. The loop closes on
`artifact_approved`.

## Why this beats prose review

Every note is anchored to a concrete `selector` + `text_excerpt`, so the skill
never guesses which hunk the user meant. The `annotation_count` on
`request-changes` tells it how much markup to expect before it starts editing.
