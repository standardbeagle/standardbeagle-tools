---
name: task-watching
description: Watch for new, changed, or blocked tasks using Claude Code loops and scheduled triggers - automated polling, status change detection, and auto-pickup patterns with dart-query
---

# dart-query Task Watching

These patterns use Claude Code's `/loop` and `/schedule` features to continuously monitor Dart tasks. Useful for automated task pickup, alerting on blockers, and tracking status changes across a sprint or project.

## Access Pattern (all examples below use this)

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"
  parameters: { ... }
```

---

## Pattern 1: Poll for New Tasks

**Use:** Detect newly created tasks that need attention or triage.

Poll `list_tasks` on an interval, compare against previously seen IDs, and report new arrivals. Use `detail_level: minimal` to keep token cost low.

```
/loop 5m Check for new tasks on 'Sprint 5' dartboard with status 'Todo'.
Use list_tasks with dartboard='Sprint 5', status='Todo', detail_level='minimal'.
Compare task IDs against any previously seen in this loop session.
Report only new tasks with their title and priority. If none, stay silent.
```

Tool call inside the loop:

```yaml
tool_name: list_tasks
parameters:
  dartboard: "Sprint 5"
  status: "Todo"
  detail_level: "minimal"
  limit: 50
```

Track seen IDs between iterations by appending them to a local scratch file (`/tmp/dart-seen-ids.txt`) or as a comment on a sentinel task.

---

## Pattern 2: Watch for Blocked Tasks

**Use:** Alert when tasks accumulate blockers or when "Blocked" status is under-reported.

Fetch tasks with `detail_level: full` to access `blocker_ids`. Flag tasks that have non-empty `blocker_ids` but haven't been moved to "Blocked" status — a sign of drift between state and reality.

```
/loop 10m Scan 'Sprint 5' for tasks that have blocker_ids but are not in Blocked status.
Use list_tasks with dartboard='Sprint 5', detail_level='full'.
For each task where blocker_ids is non-empty and status is not 'Blocked',
report the task title, current status, and blocker IDs.
```

Tool call inside the loop:

```yaml
tool_name: list_tasks
parameters:
  dartboard: "Sprint 5"
  detail_level: "full"
  limit: 100
```

Filter client-side: `task.blocker_ids.length > 0 && task.status !== "Blocked"`.

---

## Pattern 3: Status Change Detection

**Use:** Track task progress, catch stalls, and spot unexpected regressions.

Take a periodic snapshot of all task statuses. Compare against the previous snapshot and report transitions. Flag tasks that have been in the same status for more than N intervals.

```
/loop 15m Snapshot status of all tasks in 'Sprint 5' dartboard.
Use list_tasks with dartboard='Sprint 5', detail_level='minimal'.
Compare to prior snapshot saved in /tmp/dart-status-snapshot.json.
Report status transitions (e.g. Todo→In Progress, In Review→Done).
Also flag any task unchanged for 3+ consecutive checks.
Write updated snapshot back to /tmp/dart-status-snapshot.json.
```

Tool call:

```yaml
tool_name: list_tasks
parameters:
  dartboard: "Sprint 5"
  detail_level: "minimal"
  limit: 100
```

Snapshot format to persist between iterations:

```json
{
  "tsk_abc123": { "status": "In Progress", "unchanged_count": 2 },
  "tsk_def456": { "status": "Todo", "unchanged_count": 0 }
}
```

---

## Pattern 4: Scheduled Daily and Weekly Checks

**Use:** Automated reporting without manual invocation — morning standups, sprint health, end-of-day summaries.

Use `/schedule` with cron expressions. The agent runs remotely on the schedule and posts results.

**Daily morning check (weekdays at 9am):**

```
/schedule "0 9 * * 1-5" Check for overdue tasks and unassigned high-priority work.
Use list_tasks with dartboard='Sprint 5', detail_level='full'.
Report: tasks where due_at < today and status != 'Done',
tasks where priority >= 4 and assignees is empty.
Keep report concise — one line per task.
```

**Weekly sprint health (Monday at 8am):**

```
/schedule "0 8 * * 1" Generate weekly sprint health report for 'Sprint 5'.
Use list_tasks with dartboard='Sprint 5', detail_level='full', limit=200.
Report: total tasks by status, count with blockers, count unassigned,
tasks with no activity in 5+ days, estimated carry-over risk.
```

**End-of-day summary (weekdays at 6pm):**

```
/schedule "0 18 * * 1-5" Summarize today's task activity on 'Sprint 5'.
Use list_tasks with dartboard='Sprint 5', status='Done', detail_level='minimal'. Then repeat for status='In Review'.
Report tasks moved to Done or In Review today. Flag any regressions (moved backward in status).
```

---

## Pattern 5: Auto-Pickup (Watch + Execute)

**Use:** Automatically start working on tasks tagged for automation or labeled for a specific agent.

Poll for tasks with a specific tag (e.g., `auto-execute` or `kibeth`). When found, claim, execute, and complete without manual intervention.

```
/loop 5m Check for tasks tagged 'auto-execute' in 'Automation' dartboard with status 'Todo'.
Use list_tasks with dartboard='Automation', tags=['auto-execute'], status='Todo', detail_level='full'.
For each found task:
  1. Claim: update_task status='In Progress', comment='Auto-picked up by agent'
  2. Execute: read task description for instructions and perform the described work
  3. Complete: update_task status='Done', comment with results summary
  4. Log time: add_time_tracking with actual minutes spent
```

Claim step (prevents double-pickup in concurrent loops):

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  status: "In Progress"
  comment: "Auto-picked up by agent at 2026-04-09T09:00Z"
```

**Integration with dartai:** When auto-pickup detects a task, invoke the `dartai-task-execution` skill to handle it through the adversarial quality pipeline. The dartai executor handles planning, implementation, review, and verification before marking Done.

---

## Pattern 6: Blocker Resolution Watcher

**Use:** Automatically unblock tasks when their blocking dependencies complete. Eliminates manual follow-up after finishing a task.

Periodically scan for newly-Done tasks that still appear in other tasks' `blocker_ids`, then remove the resolved blocker and restore the downstream task's status.

```
/loop 10m Check for completed tasks that are still listed as blockers elsewhere.
Use list_tasks with status='Done', detail_level='minimal' to find recently finished tasks.
For each done task, use list_tasks with detail_level='full' and filter client-side for tasks where blocker_ids contains the completed task ID.
For each match: remove the resolved blocker using update_task remove_from.blocker_ids,
and if no blockers remain, update status from 'Blocked' to 'Todo'.
Comment on both tasks about the unblock.
```

Find tasks still blocked by a completed task:

```yaml
tool_name: list_tasks
parameters:
  status: "Blocked"
  detail_level: "full"
# Then filter client-side: task.blocker_ids includes "tsk_done001"
```

Unblock and restore:

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_blocked002"
  status: "Todo"
  comment: "Unblocked — tsk_done001 is now complete"
  remove_from:
    blocker_ids: ["tsk_done001"]
```

Comment on the completed task to close the loop:

```yaml
tool_name: add_task_comment
parameters:
  dart_id: "tsk_done001"
  text: "Completion unblocked tsk_blocked002 — status restored to Todo"
```

---

## Tips

- Use `detail_level: minimal` for all polling loops — it returns title, status, and IDs only, conserving tokens on high-frequency checks.
- Keep loop intervals reasonable: 5m minimum for status polling, 10–15m for full scans with `detail_level: full`.
- Persist loop state (seen IDs, snapshots, unchanged counts) to `/tmp/` files or as comments on a sentinel task in Dart.
- Combine patterns: a daily `/schedule` for reporting + a `/loop` for urgent blocker alerts covers most team needs.
- Limit scope with `dartboard` and `statuses` filters — avoid full-workspace scans unless necessary.
- For auto-pickup with dartai, set a unique tag per agent to prevent multiple agents claiming the same task.

For tool parameter details see the `querying` and `task-lifecycle` skills. For bulk status updates across many tasks, see the `batch-ops` skill.
