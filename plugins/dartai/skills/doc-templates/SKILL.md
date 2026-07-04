---
name: dartai-doc-templates
description: "Documentation templates and formats for updating project docs and Dart comments. 任務完成後更新項目文檔與Dart評論之模板格式。 Use when: update changelog, write dart comment, document task completion, readme update, commit message format"
---

# Documentation Templates

任務完成後更新文檔之模板。

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

- 以動詞開頭（Add, Fix, Update, Remove）
- 簡潔但具描述性
- 包含任務引用
- 按類別分組
- 類別內按重要性排序

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

以下情況更新README：
- 改變使用方式的新功能
- 新依賴或需求
- 安裝流程更改
- 新配置選項
- 新命令或API

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

修改現有章節時：
1. 保留現有結構
2. 內聯添加新信息
3. 若API更改則更新示例
4. 與README其餘部分保持一致

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

Longer description if needed, focused on WHY:
- Why the change was made (motivation, problem, trade-offs)
- Any breaking changes
- What changed only when the diff doesn't make it obvious

Related: #issue-number (if applicable)
```

### Types

- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 僅文檔
- `refactor`: 代碼重構
- `test`: 添加/更新測試
- `chore`: 維護任務

### Examples

```
[DART-QiXCNniu7OQY] feat: add color contrast checking

Implemented WCAG contrast ratio calculations for the Color MCP.
- Supports 4.5:1 and 3:1 thresholds
- Returns pass/fail for AA and AAA levels
- Includes suggested color adjustments
```
