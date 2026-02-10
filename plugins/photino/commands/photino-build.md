---
description: "Build a Photino.NET app: detect csproj, build frontend, compile .NET for debug/release/platform-specific targets"
allowed-tools: ["Bash", "Read", "Glob", "Grep"]
---

Build a Photino.NET application. Detects the project structure, builds the frontend, then compiles the .NET application.

## Steps

### 1. Detect Project

Find the Photino csproj:

```bash
# Find csproj files referencing Photino.NET
grep -rl "Photino.NET" --include="*.csproj" .
```

Read the csproj to determine:
- `TargetFramework`
- `RuntimeIdentifiers`
- Whether `BuildFrontend` MSBuild target exists
- Frontend project location (from target's WorkingDirectory)

### 2. Build Frontend (if separate)

If the csproj has a `BuildFrontend` target, MSBuild handles this automatically. Otherwise, build manually:

```bash
# Install frontend dependencies
cd <frontend-path> && pnpm install

# Build for production
pnpm build

# Verify output
ls -la <app-path>/wwwroot/
```

### 3. Build .NET Application

#### Debug Build (development)

```bash
dotnet build <csproj-path>
```

This:
1. Triggers `BuildFrontend` target (installs deps + builds frontend)
2. Compiles C# code
3. Copies wwwroot to output directory

#### Release Build

```bash
dotnet build <csproj-path> -c Release
```

#### Platform-Specific Build

```bash
# For a specific runtime
dotnet build <csproj-path> -c Release -r linux-x64
```

### 4. Verify Build

```bash
# Check build output exists
ls -la <csproj-dir>/bin/<Configuration>/net10.0/

# Verify wwwroot was included
ls -la <csproj-dir>/bin/<Configuration>/net10.0/wwwroot/

# Run a quick smoke test
dotnet run --project <csproj-path> -- --help 2>/dev/null || echo "No --help flag (expected)"
```

### 5. Report Results

Tell the user:
- Build configuration (Debug/Release)
- Output location
- Whether frontend was built (via MSBuild target or manually)
- Any warnings (especially trimming or deprecated API warnings)
- Binary size

## Common Build Flags

| Flag | Purpose |
|------|---------|
| `-c Release` | Release configuration |
| `-r <rid>` | Target runtime (e.g., `linux-x64`) |
| `-p:PublishSingleFile=true` | Single file output |
| `--self-contained` | Bundle .NET runtime |
| `-p:BuildFrontend=false` | Skip frontend build |
| `--no-restore` | Skip NuGet restore (faster if already restored) |

## Skipping Frontend Build

For backend-only changes during development:

```bash
# Skip the BuildFrontend MSBuild target
dotnet build <csproj-path> -p:BuildFrontend=false
```
