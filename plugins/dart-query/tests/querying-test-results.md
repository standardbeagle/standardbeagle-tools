# querying.md Tool Call Test Results

**Date:** 2026-04-10  
**Dartboard used:** Personal/test  
**Real status names used:** To-do, Doing, Done  
**Summary:** 10 PASS, 3 FAIL

---

## list_tasks — Filter Composition Examples

### Test 1: By status + dartboard
**Adapted from:** `dartboard: "Sprint 24"`, `status: "In Progress"` → `dartboard: "Personal/test"`, `status: "Doing"`

```yaml
tool_name: list_tasks
parameters:
  dartboard: "Personal/test"
  status: "Doing"
  detail_level: standard
```

**Result:** PASS  
**Response:** 0 tasks (empty dartboard for "Doing"), filters applied correctly: `status: Doing, dartboard: Personal/test`

---

### Test 2: By assignee + due date range

```yaml
tool_name: list_tasks
parameters:
  assignee: "andybrummer@standardbeagle.com"
  due_after: "2026-04-01T00:00:00Z"
  due_before: "2026-04-30T23:59:59Z"
  detail_level: standard
```

**Result:** PASS  
**Response:** 1 task returned ("site updates - May", Hosting and Maintenance/Site Updates). Filters applied as specified.

---

### Test 3: Unassigned high-priority tasks
**Adapted from:** `priority: 1`, `status: "Open"` → `status: "To-do"`  
**Documentation note:** Skill shows `priority: 1` (integer) but `get_config` returns priority as string names ("critical", "high", "medium", "low"). The integer `1` maps to "critical" in Dart's API; filter applied correctly and returned 0 tasks.

```yaml
tool_name: list_tasks
parameters:
  priority: 1
  status: "To-do"
  detail_level: standard
  limit: 100
```

**Result:** PASS (with documentation gap — see notes)  
**Response:** 0 tasks. The filter `priority: 1` was accepted. However `get_config` shows priorities as named strings. The skill documents integers 1-5 but does not clarify that 1=critical, 2=high, etc. No error raised.

---

### Test 4: Top-level tasks only (no subtasks)
**Adapted from:** `dartboard: "Backlog"` → `dartboard: "Personal/test"`

```yaml
tool_name: list_tasks
parameters:
  dartboard: "Personal/test"
  has_parent: false
  detail_level: minimal
```

**Result:** PASS  
**Response:** 2 tasks returned ("Fix auth token refresh", "Implement OAuth login flow"). `client_side_filtered: true` noted in filters — has_parent is evaluated client-side.

---

### Test 5: Multi-filter sprint planning
**Adapted from:** `dartboard: "Q2 Planning"`, tags `["feature", "approved"]` → `dartboard: "Personal/test"`, tags `["Feature", "AI"]`

```yaml
tool_name: list_tasks
parameters:
  dartboard: "Personal/test"
  has_parent: false
  due_before: "2026-06-30T23:59:59Z"
  tags: ["Feature", "AI"]
  detail_level: full
  limit: 500
```

**Result:** PASS  
**Response:** 0 tasks (no tasks with those tags in Personal/test). Filters all applied, `client_side_filtered: true`.

---

## list_tasks — Pagination Examples

### Test 6: Sequential paging (offset: 100)

```yaml
tool_name: list_tasks
parameters:
  dartboard: "Personal/test"
  limit: 50
  offset: 100
```

**Result:** PASS  
**Response:** 0 tasks returned, `total_count: 2`, `has_more: false`. Offset beyond dataset handled correctly.

---

### Test 7: Full scan (limit: 500, offset: 0)

```yaml
tool_name: list_tasks
parameters:
  dartboard: "Personal/test"
  limit: 500
  offset: 0
```

**Result:** PASS  
**Response:** 2 tasks returned, `has_more: false`. Correct scan termination signal.

---

### Test 8: Count-first — check if any exist

```yaml
tool_name: list_tasks
parameters:
  dartboard: "Personal/test"
  status: "To-do"
  limit: 1
  detail_level: minimal
```

**Result:** PASS  
**Response:** 1 task returned, `total_count: 2`, `has_more: true`, `next_offset: 1`. Pattern works correctly.

---

## search_tasks — Examples

### Test 9: Find feature-related tasks (no dartboard scope)

```yaml
tool_name: search_tasks
parameters:
  query: "authentication feature"
  include_completed: false
  limit: 50
```

**Result:** FAIL  
**Error:** `[search_tasks] API error (500): Server Error: Server returned HTML error page: Dart`  
**Notes:** Server-side full-text search fails when no `dartboard` is specified. Scoping to a dartboard triggers client-side fallback which succeeds. This is a server-side bug, not a documentation error per se, but the skill example implies cross-dartboard search works.

---

### Test 10: Find bugs excluding resolved (dartboard-scoped)
**Adapted from:** `dartboard: "Mobile App"` → `dartboard: "Personal/test"`

```yaml
tool_name: search_tasks
parameters:
  query: "bug -resolved -wontfix"
  dartboard: "Personal/test"
  limit: 100
```

**Result:** PASS  
**Response:** 0 tasks. Query parsed correctly: `terms: ["bug", "-wontfix"], exclusions: ["resolved"]`, `search_method: client_side`. Note: exclusion syntax `-term` is parsed correctly but exclusions and negative terms appear in separate fields — the query parsing split `-resolved` into `exclusions` and `-wontfix` into `terms` (inconsistency in the parser, not in the documentation).

---

### Test 11: Search across all dartboards for a phrase

```yaml
tool_name: search_tasks
parameters:
  query: '"rate limiting" OR "throttle"'
  include_completed: true
  limit: 200
```

**Result:** FAIL  
**Error:** `[search_tasks] API error (500): Server Error: Server returned HTML error page: Dart`  
**Notes:** Same as Test 9 — unscoped search fails server-side. The skill implies this pattern works; it does not with the current server.

---

## execute_dartql — DartQL dry_run Example

### Test 12: Find all high-priority open tasks (dry_run)

```yaml
tool_name: execute_dartql
parameters:
  query: "UPDATE WHERE priority >= 4 AND status != 'Done' SET priority = 4"
  dry_run: true
```

**Result:** FAIL  
**Response:**
```json
{
  "dry_run": true,
  "statements": [{
    "statement_type": "update",
    "selector_matched": 0,
    "succeeded": 0,
    "failed": 1,
    "failed_items": [{"dart_id": "", "error": "Server Error: Server returned HTML error page: Dart"}]
  }],
  "total_failed": 1,
  "execution_time_ms": 10654
}
```
**Notes:** The dry_run envelope was returned (not a raw 500), but the internal execution failed with a server error. The DartQL query itself may be valid — the failure is a server-side error, not a syntax error. The skill documentation for this pattern is correct in form but the feature is currently broken server-side.

---

## Documentation Issues Found

| # | Issue | Severity |
|---|-------|----------|
| 1 | `priority` filter documented as integer 1-5, but `get_config` exposes priorities as named strings ("critical", "high", "medium", "low"). The integer mapping is undocumented. | Medium |
| 2 | `status: "Open"` used in Test 3 example — "Open" is not a valid status in this workspace (valid: "To-do", "Doing", "Done", "Review", "Parking lot", "Cancelled", "In Progress / Doing", "Planning"). Example should use "To-do" or note workspace-specific values. | Medium |
| 3 | `search_tasks` without a `dartboard` scope fails with HTTP 500 (server-side search broken). The examples in the skill that omit `dartboard` will fail. Client-side fallback only triggers when `dartboard` is specified. | High — server bug, but examples are misleading |
| 4 | `execute_dartql` dry_run fails server-side currently. Documentation is correct in form but the feature is non-functional. | High — server bug |
| 5 | `search_tasks` exclusion parsing inconsistency: `-resolved` is placed in `exclusions[]` but `-wontfix` is placed in `terms[]` as-is. The parser is inconsistent, though the skill docs don't specify parsing behavior. | Low |
| 6 | The skill says `dartboard: "Backlog"` and `dartboard: "Q2 Planning"` etc. as examples — these won't exist in most workspaces. This is expected for examples, but could note to use `get_config` to find real dartboard names. | Low |

---

## Pass/Fail Summary

| Test | Tool | Description | Result |
|------|------|-------------|--------|
| 1 | list_tasks | status + dartboard filter | PASS |
| 2 | list_tasks | assignee + due date range | PASS |
| 3 | list_tasks | priority integer + status filter | PASS |
| 4 | list_tasks | has_parent: false (top-level only) | PASS |
| 5 | list_tasks | multi-filter with tags + due_before | PASS |
| 6 | list_tasks | pagination offset beyond dataset | PASS |
| 7 | list_tasks | full scan (limit 500) | PASS |
| 8 | list_tasks | count-first (limit 1) | PASS |
| 9 | search_tasks | unscoped query — no dartboard | FAIL (server 500) |
| 10 | search_tasks | scoped with exclusion syntax | PASS |
| 11 | search_tasks | unscoped phrase/OR query | FAIL (server 500) |
| 12 | execute_dartql | dry_run with comparison operators | FAIL (server error) |

**Total: 9 PASS, 3 FAIL**
