# Plugin Tests — `/dartai:start` Harness

Headless harness for exercising the `/dartai:start` skill (and other commands)
via `claude -p`. The goal: catch regressions in the loop driver's *control
flow* — pre-flight checks, fallback paths, identity resolution, claim protocol
— without needing an interactive session, real Dart workspace, or live
multi-runner.

## Layers

```
tests/
├── run-start-tests.sh           # Top-level driver
├── lib/
│   └── claude-probe.sh          # claude -p invocation helper (bare, plugin-dir)
├── probes/
│   ├── structure.sh             # Pure shell: JSON/YAML lint, section-ref resolve
│   ├── branches.sh              # claude -p: enumerate decision branches
│   ├── fallback-no-agent.sh     # claude -p with Agent tool disabled
│   └── identity.sh              # claude -p: resolve runner_instance_id + agent_id from env
└── fixtures/
    ├── empty-workspace/         # Hermetic CWD for probes (no .dartai/, no git)
    └── canned-locks.json        # Sample .dartai-locks.json for claim-conflict tests
```

## Probe Strategy

Each probe is **read-only analysis** of the skill body — no real Dart calls,
no git pushes, no subagent spawns. The agent is told "you have the skill
loaded; describe what you would do" and emits structured JSON. Cheap, fast,
deterministic.

| Probe | What it verifies | Calls Claude API? |
|---|---|---|
| `structure` | Frontmatter, internal `§N.M` refs all resolve, fenced YAML/JSON valid | No (pure shell) |
| `branches` | Agent can enumerate every decision point in the skill | Yes, ~1 call |
| `fallback-no-agent` | Without `Agent` tool, agent picks §5.3.1 inline-delegation | Yes, ~1 call |
| `identity` | Agent computes `runner_instance_id` + `agent_id` from canned env | Yes, ~1 call |

## Usage

```bash
# Run all
tests/run-start-tests.sh

# Single probe
tests/run-start-tests.sh structure
tests/run-start-tests.sh fallback

# Verbose (dump claude -p stream-json)
VERBOSE=1 tests/run-start-tests.sh fallback
```

## Why `--bare` + `--plugin-dir`

- `--bare` skips hooks, auto-memory, CLAUDE.md auto-discovery → hermetic
- `--plugin-dir ./plugins/dartai` loads only the plugin under test
- `--tools "..."` controls which built-in tools the agent sees
- `--output-format json` emits one final JSON record per call

The harness asserts on the **final assistant text** parsed as JSON. Probe
prompts ask the model to emit a strict JSON schema; jq validates.

## Cost Cap

Each probe uses `--max-budget-usd 0.10`. Total run < $0.50.

## Adding a Probe

1. Write `tests/probes/<name>.sh` — bash, exits 0/1.
2. Use `lib/claude-probe.sh` helper for invocations.
3. Register in `run-start-tests.sh` `PROBES` array.
4. Document in this table.

## Limitations

- Does NOT test real subagent dispatch (would require live API + cost).
- Does NOT test git CAS race (would need two parallel sessions; future work).
- Does NOT test Dart MCP integration (slop-mcp not registered in `--bare`).

These need a separate **live integration suite** — out of scope here.
