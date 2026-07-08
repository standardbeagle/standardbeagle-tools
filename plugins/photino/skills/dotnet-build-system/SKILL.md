---
name: photino-dotnet-build-system
description: ".NET build for Photino apps: csproj config, MSBuild targets, frontend build integration, package refs, version pinning, common build errors. 配置.csproj、MSBuild、前端構建、包引用、版本釘定。 Use when: configuring csproj, setting up MSBuild targets, integrating frontend build, managing package versions, diagnosing build errors"
disable-model-invocation: true
---

# .NET Build System for Photino

配置Photino.NET桌面應用之.NET工程文件、MSBuild目標、包引用及前端構建整合之法。

## Reference .csproj

含PowerShell SDK之Photino.NET應用完整工程文件：

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

- **WinExe**：Windows不顯控制台窗。桌面應用正確選擇。
- **Exe**：顯控制台窗。僅需生產環境`Console.WriteLine`輸出時用。
- Linux/macOS兩者行為相同。

## Package Reference Version Pinning

| Package | Version Pattern | Strategy |
|---------|----------------|----------|
| `Photino.NET` | `4.*` | Major-locked, latest minor/patch |
| `Microsoft.PowerShell.SDK` | `7.5.*` | Minor-locked, latest patch |
| `Porta.Pty` | `1.0.7` | Exact version (netstandard2.0, stable) |
| `System.Text.Json` | (not needed) | Bundled in .NET 10 shared framework |

### Version Resolution Notes

- **Photino.NET 4.x**：目標net8/net9，藉前向相容性運行於net10
- **PowerShell SDK 7.5.x**：目標net9，經計算TFM解析至net10
- **System.Text.Json**：.NET 10共享框架內建——勿加PackageReference
- 顯式引用`System.Text.Json`可致與共享框架版本衝突

## BuildFrontend MSBuild Target

`BuildFrontend`目標在.NET `Build`目標前執行，確保前端已編譯：

```xml
<Target Name="BuildFrontend" BeforeTargets="Build"
        Condition="Exists('..\MyApp.Frontend\package.json')">
  <Exec Command="pnpm install" WorkingDirectory="..\MyApp.Frontend" />
  <Exec Command="pnpm run build" WorkingDirectory="..\MyApp.Frontend" />
</Target>
```

### How It Works

1. **Condition**：前端工程存在時執行（純測試構建則跳過）
2. **pnpm install**：確保依賴最新
3. **pnpm run build**：Vite構建至`../MyApp/wwwroot/`（於`vite.config.ts`配置）
4. **EmbeddedResource**：MSBuild随後拾取`wwwroot/**/*`嵌入二進制

### Skipping Frontend Build

```bash
# Skip frontend build (useful for backend-only changes)
dotnet build -p:BuildFrontend=false

# Or set an environment variable
SKIP_FRONTEND=1 dotnet build
```

支持環境變量：
```xml
<Target Name="BuildFrontend" BeforeTargets="Build"
        Condition="Exists('..\MyApp.Frontend\package.json') AND '$(SKIP_FRONTEND)' != '1'">
```

## EmbeddedResource vs Content

正確處理wwwroot兩者均需：

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

推薦解決方案佈局：

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

**Cause**：前端尚未構建。
**Fix**: `cd src/MyApp.Frontend && pnpm install && pnpm build`

### Error: "Could not find a part of the path 'wwwroot\index.html'"

**Cause**：Vite之`build.outDir`未指向.NET工程的wwwroot。
**Fix**：於`vite.config.ts`設`build: { outDir: '../MyApp/wwwroot' }`

### Error: "Microsoft.PowerShell.SDK references System.Text.Json 8.x"

**Cause**：顯式`System.Text.Json` PackageReference與框架版本衝突。
**Fix**：移除`<PackageReference Include="System.Text.Json" ... />`行，.NET 10已內建。

### Error: "NU1605: Detected package downgrade"

**Cause**：SDK與Photino釘定不同傳遞依賴版本。
**Fix**：為衝突包加顯式PackageReference，使用更高版本。

### Warning: "NETSDK1179: PublishSingleFile with SelfContained"

**Cause**：發布時缺`RuntimeIdentifier`。
**Fix**: `dotnet publish -r linux-x64`（指定目標RID）

### Error: "ICE on compilation" with PowerShell SDK

**Cause**：PowerShell SDK帶入大型傳遞依賴樹。
**Fix**：確保使用最新.NET SDK preview/release。考慮`<TrimmerSingleWarn>false</TrimmerSingleWarn>`以查看個別警告。

## InternalsVisibleTo for Testing

允許測試工程訪問內部類型：

```xml
<ItemGroup>
  <InternalsVisibleTo Include="MyApp.Tests" />
</ItemGroup>
```

此舉使測試內部類如`SessionManager`、`MessageRouter`等成為可能，無需公開。

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

## Related

- to run: `photino:photino-build`
