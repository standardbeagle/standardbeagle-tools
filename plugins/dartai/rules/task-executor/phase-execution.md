# Task Executor Phase Execution Rules

## Phase 1: Understand Task

**Update tag:** `loop-phase:understanding`

### Task: Analyze Task Scope

**DO:**
- Fetch full task details using dart-query `get_task` through slop-mcp (`mcp__plugin_slop-mcp_slop-mcp__execute_tool`)
- Read the task description completely
- List explicit acceptance criteria
- Identify ALL files that will be modified (~5 typical; judge by context cost, not raw count)
- Note implicit requirements from context

**DO NOT:**
- Assume requirements not stated
- Skip reading related code
- Ignore test file requirements
- Overlook documentation needs
- Start coding before understanding

**Verification Criteria:**
```yaml
pass_if:
  acceptance_criteria_listed: true
  files_identified: "context-sized (~5 typical; judge by context cost, not count)"
  scope_understood: true
fail_if:
  scope_unclear: true
  acceptance_criteria_missing: true
  scope_would_bloat_context: true
```

### Plan Adjustment Point 1
理解後：
- 範圍會撐爆上下文（大文件/大 diff/文件散亂；~5 文件為粗略提示，非硬限）：請求拆分，停止
- 需求不明：在任務評論添加澄清
- 發現依賴：記錄排序
- 就緒：進入Phase 2

---

## Phase 2: Implement Changes

### Task: Implement with Defensive Coding

**DO:**
- Implement minimum necessary changes
- Add error handling for all edge cases
- Write self-documenting code
- Follow existing patterns (use LCI to find them)
- Add inline comments for complex logic only

**DO NOT:**
- Add features not in requirements
- Refactor unrelated code
- Use magic numbers or strings
- Skip error handling
- Create technical debt knowingly
- Add console.log or debug statements

**Verification Criteria:**
```yaml
pass_if:
  compiles_without_error: true
  no_new_lint_errors: true
  follows_existing_patterns: true
  changes_match_requirements: true
fail_if:
  introduces_bugs: true
  breaks_existing_tests: true
  scope_creep: true
```

### Task: Self-Adversarial Review

攻擊自身實現：

**DO:**
- Try to break with edge case inputs
- Search for similar code that might conflict
- Verify error messages are helpful
- Check for resource leaks
- Test null/empty/large inputs mentally

**DO NOT:**
- Assume happy path is sufficient
- Skip testing error paths
- Ignore potential race conditions
- Overlook security implications
- Trust external input

**Verification Criteria:**
```yaml
pass_if:
  edge_cases_considered: true
  error_paths_verified: true
  no_obvious_vulnerabilities: true
fail_if:
  untested_edge_cases: true
  unchecked_errors: true
  security_concerns: true
```

### Plan Adjustment Point 2
實現後：
- 邊缘案例揭示問題：繼續前修復
- 模式衝突：記錄至重構積壓
- 安全顧慮：添加安全審查任務
- 干淨實現：進入Phase 3

---

## Phase 3: Code Review (Self)

### Task: Review All Changes

**DO:**
- Review all changes you made
- Use `mcp__plugin_lci_lci__search` to find similar patterns
- Check naming consistency with codebase
- Verify proper error handling
- Confirm edge cases covered

**DO NOT:**
- Skip comparing with existing patterns
- Accept code at face value
- Ignore minor inconsistencies
- Assume tests will catch issues
- Leave TODO comments unresolved

**Verification Criteria:**
```yaml
pass_if:
  no_duplicate_code: true
  consistent_naming: true
  proper_error_handling: true
  edge_cases_handled: true
fail_if:
  duplicates_existing_code: true
  inconsistent_patterns: true
  missing_error_handling: true
```

### Plan Adjustment Point 3
審查後：
- 發現重複：重構使用現有代碼
- 不一致：繼續前修復
- 發現問題：添加修復任務
- 審查干淨：進入Phase 4

---

## Phase 4: Linting

### Task: Run Project Linter

**DO:**
- Detect project type (package.json, go.mod, etc.)
- Run appropriate linter with strict settings
- Fix ALL lint errors
- Review warnings (fix if reasonable)

**DO NOT:**
- Ignore any errors
- Disable lint rules
- Leave warnings without review
- Skip formatting check

**Linter Commands:**
```yaml
javascript_typescript:
  lint: "npx eslint . --ext .js,.jsx,.ts,.tsx"
  format: "npx prettier --check ."
  fix: "npx eslint . --fix && npx prettier --write ."

go:
  lint: "golangci-lint run ./..."
  vet: "go vet ./..."
  format: "gofmt -w ."

python:
  lint: "ruff check ."
  format: "black --check ."
  fix: "ruff check --fix . && black ."
```

**Verification Criteria:**
```yaml
pass_if:
  zero_lint_errors: true
  warnings_reviewed: true
  formatting_correct: true
fail_if:
  any_lint_errors: true
  critical_warnings: true
```

### Plan Adjustment Point 4
Lint後：
- 發現錯誤：繼續前修復全部
- 重複模式：添加至代碼質量備注
- 全部干淨：進入Phase 5

---

## Phase 5: Testing

### Task: Run Test Suite

**DO:**
- Run full project test suite
- Run tests related to changed files
- Check test coverage didn't decrease
- Review any new test failures carefully

**DO NOT:**
- Skip running tests
- Ignore failing tests
- Accept coverage decrease
- Blame pre-existing failures without investigation

**Test Commands:**
```yaml
javascript_typescript:
  run: "npm test"
  coverage: "npm test -- --coverage"

go:
  run: "go test ./..."
  coverage: "go test -cover ./..."

python:
  run: "pytest"
  coverage: "pytest --cov=."
```

**Verification Criteria:**
```yaml
pass_if:
  all_tests_pass: true
  coverage_maintained: true
  no_flaky_tests_introduced: true
fail_if:
  any_test_fails: true
  coverage_dropped: "> 2%"
```

### Plan Adjustment Point 5
測試後：
- 測試失敗：修復並重新運行
- 覆蓋率下降：添加測試覆蓋未覆蓋代碼
- 不穩定測試：標記待調查
- 全部綠色：進入Phase 6

---

## Phase 6: LCI Evaluation

### Task: Verify Code Quality with LCI

**DO:**
- Search for duplicate code created
- Verify naming consistency
- Check proper use of existing utilities
- Get context for related symbols

**DO NOT:**
- Skip duplicate check
- Assume naming is fine
- Reinvent existing utilities
- Ignore related code

**LCI Queries:**
```yaml
queries:
  - action: "Search for function name"
    tool: "mcp__plugin_lci_lci__search"
    verify: "No unintended duplicates"

  - action: "Get context for changed files"
    tool: "mcp__plugin_lci_lci__get_context"
    verify: "Changes fit in codebase"
```

**Verification Criteria:**
```yaml
pass_if:
  no_duplicate_functions: true
  consistent_with_codebase: true
  uses_existing_utilities: true
fail_if:
  duplicates_created: true
  inconsistent_patterns: true
  reinvented_wheel: true
```

---

## Phase 7: Refactor Check

### Task: Ensure Code is Clean

**DO:**
- Remove commented-out code
- Remove debug statements
- Resolve TODO comments for this task
- Verify consistent formatting
- Clean up imports

**DO NOT:**
- Leave commented code
- Leave console.log/print/debugger
- Leave unresolved TODOs
- Skip import cleanup
- Leave unused variables

**Verification Criteria:**
```yaml
pass_if:
  no_commented_code: true
  no_debug_statements: true
  no_task_todos: true
  clean_imports: true
fail_if:
  commented_code_present: true
  debug_statements_present: true
  unresolved_todos: true
```

---

## Phase 8: Deprecated Cleanup

### Task: Remove Obsolete Code

**DO:**
- Search for @deprecated made obsolete by this task
- Find unused functions/variables
- Remove dead code paths
- Update imports after removal

**DO NOT:**
- Remove still-used code
- Skip updating imports
- Leave partial deprecations
- Remove without verifying unused

**Verification Criteria:**
```yaml
pass_if:
  obsolete_code_removed: true
  imports_updated: true
  no_dead_code: true
fail_if:
  deprecated_code_remains: true
  broken_imports: true
```

---

## Phase 9: Final Validation

### Task: Verify All Acceptance Criteria

**DO:**
- Re-read original task description
- Verify EACH acceptance criterion explicitly
- Run linting again
- Run tests again
- Confirm no scope creep

**DO NOT:**
- Mark done without verification
- Skip re-running checks
- Accept "probably works"
- Leave anything incomplete

**Final Verification:**
```yaml
acceptance_check:
  - criterion_1: "How verified"
  - criterion_2: "How verified"
  - criterion_N: "How verified"

quality_check:
  linting: "pass"
  testing: "pass"
  coverage: "maintained"
  documentation: "updated if needed"
```
