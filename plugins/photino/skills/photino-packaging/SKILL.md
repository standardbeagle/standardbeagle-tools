---
name: photino-photino-packaging
description: "Cross-platform packaging for Photino.NET: RID table, self-contained/single-file publish, platform-specific requirements (WebView2, WebKitGTK, WKWebView), installers, and CI pipelines. 跨平台打包Photino.NET：RID表、自含/單文件發布、平台特定需求（WebView2、WebKitGTK、WKWebView）、安裝程序及CI管道. Use when: publishing Photino app for Windows/Linux/macOS, creating installers, setting up CI build matrix, configuring trimming"
disable-model-invocation: true
---

# Photino.NET Cross-Platform Packaging

將Photino.NET應用發布為Windows、Linux及macOS自含單文件可執行程序之法，含平台特定依賴、安裝程序創建及CI自動化。

## Runtime Identifier (RID) Table

| RID | Platform | Architecture | WebView Engine |
|-----|----------|-------------|----------------|
| `win-x64` | Windows 10+ | x64 | WebView2 (Chromium) |
| `win-arm64` | Windows 11 | ARM64 | WebView2 (Chromium) |
| `linux-x64` | Ubuntu/Debian/Fedora | x64 | WebKitGTK |
| `linux-arm64` | Raspberry Pi/ARM | ARM64 | WebKitGTK |
| `osx-x64` | macOS 12+ | Intel | WKWebView |
| `osx-arm64` | macOS 12+ | Apple Silicon | WKWebView |

## Publish Command

### Basic Self-Contained Publish

```bash
# Single platform
dotnet publish src/MyApp/MyApp.csproj \
  -c Release \
  -r linux-x64 \
  --self-contained true \
  -p:PublishSingleFile=true

# Output: src/MyApp/bin/Release/net10.0/linux-x64/publish/MyApp
```

### All Platforms Script

```bash
#!/bin/bash
# publish-all.sh - Build for all target platforms

RIDS=("win-x64" "linux-x64" "osx-x64" "osx-arm64")
PROJECT="src/MyApp/MyApp.csproj"

for rid in "${RIDS[@]}"; do
  echo "Publishing for $rid..."
  dotnet publish "$PROJECT" \
    -c Release \
    -r "$rid" \
    --self-contained true \
    -p:PublishSingleFile=true \
    -o "dist/$rid"
done

echo "Done. Outputs in dist/"
ls -la dist/*/
```

## Publish Properties

| Property | Value | Purpose |
|----------|-------|---------|
| `PublishSingleFile` | `true` | Bundle everything into one executable |
| `SelfContained` | `true` | Include .NET runtime (no install needed) |
| `PublishTrimmed` | `true` | Remove unused code (reduces size) |
| `PublishReadyToRun` | `true` | AOT compile (faster startup) |
| `IncludeNativeLibrariesForSelfExtract` | `true` | Pack native libs inside single file |

### Trimming Configuration

裁剪顯著縮減二進制大小，但可能破壞重度反射代碼：

```xml
<PropertyGroup>
  <PublishTrimmed>true</PublishTrimmed>
  <TrimMode>link</TrimMode>
  <TrimmerSingleWarn>false</TrimmerSingleWarn>
</PropertyGroup>

<!-- Preserve types used by reflection -->
<ItemGroup>
  <TrimmerRootAssembly Include="System.Management.Automation" />
</ItemGroup>
```

**Warning**: PowerShell SDK uses heavy reflection. Trimming may break cmdlets. Test thoroughly after enabling trimming. Consider keeping `PublishTrimmed=false` if PowerShell is a core feature.

## Platform-Specific Requirements

### Windows: WebView2

WebView2隨Microsoft Edge預安裝於Windows 10/11。無Edge系統：

```xml
<!-- Include WebView2 bootstrapper in publish -->
<ItemGroup Condition="'$(RuntimeIdentifier)' == 'win-x64'">
  <Content Include="WebView2Loader.dll" CopyToOutputDirectory="PreserveNewest" />
</ItemGroup>
```

**Installer approach**：用Inno Setup捆綁應用與WebView2啟動程序：

```iss
; setup.iss - Inno Setup script
[Setup]
AppName=MyPhotinoApp
AppVersion=1.0.0
DefaultDirName={autopf}\MyPhotinoApp
OutputDir=dist\installer
OutputBaseFilename=MyPhotinoApp-Setup

[Files]
Source: "dist\win-x64\*"; DestDir: "{app}"; Flags: recursesubdirs

[Icons]
Name: "{group}\MyPhotinoApp"; Filename: "{app}\MyApp.exe"
Name: "{commondesktop}\MyPhotinoApp"; Filename: "{app}\MyApp.exe"

[Run]
; Install WebView2 if not present
Filename: "{tmp}\MicrosoftEdgeWebview2Setup.exe"; \
  Parameters: "/silent /install"; \
  StatusMsg: "Installing WebView2 Runtime..."; \
  Check: NeedsWebView2
```

### Linux: WebKitGTK

目標系統須安裝WebKitGTK：

```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-0

# Fedora
sudo dnf install webkit2gtk4.1

# Arch
sudo pacman -S webkit2gtk-4.1
```

**AppImage packaging**（捆綁依賴）：

```bash
# Using appimagetool
mkdir -p MyApp.AppDir/usr/bin
cp dist/linux-x64/MyApp MyApp.AppDir/usr/bin/

# Create .desktop file
cat > MyApp.AppDir/MyApp.desktop << 'EOF'
[Desktop Entry]
Name=MyPhotinoApp
Exec=MyApp
Icon=myapp
Type=Application
Categories=Utility;
EOF

# Copy icon
cp icon.png MyApp.AppDir/myapp.png

# Create AppRun
cat > MyApp.AppDir/AppRun << 'EOF'
#!/bin/bash
SELF="$(readlink -f "$0")"
HERE="${SELF%/*}"
exec "${HERE}/usr/bin/MyApp" "$@"
EOF
chmod +x MyApp.AppDir/AppRun

# Build AppImage
appimagetool MyApp.AppDir MyPhotinoApp-x86_64.AppImage
```

### macOS: WKWebView + Notarization

WKWebView內置於macOS。打包為`.app`包：

```bash
# Create .app structure
mkdir -p "MyApp.app/Contents/MacOS"
mkdir -p "MyApp.app/Contents/Resources"

cp dist/osx-arm64/MyApp "MyApp.app/Contents/MacOS/"
cp icon.icns "MyApp.app/Contents/Resources/"

# Create Info.plist
cat > "MyApp.app/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>MyApp</string>
  <key>CFBundleIdentifier</key>
  <string>com.example.myapp</string>
  <key>CFBundleName</key>
  <string>MyPhotinoApp</string>
  <key>CFBundleVersion</key>
  <string>1.0.0</string>
  <key>CFBundleIconFile</key>
  <string>icon</string>
  <key>LSMinimumSystemVersion</key>
  <string>12.0</string>
</dict>
</plist>
EOF
```

**Notarization**（App Store外發行必需）：

```bash
# Sign
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (TEAMID)" \
  MyApp.app

# Notarize
xcrun notarytool submit MyApp.zip \
  --apple-id "you@example.com" \
  --team-id "TEAMID" \
  --password "@keychain:AC_PASSWORD" \
  --wait

# Staple
xcrun stapler staple MyApp.app
```

## Binary Size Guide

典型Photino + PowerShell應用近似大小：

| Configuration | Size | Notes |
|--------------|------|-------|
| Self-contained, no trim | ~150-200 MB | Includes full .NET + PS SDK |
| Self-contained, trimmed | ~60-100 MB | Depends on PS SDK usage |
| Framework-dependent | ~5-15 MB | Requires .NET runtime installed |
| Single-file, self-contained | ~150-200 MB | One executable, extracts on first run |

PowerShell SDK為最大貢獻者。若PS可選，考慮動態加載。

## GitHub Actions CI

```yaml
name: Build and Package

on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: windows-latest
            rid: win-x64
            artifact: MyApp.exe
          - os: ubuntu-latest
            rid: linux-x64
            artifact: MyApp
          - os: macos-latest
            rid: osx-arm64
            artifact: MyApp

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install WebKitGTK (Linux)
        if: matrix.rid == 'linux-x64'
        run: sudo apt-get update && sudo apt-get install -y libwebkit2gtk-4.1-dev

      - name: Publish
        run: |
          dotnet publish src/MyApp/MyApp.csproj \
            -c Release \
            -r ${{ matrix.rid }} \
            --self-contained true \
            -p:PublishSingleFile=true \
            -o dist/${{ matrix.rid }}

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.rid }}
          path: dist/${{ matrix.rid }}/${{ matrix.artifact }}
```

## Common Publishing Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `NETSDK1179` | Missing RID at publish time | Add `-r <rid>` to publish command |
| `IL2104` trimmer warning | Reflection usage detected | Add `<TrimmerRootAssembly>` for affected assemblies |
| `WebView2Loader.dll not found` | Windows-only native dep | Include in Content ItemGroup |
| `libwebkit2gtk not found` | Missing Linux dependency | Install `libwebkit2gtk-4.1-dev` |
| Single-file extraction slow | First run extracts to temp | Use `IncludeNativeLibrariesForSelfExtract` |
