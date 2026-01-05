---
name: doc-templates
description: Documentation templates and formats for updating project docs and Dart comments
---

# Documentation Templates

Templates for updating documentation after task completion.

## CHANGELOG Entry

### Format

```markdown
## [Version] - YYYY-MM-DD

### Added
- New feature description ([DART-taskId])

### Changed
- Enhancement description ([DART-taskId])

### Fixed
- Bug fix description ([DART-taskId])

### Removed
- Removed feature description ([DART-taskId])

### Deprecated
- Deprecated feature description ([DART-taskId])
```

### Entry Guidelines

- Start with verb (Add, Fix, Update, Remove)
- Be concise but descriptive
- Include task reference
- Group by category
- Order by importance within category

### Examples

```markdown
### Added
- Add Color MCP Server with contrast checking and palette generation ([DART-QiXCNniu7OQY])

### Fixed
- Fix login timeout on slow connections ([DART-abc123xyz])

### Changed
- Update user profile API to return avatar URL ([DART-def456])
```

## README Updates

### When to Update

Update README for:
- New features that change usage
- New dependencies or requirements
- Changed installation process
- New configuration options
- New commands or API

### Section Templates

#### New Feature Section

```markdown
## [Feature Name]

[Brief description of what it does]

### Usage

\`\`\`bash
[example command or code]
\`\`\`

### Configuration

| Option | Default | Description |
|--------|---------|-------------|
| option1 | value | Description |

### Example

[Working example with expected output]
```

#### Updated Section

When modifying existing sections:
1. Keep existing structure
2. Add new information inline
3. Update examples if API changed
4. Maintain consistency with rest of README

## Dart Task Comments

### Completion Comment Template

```markdown
## Task Completed

**Summary**: [One sentence describing what was done]

**Changes Made**:
- [file1.ts]: [description of changes]
- [file2.ts]: [description of changes]

**Testing**:
- Unit tests: [X passed, 0 failed]
- Coverage: [X%]

**Documentation**:
- Updated CHANGELOG.md
- [Any other doc updates]

**Notes**:
[Any additional context, decisions made, or follow-up needed]
```

### Failure Comment Template

```markdown
## Task Blocked

**Issue**: [Brief description of the problem]

**Pipeline Step Failed**: [Which step failed]

**Error Details**:
\`\`\`
[Error message or output]
\`\`\`

**Attempted Solutions**:
1. [What was tried]
2. [What was tried]

**Recommended Next Steps**:
1. [Suggestion for resolution]
2. [Alternative approach]

**Files Affected**:
- [file1.ts]: [state of changes]
```

### Progress Comment Template

```markdown
## Progress Update

**Status**: In Progress

**Completed**:
- [x] [Completed item]
- [x] [Completed item]

**In Progress**:
- [ ] [Current work]

**Remaining**:
- [ ] [Todo item]
- [ ] [Todo item]

**Blockers**: [None / Description of blocker]

**ETA**: [Estimate if applicable]
```

## API Documentation

### Function Documentation

```typescript
/**
 * Brief description of what the function does.
 *
 * @param param1 - Description of parameter
 * @param param2 - Description of parameter
 * @returns Description of return value
 * @throws Description of possible errors
 *
 * @example
 * ```typescript
 * const result = functionName(arg1, arg2);
 * ```
 */
```

### Module Documentation

```typescript
/**
 * @module ModuleName
 *
 * Brief description of module purpose.
 *
 * ## Usage
 *
 * ```typescript
 * import { Feature } from './module';
 * ```
 *
 * ## Features
 *
 * - Feature 1
 * - Feature 2
 */
```

## Commit Message Format

### Standard Format

```
[DART-taskId] type: brief description

Longer description if needed, explaining:
- What was changed
- Why it was changed
- Any breaking changes

Related: #issue-number (if applicable)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples

```
[DART-QiXCNniu7OQY] feat: add color contrast checking

Implemented WCAG contrast ratio calculations for the Color MCP.
- Supports 4.5:1 and 3:1 thresholds
- Returns pass/fail for AA and AAA levels
- Includes suggested color adjustments
```
