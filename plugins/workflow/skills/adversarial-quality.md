---
name: adversarial-quality
description: Full quality loop with implementation and adversarial verification
---

# Adversarial Quality Loop

Complete implementation with adversarial self-review and external verification.

## Overview

This loop implements the full Ralph Wiggum adversarial cooperation pattern:
1. Positive implementation (make it work)
2. Self-adversarial review (find your own flaws)
3. External adversarial verification (independent challenge)
4. Quality gates (automated checks)
5. Final validation (acceptance criteria)

**Context Rule**: This skill runs INSIDE a subagent (fresh context for this task only).

## Execution Phases

### Phase 0: Git Hygiene & TDD Setup

**Objective**: Start from the latest code and establish TDD discipline

**Steps**:
1. Pull latest changes and rebase onto main
2. Resolve any merge conflicts
3. Verify the project builds and all tests pass on the clean base
4. Plan TDD approach — identify which tests to write first

```yaml
git_hygiene:
  before_starting:
    - "git fetch origin"
    - "git rebase origin/main"
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

tdd_cycle:
  order: "test first, always"
  steps:
    RED: "Write a test that describes the next behavior. Run it. It MUST FAIL (RED). If it passes, the test is wrong."
    GREEN: "Write the MINIMUM code to make the RED test pass. Confirm GREEN."
    REFACTOR: "Clean up code while tests stay GREEN. If any test goes RED, undo immediately."

  violations:
    - "Writing implementation before a RED test exists"
    - "A test that was never seen RED"
    - "Refactoring while any test is RED"

  smoke_tests:
    rule: "Smoke tests ALWAYS use highest fidelity — full e2e, never mocked"

  when_to_skip_tdd:
    - "Pure UI layout changes with no logic"
    - "Configuration-only changes"
    - "Documentation-only changes"
    - "NEVER skip for business logic or data transformations"
```

**Output**: Clean, up-to-date branch ready for TDD implementation

**Checkpoint**: Record branch state, build status, test baseline count.

### Phase 1: Implementation Planning (5-10% of time)

**Objective**: Understand scope and create verification checklist

**Steps**:
1. Read task specification from loop state file
2. Identify all files in scope (max 5)
3. Read current file contents
4. Create implementation plan
5. Create verification checklist
6. Write checkpoint to state file

**Implementer Mindset**: "Make it work correctly"

**Output**:
```yaml
implementation_plan:
  files_to_change:
    - file: "path/to/file.ts"
      changes: "What needs to change"

  verification_checklist:
    - "Acceptance criterion 1 met"
    - "No type errors"
    - "Tests pass"
    - "No security vulnerabilities"

  estimated_complexity: "Low|Medium|High"
```

**Checkpoint**: Write plan to state file, In the next phase, read ONLY the checkpoint summary, not full implementation files.

### Phase 2: Positive Implementation (30-40% of time)

**Objective**: Implement the task following best practices

**Implementer Mindset**: "Make it work, make it right"

**Steps**:
1. Read implementation plan from state file (fresh context)
2. Implement changes following positive instructions:
   - ✓ Write clear, maintainable code
   - ✓ Follow existing patterns
   - ✓ Add proper error handling
   - ✓ Write comprehensive tests
   - ✓ Add necessary documentation

**Positive Instructions (DO)**:
- Use existing code patterns
- Write clear variable names
- Add type annotations
- Handle edge cases
- Write tests FIRST (TDD — red/green/refactor cycle from Phase 0)
- Keep functions small and focused
- Add comments for complex logic
- Follow security best practices

**Output**: Implementation complete, ready for adversarial review

**Checkpoint**: Write implementation summary, explicitly forget code details.

### Phase 3: Self-Adversarial Review (15-20% of time)

**Objective**: Find flaws in your own implementation

**Verifier Mindset**: "Break it, find edge cases, question assumptions"

**Steps**:
1. Read implementation summary (NOT full code yet)
2. Generate attack vectors and edge cases
3. Read actual implementation
4. Challenge every decision:
   - ❌ What inputs will break this?
   - ❌ What assumptions are unsafe?
   - ❌ What edge cases are missing?
   - ❌ Where can this fail?
   - ❌ What security issues exist?

**Adversarial Challenges**:
```yaml
challenge_categories:
  input_validation:
    - "What if input is null/undefined/empty?"
    - "What if input is extremely large?"
    - "What if input contains special characters?"

  state_management:
    - "What if function called twice concurrently?"
    - "What if state is invalid?"
    - "What if initialization fails?"

  error_handling:
    - "What if network fails?"
    - "What if file doesn't exist?"
    - "What if parse fails?"

  security:
    - "What if input is malicious?"
    - "What if user is unauthorized?"
    - "What secrets could leak?"

  performance:
    - "What if data is huge?"
    - "What if this runs 1000 times?"
    - "What memory could leak?"
```

**Output**: List of issues found + fixes applied

**Checkpoint**: Write issues found, forget implementation again.

### Phase 4: Concurrent Adversarial Verification (20-30% of time)

**Objective**: Independent verification by two specialized agents running in parallel

**Pattern**: Spawn both verifier subagents simultaneously using the Task tool, then handle results

#### Dispatch (both in parallel)

```yaml
concurrent_dispatch:
  tool: Task
  spawn_simultaneously: true

  agents:
    - subagent_type: "workflow:code-quality-reviewer"
      description: "Review code quality and codebase integration"
      prompt: |
        Review code quality for task [task-id].

        Task: [title]
        Files changed: [list]
        Acceptance criteria: [criteria]

        Focus on: project coherence, best practices, no bloat, no fallbacks/TODOs, code duplication, cleanup and refactoring.
        - What inputs or states will break this?

        Return a verification report (see schema below).

    - subagent_type: "workflow:qa-reviewer"
      description: "Review test quality and coverage"
      prompt: |
        Review QA and test quality for task [task-id].

        Task: [title]
        Files changed: [list]
        Acceptance criteria: [criteria]

        Focus: Test quality and coverage
        - Assertion quality, edge case coverage, e2e testing
        - TDD compliance (RED/GREEN), test distribution
        - Test isolation, test plan maintenance
        - What critical paths lack tests?
        - Requirements traceability, and testability

        Return a verification report (see schema below).
```

#### Verification Report Schema (each agent returns this)

```yaml
verification_report:
  agent: "code-quality-reviewer|qa-reviewer"
  result: "all_pass|needs_work|critical_security"

  issues_found:
    - severity: "critical|high|medium|low"
      category: "correctness|quality|test-coverage|security|performance"
      description: "What's wrong"
      location: "file:line"
      recommendation: "How to fix"

  positive_findings:
    - "What was done well"

  acceptance_criteria_checked:
    - criterion: "Criterion text"
      met: true|false
      evidence: "How verified"
```

#### Result Handling

```yaml
result_routing:
  collect: "Wait for both agents to return before evaluating"

  all_pass:
    trigger: "Both agents return result: all_pass"
    action: "Proceed to Phase 5"

  needs_work:
    trigger: "One or both agents return result: needs_work"
    action: |
      1. Fix all reported issues
      2. Re-dispatch ONLY the agents that returned needs_work (not passing agents)
      3. Pass the same inputs plus a fixes_applied summary
    max_retries: 2
    if_still_failing_after_retries: |
      Write failure report to state file with unresolved issues.
      Return to main loop with status: failed.
```

**Checkpoint**: Write combined verification report from all agents, forget implementation details.

### Phase 5: Quality Gates (10-15% of time)

**Objective**: Run automated checks

**Steps**:
1. Run linter
2. Run type checker
3. Run tests
4. Run security scanner (if available)
5. Check code coverage

**Automated Checks**:
```bash
# Linting
npm run lint  # or equivalent

# Type checking
tsc --noEmit  # or equivalent

# Tests
npm test      # or equivalent

# Security
npm audit     # or equivalent

# Coverage
npm run test:coverage  # or equivalent
```

**Quality Thresholds**:
- ✓ No linting errors
- ✓ No type errors
- ✓ All tests pass
- ✓ No critical security issues
- ✓ Coverage >= 80% for new code

**If Gates Fail**: Fix issues and re-run

**Checkpoint**: Write quality report, forget details.

### Phase 5b: Post-Task Deep Review

**Objective**: Deep sequential review after quality gates pass

**Pattern**: Dispatch single post-task reviewer agent

```yaml
post_task_dispatch:
  tool: Task
  
  agent:
    subagent_type: "workflow:post-task-reviewer"
    description: "Deep review for [task-id]"
    prompt: |
      Run post-task deep review for task [task-id].

      Task: [title]
      Files changed: [list]
      Acceptance criteria: [criteria]

      The fast adversarial gate and quality gates already passed.
      Run all four phases: security audit, in-depth code, PM/docs, replan.

      Return structured post-task report.
```

**Result Handling**:
```yaml
post_task_routing:
  pass:
    action: "Apply replan recommendations, proceed to Phase 6"

  needs_work:
    action: "Fix issues, proceed to Phase 6"
    note: "Non-blocking issues become follow-up tasks"

  fail:
    action: "Fix critical issues (security, concurrency)"
    max_retries: 1

  critical_security:
    action: "STOP - write security-halt report"
```

**Checkpoint**: Write post-task findings and replan to state file.

### Phase 6: Final Validation (5-10% of time)

**Objective**: Verify acceptance criteria met

**Steps**:
1. Read acceptance criteria from task spec
2. Read all checkpoint reports
3. Verify each criterion:
   - Evidence from implementation
   - Evidence from verification
   - Evidence from quality gates
4. Generate completion report

**Validation Checklist**:
```yaml
final_validation:
  - criterion: "Each acceptance criterion"
    met: true|false
    evidence:
      - "Implementation: ..."
      - "Verified: ..."
      - "Tests: ..."

  overall_result: "complete|incomplete"
```

**Completion Report**:
```yaml
completion_report:
  task_id: "task-3"
  status: "completed|failed"

  summary: "One sentence summary"

  acceptance_criteria_met: true|false
  verification_passed: true|false
  quality_gates_passed: true|false

  stats:
    files_changed: 3
    lines_added: 150
    lines_removed: 45
    tests_added: 5
    issues_found: 8
    issues_fixed: 8

  iterations: 2
  adjustments:
    - "Added validation helper function"

  total_time: "25m 30s"

  recommendation: "Mark complete and proceed"
```

**Write to State File**: Update loop state with completion

## Context Management

Throughout this loop:

**Between Phases**:
```yaml
context_barriers:
  technique: "Write checkpoint, explicitly forget, read next phase"

  example: |
    # End of Phase 2
    Write implementation summary to state file
    Explicitly state: "Discarding implementation details for fresh review"

    # Start of Phase 3
    Read only implementation summary (NOT full code yet)
    Generate adversarial test cases
    THEN read full code with adversarial mindset
```

**Within Subagent**:
```yaml
context_accumulation:
  allowed: "Yes - this is a single task execution"
  why: "Need continuity within task phases"
  limit: "One task only (1-5 files, 1-2 hours max)"
```

**Between Subagents**:
```yaml
context_isolation:
  enforced: "Yes - when spawning code-quality-reviewer, qa-reviewer, and post-task-reviewer"
  why: "Independent verification requires fresh eyes"
  mechanism: "Task tool spawns separate subagents concurrently"
```

## Adjustments and Learning

During execution, track adjustments:

```yaml
adjustments:
  types:
    - added_test: "Added test case not in original plan"
    - modified_scope: "Changed file scope (within 5 file limit)"
    - clarified_criteria: "Asked user for clarification"
    - added_dependency: "Needed helper function"

  recording: "Write to state file for loop orchestrator"

  impact: "Main loop updates task list if needed"
```

## Failure Modes

If loop fails at any phase:

```yaml
failure_handling:
  record:
    failed_at: "phase_name"
    reason: "What went wrong"
    attempted_fixes: "What was tried"

  decision:
    retry: "If fixable (e.g., test failure)"
    skip: "If task ill-defined"
    stop: "If critical issue (e.g., security)"

  return_to_main_loop: "With failure report in state file"
```

## Usage

This skill is invoked by the workflow:task-executor agent to run the full quality loop for a task.

See `loop-orchestration.md` for how this integrates into the overall loop.
