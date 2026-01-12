---
name: verify
description: Run adversarial verification loop on implementation, tests, security, or refactoring
argument-hint: "[quality|test|security|refactor] [target]"
---

# Adversarial Verification Command

Run an adversarial verification loop to challenge and validate code quality.

## Usage

```
/dartai:verify quality ./src/module
/dartai:verify test ./src/module.test.ts
/dartai:verify security ./src/auth/
/dartai:verify refactor ./src/utils.ts
```

## Verification Types

### Quality Verification
Runs the adversarial-quality-loop skill to verify implementation quality:
- Scope analysis with plan adjustment
- Implementation review with positive/negative criteria
- Self-adversarial review
- External adversarial verification
- Quality gate verification

### Test Verification
Runs the adversarial-test-loop skill to verify test quality:
- Test planning with coverage analysis
- Happy path tests (50-60%)
- Edge case tests (25-30%)
- Adversarial tests (10-15%)
- Mutation testing and quality verification

### Security Verification
Runs the adversarial-security-loop skill to audit security:
- Threat modeling and attack surface mapping
- Injection attack testing (OWASP A03)
- Authentication/authorization testing (OWASP A01, A07)
- Data protection verification (OWASP A02, A04)
- Security configuration audit (OWASP A05)

### Refactor Verification
Runs the adversarial-refactor-loop skill to verify safe refactoring:
- Behavior baseline establishment
- Incremental refactoring with per-step verification
- Adversarial behavior comparison
- Semantic equivalence verification

## Process

### 1. Determine Verification Type

If type provided as argument, use it. Otherwise ask:
- What type of verification? (quality/test/security/refactor)

### 2. Identify Target

If target provided as argument, use it. Otherwise:
- For quality: Identify files from current task or ask
- For test: Identify test files or module under test
- For security: Identify security-relevant code paths
- For refactor: Identify code being refactored

### 3. Execute Appropriate Loop

Use the quality-verifier agent with the selected adversarial loop skill:

**Quality Loop Phases:**
1. Implementation Review → Plan Adjustment
2. Adversarial Implementation → Plan Adjustment
3. Adversarial Verification → Plan Adjustment
4. Quality Gate Verification → Plan Adjustment
5. Final Validation

**Test Loop Phases:**
1. Test Planning → Plan Adjustment
2. Happy Path Tests → Plan Adjustment
3. Edge Case Tests → Plan Adjustment
4. Adversarial Tests → Plan Adjustment
5. Test Quality Verification → Plan Adjustment
6. Regression Integration

**Security Loop Phases:**
1. Threat Modeling → Plan Adjustment
2. Injection Attacks → Plan Adjustment
3. Auth/Access Testing → Plan Adjustment
4. Data Protection → Plan Adjustment
5. Configuration Audit → Plan Adjustment
6. Security Report

**Refactor Loop Phases:**
1. Refactoring Analysis → Plan Adjustment
2. Pre-Refactoring Verification → Plan Adjustment
3. Incremental Refactoring → Plan Adjustment (per step)
4. Adversarial Verification → Plan Adjustment
5. Final Validation → Plan Adjustment
6. Post-Refactoring Report

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
Type: [quality|test|security|refactor]
Target: [file/directory]
Verdict: [PASS|FAIL|NEEDS_WORK]

Issues Found:
- Critical: X
- High: X
- Medium: X
- Low: X

Phase Results:
- Phase 1: [PASS|FAIL] - [summary]
- Phase 2: [PASS|FAIL] - [summary]
...

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
