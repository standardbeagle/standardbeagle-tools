---
name: adversarial-refactor-loop
description: Adversarial cooperation loop for safe refactoring with behavior preservation verification
---

# Adversarial Refactor Loop (Ralph Wiggum Pattern)

A continuous execution loop where a refactorer makes changes while a verifier ensures behavior is preserved. Every refactoring must be provably safe through adversarial verification.

## Core Principles

### Context-Sized Refactoring Tasks
Each refactoring task must be:
- **Atomic**: One refactoring type per task
- **Reversible**: Easy to undo if verification fails
- **Testable**: Behavior can be verified before and after
- **Documented**: Clear rationale and scope

### Refactoring Safety Rules
```yaml
golden_rules:
  - "Never change behavior and structure in same commit"
  - "All tests must pass before AND after"
  - "Refactor in smallest possible increments"
  - "Each step must be independently verifiable"
  - "Stop immediately if any test fails"
```

### Plan Adjustment Protocol
```yaml
plan_adjustment_rules:
  automatic_continuation:
    description: "Phase transitions are automatic, not approval gates"
    behavior: "Adjust plan silently and continue"

  when_to_stop:
    - "Test fails after refactoring step (must fix or revert)"
    - "Behavior change detected (this is not refactoring)"
    - "Scope exceeded original refactoring request"

  when_to_continue:
    - "Step completed successfully (proceed to next step)"
    - "Minor adjustments needed (fix inline, continue)"
    - "New refactoring opportunity found (note for later, continue)"
    - "Better pattern discovered (adopt if fits scope, continue)"

  never_ask:
    - "Should I continue refactoring?"
    - "Is this refactoring complete?"
    - "Ready for next step?"

  per_step_rule: |
    After EACH atomic refactoring step:
    1. Run tests (automatic)
    2. If pass: proceed to next step
    3. If fail: fix or revert, then proceed
    No confirmation needed between steps.
```

---

## Eagle-Eyed Refactoring Violations (IMMEDIATE REJECTION)

The verifier must be **ruthlessly vigilant** for these refactoring anti-patterns. Refactoring is about behavior preservation, not improvement.

### 1. Scope Creep & Opportunistic Changes
```yaml
refactor_scope_violations:
  feature_additions:
    description: "Adding new functionality during refactoring"
    examples:
      - "Adding validation while extracting method"
      - "Improving error messages during rename"
      - "Adding logging while reorganizing"
      - "Fixing bugs discovered during refactoring"
    detection: "Does this change behavior in any way?"
    verdict: "REJECT - behavior changes are separate tasks"

  opportunistic_cleanup:
    description: "Cleaning up unrelated code while refactoring"
    examples:
      - "Fixing formatting in files you didn't change"
      - "Updating imports in unrelated modules"
      - "Removing dead code not part of refactoring"
      - "Improving comments in passing"
    detection: "Is this change in the refactoring scope?"
    verdict: "REJECT - create separate cleanup task"

  scope_expansion:
    description: "Refactoring growing beyond original scope"
    examples:
      - "Started with one method, now touching five classes"
      - "Rename turned into restructure"
      - "Extract method became extract module"
      - "Simple move became architectural change"
    detection: "Is this still the same refactoring?"
    verdict: "REJECT - stop, commit what's done, create new task"

  improvement_creep:
    description: "Making code 'better' beyond request"
    examples:
      - "Optimizing performance while refactoring"
      - "Adding type annotations while renaming"
      - "Modernizing syntax while moving code"
      - "Improving testability not requested"
    detection: "Was this improvement requested?"
    verdict: "REJECT - stick to requested refactoring only"
```

### 2. Over-Complicated Refactoring
```yaml
refactor_complexity_violations:
  over_abstraction:
    description: "Creating unnecessary abstractions during refactoring"
    examples:
      - "Extract interface for single implementation"
      - "Create factory for one-off instantiation"
      - "Add strategy pattern for two cases"
      - "Build plugin system for fixed functionality"
    detection: "Does this abstraction have multiple uses NOW?"
    verdict: "REJECT - inline until proven necessary"

  premature_patterns:
    description: "Applying design patterns without need"
    examples:
      - "Singleton when simple module works"
      - "Observer when direct call suffices"
      - "Builder for simple construction"
      - "Command pattern for one action"
    detection: "Would simple code work?"
    verdict: "REJECT - patterns are for proven needs"

  architectural_astronautics:
    description: "Making code 'more flexible' for imaginary futures"
    examples:
      - "Abstracting for 'when we have multiple databases'"
      - "Plugin architecture 'for future extensions'"
      - "Configuration system 'for different environments'"
      - "Generic framework 'to support other use cases'"
    detection: "Is this flexibility requested NOW?"
    verdict: "REJECT - YAGNI applies to refactoring too"

  complexity_increase:
    description: "Refactoring that makes code harder to understand"
    examples:
      - "Extracting logic into multiple small methods"
      - "Creating deep inheritance hierarchies"
      - "Adding indirection layers"
      - "Splitting simple modules into many files"
    detection: "Is the refactored code easier to understand?"
    verdict: "REJECT - if not clearer, don't refactor"
```

### 3. Incomplete Refactoring Markers
```yaml
refactor_marker_violations:
  todo_markers:
    patterns:
      - "// TODO: finish this refactoring"
      - "# TODO: extract this too"
      - "// FIXME: inconsistent after refactor"
      - "// TODO: update callers"
      - "/* TODO: migrate remaining usages */"
    verdict: "REJECT - refactoring must be complete"

  partial_migration:
    patterns:
      - "// Old way - remove after migration"
      - "# Deprecated - use newFunction instead"
      - "// TEMP: keeping both during transition"
      - "// Legacy - will remove"
    verdict: "REJECT - complete migration or revert"

  mixed_state:
    patterns:
      - "Some callers updated, others not"
      - "New pattern here, old pattern there"
      - "Partial rename - some uses of old name remain"
      - "Extracted but original not removed"
    verdict: "REJECT - atomic completion required"

  deferred_cleanup:
    patterns:
      - "// Clean this up later"
      - "# Will refactor in next PR"
      - "// Temporary hack for refactoring"
      - "// Remove when refactoring complete"
    verdict: "REJECT - clean up now or don't start"
```

### 4. Refactoring Cop-outs
```yaml
refactor_cop_out_violations:
  incomplete_refactoring:
    signs:
      - "This is getting too big, stopping here"
      - "Good enough for now"
      - "Will finish the rest later"
      - "Core refactoring done, edges can wait"
      - "Most callers updated"
    verdict: "REJECT - complete or revert entirely"

  too_hard_excuses:
    phrases:
      - "Can't refactor because too many callers"
      - "Would break too many things"
      - "Test coverage isn't good enough"
      - "Don't understand this code well enough"
      - "The dependencies are too tangled"
    required_response: |
      If refactoring is genuinely blocked:
      1. REVERT all partial changes
      2. Document the specific blocker
      3. Create prerequisite tasks (add tests, untangle deps)
      4. Re-attempt only when prerequisites met
      DO NOT commit partial refactoring

  behavior_change_denial:
    signs:
      - "It's the same thing, just different"
      - "The change is so small it doesn't matter"
      - "Tests still pass so behavior is same"
      - "Edge case behavior might differ slightly"
    verdict: "REJECT - ANY behavior change = not refactoring"

  coverage_excuses:
    phrases:
      - "There aren't tests for this part"
      - "Can't verify because untested"
      - "Manually verified instead"
      - "Trusting the types"
    required_response: |
      If no test coverage:
      1. STOP the refactoring
      2. Add characterization tests FIRST
      3. Only then proceed with refactoring
      Refactoring without tests is gambling
```

### 5. Eagle-Eye Refactoring Checklist
```yaml
eagle_eye_refactor_scan:
  run_before_any_approval: true

  automated_checks:
    - grep_for_todo: "grep -rn 'TODO\\|FIXME\\|TEMP\\|HACK\\|Legacy\\|Deprecated' --include='*.{js,ts,py,go}'"
    - find_partial_migration: "grep -rn 'old.*remove\\|legacy\\|migration\\|transition' ."
    - diff_behavior: "Run full test suite, compare outputs exactly"
    - check_dead_code: "Look for old functions still present after 'extract'"

  manual_checks:
    scope_check:
      question: "Does every change relate to the stated refactoring?"
      fail_action: "Remove unrelated changes, create separate task"

    completeness_check:
      question: "Is the refactoring 100% complete with no TODOs?"
      fail_action: "Complete now or revert entirely"

    behavior_check:
      question: "Is behavior EXACTLY the same? (not 'equivalent')"
      fail_action: "Any difference = revert and investigate"

    simplicity_check:
      question: "Is the refactored code simpler/clearer?"
      fail_action: "If not clearer, the refactoring is wrong"

  verdict_rules:
    partial_refactoring: "REJECT - complete or revert"
    behavior_change: "REJECT - this is not refactoring"
    scope_expansion: "REJECT - create separate tasks"
    added_features: "REJECT - features are not refactoring"
    todo_markers: "REJECT - no incomplete work"
```

---

## Phase 1: Refactoring Analysis

### Task: Identify Refactoring Scope

**DO (Positive Instructions):**
- Document the code smell or issue being addressed
- Identify all affected files and functions
- Map dependencies that might be impacted
- Note existing test coverage for affected code
- Choose appropriate refactoring technique

**DO NOT (Negative Instructions):**
- Combine multiple refactorings in one task
- Refactor without understanding dependencies
- Skip checking test coverage first
- Ignore code that calls into affected areas
- Start without clear success criteria

**Refactoring Catalog:**
```yaml
extract_patterns:
  extract_method:
    when: "Long method, repeated code"
    scope: "Single method"
    risk: "Low"

  extract_class:
    when: "Class doing too many things"
    scope: "Single class to two"
    risk: "Medium"

  extract_interface:
    when: "Need abstraction point"
    scope: "Class to interface + implementation"
    risk: "Medium"

rename_patterns:
  rename_method:
    when: "Name doesn't describe behavior"
    scope: "Method and all callers"
    risk: "Low with IDE"

  rename_class:
    when: "Class name misleading"
    scope: "Class, file, all references"
    risk: "Medium"

move_patterns:
  move_method:
    when: "Method used more by another class"
    scope: "Method, callers, tests"
    risk: "Medium"

  move_class:
    when: "Class in wrong package"
    scope: "Class, imports, tests"
    risk: "Medium"

simplify_patterns:
  inline_method:
    when: "Method body is obvious"
    scope: "Method and callers"
    risk: "Low"

  replace_conditional:
    when: "Complex if/else chains"
    scope: "Single function"
    risk: "Medium"
```

**Verification Criteria:**
```yaml
pass_if:
  - code_smell_identified: true
  - scope_bounded: true
  - dependencies_mapped: true
  - test_coverage_known: true
  - technique_selected: true
fail_if:
  - scope_unbounded: true
  - no_test_coverage: true
  - multiple_smells_mixed: true
```

### Plan Adjustment Point 1
After analysis:
- If no test coverage: Add test task FIRST
- If scope too large: Split into subtasks
- If dependencies complex: Add mapping task
- Ready: Proceed

---

## Phase 2: Pre-Refactoring Verification

### Task: Establish Behavior Baseline

**DO (Positive Instructions):**
- Run full test suite, record results
- Add characterization tests for untested behavior
- Document current behavior explicitly
- Create performance baseline if relevant
- Snapshot current state for comparison

**DO NOT (Negative Instructions):**
- Proceed without green tests
- Skip adding tests for uncovered code
- Assume existing tests are sufficient
- Ignore edge case behavior
- Skip documenting implicit behavior

**Baseline Checklist:**
```yaml
test_baseline:
  all_tests_pass: true
  coverage_recorded: percentage
  characterization_tests_added: count
  flaky_tests_identified: list

behavior_documentation:
  inputs_outputs_documented:
    - function: "name"
      inputs: "types and ranges"
      outputs: "types and conditions"
      side_effects: "what changes"

  edge_cases_documented:
    - case: "null input"
      behavior: "throws ArgumentError"
    - case: "empty array"
      behavior: "returns empty result"

performance_baseline:
  if_applicable:
    - operation: "name"
      baseline_time: "X ms"
      baseline_memory: "Y MB"
```

**Verification Criteria:**
```yaml
pass_if:
  - all_tests_green: true
  - coverage_acceptable: ">= 80% on affected code"
  - behavior_documented: true
  - baseline_recorded: true
fail_if:
  - tests_failing: true
  - coverage_insufficient: true
  - behavior_unclear: true
```

### Plan Adjustment Point 2
After baseline:
- If tests failing: Fix tests first
- If coverage low: Add tests task
- If behavior unclear: Add characterization tests
- Baseline solid: Proceed

---

## Phase 3: Incremental Refactoring

### Task: Execute Single Refactoring Step

**DO (Positive Instructions):**
- Make one atomic change at a time
- Run tests after each change
- Commit each passing step separately
- Keep original code accessible until verified
- Use IDE refactoring tools when available

**DO NOT (Negative Instructions):**
- Make multiple changes before testing
- Mix refactoring with behavior changes
- Delete original code immediately
- Skip intermediate test runs
- Use find/replace for renames

**Atomic Steps Pattern:**
```yaml
step_pattern:
  1_prepare:
    - "Create new structure (method, class, etc.)"
    - "Test: still compiles"

  2_duplicate:
    - "Copy behavior to new location"
    - "Test: new code works"

  3_redirect:
    - "Change one caller to use new code"
    - "Test: still passes"

  4_migrate:
    - "Redirect remaining callers one by one"
    - "Test: after each redirection"

  5_cleanup:
    - "Remove old code only when all migrated"
    - "Test: final verification"

example_extract_method:
  step_1: "Create new empty method"
  step_2: "Copy code to new method"
  step_3: "Call new method from original"
  step_4: "Run tests"
  step_5: "Remove duplicate code in original"
  step_6: "Run tests again"
```

**Per-Step Verification:**
```yaml
after_each_step:
  compilation:
    check: "Code compiles without errors"
    fail_action: "Undo step"

  tests:
    check: "All tests pass"
    fail_action: "Undo step and investigate"

  behavior:
    check: "Output identical to baseline"
    fail_action: "Undo step and investigate"
```

**Verification Criteria:**
```yaml
pass_if:
  - each_step_tests_green: true
  - commits_atomic: true
  - behavior_preserved: true
  - no_compile_errors: true
fail_if:
  - any_step_breaks_tests: true
  - changes_batched: true
  - behavior_changed: true
```

### Plan Adjustment Point 3
After each step:
- If tests fail: STOP, investigate, undo if needed
- If unexpected behavior: Add characterization test
- If complexity revealed: Add subtasks
- Step successful: Continue

---

## Phase 4: Adversarial Verification

### Task: Attack the Refactored Code

The verifier attempts to find behavioral differences:

**DO (Positive Instructions):**
- Compare old vs new behavior explicitly
- Test boundary conditions
- Check error handling paths
- Verify performance characteristics
- Look for subtle semantic changes

**DO NOT (Negative Instructions):**
- Assume green tests mean identical behavior
- Skip comparing error messages
- Ignore performance regressions
- Accept "close enough" behavior
- Skip testing with real data

**Adversarial Checks:**
```yaml
behavior_comparison:
  functional:
    - test: "Same inputs produce same outputs"
      method: "Property-based testing"
    - test: "Same errors for invalid inputs"
      method: "Error case comparison"
    - test: "Same side effects"
      method: "State before/after comparison"

  boundary:
    - test: "Empty input behavior identical"
    - test: "Single item behavior identical"
    - test: "Maximum size behavior identical"
    - test: "Null handling identical"

  error_handling:
    - test: "Same exceptions thrown"
    - test: "Same error messages"
    - test: "Same error conditions"

  performance:
    - test: "No significant slowdown (< 10%)"
    - test: "No increased memory usage"
    - test: "No new allocations in hot path"
```

**Semantic Difference Detection:**
```yaml
subtle_changes_to_catch:
  - "Floating point precision changes"
  - "String encoding differences"
  - "Ordering changes in collections"
  - "Null vs empty distinctions"
  - "Timing of side effects"
  - "Exception types vs messages"
  - "Default value changes"
```

**Verification Criteria:**
```yaml
pass_if:
  - behavior_identical: true
  - performance_acceptable: true
  - all_edge_cases_match: true
  - no_semantic_changes: true
fail_if:
  - any_behavior_difference: true
  - performance_regression: true
  - edge_case_difference: true
```

### Plan Adjustment Point 4
After adversarial verification:
- If differences found: Add investigation task
- If performance worse: Add optimization task
- If subtle bugs: Add test and fix
- All identical: Proceed

---

## Phase 5: Final Validation

### Task: Complete Refactoring Verification

**DO (Positive Instructions):**
- Run full test suite one more time
- Verify code coverage maintained or improved
- Check code quality metrics
- Update documentation if structure changed
- Clean up any temporary code

**DO NOT (Negative Instructions):**
- Skip final full test run
- Leave characterization tests if not needed
- Forget to update imports/exports
- Leave TODO comments
- Skip updating related documentation

**Final Checklist:**
```yaml
code_quality:
  - lint_passes: true
  - no_dead_code: true
  - no_debug_statements: true
  - imports_clean: true

test_quality:
  - all_tests_pass: true
  - coverage_maintained: true
  - no_flaky_tests_introduced: true
  - characterization_tests_kept_if_valuable: true

documentation:
  - api_docs_updated: "if applicable"
  - comments_updated: "if applicable"
  - architecture_docs_updated: "if applicable"

cleanup:
  - old_code_removed: true
  - temporary_scaffolding_removed: true
  - obsolete_tests_removed: true
```

**Verification Criteria:**
```yaml
pass_if:
  - full_suite_green: true
  - coverage_maintained: true
  - code_quality_met: true
  - documentation_current: true
fail_if:
  - any_test_fails: true
  - coverage_dropped: true
  - quality_issues: true
```

### Plan Adjustment Point 5
After final validation:
- If issues found: Add fix tasks
- If more refactoring needed: Add to backlog
- If complete: Document and close
- All verified: Complete

---

## Phase 6: Post-Refactoring Report

### Task: Document Refactoring Results

**Report Content:**
```yaml
refactoring_report:
  summary:
    refactoring_type: "e.g., Extract Method"
    files_changed: count
    lines_changed: "added/removed"
    tests_added: count
    time_spent: duration

  behavior_verification:
    tests_passed_before: count
    tests_passed_after: count
    characterization_tests_added: count
    behavior_differences_found: "none|list"

  quality_impact:
    code_smells_fixed: list
    complexity_change: "reduced/same/increased"
    duplication_change: "reduced/same/increased"

  lessons_learned:
    - "What went well"
    - "What was harder than expected"
    - "What to do differently next time"

  follow_up:
    - "Additional refactorings identified"
    - "Tests that should be added"
    - "Documentation that needs updating"
```

---

## Loop Continuation Protocol

After Phase 6 completes:

1. **On Success:**
   - Close refactoring task
   - Update code quality metrics
   - Add follow-up tasks to backlog
   - Proceed to next refactoring

2. **On Failure:**
   - Revert to baseline state
   - Document what went wrong
   - Add investigation task
   - DO NOT proceed with broken state

3. **Continuous Improvement:**
   - Track refactoring success rate
   - Identify patterns in failures
   - Improve baseline testing
   - Refine atomic step patterns

---

## Refactoring Safety Checklist

Before starting ANY refactoring:
```yaml
safety_checklist:
  - [ ] All tests currently passing
  - [ ] Test coverage >= 80% on affected code
  - [ ] Scope bounded to one refactoring type
  - [ ] Dependencies mapped
  - [ ] Behavior baseline documented
  - [ ] Rollback plan in place
  - [ ] Team notified of changes (if applicable)
```

If ANY item is not checked, add a task to address it BEFORE refactoring.
