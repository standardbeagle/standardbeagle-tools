# Unify Loop Types to Single RED/GREEN TDD Quality Loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the 4 loop types (quality/test/security/refactor) from both dartai and workflow plugins, replacing them with a single quality loop that always uses RED/GREEN TDD and dispatches concurrent specialized review agents.

**Architecture:** The `--loop` flag and loop type selection are removed. The quality loop's Phase 3 becomes a concurrent agent dispatch point where quality-verifier, test-strategist, and security-auditor agents run in parallel. Each agent returns PASS/FAIL/NEEDS_WORK. The executor fixes failures and re-dispatches only the failing agents.

**Tech Stack:** Claude Code plugin system (markdown skills/agents/commands), YAML frontmatter

---

## File Structure

### dartai plugin (`plugins/dartai/`)

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `.claude-plugin/plugin.json` | Remove 3 deleted skills, add test-strategist agent |
| Modify | `commands/start.md` | Remove `--loop` flag, type selection, per-type phase definitions |
| Modify | `commands/verify.md` | Remove type argument, single verification mode |
| Modify | `skills/adversarial-quality-loop.md` | Rewrite Phase 3 for concurrent agent dispatch |
| Modify | `agents/task-executor.md` | Remove loop type references from context and phases |
| Modify | `agents/quality-verifier.md` | Remove modes 2-4, focus on code quality only |
| Modify | `rules/task-executor/execution-flow.md` | Remove `Loop Type` from context |
| Modify | `rules/quality-verifier/verification-modes.md` | Remove modes 2-4, quality-only |
| Create | `agents/security-auditor.md` | OWASP-focused security review agent |
| Delete | `skills/adversarial-test-loop.md` | Absorbed by test-strategist agent |
| Delete | `skills/adversarial-security-loop.md` | Absorbed by security-auditor agent |
| Delete | `skills/adversarial-refactor-loop.md` | Absorbed by quality-verifier (behavior preservation) |

### workflow plugin (`plugins/workflow/`)

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `.claude-plugin/plugin.json` | Remove 3 deleted skills, add test-strategist agent |
| Modify | `commands/start-loop.md` | Remove `--loop` flag, type selection |
| Modify | `skills/adversarial-quality.md` | Rewrite for concurrent agent dispatch |
| Modify | `agents/task-executor.md` | Remove loop type references |
| Modify | `agents/quality-verifier.md` | Remove mode references |
| Modify | `rules/task-executor/execution-pattern.md` | Remove loop type branching |
| Modify | `rules/task-executor/context-hygiene.md` | Remove loop_type from task_input, remove skill selection branching |
| Modify | `commands/setup-workflow.md` | Remove "Which loop types to support?" reference |
| Modify | `README.md` | Remove "Multiple Loop Types" section, update examples |
| Create | `agents/test-strategist.md` | Test quality review agent |
| Delete | `skills/adversarial-test.md` | Absorbed by test-strategist agent |
| Delete | `skills/adversarial-security.md` | Absorbed by security-auditor agent |
| Delete | `skills/adversarial-refactor.md` | Absorbed by quality-verifier |

### Unchanged files (stay as-is)

- `skills/testing-strategy.md` (both plugins) - RED/GREEN reference document, not a loop
- `skills/adversarial-planning-loop.md` (dartai) - planning is not a loop type
- `rules/common/eagle-eyed-discipline.md` - shared quality rules
- `rules/common/autonomous-operation.md` - shared autonomy rules

---

### Task 1: Create security-auditor agent for dartai

**Files:**
- Create: `plugins/dartai/agents/security-auditor.md`
- Reference: `plugins/workflow/agents/security-auditor.md` (existing model)

- [ ] **Step 1: Create the agent file**

Based on workflow's `security-auditor.md`, adapted for dartai's conventions (uses `.dartai/rules/` instead of `.workflow/rules/`, includes LCI and slop-mcp tools):

```markdown
---
name: security-auditor
description: Independent security audit with OWASP focus
when-to-use: Use this agent for independent security verification of changed code
tools:
  - Read
  - Bash
  - Glob
  - Grep
  - mcp__plugin_lci_lci__search
  - mcp__plugin_lci_lci__get_context
color: red
---

# Security Auditor Agent

Provide independent security audit with OWASP Top 10 focus.

## Project-Specific Rules

**CRITICAL**: Before auditing, check for project-specific rule files:

1. **`${CLAUDE_PLUGIN_ROOT}/rules/security-auditor/owasp-audit.md`** - OWASP audit rules

Projects may override any rule by creating `.dartai/rules/*.md` files.

Rule override precedence (highest first):
1. `.dartai/rules/security-auditor/*.md` - Project-specific security-auditor rules
2. `${CLAUDE_PLUGIN_ROOT}/rules/security-auditor/*.md` - Plugin default security-auditor rules

**On startup**: Read all applicable rule files and merge them with project rules taking precedence.

## Role

You are a SECURITY AUDITOR with fresh context.

**CRITICAL**: You know NOTHING about how the code was written.

Your job: Find security vulnerabilities before attackers do.

## Mindset

**Attacker Mindset**: "How would I exploit this?"

You are a penetration tester, not a quality reviewer.

## Process

### 1. Threat Model

Map the attack surface:
- Entry points (APIs, forms, uploads)
- Data flows (input → process → storage → output)
- Trust boundaries
- Sensitive data
- External dependencies

### 2. OWASP Top 10 Audit

Focus on critical vulnerabilities:

**A01: Broken Access Control**
- Horizontal privilege escalation?
- Vertical privilege escalation?
- Direct object reference attacks?
- Missing authorization checks?

**A02: Cryptographic Failures**
- Sensitive data encrypted at rest?
- TLS for data in transit?
- Strong algorithms?
- Proper key management?

**A03: Injection**
- SQL injection possible?
- NoSQL injection?
- Command injection?
- XSS (stored/reflected/DOM)?
- Template injection?

**A04: Insecure Design**
- Threat modeling done?
- Security patterns used?
- Defense in depth?
- Secure by default?

**A05: Security Misconfiguration**
- Default credentials?
- Unnecessary features enabled?
- Error messages leak info?
- Security headers present?

**A06: Vulnerable Components**
- Dependencies up to date?
- Known vulnerabilities (npm audit)?
- Supply chain security?

**A07: Identification and Authentication Failures**
- Brute force protection?
- Credential storage (bcrypt/argon2)?
- Session management secure?

**A08: Software and Data Integrity Failures**
- CI/CD pipeline secure?
- Unsigned/unverified updates?
- Deserialization attacks?

**A09: Security Logging and Monitoring Failures**
- Security events logged?
- Sensitive data in logs?

**A10: Server-Side Request Forgery**
- URL validation?
- SSRF prevention?

### 3. Attack Vector Testing

Generate and test specific attacks:

```yaml
attack_scenarios:
  injection:
    - input: "' OR '1'='1"
      target: "Login form"
      expected: "Rejected"
    - input: "<script>alert('XSS')</script>"
      target: "User profile"
      expected: "Sanitized"

  auth_bypass:
    - method: "Direct URL access"
      target: "/admin"
      expected: "401 Unauthorized"

  data_exposure:
    - method: "Error message"
      trigger: "Invalid input"
      expected: "Generic error, no stack trace"
```

### 4. Eagle-Eyed Security Violations (IMMEDIATE REJECTION)

```yaml
security_marker_violations:
  todo_security:
    patterns:
      - "// TODO: add input validation"
      - "# TODO: sanitize output"
      - "// FIXME: rate limiting needed"
      - "// TODO: add authentication"
    verdict: "REJECT IMMEDIATELY - security TODOs are vulnerabilities"

  disabled_security:
    patterns:
      - "// SECURITY: disabled for testing"
      - "if (DEBUG) skip_auth()"
      - "verify: false  // temporary"
      - "# nosec  // will fix later"
    verdict: "REJECT IMMEDIATELY - no disabled security"

  placeholder_security:
    patterns:
      - "password = 'changeme'"
      - "secret_key = 'development'"
      - "api_key = 'xxx'"
    verdict: "REJECT IMMEDIATELY - no placeholder secrets"
```

### 5. Generate Security Report

```yaml
security_report:
  summary:
    verdict: "PASS|FAIL|NEEDS_WORK"
    critical_count: 0
    high_count: 0
    medium_count: 0
    low_count: 0

  findings:
    - id: "SEC-001"
      severity: "critical|high|medium|low"
      owasp: "A03 - Injection"
      location: "file:line"
      description: "What's wrong"
      remediation: "How to fix"

  positive_findings:
    - "What's done well"
```

### 6. Critical Finding Protocol

If critical vulnerability found:
```yaml
critical_protocol:
  immediate:
    - "Document finding in detail"
    - "Return with STOP recommendation"
    - "Mark verdict as FAIL"
  reason: "Critical security vulnerabilities block deployment"
```

## Context Rules

**Fresh Perspective**: No knowledge of implementation decisions.
**Attacker Mindset**: Assume attacker mindset throughout.
**Return**: Security report with verdict and all findings.

## Success Criteria

Audit complete when:
- All OWASP categories checked
- Attack vectors tested
- Findings documented with evidence
- Remediation guidance provided
```

- [ ] **Step 2: Verify file created correctly**

Run: `head -5 plugins/dartai/agents/security-auditor.md`
Expected: frontmatter with `name: security-auditor`

- [ ] **Step 3: Commit**

```bash
git add plugins/dartai/agents/security-auditor.md
git commit -m "feat(dartai): add security-auditor agent for concurrent review"
```

---

### Task 2: Create test-strategist agent for workflow

**Files:**
- Create: `plugins/workflow/agents/test-strategist.md`
- Reference: `plugins/dartai/agents/test-strategist.md` (existing model)

- [ ] **Step 1: Create the agent file**

Based on dartai's `test-strategist.md`, adapted for workflow's conventions (uses `.workflow/rules/` instead of `.dartai/rules/`, no LCI/slop tools):

```markdown
---
name: test-strategist
description: Analyzes code changes and ensures test coverage at the right level - e2e for user journeys, integration for component interactions, unit for complex logic
when-to-use: Use this agent after implementation to verify test coverage is complete and tests are at the correct tier
tools:
  - Read
  - Bash
  - Glob
  - Grep
color: green
---

# Test Strategist Agent

Analyze code changes, determine which tests are missing, and write them at the correct tier.

## Project-Specific Rules

**CRITICAL**: Before testing, check for project-specific rule files:

1. **`${CLAUDE_PLUGIN_ROOT}/rules/test-strategist/test-config.md`** - Test configuration rules

Projects may override any rule by creating `.workflow/rules/*.md` files.

Rule override precedence (highest first):
1. `.workflow/rules/test-strategist/*.md` - Project-specific test rules
2. `${CLAUDE_PLUGIN_ROOT}/rules/test-strategist/*.md` - Plugin default test rules

**On startup**: Read all applicable rule files and merge them with project rules taking precedence.

## Process

### Step 1: Analyze Changes

Identify what changed and what test coverage exists:

1. Run `git diff --name-only HEAD~1` to find changed files
2. For each changed file, find existing test files
3. Classify each change:
   - **User-facing behavior change** → needs e2e test
   - **Component interaction change** → needs integration test
   - **Complex logic change** → needs unit test
   - **Configuration/docs only** → no test needed

### Step 2: Assess Existing Coverage

For each changed file:

1. Find related test files (by naming convention or imports)
2. Run existing tests to establish baseline
3. Identify gaps:
   - Missing happy path coverage
   - Missing error/edge case coverage
   - Tests at wrong tier
   - Complementary test pairs missing

### Step 3: Verify RED/GREEN Compliance

Check that tests follow RED/GREEN TDD discipline:

```yaml
red_green_checks:
  every_new_test:
    - "Was it seen RED before GREEN?"
    - "Does it fail when the feature is removed?"
    - "Does it test behavior, not implementation?"

  test_quality:
    - "No empty assertions (assertTrue(true))"
    - "No weak assertions (toBeDefined)"
    - "Specific expected values in assertions"
    - "No skipped or disabled tests"

  test_isolation:
    - "Tests pass in any order"
    - "No shared mutable state"
    - "Proper setup/teardown"

  violations:
    - "Writing implementation before a RED test exists"
    - "A test that was never seen RED"
    - "Writing multiple tests before going GREEN on the first"
    - "Refactoring while a test is RED"
```

### Step 4: Check Test Distribution

Verify healthy test distribution:

```yaml
distribution_targets:
  happy_path: "50-60%"
  edge_cases: "25-30%"
  adversarial: "10-15%"
  regression: "as needed"
```

### Step 5: Report

Generate test coverage report:

```yaml
test_report:
  verdict: "PASS|FAIL|NEEDS_WORK"
  changes_analyzed: 5
  tests_added:
    e2e: 1
    integration: 4
    unit: 8
  gaps_remaining: []
  red_green_violations: []
  distribution:
    happy_path: "55%"
    edge_cases: "30%"
    adversarial: "15%"
  all_tests_pass: true
```

## Anti-Patterns to Flag

- Tests that mock internal code instead of testing through it
- All tests at one tier (pyramid should be wide at bottom)
- Tests that assert on implementation details
- Tests that pass whether the feature works or not
- Missing complementary tests (only positive, no negative)
- Tests never seen RED

## Success Criteria

Verification complete when:
- All changed code has appropriate test coverage
- Tests are at the correct tier
- RED/GREEN compliance verified
- No skipped or disabled tests
- Test distribution is healthy
```

- [ ] **Step 2: Verify file created correctly**

Run: `head -5 plugins/workflow/agents/test-strategist.md`
Expected: frontmatter with `name: test-strategist`

- [ ] **Step 3: Commit**

```bash
git add plugins/workflow/agents/test-strategist.md
git commit -m "feat(workflow): add test-strategist agent for concurrent review"
```

---

### Task 3: Update dartai plugin.json

**Files:**
- Modify: `plugins/dartai/.claude-plugin/plugin.json`

- [ ] **Step 1: Remove 3 deleted skills, add 2 agents**

In the `skills` array, remove these 3 entries:
```
"./skills/adversarial-test-loop.md",
"./skills/adversarial-security-loop.md",
"./skills/adversarial-refactor-loop.md",
```

In the `agents` array, add these 2 entries:
```
"./agents/test-strategist.md",
"./agents/security-auditor.md"
```

Final `skills` array should contain:
```json
"skills": [
    "./skills/dart-query-reference.md",
    "./skills/task-filtering.md",
    "./skills/batch-operations.md",
    "./skills/task-relationships.md",
    "./skills/workspace-docs.md",
    "./skills/task-execution.md",
    "./skills/code-quality.md",
    "./skills/doc-templates.md",
    "./skills/simple-planning.md",
    "./skills/adversarial-planning-loop.md",
    "./skills/adversarial-quality-loop.md",
    "./skills/hook-doctor.md"
]
```

Final `agents` array should contain:
```json
"agents": [
    "./agents/task-executor.md",
    "./agents/doc-updater.md",
    "./agents/quality-verifier.md",
    "./agents/test-strategist.md",
    "./agents/security-auditor.md"
]
```

- [ ] **Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('plugins/dartai/.claude-plugin/plugin.json'))"`
Expected: No error

- [ ] **Step 3: Commit**

```bash
git add plugins/dartai/.claude-plugin/plugin.json
git commit -m "feat(dartai): update plugin.json for unified quality loop"
```

---

### Task 4: Update workflow plugin.json

**Files:**
- Modify: `plugins/workflow/.claude-plugin/plugin.json`

- [ ] **Step 1: Remove 3 deleted skills, add test-strategist agent**

In the `skills` array, remove:
```
"./skills/adversarial-security.md",
"./skills/adversarial-refactor.md",
"./skills/adversarial-test.md",
```

In the `agents` array, add:
```
"./agents/test-strategist.md"
```

Final `skills` array:
```json
"skills": [
    "./skills/context-hygiene.md",
    "./skills/adversarial-quality.md",
    "./skills/loop-orchestration.md",
    "./skills/memory-management.md"
]
```

Final `agents` array:
```json
"agents": [
    "./agents/task-executor.md",
    "./agents/quality-verifier.md",
    "./agents/security-auditor.md",
    "./agents/test-strategist.md"
]
```

- [ ] **Step 2: Also update keywords** - remove `"security-audit"` and `"refactoring"` from keywords since they're no longer separate loop types. They're still capabilities but not standalone modes.

Actually, keep them - they describe capabilities, not loop types.

- [ ] **Step 3: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('plugins/workflow/.claude-plugin/plugin.json'))"`
Expected: No error

- [ ] **Step 4: Commit**

```bash
git add plugins/workflow/.claude-plugin/plugin.json
git commit -m "feat(workflow): update plugin.json for unified quality loop"
```

---

### Task 5: Rewrite dartai adversarial-quality-loop.md Phase 3

This is the core change. The quality loop's Phase 3 changes from "Adversarial Verification" (self-review) to "Concurrent Adversarial Review" (dispatch 3 agents in parallel).

**Files:**
- Modify: `plugins/dartai/skills/adversarial-quality-loop.md`

- [ ] **Step 1: Replace Phase 3 section**

Find the section starting with `## Phase 3: Adversarial Verification` and replace it through to `Plan Adjustment Point 3` with the concurrent agent dispatch pattern:

```markdown
## Phase 3: Concurrent Adversarial Review

### Task: Dispatch Review Agents

Spawn three review agents concurrently. Each runs with fresh context and returns a structured verdict.

**Dispatch all three in parallel using the Task tool:**

```yaml
concurrent_agents:
  quality_verifier:
    subagent_type: "dartai:quality-verifier"
    description: "Review code quality for [task-title]"
    prompt: |
      Verify implementation quality for task [TASK_ID].

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      Focus on: scope creep, over-engineering, incomplete markers,
      cop-outs, codebase integration, behavior preservation.

      Return structured verdict: PASS, FAIL, or NEEDS_WORK with issues.

  test_strategist:
    subagent_type: "dartai:test-strategist"
    description: "Review test quality for [task-title]"
    prompt: |
      Verify test coverage and quality for task [TASK_ID].

      ## Changed Files
      [list of files changed]

      Focus on: coverage gaps, assertion quality, RED/GREEN compliance,
      test distribution, mutation testing, test isolation.

      Return structured verdict: PASS, FAIL, or NEEDS_WORK with issues.

  security_auditor:
    subagent_type: "dartai:security-auditor"
    description: "Security review for [task-title]"
    prompt: |
      Audit security of changes for task [TASK_ID].

      ## Changed Files
      [list of files changed]

      Focus on: OWASP Top 10, injection vectors, auth/access control,
      data protection, security configuration, hardcoded secrets.

      Return structured verdict: PASS, FAIL, or NEEDS_WORK with issues.
```

**Handling Results:**

```yaml
result_handling:
  all_pass:
    action: "Proceed to Phase 4"
    note: "All three agents approved"

  any_needs_work:
    action: "Fix issues, re-dispatch ONLY the failing agents"
    max_retries: 2
    note: "Don't re-run agents that already passed"

  any_fail:
    action: "Fix issues, re-dispatch ONLY the failing agents"
    max_retries: 2
    escalate_after: "If still failing after 2 retries, RETURN with failure"

  critical_security:
    action: "STOP immediately"
    note: "Critical security finding blocks all work"
```

**Verification Criteria:**
```yaml
pass_if:
  - quality_verifier_verdict: "PASS"
  - test_strategist_verdict: "PASS"
  - security_auditor_verdict: "PASS"
fail_if:
  - any_verdict_fail_after_retries: true
  - critical_security_finding: true
```

### Plan Adjustment Point 3 (Automatic - Do Not Stop)
```yaml
checkpoint:
  validate:
    - all_agents_returned: true
    - no_critical_security: true
    - issues_addressed: true

  auto_adjust:
    quality_issues: "Fix inline and re-dispatch quality-verifier, CONTINUE"
    test_gaps: "Add tests and re-dispatch test-strategist, CONTINUE"
    security_findings: "Fix and re-dispatch security-auditor, CONTINUE"
    critical_security: "STOP - create fix task"

  stop_only_if:
    critical_blocker: "Critical security vulnerability or all agents failing after retries"

  then: "Proceed immediately to Phase 4"
```
```

- [ ] **Step 2: Verify the file is syntactically coherent**

Read the modified file and verify Phase 2 flows into Phase 3 flows into Phase 4 without gaps.

- [ ] **Step 3: Commit**

```bash
git add plugins/dartai/skills/adversarial-quality-loop.md
git commit -m "feat(dartai): rewrite Phase 3 for concurrent agent dispatch"
```

---

### Task 6: Rewrite workflow adversarial-quality.md for concurrent agents

**Files:**
- Modify: `plugins/workflow/skills/adversarial-quality.md`

- [ ] **Step 1: Read current file**

Read `plugins/workflow/skills/adversarial-quality.md` to understand its current structure.

- [ ] **Step 2: Apply same Phase 3 concurrent dispatch pattern**

Use `workflow:quality-verifier`, `workflow:test-strategist`, `workflow:security-auditor` as the agent types (instead of `dartai:` prefix).

The structure mirrors Task 5 but uses workflow agent names and `.workflow/rules/` paths.

- [ ] **Step 3: Commit**

```bash
git add plugins/workflow/skills/adversarial-quality.md
git commit -m "feat(workflow): rewrite quality skill for concurrent agent dispatch"
```

---

### Task 7: Simplify dartai start.md

**Files:**
- Modify: `plugins/dartai/commands/start.md`

- [ ] **Step 1: Update frontmatter**

Change argument-hint from:
```
argument-hint: "[dartboard-name] [--loop=quality|test|security|refactor]"
```
to:
```
argument-hint: "[dartboard-name]"
```

- [ ] **Step 2: Remove Section 2 (Select Loop Type)**

Delete the entire "### 2. Select Loop Type" section (lines 76-82 approximately) including the Available loops list.

- [ ] **Step 3: Update loop task creation (Section 4)**

In the loop task title template, change:
```
title: "🔄 Loop: [loop-type] on [dartboard-name]"
```
to:
```
title: "🔄 Loop: [dartboard-name]"
```

In the description, remove:
```
**Loop Type:** [quality|test|security|refactor]
```

In the tags, change:
```
tags: ["loop-session", "loop-active", "loop-type:[type]", "runner:[runner_instance_id]"]
```
to:
```
tags: ["loop-session", "loop-active", "runner:[runner_instance_id]"]
```

- [ ] **Step 4: Simplify subagent prompt (Section 5.3)**

In the subagent spawn section, remove `Loop Type: [quality|test|security|refactor]` from the loop context passed to the subagent.

Remove the instruction `1. Use the [LOOP_TYPE] adversarial loop pattern` — replace with:
```
1. Use the adversarial quality loop pattern with RED/GREEN TDD
```

- [ ] **Step 5: Remove per-type phase definitions (Section 5.5)**

Delete the entire block showing separate phase definitions for Quality Loop, Test Loop, Security Loop, and Refactor Loop. Replace with a single reference:

```markdown
#### 5.5 Execute Quality Loop (done by subagent)

The task-executor subagent follows the adversarial-quality-loop skill:
```yaml
phases:
  0_git_hygiene_tdd:
    - Pull latest, rebase, verify green
    - Set up RED/GREEN TDD approach

  1_implementation_review:
    - Understand task scope and acceptance criteria
    - Identify files (max 5)

  2_tdd_implementation:
    - Write failing test (RED)
    - Implement minimum code (GREEN)
    - Refactor under GREEN
    - Repeat for each behavior

  3_concurrent_review:
    - Dispatch quality-verifier, test-strategist, security-auditor
    - All three run in parallel with fresh context
    - Fix issues, re-dispatch failing agents only

  4_quality_gates:
    - Linting, testing, coverage checks

  5_final_validation:
    - Verify all acceptance criteria met
    - Confirm no scope creep
```
```

- [ ] **Step 6: Update usage examples**

Change:
```bash
# Start security audit loop
/dartai:start "My Project" --loop=security

# Start test coverage loop
/dartai:start --loop=test
```
to:
```bash
# Start quality loop (only mode)
/dartai:start

# Start on specific dartboard
/dartai:start Personal/standardbeagle-tools
```

- [ ] **Step 7: Commit**

```bash
git add plugins/dartai/commands/start.md
git commit -m "feat(dartai): remove --loop flag, single quality loop"
```

---

### Task 8: Simplify workflow start-loop.md

**Files:**
- Modify: `plugins/workflow/commands/start-loop.md`

- [ ] **Step 1: Read current file**

Read `plugins/workflow/commands/start-loop.md` to understand structure.

- [ ] **Step 2: Apply same simplifications as Task 7**

- Remove `[--loop=quality|security|refactor|test]` from argument-hint
- Remove loop type selection section
- Remove per-type phase definitions
- Replace with single quality loop reference using concurrent agents
- Update usage examples

- [ ] **Step 3: Commit**

```bash
git add plugins/workflow/commands/start-loop.md
git commit -m "feat(workflow): remove --loop flag, single quality loop"
```

---

### Task 9: Simplify dartai verify.md

**Files:**
- Modify: `plugins/dartai/commands/verify.md`

- [ ] **Step 1: Update frontmatter**

Change:
```yaml
description: Run adversarial verification loop on implementation, tests, security, or refactoring
argument-hint: "[quality|test|security|refactor] [target]"
```
to:
```yaml
description: Run adversarial verification on a target directory or file
argument-hint: "[target]"
```

- [ ] **Step 2: Remove verification types section**

Delete the "## Verification Types" section listing Quality/Test/Security/Refactor separately.

Replace with:
```markdown
## What It Does

Runs all three review agents concurrently on the target:

1. **Quality Verifier** - Code quality, scope, completeness, codebase integration
2. **Test Strategist** - Coverage, assertions, RED/GREEN compliance, distribution
3. **Security Auditor** - OWASP Top 10, injection, auth, data protection

Each returns PASS/FAIL/NEEDS_WORK with detailed findings.
```

- [ ] **Step 3: Remove per-type phase structures**

Delete the four separate phase listings (Quality Loop Phases, Test Loop Phases, Security Loop Phases, Refactor Loop Phases).

Replace with:
```markdown
### 3. Execute Concurrent Review

Spawn all three agents in parallel using the Task tool:

1. `dartai:quality-verifier` - Implementation quality
2. `dartai:test-strategist` - Test coverage and quality
3. `dartai:security-auditor` - Security audit

Wait for all three to complete, then compile results.
```

- [ ] **Step 4: Update usage examples**

Change:
```
/dartai:verify quality ./src/module
/dartai:verify test ./src/module.test.ts
/dartai:verify security ./src/auth/
/dartai:verify refactor ./src/utils.ts
```
to:
```
/dartai:verify ./src/module
/dartai:verify ./src/auth/
/dartai:verify .
```

- [ ] **Step 5: Update output format**

Remove `Type: [quality|test|security|refactor]` from the output template. Replace with:
```
Agent Results:
- Quality Verifier: [PASS|FAIL|NEEDS_WORK] - [summary]
- Test Strategist:  [PASS|FAIL|NEEDS_WORK] - [summary]
- Security Auditor: [PASS|FAIL|NEEDS_WORK] - [summary]
```

- [ ] **Step 6: Commit**

```bash
git add plugins/dartai/commands/verify.md
git commit -m "feat(dartai): simplify verify command, remove type argument"
```

---

### Task 10: Update dartai task-executor agent

**Files:**
- Modify: `plugins/dartai/agents/task-executor.md`

- [ ] **Step 1: Remove loop type from Loop Context section**

Change:
```markdown
## Loop Context (Required)

You will receive loop context in your prompt:
- **Loop Task ID**: Parent task tracking the loop session
- **Loop Type**: quality|test|security|refactor
- **Iteration**: Current iteration number
```
to:
```markdown
## Loop Context (Required)

You will receive loop context in your prompt:
- **Loop Task ID**: Parent task tracking the loop session
- **Iteration**: Current iteration number
```

- [ ] **Step 2: Commit**

```bash
git add plugins/dartai/agents/task-executor.md
git commit -m "refactor(dartai): remove loop type from task-executor context"
```

---

### Task 11: Update dartai quality-verifier agent — remove modes

**Files:**
- Modify: `plugins/dartai/agents/quality-verifier.md`

- [ ] **Step 1: Remove whenToUse examples for security and refactoring**

Remove the security and refactoring examples from the whenToUse block. Keep only implementation and test quality examples.

- [ ] **Step 2: Remove Modes 2, 3, 4**

Delete the sections:
- `### Mode 2: Test Verification` (this is now the test-strategist agent's job)
- `### Mode 3: Security Verification` (this is now the security-auditor agent's job)
- `### Mode 4: Refactoring Verification` (behavior preservation checks stay as part of Mode 1's edge case verification)

Keep `### Mode 1: Implementation Verification` but rename it to just `## Verification Process` since there's only one mode now.

- [ ] **Step 3: Add refactoring behavior-preservation to the main verification checklist**

In the implementation verification checklist, add:
```yaml
  behavior_preservation:  # When task involves refactoring
    - check: "Same outputs for all inputs"
    - check: "Same errors for invalid inputs"
    - check: "Same side effects"
    - check: "No performance regression (< 10% slower)"
```

- [ ] **Step 4: Update verification report format**

Change `mode: "implementation|test|security|refactoring"` to just `mode: "quality"`.

- [ ] **Step 5: Commit**

```bash
git add plugins/dartai/agents/quality-verifier.md
git commit -m "refactor(dartai): remove modes from quality-verifier, single focus"
```

---

### Task 12: Update dartai verification-modes.md rules

**Files:**
- Modify: `plugins/dartai/rules/quality-verifier/verification-modes.md`

- [ ] **Step 1: Remove Modes 2, 3, 4**

Delete:
- `## Mode 2: Test Verification`
- `## Mode 3: Security Verification`
- `## Mode 4: Refactoring Verification`

Keep Mode 1 content but rename the file heading to reflect single-mode focus.

- [ ] **Step 2: Add behavior preservation section**

Add the behavior-preservation checklist to the main verification section (same as Task 11 step 3).

- [ ] **Step 3: Update report format**

Remove mode selection from report format.

- [ ] **Step 4: Commit**

```bash
git add plugins/dartai/rules/quality-verifier/verification-modes.md
git commit -m "refactor(dartai): simplify verification-modes to single quality mode"
```

---

### Task 13: Update dartai execution-flow.md rules

**Files:**
- Modify: `plugins/dartai/rules/task-executor/execution-flow.md`

- [ ] **Step 1: Remove loop type from context**

Change:
```yaml
loop_context:
  receive_in_prompt:
    - "Loop Task ID: Parent task tracking the loop session"
    - "Loop Type: quality|test|security|refactor"
    - "Iteration: Current iteration number"
```
to:
```yaml
loop_context:
  receive_in_prompt:
    - "Loop Task ID: Parent task tracking the loop session"
    - "Iteration: Current iteration number"
```

- [ ] **Step 2: Commit**

```bash
git add plugins/dartai/rules/task-executor/execution-flow.md
git commit -m "refactor(dartai): remove loop type from execution-flow rules"
```

---

### Task 14: Update workflow agents and rules

**Files:**
- Modify: `plugins/workflow/agents/task-executor.md`
- Modify: `plugins/workflow/agents/quality-verifier.md`
- Modify: `plugins/workflow/rules/task-executor/execution-pattern.md`
- Modify: `plugins/workflow/rules/task-executor/context-hygiene.md`
- Modify: `plugins/workflow/rules/quality-verifier/verification-categories.md` (if it has modes)

- [ ] **Step 1: Read workflow task-executor agent**

Read `plugins/workflow/agents/task-executor.md` and remove loop type references (same pattern as Task 10).

- [ ] **Step 2: Read workflow quality-verifier agent**

Read `plugins/workflow/agents/quality-verifier.md` and remove verification modes if present (same pattern as Task 11).

- [ ] **Step 3: Read workflow execution-pattern rules**

Read `plugins/workflow/rules/task-executor/execution-pattern.md` and remove loop type branching:
- Remove `loop_type: "quality|security|refactor|test"` from task_input
- Remove the "Select Adversarial Loop Skill" section that branches on loop_type

- [ ] **Step 4: Update workflow context-hygiene rules**

Read `plugins/workflow/rules/task-executor/context-hygiene.md` and:

Remove `loop_type` from `task_input`:
```yaml
# BEFORE
task_input:
  task_id: "From prompt"
  loop_id: "From prompt"
  loop_type: "quality|security|refactor|test"

# AFTER
task_input:
  task_id: "From prompt"
  loop_id: "From prompt"
```

Delete the "Select Adversarial Loop Skill" section entirely (lines 71-77):
```
## Select Adversarial Loop Skill

Based on `loop_type` parameter:
- **quality** → Use `adversarial-quality` skill
- **security** → Use `adversarial-security` skill
- **refactor** → Use `adversarial-refactor` skill
- **test** → Use `adversarial-test` skill
```

Replace with:
```markdown
## Adversarial Loop Skill

Use the `adversarial-quality` skill which dispatches concurrent review agents
(quality-verifier, test-strategist, security-auditor) at Phase 3.
```

- [ ] **Step 5: Read and update verification-categories if needed**

Read `plugins/workflow/rules/quality-verifier/verification-categories.md` and remove category-based modes if present.

- [ ] **Step 6: Commit**

```bash
git add plugins/workflow/agents/ plugins/workflow/rules/
git commit -m "refactor(workflow): remove loop type references from agents and rules"
```

---

### Task 15: Update workflow setup-workflow.md and README.md

**Files:**
- Modify: `plugins/workflow/commands/setup-workflow.md`
- Modify: `plugins/workflow/README.md`

- [ ] **Step 1: Read and update setup-workflow.md**

Read `plugins/workflow/commands/setup-workflow.md`. Remove any references to "loop types" or loop type customization. The setup command configures role rules, not loop types.

- [ ] **Step 2: Update README.md - remove Multiple Loop Types section**

In `plugins/workflow/README.md`, make these changes:

In the Overview section (line 10), change:
```
- **Multiple loop types** - Quality, Security, Refactor, Test
```
to:
```
- **RED/GREEN TDD** - Test-first development with concurrent review agents
```

Delete the entire "### Multiple Loop Types" section (lines 53-58) and the "## Loop Types" section (lines 171-230) which lists Quality Loop, Security Loop, Refactor Loop, and Test Loop separately.

Replace with:
```markdown
### Concurrent Review Agents

At Phase 3 of each task, three review agents run in parallel:
- **Quality Verifier** - Code quality, scope, completeness
- **Test Strategist** - Coverage, RED/GREEN compliance, distribution
- **Security Auditor** - OWASP Top 10, injection, auth, data protection
```

- [ ] **Step 3: Update README.md - simplify start-loop examples**

Change:
```bash
# Or with specific loop type
/workflow:start-loop --loop=security

# Or with custom task file
/workflow:start-loop my-tasks.md --loop=quality
```
to:
```bash
# Or with custom task file
/workflow:start-loop my-tasks.md
```

Update the Arguments section:
Remove `- `--loop=type` - Loop type: quality|security|refactor|test (default: quality)`

Update the Example:
```bash
/workflow:start-loop my-tasks.md
```

- [ ] **Step 4: Update README.md - state transfer**

In the State Transfer section, remove `"loop_type": "quality"` from the JSON example.

- [ ] **Step 5: Update README.md - architecture diagram**

Update the architecture diagram to show concurrent agents:
```
Main Loop (Primary Agent)
├── Reads: .workflow/tasks.md
├── Manages: .workflow/loop-state.json
└── Spawns: workflow:task-executor (fresh subagent)
    ├── Executes: adversarial-quality skill with RED/GREEN TDD
    ├── Spawns concurrent review agents:
    │   ├── workflow:quality-verifier (fresh)
    │   ├── workflow:test-strategist (fresh)
    │   └── workflow:security-auditor (fresh)
    ├── Updates: loop state file
    └── Terminates: SubagentStop hook fires
        └── Main loop continues to next task
```

- [ ] **Step 6: Commit**

```bash
git add plugins/workflow/commands/setup-workflow.md plugins/workflow/README.md
git commit -m "docs(workflow): update README and setup for unified quality loop"
```

---

### Task 16: Delete obsolete skill files

**Files:**
- Delete: `plugins/dartai/skills/adversarial-test-loop.md`
- Delete: `plugins/dartai/skills/adversarial-security-loop.md`
- Delete: `plugins/dartai/skills/adversarial-refactor-loop.md`
- Delete: `plugins/workflow/skills/adversarial-test.md`
- Delete: `plugins/workflow/skills/adversarial-security.md`
- Delete: `plugins/workflow/skills/adversarial-refactor.md`

- [ ] **Step 1: Delete dartai files**

```bash
rm plugins/dartai/skills/adversarial-test-loop.md
rm plugins/dartai/skills/adversarial-security-loop.md
rm plugins/dartai/skills/adversarial-refactor-loop.md
```

- [ ] **Step 2: Delete workflow files**

```bash
rm plugins/workflow/skills/adversarial-test.md
rm plugins/workflow/skills/adversarial-security.md
rm plugins/workflow/skills/adversarial-refactor.md
```

- [ ] **Step 3: Verify no broken references**

```bash
# Check for any remaining references to deleted files
grep -rn "adversarial-test-loop\|adversarial-security-loop\|adversarial-refactor-loop" plugins/dartai/ || echo "dartai clean"
grep -rn "adversarial-test\|adversarial-security\|adversarial-refactor" plugins/workflow/ || echo "workflow clean"
```

Expected: "dartai clean" and "workflow clean" (or only references in testing-strategy.md which is fine since it references the concept, not the file)

- [ ] **Step 4: Commit**

```bash
git add -A plugins/dartai/skills/ plugins/workflow/skills/
git commit -m "feat(dartai,workflow): remove obsolete loop-type skill files"
```

---

### Task 17: Final verification

- [ ] **Step 1: Verify plugin.json files are valid**

```bash
python3 -c "import json; json.load(open('plugins/dartai/.claude-plugin/plugin.json')); print('dartai OK')"
python3 -c "import json; json.load(open('plugins/workflow/.claude-plugin/plugin.json')); print('workflow OK')"
```

- [ ] **Step 2: Verify all referenced files exist**

```bash
# Check dartai plugin references
python3 -c "
import json, os
p = json.load(open('plugins/dartai/.claude-plugin/plugin.json'))
base = 'plugins/dartai'
for key in ['commands', 'skills', 'agents']:
    for f in p.get(key, []):
        path = os.path.join(base, f.lstrip('./'))
        if not os.path.exists(path):
            print(f'MISSING: {path}')
print('dartai refs OK')
"
```

```bash
# Check workflow plugin references
python3 -c "
import json, os
p = json.load(open('plugins/workflow/.claude-plugin/plugin.json'))
base = 'plugins/workflow'
for key in ['commands', 'skills', 'agents']:
    for f in p.get(key, []):
        path = os.path.join(base, f.lstrip('./'))
        if not os.path.exists(path):
            print(f'MISSING: {path}')
print('workflow refs OK')
"
```

- [ ] **Step 3: Verify no remaining loop type references in commands and rules**

```bash
grep -rn "loop=quality\|loop=test\|loop=security\|loop=refactor\|loop_type\|Loop Type" plugins/dartai/commands/*.md plugins/dartai/rules/ plugins/dartai/agents/ plugins/workflow/commands/*.md plugins/workflow/rules/ plugins/workflow/agents/ plugins/workflow/README.md || echo "All clean"
```

- [ ] **Step 4: Verify no remaining --loop flag in argument-hints**

```bash
grep -rn "\-\-loop" plugins/dartai/commands/*.md plugins/workflow/commands/*.md plugins/workflow/README.md || echo "All clean"
```

- [ ] **Step 5: Verify no references to deleted skill names**

```bash
grep -rn "adversarial-test-loop\|adversarial-security-loop\|adversarial-refactor-loop" plugins/dartai/ || echo "dartai clean"
grep -rn "adversarial-test\b\|adversarial-security\b\|adversarial-refactor\b" plugins/workflow/ | grep -v "adversarial-quality" || echo "workflow clean"
```

Expected: "All clean" for all checks.
