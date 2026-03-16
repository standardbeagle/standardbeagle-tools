---
name: testing-strategy
description: Three-tier testing strategy - e2e for product validation, integration for coverage breadth, unit for exhaustive logic testing
---

# Testing Strategy: The Testing Pyramid

A disciplined approach to test selection. Not all code needs the same kind of test. The right test at the right level catches bugs efficiently without creating a brittle, slow test suite.

## Core Principle: Test at the Right Level

```yaml
testing_tiers:
  e2e_tests:
    purpose: "Validate the product works as a user experiences it"
    scope: "Full system — UI, API, database, external services"
    count: "Few — cover critical user journeys only"
    speed: "Slow (seconds to minutes per test)"
    when_to_write:
      - "New feature that changes user-visible behavior"
      - "Critical business workflow (checkout, auth, data export)"
      - "Bug fix for something a user reported"
      - "Integration between major system components"
    when_NOT_to_write:
      - "Internal refactoring with no behavior change"
      - "Utility functions"
      - "Edge cases better caught at lower levels"
    example_scope: "User logs in, creates a record, edits it, deletes it"

  integration_tests:
    purpose: "Verify components work together correctly"
    scope: "Multiple modules, real database, real file system — but no UI"
    count: "Moderate — cover all component interactions and data flows"
    speed: "Medium (milliseconds to low seconds per test)"
    when_to_write:
      - "Database queries and mutations"
      - "API endpoint request/response cycles"
      - "Filter, sort, and pagination logic against real data"
      - "Module interactions (e.g., auth + data access)"
      - "Data transformation pipelines"
      - "File I/O and serialization"
    when_NOT_to_write:
      - "Pure computational logic with no dependencies"
      - "Simple data mapping that unit tests cover better"
    example_scope: "Filter query with _gt operator returns correct rows from SQLite"

  unit_tests:
    purpose: "Exhaustively verify complex local logic"
    scope: "Single function or class — no external dependencies"
    count: "Many — cover all branches, edge cases, boundary values"
    speed: "Fast (sub-millisecond per test)"
    when_to_write:
      - "Algorithms and data transformations"
      - "Parsing and validation logic"
      - "State machines and business rules"
      - "Mathematical calculations"
      - "String manipulation and formatting"
      - "Any function with cyclomatic complexity > 3"
    when_NOT_to_write:
      - "Simple getters/setters"
      - "Pass-through functions"
      - "Code that only calls external APIs (use integration tests)"
    example_scope: "Filter parser handles _eq, _gt, _between, null, nested AND/OR"
```

## Decision Framework: Which Test Level?

```yaml
decision_tree:
  question_1: "Does this change what users see or experience?"
    yes: "Write an e2e test for the user journey"
    no: "Continue to question 2"

  question_2: "Does this involve multiple components or external systems?"
    yes: "Write integration tests for the component interaction"
    no: "Continue to question 3"

  question_3: "Is this logic complex enough to have edge cases?"
    yes: "Write unit tests with exhaustive coverage"
    no: "The existing tests probably cover it. Verify and move on."

  question_4: "Is this a bug fix?"
    always: "Write a test at the level where the bug manifests"
    principle: "The test must fail without the fix, pass with it"
```

## E2E Tests: Product Validation

E2E tests prove the product works. They are expensive to write and maintain, so use them sparingly for high-value journeys.

```yaml
e2e_principles:
  scope: "Test what users do, not what code does"
  count: "One test per critical user journey, not per feature"
  resilience:
    - "Use semantic selectors (aria-label, data-testid) not CSS classes"
    - "Wait for conditions, not arbitrary timeouts"
    - "Assert on user-visible outcomes, not internal state"
  organization:
    - "Group by user journey, not by page or component"
    - "Each test is independent — no shared state between tests"
    - "Setup and teardown create and destroy test data"

  what_to_cover:
    critical_paths:
      - "Authentication flow (login, logout, session expiry)"
      - "Primary CRUD operations on core entities"
      - "Navigation between major sections"
      - "Error states that users encounter"
    NOT_covered:
      - "Every permutation of form inputs"
      - "CSS styling and layout"
      - "Admin features used rarely"
      - "Edge cases better tested at integration level"
```

## Integration Tests: Coverage Breadth

Integration tests verify that components work together. They're faster than e2e and can cover more cases.

```yaml
integration_principles:
  scope: "Real dependencies, real data, no UI"
  database:
    - "Use real database (in-memory SQLite, test containers)"
    - "NEVER mock the database"
    - "Each test gets clean data via setup/teardown"
  api:
    - "Test full request → response cycle"
    - "Verify status codes, response shapes, error formats"
    - "Test with valid, invalid, and boundary inputs"
  data_flow:
    - "Test filter operators produce correct SQL and results"
    - "Test sort, pagination, and combined operations"
    - "Test mutations (insert, update, delete) and verify side effects"

  coverage_targets:
    - "Every API endpoint with happy path + error path"
    - "Every filter operator with real data verification"
    - "Every mutation type with data integrity checks"
    - "Cross-component interactions (auth + queries, modules + filters)"

  anti_patterns:
    - "NEVER mock internal code — only mock external HTTP services"
    - "NEVER test implementation details — test observable behavior"
    - "NEVER share mutable state between tests"
```

## Unit Tests: Exhaustive Logic Testing

Unit tests are for code that benefits from exhaustive case coverage. If a function has branches, test every branch.

```yaml
unit_principles:
  scope: "Single function, no external dependencies"
  isolation:
    - "No database, no file system, no network"
    - "No mocks for internal code"
    - "Pure functions preferred — input in, output out"
  exhaustiveness:
    - "Test every branch in the function"
    - "Test boundary values (0, 1, max, min, empty, null)"
    - "Test invalid inputs and error cases"
    - "Test combinations that interact"

  when_exhaustive:
    high_value_targets:
      - "Parsing logic (all valid formats + all invalid formats)"
      - "Validation rules (every rule, every violation)"
      - "State transitions (every valid + invalid transition)"
      - "Mathematical calculations (precision, overflow, edge values)"
      - "Business rules with multiple conditions"

  naming:
    pattern: "MethodName_Scenario_ExpectedResult"
    examples:
      - "ParseFilter_NullValue_ReturnsIsNull"
      - "GetOperator_UnknownOp_ReturnsEquals"
      - "CalculateTotal_EmptyCart_ReturnsZero"
```

## Test Quality Rules

```yaml
quality_rules:
  every_test_must:
    - "Have a single clear assertion (one behavior per test)"
    - "Be independent (no ordering dependencies)"
    - "Be deterministic (same result every run)"
    - "Be fast (unit < 1ms, integration < 1s, e2e < 30s)"
    - "Fail with a clear message explaining what broke"

  complementary_coverage:
    principle: "Positive and negative tests should cover all rows"
    example: "_contains + _ncontains results should equal total row count"

  operator_distinction:
    principle: "Each operator must produce different results"
    example: "_eq, _gt, _gte must return different counts for the same value"

  never:
    - "Write tests that pass whether the code works or not"
    - "Test implementation details that change during refactoring"
    - "Use production data or credentials in tests"
    - "Skip tests to make CI green"
    - "Write tests after the fact that just assert current behavior"
```

## TDD Integration

This strategy integrates with the TDD cycle from the quality loop:

```yaml
tdd_with_tiers:
  for_new_features:
    1: "Write an e2e test for the user journey (RED)"
    2: "Write integration tests for the data layer (RED)"
    3: "Write unit tests for complex logic (RED)"
    4: "Implement until unit tests pass (GREEN)"
    5: "Implement until integration tests pass (GREEN)"
    6: "Implement until e2e test passes (GREEN)"
    7: "Refactor with all tests green"

  for_bug_fixes:
    1: "Write a test at the level where the bug manifests (RED)"
    2: "Fix the bug (GREEN)"
    3: "Add edge case tests if the bug reveals a pattern"

  for_refactoring:
    1: "Verify existing tests pass (characterization baseline)"
    2: "Refactor incrementally"
    3: "Tests must stay green after each step"
    4: "Add tests if refactoring reveals untested paths"
```

## Verification

Before marking any task complete:
```yaml
test_verification:
  - "All existing tests still pass"
  - "New tests cover the acceptance criteria"
  - "Tests are at the right level (not all unit, not all e2e)"
  - "No skipped or disabled tests"
  - "Test names describe the behavior being verified"
  - "Tests fail when the feature is removed (not vacuously passing)"
```
