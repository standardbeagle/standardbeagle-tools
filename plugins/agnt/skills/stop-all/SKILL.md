---
name: agnt-stop-all
description: "\"Stop all running processes and proxies. 止諸進程代理. Use when: kill all servers, stop dev environment, shut down proxies, clean up background processes, halt everything\""
disable-model-invocation: true
allowed-tools: "[\"mcp__agnt__proc\", \"mcp__agnt__proxy\"]"
---

停止所有運行中之agnt進程與代理。

## 步驟

1. 列出所有運行中進程：
   ```
   proc {action: "list", global: true}
   ```

2. 列出所有運行中代理：
   ```
   proxy {action: "list", global: true}
   ```

3. 先停止各代理（以乾淨方式斷開瀏覽器）：
   ```
   proxy {action: "stop", id: "<proxy_id>"}
   ```
   對每個代理重複執行。

4. 停止各進程：
   ```
   proc {action: "stop", process_id: "<process_id>"}
   ```
   對每個進程重複執行。

5. 向用戶確認所有進程與代理已停止。

注：使用 `global: true` 包含所有目錄之項目，而非僅當前目錄。
