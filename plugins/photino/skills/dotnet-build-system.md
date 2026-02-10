---
description: ".NET build system for Photino apps: csproj configuration, MSBuild targets, frontend build integration, package references, version pinning, and common build errors"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep"]
---

# .NET Build System for Photino

How to configure the .NET project file, MSBuild targets, package references, and frontend build integration for a Photino.NET desktop application.

## Reference .csproj

Complete project file for a Photino.NET app with PowerShell SDK:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <RuntimeIdentifiers>win-x64;linux-x64;osx-x64;osx-arm64</RuntimeIdentifiers>
    <PublishSingleFile>true</PublishSingleFile>
    <SelfContained>true</SelfContained>
  </PropertyGroup>

  <ItemGroup>
    <InternalsVisibleTo Include="MyApp.Tests" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Photino.NET" Version="4.*" />
    <PackageReference Include="Microsoft.PowerShell.SDK" Version="7.5.*" />
    <PackageReference Include="Porta.Pty" Version="1.0.7" />
  </ItemGroup>

  <!-- Embed wwwroot files (production frontend build) -->
  <ItemGroup>
    <EmbeddedResource Include="wwwroot\**\*" />
    <Content Include="wwwroot\**\*" CopyToOutputDirectory="PreserveNewest" />
  </ItemGroup>

  <!-- Build frontend before .NET build -->
  <Target Name="BuildFrontend" BeforeTargets="Build"
          Condition="Exists('..\MyApp.Frontend\package.json')">
    <Exec Command="pnpm install" WorkingDirectory="..\MyApp.Frontend" />
    <Exec Command="pnpm run build" WorkingDirectory="..\MyApp.Frontend" />
  </Target>

</Project>
```

## Key PropertyGroup Settings

| Property | Value | Purpose |
|----------|-------|---------|
| `OutputType` | `WinExe` | Suppresses console window on Windows |
| `TargetFramework` | `net10.0` | .NET 10 LTS |
| `ImplicitUsings` | `enable` | Auto-imports common namespaces |
| `Nullable` | `enable` | Nullable reference types |
| `RuntimeIdentifiers` | `win-x64;linux-x64;osx-x64;osx-arm64` | Cross-platform publish targets |
| `PublishSingleFile` | `true` | Single executable output |
| `SelfContained` | `true` | Bundle .NET runtime |

### OutputType: WinExe vs Exe

- **WinExe**: No console window on Windows. This is correct for desktop apps.
- **Exe**: Shows console window. Use only if you need `Console.WriteLine` output visible in production.
- On Linux/macOS, both behave the same.

## Package Reference Version Pinning

| Package | Version Pattern | Strategy |
|---------|----------------|----------|
| `Photino.NET` | `4.*` | Major-locked, latest minor/patch |
| `Microsoft.PowerShell.SDK` | `7.5.*` | Minor-locked, latest patch |
| `Porta.Pty` | `1.0.7` | Exact version (netstandard2.0, stable) |
| `System.Text.Json` | (not needed) | Bundled in .NET 10 shared framework |

### Version Resolution Notes

- **Photino.NET 4.x** targets net8/net9 but works on net10 via forward compatibility
- **PowerShell SDK 7.5.x** targets net9 but resolves to net10 via computed TFM
- **System.Text.Json** is part of the shared framework in .NET 10 — do NOT add a PackageReference
- Adding explicit `System.Text.Json` can cause version conflicts with the shared framework

## BuildFrontend MSBuild Target

The `BuildFrontend` target runs before the .NET `Build` target to ensure the frontend is compiled:

```xml
<Target Name="BuildFrontend" BeforeTargets="Build"
        Condition="Exists('..\MyApp.Frontend\package.json')">
  <Exec Command="pnpm install" WorkingDirectory="..\MyApp.Frontend" />
  <Exec Command="pnpm run build" WorkingDirectory="..\MyApp.Frontend" />
</Target>
```

### How It Works

1. **Condition**: Only runs if the frontend project exists (skips in test-only builds)
2. **pnpm install**: Ensures dependencies are up to date
3. **pnpm run build**: Vite builds to `../MyApp/wwwroot/` (configured in `vite.config.ts`)
4. **EmbeddedResource**: MSBuild then picks up `wwwroot/**/*` and embeds in the binary

### Skipping Frontend Build

```bash
# Skip frontend build (useful for backend-only changes)
dotnet build -p:BuildFrontend=false

# Or set an environment variable
SKIP_FRONTEND=1 dotnet build
```

To support the environment variable:
```xml
<Target Name="BuildFrontend" BeforeTargets="Build"
        Condition="Exists('..\MyApp.Frontend\package.json') AND '$(SKIP_FRONTEND)' != '1'">
```

## EmbeddedResource vs Content

Both are needed for proper wwwroot handling:

```xml
<ItemGroup>
  <!-- Embedded in the assembly for single-file publish -->
  <EmbeddedResource Include="wwwroot\**\*" />
  <!-- Copied to output directory for debugging -->
  <Content Include="wwwroot\**\*" CopyToOutputDirectory="PreserveNewest" />
</ItemGroup>
```

| ItemGroup | When Used | Purpose |
|-----------|-----------|---------|
| `EmbeddedResource` | `dotnet publish` single-file | Assets inside the executable |
| `Content` with `PreserveNewest` | `dotnet run` / `dotnet watch` | Assets beside the executable |

## Solution Structure

Recommended solution layout:

```
MySolution/
  MySolution.sln
  src/
    MyApp/                      # .NET Photino project
      MyApp.csproj
      Program.cs
      App/
        AppHost.cs
        DevServer.cs
        MessageRouter.cs
      wwwroot/                  # Built frontend (git-ignored)
        index.html
        assets/
    MyApp.Frontend/             # Svelte/Vite project
      package.json
      vite.config.ts
      src/
        App.svelte
        lib/
          stores/
            messages.ts
  tests/
    MyApp.Tests/
      MyApp.Tests.csproj
```

### Solution File

```bash
# Create solution
dotnet new sln -n MySolution

# Add projects
dotnet sln add src/MyApp/MyApp.csproj
dotnet sln add tests/MyApp.Tests/MyApp.Tests.csproj
```

## Common Build Errors

### Error: "The wwwroot directory is empty"

**Cause**: Frontend hasn't been built yet.
**Fix**: `cd src/MyApp.Frontend && pnpm install && pnpm build`

### Error: "Could not find a part of the path 'wwwroot\index.html'"

**Cause**: Vite's `build.outDir` doesn't point to the .NET project's wwwroot.
**Fix**: In `vite.config.ts`, set `build: { outDir: '../MyApp/wwwroot' }`

### Error: "Microsoft.PowerShell.SDK references System.Text.Json 8.x"

**Cause**: Explicit `System.Text.Json` PackageReference conflicts with framework version.
**Fix**: Remove the `<PackageReference Include="System.Text.Json" ... />` line. It's bundled in .NET 10.

### Error: "NU1605: Detected package downgrade"

**Cause**: SDK and Photino pin different transitive dependency versions.
**Fix**: Add explicit PackageReference for the conflicting package with the higher version.

### Warning: "NETSDK1179: PublishSingleFile with SelfContained"

**Cause**: Missing `RuntimeIdentifier` at publish time.
**Fix**: `dotnet publish -r linux-x64` (specify the target RID)

### Error: "ICE on compilation" with PowerShell SDK

**Cause**: PowerShell SDK brings large transitive dependency tree.
**Fix**: Ensure you're on the latest .NET SDK preview/release. Consider `<TrimmerSingleWarn>false</TrimmerSingleWarn>` to see individual warnings.

## InternalsVisibleTo for Testing

Allow the test project to access internal types:

```xml
<ItemGroup>
  <InternalsVisibleTo Include="MyApp.Tests" />
</ItemGroup>
```

This enables testing internal classes like `SessionManager`, `MessageRouter`, etc. without making them public.

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
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\MyApp\MyApp.csproj" />
  </ItemGroup>
</Project>
```
