---
description: "Publish a Photino.NET app as cross-platform self-contained executables with platform-specific packaging"
allowed-tools: ["Bash", "Read", "Glob", "Grep"]
---

Publish a Photino.NET application as self-contained, single-file executables for Windows, Linux, and macOS.

## Steps

### 1. Detect Project and Targets

Read the csproj to find configured RuntimeIdentifiers:

```bash
grep -o 'RuntimeIdentifiers>[^<]*<' <csproj-path>
```

Common targets:
- `win-x64` — Windows 10+ (x64)
- `linux-x64` — Linux (x64)
- `osx-x64` — macOS Intel
- `osx-arm64` — macOS Apple Silicon

### 2. Build Frontend for Production

Ensure the frontend is built with production settings:

```bash
cd <frontend-path>
pnpm install
NODE_ENV=production pnpm build
```

Verify the output:
```bash
ls -la <app-path>/wwwroot/
# Should contain: index.html, assets/, favicon.ico
```

### 3. Publish for Each Target

#### Single Platform

```bash
dotnet publish <csproj-path> \
  -c Release \
  -r linux-x64 \
  --self-contained true \
  -p:PublishSingleFile=true \
  -o dist/linux-x64
```

#### All Platforms Script

```bash
#!/bin/bash
set -e

RIDS=("win-x64" "linux-x64" "osx-x64" "osx-arm64")
PROJECT="<csproj-path>"

for rid in "${RIDS[@]}"; do
  echo "=== Publishing for $rid ==="
  dotnet publish "$PROJECT" \
    -c Release \
    -r "$rid" \
    --self-contained true \
    -p:PublishSingleFile=true \
    -o "dist/$rid"
  echo "Done: dist/$rid/"
done

echo ""
echo "=== Build Summary ==="
for rid in "${RIDS[@]}"; do
  size=$(du -sh "dist/$rid/" 2>/dev/null | cut -f1)
  echo "  $rid: $size"
done
```

### 4. Verify Published Artifacts

```bash
# Check each platform output
for dir in dist/*/; do
  echo "=== $dir ==="
  ls -lh "$dir"
done

# Test the local platform binary (if matching)
./dist/linux-x64/<AppName>  --help 2>/dev/null || echo "Runs (no --help)"
```

### 5. Platform-Specific Notes

**Windows (win-x64)**:
- WebView2 is pre-installed with Edge on Windows 10/11
- For older systems, bundle the WebView2 bootstrapper
- Output: `dist/win-x64/MyApp.exe`

**Linux (linux-x64)**:
- Requires `libwebkit2gtk-4.1-0` on the target system
- Consider AppImage for dependency-free distribution
- Output: `dist/linux-x64/MyApp` (mark executable: `chmod +x`)

**macOS (osx-x64, osx-arm64)**:
- WKWebView is built-in, no extra deps
- For distribution: create `.app` bundle and notarize
- Output: `dist/osx-arm64/MyApp`

### 6. Report Results

Summarize for each target:
- Output path and binary size
- Platform-specific requirements for end users
- Any trimming warnings to review

## Publish Options

| Option | Default | Purpose |
|--------|---------|---------|
| `-c Release` | Debug | Release optimizations |
| `--self-contained true` | false | Bundle .NET runtime |
| `-p:PublishSingleFile=true` | false | Single executable |
| `-p:PublishTrimmed=true` | false | Remove unused code (test carefully with PowerShell SDK) |
| `-p:PublishReadyToRun=true` | false | AOT for faster startup |
| `-p:IncludeNativeLibrariesForSelfExtract=true` | false | Pack native libs in single file |

## Trimming Warning

If using `PublishTrimmed=true`, the PowerShell SDK uses heavy reflection and may break. Test all PowerShell functionality after enabling trimming. If issues occur, either:
- Disable trimming: `-p:PublishTrimmed=false`
- Add trimmer root assemblies in csproj:
  ```xml
  <ItemGroup>
    <TrimmerRootAssembly Include="System.Management.Automation" />
  </ItemGroup>
  ```
