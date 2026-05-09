---
name: slop-mcp-event-monitoring
description: "Stream events from git hooks, builds, CI, file watchers, and MCP polling into Claude Code's Monitor notifications via slop-mcp monitor + message. 經 slop-mcp monitor 與 message 子命令，將任何事件源化為 Claude Code 通知流。 Use when: watch events, stream build output, notify on commit, poll MCP for changes, file watcher notifications, CI event stream, monitor deploys, start monitor."
disable-model-invocation: true
---

# Event Monitoring

slop-mcp v0.14.1 起附兩子命令 — `slop-mcp monitor` 與 `slop-mcp message` — 將任意事件源化為 Claude Code `Monitor({...})` 工具之通知流。`monitor` 作事件中繼：每行 stdout 即一條通知；亦可跑 SLOP 腳本輪詢 MCP 或 HTTP 端點。

`message` 為單發推送：由 git hook、build 腳本、CI 回調等「不會自循環」之源觸發，向運行中之 monitor 共享尾文件追加一行事件。二者合流入同一通知流。

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  git hook    │────▶│              │     │                  │
│  build script│────▶│  slop-mcp    │────▶│  Claude Code     │
│  CI webhook  │────▶│  monitor     │     │  Monitor tool    │
│  file watcher│────▶│  (stdout)    │     │  (notifications) │
│  SLOP script │────▶│              │     │                  │
└──────────────┘     └──────────────┘     └──────────────────┘
       │                                          │
   slop-mcp message "text"              Each line = one notification
```

## Prerequisites

- `slop-mcp` 二進製須於 `PATH`。裝法：
  - `make install` — 由上游倉 `~/work/mcps/slop-mcp` 源碼編入 `$GOPATH/bin`。
  - `npm i -g @standardbeagle/slop-mcp` — 自 npm 裝 wrapper。
- `monitor` 與 `message` 為獨立子命令 — **不依賴運行中之 MCP server**即可用。若腳本需輪詢某 MCP，則由 SLOP 身體內經 `execute_tool` 經此進程路由。
- 同一用戶上下文內運行兩子命令方可共享尾文件；跨用戶則事件互不可見。

## monitor Subcommand

`slop-mcp monitor` 每行 stdout 即一條 Claude Code 通知。四種調用形式：

```bash
# (1) Plain relay — 只轉發 message 事件
slop-mcp monitor

# (2) Inline SLOP script via -e
slop-mcp monitor -e 'for _ in range(999999999):
    h = myapi.get_health()
    if changed("health", h):
        print("health: " + str(h))
    sleep(30000)'

# (3) SLOP script file
slop-mcp monitor path/to/watch-health.slop

# (4) Timed session — 自動退出於 N 秒後
slop-mcp monitor --timeout=600
```

腳本身體內每 `print(...)` 調用 → 一行 stdout → 一條通知。印純文本一行為宜；多行內容請先 `join` 為單行。

### changed() for Delta Detection

內建 `changed(key, value)` 在該 `key` 值自上次調用以來有變時返 `true`。用於濾除未變狀態，避通知洪水：

```
for _ in range(999999999):
    status = ci.latest_build_status()
    if changed("build", status):
        print("build: " + str(status))
    sleep(15000)
```

### Persistent State Across Monitor Restarts

`changed()` 記憶僅活於此 monitor 進程生命。若須跨進程重啟亦記，用 SLOP 持久內存：

```
# 讀上次所見 deploy id，默認 0
last_id = mem_load("monitor", "last_deploy_id", 0)

for _ in range(999999999):
    deploy = ci.get_latest_deploy()
    if deploy["id"] != last_id:
        print("new deploy: " + str(deploy["version"]))
        last_id = deploy["id"]
        mem_save("monitor", "last_deploy_id", last_id)
    sleep(60000)
```

`mem_save` / `mem_load` 詳見 `memory-system` 技能。

## message Subcommand

```bash
slop-mcp message "<text>"
```

將 `<text>` 作一行追加至 monitor 所觀之共享尾文件。運行中 monitor 即刻讀之並吐 stdout，觸發 Claude Code 通知。

- 必須與 monitor 同用戶上下文運行 — 尾文件路徑由用戶解析，跨用戶不可見。
- 無運行 monitor 時消息仍寫入，但無消費者讀出 — 用於**已**運行 monitor 之場景。
- 常為 git hook、build 腳本、CI webhook 觸發：此類源單發即了，無自身循環。

## Event Source Patterns

### Git Post-Commit Hook

```bash
# .git/hooks/post-commit
#!/bin/sh
HASH=$(git log -1 --pretty=format:'%h')
SUBJECT=$(git log -1 --pretty=format:'%s')
slop-mcp message "commit $HASH: $SUBJECT"
```

`chmod +x .git/hooks/post-commit` 後，每次 commit 自動一行通知。

### Build Wrapper

```bash
#!/bin/bash
# scripts/build-with-events.sh
CMD="$*"
slop-mcp message "build started: $CMD"
if eval "$CMD"; then
    slop-mcp message "build succeeded"
else
    slop-mcp message "build failed (exit $?)"
    exit 1
fi
```

或一行鏈接：`make build && slop-mcp message "build ok" || slop-mcp message "build failed"`。

### Test Runner Wrapper

```bash
#!/bin/bash
# scripts/test-with-events.sh
CMD="$*"
slop-mcp message "tests: running"
OUTPUT=$(eval "$CMD" 2>&1)
STATUS=$?
if [ "$STATUS" -eq 0 ]; then
    SUMMARY=$(echo "$OUTPUT" | grep -E "^(ok|PASS|passed)" | tail -1)
    slop-mcp message "tests passed: ${SUMMARY:-ok}"
else
    FAILURES=$(echo "$OUTPUT" | grep -E "FAIL|ERROR" | head -3 | tr '\n' ';')
    slop-mcp message "tests failed: $FAILURES"
fi
exit "$STATUS"
```

### File Watcher — Linux (inotifywait)

```bash
inotifywait -m -r -e modify --format '%w%f' src/ | \
    while read FILE; do
        slop-mcp message "modified: $FILE"
    done
```

### File Watcher — macOS (fswatch)

```bash
fswatch -r src/ | while read FILE; do
    slop-mcp message "modified: $FILE"
done
```

## SLOP Polling

`monitor` 腳本身體可輪詢 MCP 工具或 HTTP 端點，按間隔 `sleep(ms)`。兩種 canonical 模式：

### Single-Tool Polling with Delta

Inline example — 僅當 `health` 字段變動時發通知：

```
for _ in range(999999999):
    health = myapi.get_health()
    if changed("health", health):
        print("health changed: " + str(health))
    sleep(30000)
```

亦可用 slop-mcp 附 recipe — `slop-mcp monitor -e 'run_recipe("monitor_poll_delta", {mcp: "myapi", tool: "get_health", key: "health", interval: 30000})'` 或於 `.slop` 文件內 `run_recipe(...)`。

### Multi-MCP Polling with Persistent State

多源輪詢 — 每源獨立 `changed()` 鍵，狀態經 `mem_save` 跨重啟存：

```
# watch-multi.slop
last_issues = mem_load("monitor", "issue_count", 0)

for _ in range(999999999):
    issues = github.list_issues(state: "open")
    n = len(issues)
    if n != last_issues:
        print("open issues: " + str(n))
        last_issues = n
        mem_save("monitor", "issue_count", n)

    h = api.get_health()
    if changed("api_health", h["status"]):
        print("api: " + str(h["status"]))

    sleep(30000)
```

此模式對應 `monitor_multi_check` recipe — 可直接 `run_recipe("monitor_multi_check", {checks: [...]})` 代寫循環。

### Streams Compose

monitor 同時觀腳本 stdout **與** `message` 尾文件。SLOP 輪詢與 shell 事件並流入同一通知流 — 無需分別 Monitor 實例。

## Claude Code Monitor Integration

於 Claude Code 會話內啟動 monitor：

```javascript
// Basic — any event stream
Monitor({
  command: "slop-mcp monitor",
  description: "dev events",
  persistent: true
})
```

```javascript
// With SLOP script
Monitor({
  command: "slop-mcp monitor watch-health.slop",
  description: "service health",
  persistent: true
})
```

```javascript
// Timed session — slop-mcp auto-exits at 600s; give the Monitor tool slightly longer
Monitor({
  command: "slop-mcp monitor --timeout=600",
  description: "build events",
  timeout_ms: 660000
})
```

`persistent: true` 令 Monitor 跨對話回合存活；`timeout_ms` 為 Monitor 工具本身之上限，應寬於 `--timeout` 秒數對應毫秒數。

## Combining Sources

同一 monitor 可並行消費 SLOP 輪詢與 shell message 事件：

```bash
# Terminal / background — SLOP polls MCPs
slop-mcp monitor watch-health.slop &

# Git hook fires on each commit
#   .git/hooks/post-commit → slop-mcp message "commit abc123: subject"

# Build script rides the same stream
make build && slop-mcp message "build ok" || slop-mcp message "build failed"
```

Claude Code 側僅一 Monitor 實例；通知流合併二源。欲分流則啟多 Monitor，各用不同 `--timeout` 或不同腳本。

## Cross-references

- Invoke the `Skill` tool with `skill: slop-mcp:scripting` — SLOP 語言參考，monitor 腳本身體語法同 `run_slop` 腳本。
- Invoke the `Skill` tool with `skill: slop-mcp:memory-system` — `mem_save` / `mem_load` 細節、bank 元數據、保留命名空間。
- Invoke the `Skill` tool with `skill: slop-mcp:tool-customization` — 同屬 0.14 發佈線；覆蓋 MCP 工具描述可令輪詢腳本更簡。
- Invoke the `Skill` tool with `skill: slop-mcp:discovery-first` — 輪詢腳本內 `execute_tool` 前，仍須經元工具驗證 schema。
- `/slop-monitor` — 未來命令（見 task-11），包裝 monitor 啟動與模式選擇。
- `mcp-orchestrator` agent — Workflow 7「Set Up Event Monitor」為本技能之協調者級調用。
