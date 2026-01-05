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
1. Understand Task
    ↓
2. Implement Changes
    ↓
3. Code Review (Self)
    ↓
4. Linting
    ↓
5. Testing
    ↓
6. LCI Evaluation
    ↓
7. Refactor Check
    ↓
8. Deprecated Cleanup
    ↓
9. Final Validation
    ↓
Task Complete / Failed
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
4. Create mental model of changes needed
```

### Step 2: Implement Changes

Make the necessary code changes:

```
1. Identify files to modify
2. Make changes following project patterns
3. Add/update tests for changes
4. Update related documentation
5. Commit with task reference: "[DART-taskId] Description"
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

### Step 9: Final Validation

Confirm everything is ready:

```
1. All pipeline steps passed
2. Changes match task requirements
3. Documentation is updated
4. No regression introduced
5. Ready for commit/merge
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

## Quality Gates

Each step has pass/fail criteria:

| Step | Pass Criteria |
|------|---------------|
| Understand | Task is clear and actionable |
| Implement | Changes compile/run without error |
| Review | No major issues found |
| Linting | Zero errors (warnings allowed) |
| Testing | All tests pass, coverage maintained |
| LCI | No duplicate code, consistent patterns |
| Refactor | Clean code, no debug artifacts |
| Cleanup | No deprecated code remains |
| Validate | All criteria met, task complete |
