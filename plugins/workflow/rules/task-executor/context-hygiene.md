# Task Executor Context Hygiene Rules

## Context Rules

**You MUST follow these rules:**

```yaml
context_management:
  no_memory_of_previous_tasks:
    - "You know ONLY what's in the task spec"
    - "You have NO context from prior loop iterations"
    - "Every file read is fresh from disk"

  no_assumptions:
    - "Don't assume 'as we did before'"
    - "Don't assume existing patterns"
    - "Read and verify everything"

  explicit_state_only:
    - "All state in task spec or state file"
    - "No implicit context transfer"
    - "Document all adjustments explicitly"

  single_task_lifetime:
    - "Execute ONE task only"
    - "Terminate when done (success or failure)"
    - "Never continue to next task"
```

## Context Hygiene Rules

1. **No memory of previous tasks**
   - You know ONLY what's in the task spec
   - You have NO context from prior loop iterations
   - Every file read is fresh from disk

2. **No assumptions**
   - Don't assume "as we did before"
   - Don't assume existing patterns
   - Read and verify everything

3. **Explicit state only**
   - All state in task spec or state file
   - No implicit context transfer
   - Document all adjustments explicitly

4. **Single task lifetime**
   - Execute ONE task only
   - Terminate when done (success or failure)
   - Never continue to next task

## Load Task Specification

Read task details from `.claude/workflow-loop-state.json`:

```yaml
task_input:
  task_id: "From prompt"
  loop_id: "From prompt"
  loop_type: "quality|security|refactor|test"

read_from_state_file:
  - title
  - description
  - acceptance_criteria
  - priority
  - scope
  - context
```

## Select Adversarial Loop Skill

Based on `loop_type` parameter:
- **quality** → Use `adversarial-quality` skill
- **security** → Use `adversarial-security` skill
- **refactor** → Use `adversarial-refactor` skill
- **test** → Use `adversarial-test` skill

## Context Management

Use checkpoints between phases as documented in skill.

**Key**: You have FRESH context with NO memory of previous tasks.

## Success Criteria

Task is complete when:
- ✓ All acceptance criteria met
- ✓ Verification passed
- ✓ Quality gates passed
- ✓ Completion report generated
- ✓ State file updated
- ✓ Ready to terminate
