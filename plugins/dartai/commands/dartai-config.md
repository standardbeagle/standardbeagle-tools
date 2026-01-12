---
name: dartai-config
description: Configure dartai settings for the current project
---

# Configure DartAI

Set up project-specific configuration for the dartai plugin.

## Process

### 1. Check Current Config

Look for `.claude/dartai.local.md`:
```
Use Read tool to check if config exists
```

### 2. Interactive Configuration

Guide user through settings:

#### Default Dartboard

First fetch available dartboards:
```
Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
  mcp_name: "dart"
  tool_name: "get_config"
  parameters: {}
```

Then present options:
```
Available dartboards:
1. Personal/standardbeagle-tools
2. General/SB Tasks
3. [other dartboards from Dart MCP]

Select default dartboard (1-N):
```

#### Quality Pipeline Settings
```
Configure quality checks:
- Run linting? (yes/no) [default: yes]
- Run tests? (yes/no) [default: yes]
- LCI evaluation? (yes/no) [default: yes]
- Deprecated cleanup? (yes/no) [default: yes]
- Auto-refactor? (yes/no) [default: no]
```

#### Documentation Settings
```
Documentation updates:
- Update CHANGELOG? (yes/no) [default: yes]
- Update README? (yes/no) [default: no]
- Add Dart comments? (yes/no) [default: yes]
```

#### Loop Settings
```
Ralph Wiggum loop settings:
- Max consecutive tasks: [default: unlimited]
- Pause between tasks: (yes/no) [default: no]
- Auto-commit changes: (yes/no) [default: no]
```

### 3. Write Configuration

Create `.claude/dartai.local.md` with YAML frontmatter:

```markdown
---
# Dartboard Memory (auto-managed)
default_dartboard: "Personal/standardbeagle-tools"
last_dartboard: null
last_dartboard_used_at: null

# Quality Pipeline
linting: true
testing: true
lci_evaluation: true
deprecated_cleanup: true
auto_refactor: false

# Documentation
changelog: true
readme: false
dart_comments: true

# Loop Settings
max_tasks: null  # null = unlimited
pause_between: false
auto_commit: false

# Custom Commands
lint_command: "npm run lint"
test_command: "npm test"
build_command: "npm run build"
---

# DartAI Project Notes

Add any project-specific notes here. This content is preserved when settings are updated.
```

**Important:** The `last_dartboard` and `last_dartboard_used_at` fields are automatically updated when you use Dart operations. The `default_dartboard` is manually set and used as fallback when no last_dartboard is available.

### 4. Add to .gitignore

Ensure `.claude/dartai.local.md` is in `.gitignore`:
```
.claude/*.local.md
```

## Usage

```
/dartai:dartai-config
```

## Configuration File Location

Config is stored at: `.claude/dartai.local.md`

This file is local and should not be committed (add to .gitignore).
