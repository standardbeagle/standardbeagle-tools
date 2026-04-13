---
name: task-execution
description: Task execution workflow and quality pipeline for Dart task automation
---

# Task Execution Workflow

This skill provides the workflow for executing Dart tasks through a comprehensive quality pipeline.

## Execution Pipeline

### Overview

```
Task Start
    ↓
0. Read Domain Model
    ↓
1. Understand Task
    ↓
1.5. Refactor to Support Changes
    ↓
2. Implement Changes
    ↓
3. Code Review (Self)
    ↓
4. Linting
    ↓
5. Testing
    ↓
6. LCI Evaluation (+ Findability)
    ↓
7. Refactor Check
    ↓
8. Deprecated Cleanup
    ↓
9. Final Validation
    ↓
Task Complete / Failed
```

### Step -1: Read Project Rules

Before doing anything else, read the always-loaded rules in `.claude/rules/`:

- `karpathy-principles.md` — goal-driven execution, push back, verify
- `refactor-discipline.md` — A/B/C refactor rule
- `grill-intake.md` — task creation gate (already applied upstream, confirm here)
- `code-quality.md` — project-specific code quality standards
- `testing.md` — project-specific testing standards
- Any other `.md` files in `.claude/rules/`

These rules shape every decision the executor makes. They are thin pointers to skills — when a decision needs detail, invoke the referenced skill via `Skill` tool rather than guessing.

If `.claude/rules/` does not exist, warn the user: "Project has not run /dev-standards:setup-project. Task execution will proceed with defaults, but project-specific thresholds will not be respected." Do not block — proceed with sensible defaults.

### Step 0: Read Domain Model

Before anything else, load the domain model:

```
1. Check for docs/DOMAIN.md — read it if present
2. Check for docs/domain/*.md — read all context files if present
3. If neither exists: proceed without domain model (note absence)
4. Extract:
   - Canonical term list and synonyms to reject
   - Aggregate names for this feature area
   - Any relevant invariants or event names
5. If this task introduces a new concept NOT in the domain model:
   - Run domain-update skill BEFORE writing any code
   - The domain name is the code name — no exceptions
6. If this task is a bug fix and the bug reveals a conceptual
   misunderstanding: flag for domain-update after the fix
```

### Step 1: Understand Task

Read and analyze the task:

```
1. Fetch full task details from Dart
2. Parse description for:
   - Acceptance criteria
   - Technical requirements
   - Related files/components
3. Identify scope:
   - New feature
   - Bug fix
   - Refactoring
   - Documentation
4. Create mental model of changes needed using domain terminology
```

### Step 1.5: Refactor to Support Changes

Before writing any new code, ensure the codebase is ready to accept the change naturally:

```
1. Use LCI to find all code related to the change area
2. Identify friction points:
   - Would the new code feel like a hack or a natural extension?
   - Are there abstractions that need to exist first?
   - Are there naming inconsistencies to fix?
   - Is existing code in the right place to be extended?
3. Refactor to create the natural extension point:
   - Move code to the right module/file
   - Rename things that don't reflect what they do
   - Extract shared logic that the new code will also need
   - Ensure existing tests cover the refactored code
4. Verify ALL existing tests still pass after refactoring
5. Commit: 'REFACTOR: Prepare [area] for [change]'

Key rule: If the new code would feel like it's fighting the existing
structure, the structure needs to change first. Never patch over bad
structure — fix the structure, then add the feature.
```

### Step 2: Implement Changes (Strict TDD)

Follow RED→GREEN→REFACTOR for every behavior:

```
RED PHASE:
1. Write ONE test for the smallest behavior increment
2. Run test - it MUST FAIL (RED)
3. If test passes, the test is wrong - fix or delete it
4. Commit: 'RED: Test for [behavior]'

GREEN PHASE:
5. Write MINIMUM code to make the RED test pass
6. No code without a failing test first
7. No 'preparing' the implementation
8. Commit: 'GREEN: [behavior] implemented'

REFACTOR PHASE:
9. Clean up code while tests stay GREEN
10. If tests go RED, undo immediately
11. Commit: 'REFACTOR: [what changed]'

VERTICAL SLICES:
12. Implement full feature vertically, not horizontal layers
13. Good: User can create post (validation + DB + API + response)
14. Bad: Build all DB models, then all APIs, then UI

DOCUMENTATION:
15. Update related documentation
16. Save all changes (main loop handles git commit/push)
```

### Step 3: Code Review (Self)

Review own changes:

```
1. Use LCI to search for similar patterns
2. Check for:
   - Code duplication
   - Naming consistency
   - Error handling
   - Edge cases
3. Verify changes match task requirements
4. Look for unintended side effects
```

### Step 4: Linting

Run project linter:

```
Detect project type and run appropriate linter:
- JavaScript/TypeScript: eslint, prettier
- Go: golangci-lint, go vet
- Python: ruff, black, flake8
- Rust: clippy, rustfmt

Fix all errors before proceeding.
Warnings should be reviewed but may proceed.
```

### Step 5: Testing

Run test suite:

```
1. Run unit tests for changed files
2. Run integration tests if applicable
3. Check test coverage hasn't decreased
4. All tests must pass to continue
```

### Step 6: LCI Evaluation

Use Lightning Code Index for quality check:

```
1. Search for:
   - Duplicate code patterns
   - Similar function names
   - Related symbols
2. Verify:
   - Consistent naming with codebase
   - Proper use of existing utilities
   - No reinventing existing functionality

3. Findability check — new code must be discoverable:
   - Function/type names reflect what they do (not how)
   - Names are searchable — avoid abbreviations or acronyms
     that aren't already established in the codebase
   - Public API symbols are named to be found at the call site
     (e.g. createUser, not make_u, not userFactory)
   - Related code is co-located — don't scatter a feature across
     unrelated files
   - Verify with LCI: can you find this code by searching for
     what it does?
```

### Step 7: Refactor Check

Ensure changes are clean:

```
1. No commented-out code
2. No debug statements (console.log, print, etc.)
3. No TODO comments for completed work
4. Consistent formatting
5. Proper imports/exports
```

### Step 8: Deprecated Cleanup

Remove obsolete code:

```
1. Search for @deprecated annotations
2. Find unused functions/variables
3. Remove dead code paths
4. Clean up obsolete tests
5. Update imports after removal
```

### Step 8.5: Domain Check

Verify domain language consistency:

```
1. Run domain-check skill on changed files (if domain model exists)
2. Fix any high-severity issues (rejected synonyms in code)
3. Run domain-update for any new concepts introduced
4. If bug fix revealed conceptual misunderstanding:
   - Add entry to Conceptual Mismatches Log in DOMAIN.md
```

### Step 9: Final Validation

Confirm everything is ready:

```
1. All pipeline steps passed
2. Changes match task requirements
3. Documentation is updated
4. No regression introduced
5. Domain model reflects any new concepts (DOMAIN.md updated)
6. Ready for commit/merge
```

## Failure Handling

If any step fails:

1. **Log the failure** with specific error message
2. **Update task in Dart** with failure details
3. **Stop the pipeline** - do not continue
4. **Report to user** with:
   - Which step failed
   - Specific error
   - Suggested fix
   - Files affected

## Success Handling

When pipeline completes:

1. **Update task status** to "Done"
2. **Add completion comment** to Dart task
3. **Update documentation** (CHANGELOG, etc.)
4. **Report success** with summary
5. **Continue to next task** (if in loop)

**Note:** Git commit and push are handled by the main loop, not the subagent. The subagent should leave changes staged/unstaged for the main loop to commit.

## Quality Gates

Each step has pass/fail criteria:

| Step | Pass Criteria |
|------|---------------|
| Domain Model | New concepts named in DOMAIN.md before coding |
| Understand | Task is clear and actionable |
| Refactor First | Extension point exists naturally, existing tests pass |
| Implement | Changes compile/run without error |
| Review | No major issues found |
| Linting | Zero errors (warnings allowed) |
| Testing | All tests pass, coverage maintained |
| LCI | No duplicate code, consistent patterns, new code is findable |
| Domain Check | No rejected synonyms, new concepts in DOMAIN.md |
| Refactor | Clean code, no debug artifacts |
| Cleanup | No deprecated code remains |
| Validate | All criteria met, domain model updated, task complete |
