---
name: photino-photino-development
description: "Photino.NET dual-service dev workflow: DevServer class, Vite proxy config, MessageBridge auto-detection, debugging strategies, .agnt.kdl config. Photino.NET雙服務開發工作流。 Use when: starting dev environment, configuring Vite proxy, debugging backend/frontend communication, setting up agnt autostart"
disable-model-invocation: true
---

# Photino.NET Development Workflow

Photino.NET工程開發模式設置與運行：雙服務（後端+前端）、熱重載及基於瀏覽器調試。

## Dual-Service Architecture

開發期間兩進程同時運行：

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│  .NET Backend    │◄──────/ws────────►│  Vite Dev Server  │
│  (port 5174)     │                    │  (port 5173)      │
│  dotnet watch run│                    │  pnpm dev         │
│  --dev-server    │                    │  Hot Module Reload │
└─────────────────┘                    └──────────────────┘
        │                                       │
        │                                       │
        └───────── Browser (localhost:5173) ─────┘
```

1. **Backend**: `dotnet watch run --project src/BeagleTerm -- --dev-server` — 在5174端口運行WebSocket服務器，C#變更熱重載
2. **Frontend**: `cd src/BeagleTerm.Frontend && pnpm dev` — 在5173端口運行Vite，Svelte/CSS變更HMR

前端Vite開發服務器代理WebSocket連接至後端。

## DevServer Class

DevServer是輕量包裝器，無GUI窗口啟動基於WebSocket的後端：

```csharp
public sealed class DevServer : IDisposable
{
    private readonly WebSocketTransport _transport;
    private readonly MessageRouter _router;
    private readonly SessionManager _sessionManager;

    public DevServer(int port = 5174)
    {
        _sessionManager = new SessionManager();
        _transport = new WebSocketTransport(port);
        _router = new MessageRouter(_transport, _sessionManager);
    }

    public async Task RunAsync(CancellationToken cancellationToken = default)
    {
        await _transport.StartAsync(cancellationToken);
        Console.WriteLine("Dev server running on port 5174");
        Console.WriteLine("Start frontend: cd src/BeagleTerm.Frontend && pnpm dev");
        await Task.Delay(Timeout.Infinite, cancellationToken);
        await _transport.StopAsync();
    }

    public void Dispose() { /* cleanup */ }
}
```

## Vite Proxy Configuration

前端`vite.config.ts`須代理WebSocket連接至後端：

```typescript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './',                          // Required for embedded loading
  build: {
    outDir: '../BeagleTerm/wwwroot',   // Build output goes to .NET project
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      '/ws': {
        target: 'ws://localhost:5174',
        ws: true                       // Enable WebSocket proxying
      }
    }
  }
});
```

### Key Vite Settings

| Setting | Purpose |
|---------|---------|
| `base: './'` | Relative asset paths for embedded loading |
| `build.outDir` | Output to .NET project's `wwwroot/` |
| `server.proxy./ws` | Proxy WebSocket to backend |
| `server.proxy./ws.ws: true` | Enable WebSocket protocol upgrade |

## MessageBridge Auto-Detection

前端消息橋自動檢測是否在Photino（原生橋）或瀏覽器（WebSocket）中運行：

```typescript
// $lib/stores/messages.ts
function createBridge() {
  // Photino injects window.external.sendMessage
  if (window.external?.sendMessage) {
    return {
      send: (msg: string) => window.external.sendMessage(msg),
      onMessage: (handler: (msg: string) => void) => {
        window.external.receiveMessage = handler;
      }
    };
  }

  // Fallback: WebSocket for dev mode
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${location.host}/ws`);

  return {
    send: (msg: string) => ws.send(msg),
    onMessage: (handler: (msg: string) => void) => {
      ws.onmessage = (e) => handler(e.data);
    }
  };
}
```

### Bridge API

```typescript
import { send, on, off } from '$lib/stores/messages';

// Send message to backend
send('execute', { command: 'Get-Process', sessionId: 'main' });

// Listen for events from backend
const unsub = on('ps:output', (payload) => {
  console.log('Output:', payload);
});

// Clean up listener
off('ps:output', unsub);
```

## .agnt.kdl Configuration for Photino

Photino工程雙服務自動啟動參考`.agnt.kdl`：

```kdl
// .agnt.kdl - Photino.NET project configuration
project {
    name "MyPhotinoApp"
    type "dotnet-photino"
}

scripts {
    // Backend dev server (WebSocket) with hot-reload
    backend {
        run "dotnet watch run --project src/MyApp -- --dev-server"
        autostart true
    }

    // Frontend dev server (Vite with HMR)
    dev {
        run "pnpm dev"
        cwd "src/MyApp.Frontend"
        autostart true
        url-matchers "Local:\\s+{url}"
    }

    // Build and test (not auto-started)
    build {
        run "dotnet build"
    }

    test {
        run "dotnet test"
    }
}

proxies {
    dev {
        script "dev"
    }
}

hooks {
    on-response {
        toast true
        indicator true
    }
}
```

## Development Commands

### Start Development
```bash
# Option 1: Manual (two terminals)
dotnet watch run --project src/MyApp -- --dev-server  # Terminal 1
cd src/MyApp.Frontend && pnpm dev                      # Terminal 2

# Option 2: Using agnt (auto-starts both)
agnt run claude
```

### Verify WebSocket Connection
在`http://localhost:5173`打開瀏覽器DevTools控制台：
```javascript
// Should see WebSocket connected message in Network tab
// Or test manually:
const ws = new WebSocket('ws://localhost:5174/ws');
ws.onopen = () => console.log('Connected to backend');
ws.onmessage = (e) => console.log('Received:', e.data);
```

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| WebSocket connection refused | Backend not running | Start `dotnet watch run -- --dev-server` |
| 404 on /ws | Vite proxy misconfigured | Add `proxy: { '/ws': { target: 'ws://localhost:5174', ws: true } }` |
| Frontend loads but no data | Bridge detection failed | Check `window.external` availability |
| Hot-reload not working | `dotnet watch` not detecting changes | Ensure `.csproj` has correct watch settings |
| CORS errors in browser | Backend and frontend on different ports | WebSocket proxy handles this automatically |

## Debugging Strategies

### Backend Debugging
```bash
# Attach debugger to running dotnet watch process
dotnet watch run --project src/MyApp -- --dev-server
# Then attach VS Code debugger to the dotnet process
```

### Frontend Debugging
- 在瀏覽器打開`http://localhost:5173`
- 用F12 DevTools調試JavaScript
- Svelte DevTools瀏覽器擴展用於組件審查
- Network標籤 → WS過濾器查看WebSocket消息

### Message Debugging
在消息橋添加臨時日志：
```typescript
// In message store, wrap send/receive with logging
const originalSend = bridge.send;
bridge.send = (msg: string) => {
  console.log('[MSG OUT]', JSON.parse(msg));
  originalSend(msg);
};
```

### Using agnt Proxy for Browser Debugging
通過`agnt run claude`運行時，代理捕獲所有流量：
- 在agnt流量日志中查看請求/響應
- 用agnt的`__devtool`函數進行DOM審查
- AI代理響應時顯示Toast通知

## Related

- to run: `photino:photino-dev`
