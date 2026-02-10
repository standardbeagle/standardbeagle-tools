---
description: "Start Photino.NET dual-service development environment with hot-reload and WebSocket connection verification"
allowed-tools: ["Bash", "Read", "Glob", "Grep"]
---

Start the Photino.NET development environment with both backend (WebSocket dev server) and frontend (Vite) running simultaneously.

## Steps

### 1. Detect Project Configuration

Look for `.agnt.kdl` in the project root:

```bash
cat .agnt.kdl 2>/dev/null
```

If found, extract:
- Backend command from `scripts.backend.run`
- Frontend command from `scripts.dev.run`
- Frontend working directory from `scripts.dev.cwd`

If not found, scan for:
- `*.csproj` with `Photino.NET` reference
- `package.json` in a Frontend subdirectory
- Default to standard commands

### 2. Start Backend Dev Server

```bash
# Start the .NET backend with WebSocket transport
dotnet watch run --project <csproj-path> -- --dev-server
```

Wait for output indicating the server is ready:
```
Dev server running on port 5174
```

### 3. Start Frontend Dev Server

In a separate process:

```bash
cd <frontend-path> && pnpm dev
```

Wait for Vite output:
```
Local: http://localhost:5173/
```

### 4. Verify WebSocket Connection

The frontend connects to the backend via WebSocket. Verify:

```bash
# Check backend is listening
curl -s -o /dev/null -w "%{http_code}" http://localhost:5174/ws
# Should return 400 (expects WebSocket upgrade, not HTTP)

# Check frontend is serving
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
# Should return 200
```

### 5. Report Status

Tell the user:
- Backend running on `ws://localhost:5174/ws`
- Frontend running on `http://localhost:5173`
- Open browser to `http://localhost:5173` to use the app
- Both services have hot-reload enabled:
  - C# changes: `dotnet watch` restarts backend automatically
  - Frontend changes: Vite HMR updates instantly

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

If `.agnt.kdl` is configured with autostart:

```bash
# Start everything with one command
agnt run claude

# This auto-starts:
# 1. Backend dev server (dotnet watch run --dev-server)
# 2. Frontend dev server (pnpm dev)
# 3. Proxy for browser debugging (if configured)
```

The agnt status bar shows running services at the bottom of the terminal.
