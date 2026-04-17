---
name: project-config
description: View, set, reset slop-mcp project-config memory bank used by orchestrator skills. 讀寫項目配置記憶庫，供 commit-all 等調度技藝使用。 Use when: viewing current config, updating a key, resetting for re-detection, manually setting Dart board or custom commands.
---

# Project Configuration Memory

管理 slop-mcp 中 `project-config` 記憶庫。此庫存項目設置，供調度技藝（commit-all、pr-all 等）以正確上下文分派代理。

## When to Use

- 查看當前項目配置
- 更新特定配置值
- 重置配置，令下次運行重新檢測
- 手動設置無法自動檢測之配置（Dart 面板、自定義命令）

## Memory Bank: `project-config`

### Schema

| Key | Type | Example | Description |
|-----|------|---------|-------------|
| `test-framework` | string | `"vitest"` | 檢測到之測試框架 |
| `test-command` | string | `"npm test"` | 運行測試命令 |
| `linter` | string | `"eslint"` | 檢測到之代碼檢查器 |
| `lint-command` | string | `"npm run lint"` | 運行代碼檢查命令 |
| `formatter` | string | `"prettier"` | 檢測到之格式化工具 |
| `format-command` | string | `"npm run format"` | 運行格式化命令 |
| `doc-patterns` | string | `"CHANGELOG.md,README.md,jsdoc"` | 逗號分隔文檔製品 |
| `dart-board` | string | `"my-project"` | Dart 面板名（或 "none"）|
| `commit-style` | string | `"conventional"` | 提交消息規範 |
| `config-hash` | string | `"abc123"` | 配置文件哈希，用於陳舊檢測 |
| `detected-at` | string | `"2026-02-28T10:00:00Z"` | 最後檢測時間 |

## Operations

### View All Config

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script:
  keys = mem_keys("project-config")
  results = []
  for key in keys:
    val = mem_load("project-config", key)
    results = results + [key + ": " + to_string(val)]
  emit(join(results, "\n"))
```

### View Single Key

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script: emit(mem_load("project-config", "test-framework", "not set"))
```

### Set a Value

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script: mem_save("project-config", "test-framework", "vitest")
```

### Delete a Key

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script: mem_delete("project-config", "test-framework")
```

### Reset All Config

強制下次調度運行重新檢測：

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script:
  keys = mem_keys("project-config")
  for key in keys:
    mem_delete("project-config", key)
  emit("Config cleared. Will re-detect on next run.")
```

### Bulk Set (First Run)

自動檢測確認值後批量設置：

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script:
  mem_save("project-config", "test-framework", "vitest")
  mem_save("project-config", "test-command", "npm test")
  mem_save("project-config", "linter", "eslint")
  mem_save("project-config", "lint-command", "npm run lint")
  mem_save("project-config", "formatter", "prettier")
  mem_save("project-config", "format-command", "npx prettier --write .")
  mem_save("project-config", "doc-patterns", "CHANGELOG.md,README.md,jsdoc")
  mem_save("project-config", "dart-board", "none")
  mem_save("project-config", "commit-style", "conventional")
  mem_save("project-config", "detected-at", "2026-02-28T10:00:00Z")
  emit("Config saved.")
```

## Staleness Detection

調度器每次運行應檢驗 `config-hash`：

1. 散列配置文件內容（package.json、pyproject.toml 等）
2. 與存儲之 `config-hash` 比較
3. 若異：重新檢測並與用戶確認
4. 若同：用緩存配置

```
mcp__plugin_slop-mcp_slop-mcp__run_slop
script:
  hash = mem_load("project-config", "config-hash", "none")
  emit(hash)
```

## Integration with Orchestrators

調度技藝以此為首步加載配置：

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

若結果為 `NO_CONFIG`，調度器分派 `context-gatherer` 代理，令其檢測並確認配置。
