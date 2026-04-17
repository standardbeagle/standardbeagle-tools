---
description: "Build a Photino.NET app: detect csproj, build frontend, compile .NET for debug/release/platform-specific targets. 構建Photino.NET應用：檢測csproj、構建前端、為debug/release/特定平台目標編譯.NET. Use when: building Photino app, compiling for specific platform, skipping frontend build for backend-only changes"
allowed-tools: ["Bash", "Read", "Glob", "Grep"]
---

構建Photino.NET應用。檢測工程結構，構建前端，然後編譯.NET應用。

## Steps

### 1. Detect Project

查找Photino csproj：

```bash
# Find csproj files referencing Photino.NET
grep -rl "Photino.NET" --include="*.csproj" .
```

讀取csproj以確定：
- `TargetFramework`
- `RuntimeIdentifiers`
- `BuildFrontend` MSBuild目標是否存在
- 前端工程位置（從目標之WorkingDirectory獲取）

### 2. Build Frontend (if separate)

若csproj含`BuildFrontend`目標，MSBuild自動處理。否則手動構建：

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

此操作：
1. 觸發`BuildFrontend`目標（安裝依賴+構建前端）
2. 編譯C#代碼
3. 將wwwroot複製至輸出目錄

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

告知用戶：
- 構建配置（Debug/Release）
- 輸出位置
- 前端是否已構建（通過MSBuild目標或手動）
- 任何警告（尤其是裁剪或棄用API警告）
- 二進制大小

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

後端專用變更開發期間：

```bash
# Skip the BuildFrontend MSBuild target
dotnet build <csproj-path> -p:BuildFrontend=false
```
