---
name: stop-loop
description: Gracefully stop the currently running workflow loop with checkpoint save. 優雅停止當前工作流循環，保存檢查點. Use when: stop workflow loop, cancel loop, pause execution, halt workflow, stop current loop
---

# Stop Workflow Loop

優雅停止當前正在運行的 Ralph Wiggum 工作流循環。

## Process 過程

1. **檢查正在運行的循環**
   - 讀取 `.workflow/loop-state.json`
   - 驗證狀態為 "running"
   - 若無循環運行，通知用戶並退出

2. **優雅關閉**
   - 等待當前子代理完成（若有）
   - 更新循環狀態為 "stopped"
   - 記錄停止時間戳與原因
   - 生成最終摘要報告

3. **更新循環狀態**
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

4. **顯示摘要**
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

Loop state saved to: .workflow/loop-state.json

To resume: /workflow:start-loop --resume abc123
```

## Options 選項

- **立即停止**：若有嚴重問題，不等待子代理直接停止
- **保存檢查點**：停止前始終保存當前狀態
- **恢復能力**：狀態文件允許稍後恢復

## Usage 使用方法

```bash
# Stop current loop
/workflow:stop-loop

# Or just say:
stop the loop
cancel workflow
pause execution
```
