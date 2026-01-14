# Workflow Plugin

General-purpose adversarial workflow automation with Ralph Wiggum loops for Claude Code.

## Overview

The workflow plugin provides a robust framework for executing tasks with:
- **Clean context isolation** - Each task runs in a fresh subagent
- **Adversarial cooperation** - Implementer + Verifier roles
- **Multiple loop types** - Quality, Security, Refactor, Test
- **Hook-based tracking** - SubagentStop hooks monitor iterations
- **No external dependencies** - No Dart, no databases, just files

## Inspired By

- **[Goose Ralph Loops](https://block.github.io/goose/docs/tutorials/ralph-loop/)** - Adversarial cooperation pattern
- **[g3 Principles](https://github.com/dhanji/g3)** - Context management and clean execution

## Key Features

### Context Hygiene

**Every task runs in a fresh subagent with clean context.**

```yaml
context_management:
  main_loop: "Orchestrates only - no task memory"
  task_executor: "Fresh subagent per task"
  verifier: "Independent fresh subagent"
  state_transfer: "Only via .claude/workflow-loop-state.json"
```

This prevents:
- Context pollution from previous tasks
- Token usage explosion
- Semantic drift
- Accumulated confusion

### Adversarial Cooperation

**Two mindsets in one execution:**

1. **Implementer**: "Make it work correctly"
   - Positive instructions
   - Best practices
   - Clean code

2. **Verifier**: "Break it, find flaws"
   - Challenge assumptions
   - Find edge cases
   - Question everything

### Multiple Loop Types

- **quality**: Full implementation with verification
- **security**: Security audit with OWASP patterns
- **refactor**: Safe refactoring with behavior preservation
- **test**: Test coverage with mutation testing

## Installation

```bash
# Add marketplace (if not already added)
claude mcp add-dir /path/to/standardbeagle-tools

# Or add plugin directly
claude mcp add workflow --source /path/to/standardbeagle-tools/plugins/workflow
```

## Quick Start

### 1. Create Task List

Create `.claude/workflow-tasks.md`:

```markdown
# Task List

## Task 1: Add User Authentication
**Priority:** High
**Scope:** auth.ts, auth.test.ts (2 files)

**Description:**
Add JWT-based authentication to the API.

**Acceptance Criteria:**
- [ ] Users can register with email/password
- [ ] Users can login with valid credentials
- [ ] Invalid credentials are rejected
- [ ] JWT tokens expire after 24h
- [ ] Tests cover all scenarios

**Context:**
Use bcrypt for password hashing. Follow existing API patterns.

---

## Task 2: Add Rate Limiting
**Priority:** Medium
**Scope:** middleware/rate-limit.ts (1 file)

**Description:**
Add rate limiting to prevent brute force attacks.

**Acceptance Criteria:**
- [ ] Max 5 login attempts per IP per minute
- [ ] Returns 429 when limit exceeded
- [ ] Resets after time window
- [ ] Tests verify rate limiting

---
```

### 2. Start Loop

```bash
/workflow:start-loop

# Or with specific loop type
/workflow:start-loop --loop=security

# Or with custom task file
/workflow:start-loop my-tasks.md --loop=quality
```

### 3. Monitor Progress

```bash
/workflow:loop-status
```

### 4. Stop Loop

```bash
/workflow:stop-loop

# Or just say:
stop the loop
```

## Commands

### `/workflow:start-loop`

Start an adversarial loop for task automation.

**Arguments:**
- `[task-list-file]` - Optional path to task list (default: `.claude/workflow-tasks.md`)
- `--loop=type` - Loop type: quality|security|refactor|test (default: quality)

**Example:**
```bash
/workflow:start-loop my-tasks.md --loop=quality
```

### `/workflow:stop-loop`

Stop the currently running loop gracefully.

### `/workflow:loop-status`

Show status of current or recent loops.

### `/workflow:add-task`

Add a new task to the task list interactively.

**Arguments:**
- `[task-title]` - Optional task title

## Loop Types

### Quality Loop

Full implementation with adversarial verification.

**Phases:**
1. Implementation Planning
2. Positive Implementation
3. Self-Adversarial Review
4. External Verification (spawns verifier)
5. Quality Gates (lint, test, type check)
6. Final Validation

**Use for:** Feature development, bug fixes, enhancements

### Security Loop

Security-focused audit with OWASP Top 10.

**Phases:**
1. Threat Modeling
2. Injection Testing
3. Authentication & Authorization
4. Data Protection
5. Configuration & Dependencies
6. Security Report

**Use for:** Security audits, vulnerability assessment

**Critical Protocol:** Stops immediately if critical vulnerability found.

### Refactor Loop

Safe refactoring with behavior preservation.

**Phases:**
1. Refactor Analysis
2. Behavior Baseline
3. Incremental Refactoring (atomic steps)
4. Adversarial Behavior Comparison
5. Quality Validation
6. Refactor Report

**Use for:** Code cleanup, architecture improvements

**Key Principle:** Behavior must be preserved exactly.

### Test Loop

Comprehensive testing with mutation testing.

**Phases:**
1. Test Planning
2. Happy Path Tests (50-60%)
3. Edge Case Tests (25-30%)
4. Adversarial Tests (10-15%)
5. Mutation Testing
6. Regression Tests

**Use for:** Improving test coverage, finding test gaps

## Context Management

### Main Loop (Orchestrator)

**Persists:**
- Loop configuration
- Task queue
- Completion statistics
- Iteration counts

**Discards:**
- ALL task implementation details
- File contents
- Error messages
- Code changes

### Task Executor (Subagent)

**Fresh context per task:**
- Reads task spec from state file
- Reads codebase files fresh
- Executes loop skill
- Updates state file
- Terminates cleanly

**Lifetime:** One task only (typically 10-30 minutes)

### State Transfer

**ONLY via `.claude/workflow-loop-state.json`:**

```json
{
  "loop_id": "abc123",
  "loop_type": "quality",
  "tasks": [
    {
      "id": "task-1",
      "status": "completed",
      "iterations": 2,
      "completion_report": {...}
    }
  ],
  "stats": {...}
}
```

## Hook System

### Hooks Implemented

**SubagentStop:**
- `workflow:task-executor` - Track loop iterations
- `workflow:quality-verifier` - Track verifications
- `workflow:security-auditor` - Track security audits

**PostToolUse:**
- `Task` - Track subagent spawns

**SessionStart:**
- Initialize session tracking

**Stop:**
- Cleanup and archive session

### Metrics Tracked

- Subagent spawns
- Subagent completions
- Context barriers enforced
- Tasks completed/failed
- Verification completions
- Security audits

Metrics stored in `.claude/workflow-session.json`.

**PreCompact:**
- Suggest memories to save before context compaction
- Suggest process improvements based on common oversights

## Memory Management

### Automatic Memory Preservation

Before context compaction, the workflow plugin automatically suggests memories to preserve valuable learnings.

**PreCompact Hook triggers two suggestions:**

1. **Workflow Memories** - Patterns, decisions, and lessons learned
2. **Process Improvements** - Common oversights and how to prevent them

### Memory Categories

**1. Workflow Patterns**
```yaml
example: "Auth tasks require rate limiting verification"
when: A pattern works well repeatedly
scope: project or user
```

**2. Technical Decisions**
```yaml
example: "Using JWT with 24h expiry - rationale: stateless auth"
when: Architecture choice with specific rationale
scope: project
```

**3. Code Patterns**
```yaml
example: "API endpoints follow /api/v1/{resource}/{action}"
when: Consistent pattern established
scope: project
```

**4. Verification Strategies**
```yaml
example: "Mutation testing caught weak tests in auth module"
when: Verification approach proves valuable
scope: user
```

**5. Lessons Learned**
```yaml
example: "XSS found in profile - always sanitize user HTML"
when: Bug found and fixed with broader lesson
scope: user or project
```

**6. Process Improvements** ⭐ NEW
```yaml
example: "Task 3 added file upload but missed security checks"
when: Common oversight identified during execution
scope: user or project
categories:
  - Testing coverage gaps
  - Documentation missed
  - Root cause not found
  - Security oversights
  - Error handling weak
  - Performance not tested
  - Breaking changes without versioning
  - Superficial code review
  - Dependency vulnerabilities
  - Deployment rollback missing
```

### How It Works

**Before Context Compaction:**

1. **Analyze workflow state**
   - Review completed/failed tasks
   - Identify patterns and learnings
   - Check for common oversights

2. **Generate suggestions**
   - 3-5 workflow memories (patterns, decisions, lessons)
   - 2-4 process improvements (things missed, how to prevent)

3. **Present to user**
   - Show suggested memories with details
   - Allow editing before saving
   - Option to skip individual memories

4. **Save approved memories**
   - Store in `.claude/memories/` as markdown
   - Or use slop-mcp if available
   - Tag for future retrieval

5. **Continue with compaction**
   - Context compaction proceeds
   - Valuable knowledge preserved

### Memory Structure

```markdown
---
title: "Auth tasks require rate limiting verification"
category: workflow_pattern
scope: project
tags: [authentication, security, rate-limiting]
confidence: high
created: 2026-01-14T10:23:15Z
---

## What
When implementing authentication endpoints, always include rate limiting
in the security verification phase.

## Why
Brute force vulnerabilities discovered in Task 2 could have been prevented
with upfront rate limiting verification.

## When
Apply to all authentication-related tasks:
- Login endpoints
- Password reset
- Registration

## How
Checklist for verification phase:
- [ ] Rate limit login endpoint (5 attempts/min/IP)
- [ ] Rate limit password reset (3 attempts/hour/email)
- [ ] Test with concurrent requests
- [ ] Verify 429 responses include Retry-After header
```

### Process Improvement Examples

**Testing Coverage:**
```yaml
title: "Task 3 had insufficient edge case testing"
category: process_improvement
what_missed: "Null/undefined inputs not tested, boundary conditions skipped"
impact: "Bug found in later review"
prevention: |
  Add edge case checklist to verification:
  - [ ] Test null/undefined/empty inputs
  - [ ] Test min/max boundary values
  - [ ] Test error conditions
```

**Documentation:**
```yaml
title: "Forgot to update README after adding auth"
category: process_improvement
what_missed: "Setup instructions, API examples, environment variables"
impact: "Team members confused about setup"
prevention: |
  Add documentation step to completion:
  - [ ] Update README.md
  - [ ] Update API docs
  - [ ] Update .env.example
```

**Root Cause:**
```yaml
title: "Fixed symptom not root cause - payment bug"
category: process_improvement
what_missed: "Deeper investigation would have found race condition"
impact: "Quick fix prevented duplicates but didn't solve concurrency issue"
prevention: |
  Always ask "Why did this happen?" not just "How to fix?"
  - Don't just patch symptoms
  - Investigate underlying cause
  - Consider if same issue exists elsewhere
```

### Reviewing Memories

Use the review-memories command to search and manage memories:

```bash
# Search all memories
/workflow:review-memories

# Search by keyword
/workflow:review-memories authentication

# Search by category
/workflow:review-memories --category=lesson

# Search by tags
/workflow:review-memories --tags=security,xss
```

**Memory Operations:**
- View details of specific memory
- Apply memory to current task
- Update memory with new learnings
- Delete obsolete memories
- Export memories to share

### Memory Lifecycle

```yaml
1_identification:
  trigger: "PreCompact hook before context compaction"
  analyze: "Workflow state, conversation patterns, oversights"
  generate: "3-5 memory suggestions + 2-4 process improvements"

2_review:
  present: "Show suggestions to user"
  options: "Save as-is | Edit | Skip | Skip all"
  approve: "User approves/edits suggestions"

3_storage:
  location: ".claude/memories/ (or slop-mcp)"
  format: "Markdown with YAML frontmatter"
  index: "JSON for fast searching"

4_retrieval:
  when: "Starting similar task, user asks, pattern matching"
  search: "By category, tags, scope, full-text"
  apply: "Use memory in current work"

5_update:
  trigger: "Memory evolves, proves incorrect, becomes obsolete"
  action: "Update content, archive, or delete"
  version: "Keep history of changes"
```

### Integration with slop-mcp

If slop-mcp is available, memories can be stored using slop-mcp tools:

```bash
# Save memory
slop-mcp memory save \
  --title "Auth tasks require rate limiting" \
  --category "workflow_pattern" \
  --scope "project" \
  --tags "auth,security" \
  --content "$(cat memory.md)"

# Search memories
slop-mcp memory search --tags "security"

# Retrieve memory
slop-mcp memory get --id "memory-123"
```

### Benefits

**Knowledge Preservation:**
- Learnings don't disappear with context compaction
- Patterns discovered are remembered
- Mistakes are documented to prevent recurrence

**Continuous Improvement:**
- Process improvements compound over time
- Common oversights identified and prevented
- Quality increases with experience

**Team Sharing:**
- Memories can be exported and shared
- Best practices propagate across team
- Onboarding accelerated with documented patterns

**Future Retrieval:**
- Relevant memories suggested at task start
- Search memories when encountering similar issues
- Build institutional knowledge base

## Task Requirements

Every task MUST be context-sized:

```yaml
context_sized_task:
  max_files: 5
  max_scope: "Single feature or fix"
  clear_acceptance: true
  bounded_changes: true
  no_dependencies: true
```

**If task too large:** Split into multiple smaller tasks.

## Best Practices

### Task Creation
- Keep scope small (1-5 files)
- Make tasks independent
- Write clear acceptance criteria
- Include all necessary context
- Avoid open-ended tasks

### Loop Execution
- Let loop run without interruption
- Trust the adversarial process
- Review status periodically
- Address failures before continuing

### Context Hygiene
- Never pass context between tasks
- Always spawn fresh subagents
- Transfer only essential state
- Verify context barriers

## Troubleshooting

### Loop Not Starting
- Check task list file exists
- Verify tasks are properly formatted
- Ensure no syntax errors in task list

### Task Failing Repeatedly
- Task may be too large - split it
- Acceptance criteria may be unclear - clarify
- Dependencies may be missing - add context

### Context Issues
- Verify SubagentStop hooks are firing
- Check `.claude/workflow-session.json` metrics
- Ensure subagents are terminating cleanly

## Files and Directories

```
.claude/
├── workflow-tasks.md              # Task list (default location)
├── workflow-loop-state.json       # Current loop state
├── workflow-session.json          # Session metrics
├── workflow-completions.log       # Completion log
├── workflow-verifications.log     # Verification log
├── workflow-security.log          # Security audit log
├── workflow-spawns.log            # Subagent spawn log
└── workflow-history/              # Archived sessions
    └── session-abc123.json
```

## Advanced Usage

### Custom Task Format

You can customize task fields as needed:
```markdown
## Task X: Title
**Priority:** High|Medium|Low
**Scope:** file1.ts, file2.ts
**Estimate:** 30m
**Tags:** #security #api

**Description:**
...

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Context:**
...

**References:**
- Link to issue
- Link to docs
```

### Resume After Interruption

Loop state is persisted, so you can resume:
```bash
/workflow:start-loop --resume abc123
```

(Resume feature requires implementation - currently tasks restart fresh)

### Parallel Verification

Quality loop can spawn verifier in parallel:
- Task executor implements
- Verifier agent reviews (fresh context)
- Both report back independently

## Architecture

```
Main Loop (Primary Agent)
├── Reads: .claude/workflow-tasks.md
├── Manages: .claude/workflow-loop-state.json
└── Spawns: workflow:task-executor (fresh subagent)
    ├── Executes: adversarial-quality skill
    ├── Spawns: workflow:quality-verifier (fresh subagent)
    │   └── Returns: verification report
    ├── Updates: loop state file
    └── Terminates: SubagentStop hook fires
        └── Main loop continues to next task
```

## Contributing

See main repository: https://github.com/standardbeagle/standardbeagle-tools

## License

MIT License - See repository for details
