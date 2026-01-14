---
name: adversarial-test
description: Test-focused loop with mutation testing and adversarial test generation
---

# Adversarial Test Loop

Comprehensive testing with adversarial test generation and mutation testing.

**Context Rule**: Runs INSIDE a subagent (fresh context for this testing task only).

## Execution Phases

### Phase 1: Test Planning (10% of time)

**Objective**: Analyze coverage needs and create test strategy

**Steps**:
1. Identify code to test
2. Analyze current coverage
3. Identify coverage gaps
4. Create test plan with priorities

### Phase 2: Happy Path Tests (25% of time)

**Objective**: Test expected behavior (50-60% of tests)

**Coverage**:
- Valid inputs produce expected outputs
- Standard user workflows
- Common use cases
- Basic integration

### Phase 3: Edge Case Tests (25% of time)

**Objective**: Test boundaries (25-30% of tests)

**Edge Cases**:
- Empty/null/undefined inputs
- Maximum/minimum values
- Boundary conditions
- First/last element scenarios

### Phase 4: Adversarial Tests (25% of time)

**Objective**: Break the code (10-15% of tests)

**Adversarial Mindset**: "How can I make this fail?"

**Test Categories**:
```yaml
adversarial_tests:
  invalid_input:
    - Malformed data
    - Wrong types
    - Negative numbers where positive expected
    - Extremely large inputs

  state_violations:
    - Call functions in wrong order
    - Concurrent access
    - Missing initialization

  resource_limits:
    - Memory exhaustion
    - Infinite loops
    - Stack overflow

  security:
    - Injection attempts
    - Authorization bypass
    - XSS/CSRF
```

### Phase 5: Mutation Testing (10% of time)

**Objective**: Verify tests can catch bugs

**Process**:
1. Mutate code (change operators, values, logic)
2. Run tests
3. If tests still pass, tests are weak
4. Add tests to catch those mutations

**Mutations**:
```yaml
mutation_examples:
  - original: "if (x > 0)"
    mutated: "if (x >= 0)"
    expect: "Test should fail"

  - original: "return true"
    mutated: "return false"
    expect: "Test should fail"
```

### Phase 6: Regression Tests (5% of time)

**Objective**: Document known bugs with tests

**Pattern**: Bug → Test → Fix → Regression test

## Test Quality Gates

- Coverage >= 80% for new code
- All mutation tests fail (good!)
- No skipped tests
- Tests run fast (<1s per test)

## Usage

This skill is invoked by workflow:task-executor agent when loop type is "test".
