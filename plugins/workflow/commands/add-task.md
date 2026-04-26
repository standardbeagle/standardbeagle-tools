---
name: add-task
description: "Add a context-sized task to the workflow queue via grill-task interrogation. 添加上下文適配任務至工作流隊列，通過grill-task審訊. Use when: add workflow task, queue a new task, create task for loop, add task interactively, submit task to workflow"
argument-hint: "[task-title]"
context: fork
agent: general-purpose
---

<!-- CC 2.1 fork decision: grill-task interrogation is multi-step and verbose (probe project, hierarchy gating, planning review). Forking keeps the parent free of grill detail — only final task spec returns. general-purpose is sufficient; no specialized agent skill set required. -->


# Add Task to Workflow

以適當的上下文大小指引，向工作流任務列表添加新任務。

## Process 過程

1. **獲取任務標題**
   - 若作為參數提供則直接使用
   - 否則向用戶詢問標題

2. **調用 grill-task**

調用 `dev-standards:grill-task`，傳入任務標題及用戶提供的任何上下文。該技能探測項目上下文，運行分層審訊，執行規劃時質量審查（直接性、問題/方案匹配、可測性、過度工程守衛、方案深度），並返回已審訊的 `task_spec` 及任何 `backflow_writes`。

- 若 grill 返回 `verdict: OK`，使用返回的 `task_spec` 字段（priority → `task_spec.tier` 映射，description → `task_spec.requested`，acceptance → `task_spec.acceptance`，scope → `task_spec.scope`，context → `task_spec.refs`），不再直接詢問用戶。
- 若 grill 返回 `verdict: TOO_LARGE_TO_GRILL`，不得向 `.workflow/tasks.md` 寫入任何內容。向用戶報告任務必須拆分，建議分解方式，然後停止。
- 若 grill 返回 `verdict: ABORTED`，不作任何操作——用戶在確認界面取消了。

繼續步驟3前，先向項目提交任何 `backflow_writes`。

優先級由 tier 映射：
- `minimal` → Low
- `standard` → Medium
- `comprehensive` → Medium
- `architectural` → High

3. **Context-sizing validation 上下文大小驗證**

Check that task is context-sized:
```yaml
validation:
  max_files: 5
  clear_scope: true
  bounded_changes: true
  independent: true  # No dependencies on other pending tasks

if_too_large:
  action: "Suggest splitting into multiple tasks"
  prompt: "This task seems large. Would you like to split it?"
```

**風險權威分級 (authoritative risk classify when enabled; legacy fallback)**：若風險管道裝且啟，調 `risk-pipeline:classify` 以同入參，風險裁決為權威驅動 add-task 通/拒與 reviewer 規劃；`enabled: false` 時退回既有 file-count 邏輯：

```yaml
availability_check:
  required:
    - "plugins/risk-pipeline/skills/risk-classify.md exists"
    - ".claude/rules/risk.md exists with frontmatter risk_pipeline.enabled == true"
  if_unavailable:
    action: "Skip invocation; write record with risk:{enabled:false}"
    outcome: "Legacy file-count flow drives add-task (fallback path)"

if_available:
  invoke: "risk-pipeline:classify with {task_id, task_spec, touched_files}"
  do:
    - "Route add-task off risk verdict (refuse on verdict == split_required)"
    - "Apply risk.required_reviewers to persisted reviewer plan"
    - "Preserve file-count validation above as secondary signal"

telemetry_write:
  path: ".workflow/risk-shadow.jsonl"
  append_json_line:
    ts: "<ISO timestamp>"
    event: "add_task"
    task_id: "<dart id or spec hash>"
    legacy_reviewers: []
    risk:
      enabled: true
      verdict: "<classify verdict>"
      pipeline_tier: "<smoke|light|dim_matched|architectural>"
      scalar: 0
      vector: { b: 0, d: 0, s: 0, r: 0, u: 0, crit_axes: [] }
      required_reviewers: []
    reviewer_agreement: "match"
    authoritative: "risk"
```

`risk.enabled == false` 時 `risk` 欄略為 `{"enabled": false}`，其餘 risk 欄與 `required_reviewers` 省；`reviewer_agreement` 仍寫 `match`；`authoritative` 於回退路徑記 `"legacy"`，啟用態恒記 `"risk"`。

4. **添加至任務列表**

Append to `.workflow/tasks.md`:
```markdown
---

## Task X: [Title]
**Priority:** [High|Medium|Low]
**Scope:** [max 5 files]
**Added:** [ISO timestamp]
**Status:** Pending

**Description:**
[Clear, actionable description]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Context:**
[Any additional context needed]
```

5. **更新循環狀態（若循環正在運行）**

若循環當前正在運行：
- 更新 `.workflow/loop-state.json`
- 向 tasks 數組添加任務
- 遞增 total_tasks 計數器
- 任務將在下次迭代中被處理

6. **確認**
```
Task Added Successfully
=======================
Task ID: task-6
Title: [title]
Priority: [priority]
Status: Pending

Added to: .workflow/tasks.md

Next Steps:
- Task will be executed in loop order
- If loop running, it will pick this up automatically
- To start loop: /workflow:start-loop
```

## Usage 使用方法

```bash
# Add task with title
/workflow:add-task "Add user authentication"

# Add task interactively
/workflow:add-task

# Or just say:
add a workflow task
add task to the loop
```

## Context-Sizing Best Practices 上下文大小最佳實踐

創建任務時：
- **保持範圍小**：最多1-5個文件
- **使其獨立**：無依賴即可執行
- **清晰驗收**：必須有可驗證標準
- **有界變更**：具體功能或修復，非開放式
- **無假設**：包含所有必要上下文

**好任務：**
```
Title: Add email validation to registration form
Scope: src/components/RegisterForm.tsx (1 file)
Criteria:
- [ ] Email field validates format
- [ ] Shows error message for invalid email
- [ ] Tests pass
```

**差任務（過大）：**
```
Title: Build authentication system
Scope: Multiple files across backend and frontend
Criteria:
- [ ] Users can authenticate
- [ ] System is secure
```

更好做法：拆分為5個以上上下文適配任務
