---
name: start
description: Start the Ralph Wiggum adversarial cooperation loop on a dartboard with plan adjustment
argument-hint: "[dartboard-name] [--loop=quality|test|security|refactor]"
---

# Start Ralph Wiggum Adversarial Loop

Start the continuous task execution loop that processes tasks from a Dart dartboard using adversarial cooperation patterns with plan adjustment at each phase.

## Adversarial Cooperation Model

This loop uses adversarial cooperation where:
- **Implementer role**: Executes tasks following positive/negative instructions
- **Verifier role**: Challenges implementations to find flaws
- **Plan adjuster**: Updates tasks based on discoveries at each phase

## Process

### 1. Determine Target Dartboard

If dartboard name provided as argument, use it. Otherwise:

1. Check for `.claude/dartai.local.md` config file for default dartboard
2. Try to match current directory name to a dartboard
3. Ask user to select from available dartboards via Dart MCP

```
Use mcp__Dart__get_config to get available dartboards
```

### 2. Select Loop Type

If `--loop` argument provided, use it. Otherwise default to `quality` loop.

Available loops:
- **quality**: Full implementation quality verification (adversarial-quality-loop)
- **test**: Test coverage and quality verification (adversarial-test-loop)
- **security**: Security audit with OWASP patterns (adversarial-security-loop)
- **refactor**: Safe refactoring with behavior verification (adversarial-refactor-loop)

### 3. Fetch Active Tasks

Query Dart for tasks in the dartboard:

```
Use mcp__Dart__list_tasks with:
- dartboard: [selected dartboard]
- is_completed: false
- status: "To-do" or "In Progress"
- limit: 20
```

### 4. Initialize Loop State

Track:
- Current dartboard
- Selected loop type
- Tasks queue (ordered by priority)
- Completed tasks count
- Failed tasks count
- Plan adjustments made
- Start time

### 5. Execute Adversarial Loop

For each task in queue:

#### 5.1 Task Sizing Check
Verify task is context-sized:
- Maximum 3-5 files per task
- Clear acceptance criteria
- Bounded scope

**If task too large**: Split into subtasks before proceeding

#### 5.2 Execute Selected Loop

**Quality Loop** (adversarial-quality-loop skill):
```yaml
phases:
  1_implementation_review:
    - Understand task scope
    - Identify all files
    - Create verification checklist
    - PLAN ADJUSTMENT: Update if scope changes

  2_adversarial_implementation:
    - Implement with positive instructions
    - Self-adversarial review
    - PLAN ADJUSTMENT: Add fix tasks if issues found

  3_adversarial_verification:
    - External code review (verifier role)
    - Challenge every assumption
    - PLAN ADJUSTMENT: Add fixes for findings

  4_quality_gates:
    - Run linting, testing, coverage
    - PLAN ADJUSTMENT: Add fixes for failures

  5_final_validation:
    - Verify acceptance criteria met
    - Complete or escalate
```

**Test Loop** (adversarial-test-loop skill):
```yaml
phases:
  1_test_planning: "Analyze coverage needs"
  2_happy_path: "50-60% of tests"
  3_edge_cases: "25-30% of tests"
  4_adversarial: "10-15% of tests"
  5_quality_verification: "Mutation testing"
  6_regression: "Bug regression tests"
  # PLAN ADJUSTMENT after each phase
```

**Security Loop** (adversarial-security-loop skill):
```yaml
phases:
  1_threat_modeling: "Map attack surface"
  2_injection: "OWASP A03 testing"
  3_auth: "OWASP A01, A07 testing"
  4_data_protection: "OWASP A02, A04 testing"
  5_configuration: "OWASP A05 testing"
  6_report: "Security findings"
  # PLAN ADJUSTMENT after each phase
  # STOP on critical findings
```

**Refactor Loop** (adversarial-refactor-loop skill):
```yaml
phases:
  1_analysis: "Identify refactoring scope"
  2_baseline: "Establish behavior baseline"
  3_incremental: "Execute atomic refactoring steps"
  4_verification: "Adversarial behavior comparison"
  5_validation: "Final quality checks"
  6_report: "Refactoring results"
  # PLAN ADJUSTMENT after each phase and each step
```

#### 5.3 Handle Result

**On Success:**
- Update task to "Done" via Dart MCP
- Add completion comment with summary
- Log plan adjustments made
- Continue to next task

**On Failure:**
- Add failure comment with details
- Log which phase failed
- Create follow-up fix tasks
- STOP loop

#### 5.4 Documentation Update

Use doc-updater agent to:
- Update CHANGELOG if applicable
- Update README if applicable
- Add inline documentation

### 6. Plan Adjustment Protocol

At each plan adjustment point:

```yaml
plan_adjustment:
  trigger: "End of each phase or major discovery"

  actions:
    - Review what was discovered
    - Identify new tasks needed
    - Re-prioritize existing tasks
    - Update task descriptions
    - Document adjustment reason

  record:
    - adjustment_type: "add|modify|remove|reorder"
    - reason: "What triggered adjustment"
    - tasks_affected: "List of task IDs"
```

### 7. Loop Control

The loop continues until:
- All tasks completed successfully
- A task fails (stops with report)
- Critical security issue found (immediate stop)
- User says "stop", "cancel", or "pause"
- Session ends

### 8. Status Reporting

Display ongoing progress:
```
Ralph Wiggum Adversarial Loop
=============================
Dartboard: [name]
Loop Type: [quality|test|security|refactor]
Progress: [X] of [Y] tasks

Current Task: [title]
Current Phase: [phase name]

Completed Tasks:
- Task 1 (3 adjustments)
- Task 2 (1 adjustment)

Plan Adjustments This Session: [count]
Time elapsed: [duration]
```

## Usage Examples

```bash
# Start quality loop (default)
/dartai:start

# Start on specific dartboard
/dartai:start Personal/standardbeagle-tools

# Start security audit loop
/dartai:start "My Project" --loop=security

# Start test coverage loop
/dartai:start --loop=test
```

## Context-Sized Task Requirements

Every task must be:
```yaml
context_sized_task:
  scope:
    max_files: 5
    clear_acceptance: true
    bounded_changes: true

  instructions:
    positive: "List of DO instructions"
    negative: "List of DO NOT instructions"

  verification:
    criteria: "Clear pass/fail conditions"
    evidence: "How to verify"
```

## Stopping the Loop

Say any of:
- "stop the loop"
- "cancel ralph wiggum"
- "pause execution"
- "/dartai:stop"

Or for immediate stop on security:
- "security critical" (when critical vulnerability found)
