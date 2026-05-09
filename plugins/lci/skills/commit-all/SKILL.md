---
name: commit-all
description: Orchestrate full WIP preparation and auto-commit by loading project config from memory and dispatching dedicated agents. 統籌WIP準備，自動提交：從記憶加載配置，分派專屬代理。 Use when: wrapping up uncommitted work, single-command test-doc-commit, end of work session.
---

# Commit All

精薄編排器：從slop-mcp記憶加載項目配置，為各關注點分派專屬代理，自動提交結果。

## When to Use

- 有未提交工作待收尾
- 欲單一命令完成測試、文檔、提交
- 工作會話結束前確保無遺漏

## IMPORTANT: This is a rigid workflow. Follow each phase in order. Do not skip phases.

---

## Phase 1: Load Project Config

從slop-mcp持久記憶加載配置：

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script:
  keys = mem_keys("project-config")
  if len(keys) == 0:
    emit("NO_CONFIG")
  else:
    results = []
    for key in keys:
      val = mem_load("project-config", key)
      results = results + [key + "=" + to_string(val)]
    emit(join(results, "\n"))
```

**若`NO_CONFIG`**：context-gatherer代理將處理檢測及確認（見Phase 2）。

**若返回配置**：查陳舊性——對比所存`config-hash`與當前配置文件（package.json、pyproject.toml等）。若陳舊，向context-gatherer傳`re-detect: true`。

---

## Phase 2: Dispatch Context Gatherer (foreground)

> Invoke the `Agent` tool with `subagent_type: lci:context-gatherer` — 收集WIP上下文，生成提交準備所需之結構化更改摘要。

```
Agent(
  subagent_type: "lci:context-gatherer",
  description: "Gather WIP context",
  prompt: "Project config:\n<config from Phase 1, or 'NO_CONFIG — detect and confirm'>\n\nGather full change summary for commit preparation."
)
```

context-gatherer返回結構化**更改摘要**，含：分支、範圍、更改內容、原因、任務引用、質量基線、項目配置。

保存更改摘要——為後續所有代理之輸入。

---

## Phase 3: Dispatch Test Fixer (foreground)

先運行——代碼正確後其他代理才處理。

> Invoke the `Agent` tool with `subagent_type: lci:test-fixer` — 運行全部測試，修復所有失敗，補充缺失覆蓋。

```
Agent(
  subagent_type: "lci:test-fixer",
  description: "Fix and add tests",
  prompt: "Project config:\n<config>\n\nChange summary:\n<summary from Phase 2>\n\nRun all tests, fix all failures, add missing coverage."
)
```

**若test-fixer報無法解決之失敗**：停止。向用戶報告，不繼續。

---

## Phase 4: Dispatch Parallel Agents (background)

**單一消息**中發起全部三個Agent工具調用：

> Invoke the `Agent` tool with `subagent_type: lci:code-quality` — 代碼質量審查，`run_in_background: true`。

> Invoke the `Agent` tool with `subagent_type: lci:doc-updater` — 更新內部文檔，`run_in_background: true`。

> Invoke the `Agent` tool with `subagent_type: lci:marketing-seo` — 更新公開文檔，`run_in_background: true`。

```
Agent(
  subagent_type: "lci:code-quality",
  description: "Code quality review",
  run_in_background: true,
  prompt: "Project config:\n<config>\n\nChange summary:\n<summary from Phase 2>"
)

Agent(
  subagent_type: "lci:doc-updater",
  description: "Update internal docs",
  run_in_background: true,
  prompt: "Project config:\n<config>\n\nChange summary:\n<summary from Phase 2>"
)

Agent(
  subagent_type: "lci:marketing-seo",
  description: "Update public docs",
  run_in_background: true,
  prompt: "Project config:\n<config>\n\nChange summary:\n<summary from Phase 2>"
)
```

等待全部三個完成。

---

## Phase 5: Reconcile & Verify

所有代理完成後：

1. **查衝突**：多個代理或已編輯同一文件，審查並合并。
2. **重跑測試**：質量和文檔代理或已更改代碼。
   ```bash
   <test-command from config>
   ```
3. **若測試失敗**：立即修復——不帶損壞測試繼續。

---

## Phase 6: Auto-Commit

### 6.1 Final Status
```bash
git status
git diff --stat
```

### 6.2 Stage Files

暫存所有修改文件，**排除**：
- `.env`文件及憑據/密鑰
- 構建產物（`dist/`、`build/`、`node_modules/`、`__pycache__/`）
- 臨時文件（`.tmp`、`.log`、`.swp`）

用具體文件名，不用`git add -A`。

### 6.3 Generate Commit Message

基於Phase 2之更改摘要，創建規範提交：
- **Type**：基於主要更改選`feat`/`fix`/`refactor`/`docs`/`test`/`chore`
- **Scope**：來自分支名或任務上下文
- **Subject**：72字符以內，說明什麼及為何
- **Body**：關鍵更改要點
- **Footer**：若有，含任務/問題引用

### 6.4 Commit

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

- <change 1>
- <change 2>

Refs: <task IDs if available>
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 6.5 Report Summary

```
## Commit Complete

**Commit**: <hash> <subject line>
**Branch**: <branch name>
**Files**: <count> files changed

### Agents Dispatched
- context-gatherer: <status>
- test-fixer: <tests run / fixed / added>
- code-quality: <findings resolved / lint fixes>
- doc-updater: <docs updated>
- marketing-seo: <public docs updated / no changes needed>
```
