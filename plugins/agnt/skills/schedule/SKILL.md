---
name: agnt-schedule
description: "Schedule messages to AI agent sessions with time delays. 排程代理訊息，延時投遞。 Use when: schedule reminder, delay message to agent, queue follow-up, manage scheduled tasks, set timed verification"
disable-model-invocation: true
---

排程助手：將訊息按指定延時投遞至代理會話。

## 適用時機

用此技能當用戶欲：
- 排程提醒或後續訊息至代理
- 設定延時驗核
- 佇列未來投遞之訊息
- 管理排程任務（檢視、取消）

## 能力

1. **列出會話**：顯示可接收排程訊息之活躍代理會話
2. **排程訊息**：佇列未來投遞至指定會話
3. **檢視任務**：列出所有待排程任務
4. **取消任務**：執行前移除排程任務

## 工作流

### 步驟一：識別目標會話

先列出可用會話：
```
session {action: "list"}
```

會話以代碼識別，如 "claude-1"、"claude-2"、"dev" 等。

### 步驟二：排程訊息

取得會話代碼後：
```
session {action: "schedule", code: "claude-1", duration: "5m", message: "Please verify the deployment completed successfully"}
```

### 步驟三：確認排程

排程後，工具返回任務ID。告知用戶：
- 任務ID（備後查用）
- 預定投遞時間
- 目標會話

## 時長格式

將用戶意圖解析為 Go duration 格式：
- "in 5 minutes" → "5m"
- "in an hour" → "1h"
- "in 30 seconds" → "30s"
- "in 2 hours and 30 minutes" → "2h30m"
- "in 90 minutes" → "90m" or "1h30m"

## 常用場景

### 驗核提醒
User: "Remind me to check if tests pass in 10 minutes"
```
session {action: "schedule", code: "claude-1", duration: "10m", message: "Please check if the test suite passed and report any failures"}
```

### 部署驗核
User: "Schedule a deployment verification in 5 minutes"
```
session {action: "schedule", code: "claude-1", duration: "5m", message: "Verify the deployment completed successfully. Check the health endpoint and report status."}
```

### 構建完成
User: "Let me know when 15 minutes have passed so I can review the build"
```
session {action: "schedule", code: "claude-1", duration: "15m", message: "15 minutes have passed. Please review the build output and summarize any issues."}
```

## 任務管理

### 列出待排程任務
```
session {action: "tasks"}
```

### 取消任務
```
session {action: "cancel", task_id: "<task_id>"}
```

## 注意事項

- 會話須運行中（`agnt run` 活躍）方可接收排程訊息
- 會話斷線，訊息最多重試3次
- 任務按項目持久化存儲於 `.agnt/scheduled-tasks.json`
- 排程器運行於守護進程，任務於客戶端斷線後仍存活
