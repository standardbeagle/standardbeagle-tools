---
name: setup-workflow
description: Configure project-specific workflow role rules
argument-hint: "[role-name]"
---

# Setup Workflow Role Rules

Configure project-specific rules for workflow roles. This allows customization of the adversarial loop behavior per project.

## Usage

```bash
# Setup all roles (interactive)
/workflow:setup

# Setup specific role
/workflow:setup task-executor
/workflow:setup quality-verifier
/workflow:setup security-auditor
```

## How It Works

1. **Checks for existing rules** at `.claude/workflow/rules/`
2. **Asks customization questions** for each role
3. **Creates project-specific rule files** that override defaults

## Rule Override Hierarchy

Rules are loaded in this order (later overrides earlier):

1. Plugin defaults: `${CLAUDE_PLUGIN_ROOT}/rules/{role}/*.md`
2. Project overrides: `.claude/workflow/rules/{role}/*.md`

## Available Roles

### task-executor

Customize:
- Context hygiene rules
- Execution pattern rules
- State management behavior
- Adversarial mindset

**Default rules:**
- `${CLAUDE_PLUGIN_ROOT}/rules/task-executor/context-hygiene.md`
- `${CLAUDE_PLUGIN_ROOT}/rules/task-executor/execution-pattern.md`

### quality-verifier

Customize:
- Verification categories (correctness, security, quality, testing)
- Issue severity thresholds
- Attack vector generation
- Report format

**Default rules:**
- `${CLAUDE_PLUGIN_ROOT}/rules/quality-verifier/verification-categories.md`

### security-auditor

Customize:
- OWASP Top 10 focus areas
- Attack testing scenarios
- Risk assessment criteria
- Security report format

**Default rules:**
- `${CLAUDE_PLUGIN_ROOT}/rules/security-auditor/owasp-audit.md`

## Interactive Setup Questions

### Task Executor Questions

```yaml
questions:
  context_management:
    - "Maximum files per task? (default: 5)"
    - "Should context be isolated between tasks? (default: yes)"
    - "State persistence mode? (default: state file only)"

  execution_pattern:
    - "Loop type support? (default: quality, security, refactor, test)"
    - "Verifier spawn behavior? (default: fresh subagent)"
    - "Failure handling? (default: continue to next task)"
```

### Quality Verifier Questions

```yaml
questions:
  verification_categories:
    - "Enable correctness verification? (default: yes)"
    - "Enable security verification? (default: yes)"
    - "Enable quality verification? (default: yes)"
    - "Enable testing verification? (default: yes)"

  severity_thresholds:
    - "Critical issues include? (default: security, data loss, crashes)"
    - "High issues include? (default: edge case bugs, missing error handling)"
```

### Security Auditor Questions

```yaml
questions:
  owasp_focus:
    - "Which OWASP categories to audit? (default: all)"
    - "External dependencies scan? (default: yes)"
    - "Secret scanning? (default: yes)"

  risk_assessment:
    - "CVSS score threshold for critical? (default: 9.0+)"
    - "Exploitability weight? (default: high)"
```

## Setup Process

### Step 1: Check Existing Rules

```bash
# List existing project rules
ls -la .claude/workflow/rules/
```

### Step 2: Ask Role Selection

```
Which role do you want to customize?

1. task-executor
2. quality-verifier
3. security-auditor
4. All roles (guided walkthrough)

Enter number or role name:
```

### Step 3: Ask Role-Specific Questions

Present questions for the selected role, show defaults, accept customizations.

### Step 4: Create Rule Files

Create `.claude/workflow/rules/{role}/{rule-name}.md` with only the customized values:

```markdown
# Project-Specific {Rule Name} Rules

## Override Values

```yaml
custom_overrides:
  # Project-specific values that override defaults
  max_files: 10  # Override default of 5
  context_isolation: false  # Allow some context sharing
```

## Notes

This file overrides the default rules at:
`${CLAUDE_PLUGIN_ROOT}/rules/{role}/{rule-name}.md`
```

### Step 5: Verify and Summarize

Show what was created and how it changes behavior:

```
✅ Created .claude/workflow/rules/task-executor/context-hygiene.md

Changes from defaults:
- Max files per task: 5 → 10
- Context isolation: Full → Partial (shared patterns allowed)

To revert: Delete the file and defaults will be used.
```

## Example Output

```
Setting up workflow role rules for project: my-project

Checking existing rules...
No project-specific rules found. Using defaults.

Which role would you like to customize?
[1] task-executor
[2] quality-verifier
[3] security-auditor
[4] All roles (guided)
[0] Cancel

> 1

Configuring task-executor role...

[1/3] Context Management
Maximum files per task?
Default: 5
Your choice: [Enter=accept] > 10

Context isolation between tasks?
Default: Yes - full isolation
Your choice: [Enter=accept, P=partial sharing] > P

State persistence mode?
Default: State file only
Your choice: [Enter=accept] > Enter

[2/3] Execution Pattern
Which loop types to support?
Default: quality, security, refactor, test
Your choice: [Enter=accept all, C=customize] > C
Enable: quality, security, refactor (test excluded)

[3/3] Verifier Spawn Behavior
How to spawn verifier?
Default: Fresh subagent for independent review
Your choice: [Enter=accept, S=same agent] > Enter

✅ Creating .claude/workflow/rules/task-executor/context-hygiene.md
✅ Creating .claude/workflow/rules/task-executor/execution-pattern.md

Summary of changes:
- Max files per task: 5 → 10
- Context isolation: Full → Partial
- Supported loops: All → quality, security, refactor

Role configuration saved! Agents will use these rules for this project.

To modify: Edit .claude/workflow/rules/task-executor/*.md
To reset: Delete the rule files to restore defaults
```

## File Structure

```
.claude/workflow/rules/
├── task-executor/
│   ├── context-hygiene.md          # Override context rules
│   └── execution-pattern.md        # Override execution rules
├── quality-verifier/
│   └── verification-categories.md  # Override verification rules
└── security-auditor/
    └── owasp-audit.md              # Override security audit rules
```

## Reset to Defaults

```bash
# Remove all project-specific rules
rm -rf .claude/workflow/rules/

# Or remove specific role rules
rm .claude/workflow/rules/task-executor/*.md
```

## Integration with Loop Commands

When running `/workflow:start`, the task-executor agent will:

1. Check for project rules at `.claude/workflow/rules/`
2. Merge with plugin defaults
3. Apply customizations before execution
4. Log which rules are in effect
