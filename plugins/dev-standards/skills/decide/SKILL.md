---
name: dev-standards-decide
description: "Record or list architectural decisions and active migrations in `.claude/rules/architecture.md`. 管理架構決策與遷移記錄。 Use when: record decision, add decision, add migration, complete migration, list decisions, list migrations, update architecture decisions, mark migration done"
---

# Decide

管理 `.claude/rules/architecture.md` 中「現行架構決策」與「現行遷移」二節。保持此二節最新，可防舊模式造成混亂，並確保新代碼遵循最新慣例。

## Step 1 -- Check for architecture.md

讀取 `.claude/rules/architecture.md`。若文件不存在，警告用戶：

```
No .claude/rules/architecture.md found.
Run /setup-project first to generate rule files, then re-run this skill.
```

文件缺失則在此停止。不創建——setup-project 命令負責帶項目上下文生成初始內容。

## Step 2 -- Parse Current State

讀文件，從以下二節提取現有條目：

- **Active Architecture Decisions** — 匹配 `- DECISION: ...` 之行
- **Active Migrations** — 匹配 `- REPLACING: ...` 之行

向用戶呈現現狀：

```
Active Decisions:
  1. DECISION: Use Zod for all runtime validation (recorded 2025-11-15)
  2. DECISION: Prefer server actions over API routes for mutations (recorded 2025-12-01)

Active Migrations:
  1. REPLACING: Jest -> Vitest (started 2025-12-10)
  2. REPLACING: Prisma -> Drizzle (started 2026-01-05)

(none)  <-- if either section is empty
```

## Step 3 -- Ask What Operation to Perform

詢問用戶執行何操作：

- **Add a decision** — 記錄新架構選擇
- **Add a migration** — 記錄進行中的技術或模式替換
- **Complete a migration** — 標記遷移完成並移除
- **List current** — 僅展示現狀（Step 2 已完成，確認後停止）

待答後方繼續。

## Step 4 -- Add a Decision

若用戶選「add a decision」：

### 4a -- Ask What Was Decided

詢問：「What architectural decision was made?」提示簡潔 1-2 行。例：

- "Use Zod for all runtime validation"
- "Prefer server actions over API routes for mutations"
- "All new services use gRPC, not REST"

### 4b -- Ask Why

詢問：「Why was this decided? (1 line)」此上下文助未來開發者理解緣由。

### 4c -- Write the Entry

在 `.claude/rules/architecture.md` 的 `## Active Architecture Decisions` 節添加新行：

```
- DECISION: <description> (recorded <today's date>)
```

日期用 YYYY-MM-DD 格式。

若用戶提供理由，次行附注：

```
- DECISION: <description> (recorded <today's date>)
  <!-- Reason: <why> -->
```

## Step 5 -- Add a Migration

若用戶選「add a migration」：

### 5a -- Ask What Is Being Replaced

詢問：「What is being replaced and what is it being replaced with?」提示簡潔格式：

- "Jest -> Vitest"
- "REST endpoints -> gRPC services"
- "Class components -> functional components with hooks"

### 5b -- Ask Why

詢問：「Why is this migration happening? (1 line)」

### 5c -- Write the Entry

在 `.claude/rules/architecture.md` 的 `## Active Migrations` 節添加新行：

```
- REPLACING: <old> -> <new> (started <today's date>)
```

若用戶提供理由，次行附注：

```
- REPLACING: <old> -> <new> (started <today's date>)
  <!-- Reason: <why> -->
```

### 5d -- Warn About Impact

提醒用戶：

```
IMPORTANT: While this migration is active, all new code must follow the NEW
pattern (<new>). Existing code using <old> should be migrated opportunistically.
Any rules referencing <old> should be updated to prefer <new>.
```

## Step 6 -- Complete a Migration

若用戶選「complete a migration」：

### 6a -- Select Migration

若只有一條遷移，確認之。若有多條，詢問用戶選擇哪條。若無，報「No active migrations to complete」並停止。

### 6b -- Confirm Completion

展示遷移條目，詢問：「Is this migration fully complete? All old usages have been replaced?」

### 6c -- Remove the Entry

從 `## Active Migrations` 節移除該 `REPLACING:` 行（及其注釋行，若有）。

### 6d -- Optionally Record as Decision

詢問用戶：「Record the result as an active decision? (e.g., 'Use Vitest for all tests')」

若是，依 Step 4c 格式在 `## Active Architecture Decisions` 節添加相應條目。

### 6e -- Check for Stale Rules

掃描 `.claude/rules/` 中引用已完成遷移舊技術的規則文件。若有，報告：

```
These rule files may reference the old pattern and should be updated:
  - .claude/rules/testing.md (mentions "Jest")
```

## Step 7 -- Report

任何寫操作後，回讀 `.claude/rules/architecture.md` 修改節，以 Step 2 格式呈現更新後狀態。
