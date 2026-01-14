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

**Checkpoint**: Write plan to state file, explicitly forget details.

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
- Write tests first (TDD when appropriate)
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

### Phase 4: External Adversarial Verification (20-30% of time)

**Objective**: Independent verification by quality-verifier agent

**Pattern**: Spawn verifier subagent for truly independent review

```yaml
verifier_spawn:
  tool: Task
  subagent_type: "workflow:quality-verifier"
  description: "Verify task implementation"

  prompt: |
    Verify implementation of task [task-id].

    Task: [title]
    Files changed: [list]

    Your role: Challenge the implementation to find flaws.

    Focus areas:
    - Correctness: Does it meet acceptance criteria?
    - Security: Any vulnerabilities?
    - Edge cases: What breaks it?
    - Quality: Clean, maintainable code?

    Return: Verification report with issues found
```

**Verifier Process**:
1. Read files fresh (no prior context)
2. Read acceptance criteria
3. Challenge implementation:
   - Does it actually meet criteria?
   - What's the worst that could happen?
   - What am I not seeing?
4. Generate verification report
5. Return to executor

**Verification Report**:
```yaml
verification_report:
  overall_assessment: "pass|fail|pass_with_concerns"

  issues_found:
    - severity: "critical|high|medium|low"
      category: "security|correctness|quality|performance"
      description: "What's wrong"
      location: "file:line"
      recommendation: "How to fix"

  positive_findings:
    - "What was done well"

  acceptance_criteria:
    - criterion: "Criterion text"
      met: true|false
      evidence: "How verified"
```

**If Issues Found**: Fix and re-verify

**Checkpoint**: Write verification report, forget details again.

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
  enforced: "Yes - when spawning quality-verifier"
  why: "Independent verification requires fresh eyes"
  mechanism: "Task tool spawns separate subagent"
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

This skill is invoked by workflow:task-executor agent when loop type is "quality".

See `loop-orchestration.md` for how this integrates into the overall loop.
