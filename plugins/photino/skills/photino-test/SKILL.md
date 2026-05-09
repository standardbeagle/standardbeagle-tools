---
name: photino-photino-test
description: "\"Run tests for Photino.NET project with filter patterns, coverage collection, and frontend type checking. 運行Photino.NET工程測試：過濾模式、覆蓋率收集及前端類型檢查. Use when: running unit tests, filtering by category or class, collecting test coverage, running Svelte/TypeScript type checks\""
disable-model-invocation: true
allowed-tools: "[\"Bash\", \"Read\", \"Glob\", \"Grep\"]"
---

運行Photino.NET應用測試。支持按類、方法、類別及組合模式過濾，加覆蓋率收集及前端類型檢查。

## Steps

### 1. Detect Test Project

查找測試工程：

```bash
# Find test csproj files
find . -name "*.Tests.csproj" -o -name "*.Test.csproj" | head -5

# Or check the solution
dotnet sln list 2>/dev/null | grep -i test
```

### 2. Run Tests

#### All Tests

```bash
dotnet test
```

#### Filter Patterns

```bash
# By class name
dotnet test --filter "FullyQualifiedName~MessageRouterTests"

# By method name
dotnet test --filter "FullyQualifiedName~ExecuteAsync_SimpleCommand"

# By trait/category
dotnet test --filter "Category=Integration"

# Exclude slow tests
dotnet test --filter "Category!=Integration"

# Combined: integration tests in a specific class
dotnet test --filter "Category=Integration&FullyQualifiedName~PowerShell"

# By namespace
dotnet test --filter "FullyQualifiedName~MyApp.Tests.PowerShell"
```

#### Verbose Output

```bash
# Show individual test results
dotnet test -v normal

# Show detailed output including test names
dotnet test --logger "console;verbosity=detailed"
```

### 3. Coverage Collection

```bash
# Run with coverage collection
dotnet test --collect:"XPlat Code Coverage"

# Find the coverage report
find . -name "coverage.cobertura.xml" -path "*/TestResults/*"
```

生成HTML報告：

```bash
# Install report generator (one-time)
dotnet tool install -g dotnet-reportgenerator-globaltool

# Generate HTML report
reportgenerator \
  -reports:"**/TestResults/*/coverage.cobertura.xml" \
  -targetdir:"coverage-report" \
  -reporttypes:Html
```

### 4. Frontend Type Checking

運行Svelte/TypeScript類型檢查：

```bash
# Navigate to frontend project
cd <frontend-path>

# Run type checker
pnpm run check
# Typically: svelte-check --tsconfig ./tsconfig.json
```

### 5. Report Results

匯總：
- 總測試數：通過、失敗、跳過
- 含錯誤消息之測試失敗
- 覆蓋率百分比（若已收集）
- 前端類型檢查結果
- 失敗測試建議

## Test Filter Quick Reference

| Filter | Command |
|--------|---------|
| All tests | `dotnet test` |
| One class | `dotnet test --filter "FullyQualifiedName~ClassName"` |
| One method | `dotnet test --filter "FullyQualifiedName~MethodName"` |
| Category | `dotnet test --filter "Category=Integration"` |
| Exclude category | `dotnet test --filter "Category!=Integration"` |
| Combined | `dotnet test --filter "Category=Integration&FullyQualifiedName~PowerShell"` |
| Fast only | `dotnet test --filter "Category!=Integration&Category!=Live"` |

## Known Testing Considerations

- **環境依賴測試**：部分測試讀取宿主狀態（PS歷史、已安裝模塊）。用`[Trait("Environment", "Interactive")]`標記，在CI中跳過。
- **時序敏感測試**：進程退出測試可能存在競爭條件。用帶超時之`TaskCompletionSource`。
- **Runspace冷啟動**：創建PowerShell會話之首個測試耗時1-2秒。用`IClassFixture<>`在類內共享會話。
- **前端類型檢查**：與`dotnet test`分開運行——使用Node.js工具鏈。
