---
name: project-recipes
description: Project management recipes - sprint transitions, triage, team rebalancing, stale task cleanup, reporting, and priority recalibration with dart-query
---

# dart-query Project Recipes

Ready-to-use recipes for common project management workflows. Each recipe has a "When to use" trigger and step-by-step tool calls. For batch operation syntax details, see the `batch-ops` skill.

## Access Pattern

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "dart-query"
  tool_name: "<tool-name>"
  parameters: { ... }
```

---

## Recipe: Sprint Transition

**When:** End of sprint — carry incomplete tasks forward and archive completed ones.

**Step 1 — Preview carry-over tasks (dry run first):**
```yaml
tool_name: execute_dartql
parameters:
  statement: "UPDATE WHERE dartboard = 'Sprint 12' AND status != 'Done' SET dartboard = 'Sprint 13'"
  dry_run: true
```

**Step 2 — Execute the move after confirming preview:**
```yaml
tool_name: execute_dartql
parameters:
  statement: "UPDATE WHERE dartboard = 'Sprint 12' AND status != 'Done' SET dartboard = 'Sprint 13'"
  dry_run: false
```

**Step 3 — Archive completed tasks:**
```yaml
tool_name: execute_dartql
parameters:
  statement: "UPDATE WHERE dartboard = 'Sprint 12' AND status = 'Done' SET dartboard = 'Archive' COMMENT 'Sprint 12 complete'"
  dry_run: false
```

**Step 4 — Set dates on new sprint tasks:**
```yaml
tool_name: execute_dartql
parameters:
  statement: "UPDATE WHERE dartboard = 'Sprint 13' AND start_at IS NULL SET start_at = '2026-04-14' due_at = '2026-04-28'"
  dry_run: true   # preview first
```

**Step 5 — Generate sprint report** (see Sprint Report recipe below).

---

## Recipe: Triage

**When:** Backlog has grown unchecked — identify and escalate urgent work.

**Step 1 — Find overdue tasks:**
```yaml
tool_name: list_tasks
parameters:
  due_before: "today"
  status: "!=Done"
  detail_level: minimal
```

**Step 2 — Find unassigned high-priority tasks:**
```yaml
tool_name: execute_dartql
parameters:
  statement: "WHERE priority >= 4 AND assignee IS NULL"
  dry_run: true
```

**Step 3 — Find blocked tasks (has non-empty blocker_ids):**
```yaml
tool_name: list_tasks
parameters:
  detail_level: full   # then filter client-side for non-empty blocker_ids
```

**Step 4 — Auto-escalate overdue tasks:**
```yaml
tool_name: execute_dartql
parameters:
  statement: "UPDATE WHERE due_at < 'today' AND status != 'Done' SET priority = 5 COMMENT 'Auto-escalated: overdue'"
  dry_run: true   # review before executing
```

---

## Recipe: Team Rebalancing

**When:** A team member is overloaded, someone is leaving, or you need capacity planning.

**Step 1 — Check per-assignee in-progress workload:**
```yaml
tool_name: list_tasks
parameters:
  assignee: "person@company.com"
  status: "In Progress"
  detail_level: minimal
```
Repeat for each team member and compare counts.

**Step 2 — Preview tasks to reassign (dry run):**
```yaml
tool_name: execute_dartql
parameters:
  statement: "UPDATE WHERE assignee = 'overloaded@company.com' AND status = 'Todo' AND priority < 4 SET assignee = 'available@company.com' COMMENT 'Rebalanced from overloaded@company.com'"
  dry_run: true
```

**Step 3 — Execute reassignment after review:**
```yaml
tool_name: execute_dartql
parameters:
  statement: "UPDATE WHERE assignee = 'overloaded@company.com' AND status = 'Todo' AND priority < 4 SET assignee = 'available@company.com' COMMENT 'Rebalanced from overloaded@company.com'"
  dry_run: false
```

---

## Recipe: Stale Task Cleanup

**When:** Quarterly backlog grooming — surface tasks that haven't moved in months.

**Step 1 — Find stale tasks (dry run to preview):**
```yaml
tool_name: execute_dartql
parameters:
  statement: "WHERE updated_at < '2025-10-01' AND status != 'Done' AND status != 'Archived'"
  dry_run: true
```

**Step 2 — Tag them for review:**
```yaml
tool_name: execute_dartql
parameters:
  statement: "UPDATE WHERE updated_at < '2025-10-01' AND status != 'Done' AND status != 'Archived' SET tags = ['stale'] COMMENT 'Flagged as stale for grooming'"
  dry_run: false
```

**Step 3 — After team review, archive confirmed stale tasks:**
```yaml
tool_name: execute_dartql
parameters:
  statement: "UPDATE WHERE tags CONTAINS 'stale' SET status = 'Archived'"
  dry_run: true   # preview first
```

**Step 4 — Delete very old archived tasks (irreversible — use confirm):**
```yaml
tool_name: execute_dartql
parameters:
  statement: "DELETE WHERE status = 'Archived' AND completed_at < '2025-10-01' CONFIRM"
  dry_run: true   # always dry_run before DELETE
```

---

## Recipe: Sprint Report

**When:** Sprint review, end-of-sprint stakeholder updates.

**Step 1 — Count tasks by status:**
```yaml
tool_name: list_tasks
parameters:
  dartboard: "Sprint 12"
  status: "Done"
  detail_level: minimal
```
Repeat for "In Progress" and "Todo" to get all three counts.

**Step 2 — Get dartboard totals:**
```yaml
tool_name: get_dartboard
parameters:
  name: "Sprint 12"
```

**Step 3 — Create report document:**
```yaml
tool_name: create_doc
parameters:
  title: "Sprint 12 Report"
  content: |
    # Sprint 12 Report

    **Completed:** 24 tasks
    **Carried over:** 6 tasks
    **Active blockers:** 2

    ## Highlights
    - [summarize key completions]

    ## Carry-over
    - [list notable incomplete tasks]

    ## Blockers
    - [list blocked tasks with blocker context]
  dartboard: "Reports"
```

---

## Recipe: Priority Recalibration

**When:** "Everything is P5" — priorities have inflated and are no longer meaningful.

**Step 1 — Preview the scope (how many tasks are affected):**
```yaml
tool_name: execute_dartql
parameters:
  statement: "WHERE dartboard = 'Backlog' AND priority >= 3"
  dry_run: true
```

**Step 2 — Reset all backlog priorities to P2 baseline:**
```yaml
tool_name: execute_dartql
parameters:
  statement: "UPDATE WHERE dartboard = 'Backlog' AND priority >= 3 SET priority = 2 COMMENT 'Priority recalibrated — re-triage needed'"
  dry_run: false
```

**Step 3 — Re-triage manually.**
Work through the backlog and set intentional priorities:
- P5: blocking production or customer-impacting now
- P4: must ship this sprint
- P3: planned for next sprint
- P2: backlog with intent
- P1: someday/maybe
