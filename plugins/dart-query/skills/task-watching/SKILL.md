---
name: dart-query-task-watching
description: "Watch for new, changed, or blocked tasks using Claude Code loops and scheduled triggers - automated polling, status change detection, and auto-pickup patterns with dart-query. 以輪詢、排程、自動承接諸法，持續監察Dart任務狀態變化. Use when: watch for new tasks, detect blocked tasks, monitor status changes, auto-pickup tasks, schedule daily standups, automate task triage"
disable-model-invocation: true
---

# dart-query Task Watching

諸模式藉Claude Code之`/loop`與`/schedule`，持續監察Dart任務。適於自動承接任務、告警阻礙、追蹤迭代狀態變更。

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

**Use:** 偵測新建任務，待處理或分類。

以定時輪詢`list_tasks`，比對先前所見ID，報告新至者。用`detail_level: minimal`節省token。

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

已見ID持久化：追加至本地草稿文件（`/tmp/dart-seen-ids.txt`）或作哨兵任務之注釋。

---

## Pattern 2: Watch for Blocked Tasks

**Use:** 告警任務積聚阻礙，或「Blocked」狀態漏報。

以`detail_level: full`取`blocker_ids`。標記有非空`blocker_ids`卻未置「Blocked」狀態者——狀態與實情漂移之徵。

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

客戶端過濾：`task.blocker_ids.length > 0 && task.status !== "Blocked"`。

---

## Pattern 3: Status Change Detection

**Use:** 追蹤任務進度，捕捉停滯，發現意外回退。

定期快照所有任務狀態，與前次快照比對，報告轉換。標記在同一狀態超過N次迭代者。

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

迭代間持久化之快照格式：

```json
{
  "tsk_abc123": { "status": "In Progress", "unchanged_count": 2 },
  "tsk_def456": { "status": "Todo", "unchanged_count": 0 }
}
```

---

## Pattern 4: Scheduled Daily and Weekly Checks

**Use:** 無需手動觸發之自動報告——晨會、迭代健康、日終摘要。

以`/schedule`搭配cron表達式，代理遠端定時執行並提交結果。

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

**Use:** 自動承接以特定標籤（如`auto-execute`或`kibeth`）標記之任務，無需人工介入。

```
/loop 5m Check for tasks tagged 'auto-execute' in 'Automation' dartboard with status 'Todo'.
Use list_tasks with dartboard='Automation', tags=['auto-execute'], status='Todo', detail_level='full'.
For each found task:
  1. Claim: update_task status='In Progress', comment='Auto-picked up by agent'
  2. Execute: read task description for instructions and perform the described work
  3. Complete: update_task status='Done', comment with results summary
  4. Log time: add_time_tracking with actual minutes spent
```

Claim step（防並發重複承接）：

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_abc123"
  status: "In Progress"
  comment: "Auto-picked up by agent at 2026-04-09T09:00Z"
```

**dartai整合：** 自動承接偵測到任務後，藉對抗品質流水線處理之：

> Invoke the `Skill` tool with `skill: dartai:task-execution` — 負責規劃、實現、評審、驗證，方置Done。

---

## Pattern 6: Blocker Resolution Watcher

**Use:** 阻礙依賴完成後自動解鎖。消除完成任務後之手動跟進。

定期掃描新完成任務，若仍出現在他任務之`blocker_ids`中，移除已解除阻礙，恢復下游任務狀態。

```
/loop 10m Check for completed tasks that are still listed as blockers elsewhere.
Use list_tasks with status='Done', detail_level='minimal' to find recently finished tasks.
For each done task, use list_tasks with detail_level='full' and filter client-side for tasks where blocker_ids contains the completed task ID.
For each match: remove the resolved blocker using update_task remove_from.blocker_ids,
and if no blockers remain, update status from 'Blocked' to 'Todo'.
Comment on both tasks about the unblock.
```

查找仍被已完成任務阻塞者：

```yaml
tool_name: list_tasks
parameters:
  status: "Blocked"
  detail_level: "full"
# Then filter client-side: task.blocker_ids includes "tsk_done001"
```

解鎖並恢復：

```yaml
tool_name: update_task
parameters:
  dart_id: "tsk_blocked002"
  status: "Todo"
  comment: "Unblocked — tsk_done001 is now complete"
  remove_from:
    blocker_ids: ["tsk_done001"]
```

在已完成任務上留注，閉合循環：

```yaml
tool_name: add_task_comment
parameters:
  dart_id: "tsk_done001"
  text: "Completion unblocked tsk_blocked002 — status restored to Todo"
```

---

## Tips

- 所有輪詢循環用`detail_level: minimal`——僅返回標題、狀態、ID，高頻檢查節省token。
- 循環間隔合理：狀態輪詢最短5分鐘，`detail_level: full`全量掃描10–15分鐘。
- 持久化循環狀態（已見ID、快照、未變計數）至`/tmp/`文件或Dart哨兵任務注釋。
- 組合模式：每日`/schedule`報告加`/loop`緊急阻礙告警，覆蓋大多數團隊需求。
- 以`dartboard`和`statuses`過濾縮小範圍——非必要勿全工作區掃描。
- 自動承接搭配dartai時，每代理設唯一標籤，防多代理搶占同一任務。

工具參數詳見`querying`與`task-lifecycle`技能。跨多任務批量狀態更新，詳見：

> Invoke the `Skill` tool with `skill: dart-query:batch-ops` — 批量操作語法與安全協議。
