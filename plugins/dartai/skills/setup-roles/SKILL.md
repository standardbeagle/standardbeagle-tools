---
name: dartai-setup-roles
description: "\"Configure project-specific DartAI role rules. 配置項目特定DartAI角色規則。 Use when: customize dartai roles, override execution rules, configure quality thresholds, setup project rules, role customization\""
argument-hint: "\"[role-name]\""
---

# Setup DartAI Role Rules

設置項目專屬 role 規則。

## Usage

```bash
# All roles
/dartai:setup-roles

# One role
/dartai:setup-roles task-executor
/dartai:setup-roles code-quality-reviewer
/dartai:setup-roles doc-updater
```

## Flow

1. 查 `.dartai/rules/`
2. 問 role 專屬問題
3. 寫 project override files

## Override Order

後者覆前者：

1. `${CLAUDE_PLUGIN_ROOT}/rules/common/*.md`
2. `${CLAUDE_PLUGIN_ROOT}/rules/{role}/*.md`
3. `.dartai/rules/common/*.md`
4. `.dartai/rules/{role}/*.md`

## Roles

### task-executor

Tune:
- Execution flow
- Phase rules
- Context mgmt
- Plan adjust triggers

Default:
- `${CLAUDE_PLUGIN_ROOT}/rules/task-executor/execution-flow.md`
- `${CLAUDE_PLUGIN_ROOT}/rules/task-executor/phase-execution.md`

### code-quality-reviewer

Tune:
- Verify modes (impl/test/security/refactor)
- Adversarial tricks
- Report format
- Severity thresholds

Default:
- `${CLAUDE_PLUGIN_ROOT}/rules/code-quality-reviewer/verification-modes.md`

### doc-updater

Tune:
- Doc style
- CHANGELOG shape
- README update rule
- Comment format

Default:
- `${CLAUDE_PLUGIN_ROOT}/rules/doc-updater/documentation-rules.md`

### common

Tune:
- Autonomy rules
- Eagle-eyed rules
- Quality thresholds

Default:
- `${CLAUDE_PLUGIN_ROOT}/rules/common/autonomous-operation.md`
- `${CLAUDE_PLUGIN_ROOT}/rules/common/eagle-eyed-discipline.md`

## Questions

### Task Executor

```yaml
questions:
  execution_mode:
    - "Stop for confirmation?"
    - "Default: No."

  phase_behavior:
    - "Plan adjust how?"
    - "Default: auto-continue."

  scope_limits:
    - "Max files? (default: 5)"
    - "Max steps? (default: 7)"
    - "Split on overflow? (default: yes)"

  quality_thresholds:
    - "Lint tolerance? (default: zero errors)"
    - "Coverage tolerance? (default: no decrease)"
    - "Complexity limit? (default: cyclomatic 10, nesting 3)"
```

### Quality Verifier

```yaml
questions:
  verification_strictness:
    - "Scope violation = reject? (default: yes)"
    - "TODO marker = reject? (default: yes)"
    - "'Not my test' = reject? (default: yes)"

  severity_thresholds:
    - "Critical issue? (default: security, data loss, crashes)"
    - "High issue? (default: edge case bugs, missing error handling)"

  verification_modes:
    - "Impl verify? (default: yes)"
    - "Test verify? (default: yes)"
    - "Security verify? (default: yes)"
    - "Refactor verify? (default: yes)"
```

### Doc Updater

```yaml
questions:
  changelog_behavior:
    - "Auto-update CHANGELOG.md? (default: yes)"
    - "Include task ID refs? (default: yes)"
    - "Preferred format? (default: Keep It Simple)"

  readme_behavior:
    - "Auto-update README.md? (default: only if API changes)"
    - "What sections to update? (default: usage, installation)"
```

### Common

```yaml
questions:
  autonomy_level:
    - "Operate fully autonomously? (default: yes)"
    - "When stop? (default: only on critical blockers)"

  discipline_level:
    - "Reject TODO/FIXME? (default: yes)"
    - "Reject 'not my test'? (default: yes)"
    - "Reject over-engineering? (default: yes)"
```

## Setup

### 1. Check rules

```bash
ls -la .dartai/rules/
```

### 2. Pick role

```text
Which role do you want to customize?
1. task-executor
2. code-quality-reviewer
3. doc-updater
4. common
5. All roles
```

### 3. Ask role questions

問問題，帶默認值，收自定值。

### 4. Write override file

Create `.dartai/rules/{role}/{rule-name}.md` with only overrides.

### 5. Verify

Show file + delta:

```text
✅ Created .dartai/rules/task-executor/execution-flow.md
Changes from defaults:
- Max files: 5 → 10
- Plan adjust: automatic → ask only on critical issues
```

## Example

```text
Setting up DartAI role rules...
No project rules found. Using defaults.
Pick role: task-executor
Max files? 5
Plan adjust? automatic
...
```
