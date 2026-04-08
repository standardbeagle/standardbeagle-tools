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

## Findability Standards

Code must be discoverable by future developers (and LCI) without knowing it exists.

### Naming Rules

- **Names describe behavior, not implementation** — `parseUserInput` not `runRegex`
- **No unexplained abbreviations** — use names already established in the codebase; if new, spell it out
- **Public API names work at the call site** — the name makes sense where it's called, not just where it's defined
- **Avoid generic names** — `handler`, `process`, `helper`, `util` tell nothing; name the domain

### Co-location Rules

- **Feature code lives together** — don't scatter a feature's logic across unrelated files
- **New concepts go where their domain lives** — user authentication code belongs in the auth module, not in utils
- **If no obvious home exists, that's a sign to refactor first** — create the right home before adding the code

### LCI Searchability Test

After implementing, verify:
```
1. Search LCI for what the code DOES (not what it's called)
   - Example: search "filter users by role" → should find the function
2. Search LCI for the domain concept
   - Example: search "authentication" → should find all auth code
3. If the code can't be found by feature-level search, rename or relocate it
```

### Structure Requirements

- **Refactor before adding** — if adding new code to a file makes it incoherent, split the file first
- **Keep modules focused** — a module that does too many things hides everything in it
- **Export only what's needed** — unexported internal helpers don't need findable names

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
