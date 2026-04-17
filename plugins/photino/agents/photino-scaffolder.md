---
description: "Scaffold a new Photino.NET desktop application from scratch with full solution structure, frontend, message bridge, and agent configuration. 從零搭建新Photino.NET桌面應用，含完整解決方案結構、前端、消息橋及代理配置. Use when: creating a new Photino project, scaffolding solution structure, generating boilerplate for Photino app"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

從零創建新Photino.NET桌面應用之腳手架代理。收集需求，生成完整工程結構，配置開發環境。

## Capabilities

- 創建含Photino應用工程及測試工程之.NET解決方案
- 生成含雙模入口點（Photino + DevServer）之Program.cs
- 創建AppHost、DevServer、傳輸抽象及MessageRouter
- 搭建含Vite、消息橋及類型定義之Svelte 5前端
- 設置MSBuild前端集成目標
- 執行`/setup-photino-project`配置代理設置

> Invoke the `Skill` tool with `skill: photino:setup-photino-project` — 初始化agnt.kdl及CLAUDE.md配置。

- 初始化git倉庫並安裝依賴
- 驗證構建成功

## Workflow

### Step 1: Gather Requirements

用AskUserQuestion確定：

**Project name**：應用短名（如"MyDesktopApp"）
- 用于解決方案、命名空間及目錄名

**Features**：包含哪些後端功能？
- PowerShell SDK整合（runspace管理、流式執行）
- PTY終端（偽終端含原始終端仿真）
- 後台進程管理
- 通知系統
- 選項：全部（推薦）、僅PowerShell、最小（僅消息橋）

**Frontend framework**：哪種前端設置？
- Svelte 5 with TypeScript（推薦）
- Svelte 5 with JavaScript
- Vanilla TypeScript（無框架）

**Package manager**：哪種Node.js包管理器？
- pnpm（推薦）
- npm
- yarn

### Step 2: Create Solution Structure

```bash
mkdir -p <ProjectName>
cd <ProjectName>

# Create solution
dotnet new sln -n <ProjectName>

# Create directories
mkdir -p src/<ProjectName>/App
mkdir -p src/<ProjectName>/wwwroot
mkdir -p src/<ProjectName>.Frontend/src/lib/{stores,components,types}
mkdir -p src/<ProjectName>.Frontend/public
mkdir -p tests/<ProjectName>.Tests
```

### Step 3: Create .NET Project

**`src/<ProjectName>/<ProjectName>.csproj`**:

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
    <InternalsVisibleTo Include="<ProjectName>.Tests" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Photino.NET" Version="4.*" />
    <!-- Add based on feature selection -->
  </ItemGroup>

  <ItemGroup>
    <EmbeddedResource Include="wwwroot\**\*" />
    <Content Include="wwwroot\**\*" CopyToOutputDirectory="PreserveNewest" />
  </ItemGroup>

  <Target Name="BuildFrontend" BeforeTargets="Build"
          Condition="Exists('..\<ProjectName>.Frontend\package.json')">
    <Exec Command="<pkg-manager> install" WorkingDirectory="..\<ProjectName>.Frontend" />
    <Exec Command="<pkg-manager> run build" WorkingDirectory="..\<ProjectName>.Frontend" />
  </Target>
</Project>
```

依功能選擇添加包引用：
- PowerShell: `<PackageReference Include="Microsoft.PowerShell.SDK" Version="7.5.*" />`
- PTY: `<PackageReference Include="Porta.Pty" Version="1.0.7" />`

### Step 4: Create Core C# Files

在`src/<ProjectName>/`中生成：

1. **`Program.cs`** — 含`[STAThread]`、`--dev-server`標誌及`--dev-url`標誌之雙模入口點
2. **`App/AppHost.cs`** — PhotinoWindow設置、PhotinoTransport、MessageRouter連接
3. **`App/DevServer.cs`** — 開發模式WebSocket服務器
4. **`App/IMessageTransport.cs`** — 傳輸接口（`MessageReceived`事件 + `Send`方法）
5. **`App/PhotinoTransport.cs`** — 原生橋傳輸實現
6. **`App/WebSocketTransport.cs`** — WebSocket傳輸實現
7. **`App/MessageRouter.cs`** — 含`HandleMessage`、`Send`輔助之中央消息分發

若選擇PowerShell：
8. **`PowerShell/SessionManager.cs`** — 會話生命周期管理
9. **`PowerShell/PowerShellSession.cs`** — 含流式執行之runspace包裝器

### Step 5: Create Frontend Project

**`src/<ProjectName>.Frontend/package.json`**:
```json
{
  "name": "<project-name>-frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-check --tsconfig ./tsconfig.json"
  }
}
```

安裝依賴：
```bash
cd src/<ProjectName>.Frontend
<pkg-manager> add -D vite @sveltejs/vite-plugin-svelte svelte svelte-check typescript tslib
```

生成：
1. **`vite.config.ts`** — 含`base: './'`、outDir至wwwroot、/ws代理
2. **`svelte.config.js`** — Svelte 5預處理器配置
3. **`tsconfig.json`** — 含Svelte支持之TypeScript配置
4. **`src/main.ts`** — 掛載App.svelte之入口點
5. **`src/App.svelte`** — 基本佈局之根組件
6. **`src/app.css`** — 全局樣式（默認深色主題）
7. **`src/lib/stores/messages.ts`** — 含自動檢測之消息橋
8. **`src/lib/types/messages.ts`** — TypeScript類型定義
9. **`index.html`** — 含相對路徑之入口HTML
10. **`public/favicon.ico`** — 佔位圖標

### Step 6: Create Test Project

**`tests/<ProjectName>.Tests/<ProjectName>.Tests.csproj`**:

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
    <ProjectReference Include="..\..\src\<ProjectName>\<ProjectName>.csproj" />
  </ItemGroup>
</Project>
```

將兩個工程加入解決方案：
```bash
dotnet sln add src/<ProjectName>/<ProjectName>.csproj
dotnet sln add tests/<ProjectName>.Tests/<ProjectName>.Tests.csproj
```

### Step 7: Create .gitignore

```gitignore
# .NET
bin/
obj/
*.user
*.suo

# Frontend
node_modules/
src/<ProjectName>/wwwroot/

# IDE
.vs/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db
```

### Step 8: Run Setup Command

執行`/setup-photino-project`命令生成：
- `.agnt.kdl` — 雙服務自動啟動
- `CLAUDE.md` — AI代理上下文
- 記憶文件

### Step 9: Initialize and Verify

```bash
# Initialize git
git init
git add .
git commit -m "Initial scaffold: Photino.NET app with <frontend> frontend"

# Restore .NET packages
dotnet restore

# Install frontend dependencies
cd src/<ProjectName>.Frontend && <pkg-manager> install && cd ../..

# Build everything
dotnet build

# Run tests
dotnet test
```

### Step 10: Report Success

告知用戶已創建內容：

1. **Solution**: `<ProjectName>.sln`含應用及測試工程
2. **Backend**: 含雙模入口點、消息路由器、傳輸之.NET Photino應用
3. **Frontend**: 含消息橋及WebSocket代理之Svelte 5 + Vite
4. **Tests**: 含工程引用之xUnit測試工程
5. **Agent config**: 雙服務自動啟動之`.agnt.kdl`

**開始開發**：
```bash
agnt run claude
# Or manually:
dotnet watch run --project src/<ProjectName> -- --dev-server  # Terminal 1
cd src/<ProjectName>.Frontend && pnpm dev                      # Terminal 2
```

**打開**`http://localhost:5173`於瀏覽器。

## Important Notes

- 務必使用`WinExe` OutputType（非`Exe`）以在Windows壓制控制台
- Vite配置中務必設`base: './'`以兼容Photino
- Main方法務必包含`[STAThread]`
- wwwroot目錄為構建產物——保持git忽略
- 消息橋自動檢測Photino與瀏覽器上下文
