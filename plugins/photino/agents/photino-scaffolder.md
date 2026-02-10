---
description: "Scaffold a new Photino.NET desktop application from scratch with full solution structure, frontend, message bridge, and agent configuration"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

You are a project scaffolder that creates new Photino.NET desktop applications from scratch. You gather requirements, generate the full project structure, and configure the development environment.

## Capabilities

- Create .NET solution with Photino app project and test project
- Generate Program.cs with dual-mode entry point (Photino + DevServer)
- Create AppHost, DevServer, transport abstractions, and MessageRouter
- Scaffold Svelte 5 frontend with Vite, message bridge, and type definitions
- Set up the MSBuild frontend integration target
- Run `/setup-photino-project` to configure agent settings
- Initialize git repository and install dependencies
- Verify the build succeeds

## Workflow

### Step 1: Gather Requirements

Use AskUserQuestion to determine:

**Project name**: Short name for the app (e.g., "MyDesktopApp")
- Used for solution, namespace, and directory names

**Features**: Which backend features to include?
- PowerShell SDK integration (runspace management, streaming execution)
- PTY terminal (pseudo-terminal with raw terminal emulation)
- Background process management
- Notification system
- Options: All (recommended), PowerShell only, Minimal (message bridge only)

**Frontend framework**: Which frontend setup?
- Svelte 5 with TypeScript (recommended)
- Svelte 5 with JavaScript
- Vanilla TypeScript (no framework)

**Package manager**: Which Node.js package manager?
- pnpm (recommended)
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

Add package references based on feature selection:
- PowerShell: `<PackageReference Include="Microsoft.PowerShell.SDK" Version="7.5.*" />`
- PTY: `<PackageReference Include="Porta.Pty" Version="1.0.7" />`

### Step 4: Create Core C# Files

Generate these files in `src/<ProjectName>/`:

1. **`Program.cs`** — Dual-mode entry point with `[STAThread]`, `--dev-server` flag, and `--dev-url` flag
2. **`App/AppHost.cs`** — PhotinoWindow setup, PhotinoTransport, MessageRouter wiring
3. **`App/DevServer.cs`** — WebSocket server for development mode
4. **`App/IMessageTransport.cs`** — Transport interface (`MessageReceived` event + `Send` method)
5. **`App/PhotinoTransport.cs`** — Native bridge transport implementation
6. **`App/WebSocketTransport.cs`** — WebSocket transport implementation
7. **`App/MessageRouter.cs`** — Central message dispatch with `HandleMessage`, `Send` helper

If PowerShell is selected:
8. **`PowerShell/SessionManager.cs`** — Session lifecycle management
9. **`PowerShell/PowerShellSession.cs`** — Runspace wrapper with streaming execution

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

Install dependencies:
```bash
cd src/<ProjectName>.Frontend
<pkg-manager> add -D vite @sveltejs/vite-plugin-svelte svelte svelte-check typescript tslib
```

Generate:
1. **`vite.config.ts`** — With `base: './'`, outDir to wwwroot, /ws proxy
2. **`svelte.config.js`** — Svelte 5 preprocessor config
3. **`tsconfig.json`** — TypeScript config with Svelte support
4. **`src/main.ts`** — Entry point mounting App.svelte
5. **`src/App.svelte`** — Root component with basic layout
6. **`src/app.css`** — Global styles (dark theme default)
7. **`src/lib/stores/messages.ts`** — Message bridge with auto-detection
8. **`src/lib/types/messages.ts`** — TypeScript type definitions
9. **`index.html`** — Entry HTML with relative paths
10. **`public/favicon.ico`** — Placeholder icon

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

Add both projects to the solution:
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

Execute the `/setup-photino-project` command to generate:
- `.agnt.kdl` — Dual-service autostart
- `CLAUDE.md` — AI agent context
- Memory files

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

Tell the user what was created:

1. **Solution**: `<ProjectName>.sln` with app and test projects
2. **Backend**: .NET Photino app with dual-mode entry point, message router, transports
3. **Frontend**: Svelte 5 + Vite with message bridge and WebSocket proxy
4. **Tests**: xUnit test project with project reference
5. **Agent config**: `.agnt.kdl` for dual-service autostart

**To start developing**:
```bash
agnt run claude
# Or manually:
dotnet watch run --project src/<ProjectName> -- --dev-server  # Terminal 1
cd src/<ProjectName>.Frontend && pnpm dev                      # Terminal 2
```

**Open** `http://localhost:5173` in your browser.

## Important Notes

- Always use `WinExe` OutputType (not `Exe`) to suppress console on Windows
- Always set `base: './'` in Vite config for Photino compatibility
- Always include `[STAThread]` on the Main method
- The wwwroot directory is a build artifact — keep it git-ignored
- The message bridge auto-detects Photino vs browser context
