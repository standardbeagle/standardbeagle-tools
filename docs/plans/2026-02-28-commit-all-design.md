# commit-all Skill Design

## Purpose

A "wrap up and commit" orchestrator skill that loads project config from slop-mcp memory, dispatches dedicated agents for each concern, and auto-commits the result.

## Architecture

Three-layer design separating behavior, configuration, and orchestration:

```
                    ┌─────────────────┐
                    │  Orchestrator   │
                    │  (commit-all)   │
                    └────────┬────────┘
                             │ loads config
                    ┌────────▼────────┐
                    │  slop-mcp mem   │
                    │ "project-config"│
                    └────────┬────────┘
                             │ dispatches with context
        ┌────────────────────┼────────────────────┐
        ▼              ▼           ▼              ▼
  ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌───────────┐
  │  context-  │ │test-fixer │ │code-qual │ │ doc-update│
  │  gatherer  │ │  (agent)  │ │ (agent)  │ │  (agent)  │
  └───────────┘ └───────────┘ └──────────┘ └───────────┘
                                                  │
                                           ┌──────────┐
                                           │marketing │
                                           │   seo    │
                                           └──────────┘
```

### Layer 1: Agents (HOW)

Reusable agent definitions in `plugins/lci/agents/` and `plugins/tools/agents/`:

| Agent | Purpose | Reused By |
|-------|---------|-----------|
| `context-gatherer` | Git state, tasks, plans, LCI baseline, config detection | commit-all, pr-all, debug |
| `test-fixer` | Run tests, fix ALL failures, add missing coverage | commit-all, pr-all |
| `code-quality` | LCI analysis, lint/format, debug artifact removal | commit-all, pr-all |
| `doc-updater` | CHANGELOG, inline docs, plan docs (internal) | commit-all, pr-all |
| `marketing-seo` | README, package metadata, SEO optimization (public) | commit-all, pr-all |

Each agent receives project config + change summary via its `prompt` parameter. Agents don't know which orchestrator dispatched them.

### Layer 2: Memory (WHAT)

Per-project config in slop-mcp persistent memory bank `project-config`:

| Key | Example | Description |
|-----|---------|-------------|
| `test-framework` | `"vitest"` | Detected test framework |
| `test-command` | `"npm test"` | Command to run tests |
| `linter` | `"eslint"` | Detected linter |
| `lint-command` | `"npm run lint"` | Command to run linter |
| `formatter` | `"prettier"` | Detected formatter |
| `format-command` | `"npx prettier --write ."` | Formatter command |
| `doc-patterns` | `"CHANGELOG.md,README.md,jsdoc"` | Doc artifacts present |
| `dart-board` | `"my-project"` | Dart board name or "none" |
| `commit-style` | `"conventional"` | Commit message convention |
| `config-hash` | `"abc123"` | Staleness check hash |
| `detected-at` | `"2026-02-28T..."` | Detection timestamp |

Populated on first run via detect-and-confirm (auto-detect, show user, confirm/override). Reused on subsequent runs unless config files change.

### Layer 3: Orchestrator (WHEN + ORDER)

`commit-all.md` is a thin skill (~100 lines) that:

1. Loads config from memory
2. Dispatches `context-gatherer` (foreground)
3. Dispatches `test-fixer` (foreground, must pass)
4. Dispatches `code-quality` + `doc-updater` + `marketing-seo` (parallel, background)
5. Reconciles results, re-runs tests
6. Stages + generates conventional commit + commits

Future orchestrators compose from the same agents:
- **pr-all**: same agents + PR creation instead of commit
- **debug-start**: context-gatherer + reproduce-bug agent
- **review-prep**: same agents but read-only (report findings, don't fix)

## Design Decisions

### Why agents instead of embedded prompts?

The original design embedded ~200 lines of subagent prompts in the skill. This was:
- Not reusable across skills
- Hard to maintain (changes require updating multiple skill files)
- Monolithic (the skill knew too much about each concern)

Agents are the Claude Code plugin system's native abstraction for specialized subagents. Using them means:
- Any skill can dispatch `lci:test-fixer` without knowing how tests work
- Agent definitions can be improved independently
- New orchestrators compose from existing agents instantly

### Why slop-mcp memory instead of file-based config?

- Per-project without file clutter (no `.commit-all-config.json` in repos)
- Queryable via SLOP scripts
- Shared across all orchestrator skills
- Manageable via the `project-config` skill in slop-mcp plugin

### Why detect-and-confirm instead of silent detection?

- Users see exactly what was detected
- Catches misdetection before it causes problems
- Only happens once — cached for all subsequent runs
- Respects user knowledge of their own project

## Files

### Agents (identical in lci and tools)
- `plugins/lci/agents/context-gatherer.md`
- `plugins/lci/agents/test-fixer.md`
- `plugins/lci/agents/code-quality.md`
- `plugins/lci/agents/doc-updater.md`
- `plugins/lci/agents/marketing-seo.md`

### Orchestrator Skill (identical in lci and tools)
- `plugins/lci/skills/commit-all.md`

### Memory Management
- `plugins/slop-mcp/skills/project-config.md`

### Plugin Registrations
- `plugins/lci/.claude-plugin/plugin.json` — agents + skill registered
- `plugins/tools/.claude-plugin/plugin.json` — agents + skill registered
- `plugins/slop-mcp/.claude-plugin/plugin.json` — project-config skill registered
