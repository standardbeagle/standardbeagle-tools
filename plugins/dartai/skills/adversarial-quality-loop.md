---
name: adversarial-quality-loop
description: Adversarial cooperation loop for code quality verification with plan adjustment at each phase. 對抗協作循環：實施者與驗證者互相制衡，逐階調整計劃，確保代碼品質。 Use when: execute dart task, run quality pipeline, adversarial review, implement with verification
---

# Adversarial Quality Loop (Ralph Wiggum Pattern)

實施者與驗證者對抗協作之持續執行環，確保代碼品質。驗證者主動尋缺，實施者守護與修復。

## Core Principles

### Context-Sized Tasks
每環中任務須：
- **Scoped**: 單次專注會話可完成
- **Isolated**: 與其他並發工作獨立
- **Measurable**: 完成定義明確
- **Bounded**: 每任務最多3-5個文件

### Plan Adjustment Protocol
每階段結束後，**自動**（勿停待確認）：
1. 審視所發現內容
2. 依發現更新餘下任務
3. 若發現阻塞問題則重新排序
4. 在任務評論中記錄調整
5. **立即繼續**下一階段，除非BLOCKED

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

驗證者對下列違規須**極度警惕**。任何出現即刻拒絕並返工。

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

### 5. Codebase Integration Requirement
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

## Phase 0: Git Hygiene & TDD Setup

任何實施工作開始前，建立乾淨基礎。

### Task: Start from Latest Code

**DO (Positive Instructions):**
- Pull the latest changes from the main branch
- Rebase your working branch onto the latest main
- Resolve any conflicts before starting new work
- Verify the project builds and all tests pass on the clean base
- Check for any uncommitted work and stash or commit it first

**DO NOT (Negative Instructions):**
- Start work on a stale branch
- Skip pulling latest changes
- Ignore merge conflicts
- Begin implementation with failing tests in the base

```yaml
git_hygiene:
  before_starting:
    - "git fetch origin"
    - "git rebase origin/main (or merge if rebase not possible)"
    - "resolve any conflicts"
    - "run full test suite - must be green"
    - "build the project - must succeed"

  during_work:
    - "rebase often if main moves forward"
    - "commit small, focused changes"
    - "each commit should build and pass tests"
    - "use conventional commit messages"

  before_completion:
    - "rebase onto latest main one final time"
    - "verify all tests pass after rebase"
    - "squash fixup commits if appropriate"
    - "never force-push to shared branches"
```

### Task: TDD Setup (Strict Red/Green/Refactor)

**DO (Positive Instructions):**
- Write ONE failing test BEFORE any implementation
- Run the test - it MUST FAIL (RED) for the right reason
- Write MINIMUM code to make that ONE test pass (GREEN)
- Refactor ONLY when GREEN
- Commit after each GREEN
- Repeat cycle for each small behavior increment
- Implement VERTICAL SLICES (full feature through all layers)

**DO NOT (Negative Instructions):**
- Write implementation before a RED test exists
- Write multiple tests before making first one GREEN
- Skip the "verify RED" step
- Refactor while RED
- Mock internal code - only mock at system boundaries
- Build horizontal layers (all DB, then all API, then all UI)

```yaml
tdd_cycle:
  order: "strict_red_green_refactor"
  vertical_slices: true
  
  red_phase:
    rule: "Write ONE test, verify it FAILS"
    steps:
      - "Write test for smallest behavior increment"
      - "Run test - it MUST FAIL (RED)"
      - "If test passes, test is wrong - delete or fix it"
      - "Commit: 'RED: Test for [behavior]'"
    violations:
      - "Writing multiple tests before first RED"
      - "Skipping RED verification"
      - "Writing implementation before RED test"
  
  green_phase:
    rule: "Write MINIMUM code to pass"
    steps:
      - "Implement just enough to go RED → GREEN"
      - "No code without a failing test first"
      - "No 'preparing' the implementation"
      - "Commit: 'GREEN: [behavior] implemented'"
    violations:
      - "Writing more than minimum"
      - "Refactoring while getting to GREEN"
      - "Adding 'while I'm here' features"
  
  refactor_phase:
    rule: "Clean up ONLY when GREEN"
    steps:
      - "Refactor with all tests passing"
      - "If tests go RED, undo immediately"
      - "Commit: 'REFACTOR: [what changed]'"
    violations:
      - "Refactoring while RED"
      - "Changing behavior during refactor"
      - "Skipping refactor phase"

vertical_slices:
  rule: "Implement full feature vertically, not horizontal layers"
  
  vertical_approach:
    description: "Complete thin slice through all layers"
    example_good:
      - "Task: User can create a post (validation + DB + API + response)"
      - "Task: User can view a post (query + API + response)"
    benefits:
      - "Delivers working features immediately"
      - "Validates integration at each step"
      - "Enables early feedback and demos"
      - "Reduces integration risk"
  
  horizontal_approach:
    description: "Complete layer across all features"
    example_bad:
      - "Task: Build all database models first"
      - "Task: Build all API endpoints first"
      - "Task: Add all validations later"
    problems:
      - "No working feature until very end"
      - "Integration issues discovered late"
      - "Cannot demo or test partial progress"
      - "High risk of rework"

smoke_tests:
  rule: "Smoke tests ALWAYS use highest fidelity — full e2e, never mocked"
  when: "Write smoke test first (RED), verify it last (GREEN)"

what_to_test_first:
  - "Smoke test for core user journey (highest fidelity e2e)"
  - "The core behavior described in acceptance criteria"
  - "Edge cases identified during Phase 1 analysis"
  - "Error handling paths"
  - "Integration points with existing code"

when_to_skip_tdd:
  - "Pure UI layout changes with no logic"
  - "Configuration-only changes"
  - "Documentation-only changes"
  - "NEVER skip for business logic or data transformations"

test_quality:
  - "Tests describe behavior, not implementation"
  - "Each test has a single clear assertion"
  - "Test names read as specifications"
  - "No mocks for internal code — only external boundaries"
  - "Every test was seen RED before GREEN"
  - "Tests verify vertical slice, not isolated layer"
```

**Verification Criteria:**
```yaml
pass_if:
  - base_branch_up_to_date: true
  - project_builds_clean: true
  - all_existing_tests_pass: true
  - tdd_approach_planned: true
fail_if:
  - stale_branch: true
  - build_failures: true
  - pre_existing_test_failures_ignored: true
```

### Plan Adjustment Point 0 (Automatic - Do Not Stop)
```yaml
checkpoint:
  validate:
    - branch_rebased: true
    - clean_build: true
    - tests_green: true

  auto_adjust:
    merge_conflicts: "Resolve conflicts, rebuild, CONTINUE"
    pre_existing_failures: "Fix or report as blocker, CONTINUE"
    stale_dependencies: "Update and rebuild, CONTINUE"

  stop_only_if:
    critical_blocker: "Cannot build or base tests fundamentally broken"

  then: "Proceed immediately to Phase 1"
```

---

## Phase 1: Read Grilled Task Spec

### Task: Confirm Planning Output

任務已於計劃時審查。審查後規格含範圍、文件及驗收標準。勿重新發現。

**DO (Positive Instructions):**
- Read the grilled task spec (in task description or prompt)
- Confirm acceptance criteria are clear and verifiable
- Confirm files to modify are listed (max 5)
- Confirm scope is bounded and context-sized
- If no grilled spec is present, run `dev-standards:grill-task` inline

**DO NOT (Negative Instructions):**
- Re-analyze requirements that were already grilled
- Re-identify files that were already scoped
- Re-list acceptance criteria that were already defined
- Start extensive research — that happens at planning time

**Verification Criteria:**
```yaml
pass_if:
  - grilled_spec_read: true
  - acceptance_criteria_clear: true
  - files_confirmed: "<= 5 files"
  - scope_is_context_sized: true
fail_if:
  - no_grilled_spec_and_cannot_generate: true
  - scope_exceeds_limit: true
```

### Plan Adjustment Point 1 (Automatic - Do Not Stop)
```yaml
checkpoint:
  validate:
    - grilled_spec_available: true
    - scope_bounded: "max 5 files"
    - acceptance_criteria_clear: true

  auto_adjust:
    scope_exceeds_5_files: "Split into subtasks, add to plan, CONTINUE"
    no_grilled_spec: "Run grill-task inline, CONTINUE"

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
  compiles_without_error: true
  no_new_lint_errors: true
  follows_existing_patterns: true
  changes_match_requirements: true
fail_if:
  introduces_bugs: true
  breaks_existing_tests: true
  scope_creep: true
  lint_errors_introduced: true
```

### Task: Self-Adversarial Review

提交前攻擊自己的代碼：

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
  edge_cases_tested: true
  error_paths_verified: true
  no_resource_leaks: true
  security_checked: true
fail_if:
  untested_edge_cases: true
  unchecked_errors: true
  potential_leaks: true
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

## Phase 3: Concurrent Adversarial Review

### Task: Dispatch Review Agents

並發派遣兩名審查代理。各以新鮮上下文運行，返回結構化裁決。此為快速對抗門——安全深度審查及PM審查在Phase 5進行。

**Dispatch both in parallel using the Task tool:**

```yaml
concurrent_agents:
  code_quality_reviewer:
    subagent_type: "dartai:code-quality-reviewer"
    description: "Review code quality for [task-title]"
    prompt: |
      Review code quality for task [TASK_ID].

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      Focus on: project coherence, best practices, no bloat,
      no fallbacks/TODOs, code duplication, cleanup and refactoring.

      Return structured verdict: PASS, FAIL, or NEEDS_WORK with issues.

  qa_reviewer:
    subagent_type: "dartai:qa-reviewer"
    description: "Review QA and requirements for [task-title]"
    prompt: |
      Review QA, test quality, and requirements for task [TASK_ID].

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      Focus on: assertion quality, edge case coverage, e2e testing,
      TDD compliance (RED/GREEN), test distribution, test isolation,
      requirements traceability, and testability.

      Return structured verdict: PASS, FAIL, or NEEDS_WORK with issues.

  # INT1 wave-1: always-on review personas (correctness, maintainability, testing).
  # Diff-conditional dispatch per R2 §3 — these three are unconditional because
  # their agent frontmatter is always-on (no Skip-when filter on file type).
  correctness_reviewer:
    subagent_type: "compound-review:correctness-reviewer"
    description: "Correctness review for [task-title]"
    prompt: |
      Run correctness review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Logic errors, edge cases, off-by-one, null/undefined propagation,
      race conditions, state-transition bugs, swallowed errors,
      intent-vs-implementation mismatch.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.

  maintainability_reviewer:
    subagent_type: "compound-review:maintainability-reviewer"
    description: "Maintainability review for [task-title]"
    prompt: |
      Run maintainability review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Premature abstraction, unnecessary indirection, dead code,
      cross-module coupling, naming that obscures intent,
      duplication (jscpd), YAGNI violations.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.

  testing_reviewer:
    subagent_type: "compound-review:testing-reviewer"
    description: "Testing review for [task-title]"
    prompt: |
      Run testing review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Untested branches, weak/brittle assertions, implementation-coupled
      tests, missing error-path coverage, behavior changes without tests.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.

  # Conditional reviewers — only dispatch when diff matches the trigger.
  # Predicate syntax: JavaScript-expression evaluated against the changed-files
  # list; `file` iterates each path. See R2 §6.1 for canonical form.
  typescript_strict_reviewer:
    enabled_when: "any(file.endsWith('.ts') || file.endsWith('.tsx'))"
    subagent_type: "compound-review:typescript-strict-reviewer"
    description: "TypeScript-strict review for [task-title]"
    prompt: |
      Run TypeScript-strict review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of *.ts / *.tsx files changed]

      ## Acceptance Criteria
      [criteria from task]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Type-system loopholes (`any`, unchecked casts, broad `unknown as Foo`),
      nullable narrowing, hidden regressions in refactors/deletions,
      five-second-rule failures, hard-to-test structure-vs-behavior gaps.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.

  cli_readiness_reviewer:
    enabled_when: |
      any(file.includes('/cli/') || file.includes('/commands/')
          || file.includes('/bin/') || /\.cli\./.test(file)
          || /docs\/plans\/.*cli.*\.md$/.test(file)
          || /docs\/research\/.*cli.*\.md$/.test(file))
    subagent_type: "compound-review:cli-readiness-reviewer"
    description: "CLI agent-readiness review for [task-title]"
    prompt: |
      Run CLI agent-readiness review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of CLI source/spec/plan files changed]

      ## Acceptance Criteria
      [criteria from task]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Non-interactive defaults (TTY guards, --yes flags), structured
      output (--json/--format), actionable errors, idempotent retries,
      bounded list output, stdout/stderr separation, help-text completeness.
      Severity caps at P1; all findings advisory/manual.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.
```

**Handling Results:**

```yaml
result_handling:
  all_pass:
    action: "Proceed to Phase 4"
    note: "All dispatched reviewers approved"

  any_needs_work:
    action: "Fix issues, re-dispatch ONLY the failing reviewer(s)"
    max_retries: 2
    note: "Don't re-run reviewers that already passed"

  any_fail:
    action: "Fix issues, re-dispatch ONLY the failing reviewer(s)"
    max_retries: 2
    escalate_after: "If still failing after 2 retries, RETURN with failure"

  conditional_skip:
    note: |
      Reviewers gated by enabled_when (typescript_strict, cli_readiness)
      are skipped when the diff does not match. Skipped reviewers do NOT
      block pass_if — only dispatched reviewers' verdicts join the AND.
```

**Verification Criteria:**
```yaml
pass_if:
  # Always-dispatched reviewers — verdicts must all be PASS
  - code_quality_reviewer_verdict: "PASS"
  - qa_reviewer_verdict: "PASS"
  - correctness_reviewer_verdict: "PASS"
  - maintainability_reviewer_verdict: "PASS"
  - testing_reviewer_verdict: "PASS"
  # Conditional reviewers — verdict must be PASS when dispatched, ignored when skipped
  - typescript_strict_reviewer_verdict_if_dispatched: "PASS"
  - cli_readiness_reviewer_verdict_if_dispatched: "PASS"
fail_if:
  - any_dispatched_verdict_fail_after_retries: true
```

### Plan Adjustment Point 3 (Automatic - Do Not Stop)
```yaml
checkpoint:
  validate:
    - all_agents_returned: true
    - no_critical_security: true
    - issues_addressed: true

  auto_adjust:
    code_quality_issues: "Fix inline and re-dispatch code-quality-reviewer, CONTINUE"
    qa_issues: "Add tests and re-dispatch qa-reviewer, CONTINUE"

  stop_only_if:
    critical_blocker: "Both agents failing after retries"

  then: "Proceed immediately to Phase 4"
```

---

## Phase 4: Quality Gate Verification

### Task: Automated Quality Checks

運行並驗證所有自動化工具：

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

## Phase 4.5: Review for Plan Updates (C-class refactor discovery)

### Task: Invoke `dev-standards:review-for-plan-updates`

品質門通過後、深度任務後審查前，運行C類重構審查。此步發出結構化計劃更新提案——如參數臃腫、重複、命名漂移——不編輯任何代碼。

**DO (Positive Instructions):**
- Invoke `dev-standards:review-for-plan-updates` with `git diff <task-base>..HEAD`
- Persist returned proposals as Dart tasks in the `refactor-backlog` folder, tagged `origin:review` with link back to the surfacing task (this persistence is the dartai wrapper responsibility; `dev-standards:code-quality` — now thin — handles it)
- Check each proposal against `.claude/refactor-rejects.txt` fingerprints before persisting

**DO NOT:**
- Edit code based on findings — the current task is scope-locked
- Decide accept/defer/reject yourself — that is the planner's job at the next planning cycle
- Expand the trigger catalog beyond what the skill defines
- Run this phase on tasks that failed quality gates (they will re-run)

**Verification Criteria:**
```yaml
pass_if:
  - review_skill_invoked: true
  - proposals_persisted_or_empty: true
  - no_code_modifications: true
fail_if:
  - any_code_edits_made: true
  - reviewer_decided_accept_reject: true
```

---

## Phase 5: Post-Task Deep Review

### Task: Dispatch Post-Task Reviewer

品質門通過後，運行深度順序審查。此代理覆蓋快速並行門有意跳過之事：帶攻擊者心態的安全審查、深度代碼分析、PM/文檔，及重新規劃。

**Dispatch as a single sequential agent:**

```yaml
post_task_review:
  subagent_type: "dartai:post-task-reviewer"
  description: "Deep review for [task-title]"
  prompt: |
    Run post-task deep review for task [TASK_ID].

    ## Changed Files
    [list of files changed]

    ## Acceptance Criteria
    [criteria from task]

    ## Context
    The fast adversarial gate (code-quality-reviewer + qa-reviewer) already
    passed. Quality gates (lint, test, coverage) are green.

    Run all four phases sequentially:
    1. Security audit (attacker mindset, OWASP, attack vectors)
    2. In-depth code review (performance, concurrency, architecture)
    3. PM review (documentation accuracy, user flows, changelog)
    4. Replan (adjust remaining tasks based on findings)

    Return structured post-task report with verdict and replan recommendations.
```

**Handling Results:**

```yaml
result_handling:
  pass:
    action: "Proceed to Phase 6"
    apply_replan: "Create/modify/remove tasks per recommendations"

  needs_work:
    action: "Fix issues (docs, minor code), proceed to Phase 6"
    note: "Non-blocking issues become follow-up tasks"

  fail:
    action: "Fix critical issues (security, concurrency bugs)"
    max_retries: 1
    escalate_after: "If still failing, RETURN with failure"

  critical_security:
    action: "STOP immediately"
    note: "Critical security finding blocks all work"
```

**Verification Criteria:**
```yaml
pass_if:
  - no_critical_security: true
  - no_concurrency_bugs: true
  - replan_applied: true
fail_if:
  - critical_security_finding: true
  - unresolvable_architecture_issue: true
```

### Plan Adjustment Point 5 (Automatic - Do Not Stop)
```yaml
checkpoint:
  validate:
    - post_task_reviewer_returned: true
    - no_critical_findings: true
    - replan_recommendations_processed: true

  auto_adjust:
    doc_updates_needed: "Apply doc fixes, CONTINUE"
    performance_concerns: "Create follow-up optimization task, CONTINUE"
    replan_tasks: "Create/modify tasks per recommendations, CONTINUE"
    critical_security: "STOP - create urgent fix task"

  stop_only_if:
    critical_blocker: "Critical security vulnerability or unresolvable architecture issue"

  then: "Proceed immediately to Phase 6"
```

---

## Phase 6: Final Validation

### Task: Acceptance Criteria Verification

對原始需求之最終核驗：

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

Phase 6完成後：

1. **On Success:**
   - Update task status to Done
   - Add completion comment with summary
   - Log metrics (time, issues found, fixes made)
   - **RETURN to main loop** - it will spawn next task subagent

2. **On Failure (RETURN, not STOP):**
   - Document specific failure point
   - Add failure comment with details
   - **Recommend whether fix task should be created**
   - **Identify what tasks are blocked by this failure**
   - **RETURN to main loop** - it decides whether to:
     - Create fix tasks
     - Continue to next actionable task
     - Stop (only if user requested or critical security issue)
   - **You are one iteration - the loop owns continuation decisions**

3. **Plan Adjustment Summary:**
   ```yaml
   log_adjustments:
     phase_1_adjustments: "scope changes"
     phase_2_adjustments: "implementation discoveries"
     phase_3_adjustments: "verification findings"
     phase_4_adjustments: "quality gate results"
     phase_5_adjustments: "post-task review findings"
     phase_6_adjustments: "final validation notes"

   failure_report:  # Include if task failed
     phase_failed: "Phase N"
     reason: "Specific error"
     recommended_fix: "What to try next"
     blocks_tasks: ["list of blocked task IDs"]
     create_fix_task: true/false
   ```

---

## Metrics and Tracking

每任務追蹤：
- 每階段耗時
- 各點所作調整
- 各類別發現問題
- 修復有效率

跨任務追蹤：
- 常見失敗模式
- 階段瓶頸
- 調整頻率
- 品質趨勢
