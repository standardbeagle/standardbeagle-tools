# Discovery Skill - Integration Test Results

Date: 2026-04-10

Summary: **8 PASS, 4 FAIL** (10 documented examples + 2 additional probes)

---

## Test 1: Get tool overview
- **Tool:** `info`
- **Parameters:** `{"level": "overview"}`
- **Result:** PASS
- **Response summary:** Returned tool group table with 7 groups (discovery, config, task-crud, task-query, task-batch, doc-crud, import) and quick-start hints.

---

## Test 2: Explore a group
- **Tool:** `info`
- **Parameters:** `{"level": "group", "target": "tasks"}`
- **Result:** FAIL
- **Response summary:** `Error: Unknown group "tasks". Valid groups: discovery, config, task-crud, task-query, task-batch, doc-crud, import`
- **Fix needed:** The skill documents `target: "tasks"` but the server uses hyphenated compound names. The correct group names are `task-crud`, `task-query`, or `task-batch`. Update example to use `target: "task-crud"`.

---

## Test 3: Full schema for a specific tool
- **Tool:** `info`
- **Parameters:** `{"level": "tool", "target": "list_tasks"}`
- **Result:** FAIL
- **Response summary:** `Error: No documentation for tool "list_tasks". Available tools with full documentation: info, get_config, execute_dartql, batch_update_tasks, import_tasks_csv, relationships`
- **Fix needed:** `list_tasks` does not have inline documentation in `info`. The skill implies `info(level='tool', ...)` works for any tool, but only a subset are supported. Update example to use a documented tool such as `target: "execute_dartql"` or `target: "batch_update_tasks"`, and add a note that undocumented tools should be explored via `info(level='group', ...)` instead.

---

## Test 4: get_config — Load everything
- **Tool:** `get_config`
- **Parameters:** `{"include": ["assignees", "dartboards", "statuses", "tags", "priorities", "sizes", "folders"]}`
- **Result:** PASS
- **Response summary:** Returned all 7 sections with full data. Assignees included `dart_id`-equivalent name field, dartboards as `"Space/Name"` strings, statuses as name strings, tags as name strings, priorities and sizes as name strings, folders as `"Space/Name"` strings. Response also included `cached_at` and `cache_ttl_seconds`.
- **Note:** The skill documents that `assignees` returns `dart_id, name, email` and other sections return `dart_id, name`. In practice assignees return `{name, email}` (no `dart_id`), and dartboards/statuses/tags/etc. return flat strings (no `dart_id`). The schema description in the skill is inaccurate but the tool itself functions correctly.

---

## Test 5: get_config — Load only what you need
- **Tool:** `get_config`
- **Parameters:** `{"include": ["dartboards", "statuses"]}`
- **Result:** PASS
- **Response summary:** Returned dartboards and statuses arrays; all other sections were empty arrays. Served from cache (`cached_at` unchanged from Test 4).

---

## Test 6: get_config — Force refresh
- **Tool:** `get_config`
- **Parameters:** `{"include": ["assignees", "dartboards"], "cache_bust": true}`
- **Result:** PASS
- **Response summary:** Returned fresh data with updated `cached_at` timestamp. Cache was bypassed and refreshed as expected.

---

## Test 7: get_dartboard — Example name "Sprint 42"
- **Tool:** `get_dartboard`
- **Parameters:** `{"dartboard_id": "Sprint 42"}`
- **Result:** FAIL (expected — placeholder name)
- **Response summary:** `Validation error: Dartboard "Sprint 42" not found.` with list of available dartboards.
- **Fix needed:** The skill's example uses a fictional `"Sprint 42"` which will always fail in this workspace. This is a documentation quality issue — the example should use a real dartboard pattern or add a clearer note that the value must come from `get_config` output. Consider updating the example to `"<dartboard_name_from_get_config>"` with an explicit instruction to substitute.

---

## Test 8: get_dartboard — Real dartboard name
- **Tool:** `get_dartboard`
- **Parameters:** `{"dartboard_id": "Personal/dart-query"}`
- **Result:** PASS
- **Response summary:** Returned `{dart_id, name, url}` for the dartboard. No `task_count` field was present despite the skill stating "including its current task count."
- **Fix needed:** The skill says `get_dartboard` returns the "current task count" — this field was absent from the actual response. Either the server no longer returns it or the documentation is aspirational. Update the skill description to remove the task count claim or verify with the server maintainer.

---

## Test 9: get_folder — Example name "Engineering Docs"
- **Tool:** `get_folder`
- **Parameters:** `{"folder_id": "Engineering Docs"}`
- **Result:** FAIL (expected — placeholder name)
- **Response summary:** `Validation error: Folder "Engineering Docs" not found.` Suggestions list was empty (all blank entries).
- **Fix needed:** Same as Test 7 — placeholder name in example. Additionally the error response suggestions are all empty strings, indicating a server-side bug in the suggestions lookup for folders.

---

## Test 10: get_folder — Real folder name from get_config
- **Tool:** `get_folder`
- **Parameters:** `{"folder_id": "Pager Health/Docs [2025-06] Pager Design"}`
- **Result:** FAIL
- **Response summary:** `Validation error: Folder "Pager Health/Docs [2025-06] Pager Design" not found.` Suggestions all blank.
- **Fix needed:** `get_folder` appears to be broken server-side — it rejects valid folder names returned by `get_config` and returns empty suggestion strings. This is a server bug, not a documentation bug. The tool is unusable in its current state regardless of what name is passed.

---

## Session Init Recipe — Step 1
- **Tool:** `get_config`
- **Parameters:** `{"include": ["assignees", "dartboards", "statuses"]}`
- **Result:** PASS
- **Response summary:** Returned all three sections correctly from cache. Recipe step works as documented.

---

## Summary of Issues

| # | Severity | Issue |
|---|----------|-------|
| 1 | **Bug — server** | `get_folder` is broken: rejects valid folder names from `get_config` and returns empty suggestions |
| 2 | **Bug — server** | `get_dartboard` response omits `task_count` field documented in the skill |
| 3 | **Doc error** | `info(level='group', target='tasks')` — group name should be `task-crud`, `task-query`, or `task-batch` |
| 4 | **Doc error** | `info(level='tool', target='list_tasks')` — `list_tasks` has no inline docs; use `execute_dartql` or `batch_update_tasks` |
| 5 | **Doc inaccuracy** | `get_config` returns flat strings for dartboards/statuses/tags/etc., not `{dart_id, name}` objects as documented |
| 6 | **Doc quality** | Example dartboard `"Sprint 42"` and folder `"Engineering Docs"` are placeholder names that will always fail |
