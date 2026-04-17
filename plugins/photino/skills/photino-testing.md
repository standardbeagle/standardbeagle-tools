---
description: "Testing strategies for Photino.NET apps: testability tiers (pure logic, AST without runspace, live integration), environment traits, fixture patterns, and test filtering. Photino.NET應用測試策略：可測試性層級（純邏輯、無runspace AST、實時集成）、環境特性、夾具模式及測試過濾. Use when: setting up test project, writing unit or integration tests, filtering test runs, collecting coverage, handling environment-dependent tests"
---

# Testing Photino.NET Applications

Photino應用三層測試策略：純邏輯測試（無mock、無依賴）、AST/解析測試（無需runspace）及實時集成測試（完整PowerShell引擎）。

## Testability Tiers

```
Tier 1: Pure Logic (fast, no deps)          ← Prefer this
  - String formatting, parsing, conversion
  - State machines, business rules
  - Data structures, algorithms

Tier 2: AST Without Runspace (medium)
  - PowerShell AST parsing
  - Script analysis
  - Syntax validation
  - No actual execution needed

Tier 3: Live Integration (slow, deps)       ← Use sparingly
  - Full PowerShell execution
  - WebSocket transport
  - End-to-end message routing
```

## Tier 1: Pure Logic Tests

不含任何PowerShell或Photino依賴測試業務邏輯。毫秒級運行，無需mock：

```csharp
public class OutputFormatterTests
{
    [Fact]
    public void FormatFileSize_ByteRange_ShowsBytes()
    {
        Assert.Equal("512 B", OutputFormatter.FormatFileSize(512));
    }

    [Fact]
    public void FormatFileSize_KilobyteRange_ShowsKB()
    {
        Assert.Equal("1.5 KB", OutputFormatter.FormatFileSize(1536));
    }

    [Theory]
    [InlineData("Get-Process", "Get-Process")]
    [InlineData("  ls  ", "ls")]
    [InlineData("", "")]
    public void NormalizeCommand_TrimsWhitespace(string input, string expected)
    {
        Assert.Equal(expected, CommandParser.Normalize(input));
    }
}
```

### What Belongs in Tier 1

- 消息類型解析（`{type, payload}`格式）
- 路徑規範化與驗證
- 輸出格式化（文件大小、日期、顏色）
- 配置解析
- 事件名稱驗證
- 鍵盤快捷鍵解析

## Tier 2: AST Without Runspace

PowerShell AST解析器無需runspace。用於腳本分析測試：

```csharp
public class ScriptAnalyzerTests
{
    [Fact]
    public void ParseScript_ValidCommand_ReturnsAST()
    {
        var ast = System.Management.Automation.Language.Parser.ParseInput(
            "Get-Process | Where-Object CPU -gt 10",
            out var tokens,
            out var errors);

        Assert.Empty(errors);
        Assert.NotNull(ast);
    }

    [Fact]
    public void ParseScript_SyntaxError_ReturnsErrors()
    {
        var ast = System.Management.Automation.Language.Parser.ParseInput(
            "Get-Process |",  // Incomplete pipeline
            out var tokens,
            out var errors);

        Assert.NotEmpty(errors);
    }

    [Fact]
    public void ExtractCommandNames_Pipeline_FindsAllCommands()
    {
        var ast = System.Management.Automation.Language.Parser.ParseInput(
            "Get-Process | Sort-Object CPU | Select-Object -First 5",
            out _, out _);

        var commands = ast.FindAll(a => a is CommandAst, true)
            .Cast<CommandAst>()
            .Select(c => c.GetCommandName())
            .ToList();

        Assert.Equal(new[] { "Get-Process", "Sort-Object", "Select-Object" }, commands);
    }
}
```

### Trailing Whitespace Gotcha

測試AST token位置時，注意解析器在某些token中包含尾隨空白。比較時務必裁剪：

```csharp
[Fact]
public void TokenExtent_IncludesTrailingWhitespace()
{
    Parser.ParseInput("Get-Process  |  Sort-Object",
        out var tokens, out _);

    // Token text may include surrounding whitespace
    // depending on the token type
    var firstToken = tokens[0];
    Assert.Equal("Get-Process", firstToken.Text);
    // But the extent might span to the next token
}
```

## Tier 3: Live Integration Tests

此類測試使用真實PowerShell runspace。用Trait標記以便選擇性執行：

```csharp
[Trait("Category", "Integration")]
public class PowerShellSessionIntegrationTests : IDisposable
{
    private readonly PowerShellSession _session;

    public PowerShellSessionIntegrationTests()
    {
        _session = new PowerShellSession("test-" + Guid.NewGuid().ToString("N")[..8]);
    }

    [Fact]
    public async Task ExecuteAsync_SimpleCommand_ReturnsOutput()
    {
        var outputs = new List<string>();
        _session.OutputReceived += s => outputs.Add(s);

        await _session.ExecuteAsync("Write-Output 'hello'");

        Assert.Contains("hello", outputs);
    }

    [Fact]
    public async Task ExecuteAsync_ErrorCommand_FiresErrorEvent()
    {
        var errors = new List<string>();
        _session.ErrorReceived += s => errors.Add(s);

        await _session.ExecuteAsync("Write-Error 'test error'");

        Assert.NotEmpty(errors);
    }

    [Fact]
    public async Task Cancel_RunningCommand_StopsPipeline()
    {
        var tcs = new TaskCompletionSource();
        _ = Task.Run(async () =>
        {
            await Task.Delay(100);
            _session.Cancel();
        });

        await _session.ExecuteAsync("Start-Sleep 30");
        // Should complete quickly after cancel, not wait 30 seconds
    }

    public void Dispose() => _session.Dispose();
}
```

### Environment-Dependent Tests

部分測試依賴宿主環境。標記並處理：

```csharp
[Trait("Category", "Integration")]
[Trait("Environment", "Interactive")]
public class HistoryTests
{
    [Fact]
    public void GetHistory_ReturnsEntries()
    {
        // WARNING: This reads actual PowerShell history from the host
        // Will fail in CI or fresh environments with no history
        // Use Skip attribute or conditional:
        var historyPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            ".local", "share", "powershell", "PSReadLine",
            "ConsoleHost_history.txt");

        Skip.IfNot(File.Exists(historyPath), "No PowerShell history file");

        var entries = File.ReadAllLines(historyPath);
        Assert.NotEmpty(entries);
    }
}
```

## Test Filter Patterns

用`dotnet test --filter`運行特定測試子集：

```bash
# By class name
dotnet test --filter "FullyQualifiedName~MessageRouterTests"

# By method name
dotnet test --filter "FullyQualifiedName~ExecuteAsync_SimpleCommand"

# By trait category
dotnet test --filter "Category=Integration"

# Exclude integration tests (fast CI)
dotnet test --filter "Category!=Integration"

# Combine filters
dotnet test --filter "Category=Integration&FullyQualifiedName~PowerShell"

# By namespace
dotnet test --filter "FullyQualifiedName~BeagleTerm.Tests.PowerShell"
```

## Fixture Pattern

在同類測試間共享昂貴設置（如PowerShell會話）：

```csharp
public class SessionFixture : IDisposable
{
    public SessionManager Manager { get; }
    public PowerShellSession Session { get; }

    public SessionFixture()
    {
        Manager = new SessionManager();
        Session = Manager.CreateSession("fixture-session");
    }

    public void Dispose()
    {
        Manager.Dispose();
    }
}

[Trait("Category", "Integration")]
public class SessionTests : IClassFixture<SessionFixture>
{
    private readonly SessionFixture _fixture;

    public SessionTests(SessionFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Execute_InFixtureSession_Succeeds()
    {
        var outputs = new List<string>();
        _fixture.Session.OutputReceived += s => outputs.Add(s);

        await _fixture.Session.ExecuteAsync("1 + 1");

        Assert.Contains("2", outputs);
    }
}
```

## Test Project Configuration

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.*" />
    <PackageReference Include="xunit" Version="2.*" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.*" />
    <PackageReference Include="Xunit.SkippableFact" Version="1.*" />
    <PackageReference Include="coverlet.collector" Version="6.*" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\MyApp\MyApp.csproj" />
  </ItemGroup>
</Project>
```

## Coverage Collection

```bash
# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Generate report
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator \
  -reports:"tests/MyApp.Tests/TestResults/*/coverage.cobertura.xml" \
  -targetdir:"coverage-report" \
  -reporttypes:Html
```

## Frontend Type Checking

以測試命令或CI運行TypeScript/Svelte類型檢查：

```bash
# In the test command or CI
cd src/MyApp.Frontend && pnpm run check

# package.json scripts:
# "check": "svelte-check --tsconfig ./tsconfig.json"
```

## Known Testing Issues

| Issue | Description | Mitigation |
|-------|-------------|------------|
| `ExecuteAsync_AddsToHistory` | Reads real PS history, fails in clean environments | Mark with `[Trait("Environment", "Interactive")]` |
| Timing-sensitive exit tests | Process exit events race with assertions | Use `TaskCompletionSource` with timeout |
| Runspace cold start | First test in suite takes 1-2s for runspace init | Use `IClassFixture` to share sessions |
| CI lacks WebKitGTK | Linux CI may not have GUI libs | Skip Photino window tests in CI |
