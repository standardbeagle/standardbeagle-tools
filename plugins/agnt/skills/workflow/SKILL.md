---
name: agnt-workflow
description: "Manage task completion workflows with enforced review cycles. 管理任務完成工作流，強制審查循環。 Use when: set up development workflow, enforce code review, prevent premature completion, track multi-phase work, require testing before done"
disable-model-invocation: true
---

工作流管理助手：建立並管理自強制任務完成工作流。

## 目的

通過強制以下機制防止過早完成聲明：
1. 多階段工作流（實現→審查→測試→審查→完成）
2. 最少審查循環次數
3. 自動徹底性提示
4. 跨任務狀態追蹤

## 適用時機

用此技能當用戶欲：
- 為複雜任務建立開發工作流
- 確保完成前徹底代碼審查
- 防止無驗證即聲明「已完成」
- 追蹤多階段工作進度

## 工作流設置

### 步驟一：創建工作流文件

以適當模板創建 `.agnt/workflow.json`。

**標準開發工作流：**
```json
{
  "name": "development",
  "states": {
    "init": {
      "type": "work",
      "prompt": "Implement ALL requirements. Do not claim complete until everything is done.",
      "on_complete": "self_review"
    },
    "self_review": {
      "type": "review",
      "prompt": "Verify implementation:\n1. List ALL files modified\n2. Check each requirement\n3. Identify any gaps",
      "review_prompt": "Review more carefully. Did you check EVERYTHING?",
      "max_attempts": 2,
      "on_complete": "testing"
    },
    "testing": {
      "type": "gate",
      "prompt": "Run tests. Fix failures. Add new tests if needed.",
      "on_complete": "code_review"
    },
    "code_review": {
      "type": "review",
      "prompt": "Final review:\n- Code style\n- Security\n- Documentation\n- No debug code",
      "review_prompt": "Check again for issues.",
      "max_attempts": 2,
      "on_complete": "final"
    },
    "final": {
      "type": "final",
      "prompt": "All phases complete! Task is truly done."
    }
  }
}
```

### 步驟二：初始化狀態

工作流引擎自動創建 `.agnt/workflow-state.json` 追蹤：
- 當前狀態
- 轉換歷史
- 審查嘗試次數

### 步驟三：逐階段推進

工作流引擎攔截「完成」訊號並：
1. 查看是否已有足夠審查次數
2. 需要更多審查時發送提示
3. 就緒時轉入下一狀態
4. 阻止過早完成聲明

## 狀態類型

| Type | Purpose |
|------|---------|
| `work` | Implementation phase |
| `review` | Enforced review with min attempts |
| `gate` | Checkpoint requiring passage |
| `fix` | Fix phase that loops back |
| `final` | Terminal completion state |

## 自定義技巧

1. **增加max_attempts**：用於關鍵審查
2. **在提示中添加具體清單**
3. **使用fix循環**：迭代改進
4. **在風險轉換前添加gate**

## 查看狀態

讀取 `.agnt/workflow-state.json` 查看：
- 當前階段
- 轉換歷史
- 各狀態嘗試次數

## 常見問題

**"卡在審查"**：代理不斷聲明完成但未通過審查。提示應引導其徹底性。

**"跳過階段"**：工作流引擎僅在有效完成訊號上轉換。若階段似乎被跳過，查看工作流定義。

**"未觸發"**：確保 `.agnt/workflow.json` 存在且為有效JSON。引擎僅在此文件存在時激活。
