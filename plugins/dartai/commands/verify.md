---
name: verify
description: Run adversarial verification on a target directory or file
argument-hint: "[target]"
---

# Adversarial Verification Command

Run an adversarial verification loop to challenge and validate code quality.

## Usage

```
/dartai:verify ./src/module
/dartai:verify ./src/auth/
/dartai:verify .
```

## What It Does

Runs review agents in a 2+1 pattern on the target:

**Parallel phase** (concurrent):
1. **Code Quality Reviewer** - Code quality, security, coherence, performance, testability, bloat, duplication, cleanup
2. **QA Reviewer** - Assertion quality, edge cases, TDD compliance, test distribution, test plans

**Sequential phase** (after parallel agents complete):
3. **Post-Task Reviewer** - Requirements coverage, documentation accuracy, user flows, lean docs

Each returns PASS/FAIL/NEEDS_WORK with detailed findings.

## Process

### 1. Identify Target

If target provided as argument, use it. Otherwise identify from current task context or ask.

### 3. Execute Concurrent Review

Spawn two agents in parallel using the Task tool, then run a third sequentially:

**Parallel:**
1. `dartai:code-quality-reviewer` - Implementation quality
2. `dartai:qa-reviewer` - Test coverage and quality

Wait for both to complete.

**Sequential:**
3. `dartai:post-task-reviewer` - Requirements coverage and documentation

Compile results from all three agents.

### 4. Plan Adjustment Protocol

At each plan adjustment point:
- Review discoveries from current phase
- Update remaining tasks based on findings
- Re-prioritize if blocking issues found
- Document adjustments for tracking

### 5. Report Results

Generate verification report with:
- Verdict: PASS/FAIL/NEEDS_WORK
- Issues found by severity
- Verification evidence
- Plan adjustments made
- Recommended next steps

## Context-Sized Task Rules

Each verification task follows these rules:

**Scoping:**
- Maximum 3-5 files per verification task
- One verification type per command invocation
- Clear pass/fail criteria for each phase

**Instructions Format:**
Every phase includes:
- **DO (Positive Instructions)**: Specific actions to take
- **DO NOT (Negative Instructions)**: Specific actions to avoid
- **Verification Criteria**: Clear pass/fail conditions

## Output

```
Adversarial Verification Report
================================
Target: [file/directory]
Verdict: [PASS|FAIL|NEEDS_WORK]

Issues Found:
- Critical: X
- High: X
- Medium: X
- Low: X

Agent Results:
- Code Quality Reviewer: [PASS|FAIL|NEEDS_WORK] - [summary]
- QA Reviewer:            [PASS|FAIL|NEEDS_WORK] - [summary]
- Post-Task Reviewer:     [PASS|FAIL|NEEDS_WORK] - [summary]

Plan Adjustments:
- [adjustment 1]
- [adjustment 2]

Recommended Actions:
1. [action]
2. [action]
```

## Integration with Dart

If running in context of a Dart task:
- Link verification results to task
- Add comment with verification summary
- Update task status based on outcome
- Create follow-up tasks for issues found
