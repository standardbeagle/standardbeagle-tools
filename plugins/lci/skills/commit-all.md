---
name: commit-all
description: Orchestrate full WIP preparation and auto-commit by loading project config from memory and dispatching dedicated agents
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__run_slop", "mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Commit All

Thin orchestrator that loads project config from slop-mcp memory, dispatches dedicated agents for each concern, and auto-commits the result.

## When to Use

- You have uncommitted work ready to wrap up
- You want a single command that tests, documents, and commits
- Before ending a work session to ensure nothing is left loose

## IMPORTANT: This is a rigid workflow. Follow each phase in order. Do not skip phases.

---

## Phase 1: Load Project Config

Load config from slop-mcp persistent memory:

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script:
  keys = mem_keys("project-config")
  if len(keys) == 0:
    emit("NO_CONFIG")
  else:
    results = []
    for key in keys:
      val = mem_load("project-config", key)
      results = results + [key + "=" + to_string(val)]
    emit(join(results, "\n"))
```

**If `NO_CONFIG`**: The context-gatherer agent will handle detection and confirmation (see Phase 2).

**If config returned**: Check staleness — compare stored `config-hash` against current config files (package.json, pyproject.toml, etc.). If stale, pass `re-detect: true` to context-gatherer.

---

## Phase 2: Dispatch Context Gatherer (foreground)

```
Agent(
  subagent_type: "lci:context-gatherer",
  description: "Gather WIP context",
  prompt: "Project config:\n<config from Phase 1, or 'NO_CONFIG — detect and confirm'>\n\nGather full change summary for commit preparation."
)
```

The context-gatherer returns a structured **Change Summary** with: branch, scope, what changed, why, task references, quality baseline, and project config.

Save the Change Summary — it's the input for all subsequent agents.

---

## Phase 3: Dispatch Test Fixer (foreground)

Run first — code must be correct before other agents process it.

```
Agent(
  subagent_type: "lci:test-fixer",
  description: "Fix and add tests",
  prompt: "Project config:\n<config>\n\nChange summary:\n<summary from Phase 2>\n\nRun all tests, fix all failures, add missing coverage."
)
```

**If test-fixer reports failures it could not resolve**: STOP. Report to user and do not proceed.

---

## Phase 4: Dispatch Parallel Agents (background)

Launch all three in a **single message** with multiple Agent tool calls:

```
Agent(
  subagent_type: "lci:code-quality",
  description: "Code quality review",
  run_in_background: true,
  prompt: "Project config:\n<config>\n\nChange summary:\n<summary from Phase 2>"
)

Agent(
  subagent_type: "lci:doc-updater",
  description: "Update internal docs",
  run_in_background: true,
  prompt: "Project config:\n<config>\n\nChange summary:\n<summary from Phase 2>"
)

Agent(
  subagent_type: "lci:marketing-seo",
  description: "Update public docs",
  run_in_background: true,
  prompt: "Project config:\n<config>\n\nChange summary:\n<summary from Phase 2>"
)
```

Wait for all three to complete.

---

## Phase 5: Reconcile & Verify

After all agents complete:

1. **Check for conflicts**: Multiple agents may have edited the same files. Review and merge.
2. **Re-run tests**: Quality and doc agents may have changed code.
   ```bash
   <test-command from config>
   ```
3. **If tests fail**: Fix immediately — do not proceed with broken tests.

---

## Phase 6: Auto-Commit

### 6.1 Final Status
```bash
git status
git diff --stat
```

### 6.2 Stage Files

Stage all modified files EXCEPT:
- `.env` files and credentials/secrets
- Build artifacts (`dist/`, `build/`, `node_modules/`, `__pycache__/`)
- Temporary files (`.tmp`, `.log`, `.swp`)

Use specific file names, not `git add -A`.

### 6.3 Generate Commit Message

Using the Change Summary from Phase 2, create a conventional commit:
- **Type**: `feat`/`fix`/`refactor`/`docs`/`test`/`chore` based on primary change
- **Scope**: From branch name or task context
- **Subject**: Under 72 chars, what and why
- **Body**: Bullet points of key changes
- **Footer**: Task/issue references if available

### 6.4 Commit

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

- <change 1>
- <change 2>

Refs: <task IDs if available>
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 6.5 Report Summary

```
## Commit Complete

**Commit**: <hash> <subject line>
**Branch**: <branch name>
**Files**: <count> files changed

### Agents Dispatched
- context-gatherer: <status>
- test-fixer: <tests run / fixed / added>
- code-quality: <findings resolved / lint fixes>
- doc-updater: <docs updated>
- marketing-seo: <public docs updated / no changes needed>
```
