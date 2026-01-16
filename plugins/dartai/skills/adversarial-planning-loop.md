---
name: adversarial-planning-loop
description: Adversarial cooperation loop for plan validation ensuring complete hierarchy with research tasks, while preventing over-design
---

# Adversarial Planning Loop (Ralph Wiggum Pattern)

A continuous planning refinement loop where a planner and challenger cooperate adversarially to ensure plans are complete, actionable, and minimal.

## Core Principles

### Planning Triangle

```yaml
planning_triangle:
  completeness:
    goal: "Every unknown is addressed"
    risk: "Missing research tasks lead to blocked implementations"

  actionability:
    goal: "Every task is immediately executable"
    risk: "Vague tasks cause scope drift during execution"

  minimality:
    goal: "Nothing beyond what's needed"
    risk: "Over-planning wastes effort and creates complexity"

balance_rule: |
  A good plan maximizes completeness and actionability
  while ruthlessly minimizing scope. When in conflict:
  1. Cut scope first (minimality wins over completeness)
  2. Add research tasks for genuine unknowns (completeness over actionability)
  3. Make vague tasks specific (actionability is non-negotiable)
```

### Plan Hierarchy Requirements

```yaml
plan_hierarchy:
  levels:
    epic:
      description: "Large goal requiring multiple tasks"
      max_tasks: 10
      requires: "Clear deliverable statement"

    task:
      description: "Single focused unit of work"
      max_files: 5
      max_steps: 7
      requires: "Acceptance criteria"

    subtask:
      description: "Atomic action within a task"
      scope: "One specific change"
      requires: "Verifiable outcome"

  research_integration:
    rule: "Any unknown MUST have a research/spike task before implementation task"
    position: "Research tasks come BEFORE dependent implementation tasks"
    output: "Research tasks produce documented decisions, not code"
```

### Plan Adjustment Protocol

```yaml
plan_adjustment_rules:
  automatic_continuation:
    description: "Planning phases are automatic refinement cycles"
    behavior: "Identify issues, fix plan, continue"

  when_to_stop:
    - "Cannot determine scope without user input"
    - "Conflicting requirements with no resolution"
    - "External dependency blocking all approaches"

  when_to_continue:
    - "Missing research tasks (add them, continue)"
    - "Vague steps found (make specific, continue)"
    - "Scope creep detected (trim back, continue)"
    - "Dependencies discovered (reorder, continue)"

  never_ask:
    - "Is this plan okay?"
    - "Should I add more detail?"
    - "Do you want research tasks?"
    - "Ready for next phase?"

  always_do:
    - "Fix plan issues as discovered"
    - "Add research tasks for unknowns"
    - "Remove over-engineering"
    - "Keep refining until valid"
```

---

## Eagle-Eyed Planning Violations (IMMEDIATE REJECTION)

The challenger must be **ruthlessly vigilant** for these planning anti-patterns. Any occurrence requires plan adjustment.

### 1. Incomplete Hierarchy

```yaml
hierarchy_violations:
  orphan_acceptance_criteria:
    description: "Acceptance criteria with no task to deliver it"
    detection: "Map each criterion to a specific task"
    examples:
      - "Acceptance: 'User can export data' - but no export task exists"
      - "Acceptance: 'Handles errors gracefully' - but no error handling task"
    verdict: "REJECT - add task for each unmapped criterion"

  phantom_dependencies:
    description: "Task assumes something exists that has no creation task"
    detection: "Trace each assumption to its source"
    examples:
      - "Task uses 'UserService' but no task creates UserService"
      - "Task calls API endpoint but no task implements endpoint"
    verdict: "REJECT - add dependency task or research task"

  missing_integration:
    description: "Components built separately with no integration task"
    detection: "Look for tasks that must work together"
    examples:
      - "Build frontend + Build backend but no 'Connect frontend to backend'"
      - "Create auth + Create API but no 'Secure API with auth'"
    verdict: "REJECT - add integration task"

  test_orphans:
    description: "Implementation task without corresponding test consideration"
    detection: "Every non-trivial implementation should note test approach"
    examples:
      - "Add complex calculation but no mention of how to verify"
      - "Create error handling but no test for error paths"
    verdict: "REJECT - add verification approach to task or add test task"
```

### 2. Unresolved Unknowns

```yaml
unknown_violations:
  unexplored_technology:
    description: "Plan uses technology team hasn't used before"
    detection: "Scan for unfamiliar libraries, patterns, or services"
    examples:
      - "Implement WebSocket support (never used before)"
      - "Use Redis for caching (new to codebase)"
      - "Add GraphQL endpoint (existing API is REST)"
    required: "Add SPIKE task to evaluate technology first"
    verdict: "REJECT - add spike task before implementation"

  ambiguous_requirements:
    description: "Requirements that could be interpreted multiple ways"
    detection: "Look for words like 'flexible', 'efficient', 'user-friendly'"
    examples:
      - "Make the form user-friendly" (what does this mean?)
      - "Efficiently handle large datasets" (how large? how efficient?)
      - "Support multiple formats" (which formats specifically?)
    required: "Add RESEARCH task to clarify with stakeholder OR make specific"
    verdict: "REJECT - add research task or specify requirement"

  unknown_patterns:
    description: "Implementation requires patterns not established in codebase"
    detection: "Scan for architectural decisions not yet made"
    examples:
      - "Add state management" (which pattern? existing precedent?)
      - "Implement caching layer" (where? what strategy?)
      - "Create plugin system" (no existing plugin architecture)
    required: "Add SPIKE task to evaluate patterns OR use existing pattern"
    verdict: "REJECT - add spike task or use established pattern"

  external_integration:
    description: "Plan depends on external service behavior"
    detection: "Look for third-party APIs, services, or systems"
    examples:
      - "Integrate with Stripe" (have we tested their sandbox?)
      - "Call external ML API" (what are rate limits? error modes?)
      - "Sync with third-party system" (do we have test credentials?)
    required: "Add RESEARCH task to verify integration assumptions"
    verdict: "REJECT - add research task before building integration"
```

### 3. Over-Engineering in Plans

```yaml
overengineering_violations:
  premature_abstraction:
    description: "Plan creates abstractions before proving need"
    detection: "Look for interfaces, factories, base classes with one implementation"
    examples:
      - "Create IUserRepository interface" (for single implementation)
      - "Build plugin architecture" (for one plugin)
      - "Design event system" (for three events)
    verdict: "REJECT - remove abstraction, use concrete implementation"

  future_proofing:
    description: "Tasks that prepare for hypothetical future needs"
    detection: "Look for 'might need', 'could be useful', 'for flexibility'"
    examples:
      - "Make parser configurable for future formats"
      - "Add extension points for potential plugins"
      - "Design API for backward compatibility (v1 doesn't exist)"
    verdict: "REJECT - remove future-proofing tasks entirely"

  gold_plating_tasks:
    description: "Tasks that exceed what was requested"
    detection: "Compare each task to original request"
    examples:
      - "Add logout button" + "Also add session management" (not requested)
      - "Fix bug X" + "Also refactor surrounding code" (not requested)
      - "Create API endpoint" + "Also add caching" (not requested)
    verdict: "REJECT - remove unrequested tasks"

  research_inflation:
    description: "Research tasks for things that are well-known"
    detection: "Look for research on established patterns"
    examples:
      - "Research: How to add a button in React" (common knowledge)
      - "Spike: Evaluate REST vs REST" (solved problem)
      - "Research: Best way to read a file" (standard operation)
    verdict: "REJECT - remove trivial research tasks"

  excessive_decomposition:
    description: "Breaking tasks into unnecessarily small pieces"
    detection: "Subtasks that take < 5 minutes or are always done together"
    examples:
      - "Create file" + "Add imports" + "Add function" (one task)
      - "Write test" + "Run test" + "Fix test" (one task)
    verdict: "REJECT - combine into single coherent task"
```

### 4. Vague Task Definitions

```yaml
vagueness_violations:
  unbounded_scope:
    patterns:
      - "Improve X" (improve how? when is it done?)
      - "Handle errors" (which errors? how?)
      - "Add tests" (which tests? for what?)
      - "Update documentation" (which docs? what changes?)
      - "Refactor Y" (what's the target state?)
    verdict: "REJECT - make specific with clear completion criteria"

  missing_acceptance_criteria:
    detection: "Task has no way to verify completion"
    examples:
      - "Make it faster" (how much faster? how to measure?)
      - "Improve UX" (what specific improvement? how to verify?)
      - "Add logging" (what to log? what format? where?)
    verdict: "REJECT - add specific, testable acceptance criteria"

  implementation_hiding:
    description: "Task hides complexity in vague steps"
    patterns:
      - "Implement the feature" (not a step, it's the whole task)
      - "Add necessary changes" (what changes?)
      - "Update as needed" (needed for what?)
    verdict: "REJECT - expand into specific atomic steps"

  weasel_words:
    patterns:
      - "should", "might", "could", "probably"
      - "as appropriate", "if needed", "when necessary"
      - "etc.", "and so on", "and more"
      - "various", "multiple", "several"
    verdict: "REJECT - replace with specific commitments"
```

### 5. Dependency Disorder

```yaml
dependency_violations:
  circular_dependencies:
    description: "Tasks that depend on each other"
    detection: "Build dependency graph, check for cycles"
    examples:
      - "Task A needs Task B output, Task B needs Task A output"
      - "Research needs implementation, implementation needs research"
    verdict: "REJECT - break cycle by splitting or reordering"

  hidden_prerequisites:
    description: "Task assumes prior work without stating it"
    detection: "What must be true for this task to start?"
    examples:
      - "Deploy to production" (assumes build, test, staging pass)
      - "Add feature to module X" (assumes module X exists)
    verdict: "REJECT - add explicit prerequisite tasks or dependencies"

  parallel_impossibility:
    description: "Tasks marked parallel that must be sequential"
    detection: "Can these actually run at the same time?"
    examples:
      - "Create database schema" || "Add migrations" (must be sequential)
      - "Write function" || "Test function" (must be sequential)
    verdict: "REJECT - reorder to respect true dependencies"

  integration_timing:
    description: "Integration tasks too early or too late"
    detection: "When does integration actually make sense?"
    examples:
      - "Integration at end" when early integration would catch issues
      - "Integration throughout" when components aren't ready
    verdict: "REJECT - position integration tasks appropriately"
```

---

## Research and Spike Task Standards

### When to Add Research Tasks

```yaml
research_task_triggers:
  unknown_technology:
    trigger: "Plan uses library/framework/service team hasn't used"
    research_goal: "Evaluate fit, document setup, identify gotchas"
    output: "Written evaluation with recommendation"
    time_box: "Max 2 hours"

  ambiguous_requirement:
    trigger: "Requirement can be interpreted multiple ways"
    research_goal: "Clarify with stakeholder, document decision"
    output: "Specific requirement statement"
    time_box: "Max 1 hour"

  multiple_approaches:
    trigger: "Several valid implementation paths exist"
    research_goal: "Evaluate trade-offs, recommend approach"
    output: "Decision document with rationale"
    time_box: "Max 2 hours"

  external_dependency:
    trigger: "Plan depends on third-party behavior"
    research_goal: "Verify assumptions, test integration"
    output: "Verified capabilities and limitations"
    time_box: "Max 2 hours"
```

### When NOT to Add Research Tasks

```yaml
research_task_anti_triggers:
  established_patterns:
    skip_when: "Codebase already uses this pattern"
    instead: "Reference existing implementation in task"

  common_knowledge:
    skip_when: "Standard operation any developer knows"
    instead: "Just do it"

  over_caution:
    skip_when: "Fear of making wrong choice, not actual unknowns"
    instead: "Make reasonable choice, adjust if needed"

  analysis_paralysis:
    skip_when: "Researching to avoid starting"
    instead: "Start with simplest approach, iterate"
```

### Research Task Template

```yaml
research_task:
  title: "RESEARCH: {specific question to answer}"

  format:
    question: "Single specific question to answer"
    context: "Why we need to know this"
    constraints: "Time box, decision criteria"
    output: "What deliverable proves research is done"

  example:
    title: "RESEARCH: Which queue system for async jobs?"
    question: "Should we use Redis queues, RabbitMQ, or SQS for background jobs?"
    context: "Need async processing for email sends, currently no queue system"
    constraints: "2 hour time box. Criteria: ease of setup, cost, reliability"
    output: "Document recommending one option with rationale"

  acceptance_criteria:
    - "Question has specific written answer"
    - "Decision is documented with rationale"
    - "Dependent tasks can proceed based on output"
```

### Spike Task Template

```yaml
spike_task:
  title: "SPIKE: {technology/approach to evaluate}"

  format:
    goal: "What we're trying to learn"
    scope: "Throwaway prototype, not production code"
    success_criteria: "How we know the spike is done"
    time_box: "Maximum time to spend"

  example:
    title: "SPIKE: WebSocket support for real-time updates"
    goal: "Prove we can add WebSocket to existing Express server"
    scope: "Hello World WebSocket that echoes messages"
    success_criteria: "Client can connect and receive messages"
    time_box: "4 hours"

  acceptance_criteria:
    - "Spike code exists (can be deleted after)"
    - "Learning is documented"
    - "Go/no-go decision is made"
    - "Follow-up implementation task is created OR approach abandoned"
```

---

## Phase 1: Capture and Classify

### Task: Understand the Request

**DO (Positive Instructions):**
- Copy exact user request verbatim
- Identify the ONE core deliverable
- Note explicit constraints stated
- Classify complexity tier (minimal/standard/comprehensive/architectural)

**DO NOT (Negative Instructions):**
- Interpret beyond what's written
- Add implicit requirements
- Expand scope during capture
- Assume context not stated

**Verification Criteria:**
```yaml
pass_if:
  - request_captured_verbatim: true
  - single_deliverable_identified: true
  - complexity_tier_assigned: true
fail_if:
  - scope_expanded_during_capture: true
  - multiple_deliverables_mixed: true
```

### Phase 1 Checkpoint (Automatic)
```yaml
checkpoint:
  validate:
    - request_is_clear: true
    - deliverable_is_concrete: true

  auto_adjust:
    multiple_deliverables: "Split into separate plans"
    unclear_request: "Add clarification research task"

  stop_only_if:
    critical: "Cannot determine what user wants at all"

  then: "Proceed immediately to Phase 2"
```

---

## Phase 2: Identify Unknowns

### Task: Scan for Research Needs

**DO (Positive Instructions):**
- List all technologies in the plan
- Mark which are new vs established in codebase
- Identify requirements that need clarification
- Find external dependencies
- Note architectural decisions needed

**DO NOT (Negative Instructions):**
- Mark established patterns as unknown
- Create research for obvious things
- Over-think simple implementations
- Treat all decisions as needing research

**Unknown Classification:**
```yaml
unknown_classification:
  needs_research:
    - "Never used this technology before"
    - "Requirement is ambiguous"
    - "External service we haven't integrated"
    - "Architectural pattern not established"

  needs_spike:
    - "Uncertain if approach is technically feasible"
    - "Need to prove concept before committing"
    - "Risk of significant rework if assumption wrong"

  does_not_need_research:
    - "Standard operation we do all the time"
    - "Pattern already exists in codebase"
    - "Simple decision with easy rollback"
    - "Well-documented technology with clear path"
```

**Verification Criteria:**
```yaml
pass_if:
  - unknowns_identified: true
  - unknowns_classified: true
  - no_false_unknowns: true
fail_if:
  - obvious_unknowns_missed: true
  - common_knowledge_marked_unknown: true
```

### Phase 2 Checkpoint (Automatic)
```yaml
checkpoint:
  validate:
    - unknowns_listed: true
    - classification_complete: true

  auto_adjust:
    unknowns_found: "Create research/spike tasks"
    no_unknowns: "Proceed without research tasks"
    too_many_unknowns: "Consider if scope is too ambitious"

  then: "Proceed immediately to Phase 3"
```

---

## Phase 3: Build Task Hierarchy

### Task: Create Task Breakdown

**DO (Positive Instructions):**
- Create one task per acceptance criterion
- Order tasks by dependency (research first, then implementation)
- Ensure each task is context-sized (max 5 files, max 7 steps)
- Include test/verification approach in implementation tasks
- Add integration tasks where components must connect

**DO NOT (Negative Instructions):**
- Create tasks for unrequested features
- Bundle unrelated work in single task
- Create tasks without acceptance criteria
- Skip integration points
- Leave vague "implement feature" tasks

**Task Hierarchy Template:**
```yaml
plan:
  deliverable: "Single concrete outcome"

  research_tasks:
    - title: "RESEARCH: {question}"
      output: "Decision document"
      blocks: [implementation_task_ids]

  spike_tasks:
    - title: "SPIKE: {what to prove}"
      output: "Learning + go/no-go"
      blocks: [implementation_task_ids]

  implementation_tasks:
    - title: "Implement {specific thing}"
      acceptance_criteria:
        - "Criterion 1 - how verified"
        - "Criterion 2 - how verified"
      files_affected: ["specific/files.ts"]
      depends_on: [research_or_spike_ids]
      verification: "How we know it works"

  integration_tasks:
    - title: "Connect {A} to {B}"
      acceptance_criteria:
        - "A and B work together"
      depends_on: [component_task_ids]

  not_included:
    - "Explicitly list what we won't do"
```

**Verification Criteria:**
```yaml
pass_if:
  - every_criterion_has_task: true
  - tasks_properly_ordered: true
  - tasks_are_context_sized: true
  - integration_points_covered: true
fail_if:
  - orphan_criteria: true
  - dependency_violations: true
  - oversized_tasks: true
  - missing_integration: true
```

### Phase 3 Checkpoint (Automatic)
```yaml
checkpoint:
  validate:
    - hierarchy_complete: true
    - no_orphan_criteria: true
    - tasks_properly_sized: true

  auto_adjust:
    orphan_criteria: "Add task for each unmapped criterion"
    oversized_task: "Split into smaller tasks"
    missing_integration: "Add integration task"
    dependency_issues: "Reorder tasks"

  then: "Proceed immediately to Phase 4"
```

---

## Phase 4: Adversarial Challenge

### Task: Challenge the Plan

Switch to challenger role and attack the plan:

**Challenge Questions:**
```yaml
completeness_challenges:
  - "What happens if {research task} recommends different approach?"
  - "Is there a task for each acceptance criterion?"
  - "Are all external dependencies accounted for?"
  - "What integration is needed between components?"
  - "How will we know each task is done?"

overengineering_challenges:
  - "Can this task be removed without failing acceptance criteria?"
  - "Is this research task necessary or just cautious?"
  - "Does this abstraction serve multiple uses NOW?"
  - "Are we preparing for requirements not stated?"
  - "Can we do something simpler that still works?"

actionability_challenges:
  - "Can an engineer start this task immediately?"
  - "Are the acceptance criteria specific enough to verify?"
  - "Does each step have a clear outcome?"
  - "Are there hidden prerequisites not listed?"
  - "What decision would block starting this task?"
```

**DO (Positive Instructions):**
- Question every research task's necessity
- Check every implementation task maps to criteria
- Verify no vague or unbounded tasks remain
- Confirm dependencies are correctly ordered
- Look for missing integration points

**DO NOT (Negative Instructions):**
- Accept the plan without challenge
- Add unnecessary caution
- Expand scope during challenge
- Create research for established patterns
- Let vague tasks pass

**Verification Criteria:**
```yaml
pass_if:
  - all_challenges_answered: true
  - no_unnecessary_research: true
  - no_missing_tasks: true
  - no_vague_tasks: true
fail_if:
  - challenge_reveals_gaps: true
  - challenge_reveals_bloat: true
  - vague_tasks_remain: true
```

### Phase 4 Checkpoint (Automatic)
```yaml
checkpoint:
  validate:
    - challenges_addressed: true
    - plan_is_minimal: true
    - plan_is_complete: true

  auto_adjust:
    gaps_found: "Add missing tasks"
    bloat_found: "Remove unnecessary tasks"
    vagueness_found: "Make specific"

  then: "Proceed immediately to Phase 5"
```

---

## Phase 5: Final Validation

### Task: Verify Plan Quality

**Final Checklist:**
```yaml
final_validation:
  completeness:
    - [ ] Every acceptance criterion has a task
    - [ ] Every unknown has a research/spike task
    - [ ] Every integration point has a task
    - [ ] Dependencies are correctly ordered

  minimality:
    - [ ] No tasks for unrequested features
    - [ ] No unnecessary research tasks
    - [ ] No premature abstractions
    - [ ] No future-proofing

  actionability:
    - [ ] Every task has specific acceptance criteria
    - [ ] No vague or unbounded tasks
    - [ ] No hidden prerequisites
    - [ ] Every task can be started immediately (given dependencies)

  sizing:
    - [ ] Every task is context-sized (max 5 files)
    - [ ] Every task has max 7 steps
    - [ ] Research tasks are time-boxed
    - [ ] No task is trivially small
```

**Verification Criteria:**
```yaml
pass_if:
  - checklist_all_checked: true
  - no_violations_remaining: true

fail_if:
  - any_checklist_item_fails: true
  - violations_unresolved: true
```

### Phase 5 Checkpoint (Final)
```yaml
checkpoint:
  validate:
    - all_checks_pass: true

  auto_adjust:
    minor_issues: "Fix and re-validate"

  stop_if:
    major_issues: "Cannot resolve without user input"

  on_success:
    - "Plan is ready for execution"
    - "Research/spike tasks come first"
    - "Implementation follows established order"
```

---

## Plan Output Format

### Complete Plan Template

```yaml
plan:
  title: "One-line description"
  requested: "Exact user request (verbatim)"
  deliverable: "Concrete outcome when done"
  complexity_tier: "minimal|standard|comprehensive|architectural"

  unknowns_resolved:
    - research_title: "What we learned"
    - spike_title: "Decision made"

  tasks:
    research:
      - id: "R1"
        title: "RESEARCH: {question}"
        time_box: "2 hours"
        output: "Decision document"
        blocks: ["I1", "I2"]

    spikes:
      - id: "S1"
        title: "SPIKE: {what to prove}"
        time_box: "4 hours"
        output: "Go/no-go with learning"
        blocks: ["I3"]

    implementation:
      - id: "I1"
        title: "Implement {specific thing}"
        depends_on: ["R1"]
        files: ["path/to/file.ts"]
        acceptance_criteria:
          - "Criterion - how verified"
        steps:
          1: "First specific action"
          2: "Second specific action"

    integration:
      - id: "INT1"
        title: "Connect {A} to {B}"
        depends_on: ["I1", "I2"]
        acceptance_criteria:
          - "A and B work together - verified by test X"

  not_included:
    - "Feature X (not requested)"
    - "Refactoring Y (not requested)"

  execution_order:
    1: "R1 - Research"
    2: "S1 - Spike (parallel with R1 if independent)"
    3: "I1, I2 - Implementation (parallel if independent)"
    4: "INT1 - Integration"
    5: "Final verification"
```

---

## Adversarial Planning Mantras

```yaml
planning_mantras:
  completeness:
    - "Every unknown gets a research task"
    - "Every criterion gets an implementation task"
    - "Every connection gets an integration task"

  minimality:
    - "If it's not requested, delete it"
    - "If it's not unknown, don't research it"
    - "If it's working, don't refactor it"

  actionability:
    - "Vague tasks are rejected tasks"
    - "If you can't start it, it's not ready"
    - "If you can't verify it, it's not defined"

  balance:
    - "Complete enough to succeed, minimal enough to ship"
    - "Research unknowns, not fears"
    - "Plan what you'll do, not what might happen"
```

---

## Integration with Task Execution

After planning completes:

1. **Research tasks execute first** via standard task pipeline
2. **Research outputs inform implementation tasks** - adjust as needed
3. **Spike results may change plan** - that's expected
4. **Implementation follows established order**
5. **Plan adjusts based on discoveries** - this is normal, not failure

```yaml
plan_to_execution:
  handoff:
    - "Create Dart tasks for each plan item"
    - "Set dependencies in Dart"
    - "Add plan context to each task description"
    - "Start execution with first research/spike task"

  adjustment_protocol:
    research_changes_approach: "Update dependent tasks, continue"
    spike_proves_infeasible: "Update plan, try alternative, continue"
    implementation_discovers_issue: "Add research task, continue"
```
