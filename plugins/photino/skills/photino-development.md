---
description: "Photino.NET dual-service development workflow: DevServer class, Vite proxy config, MessageBridge auto-detection, debugging strategies, and .agnt.kdl configuration"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep"]
---

# Photino.NET Development Workflow

How to set up and run a Photino.NET project in development mode with dual services (backend + frontend), hot-reload, and browser-based debugging.

## Dual-Service Architecture

During development, two processes run simultaneously:

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

1. **Backend**: `dotnet watch run --project src/BeagleTerm -- --dev-server` — Runs WebSocket server on port 5174 with hot-reload on C# changes
2. **Frontend**: `cd src/BeagleTerm.Frontend && pnpm dev` — Runs Vite on port 5173 with HMR for Svelte/CSS changes

The frontend's Vite dev server proxies WebSocket connections to the backend.

## DevServer Class

The DevServer is a lightweight wrapper that starts a WebSocket-based backend without a GUI window:

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

The frontend's `vite.config.ts` must proxy WebSocket connections to the backend:

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

The frontend message bridge automatically detects whether it's running inside Photino (native bridge) or a browser (WebSocket):

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

Reference `.agnt.kdl` for a Photino project with dual-service autostart:

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
Open browser DevTools console on `http://localhost:5173`:
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
- Open `http://localhost:5173` in browser
- Use F12 DevTools for JavaScript debugging
- Svelte DevTools browser extension for component inspection
- Network tab → WS filter to inspect WebSocket messages

### Message Debugging
Add temporary logging to the message bridge:
```typescript
// In message store, wrap send/receive with logging
const originalSend = bridge.send;
bridge.send = (msg: string) => {
  console.log('[MSG OUT]', JSON.parse(msg));
  originalSend(msg);
};
```

### Using agnt Proxy for Browser Debugging
When running via `agnt run claude`, the proxy captures all traffic:
- View requests/responses in agnt's traffic log
- Use agnt's `__devtool` functions for DOM inspection
- Toast notifications when the AI agent responds
