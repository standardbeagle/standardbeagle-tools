---
name: simple-planning
description: Create minimal, focused task plans using adversarial discipline - no over-engineering allowed. 對抗紀律下創建最小聚焦任務計劃，禁止過度工程。 Use when: plan a task, create task plan, break down feature, scope a change, planning before coding
---

# Simple Planning Skill (Adversarial Cooperation)

創建最小任務計劃，精確交付所請——不多不少。

## Planning Philosophy

```yaml
core_principle: "The best plan is the smallest plan that works"

planning_rules:
  required:
    - "What exactly was requested? What's the minimum change?"
    - "How will we verify it works?"
    - "Domain terms from DOMAIN.md? New concepts named there first?"
    - "Does codebase need refactor-first before change fits naturally?"
    - "Will new code be findable by name and location?"
    - "Write RED test first, then GREEN implementation"
    - "Implement full vertical slice, not horizontal layers"

  forbidden:
    - "While we're at it... / We should also... / For future flexibility..."
    - "Write all tests first, then all implementation"
    - "Build database layer first, then API, then UI"
```

### TDD Discipline: Red/Green/Refactor

```yaml
tdd_requirements:
  red_first:
    rule: "Every implementation task MUST start with a failing test"
    steps:
      - "Write test for the smallest behavior increment"
      - "Run test - it MUST FAIL (RED)"
      - "If test passes, test is wrong - fix or delete it"
    
  green_minimum:
    rule: "Write minimum code to make test pass"
    steps:
      - "Implement just enough to go RED → GREEN"
      - "No code without a failing test first"
      - "No 'preparing' the implementation"
    
  refactor_clean:
    rule: "Clean up only when GREEN"
    steps:
      - "Refactor with all tests passing"
      - "If tests go RED, undo immediately"
      - "Commit after each GREEN"

  vertical_slices:
    rule: "Implement full feature vertically, not horizontally"
    pattern:
      good:
        - "Task: User can create a post (includes DB + API + validation)"
        - "Task: User can view a post (includes DB query + API + response)"
      bad:
        - "Task: Build all database models first"
        - "Task: Build all API endpoints first"
        - "Task: Add all validations later"
    
  why_vertical:
    - "Delivers working features faster"
    - "Validates integration at each step"
    - "Allows early feedback"
    - "Reduces risk of integration failures"
```

---

## Plan Template

```yaml
# Task Plan: [One-line description]

requested: |
  [Exact user request - copy their words]

domain_terms: # Canonical names from DOMAIN.md used in this task
  - "[TermFromDomainModel]"

new_domain_concepts: # Concepts introduced by this task, named in DOMAIN.md first
  - "[NewTerm]: [definition]"  # or "none"

deliverable: |
  [Concrete output - what will exist when done, using domain terms]

scope:
  files_to_modify: # Max 5
    - path/to/file1.ext
    - path/to/file2.ext

  files_to_create: # Only if required
    - path/to/new-file.ext

  files_to_delete: # Only if replacing
    - path/to/obsolete.ext

acceptance_criteria:
  - "Criterion 1 - verified by RED→GREEN test cycle"
  - "Criterion 2 - verified by RED→GREEN test cycle"

tdd_approach:
  style: "strict_red_green_refactor"
  vertical_slices: true
  test_first: "Every behavior must have RED test before GREEN implementation"

steps:
  1: "Write RED test for [smallest behavior]"
  2: "GREEN: Minimum implementation to pass"
  3: "Refactor while GREEN"
  4: "Write RED test for [next behavior]"
  5: "GREEN: Minimum implementation to pass"
  6: "Verify all tests pass, no regressions"

not_included: # Explicitly list what we WON'T do
  - "Refactoring unrelated code"
  - "Adding extra features"
  - "Updating documentation beyond changed API"
```

---

## Eagle-Eyed Planning Discipline

### Scope Violations to Reject

```yaml
scope_creep:
  phrases_that_expand_scope:
    - "While we're in here, we should also..."
    - "It would be nice to add..."
    - "We could improve this by..."
    - "For completeness, let's also..."
    - "We should future-proof by..."

  response: "STOP. Remove from plan. Only what was requested."

extra_files:
  trigger: "Plan touches > 5 files"
  response: "STOP. Split into smaller tasks."

premature_abstraction:
  trigger: "Creating interface/factory/abstraction for single use"
  response: "STOP. Use concrete implementation. Abstract when needed."
```

### Complexity Violations to Reject

```yaml
over_engineering:
  patterns:
    - "Generic framework when specific code works"
    - "Configuration system for one value"
    - "Plugin architecture for one plugin"
    - "Event system for one event"

  response: "STOP. Use simplest solution. Complexity is debt."

unnecessary_flexibility:
  patterns:
    - "Supporting multiple formats when one is needed"
    - "Parametric when hardcoded works"
    - "Async when sync is sufficient"
    - "Interface when concrete type is known"

  response: "STOP. YAGNI. Implement what's needed now."
```

### Planning Anti-Patterns to Reject

```yaml
vague_steps:
  bad:
    - "Implement the feature"
    - "Add tests"
    - "Handle errors"
  good:
    - "Add parseConfig() function to config.ts"
    - "Add test for empty input in config.test.ts"
    - "Return ConfigError for invalid JSON"

unbounded_scope:
  bad:
    - "Update all error messages"
    - "Improve test coverage"
    - "Refactor authentication"
  good:
    - "Fix error message in login.ts:42"
    - "Add test for login timeout"
    - "Extract validateToken from auth.ts"
```

---

## Request Complexity Classification

計劃前，分類請求以設定適當驗證深度。

```yaml
complexity_tiers:
  minimal:
    indicators:
      - Single file change
      - Clear, bounded request
      - No clarification needed
      - Trivial scope (typo, text change, add button)
    examples:
      - "Fix typo in README"
      - "Update error message text"
      - "Add margin to header"
    validation_depth: quick_scan
    validation_time: "~30 seconds"

  standard:
    indicators:
      - 2-5 files affected
      - Single feature or fix
      - Minor clarification needed
      - Moderate scope (new function, bug fix)
    examples:
      - "Add logout button to header"
      - "Fix null pointer in login"
      - "Refactor parseConfig function"
    validation_depth: standard_review
    validation_time: "~2 minutes"

  comprehensive:
    indicators:
      - 5+ files or multiple components
      - Multiple acceptance criteria
      - Significant user discussion
      - Substantial scope (new feature, module)
    examples:
      - "Implement user authentication"
      - "Add search functionality"
      - "Create settings page"
    validation_depth: deep_analysis
    validation_time: "~5 minutes"

  architectural:
    indicators:
      - Cross-cutting concerns
      - Multiple subsystems affected
      - New patterns or abstractions needed
      - Large scope (application, redesign)
    examples:
      - "Build 30-screen dashboard app"
      - "Redesign data layer"
      - "Implement plugin system"
    validation_depth: full_adversarial
    validation_time: "~10 minutes"

tier_detection:
  rules: [count files+criteria, measure discussion length, detect cross-cutting keywords]
  escalation_triggers:
    - user_clarification_count: ">= 3 → bump tier"
    - files_affected: ">= 5 → comprehensive minimum"
    - subsystems_affected: ">= 2 → architectural"
    - new_patterns_needed: "true → architectural"
  user_response_impact: stated preferences+constraints+scope limits are binding
```

---

## Planning Process

### Step 0: Read Domain Model (30 seconds)

```yaml
domain_model_check:
  locate:
    - "Check docs/DOMAIN.md"
    - "Check docs/domain/*.md (per-context files)"

  extract:
    - "Canonical terms for this feature area"
    - "Aggregate names that this task touches"
    - "Synonyms to reject — must not appear in plan or code"

  if_new_concepts:
    action: "Name them in DOMAIN.md BEFORE writing the plan"
    rule: "The name chosen in DOMAIN.md is the name used everywhere"
    note: "If unsure of the right name, ask — naming is design"

  if_no_domain_model:
    action: "Note absence, proceed with best judgment"
    suggestion: "Consider running domain-init if this is a DDD project"
```

### Step 0.5: Classify Complexity (15 seconds)

```yaml
classify:
  assess:
    - How many files will this touch?
    - How many acceptance criteria exist?
    - How much clarification was needed?
    - Does this cross system boundaries?

  assign_tier:
    minimal: "1 file, clear request, trivial change"
    standard: "2-5 files, single feature, bounded"
    comprehensive: "5+ files, multiple criteria, significant"
    architectural: "cross-cutting, new patterns, large scope"

  record:
    - Note the tier for validation phase
    - Tier affects validation depth, not planning depth
    - All plans follow same minimal structure

  user_responses_matter:
    - "User stated 'keep it simple' → respect scope limit"
    - "User clarified 'just X, not Y' → exclude Y from plan"
    - "User gave specific approach → use that approach"
```

### Step 0.6: Risk classification (authoritative when enabled; legacy fallback when disabled)

並行風險分級。啟用時風險裁決為權威，驅層級與管道路由；`enabled: false` 則層級邏輯回退驅動，風險輸出省。

```yaml
availability_check:
  required:
    - "plugins/risk-pipeline/skills/risk-classify.md exists"
    - ".claude/rules/risk.md exists with frontmatter risk_pipeline.enabled == true"
  if_unavailable:
    action: "Skip invocation; write telemetry record with risk:{enabled:false}"
    outcome: "Legacy tier flow drives planning (fallback path)"

if_available:
  invoke: "risk-pipeline:classify with {task_id, task_spec, touched_files}"
  do:
    - "Route planning off risk verdict (verdict + pipeline_tier authoritative)"
    - "Apply risk required_reviewers and model to dispatch spec"
    - "Preserve Step 0.5 tier classification as secondary signal for telemetry diff"
```

**遙測寫入 (telemetry write)**：追加一行 JSON 至 `.dartai/telemetry.jsonl`：

```json
{
  "ts": "<ISO timestamp>",
  "event": "plan",
  "task_id": "<dart id or spec hash>",
  "legacy_tier": "<minimal|standard|comprehensive|architectural>",
  "risk": { "enabled": true, "verdict": "...", "pipeline_tier": "...", "scalar": 0, "vector": {} },
  "agreement": "<match|diverge>",
  "authoritative": "risk"
}
```

`risk.enabled == false` 時，`risk` 欄記 `{"enabled": false}`，其餘 risk 欄略；`agreement` 寫 `match`（無風險輸出可比）；`authoritative` 為 `"legacy"`（回退路徑）。啟用態恒記 `"risk"`。

### Step 0.7: Invoke grill-task (after tier classification)

若Step 0.5之層級為`minimal`，跳過此步——`dev-standards:grill-task`中的minimal層門控亦會跳過。

否則，以原始請求及調用上下文調用`dev-standards:grill-task`。該技能運行計劃時品質審查（直接性、問題/解決方案適配、可測試性、過度工程防護、解決方案深度），返回`task_spec`及任何`backflow_writes`。`task_spec`替代後續步驟（步驟1、2、3折入審查規格）。grill-task返回後直接進行Step 2.5（重構優先評估）。

若grill-task返回`verdict: TOO_LARGE_TO_GRILL`，立即上報：告知用戶任務必須拆分，不繼續計劃。

### Step 1: Capture Request (30 seconds)

```yaml
capture:
  - Copy exact user request
  - Identify the ONE thing being asked
  - Note any explicit constraints

  do_not:
    - Interpret beyond what's written
    - Add implicit requirements
    - Assume additional context
```

### Step 2: Define Deliverable (30 seconds)

```yaml
define:
  - What will exist when done?
  - How will user verify it works?
  - What's the smallest change that delivers this?

  test: "Can I point to a specific thing and say 'this is what you asked for'?"
```

### Step 2.5: Refactor-First Assessment (1 minute)

調用`dev-standards:refactor-first-assessment`。消費審查任務規格，決定是否在實施前插入準備重構步驟。四項檢查（自然擴展、命名適配、共同定位、摩擦）在該技能中——勿在此重複。

若技能返回"sign off"，進行Step 3。若返回一個或多個重構步驟，在Step 4（列步驟）之前按順序插入：提取/移動 → 重命名 → 減少摩擦。

### Step 3: Identify Files (1 minute)

```yaml
file_identification:
  use_lci:
    - Search for related symbols
    - Find existing patterns to follow
    - Locate where changes belong
    - Check if refactoring is needed to create the right home

  constraints:
    - Max 5 files modified
    - If more needed: STOP, split task
    - Prefer editing over creating
```

### Step 4: List Steps (1 minute)

```yaml
step_creation:
  rules:
    - Each step is one atomic action
    - Steps are verifiable (test can run, lint can check)
    - Max 7 steps per plan
    - If more needed: STOP, split task
    - EVERY implementation step starts with RED test
    - Implement vertical slices, not horizontal layers

  format:
    - "Write RED test for X behavior"
    - "Implement minimum to make test GREEN"
    - "Refactor while GREEN"
    - "Modify X to do Y (RED→GREEN→Refactor)"
    - "Remove X from Y (RED→GREEN→Refactor)"
    - "Run tests/lint to verify"

  tdd_step_pattern:
    example:
      - "Write RED test: user can create post with title and body"
      - "GREEN: Add createPost() with title/body persistence"
      - "Refactor: Extract validation logic"
      - "Write RED test: user cannot create post without title"
      - "GREEN: Add title validation"
      - "Write RED test: user can retrieve created post"
      - "GREEN: Add getPost() method"
```

### Step 5: Define Not-Included (30 seconds)

```yaml
exclusions:
  purpose: "Prevent scope creep during execution"

  list_what_we_will_not_do:
    - Related features not requested
    - Refactoring opportunities noticed
    - Documentation updates not required
    - Test additions beyond changed code
```

---

## Context-Sized Task Validation

接受計劃前，驗證：

```yaml
size_check:
  files: "<= 5"
  steps: "<= 7"
  estimated_changes: "< 200 lines added/modified"

  if_exceeds:
    action: "Split into multiple tasks"
    pattern: |
      Task 1: [First deliverable]
      Task 2: [Second deliverable] - depends on Task 1
      Task 3: [Third deliverable] - depends on Task 2
```

---

## Plan Adjustment Protocol

計劃執行中自動調整——無需停止請求批准：

```yaml
adjustment_triggers:
  discovery: {trigger: "simpler approach", action: "update plan, note, continue"}
  complication: {trigger: "step harder", action: "add sub-steps if in-scope; else STOP+split"}
  error: {trigger: "step fails", action: "fix as new step, continue"}
never_ask: [any confirmation or permission — adjust+note+continue]
```

---

## Example Plans

### Good: Minimal and Focused with TDD

```yaml
# Task Plan: Add logout button to header

requested: "Add a logout button to the header"

deliverable: "Logout button in header that clears session and redirects to login"

scope:
  files_to_modify:
    - src/components/Header.tsx
    - src/services/auth.ts
    - src/components/Header.test.tsx

acceptance_criteria:
  - "Button visible in header when logged in - verified by RED→GREEN test"
  - "Clicking button clears session - verified by RED→GREEN test"
  - "User redirected to /login - verified by RED→GREEN test"

tdd_approach:
  style: "strict_red_green_refactor"
  vertical_slices: true

steps:
  1: "Write RED test: logout button renders when user is logged in"
  2: "GREEN: Add LogoutButton component to Header.tsx"
  3: "Refactor: Extract button styles to match existing pattern"
  4: "Write RED test: clicking logout clears session"
  5: "GREEN: Add logout() function to auth.ts, wire to button"
  6: "Write RED test: logout redirects to /login"
  7: "GREEN: Add redirect logic to logout handler"
  8: "Verify all tests pass, no regressions"

not_included:
  - "Confirmation dialog"
  - "Logout animation"
  - "Session timeout feature"
  - "Refactoring auth.ts beyond logout function"
```

### Bad: Over-Engineered

```yaml
# REJECTED - Too complex

requested: "Add a logout button to the header"

# VIOLATION: Scope creep
deliverable: "Complete session management system with logout, timeout, and refresh"

# VIOLATION: Too many files
scope:
  files_to_modify:
    - src/components/Header.tsx
    - src/services/auth.ts
    - src/services/session.ts      # NEW - not needed
    - src/hooks/useSession.ts      # NEW - not needed
    - src/contexts/AuthContext.tsx # NEW - not needed
    - src/utils/storage.ts         # not needed
    - src/types/auth.ts            # not needed

# VIOLATION: Extra features
steps:
  1: "Create session management abstraction"     # over-engineering
  2: "Add session timeout detection"             # not requested
  3: "Create AuthContext for state management"   # not needed for button
  4: "Add useSession hook"                       # not needed
  5: "Implement logout with cleanup"
  6: "Add confirmation dialog"                   # not requested
  7: "Add logout event broadcasting"             # not requested
  8: "Update all components to use context"      # scope explosion
```

---

## Self-Verification Checklist

計劃定稿前，驗證：

```yaml
checklist:
  domain:
    - [ ] DOMAIN.md read before planning
    - [ ] New concepts named in DOMAIN.md before appearing in plan
    - [ ] Plan uses canonical domain terms, not synonyms

  scope:
    - [ ] Plan delivers exactly what was requested
    - [ ] No features added beyond request
    - [ ] Files touched <= 5
    - [ ] Steps <= 7

  simplicity:
    - [ ] Simplest solution that works
    - [ ] No premature abstractions
    - [ ] No future-proofing
    - [ ] Uses existing patterns

  clarity:
    - [ ] Each step is atomic and verifiable
    - [ ] Deliverable is concrete and testable
    - [ ] Not-included list prevents scope creep

  integration:
    - [ ] Follows existing code patterns
    - [ ] Uses existing utilities
    - [ ] Changes blend with codebase

  refactor_first:
    - [ ] Assessed whether existing structure supports the change naturally
    - [ ] Refactor step added to plan if structure needs to change first
    - [ ] New code will live where someone would look for it

  findability:
    - [ ] Names describe behavior, not implementation
    - [ ] No unexplained abbreviations or acronyms
    - [ ] Code is co-located with related functionality
    - [ ] LCI search would surface this code from a feature-level query

  planning_time_quality:
    - [ ] Directness: the spec attacks the problem with the smallest possible change
    - [ ] Problem/solution fit: the solution uses existing codebase patterns and utilities
    - [ ] Extreme testability: every acceptance criterion has a clear RED→GREEN pass/fail condition
    - [ ] No overengineering: no abstractions with one consumer, no future-proofing, only vertical slices
    - [ ] Solution depth: trade-offs considered, edge cases addressed, integration points identified
```

---

## Adversarial Plan Validation

計劃創建後，對抗性驗證。驗證深度匹配Step 0之複雜度層級。

### Validation Categories

```yaml
categories:
  missing:
    description: "Required tasks omitted from plan"
    scan_for:
      - Feature without test task
      - Schema change without migration
      - API change without docs update
      - New component without integration
      - Error path without handling
    severity: high
    action: "Add missing task"

  overbuilt:
    description: "Tasks exceeding the request"
    scan_for:
      - Abstractions for single use
      - Config systems for one value
      - Features not in acceptance criteria
      - "While we're at it" additions
      - Future-proofing not requested
    severity: high
    action: "Remove from plan"

  conflicting:
    description: "Tasks that contradict each other or request"
    scan_for:
      - Task undoes previous task's work
      - Approach differs from user preference
      - Steps assume incompatible states
      - Competing implementations
    severity: critical
    action: "Resolve before proceeding"

  partial:
    description: "Incomplete or vague tasks"
    scan_for:
      - "Implement feature" (too vague)
      - "Handle errors" (which ones?)
      - "Update tests" (which tests?)
      - Missing acceptance criteria
      - Undefined boundaries
    severity: medium
    action: "Make specific"

  research_needed:
    description: "Unknowns blocking confident planning"
    scan_for:
      - Unknown existing patterns
      - Unclear dependencies
      - Ambiguous requirements
      - Untested assumptions
    severity: medium
    action: "Add research task first"
```

### Validation by Tier

#### Minimal Tier (~30 seconds)

```yaml
quick_scan:
  trigger: "Single file, clear request, trivial change"
  checks:
    - request_match: "Plan delivers exactly what was asked"
    - obvious_gaps: "No glaring omissions"
    - scope_fit: "Change matches request size"
  skip:
    - pattern_analysis
    - dependency_mapping
    - architecture_review
```

#### Standard Tier (~2 minutes)

```yaml
standard_review:
  trigger: "2-5 files, single feature, minor clarification"
  checks:
    - all_minimal_checks
    - acceptance_coverage: "Each criterion has a task"
    - task_atomicity: "Each task is clear and bounded"
    - pattern_check: "Similar patterns exist (LCI search)"
    - user_alignment: "Plan matches user responses"
  skip:
    - full_architecture_review
    - security_modeling
    - performance_analysis
```

#### Comprehensive Tier (~5 minutes)

```yaml
deep_analysis:
  trigger: "5+ files, multiple criteria, significant discussion"
  checks:
    - all_standard_checks
    - dependency_order: "Task sequence makes sense"
    - integration_points: "All touchpoints identified"
    - edge_cases: "Known edge cases addressed"
    - test_strategy: "Coverage approach defined"
    - rollback_path: "Changes can be reverted"
```

#### Architectural Tier (~10 minutes)

```yaml
full_adversarial:
  trigger: "Cross-cutting, multiple systems, new patterns"
  checks:
    - all_comprehensive_checks
    - architecture_fit: "Plan fits existing architecture"
    - cross_system: "All affected systems identified"
    - research_complete: "Unknowns resolved or explicitly flagged"
    - risk_assessment: "High-risk tasks identified"
    - incremental_delivery: "Can ship in phases"
    - codebase_integration: "New code will blend with existing"
```

### Validation Verdicts

```yaml
verdicts:
  pass:
    condition: "No critical issues, <=2 medium issues"
    action: "Proceed to execution"

  adjust:
    condition: "Fixable issues found"
    action: "Update plan inline, re-validate, continue"

  reject:
    condition: "Critical issues or >3 medium issues"
    action: "Rework plan before proceeding"

  escalate:
    condition: "Cannot resolve without user input"
    action: "Present issues to user, await guidance"
```

### Auto-Adjustment Rules

```yaml
plan_adjustment:
  automatic:
    missing_test_task: "Add test task, continue"
    vague_step: "Make specific, continue"
    minor_scope_creep: "Trim to request, continue"
    research_gap: "Add research task first, continue"

  stop_and_report:
    conflicting_tasks: "Cannot proceed with contradictions"
    user_preference_mismatch: "Approach differs from stated preference"
    scope_explosion: "Plan exceeds limits, must split"
    fundamental_unknown: "Cannot plan without more information"

  never_ask: [any confirmation or permission — decide+adjust+continue]
```

### Validation Report Format

```yaml
plan_validation:
  tier: "[minimal|standard|comprehensive|architectural]"
  request_summary: "One-line original request"
  user_constraints: "Preferences/limits stated by user"

  issues:
    - category: "[missing|overbuilt|conflicting|partial|research]"
      severity: "[critical|high|medium|low]"
      description: "What's wrong"
      location: "Which task/step"
      fix: "How to resolve"

  adjustments_made:
    - "Added test task for new function"
    - "Trimmed unrequested caching feature"
    - "Made 'handle errors' specific to validation errors"

  verdict: "[pass|adjust|reject|escalate]"
  recommendation: "Proceed|Rework|Await user input"
```

---

## When to Split a Task

```yaml
split_indicators:
  - "This requires changes to > 5 files"
  - "There are multiple independent deliverables"
  - "Steps exceed 7"
  - "Estimated changes > 200 lines"
  - "Task has 'and' connecting unrelated work"

split_pattern:
  original: "Add logout button and session timeout"
  split_into:
    - "Task 1: Add logout button to header"
    - "Task 2: Add session timeout detection (depends on Task 1)"

split_action: "Create separate Dart tasks for each deliverable"
```

---

## Deep Plan Validation

對**comprehensive**及**architectural**層級任務，調用**adversarial-planning-loop**技能。

> Invoke the `Skill` tool with `skill: dartai:adversarial-planning-loop` — 對抗規劃環，薄協調層：
> 1. 調用`dev-standards:grill-task`生成審查任務規格
> 2. 調用`dev-standards:refactor-first-assessment`插入準備重構步驟
> 3. 驗證計劃上下文大小（最多5文件，最多7步驟）
> 4. 可選調用`dev-standards:review-for-plan-updates`進行計劃層審查

完整對抗品質環（`dartai:adversarial-quality-loop`）僅用於實施時驗證。

---

## Summary

```yaml
planning_mantras:
  - "What's the smallest change that delivers the request?"
  - "If in doubt, leave it out"
  - "Simple now beats flexible later"
  - "One task, one deliverable, one plan"
  - "Plans adjust automatically, never ask"
  - "Research unknowns, not fears"
```
