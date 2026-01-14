---
name: adversarial-refactor
description: Safe refactoring with adversarial behavior verification
---

# Adversarial Refactor Loop

Safe refactoring with continuous behavior verification.

**Context Rule**: Runs INSIDE a subagent (fresh context for this refactor only).

## Core Principle

**Refactoring must preserve behavior exactly.**

Any behavioral change is a bug, not a refactor.

## Execution Phases

### Phase 1: Refactor Analysis (10% of time)

**Objective**: Understand current code and refactor goals

**Steps**:
1. Read code to be refactored
2. Identify code smells and issues
3. Define refactor goals
4. Assess risk level
5. Create refactor plan

**Code Smells to Look For**:
- Long functions (>50 lines)
- Duplicated code
- Large classes
- Long parameter lists
- Divergent change
- Shotgun surgery
- Feature envy
- Data clumps

**Refactor Goals**:
```yaml
refactor_goals:
  - goal: "Extract method for validation logic"
    risk: "Low"
    why: "Improves readability, reduces duplication"

  - goal: "Split large UserService class"
    risk: "Medium"
    why: "Single responsibility, better testability"
```

### Phase 2: Behavior Baseline (15% of time)

**Objective**: Establish current behavior as baseline

**Steps**:
1. Run all existing tests - record results
2. Identify gaps in test coverage
3. Add characterization tests if needed
4. Generate behavior specification

**Characterization Tests**:
```yaml
characterization:
  purpose: "Capture current behavior, even if not ideal"

  examples:
    - "Function throws TypeError on null input (preserve)"
    - "API returns 200 with invalid data (preserve for now)"
    - "Race condition exists (document, don't fix in refactor)"

  goal: "Ensure refactor changes NOTHING behaviorally"
```

**Baseline Report**:
```yaml
baseline:
  tests_total: 45
  tests_passing: 45
  tests_failing: 0
  coverage: 85%

  behavior_spec:
    - input: "valid user"
      output: "user created"
    - input: "duplicate email"
      output: "error 409"
    - input: "null"
      output: "TypeError"  # Even if not ideal!
```

### Phase 3: Incremental Refactoring (40% of time)

**Objective**: Execute refactor in small, verifiable steps

**Pattern**: Refactor → Verify → Commit → Repeat

**Incremental Steps**:
```yaml
step_size:
  guideline: "Each step should take 5-10 minutes max"

  examples:
    good_steps:
      - "Extract one method"
      - "Rename one variable"
      - "Move one function to new file"

    bad_steps:
      - "Rewrite entire module"
      - "Change architecture"
      - "Refactor and add features"

  verification_after_each_step:
    - "Run tests"
    - "Verify behavior unchanged"
    - "Git commit if passed"
```

**Refactor Catalog**:
```yaml
safe_refactors:
  extract_method:
    risk: "Low"
    verify: "Tests pass"

  rename:
    risk: "Low"
    verify: "No compilation errors, tests pass"

  move_function:
    risk: "Low"
    verify: "Imports correct, tests pass"

  extract_class:
    risk: "Medium"
    verify: "Tests pass, behavior identical"

  change_signature:
    risk: "High"
    verify: "All callers updated, tests pass"
```

**After Each Step**:
1. Run tests
2. Compare behavior to baseline
3. If passed: Git commit
4. If failed: Revert and try different approach

### Phase 4: Adversarial Behavior Comparison (20% of time)

**Objective**: Verify behavior is EXACTLY preserved

**Adversarial Mindset**: "Prove the behavior changed"

**Comparison Techniques**:
```yaml
behavior_verification:
  test_comparison:
    - "All original tests still pass"
    - "Same tests, same results"
    - "No new failures"

  output_comparison:
    - "Same inputs produce same outputs"
    - "Error messages identical"
    - "Side effects identical"

  property_testing:
    - "Generate random inputs"
    - "Compare old vs new behavior"
    - "Find any divergence"

  snapshot_testing:
    - "Capture outputs before refactor"
    - "Compare outputs after refactor"
    - "Flag any differences"
```

**Adversarial Challenges**:
- "What input produces different output?"
- "What state causes different behavior?"
- "What edge case breaks equivalence?"
- "What timing changes behavior?"
- "What resource limit exposes difference?"

**If Behavior Changed**: Not a refactor - revert or fix

### Phase 5: Quality Validation (10% of time)

**Objective**: Confirm refactor achieved goals

**Validation**:
```yaml
quality_checks:
  goals_met:
    - "Each refactor goal from Phase 1 achieved"
    - "Code smells reduced"

  metrics_improved:
    - "Cyclomatic complexity decreased"
    - "Function length reduced"
    - "Duplication reduced"

  maintainability:
    - "Code is more readable"
    - "Easier to test"
    - "Easier to extend"

  no_regressions:
    - "All tests pass"
    - "No new warnings"
    - "Performance not degraded"
```

### Phase 6: Refactor Report (5% of time)

**Report Structure**:
```yaml
refactor_report:
  summary: "What was refactored and why"

  changes:
    - type: "extract_method"
      description: "Extracted validation logic"
      files: ["user.service.ts"]
      lines_before: 150
      lines_after: 120

  verification:
    behavior_preserved: true
    all_tests_pass: true
    baseline_match: true

  improvements:
    - "Cyclomatic complexity: 15 → 8"
    - "Max function length: 80 → 25 lines"
    - "Code duplication: 20% → 5%"

  commits: 8
  total_time: "45m"
```

## Context Management

**Between Steps**: Minimal - stay focused on refactor

**Between Phases**: Write checkpoint, reset adversarial mindset

**Verification Isolation**: Consider spawning verifier agent for Phase 4

## Failure Protocol

If behavior changes detected:

```yaml
failure_protocol:
  immediate:
    - "Revert to last good commit"
    - "Document what diverged"
    - "Decide: fix or abandon refactor"

  never:
    - "Proceed with behavioral changes"
    - "Call it a refactor if behavior changed"
    - "Skip verification steps"
```

## Usage

This skill is invoked by workflow:task-executor agent when loop type is "refactor".

**Key Success Factor**: Small steps + continuous verification = safe refactoring
