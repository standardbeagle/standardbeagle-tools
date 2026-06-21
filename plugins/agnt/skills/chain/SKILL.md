---
name: agnt-chain
description: "\"Chain commands to run automatically when events occur. 事發自動鏈接命令. Use when: automate command chains, trigger on events, set up command pipeline, react to file changes, event-driven automation\""
disable-model-invocation: true
allowed-tools: "[\"mcp__agnt__session\", \"Read\", \"Write\"]"
---

設置事件觸發後自動執行之命令鏈。

## 用法

鏈接命令於以下觸發：
- **工具完成**：特定工具完成後執行（Write、Edit、Bash、Task等）
- **任務完成**：Task代理完成時執行
- **任何成功/失敗**：基於結果之條件執行

## 鏈配置

鏈儲存於專案中之 `.agnt/chains.json`：

```json
{
  "chains": [
    {
      "id": "review-after-edit",
      "trigger": "tool:Edit",
      "condition": "success",
      "command": "/code-review",
      "oneshot": false
    }
  ]
}
```

## 步驟

### 1. 列出當前鏈

讀鏈文件查現有配置：
```
Read .agnt/chains.json
```

### 2. 新增鏈

建立或更新鏈文件：

**範例：編輯後代碼審查：**
```json
{
  "chains": [
    {
      "id": "auto-review",
      "trigger": "tool:Edit",
      "condition": "success",
      "command": "/code-review the changes I just made",
      "oneshot": false
    }
  ]
}
```

**範例：寫文件後執行測試：**
```json
{
  "chains": [
    {
      "id": "auto-test",
      "trigger": "tool:Write",
      "condition": "success",
      "command": "Please run the test suite to verify my changes",
      "oneshot": false
    }
  ]
}
```

**範例：一次性鏈（執行一次後自動移除）：**
```json
{
  "chains": [
    {
      "id": "deploy-check",
      "trigger": "task:complete",
      "condition": "success",
      "command": "/schedule claude-1 5m 'Verify the deployment completed successfully'",
      "oneshot": true
    }
  ]
}
```

### 3. 移除鏈

編輯鏈文件移除不需要的鏈。

## 觸發器類型

| Trigger | Description |
|---------|-------------|
| `tool:Edit` | Edit工具完成後 |
| `tool:Write` | Write工具完成後 |
| `tool:Bash` | Bash工具完成後 |
| `tool:Task` | Task代理完成後 |
| `tool:*` | 任何工具完成後 |
| `task:complete` | Task代理結束後 |

## 條件

| Condition | Description |
|-----------|-------------|
| `success` | 僅工具成功時執行（預設） |
| `failure` | 僅工具失敗時執行 |
| `always` | 無論結果均執行 |

## 鏈屬性

| Property | Required | Description |
|----------|----------|-------------|
| `id` | 是 | 鏈之唯一識別符 |
| `trigger` | 是 | 觸發鏈之事件 |
| `command` | 是 | 送至session之訊息/命令 |
| `condition` | 否 | 執行時機（預設："success"） |
| `session` | 否 | 目標session代碼（預設：當前專案） |
| `oneshot` | 否 | 首次執行後移除（預設：false） |

## 範例工作流

### 自動代碼審查管道
```json
{
  "chains": [
    {
      "id": "review-edits",
      "trigger": "tool:Edit",
      "condition": "success",
      "command": "Please review the code I just edited for any issues"
    },
    {
      "id": "test-after-review",
      "trigger": "tool:Task",
      "condition": "success",
      "command": "Run the relevant tests for the files I modified"
    }
  ]
}
```

### 建置驗證管道
```json
{
  "chains": [
    {
      "id": "build-check",
      "trigger": "tool:Bash",
      "condition": "success",
      "command": "/schedule claude-1 2m 'Check if the build completed and report any errors'"
    }
  ]
}
```

## 說明

- 鏈為專案專屬（儲存於 `.agnt/chains.json`）
- 鏈勾子在PostToolUse事件上執行
- 命令可為純文字訊息或斜線命令
- 用oneshot處理應自動移除之臨時鏈
- 鏈可觸發其他鏈（注意迴圈！）
