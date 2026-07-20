# Present Mini-IDE

Public core browser editor for human-in-the-loop skill and agent workflows.

It renders markdown + YAML screens from a session directory, records user actions in `events.jsonl`, and lets callers drive structured review loops without inventing one-off UIs.

## Quickstart

```bash
bun install
bun run build
bun run --cwd packages/server dev --session-dir /tmp/my-session
```
