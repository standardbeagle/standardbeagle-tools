---
title: dartai - Dart Task Management Plugin for Claude Code
description: Integrate Claude Code with Dart task management. Execute tasks, track progress, and manage dartboards with adversarial quality verification.
keywords: [Claude Code Dart, task management, Dart integration, project management, task tracking, dartboards]
sidebar_position: 6
---

# dartai - Dart Task Management

**dartai** integrates Claude Code with Dart task management, enabling task execution, progress tracking, and dartboard management with adversarial quality verification.

## Why dartai?

:::tip Seamless Dart Integration
Execute Dart tasks directly from Claude Code with automatic quality verification and documentation updates.
:::

### Key Features

- **📋 Task Execution**: Execute Dart tasks through quality pipeline
- **📊 Progress Tracking**: Monitor task status and dartboard activity
- **🔄 Quality Verification**: Adversarial verification of implementations
- **📝 Documentation Updates**: Automatic doc updates after task completion

## Installation

```bash
# Install from marketplace
claude mcp add-dir https://github.com/standardbeagle/standardbeagle-tools
claude mcp add dartai --source ./plugins/dartai
```

## Prerequisites

- **Dart MCP Server**: Configure dart-query MCP server
- **Dart API Token**: Set up authentication

### Setup

```bash
# Set up Dart MCP with SLOP
/setup-dart

# Configure project roles
/setup-roles
```

## Available Skills

| Skill | Description |
|-------|-------------|
| `setup-dart` | Configure dart-query MCP with SLOP |
| `setup-roles` | Configure project-specific role rules |
| `dartai-start` | Start Ralph Wiggum loop on dartboard |
| `dartai-task` | Execute single task through quality pipeline |
| `loop-status` | Show current loop status |
| `dartai-sync` | Sync local work with Dart statuses |
| `verify` | Run adversarial verification loop |
| `dartai-config` | Configure dartai settings |

## Usage Examples

### Start Task Execution Loop

```bash
# Start loop on a dartboard
/dartai-start --dartboard "Sprint 1"

# Check status
/loop-status
```

### Execute Single Task

```bash
# Execute a specific task
/dartai-task --task-id "TASK-123"

# With plan adjustment
/dartai-task --task-id "TASK-123" --adjust-plan
```

### Sync with Dart

```bash
# Sync local changes to Dart
/dartai-sync

# Sync specific task
/dartai-sync --task-id "TASK-123"
```

### Run Verification

```bash
# Run adversarial verification
/verify --type implementation

# Verify tests
/verify --type tests

# Verify security
/verify --type security

# Verify refactoring
/verify --type refactoring
```

## Agents

### task-executor
Execute Dart tasks through the adversarial quality pipeline with plan adjustment at each phase.

### quality-verifier
Adversarial verification agent that challenges implementations, tests, and refactorings.

### doc-updater
Update documentation after task completion including CHANGELOG, README, and Dart comments.

## Hooks

dartai includes Python-based hooks for Dart integration:

| Hook | Script | Purpose |
|------|--------|---------|
| SessionStart | `session_init.py` | Initialize session |
| PostToolUse (Task) | `track_subagent_spawn.py` | Track subagent spawns |
| PostToolUse (update_task) | `on_task_update.py` | Handle task updates |
| PostToolUse (list_tasks) | `track_dartboard.py` | Track dartboard activity |
| PostToolUse (Write/Edit) | `track_changes.py` | Track file changes |
| SubagentStop (task-executor) | `track_iteration.py` | Track task iteration |
| SubagentStop (quality-verifier) | `track_verification.py` | Track verification |
| SubagentStop (doc-updater) | `track_docs.py` | Track doc updates |
| Stop | `session_cleanup.py` | Cleanup session |

## Quality Pipeline

### Phase 1: Task Execution
1. Load task from Dart
2. Analyze requirements
3. Implement solution
4. Write tests

### Phase 2: Quality Verification
1. Independent agent reviews implementation
2. Tests verified for coverage
3. Edge cases identified

### Phase 3: Documentation
1. README updated
2. CHANGELOG updated
3. Inline documentation added

### Phase 4: Sync
1. Task status updated in Dart
2. Comments added for context
3. Next task identified

## Configuration

### Project Settings

Configure in `.claude/dartai-config.yaml`:

```yaml
dartboard: "Sprint 1"
auto_sync: true
verification_level: "thorough"
doc_update: true

roles:
  - name: backend-developer
    triggers:
      - file_pattern: "src/api/**"
    actions:
      - run_tests: true
      - security_audit: true
```

### Environment Variables

```bash
# Dart API token
export DART_API_TOKEN="your-token"

# Default dartboard
export DARTAI_DEFAULT_DARTBOARD="Sprint 1"
```

## MCP Integration

dartai uses the dart-query MCP server:

```json
{
  "mcpServers": {
    "dart-query": {
      "command": "npx",
      "args": ["-y", "dart-query-mcp@latest"]
    }
  }
}
```

## Troubleshooting

### Dart Connection Failed

```bash
# Verify API token
echo $DART_API_TOKEN

# Test connection
dart-query test-connection
```

### Tasks Not Syncing

1. Check `auto_sync` is enabled
2. Verify dartboard name matches
3. Ensure MCP server is running

### Verification Failing

```bash
# Run verification with verbose output
/verify --type implementation --verbose
```

## Related Resources

- [workflow Plugin](./workflow) - General task automation
- [SLOP MCP](./slop-mcp) - MCP server management
- [Dart Documentation](https://dart.dev)

## Version History

| Version | Changes |
|---------|---------|
| 0.1.0 | Initial release with quality pipeline |
