---
name: slop-mcp-memory-system
description: "Two-tier memory for slop-mcp — session store (in-process KV) and persistent banks (disk-backed JSON with metadata, search, memory-cli interop). 會話內存與跨啟動持久內存之雙層系統，含元數據、發現、memory-cli 互操作。 Use when: persist value across sessions, session memory, list memory keys, search memory banks, load persisted state, mem_save, store_set, memory bank metadata."
disable-model-invocation: true
---

# Memory System

slop-mcp 提供雙層內存：會話內存 (`store_*`) 與持久內存 (`mem_*`)。前者為線程安全之進程內 KV，survives 多次 `run_slop` 調用但亡於進程退出；後者為磁盤 JSON bank，跨重啟、跨重啟後之啟動、與 `memory-cli` 獨立二進製共享格式。

設計分裂源於目的分裂：會話內存為**工作內存** — 累積中間結果、緩存 API 響應、在同一 server session 之多腳本間傳遞值。持久內存為**狀態存儲** — monitor 之 last-seen 游標、配置偏好、跨會話之索引快照、團隊可分享之知識庫。擇之以「此值死與生之時機」為準：隨進程死者用 `store_*`，須活過重啟者用 `mem_*`。

## Session Store vs Persistent Memory

| Axis | Session store (`store_*`) | Persistent memory (`mem_*`) |
|------|---------------------------|------------------------------|
| Lifetime | Server process only | Survives restart, survives reboot |
| Storage | In-memory | `~/.config/slop-mcp/memory/<bank>.json` |
| Thread-safe | Yes (`sync.RWMutex`) | Yes (atomic write via temp + rename) |
| Metadata | No | `description`, `schema`, auto `size`, `created_at`, `updated_at` |
| Discovery | `store_keys` | `mem_banks`, `mem_keys`, `mem_list`, `mem_search`, `mem_info` |
| Compatible CLI | No | `memory-cli` |

## Session Store

五函數皆 thread-safe — 並發 `run_slop` 調用共用同一 map，RWMutex 守門。適宜於 batch 中累積結果、緩存昂貴查詢、跨腳本傳遞會話級上下文。

### store_set(key, value)

設值，覆蓋既存：

```python
run_slop(script: '
    store_set("last_query", "error handling")
    store_set("result_count", 42)
')
```

### store_get(key, default)

取值，缺則返 default：

```python
run_slop(script: '
    query = store_get("last_query", "")
    if query != "":
        print("resuming: " + query)
')
```

### store_delete(key)

刪單鍵：

```python
run_slop(script: 'store_delete("last_query")')
```

### store_exists(key)

存在性檢查，無副作用：

```python
run_slop(script: '
    if store_exists("cached_tools"):
        tools = store_get("cached_tools", [])
    else:
        tools = tools.list()
        store_set("cached_tools", tools)
')
```

### store_keys()

列全部鍵（無值），用於調試或枚舉：

```python
run_slop(script: '
    keys = store_keys()
    print("session state: " + str(keys))
')
```

## Persistent Memory

持久內存以 bank 組織。每 bank 為磁盤上單一 JSON 文件：`~/.config/slop-mcp/memory/<bank>.json`。寫入經 temp-file + rename 原子化，避部分寫入。bank 名任意，但以用途分組為宜（`monitor`、`project_index`、`user_prefs`）。

### mem_save(bank, key, value)

存值至 bank/key。可選 `description:` 與 `schema:` kwargs 附元數據；`size` 自動計算為序列化字節數。再保存時若省略 kwargs，既有元數據**保留不變**（非破壞性更新）：

```python
run_slop(script: '
    mem_save("monitor", "last_deploy_id", 12345,
             description: "Most recent CI deploy ID observed by watch-deploys.slop",
             schema: "integer")
')
```

首次保存寫全元數據；後續僅更新值時：

```python
run_slop(script: 'mem_save("monitor", "last_deploy_id", 12346)')
```

`description` / `schema` / `created_at` 皆保留，`updated_at` 與 `size` 刷新。

### mem_load(bank, key, default)

取值。鍵缺則返 default — 不拋異常：

```python
run_slop(script: '
    last = mem_load("monitor", "last_deploy_id", 0)
    print("resuming from: " + str(last))
')
```

### mem_delete(bank, key)

刪單條目。bank 若因此空，文件仍留（下次 `mem_save` 復用）：

```python
run_slop(script: 'mem_delete("monitor", "last_deploy_id")')
```

### mem_keys(bank)

列 bank 內全部鍵名（無值、無元數據）：

```python
run_slop(script: '
    for k in mem_keys("monitor"):
        print(k)
')
```

### mem_banks()

列所有 bank 名 — 磁盤上全部 `<bank>.json` 文件之基名：

```python
run_slop(script: '
    banks = mem_banks()
    print("known banks: " + join(banks, ", "))
')
```

## Metadata & Discovery

v0.12.0 起新增三發現原語，令代理不必加載值即可探查 bank 內容 — 為 zero-cost discoverability。

### mem_info(bank, key)

返條目元數據 map — `description`、`schema`、`size`、`created_at`、`updated_at` — **不加載值本身**。適於大 blob 或無意消費者：

```python
run_slop(script: '
    info = mem_info("project_index", "symbol_graph")
    print("last updated: " + info["updated_at"])
    print("size bytes: " + str(info["size"]))
')
```

### mem_list(bank, pattern: "")

列 bank 全部條目之元數據（仍無值）。可選 `pattern` 為 glob 過濾鍵名。輸出按鍵排序，結果穩定：

```python
run_slop(script: '
    entries = mem_list("monitor", pattern: "last_*")
    for e in entries:
        print(e["key"] + ": " + e["description"])
')
```

### mem_search(query, bank: "", include_values: false)

跨 bank 大小寫不敏感子串搜索 — 匹配鍵名與描述。單 bank 搜索則傳 `bank:`。欲同時搜索序列化值內容（並返回值），設 `include_values: true`：

```python
run_slop(script: '
    hits = mem_search("deploy", bank: "monitor", include_values: true)
    for h in hits:
        print(h["bank"] + "/" + h["key"] + " → " + str(h["value"]))
')
```

## Reserved `_slop.*` Namespace

持久內存中以 `_slop.` 開頭之 bank 名為 slop-mcp 內部保留 — 存定制覆蓋索引與自定義工具定義。規則：

- **寫屏障**：`mem_save`、`mem_delete` 及 `memory-cli` 寫入 `_slop.*` 者遭拒並返錯。
- **讀放行**：自定義工具 body 內 `mem_get` 可讀 `_slop.*` — 讀權限開放。
- **寫路徑強制**：欲寫 `_slop.*` 者須經 `customize_tools` 元工具。其在正確 scope 下更新元數據、刷新上游 schema 哈希、觸發 stale 檢測。

詳情見 `tool-customization` 技能。

## memory-cli Interop

slop-mcp 與獨立二進製 `memory-cli` 共享 `<bank>.json` 格式，令 shell/git-hook 端無運行中 MCP session 亦可讀寫同一 bank。

- **共享目錄**：二者皆讀寫 `~/.config/slop-mcp/memory/<bank>.json`。
- **共結構體**：`Entry`、`KeyInfo`、`SearchMatch` 暴露 `description`、`schema`、`size` 字段。
- **`cmdWrite`**：自動計算 `size`；更新時保留元數據，與 `mem_save` 行為對稱。
- **`cmdSearch`**：同 `mem_search`，匹配 key 名與 description 文本。
- **保留 bank 同屏障**：memory-cli 亦拒寫 `_slop.*`。

典型用法：git post-commit hook 以 `memory-cli` 寫當前 branch 狀態，Claude session 次日以 `mem_load` 讀之；shell 腳本 dump 構建指標至某 bank，代理以 `mem_search` 探查。

## When to Use Each

擇存儲策略之決策順序：

- 值僅於單一 `run_slop` pipeline 內存活？→ 用普通 SLOP 變量，勿污染 store。
- 值須跨多次 `run_slop` 但僅此會話有效？→ `store_*`（session store）。
- 值須活過 server 重啟、或 shell/`memory-cli` 共享？→ `mem_*`（persistent memory）。
- 欲覆蓋工具描述或定義自定義工具？→ **勿** `mem_save` 至 `_slop.*`；用 `customize_tools` 元工具。

指導原則：生存期升一級即存儲層升一級。默認最輕 — 不需持久則不持久。

## Cross-references

- Invoke the `Skill` tool with `skill: slop-mcp:scripting` — SLOP 語言與 `run_slop` 調用環境，本技能之所有示例之宿主。
- Invoke the `Skill` tool with `skill: slop-mcp:tool-customization` — 保留 `_slop.*` bank 之語義、寫屏障、`customize_tools` 作唯一寫路徑之細節。
- Invoke the `Skill` tool with `skill: slop-mcp:event-monitoring` — monitor 腳本以 `mem_save` / `mem_load` 存 last-seen 游標，跨進程重啟不丟狀態。
- Invoke the `Skill` tool with `skill: slop-mcp:discovery-first` — 命名 bank / key 前先 `mem_list` / `mem_search` 確認既存命名慣例，勿新造重複鍵。
