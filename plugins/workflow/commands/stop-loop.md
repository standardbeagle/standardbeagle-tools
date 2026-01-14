---
name: stop-loop
description: Stop the currently running workflow loop
---

# Stop Workflow Loop

Gracefully stop the currently running Ralph Wiggum workflow loop.

## Process

1. **Check for running loop**
   - Read `.claude/workflow-loop-state.json`
   - Verify status is "running"
   - If no loop running, inform user and exit

2. **Graceful shutdown**
   - Wait for current subagent to complete (if any)
   - Update loop state to "stopped"
   - Record stop timestamp and reason
   - Generate final summary report

3. **Update loop state**
```json
{
  "status": "stopped",
  "stopped_at": "ISO timestamp",
  "stop_reason": "user_requested|error|security_critical|completed",
  "final_stats": {
    "completed_tasks": 0,
    "failed_tasks": 0,
    "pending_tasks": 0,
    "total_iterations": 0,
    "total_time": "duration"
  }
}
```

4. **Display summary**
```
Workflow Loop Stopped
=====================
Loop ID: abc123
Stopped at: 2026-01-14 10:45:23

Final Status:
✓ Completed: 3 tasks
✗ Failed: 1 task
⧖ Pending: 2 tasks

Total iterations: 5
Total time: 1h 23m 45s

Loop state saved to: .claude/workflow-loop-state.json

To resume: /workflow:start-loop --resume abc123
```

## Options

- **Immediate stop**: If critical issue, stop without waiting for subagent
- **Save checkpoint**: Always save current state before stopping
- **Resume capability**: State file allows resuming later

## Usage

```bash
# Stop current loop
/workflow:stop-loop

# Or just say:
stop the loop
cancel workflow
pause execution
```
