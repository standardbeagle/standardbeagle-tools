---
name: adversarial-test-loop
description: Adversarial cooperation loop for test verification ensuring comprehensive coverage and robustness
---

# Adversarial Test Loop (Ralph Wiggum Pattern)

A continuous execution loop focused on testing where the test writer and test breaker cooperate adversarially to ensure test quality and coverage.

## Core Principles

### Context-Sized Test Tasks
Each testing task must be:
- **Focused**: One module or feature per task
- **Complete**: All paths for that module
- **Independent**: No cross-task dependencies
- **Measurable**: Coverage metrics per task

### Test Distribution Target
```yaml
test_distribution:
  happy_path: "50-60%"
  edge_cases: "25-30%"
  adversarial: "10-15%"
  regression: "as needed"
```

### Plan Adjustment Protocol
```yaml
plan_adjustment_rules:
  automatic_continuation:
    description: "Phase transitions are automatic, not approval gates"
    behavior: "Adjust plan silently and continue"

  when_to_stop:
    - "Cannot determine what to test"
    - "Critical security vulnerability found"
    - "Test infrastructure completely broken"

  when_to_continue:
    - "Coverage gaps found (add tests, continue)"
    - "Flaky tests discovered (fix and continue)"
    - "New edge cases identified (add to plan, continue)"
    - "Minor failures (fix inline, continue)"

  never_ask:
    - "Should I continue?"
    - "Is this coverage enough?"
    - "Ready for next phase?"
```

---

## Eagle-Eyed Test Violations (IMMEDIATE REJECTION)

The verifier must be **ruthlessly vigilant** for these test anti-patterns. Any occurrence is grounds for immediate rejection.

### 1. Scope Creep in Tests
```yaml
test_scope_violations:
  testing_unrequested_features:
    description: "Writing tests for functionality not in requirements"
    examples:
      - "Testing edge cases for features not being implemented"
      - "Adding performance tests when not requested"
      - "Testing integration paths not in scope"
    detection: "Does this test verify a requirement?"
    verdict: "REJECT - only test what was requested"

  over_testing:
    description: "Testing beyond what's needed"
    examples:
      - "100% coverage on trivial code"
      - "Testing private methods directly"
      - "Testing framework code behavior"
      - "Duplicate tests with different names"
    detection: "Does this test add value?"
    verdict: "REJECT - remove redundant tests"

  test_framework_abuse:
    description: "Building testing infrastructure not needed"
    examples:
      - "Custom assertion libraries for one project"
      - "Complex test utilities used once"
      - "Abstract base test classes for simple tests"
      - "Test data factories when literals work"
    detection: "Is this test infrastructure justified?"
    verdict: "REJECT - use simple, direct tests"
```

### 2. Over-Complicated Tests
```yaml
test_complexity_violations:
  complex_setup:
    description: "Tests requiring excessive setup"
    examples:
      - "50+ lines of setup for one assertion"
      - "Multiple mock configurations"
      - "Database seeding for unit tests"
      - "File system manipulation for pure functions"
    detection: "Setup longer than test? Simplify."
    verdict: "REJECT - refactor code to be testable"

  clever_test_code:
    description: "Tests that are hard to understand"
    examples:
      - "Loop-generated test cases without clarity"
      - "Metaprogramming in tests"
      - "Dynamic assertion building"
      - "Test inheritance hierarchies"
    detection: "Can you read the test in 10 seconds?"
    verdict: "REJECT - write obvious, boring tests"

  over_mocked:
    description: "Tests with excessive mocking"
    examples:
      - "Mocking the thing you're testing"
      - "Mock chains 3+ levels deep"
      - "Verifying mock call counts obsessively"
      - "Mocking simple data structures"
    detection: "Are you testing mocks or code?"
    verdict: "REJECT - reduce mocking, test real behavior"

  test_complexity_limits:
    max_setup_lines: 10
    max_mocks_per_test: 3
    max_assertions_per_test: 5
    max_test_file_lines: 500
```

### 3. Incomplete Test Markers
```yaml
test_marker_violations:
  skip_markers:
    patterns:
      - "@skip"
      - "@ignore"
      - "skip("
      - "xit("
      - "xdescribe("
      - "test.skip"
      - "pytest.mark.skip"
      - "@Disabled"
    verdict: "REJECT - no skipped tests allowed, fix or delete"

  todo_in_tests:
    patterns:
      - "// TODO: add more tests"
      - "# TODO: test edge case"
      - "// FIXME: flaky test"
      - "pending("
      - "test.todo("
    verdict: "REJECT - complete tests now or remove"

  incomplete_tests:
    patterns:
      - "expect(true).toBe(true)"
      - "assert True"
      - "// assert something here"
      - "pass  # placeholder"
      - "throw new Error('not implemented')"
    verdict: "REJECT - write real assertions"

  flaky_markers:
    patterns:
      - "@retry"
      - "@flaky"
      - "retry:"
      - "eventually {"
      - "waitFor(... timeout: 30000)"
    verdict: "REJECT - fix flakiness, don't hide it"
```

### 4. Test Cop-outs
```yaml
test_cop_out_violations:
  avoided_testing:
    signs:
      - "This is too hard to test"
      - "Can't mock this dependency"
      - "Would need to refactor to test"
      - "Testing manually is easier"
      - "Works in production"
    verdict: "REJECT - make code testable or report blocker"

  weak_assertions:
    patterns:
      - "expect(result).toBeDefined()"  # too weak
      - "assert result is not None"  # tells us nothing
      - "expect(array.length).toBeGreaterThan(0)"  # what length?
      - "assertTrue(output.contains('something'))"  # partial match
    verdict: "REJECT - assert specific expected values"

  test_after_the_fact:
    signs:
      - "Added tests to existing untested code"
      - "Tests written to match current behavior"
      - "Characterization tests without fixing bugs"
    required_response: |
      If testing existing code:
      1. Write test that exposes current behavior
      2. Identify if behavior is correct or buggy
      3. If buggy, fix bug AND test expected behavior
      DO NOT just codify existing bugs as "expected"

  coverage_gaming:
    patterns:
      - "Tests that execute code but don't assert"
      - "Catch-all tests that 'cover' multiple paths"
      - "Tests that just instantiate classes"
      - "Assert count only, not content"
    verdict: "REJECT - coverage without assertions is meaningless"

  unrelated_failure_excuses:
    phrases:
      - "This test failure is unrelated to my change"
      - "That's a pre-existing failure"
      - "The test was already flaky"
      - "Not my test, not my problem"
      - "That failure is in a different module"
      - "The CI was already red"
      - "Someone else broke that test"
    verdict: "REJECT - ALL tests must pass, no exceptions"
    required_response: |
      If you encounter a failing test:
      1. FIX IT - regardless of who wrote it or when it broke
      2. If truly unrelated and blocking: escalate as BLOCKER
      3. DO NOT proceed with failing tests
      4. DO NOT blame others or prior state
      The codebase must always be green. Period.
```

### 5. Eagle-Eye Test Checklist
```yaml
eagle_eye_test_scan:
  run_before_any_approval: true

  automated_checks:
    - grep_for_skip: "grep -rn '@skip\\|@ignore\\|xit\\|xdescribe' --include='*.{test,spec}.{js,ts}'"
    - grep_for_todo: "grep -rn 'TODO\\|FIXME\\|pending' --include='*test*'"
    - find_empty_tests: "grep -rn 'expect(true)\\|assert True\\|pass$' --include='*test*'"
    - count_mocks: "grep -c 'mock\\|Mock\\|jest.fn' per test file"

  manual_checks:
    value_check:
      question: "Does every test verify a requirement?"
      fail_action: "Remove tests that don't trace to requirements"

    simplicity_check:
      question: "Can each test be understood in 10 seconds?"
      fail_action: "Simplify until obvious"

    completeness_check:
      question: "Are there any @skip, TODO, or incomplete tests?"
      fail_action: "Complete or remove, no exceptions"

    assertion_check:
      question: "Does every test have meaningful specific assertions?"
      fail_action: "Strengthen weak assertions"

  verdict_rules:
    skipped_tests: "REJECT - 0 tolerance"
    weak_assertions: "REJECT - must assert specific values"
    complex_setup: "REJECT - simplify or refactor code under test"
    todo_in_tests: "REJECT - complete the work now"
```

---

## Phase 1: Test Planning

### Task: Analyze Test Requirements

**DO (Positive Instructions):**
- Identify all code paths in target module
- Map inputs to expected outputs
- List known edge cases from requirements
- Find existing tests to avoid duplication
- Determine appropriate test types (unit/integration)

**DO NOT (Negative Instructions):**
- Test implementation details
- Duplicate existing test coverage
- Write tests without understanding code
- Mix unit and integration in same file
- Ignore existing test patterns

**Verification Criteria:**
```yaml
pass_if:
  - code_paths_identified: true
  - edge_cases_listed: true
  - test_type_determined: true
  - existing_tests_checked: true
fail_if:
  - paths_missed: true
  - duplicate_tests_planned: true
  - test_type_unclear: true
```

### Plan Adjustment Point 1
After planning:
- If more paths than expected: Split into subtasks
- If existing coverage adequate: Skip to gaps only
- If integration tests needed: Add setup task
- If mocks required: Add mock creation task

---

## Phase 2: Happy Path Tests (50-60%)

### Task: Write Standard Success Tests

**DO (Positive Instructions):**
- Test the primary use case first
- Use realistic input data
- Assert specific expected outputs
- Test return values AND side effects
- Use descriptive test names

**DO NOT (Negative Instructions):**
- Test trivial getters/setters
- Use magic values without constants
- Write flaky async tests
- Assert internal implementation
- Leave commented test code

**Test Template:**
```yaml
happy_path_test:
  name: "test_{function}_with_{scenario}_returns_{expected}"

  structure:
    arrange: "Set up valid input data"
    act: "Call function under test"
    assert: "Verify expected outcome"

  requirements:
    - clear_input_data: true
    - single_assertion_focus: true
    - no_external_dependencies: true
```

**Verification Criteria:**
```yaml
pass_if:
  - all_primary_paths_covered: true
  - tests_are_deterministic: true
  - tests_run_in_isolation: true
  - meaningful_assertions: true
fail_if:
  - any_test_flaky: true
  - tests_coupled: true
  - assertions_weak: true
```

### Plan Adjustment Point 2
After happy path:
- If paths uncovered: Add specific tests
- If flaky tests: Add stabilization task
- If slow tests: Add performance task
- Coverage target met: Proceed

---

## Phase 3: Edge Case Tests (25-30%)

### Task: Write Boundary and Edge Tests

**DO (Positive Instructions):**
- Test empty/null inputs
- Test maximum size inputs
- Test boundary values (0, -1, MAX_INT)
- Test timeout/retry scenarios
- Test concurrent access if applicable

**DO NOT (Negative Instructions):**
- Skip testing null handling
- Ignore array boundary conditions
- Forget empty string cases
- Overlook type coercion issues
- Skip resource cleanup tests

**Edge Case Categories:**
```yaml
input_edges:
  empty:
    - null_input: "verify graceful handling"
    - empty_string: "verify graceful handling"
    - empty_array: "verify graceful handling"
    - empty_object: "verify graceful handling"

  boundaries:
    - zero_value: "verify correct behavior"
    - negative_one: "verify rejection or handling"
    - max_integer: "verify no overflow"
    - min_integer: "verify no underflow"

  size:
    - single_item: "verify works"
    - max_size: "verify performance acceptable"
    - just_over_max: "verify rejection"

state_edges:
  - uninitialized_state: "verify safe handling"
  - partially_initialized: "verify completes or fails clean"
  - already_completed: "verify idempotent"
  - concurrent_modification: "verify thread safety"
```

**Verification Criteria:**
```yaml
pass_if:
  - null_cases_covered: true
  - boundary_values_tested: true
  - size_limits_verified: true
  - state_edges_handled: true
fail_if:
  - null_throws_unexpectedly: true
  - boundary_bugs_found: true
  - size_issues_uncaught: true
```

### Plan Adjustment Point 3
After edge cases:
- If bugs found: Add fix task before continuing
- If patterns emerge: Add systematic tests
- If new edges discovered: Add to backlog
- Coverage improved: Proceed

---

## Phase 4: Adversarial Tests (10-15%)

### Task: Write Attack and Abuse Tests

**DO (Positive Instructions):**
- Test injection attempts (SQL, XSS, command)
- Test with malformed data structures
- Test resource exhaustion scenarios
- Test authentication bypass attempts
- Test rate limiting and abuse prevention

**DO NOT (Negative Instructions):**
- Skip security test categories
- Use weak attack patterns
- Test only known vulnerabilities
- Ignore error message leakage
- Forget timeout protections

**Adversarial Categories:**
```yaml
injection_tests:
  - sql_injection: "verify parameterized queries"
  - xss_injection: "verify output encoding"
  - command_injection: "verify input sanitization"
  - path_traversal: "verify path validation"

malformed_input:
  - wrong_type: "verify type checking"
  - nested_too_deep: "verify depth limits"
  - circular_reference: "verify cycle detection"
  - invalid_encoding: "verify encoding handling"

abuse_scenarios:
  - rapid_fire_requests: "verify rate limiting"
  - oversized_payload: "verify size limits"
  - resource_exhaustion: "verify limits enforced"
  - timing_attacks: "verify constant time operations"

boundary_attacks:
  - integer_overflow_attempt: "verify bounds checking"
  - buffer_overflow_attempt: "verify memory safety"
  - null_byte_injection: "verify null handling"
```

**Verification Criteria:**
```yaml
pass_if:
  - injection_tests_pass: true
  - malformed_input_rejected: true
  - abuse_prevented: true
  - error_messages_safe: true
fail_if:
  - any_injection_succeeds: true
  - malformed_data_processed: true
  - resources_exhaustible: true
  - sensitive_info_leaked: true
```

### Plan Adjustment Point 4
After adversarial:
- If vulnerabilities found: STOP, add security fix task
- If new attack vectors: Add to suite
- If false positives: Refine tests
- All secure: Proceed

---

## Phase 5: Test Quality Verification

### Task: Verify Test Suite Quality

**DO (Positive Instructions):**
- Run mutation testing to verify assertions
- Check that tests actually fail when code breaks
- Verify test isolation (no shared state)
- Ensure tests are readable/maintainable
- Confirm coverage metrics accurate

**DO NOT (Negative Instructions):**
- Accept green tests without mutation testing
- Leave tests that never fail
- Keep tests with hidden dependencies
- Ignore slow test complaints
- Skip test documentation

**Quality Checks:**
```yaml
mutation_testing:
  purpose: "Verify tests detect code changes"
  target: "mutation score >= 80%"
  check: "Each test should fail when mutant introduced"

assertion_quality:
  purpose: "Verify assertions are meaningful"
  check: "No empty assertions or assertTrue(true)"
  verify: "Assertions test actual behavior"

isolation_check:
  purpose: "Verify test independence"
  check: "Tests pass in any order"
  verify: "No shared mutable state"

performance_check:
  purpose: "Verify tests run fast"
  target: "unit tests < 100ms each"
  verify: "No unnecessary I/O or sleep"
```

**Verification Criteria:**
```yaml
pass_if:
  - mutation_score: ">= 80%"
  - all_tests_isolated: true
  - no_slow_tests: true
  - coverage_target_met: true
fail_if:
  - mutation_score_low: true
  - tests_interdependent: true
  - tests_too_slow: true
  - coverage_decreased: true
```

### Plan Adjustment Point 5
After quality verification:
- If mutation score low: Add stronger assertions
- If tests interdependent: Add isolation fixes
- If tests slow: Add optimization task
- Quality met: Complete

---

## Phase 6: Regression Test Integration

### Task: Add Regression Tests for Bugs

**DO (Positive Instructions):**
- Create test for each bug before fixing
- Include bug ID in test name/comment
- Test exact failure scenario reported
- Verify test fails before fix, passes after
- Keep regression tests forever

**DO NOT (Negative Instructions):**
- Fix bugs without regression test
- Delete regression tests later
- Write tests that don't reproduce bug
- Combine multiple bugs in one test
- Skip edge case bugs

**Regression Test Format:**
```yaml
regression_test:
  naming: "test_regression_{bug_id}_{description}"

  required_elements:
    - bug_id_comment: "Link to original issue"
    - reproduction_steps: "Exact scenario"
    - expected_before_fix: "Error/wrong behavior"
    - expected_after_fix: "Correct behavior"
    - introduced_version: "When test added"

  example:
    name: "test_regression_BUG123_null_user_causes_crash"
    comment: "Regression test for BUG-123"
    input: null
    expected: "Graceful error, not crash"
```

---

## Loop Continuation Protocol

After Phase 6 completes:

1. **On Success:**
   - Update coverage report
   - Mark test task complete
   - Log test metrics
   - Fetch next module and restart

2. **On Failure:**
   - Document which tests failed
   - Create fix tasks for failures
   - Do not proceed until fixed
   - STOP loop

3. **Metrics Collection:**
   ```yaml
   per_task_metrics:
     tests_added: count
     coverage_before: percentage
     coverage_after: percentage
     mutation_score: percentage
     bugs_found: count
     time_spent: duration
   ```

---

## Test Categories Reference

```yaml
test_type_decision:
  unit_test:
    when: "Testing single function/method in isolation"
    mocks: "All external dependencies"
    speed: "< 100ms"

  integration_test:
    when: "Testing component interactions"
    mocks: "Only external services"
    speed: "< 5s"

  e2e_test:
    when: "Testing full user flows"
    mocks: "None (real system)"
    speed: "< 30s"

  performance_test:
    when: "Testing speed/resource usage"
    mocks: "Realistic data volumes"
    speed: "varies"
```
