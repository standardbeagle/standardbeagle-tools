---
name: code-quality
description: Code quality standards and review checklist for task execution
---

# Code Quality Standards

Standards and checklists for ensuring code quality during task execution.

## Code Review Checklist

### Correctness

- [ ] Code implements the task requirements correctly
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No logic errors or bugs introduced
- [ ] Works with existing functionality

### Readability

- [ ] Code is self-documenting (clear names)
- [ ] Complex logic has comments explaining "why"
- [ ] Functions are focused and single-purpose
- [ ] No deeply nested conditionals
- [ ] Consistent formatting

### Maintainability

- [ ] No code duplication (DRY)
- [ ] Uses existing utilities/patterns
- [ ] Easy to extend in the future
- [ ] No magic numbers/strings
- [ ] Proper abstraction level

### Performance

- [ ] No obvious performance issues
- [ ] Efficient algorithms for the use case
- [ ] No unnecessary computations
- [ ] Proper resource cleanup
- [ ] Reasonable memory usage

### Security

- [ ] No hardcoded secrets
- [ ] Input validation where needed
- [ ] Proper authentication/authorization
- [ ] No SQL injection or XSS vulnerabilities
- [ ] Secure dependencies

## Linting Rules by Language

### JavaScript/TypeScript

```bash
# Run ESLint
npx eslint . --ext .js,.jsx,.ts,.tsx

# Run Prettier check
npx prettier --check .

# Fix automatically
npx eslint . --fix && npx prettier --write .
```

Key rules:
- No unused variables
- No console statements
- Consistent quotes
- Proper async/await usage
- No any types (TypeScript)

### Go

```bash
# Run golangci-lint
golangci-lint run ./...

# Run go vet
go vet ./...

# Format code
gofmt -w .
```

Key rules:
- No unused imports
- Error handling checked
- Proper defer usage
- No race conditions
- Idiomatic Go patterns

### Python

```bash
# Run ruff
ruff check .

# Run black
black --check .

# Fix automatically
ruff check --fix . && black .
```

Key rules:
- PEP 8 compliance
- Type hints encouraged
- No unused imports
- Proper exception handling
- Docstrings for public functions

## Test Coverage Standards

### Minimum Coverage

| Type | Target |
|------|--------|
| Unit tests | 80% line coverage |
| Integration tests | Critical paths covered |
| Edge cases | All identified edge cases |

### Test Quality

- Tests are independent
- Tests are deterministic
- Tests are fast
- Tests have clear assertions
- Tests cover happy path and error cases

### Running Tests

```bash
# JavaScript
npm test -- --coverage

# Go
go test -cover ./...

# Python
pytest --cov=.
```

## LCI Quality Patterns

### What to Check

```
Use mcp__plugin_lci_lci__search to find:
- Similar function names (avoid duplication)
- Related symbols (ensure consistency)
- Patterns in codebase (follow conventions)
```

### Red Flags

- Multiple functions doing the same thing
- Inconsistent naming (getUserById vs fetchUser)
- Reimplementing utility functions
- Different error handling patterns
- Mixed coding styles

## Deprecated Code Cleanup

### Finding Deprecated Code

```
Search for:
- @deprecated annotations
- TODO: remove comments
- Unused exports
- Dead code paths
- Old API usage
```

### Cleanup Process

1. Verify code is truly unused (LCI search)
2. Remove deprecated functions/classes
3. Update imports/exports
4. Remove related tests if applicable
5. Update documentation

### What NOT to Remove

- Public API still in use externally
- Feature flags that may be re-enabled
- Code with pending deprecation timeline
- Backward compatibility shims

## Quality Metrics

### Per-Task Metrics

Track for each task:
- Lines added/removed
- Test coverage change
- Linting issues fixed
- Deprecated code removed
- Time to complete

### Aggregate Metrics

Track across tasks:
- Average task completion time
- Pipeline pass rate
- Common failure points
- Code quality trends
