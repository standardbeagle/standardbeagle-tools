---
description: "PowerShell SDK integration in Photino.NET: runspace architecture, SessionManager, streaming execution, TabExpansion2, function injection, PSObject conversion, and disposal patterns"
---

# PowerShell SDK Integration

How to embed the PowerShell SDK in a Photino.NET application: runspace lifecycle, session management, streaming output, tab completion, function injection, and object serialization.

## Runspace Architecture

The PowerShell SDK provides an in-process PowerShell engine. Each session gets its own runspace with isolated state:

```
┌──────────────────────────────────────────┐
│              SessionManager              │
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │Session 1│  │Session 2│  │Session 3│   │
│  │Runspace │  │Runspace │  │Runspace │   │
│  │Pipeline │  │Pipeline │  │Pipeline │   │
│  └────────┘  └────────┘  └────────┘    │
│  Each session has independent:           │
│  - Variables ($PWD, $LASTEXITCODE)       │
│  - Functions (custom + injected)         │
│  - History                               │
│  - Working directory                     │
└──────────────────────────────────────────┘
```

## SessionManager

The SessionManager creates, tracks, and disposes PowerShell sessions:

```csharp
public sealed class SessionManager : IDisposable
{
    private readonly ConcurrentDictionary<string, PowerShellSession> _sessions = new();

    public PowerShellSession CreateSession(string sessionId)
    {
        var session = new PowerShellSession(sessionId);
        if (!_sessions.TryAdd(sessionId, session))
            throw new InvalidOperationException($"Session '{sessionId}' already exists");
        return session;
    }

    public PowerShellSession? GetSession(string sessionId)
    {
        _sessions.TryGetValue(sessionId, out var session);
        return session;
    }

    public void CloseSession(string sessionId)
    {
        if (_sessions.TryRemove(sessionId, out var session))
            session.Dispose();
    }

    public void Dispose()
    {
        foreach (var session in _sessions.Values)
            session.Dispose();
        _sessions.Clear();
    }
}
```

## PowerShellSession

Each session wraps a runspace and provides execution, completion, and cancellation:

```csharp
public sealed class PowerShellSession : IDisposable
{
    private readonly Runspace _runspace;
    private System.Management.Automation.PowerShell? _currentPipeline;
    private readonly string _sessionId;

    public event Action<string>? OutputReceived;
    public event Action<string>? ErrorReceived;
    public event Action<int>? ExecutionCompleted;

    public PowerShellSession(string sessionId)
    {
        _sessionId = sessionId;
        var iss = InitialSessionState.CreateDefault2();
        _runspace = RunspaceFactory.CreateRunspace(iss);
        _runspace.Open();
        InjectFunctions();
    }

    public async Task ExecuteAsync(string command, CancellationToken ct = default)
    {
        using var ps = System.Management.Automation.PowerShell.Create();
        ps.Runspace = _runspace;
        _currentPipeline = ps;

        ps.AddScript(command);

        // Stream output as it arrives
        var output = new PSDataCollection<PSObject>();
        output.DataAdded += (sender, e) =>
        {
            var data = ((PSDataCollection<PSObject>)sender!)[e.Index];
            OutputReceived?.Invoke(FormatPSObject(data));
        };

        ps.Streams.Error.DataAdded += (sender, e) =>
        {
            var err = ((PSDataCollection<ErrorRecord>)sender!)[e.Index];
            ErrorReceived?.Invoke(err.ToString());
        };

        try
        {
            await Task.Factory.FromAsync(
                ps.BeginInvoke<PSObject, PSObject>(null, output),
                ps.EndInvoke);
        }
        finally
        {
            _currentPipeline = null;
        }

        ExecutionCompleted?.Invoke(ps.HadErrors ? 1 : 0);
    }

    public void Cancel()
    {
        _currentPipeline?.Stop();
    }

    public void Dispose()
    {
        _currentPipeline?.Dispose();
        _runspace.Close();
        _runspace.Dispose();
    }
}
```

## Streaming Execution

PowerShell output streams as objects are produced, not after the command completes. This enables real-time display:

```csharp
// The PSDataCollection fires DataAdded for each object
var output = new PSDataCollection<PSObject>();
output.DataAdded += (sender, e) =>
{
    var data = ((PSDataCollection<PSObject>)sender!)[e.Index];
    // This fires immediately as each object is produced
    OutputReceived?.Invoke(FormatPSObject(data));
};
```

### Output Streams

PowerShell has multiple output streams:

| Stream | Property | Use |
|--------|----------|-----|
| Output (1) | `PSDataCollection<PSObject>` | Normal output objects |
| Error (2) | `ps.Streams.Error` | Error records |
| Warning (3) | `ps.Streams.Warning` | Warning messages |
| Verbose (4) | `ps.Streams.Verbose` | Verbose messages |
| Debug (5) | `ps.Streams.Debug` | Debug messages |
| Information (6) | `ps.Streams.Information` | Information records |
| Progress | `ps.Streams.Progress` | Progress bars |

Subscribe to each stream for full output:

```csharp
ps.Streams.Warning.DataAdded += (s, e) =>
{
    var warn = ((PSDataCollection<WarningRecord>)s!)[e.Index];
    OutputReceived?.Invoke($"WARNING: {warn.Message}");
};

ps.Streams.Progress.DataAdded += (s, e) =>
{
    var progress = ((PSDataCollection<ProgressRecord>)s!)[e.Index];
    // Forward progress percentage to frontend
};
```

## TabExpansion2

The PowerShell SDK includes `TabExpansion2` for command completion:

```csharp
public CompletionResult[] GetCompletions(string input, int cursorPosition)
{
    using var ps = System.Management.Automation.PowerShell.Create();
    ps.Runspace = _runspace;

    ps.AddCommand("TabExpansion2")
      .AddParameter("inputScript", input)
      .AddParameter("cursorColumn", cursorPosition);

    var results = ps.Invoke();
    if (results.Count == 0) return Array.Empty<CompletionResult>();

    var completions = results[0].Properties["CompletionMatches"].Value;
    if (completions is not IList<CompletionResult> matches)
        return Array.Empty<CompletionResult>();

    return matches.ToArray();
}
```

### Completion Result Structure

```csharp
// Each CompletionResult has:
// - CompletionText: What to insert
// - ListItemText: What to show in the dropdown
// - ResultType: Command, ProviderItem, ParameterName, etc.
// - ToolTip: Additional description
```

### Gotcha: TabExpansion2 Runs Synchronously

`TabExpansion2` can be slow (100-500ms) because it introspects the runspace. Always:
1. Run on a background thread, never block the UI
2. Cancel in-flight completions when the user types again
3. Debounce completion requests (150-200ms is typical)

```csharp
private CancellationTokenSource? _completionCts;

public async Task<CompletionResult[]> GetCompletionsAsync(string input, int cursor)
{
    // Cancel previous completion request
    _completionCts?.Cancel();
    _completionCts = new CancellationTokenSource();
    var ct = _completionCts.Token;

    return await Task.Run(() =>
    {
        ct.ThrowIfCancellationRequested();
        return GetCompletions(input, cursor);
    }, ct);
}
```

## Function Injection

Inject custom PowerShell functions into each session's runspace for app-specific features:

```csharp
private void InjectFunctions()
{
    using var ps = System.Management.Automation.PowerShell.Create();
    ps.Runspace = _runspace;

    // Inject a function that the frontend can call
    ps.AddScript(@"
        function global:__beagle_notify {
            param([string]$Message, [string]$Type = 'info')
            $global:__service.Notify($Message, $Type)
        }

        function global:__beagle_setvar {
            param([string]$Name, [object]$Value)
            $global:__service.SetVariable($Name, $Value)
        }
    ");

    ps.Invoke();
}
```

### The `$global:__service` Pattern

Expose a C# object to PowerShell via a global variable:

```csharp
// Set a C# service object accessible from PowerShell
_runspace.SessionStateProxy.SetVariable("__service", new PowerShellServiceBridge(this));

// The bridge exposes methods that PowerShell can call
public class PowerShellServiceBridge
{
    private readonly PowerShellSession _session;

    public PowerShellServiceBridge(PowerShellSession session)
        => _session = session;

    public void Notify(string message, string type)
    {
        _session.NotificationReceived?.Invoke(message, type);
    }

    public void SetVariable(string name, object value)
    {
        _session.VariableChanged?.Invoke(name, value);
    }
}
```

## PSObject Conversion

PowerShell returns `PSObject` wrappers. Convert them to JSON-friendly structures for the frontend:

```csharp
private static string FormatPSObject(PSObject obj)
{
    if (obj.BaseObject is string s)
        return s;

    // For complex objects, extract properties into a dictionary
    var dict = new Dictionary<string, object?>();
    foreach (var prop in obj.Properties)
    {
        try
        {
            dict[prop.Name] = prop.Value?.ToString();
        }
        catch
        {
            dict[prop.Name] = null;
        }
    }

    return JsonSerializer.Serialize(dict);
}
```

### Rich Object Rendering

For known types, provide structured output:

```csharp
private static object ConvertPSObject(PSObject obj)
{
    return obj.BaseObject switch
    {
        string s => new { type = "text", value = s },
        System.Diagnostics.Process p => new
        {
            type = "process",
            pid = p.Id,
            name = p.ProcessName,
            cpu = p.TotalProcessorTime,
            memory = p.WorkingSet64
        },
        System.IO.FileInfo f => new
        {
            type = "file",
            name = f.Name,
            size = f.Length,
            modified = f.LastWriteTime
        },
        _ => new { type = "object", properties = ExtractProperties(obj) }
    };
}
```

## Disposal Pattern

PowerShell runspaces hold native resources. Proper disposal is critical:

```csharp
public sealed class PowerShellSession : IDisposable
{
    private bool _disposed;

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        // Cancel any running pipeline first
        try { _currentPipeline?.Stop(); } catch { }
        try { _currentPipeline?.Dispose(); } catch { }

        // Close runspace (blocks until pipeline finishes)
        try
        {
            if (_runspace.RunspaceStateInfo.State == RunspaceState.Opened)
                _runspace.Close();
        }
        catch { }

        _runspace.Dispose();
    }
}
```

### Disposal Order

1. Stop running pipelines
2. Close the runspace (graceful shutdown)
3. Dispose the runspace (release native resources)
4. Remove from SessionManager

Never dispose a runspace while a pipeline is executing — call `Stop()` first.

## Common Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| `PSInvalidOperationException: Runspace is not opened` | Using disposed session | Check `_disposed` before operations |
| Memory leak in long sessions | Unreleased pipelines | Always dispose `PowerShell` objects |
| Deadlock in event handlers | Blocking STA thread | Use `_ = HandleAsync()` pattern |
| Slow first command | Runspace initialization | Pre-warm with dummy command on creation |
| `ApartmentState` error | Wrong thread model | Ensure `[STAThread]` on Main |
