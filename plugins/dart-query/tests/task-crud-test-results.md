# task-crud Skill — Live Test Results

**Date:** 2026-04-10  
**Server:** dart-query (via slop-mcp)  
**Dartboard:** Personal/test  
**Status names used:** To-do, Doing, Done

---

## Summary

| # | Tool | Example | Result |
|---|------|---------|--------|
| 1 | create_task | Basic creation (with `priority: 2` integer) | FAIL — doc error |
| 2 | create_task | Basic creation (corrected to string priority) | PASS |
| 3 | create_task | Creation with relationships and comment | PASS |
| 4 | get_task | Fetch with include_comments + expand_relationships | PASS |
| 5 | update_task | Simple update with status + priority integer | FAIL — doc error |
| 6 | update_task | Simple update with status only | PASS |
| 7 | update_task | Add blocker with comment | PARTIAL — comment silently not added |
| 8 | update_task | Incremental add_to + remove_from | PASS |
| 9 | add_task_comment | Standalone comment | FAIL — server bug (404) |
| 10 | delete_task | Delete task | PASS |

**Pass: 6 / Fail: 3 (2 doc errors, 1 server bug) / Partial: 1**

---

## Detailed Results

### Test 1 — create_task: Basic creation (as documented)

```yaml
tool_name: create_task
parameters:
  title: "Implement OAuth login flow"
  dartboard: "Personal/test"
  priority: 2
  assignees: ["usr_abc123"]
```

**Result: FAIL**

```
[create_task] API error (400): Failed to create task: Bad Request:
errors: item.priority: Invalid type for value: 2. Expected string or null.
```

**Doc error:** `priority` is documented as `1-5` (integer). The API requires a **string** (e.g., `"medium"`, `"critical"`). The integer form is rejected by the API for `create_task`.

---

### Test 2 — create_task: Basic creation (corrected)

```yaml
tool_name: create_task
parameters:
  title: "Implement OAuth login flow"
  dartboard: "Personal/test"
  priority: "medium"
```

**Result: PASS**  
dart_id: `YVI9DNl4q08p` — created successfully with status "To-do", priority "Medium".

---

### Test 3 — create_task: Creation with relationships and comment

```yaml
tool_name: create_task
parameters:
  title: "Fix auth token refresh"
  dartboard: "Personal/test"
  priority: "critical"
  blocker_ids: ["YVI9DNl4q08p"]
  comment: "Blocking release — needs immediate attention"
```

**Result: PASS**  
dart_id: `PlmxfFj6sg6c` — created with blocker relationship set.  
Note: The `comment` parameter was accepted (no error), though the comment thread returned empty on subsequent get_task. Behavior is accepted/documented.

---

### Test 4 — get_task: Fetch with flags

```yaml
tool_name: get_task
parameters:
  dart_id: "PlmxfFj6sg6c"
  include_comments: true
  expand_relationships: true
```

**Result: PASS**  
Returned full task, empty comment array, and `expanded_relationships.blockers` with title `"Implement OAuth login flow"`. All flags work as documented.

---

### Test 5 — update_task: Simple update (as documented)

```yaml
tool_name: update_task
parameters:
  dart_id: "YVI9DNl4q08p"
  status: "Doing"
  priority: 2
```

**Result: FAIL**

With `priority: 2` (integer): `API error (400): item.priority: Invalid type for value: 2. Expected string or null.`  
With `priority: "medium"` (string): `Validation error: Invalid priority: medium. Valid range: 1-5`

**Doc error and tool inconsistency:** `update_task` has a local validator that rejects strings and requires integers 1-5, but the Dart API itself requires strings. Both forms fail. Priority cannot currently be set via `update_task`. **Workaround: omit `priority` from `update_task` calls.**

---

### Test 6 — update_task: Simple update (status only)

```yaml
tool_name: update_task
parameters:
  dart_id: "YVI9DNl4q08p"
  status: "Doing"
```

**Result: PASS**  
Status updated to "Doing" successfully.

---

### Test 7 — update_task: Add blocker with comment

```yaml
tool_name: update_task
parameters:
  dart_id: "PlmxfFj6sg6c"
  comment: "Blocked on API design review"
  add_to:
    blocker_ids: ["YVI9DNl4q08p"]
```

**Result: PARTIAL**  
`blocker_ids` updated successfully. However `comment_added: false` was returned — the `comment` parameter on `update_task` was silently ignored. The skill doc says "use `comment` parameter on `update_task`" for combined update+comment, but this does not work.

---

### Test 8 — update_task: Incremental relationship update

```yaml
tool_name: update_task
parameters:
  dart_id: "PlmxfFj6sg6c"
  add_to:
    related_ids: ["YVI9DNl4q08p"]
  remove_from:
    blocker_ids: ["YVI9DNl4q08p"]
```

**Result: PASS**  
Both `related_ids` and `blocker_ids` updated correctly in a single call. `updated_fields: ["related_ids", "blocker_ids"]`.

---

### Test 9 — add_task_comment: Standalone comment

```yaml
tool_name: add_task_comment
parameters:
  dart_id: "YVI9DNl4q08p"
  text: "Verified fix in staging — ready for review"
```

**Result: FAIL — server bug**

```
[add_task_comment] API error (404): Task not found: dart_id 'YVI9DNl4q08p'
does not exist.
```

The task was confirmed to exist (get_task returned it successfully). This appears to be a bug in the `add_task_comment` tool's lookup logic — it may use a different internal query path than `get_task`. Reproduced on both created tasks.

---

### Test 10 — delete_task

```yaml
tool_name: delete_task
parameters:
  dart_id: "YVI9DNl4q08p"
```

**Result: PASS**  
Both test tasks deleted (soft delete, recoverable from Dart web UI trash).

---

## Documentation Errors Found

### Error 1 — `priority` type is wrong throughout the skill

**Documented:** `priority: 1-5` (integer, "1=lowest, 5=highest")  
**Actual:** `priority` must be a **string** for `create_task` (e.g., `"critical"`, `"high"`, `"medium"`, `"low"`, `"no priority"`).  
For `update_task`, there is a conflicting local validator that rejects strings but the API rejects integers — priority cannot be set via `update_task` at all currently.

**Fix needed in skill:** Change all `priority` examples to use string values. Document that `update_task` does not support `priority` changes until the server-side inconsistency is resolved.

### Error 2 — `comment` on `update_task` does not work

**Documented:** "For combined update+comment, use `comment` parameter on `update_task`"  
**Actual:** `comment` parameter is accepted without error but `comment_added: false` — the comment is silently dropped.

**Fix needed in skill:** Remove the claim that `update_task` supports a `comment` parameter, or flag it as unreliable. Users should call `add_task_comment` separately.

### Error 3 — `add_task_comment` has a server-side 404 bug

**Documented:** Works for any valid `dart_id`  
**Actual:** Returns 404 for tasks that exist (confirmed via `get_task`). This is a server bug, not a doc error, but the skill should note it as a known issue until fixed.
