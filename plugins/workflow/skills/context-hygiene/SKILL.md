---
name: workflow-context-hygiene
description: "Context isolation and subagent barrier patterns for clean workflow loops. 隔絕上下文，杜絕污染，保循環清潔. Use when: prevent context leak, isolate subagent, manage loop state, enforce context barrier, fresh subagent spawn"
disable-model-invocation: true
---

# Context Hygiene and Subagent Isolation

貫穿工作流循環，維持上下文清潔之原則與模式。

## Core Principle

**每次循環迭代必在全新子代理中執行，上下文清潔。**

## Driver Constraint and Agent Schema

The fresh-subagent-per-iteration pattern only works when the loop runs at the top level. Subagents cannot spawn subagents — the harness scopes the deferred-tool list per-agent and does not surface `Agent`/`Task` to nested runners. Any orchestrator that finds itself inside a subagent must stop and report to the parent rather than degrade to inline execution (which would defeat the entire hygiene model).

Before the first `Agent`/`Task` dispatch:

- **先試**。無預檢，毋查 deferred-tools。
- **成則直行**。
- **若報** `not available`、`no such tool`、`InputValidationError`，乃知 schema 未載或不可用，遂入降級路。

## Why Context Hygiene Matters 上下文衛生之重要

```yaml
problems_without_hygiene:
  context_pollution:
    - "Accumulated state from previous tasks confuses decisions"
    - "Implementation details leak across task boundaries"
    - "Error patterns repeat due to learned bad habits"

  context_overflow:
    - "Token usage grows unbounded across iterations"
    - "Relevant context gets buried in irrelevant details"
    - "Performance degrades over time"

  semantic_drift:
    - "Meaning of terms changes across long conversations"
    - "Assumptions accumulate without validation"
    - "Focus shifts away from original goals"
```

## Subagent Isolation Pattern 子代理隔離模式

### Main Loop (Orchestrator)

**職責**：分派任務至新鮮子代理之狀態機

**保留：**
- 循環配置（類型、來源）
- 任務隊列與順序
- 完成統計
- 迭代計數

**棄置：**
- 一切任務實現細節
- 前次迭代的文件內容
- 錯誤消息與堆棧跡
- 代碼變更與差異

**Implementation:**
```yaml
main_loop:
  state_file: ".workflow/loop-state.json"

  loop_logic: |
    while tasks_remaining:
      task = next_task()
      subagent = spawn_fresh_executor(task)
      result = await subagent.complete()
      update_state(task, result)
      # Context barrier: discard subagent details

  never_accumulates:
    - "Task implementation knowledge"
    - "File-specific details"
    - "Previous task outcomes beyond success/failure"
```

### Task Executor Subagent

**職責**：以清潔上下文從零執行單一任務

**接收：**
- 循環狀態文件中的任務規格
- 循環類型（使用何技能）
- 驗收標準
- 全新代碼庫上下文（自讀文件）

**返回：**
- 成功或失敗
- 完成報告（寫入狀態文件）
- 所作調整（寫入狀態文件）

**Lifetime:**
```yaml
subagent_lifecycle:
  spawn: "Main loop creates fresh subagent via Task tool"
  execute: "Subagent runs adversarial loop skill"
  terminate: "Subagent completes and exits"
  hook: "SubagentStop hook captures metrics"

duration: "Single task only (typically 10-30 minutes)"

key_point: "Subagent terminates completely, context is garbage collected"
```

## Context Barriers 上下文屏障

顯式屏障防上下文洩漏：

### Between Tasks
```yaml
barrier_1_between_tasks:
  location: "After subagent termination, before next spawn"

  enforced_by: "Main loop only reads state file, not subagent memory"

  what_transfers:
    allowed:
      - "Task completed: yes/no"
      - "Iterations count: number"
      - "Adjustments: list of changes to task list"

    blocked:
      - "How task was implemented"
      - "What files were changed"
      - "What code was written"
      - "What errors occurred"
```

### Between Stages (Within Task)
```yaml
barrier_2_between_stages:
  location: "Between adversarial loop stages"

  enforced_by: "Explicit checkpoint and context reset points"

  technique: |
    1. Write stage output to file
    2. Explicitly forget details
    3. Read next stage input from file
    4. Proceed with only necessary context
```

## State Transfer via Files 文件傳遞狀態

**唯一允許的狀態傳遞機制：**

```yaml
state_file_protocol:
  file: ".workflow/loop-state.json"

  writer: "Subagent before termination"
  reader: "Main loop after subagent terminates"

  content_example:
    task_result:
      task_id: "task-3"
      status: "completed"
      started_at: "ISO timestamp"
      completed_at: "ISO timestamp"
      iterations: 2
      adjustments:
        - type: "added_file"
          description: "Added validation helper"
        - type: "modified_criteria"
          description: "Clarified security requirement"
      completion_report:
        summary: "Added user authentication with JWT"
        acceptance_met: true
        verification_passed: true
        tests_added: 5
        tests_passed: 5

key_principle: "State file is CONTRACT, not implementation details"
```

## Verification Checklist 驗證清單

生成下一子代理前：

```yaml
pre_spawn_checklist:
  - name: "Previous subagent terminated"
    check: "SubagentStop hook fired"
    why: "Ensures clean context boundary"

  - name: "State file updated"
    check: "task.completed_at is set"
    why: "Ensures results are persisted"

  - name: "Main loop context is clean"
    check: "No accumulated file contents or code"
    why: "Prevents context pollution"

  - name: "Task is context-sized"
    check: "Task scope <= 5 files"
    why: "Ensures subagent can complete within limits"

all_must_pass: true
```

## Anti-Patterns to Avoid 反模式警示

### ❌ Context Accumulation
```yaml
bad_pattern_1:
  what: "Main loop remembers implementation details"
  example: "Task 1 changed auth.ts to use JWT, so Task 2 assumes JWT"
  why_bad: "Creates implicit dependencies, breaks isolation"

  instead: "Each task reads codebase fresh, makes own decisions"
```

### ❌ Subagent Reuse
```yaml
bad_pattern_2:
  what: "Reusing same subagent for multiple tasks"
  example: "Keep subagent alive, feed it next task"
  why_bad: "Context accumulates, confusion grows, token usage explodes"

  instead: "Terminate subagent, spawn fresh for next task"
```

### ❌ Implicit State Transfer
```yaml
bad_pattern_3:
  what: "Relying on conversation memory"
  example: "Subagent mentions 'as we did in last task'"
  why_bad: "No last task in fresh context - breaks isolation"

  instead: "All context in task specification or codebase files"
```

### ❌ Shared Mutable State
```yaml
bad_pattern_4:
  what: "Multiple subagents writing to same state"
  example: "Parallel tasks updating shared config"
  why_bad: "Race conditions, lost updates, chaos"

  instead: "Sequential execution, single writer per state file"
```

## Best Practices 最佳實踐

### ✓ Explicit Context Boundaries
```yaml
good_practice_1:
  technique: "Clearly mark where context resets"
  example: "// Context barrier: previous task details discarded"
  benefit: "Makes isolation visible and intentional"
```

### ✓ Minimal State Transfer
```yaml
good_practice_2:
  technique: "Transfer only essential state via state file"
  example: "Pass success/failure + metrics, not implementation"
  benefit: "Prevents accidental context leakage"
```

### ✓ Fresh File Reads
```yaml
good_practice_3:
  technique: "Each subagent reads files itself"
  example: "Don't pass file contents, pass file paths"
  benefit: "Ensures latest state, reduces context size"
```

### ✓ Context-Sized Tasks
```yaml
good_practice_4:
  technique: "Keep tasks small (1-5 files)"
  example: "Split large features into independent tasks"
  benefit: "Fits in subagent context, completes faster"
```

## Monitoring Context Hygiene 監控衛生指標

追蹤以下指標：

```yaml
hygiene_metrics:
  subagent_lifetime:
    target: "10-30 minutes"
    alarm: "> 60 minutes suggests context overflow"

  context_size:
    target: "< 50k tokens per subagent"
    alarm: "> 100k tokens suggests accumulation"

  state_file_size:
    target: "< 10kb per task"
    alarm: "> 50kb suggests over-sharing"

  subagent_spawns:
    target: "1 per task (plus retries)"
    alarm: "Multiple spawns without termination"

  termination_rate:
    target: "100% clean termination"
    alarm: "Subagents timing out or hanging"
```

## Implementation Reference 實現參考

見 `start-loop.md` 命令之具體實現：
- 子代理生成模式
- 上下文屏障執行
- 狀態文件協議
- 驗證清單

鉤子系統自動追蹤上列指標。
