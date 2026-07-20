---
name: present-mini-ide
description: "Open the public core mini-IDE/editor for interactive review: cards, strategy cards, summary confirmation, demos, decisions, and annotate-artifact screens. Use when: a skill or agent needs browser-based editing, card sorting, decision review, artifact annotation, layout-gated demos, or HITL feedback loops. Skip: read-only report output → present:html-report; reopening an existing doc → present:doc"
disable-model-invocation: true
---

# Present: Mini-IDE / Interactive Editor

Use this public core skill when another skill or agent needs a local browser surface for human-in-the-loop review or editing. It is a shared UI primitive, not an ideation-specific mode.

The runtime renders markdown + YAML screen files from a session directory, records user actions in `events.jsonl`, and lets the caller revise or continue from structured events instead of parsing prose feedback.

## Best fits

- Card-sort ideas, backlog items, risks, or requirements.
- Compare bundled strategies, rank them, then converge on one.
- Confirm or revise inferred goals, constraints, system shape, risks, and alternatives.
- Show sandboxed demos with layout auditing before user approval.
- Annotate an HTML artifact/report/diff/diagram by element, text range, or Mermaid node.
- Collect private file edits without echoing content through the public event stream.

## Screen kinds

See [docs/screen-format.md](docs/screen-format.md) for the full schema.

- `question` — structured radio / multi / text / code / private file-edit inputs.
- `cards` — free-form card sort and clustering.
- `strategy-card` — bundled strategy options with rank/select convergence.
- `summary-confirm` — editable inferred summary with provenance tags.
- `decision` — proposed / approved / revised / rejected decisions.
- `demo` — sandboxed iframe demos.
- `annotate-artifact` — mark up rendered HTML artifacts.
- `layout-gate` — runtime layout audit for demos/artifacts.

## Starting the mini-IDE

From the `present` plugin root, start the server with a session directory:

```bash
bun run skills/mini-ide/packages/server/src/cli.ts start \
  --session-dir /path/to/project/.present/mini-ide/<session> \
  --doc-root /path/to/project/docs \
  --doc-root /path/to/project/specs
```

The server writes `$SESSION_DIR/server-info` and prints one JSON line with `{url, port, pid}`. Give the user the URL when they need to open the browser UI.

## Reading events

After starting the server, monitor `$SESSION_DIR/events.jsonl` once for that session. Each non-empty JSON line is a user action the caller can consume.

```bash
tail -n 0 -F "$SESSION_DIR/events.jsonl"
```

Use the host's native monitor/process tools when available. Do not poll the file in a tight loop.

## Relationship to `present:html-report`

Use `present:html-report` for read-only browser reports: ranked findings, dashboards, decision trees, implementation plans, and review summaries.

Use this mini-IDE when the user should actively edit, annotate, sort, select, or approve something.

A common flow is:

1. Generate a read-only report with `present:html-report`.
2. If feedback is needed, load the same artifact into `annotate-artifact` here.
3. Revise the report from structured annotation events.

## Privacy

Inputs marked `private: true` and all `file-edit` inputs use the private save path. The Bun server writes the target file and emits only metadata plus a digest. The public `events.jsonl` stream must not contain the secret value.

This does not prevent the caller from reading the target file through separate file tools. For real secrets, keep the file ignored and do not ask an agent to read it.
