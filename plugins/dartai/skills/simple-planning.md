---
name: simple-planning
description: Create minimal, focused task plans using adversarial discipline - no over-engineering allowed
---

# Simple Planning Skill (Adversarial Cooperation)

Create minimal task plans that deliver exactly what's requested - nothing more.

## Planning Philosophy

```yaml
core_principle: "The best plan is the smallest plan that works"

planning_rules:
  required:
    - "What exactly was requested?"
    - "What's the minimum change to deliver it?"
    - "How will we verify it works?"

  forbidden:
    - "While we're at it..."
    - "We should also..."
    - "It would be better to..."
    - "For future flexibility..."
```

---

## Plan Template

```yaml
# Task Plan: [One-line description]

requested: |
  [Exact user request - copy their words]

deliverable: |
  [Concrete output - what will exist when done]

scope:
  files_to_modify: # Max 5
    - path/to/file1.ext
    - path/to/file2.ext

  files_to_create: # Only if required
    - path/to/new-file.ext

  files_to_delete: # Only if replacing
    - path/to/obsolete.ext

acceptance_criteria:
  - "Criterion 1 - how to verify"
  - "Criterion 2 - how to verify"

steps:
  1: "First atomic action"
  2: "Second atomic action"
  3: "Verify it works"

not_included: # Explicitly list what we WON'T do
  - "Refactoring unrelated code"
  - "Adding extra features"
  - "Updating documentation beyond changed API"
```

---

## Eagle-Eyed Planning Discipline

### Scope Violations to Reject

```yaml
scope_creep:
  phrases_that_expand_scope:
    - "While we're in here, we should also..."
    - "It would be nice to add..."
    - "We could improve this by..."
    - "For completeness, let's also..."
    - "We should future-proof by..."

  response: "STOP. Remove from plan. Only what was requested."

extra_files:
  trigger: "Plan touches > 5 files"
  response: "STOP. Split into smaller tasks."

premature_abstraction:
  trigger: "Creating interface/factory/abstraction for single use"
  response: "STOP. Use concrete implementation. Abstract when needed."
```

### Complexity Violations to Reject

```yaml
over_engineering:
  patterns:
    - "Generic framework when specific code works"
    - "Configuration system for one value"
    - "Plugin architecture for one plugin"
    - "Event system for one event"

  response: "STOP. Use simplest solution. Complexity is debt."

unnecessary_flexibility:
  patterns:
    - "Supporting multiple formats when one is needed"
    - "Parametric when hardcoded works"
    - "Async when sync is sufficient"
    - "Interface when concrete type is known"

  response: "STOP. YAGNI. Implement what's needed now."
```

### Planning Anti-Patterns to Reject

```yaml
vague_steps:
  bad:
    - "Implement the feature"
    - "Add tests"
    - "Handle errors"
  good:
    - "Add parseConfig() function to config.ts"
    - "Add test for empty input in config.test.ts"
    - "Return ConfigError for invalid JSON"

unbounded_scope:
  bad:
    - "Update all error messages"
    - "Improve test coverage"
    - "Refactor authentication"
  good:
    - "Fix error message in login.ts:42"
    - "Add test for login timeout"
    - "Extract validateToken from auth.ts"
```

---

## Planning Process

### Step 1: Capture Request (30 seconds)

```yaml
capture:
  - Copy exact user request
  - Identify the ONE thing being asked
  - Note any explicit constraints

  do_not:
    - Interpret beyond what's written
    - Add implicit requirements
    - Assume additional context
```

### Step 2: Define Deliverable (30 seconds)

```yaml
define:
  - What will exist when done?
  - How will user verify it works?
  - What's the smallest change that delivers this?

  test: "Can I point to a specific thing and say 'this is what you asked for'?"
```

### Step 3: Identify Files (1 minute)

```yaml
file_identification:
  use_lci:
    - Search for related symbols
    - Find existing patterns to follow
    - Locate where changes belong

  constraints:
    - Max 5 files modified
    - If more needed: STOP, split task
    - Prefer editing over creating
```

### Step 4: List Steps (1 minute)

```yaml
step_creation:
  rules:
    - Each step is one atomic action
    - Steps are verifiable (test can run, lint can check)
    - Max 7 steps per plan
    - If more needed: STOP, split task

  format:
    - "Add X to Y"
    - "Modify X to do Y"
    - "Remove X from Y"
    - "Run tests/lint to verify"
```

### Step 5: Define Not-Included (30 seconds)

```yaml
exclusions:
  purpose: "Prevent scope creep during execution"

  list_what_we_will_not_do:
    - Related features not requested
    - Refactoring opportunities noticed
    - Documentation updates not required
    - Test additions beyond changed code
```

---

## Context-Sized Task Validation

Before accepting a plan, verify:

```yaml
size_check:
  files: "<= 5"
  steps: "<= 7"
  estimated_changes: "< 200 lines added/modified"

  if_exceeds:
    action: "Split into multiple tasks"
    pattern: |
      Task 1: [First deliverable]
      Task 2: [Second deliverable] - depends on Task 1
      Task 3: [Third deliverable] - depends on Task 2
```

---

## Plan Adjustment Protocol

Plans adjust automatically during execution - no stopping for approval:

```yaml
adjustment_triggers:
  discovery:
    trigger: "Found simpler approach"
    action: "Update plan, note change, continue"

  complication:
    trigger: "Step harder than expected"
    action: |
      If still within scope: Add sub-steps, continue
      If scope expands: STOP, split task

  error:
    trigger: "Step fails"
    action: "Fix error as new step, continue"

never_ask:
  - "Should I continue with this plan?"
  - "Is this approach okay?"
  - "Do you want me to proceed?"

always_do:
  - "Make adjustment"
  - "Note what changed"
  - "Keep executing"
```

---

## Example Plans

### Good: Minimal and Focused

```yaml
# Task Plan: Add logout button to header

requested: "Add a logout button to the header"

deliverable: "Logout button in header that clears session and redirects to login"

scope:
  files_to_modify:
    - src/components/Header.tsx
    - src/services/auth.ts

acceptance_criteria:
  - "Button visible in header when logged in"
  - "Clicking button clears session"
  - "User redirected to /login"

steps:
  1: "Add logout() function to auth.ts using existing clearSession pattern"
  2: "Add LogoutButton to Header.tsx matching existing button styles"
  3: "Wire button onClick to logout() then redirect"
  4: "Run existing tests to verify no regression"

not_included:
  - "Confirmation dialog"
  - "Logout animation"
  - "Session timeout feature"
  - "Refactoring auth.ts"
```

### Bad: Over-Engineered

```yaml
# REJECTED - Too complex

requested: "Add a logout button to the header"

# VIOLATION: Scope creep
deliverable: "Complete session management system with logout, timeout, and refresh"

# VIOLATION: Too many files
scope:
  files_to_modify:
    - src/components/Header.tsx
    - src/services/auth.ts
    - src/services/session.ts      # NEW - not needed
    - src/hooks/useSession.ts      # NEW - not needed
    - src/contexts/AuthContext.tsx # NEW - not needed
    - src/utils/storage.ts         # not needed
    - src/types/auth.ts            # not needed

# VIOLATION: Extra features
steps:
  1: "Create session management abstraction"     # over-engineering
  2: "Add session timeout detection"             # not requested
  3: "Create AuthContext for state management"   # not needed for button
  4: "Add useSession hook"                       # not needed
  5: "Implement logout with cleanup"
  6: "Add confirmation dialog"                   # not requested
  7: "Add logout event broadcasting"             # not requested
  8: "Update all components to use context"      # scope explosion
```

---

## Self-Verification Checklist

Before finalizing plan, verify:

```yaml
checklist:
  scope:
    - [ ] Plan delivers exactly what was requested
    - [ ] No features added beyond request
    - [ ] Files touched <= 5
    - [ ] Steps <= 7

  simplicity:
    - [ ] Simplest solution that works
    - [ ] No premature abstractions
    - [ ] No future-proofing
    - [ ] Uses existing patterns

  clarity:
    - [ ] Each step is atomic and verifiable
    - [ ] Deliverable is concrete and testable
    - [ ] Not-included list prevents scope creep

  integration:
    - [ ] Follows existing code patterns
    - [ ] Uses existing utilities
    - [ ] Changes blend with codebase
```

---

## When to Split a Task

```yaml
split_indicators:
  - "This requires changes to > 5 files"
  - "There are multiple independent deliverables"
  - "Steps exceed 7"
  - "Estimated changes > 200 lines"
  - "Task has 'and' connecting unrelated work"

split_pattern:
  original: "Add logout button and session timeout"
  split_into:
    - "Task 1: Add logout button to header"
    - "Task 2: Add session timeout detection (depends on Task 1)"

split_action: "Create separate Dart tasks for each deliverable"
```

---

## Summary

```yaml
planning_mantras:
  - "What's the smallest change that delivers the request?"
  - "If in doubt, leave it out"
  - "Simple now beats flexible later"
  - "One task, one deliverable, one plan"
  - "Plans adjust automatically, never ask"
```
