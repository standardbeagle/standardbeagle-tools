---
description: "Photino.NET desktop app architecture: PhotinoWindow APIs, threading model, native message bridge, IMessageTransport abstraction, dual-mode Program.cs, and cross-platform WebView engine table"
---

# Photino.NET Architecture

Reference architecture for building cross-platform desktop applications with Photino.NET, covering the WebView host, threading model, message bridge, transport abstraction, and dual-mode entry point.

## What is Photino.NET

Photino.NET wraps each platform's native WebView into a .NET window:

| Platform | WebView Engine | Notes |
|----------|---------------|-------|
| Windows | WebView2 (Chromium) | Auto-installed with Edge; `WebView2Loader.dll` bundled |
| Linux | WebKitGTK | Install `libwebkit2gtk-4.1-dev` (Ubuntu/Debian) |
| macOS | WKWebView | Built-in, no extra deps |

The app ships as a **single .NET binary** that opens a native window, loads HTML/CSS/JS, and communicates with C# through a message bridge.

## PhotinoWindow Core APIs

```csharp
var window = new PhotinoWindow()
    .SetTitle("My App")
    .SetSize(1200, 800)
    .SetIconFile("icon.ico")
    .Center()
    .SetDevToolsEnabled(true)       // F12 opens DevTools
    .SetContextMenuEnabled(false)   // Disable right-click menu
    .RegisterWebMessageReceivedHandler(HandleWebMessage);

// Load embedded HTML (production) or dev server URL (development)
if (devUrl != null)
    window.Load(new Uri(devUrl));
else
    window.Load("wwwroot/index.html");

window.WaitForClose();
```

### Key PhotinoWindow Methods

| Method | Purpose |
|--------|---------|
| `.Load(string path)` | Load local HTML file |
| `.Load(Uri url)` | Load remote URL (dev server) |
| `.SendWebMessage(string msg)` | Send JSON string to frontend |
| `.RegisterWebMessageReceivedHandler(handler)` | Receive messages from frontend |
| `.SetTitle(string)` | Window title bar text |
| `.SetSize(int w, int h)` | Initial window dimensions |
| `.Center()` | Center on screen |
| `.SetDevToolsEnabled(bool)` | Enable F12 DevTools |
| `.WaitForClose()` | Block until window closes |

## Threading Model

**Critical**: Photino requires `[STAThread]` on the main thread. The window's message loop runs on this thread. All backend work must happen on background threads.

```csharp
[STAThread]
public static void Main(string[] args)
{
    // Window creation and WaitForClose() run on STA thread
    using var host = new AppHost(devUrl);
    host.Run();  // Blocks on WaitForClose()
}
```

### Thread Safety Rules

1. `PhotinoWindow.SendWebMessage()` is thread-safe — can be called from any thread
2. `PhotinoWindow.Load()` must be called before `WaitForClose()`
3. Event handlers (web message received) run on the UI thread — dispatch long work to background threads
4. Never block the STA thread with `Task.Wait()` or `.Result` — use fire-and-forget with `_ = HandleAsync()`

## IMessageTransport Abstraction

The transport interface decouples the message router from the delivery mechanism. This enables dual-mode operation (Photino native bridge vs WebSocket for development).

```csharp
public interface IMessageTransport : IDisposable
{
    event Action<string> MessageReceived;
    void Send(string message);
}
```

### Transport Implementations

**PhotinoTransport** — Production mode, uses native bridge:
```csharp
public sealed class PhotinoTransport : IMessageTransport
{
    private readonly PhotinoWindow _window;

    public event Action<string>? MessageReceived;

    public PhotinoTransport(PhotinoWindow window)
    {
        _window = window;
        _window.RegisterWebMessageReceivedHandler((sender, message) =>
        {
            MessageReceived?.Invoke(message);
        });
    }

    public void Send(string message)
    {
        _window.SendWebMessage(message);
    }

    public void Dispose() { }
}
```

**WebSocketTransport** — Dev mode, enables browser hot-reload:
```csharp
public sealed class WebSocketTransport : IMessageTransport, IDisposable
{
    private readonly int _port;
    private HttpListener? _listener;
    private WebSocket? _socket;

    public event Action<string>? MessageReceived;

    public WebSocketTransport(int port = 5174) => _port = port;

    public async Task StartAsync(CancellationToken ct = default)
    {
        _listener = new HttpListener();
        _listener.Prefixes.Add($"http://localhost:{_port}/ws/");
        _listener.Start();
        // Accept WebSocket connections in a loop...
    }

    public void Send(string message)
    {
        if (_socket?.State == WebSocketState.Open)
        {
            var bytes = Encoding.UTF8.GetBytes(message);
            _socket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None)
                   .GetAwaiter().GetResult();
        }
    }

    public void Dispose() { /* cleanup */ }
}
```

## Dual-Mode Program.cs

The entry point switches between desktop (Photino) and development (WebSocket) modes via CLI flags:

```csharp
using BeagleTerm.App;

namespace BeagleTerm;

public static class Program
{
    [STAThread]
    public static void Main(string[] args)
    {
        if (HasFlag(args, "--dev-server"))
        {
            // Dev mode: WebSocket backend only (no GUI)
            var port = GetIntArg(args, "--port") ?? 5174;
            using var server = new DevServer(port);
            using var cts = new CancellationTokenSource();

            Console.CancelKeyPress += (_, e) => { e.Cancel = true; cts.Cancel(); };
            server.RunAsync(cts.Token).GetAwaiter().GetResult();
        }
        else
        {
            // Production mode: Photino window with embedded frontend
            var devUrl = GetStringArg(args, "--dev-url");
            using var host = new AppHost(devUrl);
            host.Run();
        }
    }
}
```

**Modes:**
- `dotnet run` — Opens Photino window, loads `wwwroot/index.html`
- `dotnet run -- --dev-server` — Starts WebSocket on port 5174, no GUI
- `dotnet run -- --dev-url http://localhost:5173` — Opens Photino window pointing at Vite dev server

## AppHost Pattern

The AppHost wires up the Photino window with the transport and router:

```csharp
public sealed class AppHost : IDisposable
{
    private readonly PhotinoWindow _window;
    private readonly PhotinoTransport _transport;
    private readonly MessageRouter _router;
    private readonly SessionManager _sessionManager;

    public AppHost(string? devUrl = null)
    {
        _sessionManager = new SessionManager();
        _window = new PhotinoWindow()
            .SetTitle("BeagleTerm")
            .SetSize(1200, 800)
            .Center()
            .SetDevToolsEnabled(true);

        _transport = new PhotinoTransport(_window);
        _router = new MessageRouter(_transport, _sessionManager);

        if (devUrl != null)
            _window.Load(new Uri(devUrl));
        else
            _window.Load("wwwroot/index.html");
    }

    public void Run() => _window.WaitForClose();

    public void Dispose()
    {
        _router.Dispose();
        _sessionManager.Dispose();
    }
}
```

## Cross-Platform WebView Differences

| Feature | WebView2 (Windows) | WebKitGTK (Linux) | WKWebView (macOS) |
|---------|--------------------|--------------------|---------------------|
| DevTools | F12 | Inspector (right-click) | Web Inspector |
| localStorage | Full support | Full support | Full support |
| WebSocket | Full | Full | Full |
| Custom scheme | Limited | Limited | Limited |
| Performance | Excellent | Good | Excellent |
| GPU acceleration | Yes | Depends on driver | Yes |

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│                  Program.cs                  │
│         [STAThread] Main(args)              │
│     ┌───────────┴───────────┐               │
│     │                       │               │
│  AppHost                DevServer           │
│  (Photino window)       (No GUI)            │
│     │                       │               │
│  PhotinoTransport     WebSocketTransport    │
│     │                       │               │
│     └──────────┬────────────┘               │
│           IMessageTransport                 │
│                │                            │
│          MessageRouter                      │
│         ┌──────┼──────────┐                 │
│   SessionMgr  PtyMgr  BackgroundMgr        │
└─────────────────────────────────────────────┘
```
