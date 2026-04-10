# Workspace Skill Test Results

**Date:** 2026-04-10  
**Skill file:** `plugins/dart-query/skills/workspace.md`  
**Server:** dart-query MCP via slop-mcp  
**Test dartboard:** Personal/test

---

## Summary

| Result | Count |
|--------|-------|
| PASS   | 3     |
| FAIL   | 9     |
| SKIP   | 3     |

---

## Test Results

### Document Management

#### list_docs — PASS
```yaml
tool_name: list_docs
parameters:
  title_contains: "onboarding"
  limit: 20
```
Returns empty list (no docs matching). Response shape correct. **PASS**

---

#### create_doc — FAIL (MCP server bug)
```yaml
tool_name: create_doc
parameters:
  title: "Sprint Retro Notes"
  text: "## What went well\n- Fast delivery\n\n## Improvements\n- Better estimates"
```
**Error:**
```
API error (400): Failed to create document: Bad Request:
  errors: title: This field is not recognized.,
          text: This field is not recognized.,
          item: This field is required.
```
**Root cause:** The MCP server's `create_doc` implementation sends `title` and `text` as top-level fields, but the Dart API requires them wrapped in an `item` object. The MCP tool schema and skill docs show the correct user-facing parameters — this is an internal mapping bug in `@standardbeagle/dart-query`.

**Note:** Also tested with `folder: "Personal/stuff"` — fails earlier with a folder resolution bug (see below).

---

#### create_doc with folder — FAIL (folder resolution bug)
```yaml
tool_name: create_doc
parameters:
  title: "Sprint Retro Notes"
  text: "..."
  folder: "Personal/stuff"
```
**Error:**
```
Validation error: Invalid folder: "Personal/stuff" not found in workspace.
Available folders: [blank entries]
```
**Root cause:** `get_config` returns folder names as `"Personal/stuff"` format, but the folder resolution logic in the MCP server cannot look them up. The `suggestions` array in the error is all empty strings, indicating a display bug in the error formatter as well.

---

#### get_doc — SKIP
Skipped: depends on `create_doc` succeeding to obtain a valid `doc_id`.

---

#### update_doc — SKIP
Skipped: depends on `create_doc` succeeding to obtain a valid `doc_id`.

---

#### delete_doc — SKIP
Skipped: depends on `create_doc` succeeding to obtain a valid `doc_id`.

---

### Comments

#### add_task_comment — FAIL (MCP server bug)
```yaml
tool_name: add_task_comment
parameters:
  dart_id: "Y6ZcvnVYUYjn"   # task visible in list_tasks
  text: "Blocked by infra provisioning — ETA Friday."
```
**Error:**
```
API error (404): Task not found: dart_id 'Y6ZcvnVYUYjn' does not exist.
```
**Root cause:** Tasks are consistently returned 404 by the comments endpoint even when they exist and are visible in `list_tasks`. Tested against three different task dart_ids (`PlmxfFj6sg6c`, `YVI9DNl4q08p`, `Y6ZcvnVYUYjn`) — all fail with 404. This appears to be a server-side routing or ID translation issue in the MCP server's comment API calls.

---

#### list_comments — PASS
```yaml
tool_name: list_comments
parameters:
  task_id: "Y6ZcvnVYUYjn"
  limit: 25
```
Returns empty list with correct response shape. **PASS** (functional but no comments exist due to `add_task_comment` being broken).

---

### Time Tracking

#### add_time_tracking (start/end times) — FAIL (undocumented required field)
```yaml
tool_name: add_time_tracking
parameters:
  dart_id: "Y6ZcvnVYUYjn"
  started_at: "2026-04-09T09:00:00Z"
  finished_at: "2026-04-09T11:30:00Z"
  note: "Implemented auth module"
```
**Error:**
```
API error (400): Bad Request: errors: user: This field is required.
```
**Root cause:** The Dart API requires a `user` field (presumably a user dart_id or email). This field is not in the MCP tool schema or the skill documentation. Neither the skill nor the tool schema mentions it.

---

#### add_time_tracking (duration_minutes) — FAIL (undocumented required fields)
```yaml
tool_name: add_time_tracking
parameters:
  dart_id: "Y6ZcvnVYUYjn"
  started_at: "2026-04-09T14:00:00Z"
  duration_minutes: 45
  note: "Code review"
```
**Error:**
```
API error (400): Bad Request: errors: user: This field is required., finishedAt: This field is required.
```
**Root cause:** Same `user` issue as above. Additionally, the API appears to require `finishedAt` even when `duration_minutes` is provided, contradicting the skill documentation which states "use finished_at OR duration_minutes, not both".

---

### Attachments

#### attach_url — FAIL (undocumented required field)
```yaml
tool_name: attach_url
parameters:
  dart_id: "Y6ZcvnVYUYjn"
  url: "https://www.figma.com/file/ABC123/design-mockup"
  filename: "design-mockup.fig"
```
**Error:**
```
API error (400): Bad Request: errors: name: This field is required.
```
**Root cause:** The Dart API requires a `name` field. The MCP tool schema uses `filename` as the optional override parameter, but the underlying API call is not sending `name`. This is an MCP server field mapping bug — `filename` is not being translated to `name` in the API request.

---

### Task Movement

#### move_task (different dartboard with after_id) — FAIL (MCP server bug)
```yaml
tool_name: move_task
parameters:
  dart_id: "Y6ZcvnVYUYjn"
  dartboard: "Personal/test"
  after_id: "PlmxfFj6sg6c"
```
**Error:**
```
API error (400): Bad Request: errors: Exactly one of 'beforeTaskId' or 'afterTaskId' must be provided.
```
**Root cause:** The MCP server is not translating the `after_id` parameter to `afterTaskId` in the API request body. The parameter is being ignored, causing the API to complain that neither is provided. This affects both `after_id` and likely `before_id` as well.

---

#### move_task (reposition with order) — FAIL (API constraint not documented)
```yaml
tool_name: move_task
parameters:
  dart_id: "Y6ZcvnVYUYjn"
  order: 0
```
**Error:**
```
API error (400): Bad Request: errors: Exactly one of 'beforeTaskId' or 'afterTaskId' must be provided.
```
**Root cause:** Same field mapping bug as above — `order` is not being translated to the API's expected format. Additionally, the Dart API may not support an `order` index at all (requires before/after relative positioning), making the `order` parameter in the skill docs potentially invalid at the API level.

---

## Bug Summary

| # | Tool | Bug Type | Description |
|---|------|----------|-------------|
| 1 | `create_doc` | MCP server bug | `title`/`text` not wrapped in `item` object for API |
| 2 | `create_doc` | MCP server bug | Folder name resolution broken — empty suggestions in error |
| 3 | `add_task_comment` | MCP server bug | All tasks return 404 from comment endpoint |
| 4 | `add_time_tracking` | Missing param | `user` field required by API, not in schema or docs |
| 5 | `add_time_tracking` | Doc error | `finished_at` required even when `duration_minutes` provided |
| 6 | `attach_url` | MCP server bug | `filename` not mapped to `name` in API request |
| 7 | `move_task` | MCP server bug | `after_id`/`before_id` not mapped to `afterTaskId`/`beforeTaskId` |
| 8 | `move_task` | Doc/API mismatch | `order` param may not be supported by Dart API |

## Documentation Errors in workspace.md

1. **`add_time_tracking`**: "use finished_at OR duration_minutes, not both" — API actually requires `finishedAt` even with `duration_minutes` (or the `user` issue masks this — needs retest after user fix).
2. **`move_task` `order` param**: Documented as "0-based position index within the dartboard" but the underlying API only accepts relative positioning (`beforeTaskId`/`afterTaskId`). The `order` feature may be unimplemented.
3. **`add_time_tracking`**: Missing required `user` field — not documented anywhere in skill or tool schema.

## Cleanup

Test task `Y6ZcvnVYUYjn` ("workspace-test-task") was deleted to trash during test cleanup.
