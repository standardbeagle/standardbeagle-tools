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

2. **Invoke grill-task**

Call `dev-standards:grill-task` with the task title and any user-provided context. The skill probes project context, runs tier-gated interrogation, and returns a grilled `task_spec` and any `backflow_writes`.

- If grill returns `verdict: OK`, use the returned `task_spec` fields (priority → `task_spec.tier` mapping, description → `task_spec.requested`, acceptance → `task_spec.acceptance`, scope → `task_spec.scope`, context → `task_spec.refs`) in place of asking the user directly.
- If grill returns `verdict: TOO_LARGE_TO_GRILL`, do NOT write anything to `.workflow/tasks.md`. Report to the user that the task must be split, suggest a decomposition, and stop.
- If grill returns `verdict: ABORTED`, do nothing — the user cancelled during the confirmation screen.

Commit any `backflow_writes` to the project before proceeding to step 3.

Priority mapping from tier:
- `minimal` → Low
- `standard` → Medium
- `comprehensive` → Medium
- `architectural` → High

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

Append to `.workflow/tasks.md`:
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
- Update `.workflow/loop-state.json`
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

Added to: .workflow/tasks.md

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
