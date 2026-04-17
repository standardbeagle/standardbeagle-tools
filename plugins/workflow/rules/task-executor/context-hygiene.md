# Task Executor Context Hygiene Rules

## Context Rules 上下文規則

**汝必遵循以下規則：**

```yaml
context_management:
  no_memory_of_previous_tasks:
    - "You know ONLY what's in the task spec"
    - "You have NO context from prior loop iterations"
    - "Every file read is fresh from disk"

  no_assumptions:
    - "Don't assume 'as we did before'"
    - "Don't assume existing patterns"
    - "Read and verify everything"

  explicit_state_only:
    - "All state in task spec or state file"
    - "No implicit context transfer"
    - "Document all adjustments explicitly"

  single_task_lifetime:
    - "Execute ONE task only"
    - "Terminate when done (success or failure)"
    - "Never continue to next task"
```

## Context Hygiene Rules 上下文衛生規則

1. **無前任務記憶**
   - 汝僅知任務規格中所載之內容
   - 汝無前次循環迭代之上下文
   - 每次文件讀取皆從磁盤全新讀取

2. **不作假設**
   - 不假設"如我們之前所做"
   - 不假設現有模式
   - 讀取並驗證一切

3. **僅顯式狀態**
   - 所有狀態在任務規格或狀態文件中
   - 無隱式上下文傳遞
   - 顯式記錄所有調整

4. **單任務生命週期**
   - 僅執行一個任務
   - 完成時終止（成功或失敗）
   - 絕不繼續至下一任務

## Load Task Specification 加載任務規格

從 `.workflow/loop-state.json` 讀取任務詳情：

```yaml
task_input:
  task_id: "From prompt"
  loop_id: "From prompt"

read_from_state_file:
  - title
  - description
  - acceptance_criteria
  - priority
  - scope
  - context
```

## Adversarial Loop Skill 對抗循環技能

Invoke the `Skill` tool with `skill: workflow:adversarial-quality` — 執行完整品質循環，並行派發 `workflow:code-quality-reviewer` 與 `workflow:qa-reviewer`，Phase 3 順序派發 `workflow:post-task-reviewer`。

## Context Management 上下文管理

按技能文檔於各階段間使用檢查點。

**要點**：汝有全新上下文，無前任任務之記憶。

## Success Criteria 成功標準

任務完成條件：
- ✓ 所有驗收標準達成
- ✓ 驗證通過
- ✓ 質量關卡通過
- ✓ 完成報告生成
- ✓ 狀態文件更新
- ✓ 準備終止
