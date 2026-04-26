---
name: task-execution
description: Task execution workflow and quality pipeline for Dart task automation. Dart任務執行工作流與品質管道。 Use when: execute dart task, run quality pipeline, implement task, code review workflow, task automation
context: fork
---

# Task Execution Workflow

此技能提供通過完整品質管道執行Dart任務之工作流。

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

做任何事前，讀`.claude/rules/`中始終加載的規則：

- `karpathy-principles.md` — 目標驅動執行，反推，驗證
- `refactor-discipline.md` — A/B/C重構規則
- `grill-intake.md` — 任務創建門（已在上游應用，此處確認）
- `code-quality.md` — 項目特定代碼品質標準
- `testing.md` — 項目特定測試標準
- `.claude/rules/`中任何其他`.md`文件

這些規則塑造執行者每個決策。技能為薄指針——決策需要細節時，通過`Skill`工具調用引用的技能，而非猜測。

若`.claude/rules/`不存在，警告用戶："Project has not run /dev-standards:setup-project. Task execution will proceed with defaults, but project-specific thresholds will not be respected." 不阻塞——以合理默認值繼續。

### Step 0: Read Domain Model

做任何事前，加載域模型：

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

### Step 1: Read Grilled Task Spec

任務已在計劃時審查。讀取審查規格（在任務描述或提示中提供），確認：

```
1. Acceptance criteria are clear and verifiable
2. Files to modify are identified (max 5)
3. Scope is bounded and context-sized
4. If no grilled spec is present, fetch task details from Dart and apply grill-task inline
```

勿從頭重新發現範圍、文件或驗收標準——該工作已在計劃時完成。

### Step 1.5: Refactor-First Assessment

編寫新代碼前，若計劃時尚未完成，以審查任務規格調用`dev-standards:refactor-first-assessment`。

```
1. Read the current contents of files listed in the grilled spec
2. Invoke `dev-standards:refactor-first-assessment`
3. If the skill returns refactor steps, execute them before the first RED test:
   - Move code to the right module/file
   - Rename things that don't reflect what they do
   - Extract shared logic that the new code will also need
   - Ensure existing tests cover the refactored code
4. Verify ALL existing tests still pass after refactoring
5. Commit: 'REFACTOR: Prepare [area] for [change]'
```

關鍵規則：若新代碼感覺在與現有結構搏鬥，先改結構。永不在壞結構上打補丁——先修結構，再加功能。

### Step 2: Implement Changes (Strict TDD)

每個行為遵循RED→GREEN→REFACTOR：

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

審查自身改動：

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

運行項目linter：

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

運行測試套件：

```
1. Run unit tests for changed files
2. Run integration tests if applicable
3. Check test coverage hasn't decreased
4. All tests must pass to continue
```

### Step 6: LCI Evaluation

使用Lightning Code Index進行品質檢查：

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

確保改動整潔：

```
1. No commented-out code
2. No debug statements (console.log, print, etc.)
3. No TODO comments for completed work
4. Consistent formatting
5. Proper imports/exports
```

### Step 8: Deprecated Cleanup

移除過時代碼：

```
1. Search for @deprecated annotations
2. Find unused functions/variables
3. Remove dead code paths
4. Clean up obsolete tests
5. Update imports after removal
```

### Step 8.5: Domain Check

驗證域語言一致性：

```
1. Run domain-check skill on changed files (if domain model exists)
2. Fix any high-severity issues (rejected synonyms in code)
3. Run domain-update for any new concepts introduced
4. If bug fix revealed conceptual misunderstanding:
   - Add entry to Conceptual Mismatches Log in DOMAIN.md
```

### Step 9: Final Validation

確認一切就緒：

```
1. All pipeline steps passed
2. Changes match task requirements
3. Documentation is updated
4. No regression introduced
5. Domain model reflects any new concepts (DOMAIN.md updated)
6. Ready for commit/merge
```

## Memory Write Protocol (loop iterations)

任務執行期間若寫入 memory（包括 `~/.claude/projects/<project>/memory/*.md`、Dart task memory comments、或 `.dartai/loop-state.json` 之 task entries），每條 entry 必須帶兩個欄位：

```yaml
memory_entry_required_fields:
  timestamp:
    format: "ISO 8601 with timezone (e.g. 2026-04-26T14:30:00-05:00)"
    semantics: "When this memory was written"
    rationale: "Enables temporal ordering and stale-detection"

  source_event:
    shape:
      loop_id: "<parent loop dart task-id>"
      task_id: "<task being executed when memory was written>"
      conversation_id: "<session id if available, else null>"
    semantics: "Why-from-where this memory was written"
    rationale: |
      Pairs each memory with the orchestration event that produced it,
      so future readers can trace a memory back to its triggering task.
```

Cite: dev-standards `memories-require-timestamp-and-source` rule (commit 9ab9c47) — this is the canonical project rule. This subsection is a thin pointer; consult the rule for full enforcement details and exception handling.

```yaml
memory_write_examples:
  loop_state_task_entry:
    # In .dartai/loop-state.json under tasks[]
    {
      "task_id": "abc123",
      "started_at": "2026-04-26T14:30:00-05:00",  # timestamp ✓
      "source_event": {                             # source_event ✓
        "loop_id": "loop-task-id",
        "task_id": "abc123",
        "conversation_id": "session-xyz"
      },
      "...other fields..."
    }

  dart_memory_comment:
    # When add_task_comment writes a memory-class comment
    text: |
      ## Memory: Pattern observed
      **Timestamp:** 2026-04-26T14:30:00-05:00
      **Source:** loop=<loop-id> task=<task-id> session=<session-id>

      <memory body>

  project_memory_file:
    # When writing ~/.claude/projects/<slug>/memory/<id>.md
    frontmatter:
      ---
      timestamp: "2026-04-26T14:30:00-05:00"
      source_event:
        loop_id: "<loop task-id>"
        task_id: "<task-id>"
        conversation_id: "<session-id or null>"
      ---
      <memory body>
```

**Soft-deprecation 軟棄用**：legacy memory entries lacking these fields remain readable. Audit tools may flag them but must not crash. New writes during loop iterations MUST include both fields.

**Why this matters**: without timestamp+source_event, memories accumulate as un-attributed claims that future agents cannot audit, leading to the rationalization-trap class (silent contradiction) flagged in commit 4526ba5. The provenance pair is the cheapest possible defense.

## Failure Handling

任何步驟失敗時：

1. **Log the failure** with specific error message
2. **Update task in Dart** with failure details
3. **Stop the pipeline** - do not continue
4. **Report to user** with:
   - Which step failed
   - Specific error
   - Suggested fix
   - Files affected

## Success Handling

管道完成時：

1. **Update task status** to "Done"
2. **Add completion comment** to Dart task
3. **Update documentation** (CHANGELOG, etc.)
4. **Report success** with summary
5. **Continue to next task** (if in loop)

**Note:** Git commit and push are handled by the main loop, not the subagent. The subagent should leave changes staged/unstaged for the main loop to commit.

## Quality Gates

每步驟有通過/失敗標準：

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
