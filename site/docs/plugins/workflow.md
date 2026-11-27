---
title: workflow - Task Automation Plugin for Claude Code
description: Adversarial quality loops, task tracking, and process improvement suggestions for high-quality software development with Claude Code.
keywords: [Claude Code workflow, task automation, quality loops, adversarial testing, process improvement, development workflow]
sidebar_position: 5
---

# workflow - Task Automation

**workflow** provides adversarial quality loops, task tracking, and process improvement suggestions for high-quality software development.

## Why workflow?

:::tip Adversarial Quality Assurance
Every task goes through adversarial verification - security audits, quality checks, and documentation reviews happen automatically.
:::

### Key Features

- **🔄 Adversarial Loops**: Automatic quality verification cycles
- **📊 Task Tracking**: Monitor subagent spawns and completions
- **💡 Memory Suggestions**: Intelligent suggestions for preserving learnings
- **📈 Process Improvement**: Identify common oversights and suggest improvements

## Installation

```bash
# Install from marketplace
claude mcp add-dir https://github.com/standardbeagle/standardbeagle-tools
claude mcp add workflow --source ./plugins/workflow
```

## Available Skills

| Skill | Description |
|-------|-------------|
| `setup-workflow` | Configure project-specific workflow rules |
| `start-loop` | Start adversarial Ralph Wiggum loop |
| `stop-loop` | Stop running workflow loop |
| `loop-status` | Show current loop status |
| `add-task` | Add task to workflow list |
| `review-memories` | Manage workflow memories |

## Usage Examples

### Start Quality Loop

```bash
# Start adversarial loop for general tasks
/start-loop

# Check loop status
/loop-status
```

### Add Tasks

```bash
# Add a new task
/add-task "Implement user authentication"

# Track progress
/loop-status
```

### Review and Save Memories

```bash
# Review collected memories
/review-memories

# Before context compaction, suggestions appear automatically
```

## Adversarial Quality Pipeline

The workflow plugin runs tasks through multiple verification phases:

### Phase 1: Implementation
- Task executor implements the solution
- Tests are written (TDD encouraged)
- Code is reviewed

### Phase 2: Quality Verification
- Independent agent verifies implementation
- Checks against original requirements
- Identifies edge cases and issues

### Phase 3: Security Audit
- OWASP Top 10 vulnerability check
- Input validation review
- Authentication/authorization audit

### Phase 4: Documentation
- README updates
- API documentation
- Inline comments for complex logic

## Hooks

workflow includes comprehensive lifecycle hooks:

| Hook | Script | Purpose |
|------|--------|---------|
| SessionStart | `session-init.js` | Initialize workflow session |
| SubagentStop (task-executor) | `track-loop-iteration.js` | Track task completion |
| SubagentStop (quality-verifier) | `track-verification.js` | Track verification |
| SubagentStop (security-auditor) | `track-security-audit.js` | Track security audit |
| PostToolUse (Task) | `track-subagent-spawn.js` | Track subagent spawns |
| Stop | `session-cleanup.js` | Archive session |
| PreCompact | `suggest-memories.js` | Suggest memory preservation |
| PreCompact | `suggest-process-improvements.js` | Suggest improvements |

## Session Tracking

workflow tracks session metrics in `.claude/workflow-session.json`:

```json
{
  "session_id": "session-1234567890-abc123",
  "started_at": "2024-01-15T10:30:00Z",
  "workflow_version": "0.1.0",
  "subagent_spawns": 5,
  "subagent_completions": 4,
  "context_barriers_enforced": 4,
  "loops_started": 1,
  "tasks_completed": 3,
  "tasks_failed": 0,
  "verification_completions": 3,
  "security_audits": 2
}
```

## Memory Preservation

Before context compaction, workflow suggests memories to save:

### Memory Categories

1. **Workflow Patterns**: Effective strategies discovered
2. **Technical Decisions**: Architecture choices and rationale
3. **Code Patterns**: Naming conventions, file organization
4. **Verification Strategies**: What catches bugs effectively
5. **Lessons Learned**: What went wrong and how to prevent it

### Example Memory Suggestion

```yaml
title: "Auth tasks require rate limiting verification"
category: workflow_pattern
scope: project
content: |
  When implementing authentication endpoints, always include rate limiting
  in the verification phase.

  Checklist:
  - [ ] Rate limit login endpoint (5 attempts/min/IP)
  - [ ] Rate limit password reset (3 attempts/hour/email)
  - [ ] Test with concurrent requests
  - [ ] Verify 429 responses with Retry-After header
tags: [authentication, security, rate-limiting]
confidence: high
```

## Process Improvement Suggestions

workflow identifies common oversights:

1. **Testing Coverage**: Edge cases, mutation testing, TDD
2. **Documentation**: README, API docs, examples
3. **Root Cause Analysis**: Fix causes, not symptoms
4. **Security**: Input validation, OWASP checks
5. **Error Handling**: Helpful messages, logging
6. **Performance**: N+1 queries, caching
7. **Backward Compatibility**: Breaking changes, migration paths
8. **Code Review**: Adversarial, thorough
9. **Dependencies**: Security vulnerabilities, licenses
10. **Deployment**: Rollback plans, monitoring

## Agents

### task-executor
Executes workflow tasks with clean context and adversarial verification.

### quality-verifier
Independent adversarial verification of implementations.

### security-auditor
OWASP-focused security audit of code changes.

## Configuration

### Project Rules

Configure project-specific rules in `.claude/workflow-rules.yaml`:

```yaml
roles:
  - name: security-reviewer
    triggers:
      - file_pattern: "src/auth/**"
      - file_pattern: "src/api/**"
    actions:
      - run_security_audit: true

  - name: test-coverage-checker
    triggers:
      - file_pattern: "src/**/*.ts"
    actions:
      - require_tests: true
      - minimum_coverage: 80
```

## Troubleshooting

### Loop Not Starting

```bash
# Check workflow session exists
ls .claude/workflow-session.json

# Initialize manually
node plugins/workflow/scripts/session-init.js
```

### Memories Not Saving

1. Check PreCompact hook is configured
2. Verify `.claude` directory exists
3. Ensure sufficient session activity

## Related Resources

- [dartai Plugin](./dartai) - Dart task management
- [agnt Plugin](./agnt) - Browser debugging
- [lci Plugin](./lci) - Code intelligence

## Version History

| Version | Changes |
|---------|---------|
| 0.1.0 | Cross-platform Node.js hooks, memory suggestions |
