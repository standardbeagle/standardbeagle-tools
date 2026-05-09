---
name: testing-strategy
description: Three-tier testing strategy - e2e for product validation, integration for coverage breadth, unit for exhaustive logic testing. 三層測試策略：e2e驗產品，集成廣覆蓋，單元窮邏輯。 Use when: write tests, choose test type, TDD setup, decide e2e vs unit, testing pyramid
---

# Testing Strategy: The Testing Pyramid

測試選擇之法，有紀律。非一切代碼同需一類測試。右層右試，捕蟲有效，免脆弱遲緩之套。

This skill body holds the decision flow only. Per-tier specifications, principles, and TDD examples live in `references/examples.md` and are loaded on demand at the matching decision branch.

## Trigger

Use when:
- Choosing which test level to write (e2e / integration / unit / smoke)
- Setting up TDD for a new feature or bug fix
- Reviewing whether a test suite is structured correctly across tiers

## Decision Flow

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
    always: "Write a test at the level where the bug manifests (RED without fix)"
    principle: "The test MUST be RED without the fix, GREEN with it — this is non-negotiable"

  question_5: "Is this part of a deploy / release-candidate gate?"
    yes: "Add or run a smoke test at HIGHEST fidelity (full e2e, never mocked)"
```

## Reference Pointers

Each branch of the decision flow points to a section of `references/examples.md`. **Load the reference before writing the test** — do not improvise from this body alone.

| Branch reached | Load reference before proceeding |
|----------------|----------------------------------|
| q1 → e2e | `references/examples.md` § "E2E Principles (detail)" + § "Three Tiers (full spec)" → e2e block |
| q2 → integration | `references/examples.md` § "Integration Principles (detail)" + § "Three Tiers (full spec)" → integration block |
| q3 → unit | `references/examples.md` § "Unit Principles (detail)" + § "Three Tiers (full spec)" → unit block |
| q4 → bug fix | `references/examples.md` § "TDD Integration" → `for_bug_fixes` block |
| q5 → smoke | `references/examples.md` § "Smoke Tests: Highest Fidelity Always" |
| Any new test (always) | `references/examples.md` § "RED/GREEN/REFACTOR Discipline (detail)" — confirm the cycle before writing |
| Refactoring with no behavior change | `references/examples.md` § "TDD Integration" → `for_refactoring` block |
| Pre-completion check | `references/examples.md` § "Verification Checklist" + § "Test Quality Rules (detail)" |

**Subagent-skip-fetch mitigation**: each row is a fetch instruction the executor MUST follow before writing the test. Skipping the reference and improvising the test from the decision tree alone produces low-fidelity tests — surface as a protocol violation if observed.

## Universal Rules (always in body)

- **Every test must be seen RED before it is seen GREEN.** A test that was never RED is untrusted.
- **Smoke tests are always highest fidelity.** Never mock, stub, or simulate in a smoke test. If the question is "is the system alive?", the answer must come from the real system.
- **Refactor only when GREEN.** If a refactor turns any test RED, undo immediately.
- **Vertical slices over horizontal layers.** Test full feature paths (UI → API → DB), not isolated layers.
- **No internal mocks.** Mock only at system boundaries (external HTTP, third-party SDKs). Internal code uses real implementations.
- **One assertion per test.** Each test verifies one behavior. Multi-assertion tests obscure what broke.
- **Test names are specifications.** `MethodName_Scenario_ExpectedResult` — readers should understand the test from the name.

## When to SKIP TDD (narrow exceptions)

```yaml
skip_tdd_only_for:
  - "Pure UI layout changes with no logic"
  - "Configuration-only changes"
  - "Documentation-only changes"

never_skip_for:
  - "Business logic"
  - "Data transformations"
  - "Bug fixes (the test reproduces the bug)"
  - "Anything with branches, loops, or conditionals"
```

## Companion Reference

- **`references/examples.md`** — full per-tier spec, RED/GREEN/REFACTOR detail, smoke-test rules, integration/unit/e2e principles, TDD-with-tiers playbook, test quality rules, and verification checklist.

## Pre-Completion Verification

任務標完成前，依`references/examples.md` § "Verification Checklist" 逐項驗證。Body summary:

- All existing tests still pass (GREEN baseline holds)
- Every new test was seen RED before GREEN
- Smoke tests pass at full e2e fidelity
- New tests cover the acceptance criteria
- Tests are at the right level (mix, not all-unit or all-e2e)
- No skipped or disabled tests
- Tests go RED when the feature is removed (not vacuously passing)
