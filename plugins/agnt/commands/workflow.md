---
description: "Set up a self-enforcing workflow state machine for task completion. 建自律工作流狀態機以竟任務. Use when: enforce task workflow, set up state machine, automate task progression, track task states, structured multi-step process"
allowed-tools: ["Read", "Write", "mcp__agnt__session"]
---

建立防止過早完成聲明並強制審查循環之工作流狀態機。

## 問題

LLM常：
- 3階段任務完成第1階段後聲稱「完成」
- 跳過工作或中途虛構階段
- 需要提醒完成所有工作
- 真正完成前需多輪審查/修復循環

## 解決方案

自轉換狀態機：
1. 追蹤當前工作流階段
2. 攔截「完成」信號
3. 允許完成前強制審查循環
4. 自動提示下一階段

## 工作流模板

### 標準開發工作流

建立 `.agnt/workflow.json`：

```json
{
  "name": "development",
  "description": "Standard dev workflow with code review and testing",
  "states": {
    "init": {
      "type": "work",
      "prompt": "Starting development workflow. Please implement the requested feature/fix. Do not claim completion until ALL requirements are implemented.",
      "on_complete": "self_review"
    },
    "self_review": {
      "type": "review",
      "prompt": "Implementation reported complete. Before proceeding, please:\n1. List ALL files you modified\n2. Verify each requirement was addressed\n3. Check for any TODOs or incomplete sections\n4. Identify any edge cases not handled\n\nOnly say 'complete' when you've verified everything.",
      "review_prompt": "Please review more carefully. Check:\n- Did you implement ALL requirements?\n- Are there any incomplete sections?\n- Did you handle error cases?\n- Is the code properly tested?",
      "max_attempts": 2,
      "on_complete": "testing"
    },
    "testing": {
      "type": "gate",
      "prompt": "Self-review passed. Now run the test suite:\n1. Run all relevant tests\n2. Fix any failures\n3. Add tests for new functionality if needed\n\nReport 'complete' only when all tests pass.",
      "on_complete": "code_review"
    },
    "code_review": {
      "type": "review",
      "prompt": "Tests passing. Final code review:\n1. Check code style and conventions\n2. Look for potential bugs or security issues\n3. Verify documentation is updated\n4. Ensure no debug code or console.logs remain\n\nIf issues found, fix them. Say 'complete' when code is production-ready.",
      "review_prompt": "Please be thorough. Check:\n- Security vulnerabilities?\n- Performance issues?\n- Code duplication?\n- Missing error handling?",
      "max_attempts": 2,
      "on_complete": "final"
    },
    "final": {
      "type": "final",
      "prompt": "All phases complete! The implementation has passed:\n✓ Self-review\n✓ Testing\n✓ Code review\n\nThe task is now truly complete."
    }
  }
}
```

### 嚴格審查工作流（多輪循環）

```json
{
  "name": "strict",
  "description": "Strict workflow with multiple mandatory review cycles",
  "states": {
    "init": {
      "type": "work",
      "prompt": "Starting strict workflow. Implement ALL requirements before reporting complete.",
      "on_complete": "review_1"
    },
    "review_1": {
      "type": "review",
      "prompt": "Review Round 1: Check completeness\n- Are ALL requirements implemented?\n- Any skipped or partial implementations?\n- List every file changed and why.",
      "review_prompt": "Not thorough enough. List EVERY change made and verify EVERY requirement.",
      "max_attempts": 2,
      "on_complete": "review_2"
    },
    "review_2": {
      "type": "review",
      "prompt": "Review Round 2: Check quality\n- Any bugs or edge cases?\n- Error handling complete?\n- Code readable and maintainable?",
      "review_prompt": "Look more carefully for issues. Check error paths and edge cases.",
      "max_attempts": 2,
      "on_complete": "testing"
    },
    "testing": {
      "type": "gate",
      "prompt": "Run ALL tests. Fix any failures. Add new tests if needed.",
      "on_complete": "review_3"
    },
    "review_3": {
      "type": "review",
      "prompt": "Final Review: Production readiness\n- Security checked?\n- Performance acceptable?\n- Documentation updated?\n- No debug code?",
      "review_prompt": "Final check - be extremely thorough.",
      "max_attempts": 1,
      "on_complete": "final"
    },
    "final": {
      "type": "final",
      "prompt": "Workflow complete after 3 review rounds and testing."
    }
  }
}
```

### 修復審查迴圈工作流

```json
{
  "name": "fix-loop",
  "description": "Workflow that loops between fixing and reviewing",
  "states": {
    "init": {
      "type": "work",
      "prompt": "Implement the feature/fix.",
      "on_complete": "review"
    },
    "review": {
      "type": "review",
      "prompt": "Review the implementation. If ANY issues found, list them and we'll fix.",
      "review_prompt": "Look again - are you SURE there are no issues?",
      "max_attempts": 2,
      "on_complete": "confirm_no_issues"
    },
    "confirm_no_issues": {
      "type": "gate",
      "prompt": "You found no issues. Confirm by saying 'no issues confirmed' or list issues to fix.",
      "next": "fix",
      "on_complete": "testing"
    },
    "fix": {
      "type": "fix",
      "prompt": "Fix the identified issues, then report complete.",
      "on_complete": "review"
    },
    "testing": {
      "type": "gate",
      "prompt": "Run tests to verify.",
      "on_complete": "final"
    },
    "final": {
      "type": "final",
      "prompt": "Complete! All issues resolved and tests passing."
    }
  }
}
```

## 狀態類型

| Type | Behavior |
|------|----------|
| `work` | 正常工作階段，完成時轉換 |
| `review` | 允許「完成」前強制N次嘗試 |
| `gate` | 需明確通過之檢查點 |
| `fix` | 迴圈回審查之修復階段 |
| `final` | 終止狀態，工作流完成 |

## 狀態屬性

| Property | Description |
|----------|-------------|
| `type` | 狀態類型（見上） |
| `prompt` | 進入此狀態時送出之訊息 |
| `review_prompt` | 審查嘗試不足時送出之訊息 |
| `max_attempts` | 允許通過前最少審查次數 |
| `on_complete` | 「完成」有效時之下一狀態 |
| `next` | 替代下一狀態 |

## 查看工作流狀態

當前狀態儲存於 `.agnt/workflow-state.json`：

```json
{
  "current_state": "review_1",
  "history": [
    {"from": "init", "to": "review_1", "reason": "Work complete", "time": "..."}
  ],
  "attempts": {
    "review_1": 1
  }
}
```

## 提示

1. **提示中寫具體內容** — 明確告訴代理要檢查什麼
2. **使用max_attempts** — 要求多輪審查確保徹底性
3. **含清單** — 給出具體驗證項目
4. **迴圈修復** — 用修復→審查迴圈作迭代改進
5. **重要轉換前設閘門** — 測試/部署前使用gate
