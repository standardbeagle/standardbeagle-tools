---
name: Update Rules
description: View, add, modify, or remove project rules in `.claude/rules/`. 管理項目開發規則。 Use when: update rules, add a rule, edit a rule, remove a rule, manage rules, add rules for a new module
---

# Update Rules

管理項目在 `.claude/rules/` 中的開發規則。支持添加、修改、刪除規則文件，包括針對特定模塊或目錄的 glob 範圍規則。

## Step 1 -- Scan Existing Rules

讀取 `.claude/rules/` 目錄，列出所有規則文件及其元數據。

每個文件：

1. 讀取文件內容
2. 提取 frontmatter（如有）以確定 `paths` glob 模式
3. 提取首個標題或 `description` frontmatter 字段

向用戶呈現摘要表：

```
Current rules in .claude/rules/:

  File                    Glob Scope          Description
  version-control.md      (always loaded)     Version control standards
  typescript.md           **/*.ts, **/*.tsx    TypeScript guidelines
  testing.md              **/*.test.*, ...     Testing standards
  ...
```

若 `.claude/rules/` 不存在或為空，報告無規則已配置，詢問用戶是否先運行 `/setup-project`。

## Step 2 -- Ask What Operation to Perform

詢問用戶執行何操作：

- **Add** 新規則
- **Modify** 現有規則
- **Remove** 現有規則

待答後方繼續。

## Step 3 -- Add a New Rule

若用戶選「add」：

### 3a -- Determine Rule Scope

詢問規則涵蓋範圍。示例：

- 新語言或框架（如「GraphQL」、「React」、「Terraform」）
- 新模塊或目錄（如「our new payments service in `services/payments/`」）
- 橫切關注點（如「logging standards」、「error handling」）
- 團隊慣例（如「naming conventions for our API layer」）

### 3b -- Determine Glob Pattern

依範圍建議適當的 glob 模式用於規則的 `paths` frontmatter。詢問用戶確認或調整。

Glob 模式指引：

- 語言規則：`**/*.ext`（如 `**/*.graphql`、`**/*.tf`）
- 模塊規則：`path/to/module/**`（如 `services/payments/**`）
- 測試規則：`**/*.test.*`、`**/*.spec.*`、`**/*_test.*`
- 常駐加載規則：frontmatter 中完全省略 `paths` 字段
- 多模式：在 frontmatter 中使用 YAML 列表格式

### 3c -- Determine Content

詢問規則應編碼哪些具體標準、指南或約束。針對性問題：

1. 此範圍內應優先採用哪些模式？
2. 應避免哪些模式？
3. 是否有需要強制執行的特定庫、工具或方式？
4. 此範圍是否有特定的錯誤處理或測試要求？

### 3d -- Generate the Rule File

在 `.claude/rules/<rule-name>.md` 創建規則文件，結構如下：

```markdown
---
paths:
  - "<glob-pattern>"
description: "<one-line description>"
---

# <Rule Title>

<Rule content organized into clear sections>
```

選取 kebab-case 文件名以匹配範圍（如 `graphql.md`、`payments-service.md`、`logging.md`）。

### 3e -- Check for Template

檢查 `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/` 中是否存在匹配模板。若有，建議用作起點。若無，依用戶答案生成。

## Step 4 -- Modify an Existing Rule

若用戶選「modify」：

### 4a -- Select Rule

若用戶未指定規則，呈現 Step 1 的列表，詢問修改哪條。

### 4b -- Show Current Content

讀取並展示所選規則文件的完整內容。

### 4c -- Ask What to Change

詢問用戶修改什麼。常見修改：

- 添加新節或指南
- 更新現有節
- 更改 glob 範圍模式
- 移除不再適用的節
- 合併另一規則的內容

### 4d -- Apply Changes

以用戶請求的修改編輯規則文件。除非用戶明確要求，否則保留現有結構和 frontmatter。

向用戶展示變更摘要。

## Step 5 -- Remove a Rule

若用戶選「remove」：

### 5a -- Select Rule

若用戶未指定規則，呈現 Step 1 的列表，詢問移除哪條。

### 5b -- Confirm Deletion

展示規則的 description 和 glob 範圍。詢問用戶確認刪除。警告此操作不可撤銷（除非有版本控制）。

### 5c -- Delete the File

從 `.claude/rules/` 刪除規則文件。

向用戶報告刪除結果。

## Step 6 -- Repeat or Finish

完成操作後，詢問用戶是否繼續操作（添加、修改或移除另一規則），或結束。

若結束，呈現 Step 1 格式的更新後摘要表，展示所有規則的當前狀態。
