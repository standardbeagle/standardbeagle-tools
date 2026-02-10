---
description: "Configure a Photino.NET project for AI-assisted development with dual-service autostart, CLAUDE.md, and memory files"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

Set up a Photino.NET project for AI-assisted development. Scans the project structure, asks configuration questions, then generates `.agnt.kdl`, `CLAUDE.md`, and memory files.

## Steps

### 1. Detect Project Structure

Scan for the Photino.NET project:

```bash
# Find Photino csproj files
find . -name "*.csproj" -exec grep -l "Photino.NET" {} \;
```

Check for:
- `.csproj` files referencing `Photino.NET` package
- Frontend project (`package.json` with Vite/Svelte)
- Test project (`*.Tests.csproj`)
- Solution file (`*.sln`)
- Existing `.agnt.kdl` (offer to update)

Extract from the csproj:
- `TargetFramework` (e.g., `net10.0`)
- `RuntimeIdentifiers`
- Package references (PowerShell SDK, Porta.Pty, etc.)
- `BuildFrontend` target and its `WorkingDirectory`

### 2. Ask Configuration Questions

Use AskUserQuestion for each:

**Question 1**: "What is the project name?"
- Default to the csproj filename without extension
- Used in `.agnt.kdl` and CLAUDE.md

**Question 2**: "What is the backend dev server command?"
- Default: `dotnet watch run --project <detected-csproj-path> -- --dev-server`
- Alternative: `dotnet run --project <path> -- --dev-server`

**Question 3**: "What is the frontend dev command?"
- Default: `pnpm dev`
- Options: `pnpm dev`, `npm run dev`, `yarn dev`

**Question 4**: "Where is the frontend project relative to the repo root?"
- Default: detect from BuildFrontend target's WorkingDirectory
- Example: `src/MyApp.Frontend`

**Question 5**: "Which backend port does the WebSocket dev server use?"
- Default: `5174`

**Question 6**: "Do you want browser debugging via agnt proxy?"
- Options: Yes (recommended), No
- If yes, creates proxy section in .agnt.kdl

### 3. Generate .agnt.kdl

Write `.agnt.kdl` in the project root:

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

Write or update `CLAUDE.md` in the project root with project-specific context:

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

Create `.claude/` memory directory structure:

```bash
mkdir -p .claude/projects/memory
```

Write `.claude/projects/memory/MEMORY.md`:

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

After generating files, verify:

1. `.agnt.kdl` is valid KDL (check for syntax errors)
2. `CLAUDE.md` references correct paths
3. Frontend path exists
4. csproj path exists
5. Report what was created:
   - `.agnt.kdl` — Dual-service autostart configuration
   - `CLAUDE.md` — AI agent context for the project
   - `.claude/projects/memory/MEMORY.md` — Persistent memory

### 7. Explain Next Steps

Tell the user:

1. **Start development**: Run `agnt run claude` to auto-start both services
2. **Manual start**: Run the backend and frontend commands in separate terminals
3. **Browser access**: Open `http://localhost:5173` after both services start
4. **Customize**: Edit `.agnt.kdl` for additional scripts or proxy settings
5. **Memory**: The AI agent will update memory files as it learns about the project
