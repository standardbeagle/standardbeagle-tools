---
description: "Central message routing pattern for Photino.NET: {type,payload} message format, HandleMessage dispatch, Send helper, event wiring, Svelte 5 component patterns, and IAsyncDisposable in sync contexts. Photino.NET中央消息路由模式：{type,payload}消息格式、HandleMessage分發、Send輔助、事件關聯、Svelte 5組件模式及同步上下文中IAsyncDisposable. Use when: implementing message routing, adding new message types, wiring service events, handling async disposal in Photino context"
---

# Message Router Pattern

Photino.NET應用.NET後端與Web前端通信之中心樞紐模式。

## Message Format

所有消息用簡單JSON信封：

```json
{
  "type": "execute",
  "payload": {
    "command": "Get-Process",
    "sessionId": "main"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Message type identifier (event name) |
| `payload` | `object` | Type-specific data (optional) |

## Event Naming Convention

用冒號分隔命名空間：`domain:action`或`domain:action:detail`

```
Frontend → Backend (commands):
  execute, cancel, getEnvironment, createSession, closeSession
  getHistory, getCompletions, getChildren
  pty:create, pty:write, pty:resize, pty:close
  claude:create, claude:write, claude:close

Backend → Frontend (events):
  ps:output, ps:error, ps:completed, ps:progress
  pty:output, pty:exited, pty:sessionCreated, pty:modeChanged
  claude:output, claude:exited, claude:created
  background:completed, background:output:stream
  notification:new, process:updated, process:exited
  job:discovered, job:stateChanged, job:removed
```

## MessageRouter Class

路由器接收原始JSON字符串，解析後分發至處理器：

```csharp
public sealed class MessageRouter : IDisposable
{
    private readonly IMessageTransport _transport;
    private readonly SessionManager _sessionManager;
    private readonly JsonSerializerOptions _jsonOptions;

    public MessageRouter(IMessageTransport transport, SessionManager sessionManager)
    {
        _transport = transport;
        _sessionManager = sessionManager;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = false,
            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
        };

        _transport.MessageReceived += HandleMessage;
    }
}
```

## HandleMessage Dispatch

解析`type`字段並路由至正確處理器：

```csharp
public void HandleMessage(string message)
{
    try
    {
        using var doc = JsonDocument.Parse(message);
        var root = doc.RootElement;

        if (!root.TryGetProperty("type", out var typeElement))
        {
            SendError("Missing 'type' in message");
            return;
        }

        var type = typeElement.GetString();
        var payload = root.TryGetProperty("payload", out var payloadElement)
            ? payloadElement
            : default;

        _ = HandleMessageAsync(type!, payload);
    }
    catch (JsonException ex)
    {
        SendError($"Invalid JSON: {ex.Message}");
    }
}

private async Task HandleMessageAsync(string type, JsonElement payload)
{
    try
    {
        switch (type)
        {
            case "execute":
                await HandleExecuteAsync(payload);
                break;
            case "cancel":
                HandleCancel(payload);
                break;
            case "getEnvironment":
                SendEnvironment();
                break;
            case "createSession":
                HandleCreateSession(payload);
                break;
            case "closeSession":
                HandleCloseSession(payload);
                break;
            // PTY commands
            case "pty:create":
                HandlePtyCreate(payload);
                break;
            case "pty:write":
                HandlePtyWrite(payload);
                break;
            case "pty:resize":
                HandlePtyResize(payload);
                break;
            // ... additional handlers
            default:
                SendError($"Unknown message type: {type}");
                break;
        }
    }
    catch (Exception ex)
    {
        SendError($"Error handling '{type}': {ex.Message}");
    }
}
```

### Key Pattern: `_ = HandleMessageAsync()`

`HandleMessage`方法同步（由傳輸層調用），但處理器可為異步。用即發即忘：

```csharp
// CORRECT: Fire and forget, errors caught inside HandleMessageAsync
_ = HandleMessageAsync(type!, payload);

// WRONG: Blocks the transport's receive loop
HandleMessageAsync(type!, payload).GetAwaiter().GetResult();

// WRONG: Async void — exceptions crash the process
async void HandleMessage(string message) { ... }
```

## Send Helper

通過傳輸層向前端發送消息：

```csharp
private void Send(string type, object? payload = null)
{
    var message = JsonSerializer.Serialize(new { type, payload }, _jsonOptions);
    _transport.Send(message);
}

private void SendError(string message)
{
    Send("error", new { message });
}
```

### Thread Safety

`Send()`可從多線程調用（事件處理器、異步延續）。傳輸實現必須線程安全：

```csharp
// WebSocketTransport: Use a lock or SemaphoreSlim for Send
private readonly SemaphoreSlim _sendLock = new(1, 1);

public void Send(string message)
{
    _sendLock.Wait();
    try
    {
        if (_socket?.State == WebSocketState.Open)
        {
            var bytes = Encoding.UTF8.GetBytes(message);
            _socket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None)
                   .GetAwaiter().GetResult();
        }
    }
    finally
    {
        _sendLock.Release();
    }
}
```

## Wiring Service Events

將後端服務事件連接至消息路由器，以轉發至前端：

```csharp
// In MessageRouter constructor — wire events with exception guards
_ptySessionManager.OutputReceived += (_, e) =>
{
    try
    {
        Send("pty:output", new { sessionId = e.SessionId, data = e.Data });
    }
    catch (Exception ex)
    {
        System.Diagnostics.Debug.WriteLine(
            $"Failed to send pty:output for session {e.SessionId}: {ex.Message}");
    }
};

_ptySessionManager.SessionExited += (_, e) =>
{
    // Clean up state when session exits
    lock (_ptyBgLock)
    {
        _backgroundedPtySessions.Remove(e.SessionId);
    }
    try
    {
        Send("pty:exited", new {
            sessionId = e.SessionId,
            exitCode = e.ExitCode
        });
    }
    catch (Exception ex)
    {
        System.Diagnostics.Debug.WriteLine(
            $"Failed to send pty:exited: {ex.Message}");
    }
};
```

### Exception Guard Pattern

事件處理器務必用try/catch包裹。未處理異常可導致應用崩潰或靜默斷開傳輸：

```csharp
// CORRECT: Exception guard
service.SomeEvent += (_, e) =>
{
    try { Send("event:type", new { data = e.Data }); }
    catch (Exception ex) { Debug.WriteLine($"Failed: {ex.Message}"); }
};

// WRONG: Unguarded — transport error crashes the app
service.SomeEvent += (_, e) =>
{
    Send("event:type", new { data = e.Data });
};
```

## Svelte 5 Frontend Component Pattern

前端用Svelte 5 runes（`$state`、`$derived`、`$effect`）及消息存儲：

```svelte
<script lang="ts">
  import { send, on } from '$lib/stores/messages';

  // Reactive state with Svelte 5 runes
  let processes = $state<ProcessInfo[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Derived state
  let sortedProcesses = $derived(
    [...processes].sort((a, b) => b.cpu - a.cpu)
  );

  // Subscribe to backend events
  $effect(() => {
    const unsubs = [
      on('ps:output', (payload) => {
        if (payload.type === 'object') {
          processes = [...processes, payload.data];
        }
      }),
      on('ps:error', (payload) => {
        error = payload.message;
      }),
      on('ps:completed', () => {
        loading = false;
      })
    ];

    // Cleanup subscriptions on component destroy
    return () => unsubs.forEach(unsub => unsub());
  });

  function refresh() {
    loading = true;
    error = null;
    processes = [];
    send('execute', {
      command: 'Get-Process | Select-Object Name, Id, CPU, WorkingSet64',
      sessionId: 'main'
    });
  }
</script>

<div>
  <button onclick={refresh} disabled={loading}>
    {loading ? 'Loading...' : 'Refresh'}
  </button>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <ul>
    {#each sortedProcesses as proc}
      <li>{proc.Name} (PID: {proc.Id}, CPU: {proc.CPU})</li>
    {/each}
  </ul>
</div>
```

### Message Store Implementation

```typescript
// $lib/stores/messages.ts
type MessageHandler = (payload: any) => void;

const handlers = new Map<string, Set<MessageHandler>>();
let bridge: { send: (msg: string) => void; onMessage: (h: (msg: string) => void) => void };

function init() {
  bridge = createBridge();
  bridge.onMessage((raw) => {
    const { type, payload } = JSON.parse(raw);
    handlers.get(type)?.forEach(h => h(payload));
  });
}

export function send(type: string, payload?: any) {
  bridge.send(JSON.stringify({ type, payload }));
}

export function on(type: string, handler: MessageHandler): () => void {
  if (!handlers.has(type)) handlers.set(type, new Set());
  handlers.get(type)!.add(handler);

  // Return unsubscribe function
  return () => handlers.get(type)?.delete(handler);
}

export function off(type: string, handler: MessageHandler) {
  handlers.get(type)?.delete(handler);
}
```

## IAsyncDisposable in Sync Context

Photino之`WaitForClose()`阻塞STA線程，故無法`await`釋放。在同步上下文中處理異步清理：

```csharp
public sealed class MessageRouter : IDisposable
{
    private bool _disposed;

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        _transport.MessageReceived -= HandleMessage;

        // Dispose async services synchronously
        // Use the synchronous Dispose() overload when available
        _ptySessionManager.Dispose();
        _claudeSessionManager.Dispose();
        _backgroundManager.Dispose();
        _sessionManager.Dispose();

        // For IAsyncDisposable-only services:
        // _asyncService.DisposeAsync().AsTask().GetAwaiter().GetResult();
        // But prefer implementing both IDisposable and IAsyncDisposable
    }
}
```

### Pattern: Implement Both Interfaces

```csharp
public sealed class MyService : IDisposable, IAsyncDisposable
{
    private bool _disposed;

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        // Synchronous cleanup
        _resource?.Dispose();
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed) return;
        _disposed = true;
        // Async cleanup
        if (_resource != null)
            await _resource.DisposeAsync();
    }
}
```

## Adding a New Message Type

添加新命令/事件對清單：

1. **定義消息類型**於命名慣例（`domain:action`）
2. **添加處理器**至`HandleMessageAsync` switch語句
3. **實現處理器方法**（如`HandleNewFeatureAsync`）
4. **關聯事件**在構造器中加異常守衛
5. **添加前端處理器**，在對應組件中用`on()`
6. **添加TypeScript類型**定義payload形狀
7. **測試**，在瀏覽器DevTools中手動發送WebSocket消息

```csharp
// Step 2: Add case
case "myfeature:start":
    await HandleMyFeatureStartAsync(payload);
    break;

// Step 3: Implement handler
private async Task HandleMyFeatureStartAsync(JsonElement payload)
{
    var id = payload.GetProperty("id").GetString()!;
    var result = await _myService.StartAsync(id);
    Send("myfeature:started", new { id, status = "ok" });
}

// Step 4: Wire events
_myService.ProgressChanged += (_, e) =>
{
    try { Send("myfeature:progress", new { id = e.Id, percent = e.Percent }); }
    catch (Exception ex) { Debug.WriteLine($"Failed: {ex.Message}"); }
};
```
