---
name: loop-orchestration
description: Main loop orchestration — task queue, subagent lifecycle, state machine, error recovery. 主循環協調：任務隊列、子代理生命週期、狀態機、錯誤恢復. Use when: orchestrate workflow loop, manage task queue, spawn subagent, handle loop state, recover from error
---

# Loop Orchestration

以清潔上下文管理協調對抗循環之模式。

## Orchestrator Responsibilities 協調者職責

主循環（在主代理中運行）僅有以下職責：

```yaml
orchestrator_role:
  responsibilities:
    - "Maintain task queue"
    - "Spawn fresh subagents"
    - "Wait for subagent completion"
    - "Update loop state file"
    - "Report progress"
    - "Handle user commands (stop, pause, skip)"

  does_not:
    - "Execute tasks directly"
    - "Accumulate implementation context"
    - "Remember task details"
    - "Make task-specific decisions"
```

## State Machine 狀態機

```yaml
loop_states:
  initializing:
    actions: ["Load tasks", "Validate", "Setup state file"]
    next: "running"

  running:
    actions: ["Spawn subagent", "Wait", "Process result"]
    next: "running|completed|stopped|failed"

  completed:
    actions: ["Generate summary", "Archive state"]
    terminal: true

  stopped:
    actions: ["Save checkpoint", "Generate summary"]
    terminal: true

  failed:
    actions: ["Log failure", "Generate report"]
    terminal: true
```

## Subagent Lifecycle Management 子代理生命週期管理

```yaml
lifecycle:
  spawn:
    tool: "Task"
    subagent_type: "workflow:task-executor"
    context: "FRESH - no accumulated state"
    input: "Task spec from state file"

  monitor:
    technique: "Synchronous wait (blocking)"
    why: "Ensures sequential execution, no race conditions"

  terminate:
    trigger: "Subagent returns result"
    hook: "SubagentStop fires"
    cleanup: "Context is garbage collected"

  never:
    - "Reuse subagent for multiple tasks"
    - "Pass context between subagents"
    - "Run subagents in parallel"
```

## Plan-Update Presentation Between Ticks Tick 間的計劃更新呈現

每個 tick 之間（子代理返回後、下次生成前），讀取 `.workflow/loop-state.json` 中上一任務審查步驟寫入的 `pending_plan_updates`。

```yaml
tick_transition:
  read: ".workflow/loop-state.json"
  extract: "pending_plan_updates[]"
  if_any:
    present_to_user: |
      The last task surfaced <N> plan-update proposals:

      <for each proposal>
        <title> (<trigger>, urgency:<urgency>)
      </for>

      Schedule any of these now? (default: no, they stay in backlog)
    default_answer: "no"
    on_accept:
      action: "Invoke dev-standards:grill-task on the accepted proposal, insert as next task"
    on_defer:
      action: "Leave in pending_plan_updates with urgency tag"
    on_reject:
      action: "Remove from pending_plan_updates, append fingerprint to .claude/refactor-rejects.txt"

never:
  - "Auto-accept proposals"
  - "Block next tick on proposal decisions"
```

目標是呈現積壓而不中斷焦點。默認「否」保持循環推進。

## State File Protocol 狀態文件協議

唯一真實來源：`.workflow/loop-state.json`

**寫入者**：
- 主循環：更新協調狀態
- 子代理：終止前更新任務特定狀態

**讀取者**：
- 主循環：讀取以決定下一動作
- 子代理：生成時讀取任務規格
- 狀態命令：讀取以報告
- 鉤子：讀取以獲取指標

**鎖定**：基於文件的鎖定防止並發寫入

### 影子模式欄位（shadow-mode fields; optional; backward-compatible）

風險管道啟用時（`.claude/rules/risk.md` frontmatter `risk_pipeline.enabled == true`），狀態文件可含下列可選欄位。舊版讀者未知此欄者須略之；缺欄不破任何既有路徑。

```yaml
loop_state_schema_extensions:
  top_level:
    risk_shadow_file:
      type: "string"
      default: ".workflow/risk-shadow.jsonl"
      optional: true
      purpose: "指向 add-task + review-dispatch 記錄之遙測流"

  per_task_entry:
    risk_vector:
      type: "object"
      optional: true
      shape: { b: 0, d: 0, s: 0, r: 0, u: 0, scalar: 0, crit_axes: [] }
      source: "risk-pipeline:classify 輸出，自規劃期寫入"
      purpose: "後續階段（Phase 4 派遣比對）無需重算；僅讀"

backward_compat:
  - "舊讀者略過未知欄即可"
  - "風險管道缺或禁則兩欄皆省，schema 仍合法"
  - "無 migration 需；新欄純增"

write_note: "若風險管道啟，tasks[] 之每項應含 risk_vector；主循環與 task-executor subagent 皆可寫。"
```

## Error Recovery 錯誤恢復

```yaml
error_handling:
  subagent_timeout:
    after: "2 hours"
    action: "Kill subagent, mark task failed, continue or stop"

  subagent_crash:
    detection: "No result returned"
    action: "Mark task failed, log crash, decide retry"

  state_file_corruption:
    detection: "JSON parse error"
    action: "Restore from backup, log error, alert user"

  critical_security:
    detection: "Task marked security-critical failure"
    action: "Stop loop immediately, alert user"
```

## Progress Reporting 進度報告

每次迭代後報告：
```
Progress: [X of Y] ▰▰▰▰▰▰▱▱▱▱ 60%
Current: Task 3 - [title]
Status: [stage]
Time: 15m elapsed
```

## Usage Patterns 使用模式

見 `start-loop.md` 此協調模式之具體實現。
