---
name: loop-status
description: "Show status of current or recent workflow loops with progress, metrics, and context hygiene report. 顯示工作流循環狀態：進度、指標、上下文衛生報告. Use when: check loop progress, see workflow status, how is the loop going, show workflow metrics, view completed tasks"
---

# Workflow Loop Status

顯示當前或近期工作流循環之詳細狀態。

## Process 過程

1. **查找循環狀態文件**
   - 當前循環：`.workflow/loop-state.json`
   - 歷史：`.workflow/loop-history/`（已存檔完成的循環）

2. **顯示當前循環狀態**（如正在運行）
```
Ralph Wiggum Workflow Loop - RUNNING
=====================================
Loop ID: abc123
Type: quality
Started: 2026-01-14 09:22:15
Elapsed: 1h 23m 45s

Progress: [3 of 5] 60%
████████████░░░░░░░░

Current Task (In Progress):
→ Task 3: Add user authentication
  Started: 10:30:23 (15m ago)
  Current Stage: adversarial verification
  Subagent: workflow:task-executor (agent-xyz789)
  Iterations: 2
  Adjustments: 1

Completed Tasks:
✓ Task 1: Setup database schema
  Duration: 22m 15s | Iterations: 2 | Adjustments: 1

✓ Task 2: Create API endpoints
  Duration: 18m 30s | Iterations: 1 | Adjustments: 0

Pending Tasks:
  Task 4: Implement authorization
  Task 5: Add logging

Statistics:
- Total iterations: 5
- Total adjustments: 2
- Avg time per task: 20m 22s
- Success rate: 100% (2/2 completed)

Loop State File: .workflow/loop-state.json
```

3. **顯示近期循環**（如無正在運行的）
```
Recent Workflow Loops
=====================

Loop abc123 (quality) - COMPLETED
  Started: 2026-01-14 09:00:00
  Completed: 2026-01-14 11:30:00
  Duration: 2h 30m
  Tasks: 5 completed, 0 failed
  Success rate: 100%

Loop xyz789 (security) - STOPPED
  Started: 2026-01-13 14:00:00
  Stopped: 2026-01-13 15:15:00
  Duration: 1h 15m
  Tasks: 2 completed, 1 failed, 2 pending
  Stop reason: Critical security issue found

To resume: /workflow:start-loop --resume xyz789
```

4. **上下文隔離報告**
```
Context Hygiene Report:
-----------------------
✓ All tasks executed in fresh subagents
✓ No context leakage detected
✓ Average subagent lifetime: 18m 22s
✓ Clean termination rate: 100%

Subagent spawns: 5
SubagentStop hooks fired: 5
Context barrier enforced: 4 times
```

## Usage 使用方法

```bash
# Show current loop status
/workflow:loop-status

# Or just ask:
what's the loop status?
how's the workflow going?
show workflow progress
```

## Data Sources 數據來源

- **循環狀態文件**：`.workflow/loop-state.json`
- **鉤子追蹤數據**：由 SubagentStop 鉤子寫入
- **會話指標**：由 session-init.sh 腳本追蹤
