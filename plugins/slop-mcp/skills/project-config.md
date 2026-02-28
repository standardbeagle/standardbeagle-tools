---
name: project-config
description: Manage per-project configuration stored in slop-mcp persistent memory. View, update, reset, or detect project settings used by commit-all and other orchestrator skills.
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__run_slop", "mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Project Configuration Memory

Manages the `project-config` memory bank in slop-mcp. This bank stores per-project settings that orchestrator skills (commit-all, pr-all, etc.) use to dispatch agents with the right context.

## When to Use

- View current project config
- Update a specific config value
- Reset config to force re-detection on next run
- Manually set config that can't be auto-detected (Dart board, custom commands)

## Memory Bank: `project-config`

### Schema

| Key | Type | Example | Description |
|-----|------|---------|-------------|
| `test-framework` | string | `"vitest"` | Detected test framework |
| `test-command` | string | `"npm test"` | Command to run tests |
| `linter` | string | `"eslint"` | Detected linter |
| `lint-command` | string | `"npm run lint"` | Command to run linter |
| `formatter` | string | `"prettier"` | Detected formatter |
| `format-command` | string | `"npm run format"` | Command to run formatter |
| `doc-patterns` | string | `"CHANGELOG.md,README.md,jsdoc"` | Comma-separated doc artifacts |
| `dart-board` | string | `"my-project"` | Dart dartboard name (or "none") |
| `commit-style` | string | `"conventional"` | Commit message convention |
| `config-hash` | string | `"abc123"` | Hash of config files for staleness |
| `detected-at` | string | `"2026-02-28T10:00:00Z"` | When config was last detected |

## Operations

### View All Config

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script:
  keys = mem_keys("project-config")
  results = []
  for key in keys:
    val = mem_load("project-config", key)
    results = results + [key + ": " + to_string(val)]
  emit(join(results, "\n"))
```

### View Single Key

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script: emit(mem_load("project-config", "test-framework", "not set"))
```

### Set a Value

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script: mem_save("project-config", "test-framework", "vitest")
```

### Delete a Key

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script: mem_delete("project-config", "test-framework")
```

### Reset All Config

Forces re-detection on next orchestrator run:

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script:
  keys = mem_keys("project-config")
  for key in keys:
    mem_delete("project-config", key)
  emit("Config cleared. Will re-detect on next run.")
```

### Bulk Set (First Run)

After auto-detection confirms values:

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script:
  mem_save("project-config", "test-framework", "vitest")
  mem_save("project-config", "test-command", "npm test")
  mem_save("project-config", "linter", "eslint")
  mem_save("project-config", "lint-command", "npm run lint")
  mem_save("project-config", "formatter", "prettier")
  mem_save("project-config", "format-command", "npx prettier --write .")
  mem_save("project-config", "doc-patterns", "CHANGELOG.md,README.md,jsdoc")
  mem_save("project-config", "dart-board", "none")
  mem_save("project-config", "commit-style", "conventional")
  mem_save("project-config", "detected-at", "2026-02-28T10:00:00Z")
  emit("Config saved.")
```

## Staleness Detection

Orchestrators should check `config-hash` on each run:

1. Hash the contents of config files (package.json, pyproject.toml, etc.)
2. Compare with stored `config-hash`
3. If different: re-detect and confirm with user
4. If same: use cached config

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script:
  hash = mem_load("project-config", "config-hash", "none")
  emit(hash)
```

## Integration with Orchestrators

Orchestrator skills load config as their first step:

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

If result is `NO_CONFIG`, the orchestrator dispatches the `context-gatherer` agent with instructions to detect and confirm config.
