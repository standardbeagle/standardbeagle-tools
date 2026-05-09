---
description: "Create a new project-specific skill in `.claude/skills/` to codify a recurring pattern. 在項目中新建可複用技能。 Use when: add a skill, create a skill, new skill, codify a pattern, make a reusable workflow"
---

# Add Skill

在 `.claude/skills/` 中創建新的項目專屬技能，將反覆出現的模式固化為可複用的工作流。

## Step 1 -- Identify the Pattern

詢問用戶此技能應固化何種反覆任務或模式。示例提示：

- "Adding a new API endpoint with tests and validation"
- "Creating a new React component with styles, tests, and storybook entry"
- "Setting up a new microservice with boilerplate"
- "Running a specific code review checklist"
- "Performing a database migration with rollback plan"

若用戶不確定，詢問：「What task do you find yourself explaining to Claude repeatedly? That is a good candidate for a skill.」

待答後方繼續。

## Step 2 -- Gather Skill Details

依次詢問以下問題。收齊所有答案後再生成。

### 2a -- Name and Triggers

詢問技能名稱（kebab-case）。依描述的模式建議名稱。

詢問應觸發此技能的短語。frontmatter 的 description 必須列出觸發短語，使 Claude 在正確時機啟用技能。依模式建議 3-5 個觸發語。

### 2b -- Steps and Structure

請用戶描述涉及的步驟。以下問題深入挖掘：

1. 第一步做什麼？（如掃描已有代碼、提問、讀取文件）
2. 創建或修改哪些文件或目錄？
3. 有無驗證檢查或質量門控？
4. 「完成」的樣子是什麼？

### 2c -- References and Scripts

詢問技能是否需要：

- **Reference files**（如示例代碼、模板、Schema）— 存於 `references/` 子目錄
- **Scripts**（如自動化或驗證的 shell 腳本）— 存於 `scripts/` 子目錄

若均不需要，跳過子目錄創建。

## Step 3 -- Validate Conventions

生成前驗證技能遵循以下慣例：

- **Filename**: `.claude/skills/<skill-name>/SKILL.md`
- **Frontmatter `name`**: Title Case, concise
- **Frontmatter `description`**: Third-person form ("This skill should be used when the user asks to..."), lists trigger phrases in quotes
- **Body**: Imperative form ("Read the file", "Ask the user", "Create the directory")
- **Length**: Under 2000 words total
- **Steps**: Numbered with `##` headings, use `--` separator (e.g., `## Step 1 -- Description`)
- **Sub-steps**: Lettered with `###` headings (e.g., `### 3a -- Detail`)
- **No placeholders left behind**: All generated content must be concrete and usable

若有慣例違反，寫入前向用戶報告。

## Step 4 -- Generate the SKILL.md

在 `.claude/skills/<skill-name>/SKILL.md` 創建技能文件，結構如下：

```markdown
---
name: <Skill Name>
description: This skill should be used when the user asks to "<trigger 1>", "<trigger 2>", "<trigger 3>". Provides guidance for <what the skill does>.
---

# <Skill Name>

<One-sentence summary of what this skill does.>

## Step 1 -- <First Step>

<Instructions in imperative form.>

## Step 2 -- <Second Step>

<Instructions in imperative form.>

...additional steps...
```

用戶確認生成內容正確後方寫入文件。若用戶要求修改，修訂後再次呈現，方可寫入。

## Step 5 -- Create Supporting Directories

若技能需要引用文件或腳本（Step 2c 中確認）：

1. 創建 `.claude/skills/<skill-name>/references/` 並填入引用文件
2. 創建 `.claude/skills/<skill-name>/scripts/` 並填入腳本文件
3. 標記腳本為可執行

## Step 6 -- Verify and Report

寫入後：

1. 回讀生成文件，確認寫入正確
2. 統計字數——若接近 2000 字上限則警告
3. 驗證 frontmatter 解析正確（name、含觸發語的 description）
4. 驗證所有 `##` 步驟標題使用 `Step N -- Description` 格式

報告結果：

```
Skill created:

  File:        .claude/skills/<skill-name>/SKILL.md
  Triggers:    "<trigger 1>", "<trigger 2>", ...
  Steps:       N steps
  Word count:  NNN / 2000
  References:  [list or "none"]
  Scripts:     [list or "none"]
```
