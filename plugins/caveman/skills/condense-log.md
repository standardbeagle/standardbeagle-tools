---
name: condense-log
description: Compress error logs and stack traces via caveman-mcp with language detection and deduplication. Use for log triage, post-incident review, CI failure analysis when raw logs are too long. 以caveman壓縮錯誤日誌與堆棧追蹤，含語言檢測與去重. Use when: triage CI failure log, summarize app error output, dedupe repeated stack traces, post-incident analysis, prep log for downstream debug agent
---

# condense_log — Log & Stack Trace Compression

壓縮錯誤日誌、堆棧追蹤、CI輸出。自動檢測語言（Python/Node/Java/Go/Rust等）並去重。

## When to Use

| Scenario | Action |
|----|----|
| CI日誌數千行多重錯誤 | `condense_log` 提取唯一錯誤 |
| 應用錯誤日誌堆積 | `condense_log` 去重模式 |
| 單一錯誤+短trace | 直接Read，無需壓縮 |
| 結構化JSON日誌 | 先`jq`過濾，再傳caveman |
| 性能trace（火焰圖） | caveman不適合——用trace工具 |

## Access Pattern

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "caveman"
  tool_name: "condense_log"
  parameters:
    text: "<raw-log-text>"
```

直接：`mcp__plugin_caveman_caveman__condense_log`

注：`condense_log`僅接受`text`參數。文件路徑用`condense_file`，URL用`condense_url`。

## What It Returns

- **Detected language** — Python/Node/Java/etc.
- **Unique errors** — 去重後唯一錯誤類別
- **Top stack frames** — 每錯誤的關鍵幀
- **Frequency** — 每錯誤出現次數
- **Timeline hint** — 首次/末次出現（若日誌含時間戳）

代碼行、文件路徑、行號、錯誤消息保持精確。

## Examples

### Triage CI failure
```bash
# Capture CI log
gh run view <run-id> --log-failed > /tmp/ci.log
# Or local pytest
pytest 2>&1 | tee /tmp/test.log
```
```yaml
tool_name: condense_log
parameters:
  text: "<paste log content or read file first>"
```

實踐：先Read日誌文件，再傳text參數。或：

```bash
# Pipe to clipboard / inline
cat /tmp/ci.log
```
然後將輸出傳入。

### Dedupe production error spam
```yaml
tool_name: condense_log
parameters:
  text: |
    [2026-04-30 10:23:01] ERROR auth.middleware TokenExpiredError at line 42
    [2026-04-30 10:23:02] ERROR auth.middleware TokenExpiredError at line 42
    [2026-04-30 10:23:05] ERROR auth.middleware TokenExpiredError at line 42
    [2026-04-30 10:24:11] ERROR db.pool ConnectionTimeout after 30s
    ...
```

返回：2唯一錯誤、計數、首末時間戳。

### Cross-language stack
caveman檢測混合堆棧（Node調Python子進程等）並分組。

## Tips

- **Large logs**: `condense_log`取`text`字符串。極大日誌（>1MB）可能慢——先`grep -i error`過濾
- **Color codes**: ANSI色碼caveman會處理。亂碼仍勿傳
- **Secrets**: 日誌可能含token/password。傳caveman前用`sed`過濾敏感行
- **Combine**: 壓縮後傳`systematic-debugging`技能或debug agent，省其上下文
- **Path forms**: 文件日誌用`condense_file`更直接，無需先讀
