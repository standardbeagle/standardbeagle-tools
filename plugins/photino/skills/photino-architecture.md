---
description: "Photino.NET desktop app architecture: PhotinoWindow APIs, threading model, native message bridge, IMessageTransport abstraction, dual-mode Program.cs, and cross-platform WebView engine table. Photino.NET桌面應用架構：PhotinoWindow API、線程模型、原生消息橋、IMessageTransport抽象、雙模Program.cs及跨平台WebView引擎表. Use when: understanding Photino architecture, setting up AppHost, implementing transport abstraction, configuring dual-mode entry point"
---

# Photino.NET Architecture

構建跨平台桌面應用之Photino.NET參考架構，含WebView宿主、線程模型、消息橋、傳輸抽象及雙模入口點。

## What is Photino.NET

Photino.NET將各平台原生WebView封裝為.NET窗口：

| Platform | WebView Engine | Notes |
|----------|---------------|-------|
| Windows | WebView2 (Chromium) | Auto-installed with Edge; `WebView2Loader.dll` bundled |
| Linux | WebKitGTK | Install `libwebkit2gtk-4.1-dev` (Ubuntu/Debian) |
| macOS | WKWebView | Built-in, no extra deps |

應用以**單.NET二進制**形式交付，打開原生窗口、加載HTML/CSS/JS，並通過消息橋與C#通信。

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

**關鍵**：Photino要求主線程`[STAThread]`。窗口消息循環在此線程運行。所有後端工作須在後台線程執行。

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

1. `PhotinoWindow.SendWebMessage()`線程安全——可從任意線程調用
2. `PhotinoWindow.Load()`須在`WaitForClose()`前調用
3. 事件處理器（Web消息接收）在UI線程運行——將長任務分發至後台線程
4. 絕不用`Task.Wait()`或`.Result`阻塞STA線程——用即發即忘`_ = HandleAsync()`

## IMessageTransport Abstraction

傳輸接口將消息路由器與交付機制解耦。此使雙模操作成為可能（Photino原生橋 vs 開發用WebSocket）。

```csharp
public interface IMessageTransport : IDisposable
{
    event Action<string> MessageReceived;
    void Send(string message);
}
```

### Transport Implementations

**PhotinoTransport** — 生產模式，使用原生橋：
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

**WebSocketTransport** — 開發模式，支持瀏覽器熱重載：
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

入口點通過CLI標誌在桌面（Photino）與開發（WebSocket）模式間切換：

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
- `dotnet run` — 打開Photino窗口，加載`wwwroot/index.html`
- `dotnet run -- --dev-server` — 在5174端口啟動WebSocket，無GUI
- `dotnet run -- --dev-url http://localhost:5173` — 打開Photino窗口，指向Vite開發服務器

## AppHost Pattern

AppHost將Photino窗口與傳輸及路由器連接：

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
