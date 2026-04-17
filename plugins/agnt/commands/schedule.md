---
description: "Schedule a message to be sent to your AI agent at a future time. 定時遣信於智代. Use when: schedule reminder, run task later, send delayed message, automate future action, set timed trigger"
allowed-tools: ["mcp__agnt__session"]
---

排程訊息，於指定時間送達AI編碼代理session。

## 用法

用戶可指定：
- **Session代碼**：目標session（如 "claude-1", "dev"）。省略則列出可用session。
- **時長**：何時送出（如 "5m", "1h", "30s", "2h30m"）
- **訊息**：送給代理之內容

## 步驟

1. 若未提供參數，列出可用session：
   ```
   session {action: "list"}
   ```

2. 若提供session代碼但無時長/訊息，顯示session詳情：
   ```
   session {action: "get", code: "<session_code>"}
   ```

3. 排程訊息：
   ```
   session {action: "schedule", code: "<session_code>", duration: "<duration>", message: "<message>"}
   ```

4. 列出待執行排程任務：
   ```
   session {action: "tasks"}
   ```

5. 取消排程任務：
   ```
   session {action: "cancel", task_id: "<task_id>"}
   ```

## 範例

**排程驗證提醒：**
```
/schedule claude-1 5m "Please verify the build completed successfully"
```

**排程測試檢查：**
```
/schedule dev 10m "Run the test suite and report any failures"
```

**列出所有session：**
```
/schedule
```

**查待執行任務：**
```
/schedule --tasks
```

## 時長格式

使用Go時長語法：
- `30s` — 30秒
- `5m` — 5分鐘
- `1h` — 1小時
- `1h30m` — 1小時30分鐘
- `2h45m30s` — 2小時45分30秒

## 說明

- Session由 `agnt run <command>` 建立（如 `agnt run claude`）
- 每個session有唯一代碼，如 "claude-1" 或 "dev"
- 排程訊息持久化，daemon重啟後仍存在
- 訊息以合成用戶輸入形式送達目標session
