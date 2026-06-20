# Adversarial Quality Loop: Phase Detail

Loaded by `adversarial-quality-loop` when the executor enters a specific phase. Each phase below specifies DO/DO-NOT, verification criteria, and plan-adjustment rules.

---

## Phase 0: Git Hygiene & TDD Setup

任何實施工作開始前，建立乾淨基礎。

### Task: Start from Latest Code

**DO:**
- Pull the latest changes from the main branch
- Rebase your working branch onto the latest main
- Resolve any conflicts before starting new work
- Verify the project builds and all tests pass on the clean base
- Check for any uncommitted work and stash or commit it first

**DO NOT:**
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

**DO:**
- Write ONE failing test BEFORE any implementation
- Run the test - it MUST FAIL (RED) for the right reason
- Write MINIMUM code to make that ONE test pass (GREEN)
- Refactor ONLY when GREEN
- Commit after each GREEN
- Repeat cycle for each small behavior increment
- Implement VERTICAL SLICES (full feature through all layers)

**DO NOT:**
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

### Plan Adjustment Point 0

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

任務已於計劃時審查。審查後規格含範圍、文件及驗收標準。勿重新發現。

**DO:**
- Read the grilled task spec (in task description or prompt)
- Confirm acceptance criteria are clear and verifiable
- Confirm files to modify are listed (~5 typical; judge by context cost, not raw count)
- Confirm scope is bounded and context-sized (subagent should finish with ~50% context headroom)
- If no grilled spec is present, run `dev-standards:grill-task` inline

**DO NOT:**
- Re-analyze requirements that were already grilled
- Re-identify files that were already scoped
- Re-list acceptance criteria that were already defined
- Start extensive research — that happens at planning time

```yaml
pass_if:
  - grilled_spec_read: true
  - acceptance_criteria_clear: true
  - files_confirmed: "context-sized (~5 typical; judge by context cost, not count)"
  - scope_is_context_sized: true
fail_if:
  - no_grilled_spec_and_cannot_generate: true
  - scope_would_bloat_context: true
```

### Plan Adjustment Point 1

```yaml
checkpoint:
  validate:
    - grilled_spec_available: true
    - scope_context_sized: "subagent finishes with ~50% headroom; ~5 files typical, judge by context cost not count"
    - acceptance_criteria_clear: true
  auto_adjust:
    scope_would_bloat_context: "Split into subtasks, add to plan, CONTINUE"
    context_climbs_mid_task: "Persist progress, split remainder into follow-up, replan, CONTINUE"
    no_grilled_spec: "Run grill-task inline, CONTINUE"
  stop_only_if:
    critical_blocker: "Cannot determine scope at all"
  then: "Proceed immediately to Phase 2"
```

---

## Phase 2: Adversarial Implementation

### Task: Implement with Defensive Coding

**DO:**
- Implement the minimum necessary changes
- Add error handling for all edge cases
- Write self-documenting code with clear names
- Follow existing patterns in the codebase
- Add inline comments for complex logic only

**DO NOT:**
- Add features not in requirements
- Refactor unrelated code
- Use magic numbers or strings
- Skip error handling
- Create technical debt knowingly

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

**DO:**
- Try to break your implementation with edge cases
- Search for similar code that might conflict
- Verify error messages are helpful
- Check for resource leaks
- Test with null/empty/large inputs

**DO NOT:**
- Assume happy path is sufficient
- Skip testing error paths
- Ignore potential race conditions
- Overlook security implications
- Trust external input

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

### Plan Adjustment Point 2

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

See `references/dispatch.md` for the full reviewer dispatch playbook (verdict-file channel, parallel reviewer prompts, conditional reviewers, result handling). The body of `adversarial-quality-loop.md` summarizes the entry condition; this phase's full prompts and verdict-consumption rules live in `dispatch.md`.

### Plan Adjustment Point 3

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

運行並驗證所有自動化工具：

**DO:**
- Run linter with strict settings
- Execute full test suite
- Check test coverage metrics
- Verify documentation generated
- Run static analysis tools

**DO NOT:**
- Ignore warnings (review each one)
- Skip slow tests
- Accept coverage decreases
- Skip documentation checks
- Disable any linter rules

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

### Plan Adjustment Point 4

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

品質門通過後、深度任務後審查前，運行C類重構審查。此步發出結構化計劃更新提案——如參數臃腫、重複、命名漂移——不編輯任何代碼。

**DO:**
- Invoke `dev-standards:review-for-plan-updates` with `git diff <task-base>..HEAD`
- Persist returned proposals as Dart tasks in the `refactor-backlog` folder, tagged `origin:review` with link back to the surfacing task (this persistence is the dartai wrapper responsibility; `dev-standards:code-quality` — now thin — handles it)
- Check each proposal against `.claude/refactor-rejects.txt` fingerprints before persisting

**DO NOT:**
- Edit code based on findings — the current task is scope-locked
- Decide accept/defer/reject yourself — that is the planner's job at the next planning cycle
- Expand the trigger catalog beyond what the skill defines
- Run this phase on tasks that failed quality gates (they will re-run)

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

品質門通過後，運行深度順序審查。此代理覆蓋快速並行門有意跳過之事：帶攻擊者心態的安全審查、深度代碼分析、PM/文檔，及重新規劃。

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

```yaml
pass_if:
  - no_critical_security: true
  - no_concurrency_bugs: true
  - replan_applied: true
fail_if:
  - critical_security_finding: true
  - unresolvable_architecture_issue: true
```

### Plan Adjustment Point 5

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

## Phase 5.5: Lightweight Cite Verify

See `references/cite-verify.md` for the lightweight citation verification protocol — form-specific check rules, retry budget, and Tier separation. Body summary in `adversarial-quality-loop.md` only states the entry condition (after commit, before Done).

---

## Phase 6: Final Validation

對原始需求之最終核驗：

**DO:**
- Re-read original task description
- Verify EACH acceptance criterion explicitly
- Confirm no scope creep occurred
- Validate documentation is complete
- Ensure clean commit history

**DO NOT:**
- Mark done without verifying criteria
- Skip documentation review
- Leave TODO comments unresolved
- Commit debug code
- Merge with failing checks

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

## Loop Continuation Protocol (Phase 6 close)

1. **On Success:** Update task status to Done; add completion comment with summary; log metrics; **RETURN to main loop** — it will spawn next task subagent.

2. **On Failure (RETURN, not STOP):**
   - Document specific failure point
   - Add failure comment with details
   - Recommend whether fix task should be created
   - Identify what tasks are blocked by this failure
   - **RETURN to main loop** — it decides whether to create fix tasks, continue, or stop
   - You are one iteration — the loop owns continuation decisions

3. **Plan Adjustment Summary:**

```yaml
log_adjustments:
  phase_1_adjustments: "scope changes"
  phase_2_adjustments: "implementation discoveries"
  phase_3_adjustments: "verification findings"
  phase_4_adjustments: "quality gate results"
  phase_5_adjustments: "post-task review findings"
  phase_6_adjustments: "final validation notes"

failure_report:
  phase_failed: "Phase N"
  reason: "Specific error"
  recommended_fix: "What to try next"
  blocks_tasks: ["list of blocked task IDs"]
  create_fix_task: true/false
```

## Metrics

每任務追蹤：每階段耗時、各點所作調整、各類別發現問題、修復有效率。
跨任務追蹤：常見失敗模式、階段瓶頸、調整頻率、品質趨勢。
