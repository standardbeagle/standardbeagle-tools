---
name: dev-standards-handoff
description: "Compact current conversation into a handoff doc (OS temp dir) for a fresh agent to continue. 壓縮對話為交接文檔。 Use when: hand off session, end of session summary, pass work to another agent, prepare context for continuation, dartai session boundary"
disable-model-invocation: true
---

# Handoff

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the **OS temporary directory** (`$TMPDIR` → `/tmp` fallback, `%TEMP%` on Windows) — **not** the current workspace. Name it `<tmpdir>/handoff-<timestamp>.md` and print the absolute path.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.

## Contents

- **Goal / current focus** — what the next session should accomplish.
- **State** — what's done, what's in flight, what's blocked.
- **Suggested skills** — which skills the next agent should invoke (e.g. `dev-standards:diagnose`, `dartai:task`).
- **Pointers, not copies** — do NOT duplicate content already captured in other artifacts (PRDs, plans, ADRs, Dart tasks, commits, diffs). Reference them by path or URL instead.

## Code context

If the lci plugin is available, invoke [[context-handoff]] (`lci:context-handoff`) to save a code context manifest, and reference the manifest's path in the handoff doc so the next agent can restore code context instantly. Fall back to listing key file paths if lci is unavailable.

## Security

Redact any sensitive information — API keys, passwords, tokens, personally identifiable information — before writing the file.

## Presentation

After writing (and redacting) the doc, present it via `present:doc` to open it rendered in the browser. Fall back to printing the absolute path if the `present` plugin / a browser is unavailable.

> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Original: `skills/productivity/handoff`.
