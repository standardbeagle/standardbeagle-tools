---
name: photino-photino-dev
description: "\"Start Photino.NET dual-service development environment with hot-reload and WebSocket connection verification. 啟動Photino.NET雙服務開發環境：熱重載及WebSocket連接驗證. Use when: starting development, launching backend and frontend servers, verifying WebSocket connection, troubleshooting dev environment\""
disable-model-invocation: true
allowed-tools: "[\"Bash\", \"Read\", \"Glob\", \"Grep\"]"
---

啟動Photino.NET開發環境：後端（WebSocket開發服務器）與前端（Vite）同時運行。

## Steps

### 1. Detect Project Configuration

在工程根查找`.agnt.kdl`：

```bash
cat .agnt.kdl 2>/dev/null
```

若找到，提取：
- `scripts.backend.run`中之後端命令
- `scripts.dev.run`中之前端命令
- `scripts.dev.cwd`中之前端工作目錄

若未找到，掃描：
- 含`Photino.NET`引用之`*.csproj`
- Frontend子目錄中之`package.json`
- 默認至標準命令

### 2. Start Backend Dev Server

```bash
# Start the .NET backend with WebSocket transport
dotnet watch run --project <csproj-path> -- --dev-server
```

等待輸出指示服務器就緒：
```
Dev server running on port 5174
```

### 3. Start Frontend Dev Server

在獨立進程中：

```bash
cd <frontend-path> && pnpm dev
```

等待Vite輸出：
```
Local: http://localhost:5173/
```

### 4. Verify WebSocket Connection

前端通過WebSocket連接至後端。驗證：

```bash
# Check backend is listening
curl -s -o /dev/null -w "%{http_code}" http://localhost:5174/ws
# Should return 400 (expects WebSocket upgrade, not HTTP)

# Check frontend is serving
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
# Should return 200
```

### 5. Report Status

告知用戶：
- 後端運行於`ws://localhost:5174/ws`
- 前端運行於`http://localhost:5173`
- 打開`http://localhost:5173`瀏覽器使用應用
- 兩個服務均啟用熱重載：
  - C#變更：`dotnet watch`自動重啟後端
  - 前端變更：Vite HMR即時更新

## Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| Backend won't start | `dotnet build` first | Fix compilation errors |
| Frontend can't connect | Backend running? | Start backend first |
| Port already in use | `lsof -i :5174` | Kill existing process or change port |
| Hot-reload not working | `dotnet watch` output | Restart with `dotnet watch run` |
| WebSocket 404 | Vite proxy config | Add `/ws` proxy in `vite.config.ts` |
| CORS errors | Different ports | WebSocket proxy handles this |

## Using with agnt

若`.agnt.kdl`配置了autostart：

```bash
# Start everything with one command
agnt run claude

# This auto-starts:
# 1. Backend dev server (dotnet watch run --dev-server)
# 2. Frontend dev server (pnpm dev)
# 3. Proxy for browser debugging (if configured)
```

agnt狀態欄在終端底部顯示運行中服務。

## Related

- config/reference: `photino:photino-development`
