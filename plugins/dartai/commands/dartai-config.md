---
name: dartai-config
description: "Configure dartai settings for the current project. 配置當前項目的dartai設置。 Use when: configure dartai, set default dartboard, setup quality pipeline settings, configure runner identity, dartai project setup"
---

# Configure DartAI

設置dartai插件的項目特定配置。

## Process

### 1. Check Current Config

Look for `.dartai/config.local.md`:
```
Use Read tool to check if config exists
```

### 2. Interactive Configuration

Guide user through settings:

#### Default Dartboard

First fetch available dartboards:
```
Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
  mcp_name: "dart-query"
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

#### Runner Identity

Auto-detect runner identity for multi-runner concurrency:

1. Run `git config user.email` to get local email
2. Fetch Dart assignees: `get_config(include: ["assignees"])`
3. Match email against assignee list to find `dart_id`
4. If match found: store `runner_email` + `runner_dart_id`
5. If no match: warn user, proceed without claiming (graceful degradation)

### 3. Write Configuration

Create `.dartai/config.local.md` with YAML frontmatter:

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

# Runner Identity (for multi-runner concurrency)
runner_email: null       # auto-detected from git config user.email
runner_dart_id: null     # Dart assignee dart_id matching runner_email

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

確保`.dartai/config.local.md`在`.gitignore`中：
```
.dartai/*.local.md
```

## Usage

```
/dartai:dartai-config
```

## Configuration File Location

配置存儲於：`.dartai/config.local.md`

此文件為本地文件，不應提交（添加至.gitignore）。
