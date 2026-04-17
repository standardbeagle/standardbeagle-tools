---
name: Update Project
description: Re-detect tech stack, compare against current config, and update rules, CLAUDE.md, and hooks. 重新檢測技術棧，更新規則、CLAUDE.md 及鉤子。 Use when: update project, refresh project settings, re-detect languages, update CLAUDE.md, refresh hooks, reconfigure dev standards
---

# Update Project

重新檢測項目技術棧，與現有配置比對，更新規則、CLAUDE.md 及鉤子以反映項目當前狀態。

## Step 1 -- Re-Detect Languages and Frameworks

運行與 setup-project 命令相同的檢測邏輯。掃描：

- Languages: `package.json`, `tsconfig.json`, `*.csproj`, `*.sln`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `setup.py`, `requirements.txt`
- Frameworks: `next.config.*`, `angular.json`, `vite.config.*`, `nuxt.config.*`, `svelte.config.*`, `astro.config.*`, `remix.config.*`, `serverless.yml`, `cdk.json`, `Dockerfile`, `docker-compose*.yml`
- Test runners: `jest.config.*`, `vitest.config.*`, `pytest.ini`, `playwright.config.*`, `cypress.config.*`, `*_test.go`
- Linters: `.eslintrc*`, `eslint.config.*`, `.prettierrc*`, `biome.json`, `ruff.toml`, `.golangci.yml`
- Persistence: `prisma/`, `**/migrations/`, `drizzle.config.*`, `alembic/`, Entity Framework references
- MCP servers: `.claude/mcp.json` or project-level MCP configuration

匯總所有發現為檢測摘要。

## Step 2 -- Compare Against Current Configuration

讀取現有 `.claude/rules/` 目錄與 `.claude/CLAUDE.md`。

構建比對報告：

```
Changes since last setup:

  New detections (no matching rule):
    + Python detected (pyproject.toml found) -- no .claude/rules/python.md
    + Playwright detected -- testing.md does not reference it

  Removed (rule exists but tech no longer detected):
    - .claude/rules/go.md exists but no go.mod found

  Unchanged:
    = TypeScript, Next.js, Vitest (all rules up to date)
```

向用戶呈現此報告。

## Step 3 -- Ask What to Update

呈現可用更新操作，詢問用戶選擇哪些執行（可多選）：

- **Add missing rules** 為新檢測到的語言/框架
- **Remove stale rules** 為已不使用的技術
- **Update CLAUDE.md** 項目描述與元數據
- **Add or remove MCP servers**
- **Refresh hooks** 以匹配當前插件配置
- **Skip** 不作修改直接結束

待用戶答覆後方繼續。

## Step 4 -- Add Missing Rules

對每個缺少對應規則的新檢測語言或框架：

1. 檢查 `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/` 中是否有模板
2. 若有模板，複製到 `.claude/rules/` 並附上 generated-by 注釋頭
3. 若無模板，詢問用戶需編碼哪些標準，生成新規則文件
4. 對新測試運行器或 e2e 框架，更新 `.claude/rules/testing.md` 以引用之

添加規則後，展示創建文件的摘要。

## Step 5 -- Remove Stale Rules

對每個對應技術已不再被檢測到的規則文件：

1. 展示規則文件名、description 及 glob 範圍
2. 詢問用戶確認移除——技術即便自動檢測未發現，也可能仍然相關
3. 刪除已確認的文件

移除規則後，展示刪除文件的摘要。

## Step 6 -- Update CLAUDE.md

讀取當前 `.claude/CLAUDE.md` 文件。逐節呈現內容，詢問用戶需更新哪些部分：

### 6a -- Project Description

展示當前項目描述。詢問是否需要更新。若是，詢問新描述並替換。

### 6b -- Key Technologies

展示當前技術列表。依最新檢測結果更新。詢問用戶確認更新後的列表。

### 6c -- Domain Concepts

展示當前領域概念。詢問是否需要添加新概念或移除現有概念。

### 6d -- Team Conventions

展示當前團隊慣例。詢問慣例是否已改變或需添加新慣例。

寫入更新後的 `.claude/CLAUDE.md` 文件。

## Step 7 -- Add or Remove MCP Servers

讀取當前 MCP 配置（若存在則為 `.claude/mcp.json`）。

### 7a -- Show Current Servers

列出所有已配置 MCP 服務器及其命令和描述。

### 7b -- Add a Server

若用戶希望添加服務器，詢問：

1. 服務器名稱（kebab-case 標識符）
2. 運行命令（如 `npx`、`uvx`、本地二進制路徑）
3. 參數（如 `["-y", "@package/name@latest", "mcp"]`）
4. 環境變量（如有）

將服務器添加到 MCP 配置文件。

### 7c -- Remove a Server

若用戶希望移除服務器，展示列表並詢問移除哪個。確認後刪除。

## Step 8 -- Refresh Hooks

從 dev-standards 插件讀取當前鉤子配置。

將已安裝的鉤子與插件當前鉤子定義比對。若插件在安裝後已更新，展示差異並提供更新。

用戶確認後，將鉤子配置重寫以匹配最新插件版本。

## Step 9 -- Summary

呈現所有變更的最終摘要：

```
Project update complete:

  Rules added:    [list or "none"]
  Rules removed:  [list or "none"]
  CLAUDE.md:      [updated sections or "no changes"]
  MCP servers:    [changes or "no changes"]
  Hooks:          [refreshed or "no changes"]
```
