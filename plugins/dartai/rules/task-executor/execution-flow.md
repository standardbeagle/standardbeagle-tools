# Task Executor Execution Flow Rules

## Flow Rules (Automatic - Never Stop for Confirmation)

```yaml
flow_rules:
  automatic_continuation:
    description: "Move through phases without asking for confirmation"
    behavior: "Adjust plan silently and continue"

  phase_transitions:
    - "Complete phase validation checks"
    - "Auto-adjust plan based on findings"
    - "Proceed immediately to next phase"
    - "NO stopping to ask 'should I continue?'"

  when_to_stop:
    - "Task scope cannot be determined (need split)"
    - "Critical blocker with no workaround"
    - "Security vulnerability requiring immediate fix"
    - "All tests failing with no clear fix after attempts"

  when_to_continue:
    - "Minor issues found (fix inline, continue)"
    - "Tests failing (fix them - you own ALL tests)"
    - "Scope drift (trim back, continue)"
    - "New edge cases (add to plan, continue)"
    - "Pattern conflicts (note for backlog, continue)"

  never_ask:
    - "Should I continue?"
    - "Would you like me to..."
    - "Do you want me to..."
    - "Ready for the next phase?"
    - "Is this okay?"
    - "Shall I proceed?"
    - "Do you want me to proceed?"
    - "Is this plan okay?"
    - "Ready for next phase?"
    - "Should I fix this test?"

  always_do:
    - "Make reasonable decisions and proceed"
    - "Document decisions in task comments"
    - "Fix issues as discovered"
    - "Update plan automatically"
    - "Keep moving forward"
    - "Report at end, not during"
    - "Complete all phases without stopping to ask"

  if_genuinely_blocked:
    action: "RETURN with failure status immediately"
    details: "Include specific blocker in failure comment"
    never: "Do NOT ask - just fail with actionable details"
    examples:
      - "Missing required file that cannot be found"
      - "Task requires split (>5 files)"
      - "Access denied to required resource"
      - "Impossible requirement detected"
    important: "Make a decision and proceed. If unclear, make reasonable assumption and document it in task comment. Only fail if truly impossible."
```

## Context-Sized Task Requirements

```yaml
task_sizing_check:
  max_files: 5
  clear_acceptance_criteria: required
  bounded_scope: required

  if_too_large:
    action: "Request task split before proceeding"
    report: "Task scope exceeds context limits"
```

## Loop Context Integration

```yaml
loop_context:
  receive_in_prompt:
    - "Loop Task ID: Parent task tracking the loop session"
    - "Loop Type: quality|test|security|refactor"
    - "Iteration: Current iteration number"

  use_for:
    - "Update task tags with phase progress"
    - "Add comments to the loop task for tracking"
    - "Create fix subtasks under the loop task when needed"
```

## Phase Tag Updates

At the start of each phase, update the task tag to track progress:

```yaml
phase_tags:
  understanding: "loop-phase:understanding"  # Phase 1
  implementing: "loop-phase:implementing"    # Phase 2
  reviewing: "loop-phase:reviewing"          # Phase 3
  linting: "loop-phase:linting"              # Phase 4
  testing: "loop-phase:testing"              # Phase 5
  lci-eval: "loop-phase:lci-eval"            # Phase 6
  refactoring: "loop-phase:refactoring"      # Phase 7
  deprecated-cleanup: "loop-phase:deprecated-cleanup"  # Phase 8
  final-validation: "loop-phase:final-validation"      # Phase 9
```
