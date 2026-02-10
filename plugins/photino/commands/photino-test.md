---
description: "Run tests for a Photino.NET project with filter patterns, coverage collection, and frontend type checking"
allowed-tools: ["Bash", "Read", "Glob", "Grep"]
---

Run tests for a Photino.NET application. Supports filtering by class, method, category, and combined patterns, plus coverage collection and frontend type checking.

## Steps

### 1. Detect Test Project

Find the test project:

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

Generate an HTML report:

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

Run Svelte/TypeScript type checks:

```bash
# Navigate to frontend project
cd <frontend-path>

# Run type checker
pnpm run check
# Typically: svelte-check --tsconfig ./tsconfig.json
```

### 5. Report Results

Summarize:
- Total tests: passed, failed, skipped
- Any test failures with error messages
- Coverage percentage (if collected)
- Frontend type check results
- Recommendations for failed tests

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

- **Environment-dependent tests**: Some tests read host state (PS history, installed modules). Mark with `[Trait("Environment", "Interactive")]` and skip in CI.
- **Timing-sensitive tests**: Process exit tests may have race conditions. Use `TaskCompletionSource` with timeouts.
- **Runspace cold start**: First test creating a PowerShell session takes 1-2s. Use `IClassFixture<>` to share sessions across tests in a class.
- **Frontend type checks**: Run separately from `dotnet test` — they use the Node.js toolchain.
