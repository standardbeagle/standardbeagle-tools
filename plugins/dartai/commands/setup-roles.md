---
name: setup-roles
description: Configure project-specific DartAI role rules
argument-hint: "[role-name]"
---

# Setup DartAI Role Rules

Configure project-specific rules for DartAI roles. This allows customization of the adversarial cooperation behavior per project.

## Usage

```bash
# Setup all roles (interactive)
/dartai:setup-roles

# Setup specific role
/dartai:setup-roles task-executor
/dartai:setup-roles quality-verifier
/dartai:setup-roles doc-updater
```

## How It Works

1. **Checks for existing rules** at `.claude/dartai/rules/`
2. **Asks customization questions** for each role
3. **Creates project-specific rule files** that override defaults

## Rule Override Hierarchy

Rules are loaded in this order (later overrides earlier):

1. Plugin defaults: `${CLAUDE_PLUGIN_ROOT}/rules/common/*.md`
2. Plugin defaults: `${CLAUDE_PLUGIN_ROOT}/rules/{role}/*.md`
3. Project overrides: `.claude/dartai/rules/common/*.md`
4. Project overrides: `.claude/dartai/rules/{role}/*.md`

## Available Roles

### task-executor

Customize:
- Execution flow behavior
- Phase execution rules
- Context management
- Plan adjustment triggers

**Default rules:**
- `${CLAUDE_PLUGIN_ROOT}/rules/task-executor/execution-flow.md`
- `${CLAUDE_PLUGIN_ROOT}/rules/task-executor/phase-execution.md`

### quality-verifier

Customize:
- Verification modes (implementation, test, security, refactor)
- Adversarial techniques
- Verification report format
- Issue severity thresholds

**Default rules:**
- `${CLAUDE_PLUGIN_ROOT}/rules/quality-verifier/verification-modes.md`

### doc-updater

Customize:
- Documentation style
- CHANGELOG format
- README update behavior
- Comment format

**Default rules:**
- `${CLAUDE_PLUGIN_ROOT}/rules/doc-updater/documentation-rules.md`

### common (shared)

Customize:
- Autonomous operation rules
- Eagle-eyed discipline rules
- Quality enforcement thresholds

**Default rules:**
- `${CLAUDE_PLUGIN_ROOT}/rules/common/autonomous-operation.md`
- `${CLAUDE_PLUGIN_ROOT}/rules/common/eagle-eyed-discipline.md`

## Interactive Setup Questions

### Task Executor Questions

```yaml
questions:
  execution_mode:
    - "Should the agent stop to ask for confirmation?"
    - "Default: No - fully autonomous"

  phase_behavior:
    - "How should plan adjustments be handled?"
    - "Default: Automatic - continue after adjustments"

  scope_limits:
    - "Maximum files per task? (default: 5)"
    - "Maximum steps per task? (default: 7)"
    - "Should scope exceed threshold cause task split? (default: yes)"

  quality_thresholds:
    - "Linting tolerance? (default: zero errors)"
    - "Test coverage tolerance? (default: no decrease)"
    - "Complexity limits? (default: cyclomatic 10, nesting 3)"
```

### Quality Verifier Questions

```yaml
questions:
  verification_strictness:
    - "Should scope violations cause immediate rejection? (default: yes)"
    - "Should TODO markers cause rejection? (default: yes)"
    - "Should 'test blame shifting' be rejected? (default: yes)"

  severity_thresholds:
    - "What constitutes a critical issue? (default: security, data loss, crashes)"
    - "What constitutes a high issue? (default: edge case bugs, missing error handling)"

  verification_modes:
    - "Enable implementation verification? (default: yes)"
    - "Enable test verification? (default: yes)"
    - "Enable security verification? (default: yes)"
    - "Enable refactor verification? (default: yes)"
```

### Doc Updater Questions

```yaml
questions:
  changelog_behavior:
    - "Auto-update CHANGELOG.md on task completion? (default: yes)"
    - "Include task ID references? (default: yes)"
    - "Preferred format? (default: Keep It Simple)"

  readme_behavior:
    - "Auto-update README.md? (default: only if API changes)"
    - "What sections to update? (default: usage, installation)"
```

### Common Questions

```yaml
questions:
  autonomy_level:
    - "Should agents operate fully autonomously? (default: yes)"
    - "When should agents stop? (default: only on critical blockers)"

  discipline_level:
    - "Reject TODO/FIXME markers? (default: yes, with zero tolerance)"
    - "Reject 'not my test' blame? (default: yes, all tests must pass)"
    - "Reject over-engineering? (default: yes, simplify until obvious)"
```

## Setup Process

### Step 1: Check Existing Rules

```bash
# List existing project rules
ls -la .claude/dartai/rules/
```

### Step 2: Ask Role Selection

```
Which role do you want to customize?

1. task-executor
2. quality-verifier
3. doc-updater
4. common (affects all roles)
5. All roles (guided walkthrough)

Enter number or role name:
```

### Step 3: Ask Role-Specific Questions

Present questions for the selected role, show defaults, accept customizations.

### Step 4: Create Rule Files

Create `.claude/dartai/rules/{role}/{rule-name}.md` with only the customized values:

```markdown
# Project-Specific {Rule Name} Rules

## Override Values

```yaml
custom_overrides:
  # Project-specific values that override defaults
  max_files: 10  # Override default of 5
  coverage_tolerance: "-1%"  # Allow small coverage decrease
```

## Notes

This file overrides the default rules at:
`${CLAUDE_PLUGIN_ROOT}/rules/{role}/{rule-name}.md`
```

### Step 5: Verify and Summarize

Show what was created and how it changes behavior:

```
✅ Created .claude/dartai/rules/task-executor/execution-flow.md

Changes from defaults:
- Max files per task: 5 → 10
- Plan adjustment: Automatic → Ask for critical issues only

To revert: Delete the file and defaults will be used.
```

## Example Output

```
Setting up DartAI role rules for project: my-project

Checking existing rules...
No project-specific rules found. Using defaults.

Which role would you like to customize?
[1] task-executor
[2] quality-verifier
[3] doc-updater
[4] common
[5] All roles (guided)
[0] Cancel

> 1

Configuring task-executor role...

[1/5] Execution Mode
Should the agent stop to ask for confirmation during phases?
Default: No - fully autonomous
Your choice: [Enter=accept, N=no, Y=yes] > Enter

[2/5] Scope Limits
Maximum files per task?
Default: 5
Your choice: [Enter=accept] > 10

Maximum steps per task?
Default: 7
Your choice: [Enter=accept] > Enter

[3/5] Quality Thresholds
Test coverage tolerance?
Default: No decrease allowed
Your choice: [Enter=accept, A=allow small decrease] > A
Allowed decrease: > 2%

[4/5] Plan Adjustment
How should plan adjustments be handled?
Default: Automatic - continue after adjustments
Your choice: [Enter=accept, S=stop on any adjustment] > Enter

[5/5] Linting Tolerance
Should lint errors block completion?
Default: Yes - zero tolerance
Your choice: [Enter=accept, A=allow warnings] > Enter

✅ Creating .claude/dartai/rules/task-executor/execution-flow.md
✅ Creating .claude/dartai/rules/task-executor/phase-execution.md

Summary of changes:
- Max files per task: 5 → 10
- Coverage tolerance: No decrease → Allow up to 2% decrease

Role configuration saved! Agents will use these rules for this project.

To modify: Edit .claude/dartai/rules/task-executor/*.md
To reset: Delete the rule files to restore defaults
```

## File Structure

```
.claude/dartai/rules/
├── common/
│   ├── autonomous-operation.md      # Override autonomy rules
│   └── eagle-eyed-discipline.md     # Override quality enforcement
├── task-executor/
│   ├── execution-flow.md            # Override execution behavior
│   └── phase-execution.md           # Override phase rules
├── quality-verifier/
│   └── verification-modes.md        # Override verification rules
└── doc-updater/
    └── documentation-rules.md       # Override doc rules
```

## Reset to Defaults

```bash
# Remove all project-specific rules
rm -rf .claude/dartai/rules/

# Or remove specific role rules
rm .claude/dartai/rules/task-executor/*.md
```
