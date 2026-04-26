---
name: setup-workflow
description: "Configure project-specific workflow role rules for adversarial loop customization. 配置項目特定工作流角色規則，定制對抗循環行為. Use when: setup workflow roles, customize task-executor rules, configure quality reviewer, set project-specific thresholds, override workflow defaults"
argument-hint: "[role-name]"
---

# Setup Workflow Role Rules

按項目配置工作流角色之特定規則，以定制對抗循環行為。

## Usage 使用方法

```bash
# Setup all roles (interactive)
/workflow:setup

# Setup specific role
/workflow:setup task-executor
/workflow:setup code-quality-reviewer
/workflow:setup post-task-reviewer
```

## How It Works 工作原理

1. **檢查** `.workflow/rules/` 中的現有規則
2. **對每個角色提問**定制問題
3. **創建項目特定規則文件**覆蓋默認值

## Rule Override Hierarchy 規則覆蓋層次

規則按此順序加載（後者覆蓋前者）：

1. 插件默認值：`${CLAUDE_PLUGIN_ROOT}/rules/{role}/*.md`
2. 項目覆蓋：`.workflow/rules/{role}/*.md`

## Available Roles 可用角色

### task-executor

可定制：
- 上下文衛生規則
- 執行模式規則
- 狀態管理行為
- 對抗心態

**默認規則：**
- `${CLAUDE_PLUGIN_ROOT}/rules/task-executor/context-hygiene.md`
- `${CLAUDE_PLUGIN_ROOT}/rules/task-executor/execution-pattern.md`

### code-quality-reviewer

可定制：
- 驗證分類（正確性、安全性、質量、測試）
- 問題嚴重程度閾值
- 攻擊向量生成
- 報告格式

**默認規則：**
- `${CLAUDE_PLUGIN_ROOT}/rules/code-quality-reviewer/verification-categories.md`

### post-task-reviewer

可定制：
- 需求覆蓋範圍
- 文檔準確性檢查
- 用戶流程驗證
- 精簡文檔審查格式

**默認規則：**
- `${CLAUDE_PLUGIN_ROOT}/rules/post-task-reviewer/post-task-review.md`

## Interactive Setup Questions 交互式設置問題

### Task Executor Questions

```yaml
questions:
  context_management:
    - "Maximum files per task? (default: 5)"
    - "Should context be isolated between tasks? (default: yes)"
    - "State persistence mode? (default: state file only)"

  execution_pattern:
    - "Verifier spawn behavior? (default: fresh subagent)"
    - "Failure handling? (default: continue to next task)"
```

### Code Quality Reviewer Questions

```yaml
questions:
  verification_categories:
    - "Enable correctness verification? (default: yes)"
    - "Enable security verification? (default: yes)"
    - "Enable quality verification? (default: yes)"
    - "Enable testing verification? (default: yes)"

  severity_thresholds:
    - "Critical issues include? (default: security, data loss, crashes)"
    - "High issues include? (default: edge case bugs, missing error handling)"
```

### Post-Task Reviewer Questions

```yaml
questions:
  coverage:
    - "Requirements traceability depth? (default: full)"
    - "Documentation accuracy check? (default: yes)"
    - "User flow validation? (default: yes)"

  review_format:
    - "Lean docs review? (default: yes)"
    - "Cross-reference with task acceptance criteria? (default: yes)"
```

## Setup Process 設置流程

### Step 1: Check Existing Rules 檢查現有規則

```bash
# List existing project rules
ls -la .workflow/rules/
```

### Step 2: Ask Role Selection 選擇角色

```
Which role do you want to customize?

1. task-executor
2. code-quality-reviewer
3. post-task-reviewer
4. All roles (guided walkthrough)

Enter number or role name:
```

### Step 3: Ask Role-Specific Questions 角色特定問題

呈現所選角色的問題，顯示默認值，接受定制。

### Step 4: Create Rule Files 創建規則文件

創建 `.workflow/rules/{role}/{rule-name}.md`，僅含定制值：

```markdown
# Project-Specific {Rule Name} Rules

## Override Values

```yaml
custom_overrides:
  # Project-specific values that override defaults
  max_files: 10  # Override default of 5
  context_isolation: false  # Allow some context sharing
```

## Notes

This file overrides the default rules at:
`${CLAUDE_PLUGIN_ROOT}/rules/{role}/{rule-name}.md`
```

### Step 5: Verify and Summarize 驗證並匯總

顯示所創建內容及其如何改變行為：

```
✅ Created .workflow/rules/task-executor/context-hygiene.md

Changes from defaults:
- Max files per task: 5 → 10
- Context isolation: Full → Partial (shared patterns allowed)

To revert: Delete the file and defaults will be used.
```

## Example Output 示例輸出

```
Setting up workflow role rules for project: my-project

Checking existing rules...
No project-specific rules found. Using defaults.

Which role would you like to customize?
[1] task-executor
[2] code-quality-reviewer
[3] post-task-reviewer
[4] All roles (guided)
[0] Cancel

> 1

Configuring task-executor role...

[1/3] Context Management
Maximum files per task?
Default: 5
Your choice: [Enter=accept] > 10

Context isolation between tasks?
Default: Yes - full isolation
Your choice: [Enter=accept, P=partial sharing] > P

State persistence mode?
Default: State file only
Your choice: [Enter=accept] > Enter

[2/3] Verifier Spawn Behavior
How to spawn verifier?
Default: Fresh subagent for independent review
Your choice: [Enter=accept, S=same agent] > Enter

✅ Creating .workflow/rules/task-executor/context-hygiene.md
✅ Creating .workflow/rules/task-executor/execution-pattern.md

Summary of changes:
- Max files per task: 5 → 10
- Context isolation: Full → Partial

Role configuration saved! Agents will use these rules for this project.

To modify: Edit .workflow/rules/task-executor/*.md
To reset: Delete the rule files to restore defaults
```

## File Structure 文件結構

```
.workflow/rules/
├── task-executor/
│   ├── context-hygiene.md          # Override context rules
│   └── execution-pattern.md        # Override execution rules
├── code-quality-reviewer/
│   └── verification-categories.md  # Override verification rules
└── post-task-reviewer/
    └── post-task-review.md         # Override post-task review rules
```

## Reset to Defaults 重置為默認值

```bash
# Remove all project-specific rules
rm -rf .workflow/rules/

# Or remove specific role rules
rm .workflow/rules/task-executor/*.md
```

## Integration with Loop Commands 與循環命令的集成

運行 `/workflow:start` 時，task-executor 代理將：

1. 在 `.workflow/rules/` 檢查項目規則
2. 與插件默認值合並
3. 執行前應用定制
4. 記錄生效的規則
