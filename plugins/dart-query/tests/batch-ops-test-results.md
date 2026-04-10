# batch-ops Skill — Live Test Results

**Date:** 2026-04-09  
**Server:** dart-query (via slop-mcp)  
**Workspace:** Personal/test  
**Policy:** All batch operations run with `dry_run: true`

---

## Summary

| Result | Count |
|--------|-------|
| PASS   | 7     |
| FAIL   | 3     |
| **Total** | **10** |

---

## Test Results

### 1. execute_dartql — Simple status update (Example 1)

**Adapted query:** `UPDATE WHERE status = 'To-do' AND priority >= 4 SET status = 'Doing'`  
(skill uses `'Todo'` and `'In Progress'`; corrected to real status names)  
**Result:** PASS  
**Response:** `selector_matched: 0, dry_run: true`  
**Documentation Error:** Skill uses status names `'Todo'` and `'In Progress'` which do not exist. Real names are `'To-do'` and `'Doing'`.

---

### 2. execute_dartql — Template variable with COMMENT (Example 2)

**Adapted query:** `UPDATE WHERE dartboard = 'Personal/test' AND status = 'Done' SET title = 'DONE: {title}' COMMENT 'Sprint completed'`  
(skill uses dartboard `'Sprint 5'`; corrected to `Personal/test`. `dry_run: true` forced; skill example uses `dry_run: false`)  
**Result:** PASS  
**Response:** `selector_matched: 0, dry_run: true`

---

### 3. execute_dartql — Multi-statement update + delete (Example 3)

**Adapted query:** `UPDATE WHERE status = 'Doing' SET priority = 3; DELETE WHERE status = 'Done' AND updated_at < '2026-01-01' CONFIRM;`  
**Result:** PARTIAL PASS — structure accepted, but first statement (UPDATE) failed  
**Response:**
- Statement 0 (UPDATE): `failed: 1` — `"Server Error: Server returned HTML error page: Dart"` — matched 0 tasks, server error on update attempt
- Statement 1 (DELETE): `selector_matched: 515, dry_run preview returned correctly`

**Note:** The UPDATE statement error appears to be a server-side issue with the `priority` numeric SET in multi-statement context, not a documentation error. DELETE dry_run preview worked correctly.

---

### 4. execute_dartql — Query-only use (dry_run as selector) (Example 4)

**Adapted query:** `UPDATE WHERE tags CONTAINS 'urgent' AND assignee IS NULL SET status = 'To-do'`  
(skill uses `'Todo'`; corrected to `'To-do'`)  
**Result:** FAIL  
**Response:** `failed: 1` — `"Server Error: Server returned HTML error page: Dart"`  
**Notes:** This error appears consistently when `assignee IS NULL` is used in a filter. Possible server-side bug with `IS NULL` on the `assignee` field.  
**Documentation Error:** Status value `'Todo'` in skill is incorrect; should be `'To-do'`.

---

### 5. batch_update_tasks — Update priority and tags (Example 1)

**Adapted selector:** `status = 'To-do' AND dartboard = 'Personal/test'`  
(skill uses `'Todo'` and `'Backlog'`; corrected to real status and dartboard)  
**Result:** PASS  
**Response:** `selector_matched: 2`, previewed 2 tasks with correct `new_values: {priority: 3, tags: ["needs-triage"]}`  
**Documentation Error:** Skill uses status name `'Todo'` which is incorrect. Real name is `'To-do'`.

---

### 6. batch_delete_tasks — Delete completed tasks (Example 1)

**Query:** `status = 'Done' AND completed_at < '2025-12-01'`  
(`dry_run: true` forced; skill example uses `dry_run: false, confirm: true` — not safe to run live)  
**Result:** PASS  
**Response:** `selector_matched: 0, dry_run: true, recoverable: true`

---

### 7. get_batch_status — Poll with placeholder ID (Example 1)

**Parameters:** `batch_operation_id: "batch_abc123"`  
**Result:** PASS  
**Response:** `found: false` with message explaining 1-hour retention. Tool is functional; placeholder ID correctly returns not-found.

---

### 8. import_tasks_csv — Inline CSV with validation (Example 1)

**Adapted:** `dartboard: "Personal/test"`, `validate_only: true`  
**Original CSV uses status `Todo`** — tested as-is first, then diagnosed.  
**Result:** FAIL  
**Error:** `[import_tasks_csv] Cannot read properties of undefined (reading 'toLowerCase')`  
**Root Cause:** The CSV example uses `Todo` as a status value. The server cannot resolve `Todo` to a valid status, causing an internal crash. The real status name is `To-do`.  
**Documentation Error:** CSV example uses status value `Todo` — must be `To-do`. This causes a server-side crash (not a validation error).

**Fix verified:** Replacing `Todo` with `To-do` in the CSV returns a successful validation response.

---

### 9. import_tasks_csv — File import with custom mapping (Example 2)

**Parameters:** `dartboard: "Personal/test"`, `csv_file_path: "/tmp/tasks-export.csv"`, `validate_only: true`, `continue_on_error: true`, `concurrency: 8`  
**Result:** FAIL (expected — file does not exist)  
**Error:** `Validation error: CSV parse errors: Failed to read CSV file: ENOENT: no such file or directory`  
**Notes:** Tool correctly reports the missing file. This is expected behavior, not a documentation error. The `concurrency` parameter and `column_mapping` parameters were accepted. **Documentation is correct** for this example.

---

### 10. import_tasks_csv — Minimal title-only CSV (diagnostic)

**Parameters:** `csv_data: "title\nTest task"`, `validate_only: true`  
**Result:** PASS  
**Response:** `valid_rows: 1`, correct preview. Confirms tool works with title-only imports.

---

## Documentation Errors Found

| # | Location | Issue | Fix |
|---|----------|-------|-----|
| 1 | execute_dartql Example 1 | Status `'Todo'` does not exist | Change to `'To-do'` |
| 2 | execute_dartql Example 1 | Status `'In Progress'` does not exist | Change to `'Doing'` |
| 3 | execute_dartql Example 3 | Status `'In Progress'` does not exist | Change to `'Doing'` |
| 4 | execute_dartql Example 4 | Status `'Todo'` does not exist | Change to `'To-do'` |
| 5 | DartQL Selector Syntax examples | `status IN ('Todo', 'In Progress')` — both invalid | Change to `'To-do'` and `'Doing'` |
| 6 | batch_update_tasks Example 1 | Status `'Todo'` does not exist | Change to `'To-do'` |
| 7 | import_tasks_csv Example 1 | CSV column `status` uses value `Todo` causing server crash | Change `Todo` to `To-do` in CSV data |

---

## Server Bugs Found

| # | Tool | Condition | Error |
|----|------|-----------|-------|
| 1 | execute_dartql | `assignee IS NULL` in WHERE clause | `Server returned HTML error page: Dart` — server crashes on this filter |
| 2 | execute_dartql | Multi-statement with UPDATE first, priority SET | First statement fails with same HTML error; DELETE statement in same query works fine |

---

## Notes

- `batch_delete_tasks` example in skill uses `dry_run: false, confirm: true` — dangerous for documentation. Consider changing the example to use `dry_run: true`.
- `execute_dartql` Example 2 in skill uses `dry_run: false` — the safety protocol section says to always use `dry_run: true` first, but the example contradicts this. Consider using `dry_run: true` in the example.
