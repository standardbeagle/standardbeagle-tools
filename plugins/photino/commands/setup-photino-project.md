---
description: "Configure a Photino.NET project for AI-assisted development with dual-service autostart, CLAUDE.md, and memory files. 配置Photino.NET工程以支持AI輔助開發：雙服務自動啟動、CLAUDE.md及記憶文件. Use when: setting up agnt.kdl for a Photino project, generating CLAUDE.md, initializing project memory, configuring dual-service autostart"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

配置Photino.NET工程以支持AI輔助開發。掃描工程結構，詢問配置問題，然後生成`.agnt.kdl`、`CLAUDE.md`及記憶文件。

## Steps

### 1. Detect Project Structure

掃描Photino.NET工程：

```bash
# Find Photino csproj files
find . -name "*.csproj" -exec grep -l "Photino.NET" {} \;
```

檢查：
- 引用`Photino.NET`包之`.csproj`文件
- 前端工程（含Vite/Svelte之`package.json`）
- 測試工程（`*.Tests.csproj`）
- 解決方案文件（`*.sln`）
- 現有`.agnt.kdl`（提供更新選項）

從csproj提取：
- `TargetFramework`（如`net10.0`）
- `RuntimeIdentifiers`
- 包引用（PowerShell SDK、Porta.Pty等）
- `BuildFrontend`目標及其`WorkingDirectory`

### 2. Ask Configuration Questions

每項用AskUserQuestion：

**Question 1**：「工程名稱是什麼？」
- 默認為不含擴展名之csproj文件名
- 用于`.agnt.kdl`及CLAUDE.md

**Question 2**：「後端開發服務器命令是什麼？」
- 默認：`dotnet watch run --project <detected-csproj-path> -- --dev-server`
- 備選：`dotnet run --project <path> -- --dev-server`

**Question 3**：「前端開發命令是什麼？」
- 默認：`pnpm dev`
- 選項：`pnpm dev`、`npm run dev`、`yarn dev`

**Question 4**：「前端工程相對倉庫根的路徑？」
- 默認：從BuildFrontend目標之WorkingDirectory檢測
- 示例：`src/MyApp.Frontend`

**Question 5**：「後端WebSocket開發服務器使用哪個端口？」
- 默認：`5174`

**Question 6**：「是否通過agnt代理啟用瀏覽器調試？」
- 選項：是（推薦）、否
- 若是，在.agnt.kdl中創建代理部分

### 3. Generate .agnt.kdl

在工程根目錄寫入`.agnt.kdl`：

```kdl
// <ProjectName> - Cross-platform desktop app using Photino.NET
// Strict KDL parsing: typos/unknown fields will cause clear errors

project {
    name "<ProjectName>"
    type "dotnet-photino"
}

scripts {
    // Backend dev server (WebSocket on port <port>) with hot-reload
    backend {
        run "<backend-command>"
        autostart true
    }

    // Frontend dev server (Vite on port 5173, proxies /ws to backend)
    dev {
        run "<frontend-command>"
        cwd "<frontend-path>"
        autostart true
        // Vite outputs: "Local: http://localhost:5173/"
        url-matchers "Local:\\s+{url}"
    }

    // Build commands (not auto-started)
    build {
        run "dotnet build"
    }

    test {
        run "dotnet test"
    }
}

// Proxy for browser debugging - linked to dev script
proxies {
    dev {
        script "dev"
    }
}

hooks {
    on-response {
        toast true
        indicator true
    }
}
```

### 4. Generate CLAUDE.md

在工程根目錄寫入或更新`CLAUDE.md`：

```markdown
# <ProjectName>

## Architecture
- Photino.NET desktop app with <frontend-framework> frontend
- .NET <version> backend with <packages>
- Message-based frontend<->backend communication via {type, payload} JSON
- Dual-mode: Photino native bridge (production) / WebSocket (development)

## Development
- Backend: `dotnet watch run --project <path> -- --dev-server`
- Frontend: `cd <frontend-path> && pnpm dev`
- Both auto-start with `agnt run claude`

## Build
- `dotnet build` (builds frontend via MSBuild target, then .NET)
- Frontend output: `<frontend-path>/../<app>/wwwroot/`

## Test
- `dotnet test` — runs all tests
- `dotnet test --filter "Category!=Integration"` — fast tests only
- `cd <frontend-path> && pnpm run check` — TypeScript/Svelte checks

## Key Patterns
- IMessageTransport abstraction (PhotinoTransport / WebSocketTransport)
- MessageRouter dispatches {type, payload} messages
- SessionManager manages PowerShell runspace lifecycle
- Frontend: Svelte 5 runes ($state, $derived, $effect)
- Message bridge: send() and on() from $lib/stores/messages
```

### 5. Generate Memory Files

創建`.claude/`記憶目錄結構：

```bash
mkdir -p .claude/projects/memory
```

寫入`.claude/projects/memory/MEMORY.md`：

```markdown
# <ProjectName> Project Memory

## Architecture Overview
- **Stack**: Photino.NET desktop app + <packages> + <frontend> frontend
- **Target**: .NET <version>, <frontend framework>
- **Communication**: Message-based via {type, payload} JSON format
- See [architecture.md](architecture.md) for details

## Key Patterns
- See [patterns.md](patterns.md) for integration patterns and common pitfalls

## Known Issues
- (Add issues as discovered during development)
```

### 6. Verify Setup

生成文件後驗證：

1. `.agnt.kdl`為有效KDL（檢查語法錯誤）
2. `CLAUDE.md`引用正確路徑
3. 前端路徑存在
4. csproj路徑存在
5. 報告已創建內容：
   - `.agnt.kdl` — 雙服務自動啟動配置
   - `CLAUDE.md` — 工程AI代理上下文
   - `.claude/projects/memory/MEMORY.md` — 持久記憶

### 7. Explain Next Steps

告知用戶：

1. **開始開發**：運行`agnt run claude`自動啟動兩個服務
2. **手動啟動**：在獨立終端運行後端和前端命令
3. **瀏覽器訪問**：兩個服務啟動後打開`http://localhost:5173`
4. **自定義**：編輯`.agnt.kdl`添加額外腳本或代理設置
5. **記憶**：AI代理隨工程學習更新記憶文件
