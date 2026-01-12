---
name: adversarial-quality-loop
description: Adversarial cooperation loop for code quality verification with plan adjustment at each phase
---

# Adversarial Quality Loop (Ralph Wiggum Pattern)

A continuous execution loop where an implementer and verifier cooperate adversarially to ensure code quality. The verifier actively tries to find flaws while the implementer defends and fixes.

## Core Principles

### Context-Sized Tasks
Each task in the loop must be:
- **Scoped**: Completable in a single focused session
- **Isolated**: Independent of other concurrent work
- **Measurable**: Clear definition of done
- **Bounded**: Maximum 3-5 files per task

### Plan Adjustment Protocol
At the end of EACH phase, **automatically** (do not stop for confirmation):
1. Review what was discovered
2. Update remaining tasks based on findings
3. Re-prioritize if blocking issues found
4. Document adjustments in task comments
5. **Continue immediately** to next phase unless BLOCKED

```yaml
plan_adjustment_rules:
  automatic_continuation:
    description: "Phase transitions are automatic, not approval gates"
    behavior: "Adjust plan silently and continue"

  when_to_stop:
    - "Task scope exceeds limits (split required)"
    - "Critical blocker found (cannot proceed)"
    - "Security vulnerability discovered (must fix first)"
    - "All tests failing with no clear fix"

  when_to_continue:
    - "Minor issues found (add fix tasks, continue)"
    - "Scope clarification needed (note and continue)"
    - "New edge cases discovered (add to plan, continue)"
    - "Pattern conflicts found (note for later, continue)"

  never_ask:
    - "Should I continue?"
    - "Do you want me to proceed?"
    - "Is this plan okay?"
    - "Ready for next phase?"
```

---

## Eagle-Eyed Violations (IMMEDIATE REJECTION)

The verifier must be **ruthlessly vigilant** for these violations. Any occurrence is grounds for immediate rejection and rework.

### 1. Scope Creep & Gold Plating
```yaml
scope_violations:
  extra_features:
    description: "Adding functionality not explicitly requested"
    examples:
      - "Adding a cache when not asked"
      - "Implementing additional API endpoints"
      - "Adding configuration options not in requirements"
      - "Building abstractions for 'future flexibility'"
    detection: "Compare every line to acceptance criteria"
    verdict: "REJECT - remove all unrequested features"

  gold_plating:
    description: "Polishing beyond requirements"
    examples:
      - "Adding extra logging 'just in case'"
      - "Implementing unused error codes"
      - "Adding comments explaining obvious code"
      - "Creating helper functions used only once"
    detection: "Ask: 'Is this strictly necessary for the task?'"
    verdict: "REJECT - simplify to minimum viable"

  premature_abstraction:
    description: "Creating abstractions before needed"
    examples:
      - "Creating interfaces with single implementation"
      - "Building factory patterns for one class"
      - "Adding plugin systems when not requested"
      - "Designing for 'extensibility' not in requirements"
    detection: "Count implementations per abstraction"
    verdict: "REJECT - inline until actually needed"
```

### 2. Over-Engineering & Complexity
```yaml
complexity_violations:
  over_engineering:
    description: "Solutions more complex than the problem"
    examples:
      - "Using design patterns where simple code works"
      - "Adding layers of indirection"
      - "Creating class hierarchies for simple data"
      - "Implementing state machines for linear flows"
    detection: "Can a junior developer understand this in 5 minutes?"
    verdict: "REJECT - simplify until obvious"

  unnecessary_abstraction:
    description: "Abstractions that hide rather than clarify"
    examples:
      - "Wrapping simple operations in classes"
      - "Creating DSLs for straightforward logic"
      - "Building frameworks instead of solutions"
      - "Multiple layers doing the same validation"
    detection: "Count the call stack depth for simple operations"
    verdict: "REJECT - flatten and simplify"

  clever_code:
    description: "Code that prioritizes cleverness over clarity"
    examples:
      - "One-liners that do too much"
      - "Operator overloading for non-obvious behavior"
      - "Metaprogramming when explicit code works"
      - "Regex when string operations suffice"
    detection: "Would you need a comment to explain it?"
    verdict: "REJECT - write boring, obvious code"

  complexity_metrics:
    cyclomatic_complexity: "max 10 per function"
    nesting_depth: "max 3 levels"
    function_length: "max 30 lines"
    parameter_count: "max 4 parameters"
```

### 3. Incomplete Work Markers
```yaml
marker_violations:
  todo_comments:
    patterns:
      - "TODO"
      - "TODO:"
      - "// TODO"
      - "# TODO"
      - "/* TODO"
      - "@todo"
    verdict: "REJECT - complete or remove, no exceptions"

  fixme_comments:
    patterns:
      - "FIXME"
      - "FIXME:"
      - "// FIXME"
      - "# FIXME"
      - "/* FIXME"
      - "@fixme"
    verdict: "REJECT - fix now or document why impossible"

  hack_markers:
    patterns:
      - "HACK"
      - "XXX"
      - "KLUDGE"
      - "WORKAROUND"
      - "TEMPORARY"
      - "TEMP"
    verdict: "REJECT - implement properly or escalate"

  incomplete_markers:
    patterns:
      - "NOT IMPLEMENTED"
      - "STUB"
      - "PLACEHOLDER"
      - "WIP"
      - "TBD"
      - "TBC"
      - "..."  # in function bodies
      - "pass"  # empty Python functions
      - "throw new NotImplementedError"
    verdict: "REJECT - complete implementation required"

  debt_markers:
    patterns:
      - "TECH DEBT"
      - "REFACTOR"
      - "CLEANUP"
      - "OPTIMIZE LATER"
      - "NEEDS WORK"
    verdict: "REJECT - do the work now or remove the code"
```

### 4. Giving Up / "Too Hard" Cop-outs
```yaml
cop_out_violations:
  surrender_phrases:
    in_code_comments:
      - "This is too complex to..."
      - "I couldn't figure out how to..."
      - "This might not work for..."
      - "Not sure if this handles..."
      - "Hopefully this works"
      - "Should be good enough"
      - "Works on my machine"
    verdict: "REJECT - uncertainty is not acceptable"

  incomplete_error_handling:
    patterns:
      - "catch (e) { }"  # empty catch
      - "catch (e) { console.log(e) }"  # log and continue
      - "// ignore errors"
      - "try { } catch { return null }"  # swallow and return
      - "except: pass"  # Python catch-all
    verdict: "REJECT - handle errors properly or let them propagate"

  partial_implementations:
    signs:
      - "Only handles the common case"
      - "Edge cases not implemented"
      - "Works for most inputs"
      - "Assuming valid input"
      - "Happy path only"
    verdict: "REJECT - complete implementation or document as limitation"

  complexity_surrender:
    phrases:
      - "This is a known limitation"
      - "Out of scope for this task"
      - "Would require significant refactoring"
      - "Too risky to change"
      - "Legacy code constraint"
    required_response: |
      If genuinely blocked, STOP and report:
      1. Specific technical blocker
      2. What would be needed to resolve
      3. Request task reassessment
      DO NOT commit partial or broken code
```

### 5. Seamless Integration Requirement
```yaml
seamless_integration:
  principle: "Code must be indistinguishable from existing codebase"

  requirements:
    style:
      - "Match exact formatting, indentation, spacing"
      - "Follow same naming conventions"
      - "Use same comment style"
      - "Match existing file organization"

    patterns:
      - "Use same error handling approach"
      - "Use same logging patterns"
      - "Use same test patterns"
      - "Reuse existing utilities"

    architecture:
      - "Follow established module boundaries"
      - "Use existing abstractions"
      - "No new patterns unless requested"
      - "Fit naturally into existing structure"

  detection:
    question: "Could this code have been written by original author?"
    test: "Can you tell which code is new vs existing?"

  verification:
    - Use LCI to find similar patterns in codebase
    - Compare style with surrounding code
    - Check for reuse of existing helpers
    - Verify naming matches conventions

  verdict: "REJECT if new code stands out as an addition"
```

### 6. Test Ownership Rule
```yaml
test_ownership:
  rule: "ALL tests must pass - no exceptions, no blame"

  forbidden_excuses:
    - "This test failure is unrelated to my change"
    - "That's a pre-existing failure"
    - "The test was already flaky"
    - "Not my test, not my problem"
    - "That failure is in a different module"
    - "Someone else broke that test"
    - "The CI was already red"

  required_behavior: |
    If ANY test fails:
    1. FIX IT - regardless of who wrote it or when it broke
    2. If truly blocking and unrelated: escalate as BLOCKER
    3. NEVER proceed with failing tests
    4. NEVER blame others or prior state
    The codebase must ALWAYS be green.

  verdict: "REJECT - cannot merge with ANY failing test"
```

### 7. Eagle-Eye Verification Checklist
```yaml
eagle_eye_scan:
  run_before_any_approval: true

  automated_checks:
    - grep_for_todo: "grep -rn 'TODO\\|FIXME\\|XXX\\|HACK' --include='*.{js,ts,py,go,rs}'"
    - grep_for_debug: "grep -rn 'console\\.log\\|print(\\|debugger' --include='*.{js,ts,py}'"
    - count_new_abstractions: "diff --stat | count new class/interface definitions"
    - measure_complexity: "run complexity analyzer on changed files"

  manual_checks:
    scope_check:
      question: "Does every change trace to a specific requirement?"
      fail_action: "Remove any change that cannot be justified"

    simplicity_check:
      question: "Is this the simplest solution that works?"
      fail_action: "Simplify until a junior dev would understand"

    completeness_check:
      question: "Are there any TODO/FIXME/incomplete markers?"
      fail_action: "Complete the work or escalate as blocker"

    confidence_check:
      question: "Are there any uncertain comments or partial implementations?"
      fail_action: "Make it work completely or report as blocked"

    seamless_check:
      question: "Does new code blend seamlessly with existing codebase?"
      fail_action: "Refactor to match existing patterns exactly"

    test_check:
      question: "Do ALL tests pass?"
      fail_action: "Fix failing tests - no exceptions"

  verdict_rules:
    any_violation: "REJECT immediately"
    borderline_case: "REJECT - when in doubt, simplify"
    disputed_feature: "REJECT - if not in requirements, remove it"
    failing_test: "REJECT - fix it first"
    non_seamless_code: "REJECT - must blend with codebase"
```

---

## Phase 1: Implementation Review

### Task: Analyze Implementation Scope

**DO (Positive Instructions):**
- Read the task description completely
- Identify ALL files that will be modified
- List explicit acceptance criteria from task
- Note implicit requirements from context
- Create checklist of verifiable outcomes

**DO NOT (Negative Instructions):**
- Assume requirements not stated
- Skip reading related code
- Ignore test file requirements
- Overlook documentation needs
- Start coding before understanding

**Verification Criteria:**
```yaml
pass_if:
  - acceptance_criteria_listed: true
  - files_identified: true
  - scope_bounded: max_5_files
  - checklist_created: true
fail_if:
  - scope_unclear: true
  - missing_acceptance_criteria: true
  - unbounded_changes: true
```

### Plan Adjustment Point 1 (Automatic - Do Not Stop)
```yaml
checkpoint:
  validate:
    - scope_bounded: "max 5 files"
    - acceptance_criteria_clear: true
    - no_blockers: true

  auto_adjust:
    scope_exceeds_5_files: "Split into subtasks, add to plan, CONTINUE"
    requirements_unclear: "Add clarification note, CONTINUE"
    dependencies_found: "Reorder in plan, CONTINUE"

  stop_only_if:
    critical_blocker: "Cannot determine scope at all"

  then: "Proceed immediately to Phase 2"
```

---

## Phase 2: Adversarial Implementation

### Task: Implement with Defensive Coding

**DO (Positive Instructions):**
- Implement the minimum necessary changes
- Add error handling for all edge cases
- Write self-documenting code with clear names
- Follow existing patterns in the codebase
- Add inline comments for complex logic only

**DO NOT (Negative Instructions):**
- Add features not in requirements
- Refactor unrelated code
- Use magic numbers or strings
- Skip error handling
- Create technical debt knowingly

**Verification Criteria:**
```yaml
pass_if:
  - compiles_without_error: true
  - no_new_lint_errors: true
  - follows_existing_patterns: true
  - changes_match_requirements: true
fail_if:
  - introduces_bugs: true
  - breaks_existing_tests: true
  - scope_creep: true
  - lint_errors_introduced: true
```

### Task: Self-Adversarial Review

Before submitting, attack your own code:

**DO (Positive Instructions):**
- Try to break your implementation with edge cases
- Search for similar code that might conflict
- Verify error messages are helpful
- Check for resource leaks
- Test with null/empty/large inputs

**DO NOT (Negative Instructions):**
- Assume happy path is sufficient
- Skip testing error paths
- Ignore potential race conditions
- Overlook security implications
- Trust external input

**Verification Criteria:**
```yaml
pass_if:
  - edge_cases_tested: true
  - error_paths_verified: true
  - no_resource_leaks: true
  - security_checked: true
fail_if:
  - untested_edge_cases: true
  - unchecked_errors: true
  - potential_leaks: true
```

### Plan Adjustment Point 2 (Automatic - Do Not Stop)
```yaml
checkpoint:
  validate:
    - implementation_compiles: true
    - no_lint_errors: true
    - self_review_complete: true

  auto_adjust:
    edge_case_issues: "Fix immediately inline, CONTINUE"
    pattern_conflicts: "Note for backlog, CONTINUE"
    security_concerns: "Add security task to plan, CONTINUE"
    scope_drift: "Trim back to requirements, CONTINUE"

  stop_only_if:
    critical_blocker: "Cannot compile or fundamental design flaw"

  then: "Proceed immediately to Phase 3"
```

---

## Phase 3: Adversarial Verification

### Task: External Code Review (Verifier Role)

The verifier attempts to find flaws:

**DO (Positive Instructions):**
- Challenge every assumption
- Search for duplicate functionality with LCI
- Verify naming consistency across codebase
- Check for SOLID principle violations
- Validate error handling completeness

**DO NOT (Negative Instructions):**
- Accept code at face value
- Skip comparing with existing patterns
- Ignore minor inconsistencies
- Assume tests cover everything
- Approve without understanding

**Verification Test Suite:**
```yaml
test_categories:
  happy_path:  # 50% of verification
    - standard_input_produces_expected_output
    - all_acceptance_criteria_met
    - integration_with_existing_code_works

  edge_cases:  # 30% of verification
    - empty_input_handled_gracefully
    - maximum_size_input_works
    - concurrent_access_safe
    - timeout_handling_correct

  adversarial:  # 20% of verification
    - malformed_input_rejected
    - injection_attempts_blocked
    - resource_exhaustion_prevented
    - error_messages_safe
```

**Verification Criteria:**
```yaml
pass_if:
  - all_happy_path_tests_pass: true
  - edge_case_coverage: ">= 80%"
  - no_adversarial_failures: true
  - code_review_approved: true
fail_if:
  - any_happy_path_fails: true
  - critical_edge_case_fails: true
  - adversarial_vulnerability_found: true
```

### Plan Adjustment Point 3 (Automatic - Do Not Stop)
```yaml
checkpoint:
  validate:
    - happy_path_tests_pass: true
    - edge_case_coverage: ">= 80%"
    - no_critical_vulnerabilities: true

  auto_adjust:
    failures_found: "Fix inline and re-verify, CONTINUE"
    patterns_emerge: "Add systemic fix to plan, CONTINUE"
    new_edge_cases: "Add to test suite, CONTINUE"
    minor_issues: "Fix immediately, CONTINUE"

  stop_only_if:
    critical_blocker: "Security vulnerability or fundamental failure"

  then: "Proceed immediately to Phase 4"
```

---

## Phase 4: Quality Gate Verification

### Task: Automated Quality Checks

Run and verify all automated tools:

**DO (Positive Instructions):**
- Run linter with strict settings
- Execute full test suite
- Check test coverage metrics
- Verify documentation generated
- Run static analysis tools

**DO NOT (Negative Instructions):**
- Ignore warnings (review each one)
- Skip slow tests
- Accept coverage decreases
- Skip documentation checks
- Disable any linter rules

**Verification Matrix:**
```yaml
quality_gates:
  linting:
    pass: "zero errors"
    warn: "warnings < 3"
    fail: "any errors"

  testing:
    pass: "all tests pass"
    warn: "flaky tests flagged"
    fail: "any test fails"

  coverage:
    pass: "coverage >= baseline"
    warn: "coverage within 2%"
    fail: "coverage drop > 2%"

  static_analysis:
    pass: "no new issues"
    warn: "minor issues < 3"
    fail: "critical issues"
```

### Plan Adjustment Point 4 (Automatic - Do Not Stop)
```yaml
checkpoint:
  validate:
    - linting_passes: true
    - all_tests_pass: true
    - coverage_maintained: true
    - static_analysis_clean: true

  auto_adjust:
    lint_failures: "Fix lint errors, re-run, CONTINUE"
    test_failures: "Fix tests (you own them ALL), re-run, CONTINUE"
    coverage_drop: "Add tests for uncovered code, CONTINUE"
    warnings: "Review and fix if reasonable, CONTINUE"

  stop_only_if:
    critical_blocker: "Cannot pass tests after multiple fix attempts"

  then: "Proceed immediately to Phase 5"
```

---

## Phase 5: Final Validation

### Task: Acceptance Criteria Verification

Final check against original requirements:

**DO (Positive Instructions):**
- Re-read original task description
- Verify EACH acceptance criterion explicitly
- Confirm no scope creep occurred
- Validate documentation is complete
- Ensure clean commit history

**DO NOT (Negative Instructions):**
- Mark done without verifying criteria
- Skip documentation review
- Leave TODO comments unresolved
- Commit debug code
- Merge with failing checks

**Final Verification Checklist:**
```yaml
acceptance_verification:
  - criterion_1_met: "describe how verified"
  - criterion_2_met: "describe how verified"
  - criterion_N_met: "describe how verified"

no_regressions:
  - existing_features_work: true
  - no_new_warnings: true
  - performance_acceptable: true

documentation:
  - code_comments_complete: true
  - changelog_updated: true
  - api_docs_updated: "if applicable"
```

---

## Loop Continuation Protocol

After Phase 5 completes:

1. **On Success:**
   - Update task status to Done
   - Add completion comment with summary
   - Log metrics (time, issues found, fixes made)
   - Fetch next task and restart at Phase 1

2. **On Failure:**
   - Document specific failure point
   - Add failure comment with details
   - Create follow-up fix task if needed
   - STOP loop - do not continue to next task

3. **Plan Adjustment Summary:**
   ```yaml
   log_adjustments:
     phase_1_adjustments: "scope changes"
     phase_2_adjustments: "implementation discoveries"
     phase_3_adjustments: "verification findings"
     phase_4_adjustments: "quality gate results"
     phase_5_adjustments: "final validation notes"
   ```

---

## Metrics and Tracking

Track per-task:
- Time in each phase
- Adjustments made at each point
- Issues found by category
- Fix effectiveness rate

Track across tasks:
- Common failure patterns
- Phase bottlenecks
- Adjustment frequency
- Quality trend over time
