---
name: photino-photino-publish
description: "\"Publish Photino.NET app as cross-platform self-contained executables with platform-specific packaging. 將Photino.NET應用發布為跨平台自含可執行文件，含平台特定打包. Use when: publishing for distribution, creating self-contained executables, building for Windows/Linux/macOS targets\""
disable-model-invocation: true
allowed-tools: "[\"Bash\", \"Read\", \"Glob\", \"Grep\"]"
---

將Photino.NET應用發布為Windows、Linux及macOS自含單文件可執行程序。

## Steps

### 1. Detect Project and Targets

讀取csproj以查找已配置RuntimeIdentifiers：

```bash
grep -o 'RuntimeIdentifiers>[^<]*<' <csproj-path>
```

常見目標：
- `win-x64` — Windows 10+ (x64)
- `linux-x64` — Linux (x64)
- `osx-x64` — macOS Intel
- `osx-arm64` — macOS Apple Silicon

### 2. Build Frontend for Production

確保前端以生產設置構建：

```bash
cd <frontend-path>
pnpm install
NODE_ENV=production pnpm build
```

驗證輸出：
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

**Windows (win-x64)**：
- WebView2隨Edge預安裝於Windows 10/11
- 舊系統請捆綁WebView2啟動程序
- 輸出：`dist/win-x64/MyApp.exe`

**Linux (linux-x64)**：
- 目標系統需`libwebkit2gtk-4.1-0`
- 考慮AppImage以實現無依賴分發
- 輸出：`dist/linux-x64/MyApp`（標記可執行：`chmod +x`）

**macOS (osx-x64, osx-arm64)**：
- WKWebView內置，無額外依賴
- 分發時：創建`.app`包並公證
- 輸出：`dist/osx-arm64/MyApp`

### 6. Report Results

每個目標匯總：
- 輸出路徑及二進制大小
- 最終用戶之平台特定需求
- 需審查之裁剪警告

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

若啟用`PublishTrimmed=true`，PowerShell SDK使用大量反射可能中斷。啟用後測試所有PowerShell功能。若有問題：
- 禁用裁剪：`-p:PublishTrimmed=false`
- 在csproj中添加trimmer根程序集：
  ```xml
  <ItemGroup>
    <TrimmerRootAssembly Include="System.Management.Automation" />
  </ItemGroup>
  ```

## Related

- config/reference: `photino:photino-packaging`
