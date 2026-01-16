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

## Request Complexity Classification

Before planning, classify the request to set appropriate validation depth.

```yaml
complexity_tiers:
  minimal:
    indicators:
      - Single file change
      - Clear, bounded request
      - No clarification needed
      - Trivial scope (typo, text change, add button)
    examples:
      - "Fix typo in README"
      - "Update error message text"
      - "Add margin to header"
    validation_depth: quick_scan
    validation_time: "~30 seconds"

  standard:
    indicators:
      - 2-5 files affected
      - Single feature or fix
      - Minor clarification needed
      - Moderate scope (new function, bug fix)
    examples:
      - "Add logout button to header"
      - "Fix null pointer in login"
      - "Refactor parseConfig function"
    validation_depth: standard_review
    validation_time: "~2 minutes"

  comprehensive:
    indicators:
      - 5+ files or multiple components
      - Multiple acceptance criteria
      - Significant user discussion
      - Substantial scope (new feature, module)
    examples:
      - "Implement user authentication"
      - "Add search functionality"
      - "Create settings page"
    validation_depth: deep_analysis
    validation_time: "~5 minutes"

  architectural:
    indicators:
      - Cross-cutting concerns
      - Multiple subsystems affected
      - New patterns or abstractions needed
      - Large scope (application, redesign)
    examples:
      - "Build 30-screen dashboard app"
      - "Redesign data layer"
      - "Implement plugin system"
    validation_depth: full_adversarial
    validation_time: "~10 minutes"

tier_detection:
  rules:
    - "Count files mentioned or implied"
    - "Count acceptance criteria"
    - "Measure user discussion length"
    - "Detect cross-cutting keywords"

  escalation_triggers:
    - user_clarification_count: ">= 3 → bump tier"
    - files_affected: ">= 5 → comprehensive minimum"
    - subsystems_affected: ">= 2 → architectural"
    - new_patterns_needed: "true → architectural"

  user_response_impact:
    - "Each clarification question adds context"
    - "Stated preferences become constraints"
    - "Explicit scope limits respected"
```

---

## Planning Process

### Step 0: Classify Complexity (15 seconds)

```yaml
classify:
  assess:
    - How many files will this touch?
    - How many acceptance criteria exist?
    - How much clarification was needed?
    - Does this cross system boundaries?

  assign_tier:
    minimal: "1 file, clear request, trivial change"
    standard: "2-5 files, single feature, bounded"
    comprehensive: "5+ files, multiple criteria, significant"
    architectural: "cross-cutting, new patterns, large scope"

  record:
    - Note the tier for validation phase
    - Tier affects validation depth, not planning depth
    - All plans follow same minimal structure

  user_responses_matter:
    - "User stated 'keep it simple' → respect scope limit"
    - "User clarified 'just X, not Y' → exclude Y from plan"
    - "User gave specific approach → use that approach"
```

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

## Adversarial Plan Validation

After creating a plan, validate it adversarially. Validation depth matches the complexity tier from Step 0.

### Validation Categories

```yaml
categories:
  missing:
    description: "Required tasks omitted from plan"
    scan_for:
      - Feature without test task
      - Schema change without migration
      - API change without docs update
      - New component without integration
      - Error path without handling
    severity: high
    action: "Add missing task"

  overbuilt:
    description: "Tasks exceeding the request"
    scan_for:
      - Abstractions for single use
      - Config systems for one value
      - Features not in acceptance criteria
      - "While we're at it" additions
      - Future-proofing not requested
    severity: high
    action: "Remove from plan"

  conflicting:
    description: "Tasks that contradict each other or request"
    scan_for:
      - Task undoes previous task's work
      - Approach differs from user preference
      - Steps assume incompatible states
      - Competing implementations
    severity: critical
    action: "Resolve before proceeding"

  partial:
    description: "Incomplete or vague tasks"
    scan_for:
      - "Implement feature" (too vague)
      - "Handle errors" (which ones?)
      - "Update tests" (which tests?)
      - Missing acceptance criteria
      - Undefined boundaries
    severity: medium
    action: "Make specific"

  research_needed:
    description: "Unknowns blocking confident planning"
    scan_for:
      - Unknown existing patterns
      - Unclear dependencies
      - Ambiguous requirements
      - Untested assumptions
    severity: medium
    action: "Add research task first"
```

### Validation by Tier

#### Minimal Tier (~30 seconds)

```yaml
quick_scan:
  trigger: "Single file, clear request, trivial change"
  checks:
    - request_match: "Plan delivers exactly what was asked"
    - obvious_gaps: "No glaring omissions"
    - scope_fit: "Change matches request size"
  skip:
    - pattern_analysis
    - dependency_mapping
    - architecture_review
```

#### Standard Tier (~2 minutes)

```yaml
standard_review:
  trigger: "2-5 files, single feature, minor clarification"
  checks:
    - all_minimal_checks
    - acceptance_coverage: "Each criterion has a task"
    - task_atomicity: "Each task is clear and bounded"
    - pattern_check: "Similar patterns exist (LCI search)"
    - user_alignment: "Plan matches user responses"
  skip:
    - full_architecture_review
    - security_modeling
    - performance_analysis
```

#### Comprehensive Tier (~5 minutes)

```yaml
deep_analysis:
  trigger: "5+ files, multiple criteria, significant discussion"
  checks:
    - all_standard_checks
    - dependency_order: "Task sequence makes sense"
    - integration_points: "All touchpoints identified"
    - edge_cases: "Known edge cases addressed"
    - test_strategy: "Coverage approach defined"
    - rollback_path: "Changes can be reverted"
```

#### Architectural Tier (~10 minutes)

```yaml
full_adversarial:
  trigger: "Cross-cutting, multiple systems, new patterns"
  checks:
    - all_comprehensive_checks
    - architecture_fit: "Plan fits existing architecture"
    - cross_system: "All affected systems identified"
    - research_complete: "Unknowns resolved or explicitly flagged"
    - risk_assessment: "High-risk tasks identified"
    - incremental_delivery: "Can ship in phases"
    - seamless_integration: "New code will blend with existing"
```

### Validation Verdicts

```yaml
verdicts:
  pass:
    condition: "No critical issues, <=2 medium issues"
    action: "Proceed to execution"

  adjust:
    condition: "Fixable issues found"
    action: "Update plan inline, re-validate, continue"

  reject:
    condition: "Critical issues or >3 medium issues"
    action: "Rework plan before proceeding"

  escalate:
    condition: "Cannot resolve without user input"
    action: "Present issues to user, await guidance"
```

### Auto-Adjustment Rules

```yaml
plan_adjustment:
  automatic:
    missing_test_task: "Add test task, continue"
    vague_step: "Make specific, continue"
    minor_scope_creep: "Trim to request, continue"
    research_gap: "Add research task first, continue"

  stop_and_report:
    conflicting_tasks: "Cannot proceed with contradictions"
    user_preference_mismatch: "Approach differs from stated preference"
    scope_explosion: "Plan exceeds limits, must split"
    fundamental_unknown: "Cannot plan without more information"

  never_ask:
    - "Should I continue with this plan?"
    - "Is this validation okay?"
    - "Do you approve these adjustments?"
```

### Validation Report Format

```yaml
plan_validation:
  tier: "[minimal|standard|comprehensive|architectural]"
  request_summary: "One-line original request"
  user_constraints: "Preferences/limits stated by user"

  issues:
    - category: "[missing|overbuilt|conflicting|partial|research]"
      severity: "[critical|high|medium|low]"
      description: "What's wrong"
      location: "Which task/step"
      fix: "How to resolve"

  adjustments_made:
    - "Added test task for new function"
    - "Trimmed unrequested caching feature"
    - "Made 'handle errors' specific to validation errors"

  verdict: "[pass|adjust|reject|escalate]"
  recommendation: "Proceed|Rework|Await user input"
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

## Deep Plan Validation

For **comprehensive** and **architectural** tier tasks, use the **adversarial-planning-loop** skill for thorough validation:

```yaml
adversarial_planning_integration:
  when_to_use:
    - "Comprehensive tier: 5+ files, multiple criteria"
    - "Architectural tier: cross-cutting, new patterns"
    - "Multiple unknowns identified"
    - "External integrations planned"

  what_it_adds:
    hierarchy_validation:
      - "Every acceptance criterion has a task"
      - "Every unknown has research/spike task"
      - "Every integration point has a task"

    research_task_creation:
      - "Identifies genuine unknowns"
      - "Creates time-boxed research tasks"
      - "Creates spike tasks for feasibility"
      - "Prevents analysis paralysis"

    adversarial_challenge:
      - "Challenges every research task's necessity"
      - "Questions every abstraction"
      - "Verifies minimality of plan"
      - "Ensures actionability"

  skip_for:
    - "Minimal tier: single file, trivial change"
    - "Standard tier: when plan is obviously complete"
    - "Simple bug fixes with clear root cause"
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
  - "Research unknowns, not fears"
```
