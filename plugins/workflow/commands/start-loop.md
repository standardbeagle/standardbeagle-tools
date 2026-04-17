---
name: start-loop
description: Start a Ralph Wiggum adversarial loop — context-isolated subagents, multi-stage verification, sequential task execution. 啟動Ralph Wiggum對抗循環：隔離子代理、多階段驗證、順序任務執行. Use when: start workflow loop, begin adversarial loop, run task list, start automation loop, execute tasks sequentially
argument-hint: "[task-list-file]"
---

# Start Ralph Wiggum Adversarial Loop

啟動持續對抗協作循環，以清潔上下文隔離和多階段驗證處理任務。

## Core Principles 核心原則

### Context Hygiene (CRITICAL) 上下文衛生（重要）
```yaml
context_management:
  rule: "Each loop iteration MUST run in a fresh subagent"
  why: "Prevents context pollution and accumulated confusion"
  how: "Main loop orchestrates, spawns new subagent per iteration"
  never: "Reuse subagent context across iterations"
```

### Adversarial Cooperation Model 對抗協作模型
```yaml
roles:
  implementer:
    responsibility: "Execute tasks following instructions"
    mindset: "Make it work correctly"

  verifier:
    responsibility: "Challenge implementation to find flaws"
    mindset: "Break it, find edge cases, question assumptions"

  adjuster:
    responsibility: "Update plans based on discoveries"
    mindset: "Learn and improve iteratively"
```

## Process 過程

### 0. Check for Interrupted Loop 檢查中斷的循環

開始前，檢查上次會話是否被中斷：

```
Read .workflow/loop-state.json if it exists.
If status is "interrupted":
  1. Show the user: "Previous loop was interrupted at [interrupted_at]"
  2. Show completed/total task counts and current_task_index
  3. Ask: "Resume the interrupted loop, or start fresh?"

  If resume:
    - Update loop state status back to "running"
    - Skip to Section 4 (Execute Adversarial Loop) starting at current_task_index

  If start fresh:
    - Delete .workflow/loop-state.json
    - Continue normally
```

### 0.5 Check for Project Rules 檢查項目規則

開始前，驗證項目已安裝規則：

```bash
test -d .claude/rules && test -f .claude/rules/karpathy-principles.md
```

若檢查失敗，警告：

```
Project has not run /dev-standards:setup-project (or the last run predates the
grill integration). The loop will run with default thresholds. Run the setup
command for project-specific tuning.
```

不得阻塞。循環可在默認閾值下運行——此警告僅為信息性。

### 1. Load Task List 加載任務列表

若以參數提供任務列表文件則使用之，否則檢查：
1. `.workflow/tasks.md` (default location)
2. `TASKS.md` in current directory
3. Interactive creation mode

**任務列表格式：**
```markdown
# Task List

## Task 1: [Title]
**Priority:** High|Medium|Low
**Scope:** [max 5 files]
**Description:** Clear, actionable description

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Context:** Any additional context needed

---

## Task 2: [Title]
...
```

### 2. Initialize Loop State 初始化循環狀態

創建循環狀態文件：`.workflow/loop-state.json`

```json
{
  "loop_id": "unique-id",
  "started_at": "ISO timestamp",
  "task_source": "path/to/tasks.md",
  "status": "running",
  "current_task_index": 0,
  "tasks": [
    {
      "id": "task-1",
      "title": "...",
      "status": "pending|in_progress|completed|failed",
      "started_at": null,
      "completed_at": null,
      "subagent_id": null,
      "iterations": 0,
      "adjustments": []
    }
  ],
  "stats": {
    "total_tasks": 0,
    "completed": 0,
    "failed": 0,
    "total_iterations": 0,
    "total_adjustments": 0
  }
}
```

### 4. Execute Adversarial Loop 執行對抗循環

**重要：每個任務必須在全新子代理中運行以保持上下文清潔。**

對列表中每個任務：

#### 4.1 Context Validation Check 上下文驗證檢查

生成子代理前，驗證：
```yaml
pre_spawn_checks:
  - "Task is context-sized (max 5 files)"
  - "Clear acceptance criteria exist"
  - "Previous subagent has terminated (no context leakage)"
  - "Loop state is persisted to disk"
```

#### 4.2 Spawn Fresh Task Executor Subagent 生成全新任務執行器子代理

**模式（強制）：**
```yaml
subagent_execution:
  tool: Task
  subagent_type: "workflow:task-executor"
  description: "Execute task: [short title]"

  prompt: |
    Execute task from workflow loop.

    Loop ID: [loop-id]
    Task ID: [task-id]
    Task Index: [X of Y]

    Task Details:
    Title: [title]
    Priority: [priority]
    Scope: [scope]

    Description:
    [full description]

    Acceptance Criteria:
    [criteria list]

    Context:
    [additional context]

    IMPORTANT:
    - Use the quality adversarial skill
    - Report success/failure with full details
    - Update loop state file on completion
    - This is a FRESH context - no prior task memory
```

**示例：**
```
Task tool call:
  subagent_type: "workflow:task-executor"
  description: "Execute task: Add user authentication"
  prompt: "Execute task task-1 from workflow loop loop-abc123..."
```

#### 4.3 Wait for Subagent Completion 等待子代理完成

子代理將：
1. 執行所選對抗循環技能
2. 在內部追蹤進度
3. 返回成功或失敗及詳細報告
4. 終止前更新 `.workflow/loop-state.json`

**主循環同步等待——不並行執行任務。**

#### 4.4 Process Subagent Result 處理子代理結果

SubagentStop 鉤子觸發後：

**成功時：**
```yaml
actions:
  - "Read subagent completion report from loop state file"
  - "Log completion summary"
  - "Mark task as completed with timestamp"
  - "Continue to NEXT task with NEW subagent (fresh context)"
```

**失敗時：**
```yaml
actions:
  - "Read subagent failure report from loop state file"
  - "Log which stage failed and why"
  - "Mark task as failed"
  - "Decide: retry, skip, or stop loop"
  - "If retry: spawn NEW subagent (still fresh context)"
```

**重要：絕不恢復或重用子代理——始終生成全新的。**

#### 4.5 Context Barrier 上下文屏障

任務之間，主循環：
```yaml
context_barrier:
  persists:
    - "Loop orchestration state (which tasks done)"
    - "Task completion statistics"
    - "Loop configuration (type, source file)"

  discards:
    - "ALL task-specific implementation details"
    - "File contents from previous task"
    - "Code changes from previous task"
    - "Error messages from previous task"

  principle: "Main loop is STATELESS executor, not context accumulator"
```

### 5. Loop Control 循環控制

循環持續至：
- 所有任務成功完成
- 任務失敗且用戶選擇停止
- 用戶說 "stop loop"、"cancel" 或 "pause"
- 會話結束
- 發現嚴重安全問題（立即停止）

**用戶隨時可中斷：**
- "stop the loop"
- "pause execution"
- "skip current task"
- "/workflow:stop-loop"

### 6. Status Reporting 狀態報告

每次迭代後顯示進度：
```
Ralph Wiggum Workflow Loop
==========================
Loop ID: abc123
Status: running

Progress: [X] of [Y] tasks
Current: Task 3 - Add user authentication

Completed:
✓ Task 1: Setup database (2 iterations, 1 adjustment)
✓ Task 2: Create API endpoints (1 iteration, 0 adjustments)

In Progress:
→ Task 3: Add user authentication (iteration 1)

Pending:
  Task 4: Implement authorization
  Task 5: Add logging

Stats:
- Total iterations: 3
- Total adjustments: 1
- Time elapsed: 45m 23s
- Avg time per task: 15m 7s
```

## Loop Iteration Example 循環迭代示例

展示上下文隔離的具體示例：

```yaml
main_loop_execution:

  task_1_first_attempt:
    - action: "Spawn workflow:task-executor subagent"
      context: "FRESH - no prior state"
      prompt: "Execute task-1: Setup database schema"
    - wait: "Subagent completes (returns failure)"
    - result: "Failed at testing stage - missing migration"
    - decision: "Retry with adjusted task"

  task_1_retry:
    - action: "Spawn NEW workflow:task-executor subagent"
      context: "FRESH - learns from loop state file, NOT subagent memory"
      prompt: "Execute task-1 (retry): Setup database schema + migration"
    - wait: "Subagent completes (returns success)"
    - result: "Completed successfully"
    - continue: "To task_2 with NEW subagent"

  task_2:
    - action: "Spawn NEW workflow:task-executor subagent"
      context: "FRESH - knows nothing about database schema implementation"
      prompt: "Execute task-2: Create API endpoints"
    - wait: "Subagent completes (returns success)"
    - result: "Completed successfully"
    - continue: "To task_3 with NEW subagent"

key_principles:
  isolation: "Each subagent is completely isolated"
  state_transfer: "Only via explicit loop state file, not context"
  main_loop_role: "Orchestrator, not executor"
  no_accumulation: "Main loop doesn't accumulate implementation details"
```

## Context-Sized Task Requirements 上下文適配任務要求

每個任務必須：
```yaml
context_sized_task:
  max_files: 5
  max_scope: "Single feature or fix"
  clear_acceptance: true
  bounded_changes: true
  no_dependencies: "Can execute independently"

  if_too_large:
    action: "Split into multiple tasks"
    reason: "Keeps each iteration within context limits"
```

## Usage Examples 使用示例

```bash
# Start with default task list
/workflow:start-loop

# Start with custom task list
/workflow:start-loop my-tasks.md
```

## Integration with Loop State File 與循環狀態文件的集成

所有狀態持久化至 `.workflow/loop-state.json`：
- 主循環讀寫協調狀態
- 子代理終止前更新任務特定狀態
- 鉤子追蹤迭代與調整
- 狀態命令讀取此文件以報告

此機制支持：
- 中斷後恢復
- 並行狀態監控
- 歷史分析
- 審計跟蹤

## Stopping the Loop 停止循環

說以下任一語句：
- "stop the loop"
- "cancel workflow"
- "pause execution"
- "/workflow:stop-loop"

或立即停止：
- "security critical"（發現嚴重漏洞）
- "abort"（緊急停止）
