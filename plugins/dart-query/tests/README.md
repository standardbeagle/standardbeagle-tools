# dart-query Plugin Integration Test Results

**Date:** 2026-04-10
**Server:** dart-query v0.10.3 via slop-mcp
**Workspace:** Standard Beagle production

## Summary

| Skill | Pass | Fail | Skip | Total |
|-------|------|------|------|-------|
| discovery | 6 | 4 | 0 | 10 |
| task-crud | 6 | 3 | 0 | 10* |
| querying | 9 | 3 | 0 | 12 |
| batch-ops | 7 | 3 | 0 | 10 |
| workspace | 3 | 9 | 3 | 15 |
| **Total** | **31** | **22** | **3** | **57** |

*1 partial result counted as pass

## Issues by Category

### Documentation Errors (fixed in this branch)

1. **Status names are workspace-specific** — examples used generic names like "Todo", "In Progress" that don't exist in all workspaces. Added notes that status names come from `get_config`.
2. **Priority type inconsistency** — `create_task` API wants strings ("critical", "high"), `update_task` validator wants integers 1-5. Documented the discrepancy.
3. **`info` group names** — documented `"tasks"` but server uses `"task-crud"`, `"task-query"`, `"task-batch"`.
4. **`info` tool-level docs** — only available for: info, get_config, execute_dartql, batch_update_tasks, import_tasks_csv, relationships.
5. **`get_config` response format** — returns flat strings, not `{dart_id, name}` objects.
6. **`search_tasks` without dartboard** — server returns 500. Must always scope with dartboard.

### Server Bugs (to fix in dart-query repo)

1. **`get_folder`** — broken; rejects valid folder names, returns empty suggestions
2. **`add_task_comment`** — returns 404 for valid tasks
3. **`update_task` comment parameter** — silently ignored (`comment_added: false`)
4. **`update_task` priority** — local validator requires int 1-5 but API requires strings
5. **`create_doc`** — doesn't wrap title/text in `item` object for API
6. **`add_time_tracking`** — missing required `user` field, `finishedAt` required even with `duration_minutes`
7. **`attach_url`** — `filename` not translated to API's `name` field
8. **`move_task`** — `after_id`/`order` not translated to API field names
9. **`execute_dartql`** — crashes on `assignee IS NULL` filter
10. **`get_dartboard`** — response missing `task_count` field

## Test Result Files

- [discovery-test-results.md](discovery-test-results.md)
- [task-crud-test-results.md](task-crud-test-results.md)
- [querying-test-results.md](querying-test-results.md)
- [batch-ops-test-results.md](batch-ops-test-results.md)
- [workspace-test-results.md](workspace-test-results.md)
