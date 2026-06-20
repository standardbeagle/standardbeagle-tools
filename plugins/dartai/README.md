# DartAI Plugin

Ralph Wiggum adversarial cooperation loop for Dart task automation. Commands, skills, agents, and hooks for running context-isolated task execution on a Dart dartboard.

## Components

- **Commands** — `/dartai:start`, `/dartai:task`, `/dartai:sync`, `/dartai:loop-status`, `/dartai:verify`, `/dartai:setup-dart`, `/dartai:setup-roles`, `/dartai:dartai-config`
- **Hooks** — SessionStart/SessionEnd for loop state tracking, SubagentStop for autonomous continuation

### Skills

Loop & execution:

- `start` — start the Ralph Wiggum adversarial cooperation loop on a dartboard with plan adjustment
- `task` — execute a single task through the quality pipeline
- `loop-status` — show current loop status and task progress
- `verify` — run adversarial verification on a target directory or file
- `task-execution` — task execution workflow and quality pipeline reference
- `adversarial-quality-loop` — implementer/verifier loop for code-quality verification with per-phase plan adjustment

Planning:

- `simple-planning` — create minimal, focused task plans under adversarial discipline (no over-engineering)
- `adversarial-planning-loop` — adversarial loop validating plan completeness incl. research tasks, preventing over-design

Reviewers (forked-context reviewer skills):

- `code-quality-reviewer` — forked-context coherence/bloat/completeness/duplication/cleanup review
- `qa-reviewer` — forked-context testing-pyramid + assertion/edge-case/TDD review
- `post-task-reviewer` — forked-context deep review: OWASP security, deep code analysis, PM/docs accuracy, replan
- `verdict-schema` — canonical verdict-only return schema for reviewer subagents
- `code-quality` — thin wrapper routing review-for-plan-updates proposals into Dart tasks

Reporting & history:

- `report` — multi-page HTML status dashboard from Dart + Claude/opencode/kimi logs
- `review` — adversarial audit surfacing inefficiencies and process gaps with concrete amendments
- `sessions` — search + synthesize prior agent session history (Claude Code primary; Codex/Cursor secondary)

dart-query mastery:

- `dart-query-reference` — complete dart-query MCP tool reference (24 tools, params, usage)
- `task-filtering` — list_tasks filters, search_tasks queries, detail levels, pagination, query composition
- `task-relationships` — subtasks, blockers, blocking, duplicates, related tasks (full-replacement semantics)
- `batch-operations` — DartQL selectors, batch update/delete, CSV import, safety protocols
- `workspace-docs` — documents, config, dartboards, folders, comments, time tracking, attachments, task movement

Setup, config & docs:

- `setup-dart` — set up the dart-query MCP server (SLOP-managed) and configure the Dart access token
- `dartai-config` — configure dartai settings for the current project
- `setup-roles` — configure project-specific DartAI role rules
- `sync` — synchronize local work with Dart task statuses and comments
- `doc-templates` — documentation templates for project docs and Dart comments
- `testing-strategy` — three-tier testing strategy (e2e / integration / unit)
- `hook-doctor` — diagnose and validate plugin hooks (scripts exist, permissions, execution)

### Agents

- `task-executor` — execute a Dart task through the adversarial quality pipeline with per-phase plan adjustment
- `code-quality-reviewer` — fast adversarial gate: coherence, best practices, bloat, completeness, duplication, cleanup
- `qa-reviewer` — fast adversarial gate: test quality, assertion strength, edge cases, TDD compliance, traceability, testability
- `post-task-reviewer` — deep sequential review after gates pass: OWASP audit, in-depth code analysis, PM/docs review, replan recommendations
- `doc-updater` — update docs after task completion (CHANGELOG, README, Dart comments)
- `session-historian` — synthesize findings from prior coding-agent sessions; driven by the `sessions` pipeline, not direct dispatch

## Reporting & Review

Two skills consume the same data layer (Dart tasks + agent session logs) with different lenses:

- `Skill: dartai:report` — neutral status dashboard. Multi-page HTML at `./reports/dartai/<timestamp>/`. Pages: index, completed, outstanding, replans, timeline, agents, sessions. Every row traceable to dart_id or log path.
- `Skill: dartai:review` — adversarial audit. Markdown with grounded findings (rework, loops, abandoned approaches, slow turns, doc/skill/planning gaps) mapped to concrete amendment recommendations. Optional `create_dart_tasks=true` files them as Dart tasks.

Run `report` first for visibility, then `review` when patterns warrant process change.

See `commands/start.md` for the full adversarial loop specification.

## Agent identity configuration

The loop supports **three layers of concurrency disambiguation** when multiple runners operate on the same Dart dartboard:

| Layer | Field | Source | Purpose |
|---|---|---|---|
| Machine/PID | `runner_instance_id` | `$(hostname)-$$` | Prevents same-machine PID collision |
| Git identity | `runner_email` | `git config user.email` | Human-visible attribution in commits/Dart UI |
| Agent persona | `agent_id` | env `CLAUDE_AGENT_ID` (preferred), fallback `$(hostname)-$$` | Distinguishes N agents sharing one Dart user |

### Why agent_id matters

Dart UI tracks human assignees, not AI agent sessions. When you run several agent personas (e.g. a Ralph loop + a Kibeth planner + a background risk-pipeline auditor) under one Dart user + one git email, the UI cannot tell which agent holds which claim. `agent_id` adds that layer without requiring Dart workspace admin changes.

### Where to set CLAUDE_AGENT_ID

Pick whichever integrates with your launch mechanism:

**Shell rc (per-user default)**

```bash
# ~/.bashrc or ~/.zshrc
export CLAUDE_AGENT_ID="ralph-main"
```

**Per-project launcher script**

```bash
#!/usr/bin/env bash
# launch-agent.sh
export CLAUDE_AGENT_ID="ralph-risk-pipeline-v1"
exec claude "$@"
```

**CI / automation env**

```yaml
# GitHub Actions example
env:
  CLAUDE_AGENT_ID: "ci-nightly-loop-${{ github.run_id }}"
```

**One-off invocation**

```bash
CLAUDE_AGENT_ID="debug-kibeth" claude /dartai:start Personal/myboard
```

### Naming conventions

- Use lowercase kebab-case (`ralph-main`, not `Ralph_Main`) — Dart tags require lowercase kebab
- Include a version or purpose suffix when the same agent persona may run in multiple configurations (`ralph-risk-pipeline-v1`, `ralph-design-tokens-v2`)
- Stable across sessions: the same agent persona should use the same `CLAUDE_AGENT_ID` across restarts so audit aggregation by `agent_id` remains meaningful

### Fallback behavior

When `CLAUDE_AGENT_ID` is **unset**:

1. The loop falls back to `$(hostname)-$(pid)` for `agent_id`
2. Claim entries in `.dartai-locks.json` are still written with all 6 fields
3. `agent:<id>` tag on Dart tasks uses the fallback value (lowercase-kebab)
4. Concurrency still works correctly at machine/PID level — `agent_id` layer simply becomes redundant with `runner_instance_id`

### Claim entry shape

Each claim in `.dartai-locks.json` now carries 6 fields (3 legacy + 3 new):

```json
{
  "claims": {
    "<task-id>": {
      "runner_instance_id": "hostname-pid",
      "runner_email": "user@example.com",
      "claimed_at": "2026-04-21T13:35:00Z",
      "agent_id": "ralph-main",
      "parent_loop_id": "PHP9BnSF9Ad0",
      "purpose": "process To-do queue on standardbeagle-tools"
    }
  }
}
```

### Backward compatibility

Old claim entries containing only the first 3 fields parse without crash. Readers treat missing fields as:

```python
agent_id       = claim.get("agent_id")       or claim["runner_instance_id"]
parent_loop_id = claim.get("parent_loop_id") or None
purpose        = claim.get("purpose")        or ""
```

No migration is required for existing `.dartai-locks.json` files. New entries written by updated runners include all 6 fields; old entries remain valid.

### Persistence locations

When the loop resolves `agent_id` at startup (start.md §2.5), it persists to:

- `.dartai/config.local.md` frontmatter — `agent_id: "<value>"` alongside `runner_instance_id`
- `.dartai/loop-state.json` top-level — `agent_id` field for hook/audit readers

### Cross-references

- `commands/start.md` §2.5 — runner identity resolution (reads `CLAUDE_AGENT_ID`)
- `commands/start.md` §5.1.5 — claim acquisition (writes 6-field entry to `.dartai-locks.json`)
- `commands/start.md` §5.2 — Dart task tagging (adds `agent:<id>`)
- `plugins/workflow/skills/loop-orchestration/SKILL.md` "Claim Schema" — orchestrator-level schema docs
