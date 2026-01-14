---
name: add-task
description: Add a new task to the workflow task list
argument-hint: "[task-title]"
---

# Add Task to Workflow

Add a new task to the workflow task list with proper context-sizing guidance.

## Process

1. **Get task title**
   - If provided as argument, use it
   - Otherwise, ask user for title

2. **Interactive task creation**

Prompt user for:
- **Priority**: High | Medium | Low
- **Scope**: Brief description (max 5 files)
- **Description**: Clear, actionable description
- **Acceptance Criteria**: List of verifiable criteria
- **Context**: Any additional context needed

3. **Context-sizing validation**

Check that task is context-sized:
```yaml
validation:
  max_files: 5
  clear_scope: true
  bounded_changes: true
  independent: true  # No dependencies on other pending tasks

if_too_large:
  action: "Suggest splitting into multiple tasks"
  prompt: "This task seems large. Would you like to split it?"
```

4. **Add to task list**

Append to `.claude/workflow-tasks.md`:
```markdown
---

## Task X: [Title]
**Priority:** [High|Medium|Low]
**Scope:** [max 5 files]
**Added:** [ISO timestamp]
**Status:** Pending

**Description:**
[Clear, actionable description]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Context:**
[Any additional context needed]
```

5. **Update loop state (if loop running)**

If loop is currently running:
- Update `.claude/workflow-loop-state.json`
- Add task to tasks array
- Increment total_tasks counter
- Task will be picked up in next iteration

6. **Confirmation**
```
Task Added Successfully
=======================
Task ID: task-6
Title: [title]
Priority: [priority]
Status: Pending

Added to: .claude/workflow-tasks.md

Next Steps:
- Task will be executed in loop order
- If loop running, it will pick this up automatically
- To start loop: /workflow:start-loop
```

## Usage

```bash
# Add task with title
/workflow:add-task "Add user authentication"

# Add task interactively
/workflow:add-task

# Or just say:
add a workflow task
add task to the loop
```

## Context-Sizing Best Practices

When creating tasks:
- **Keep scope small**: 1-5 files max
- **Make it independent**: Should execute without dependencies
- **Clear acceptance**: Must have verifiable criteria
- **Bounded changes**: Specific feature or fix, not open-ended
- **No assumptions**: Include all context needed

**Good task:**
```
Title: Add email validation to registration form
Scope: src/components/RegisterForm.tsx (1 file)
Criteria:
- [ ] Email field validates format
- [ ] Shows error message for invalid email
- [ ] Tests pass
```

**Bad task (too large):**
```
Title: Build authentication system
Scope: Multiple files across backend and frontend
Criteria:
- [ ] Users can authenticate
- [ ] System is secure
```

Better: Split into 5+ context-sized tasks
