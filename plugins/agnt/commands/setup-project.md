---
description: "Configure scripts and proxies to auto-start when opening this project"
allowed-tools: ["mcp__agnt__detect", "Read", "Write", "AskUserQuestion"]
---

Configure project-level automation for agnt. The `.agnt.kdl` file is the primary configuration for scripts, proxies, hooks, toast settings, alerts, and AI context.

## How .agnt.kdl Works

`.agnt.kdl` configures everything agnt needs to auto-start your dev environment:

- **`scripts {}`**: Define scripts with `run`, `command/args`, `autostart`, `url-matchers`, `env`, `cwd`, `depends-on`, `shell`
- **`proxies {}`**: Define reverse proxies with `url`/`port`, `script` (link to script for URL detection), `url-pattern`, `bind`, `autostart`, `fallback-port`
- **`project {}`**: Optional metadata (name, type)
- **`hooks {}`**: Browser notification config (toast, indicator, sound)
- **`toast {}`**: Toast notification settings (duration, position, max-visible)
- **`alerts {}`**: Process output monitoring (patterns, batch-window, dedupe-window)
- **`ai {}`**: AI agent config (skill, system-prompt, append-system-prompt, env)

### Script Detection (detect tool)

The `detect` tool auto-detects available scripts from package managers/build systems for discovery purposes:
- **Node.js**: reads `scripts` from `package.json`
- **Go**: detects from `Makefile` targets
- **Python**: detects from `Makefile` or common entry points

These detected scripts help you decide what to configure in `.agnt.kdl`. Scripts defined in `.agnt.kdl` with `autostart true` are started automatically by the daemon.

## Steps

### 1. Detect Project Type

First, detect the project to find available scripts:

```
detect {path: "."}
```

Check the response for:
- `type`: Project type (go, node, python)
- `metadata.framework`: Framework detection (e.g., "wails" for Go desktop apps)
- `commands`: Available commands with their descriptions

**Framework-specific URL matchers** (used in `url-matchers` for script output URL detection):
- **Wails** (`metadata.framework == "wails"`): `"Using DevServer URL:\\s*{url}"` (must include "Using" to avoid matching "Frontend DevServer URL")
- **Next.js** (node with next in scripts): `"(Local|Network):\\s*{url}"`
- **Vite** (node projects): `"Local:\\s+{url}"` (Vite outputs `Local:   http://...`)
- **Astro** (node projects): `"Local\\s+{url}"` (Astro outputs `Local    http://...`)

### 2. Ask About Scripts to Auto-Start

Based on the detected scripts, use AskUserQuestion to ask:

**Question**: "Which scripts should auto-start when you open this project?"
- Present available scripts (dev, start, serve, watch, etc.)
- Allow multiple selections (multiSelect: true)
- Common choices: dev server, watch mode

### 3. Ask About Proxy Configuration

Use AskUserQuestion to ask:

**Question**: "Do you want to create debugging proxies for your dev servers?"

If yes, ask:
- **Proxy ID**: A short name (e.g., "dev", "app")
- **Target**: The URL/port the dev server listens on, OR link to a script for auto-detection
- **Bind address**: `127.0.0.1` (default) or `0.0.0.0` for mobile/Tailscale access

Proxies can be:
- **Explicit target**: `url "http://localhost:3000"` or `port 3000`
- **Script-linked**: `script "dev"` with optional `fallback-port 3000` — auto-creates when URL detected in script output
- **URL-filtered**: `url-pattern ":34115"` to select specific URLs when a script outputs multiple

### 4. Ask About Multi-Service Orchestration

If the project has multiple services (e.g., .NET backend + Vite frontend, or API + SPA):

**Question**: "Does this project need multiple services running together?"

If yes, configure multiple scripts in `.agnt.kdl` with `depends-on` for ordering:
```kdl
scripts {
    backend {
        run "dotnet watch --no-hot-reload --project src/MyApp"
        autostart true
        url-matchers "Now listening on {url}"
    }
    frontend {
        run "npx vite --port 5173"
        autostart true
        depends-on "backend"
        url-matchers "Local:\\s+{url}"
    }
}
```

Alternatively, for complex orchestration, create a shell script and reference it:
```kdl
scripts {
    dev {
        run "bash ./dev-ui.sh"
        autostart true
    }
}
```

### 5. Ask About Browser Notifications

Use AskUserQuestion to ask:

**Question**: "Do you want browser notifications when your AI agent responds?"

Options:
- **Toast notifications**: Show popup messages in the browser
- **Indicator flash**: Flash the floating bug indicator
- **Sound alerts**: Play notification sounds (requires browser permission)

### 6. Write .agnt.kdl Configuration

Create or update `.agnt.kdl` in the project root with KDL format.

**KDL String Escaping**: KDL strings interpret backslash sequences. Unknown escapes like `\s`, `\d`, `\w` silently drop the backslash -- `"Local\s+{url}"` becomes the regex `Locals+{url}` which won't match. Always double the backslash for regex metacharacters:
```
BAD:  url-matchers "Local\s+{url}"       // KDL drops \s -> "Locals+{url}"
GOOD: url-matchers "Local\\s+{url}"      // KDL keeps \\ -> regex "Local\s+{url}"
```

```kdl
// .agnt.kdl - agnt project configuration
// Auto-generated by /setup-project command

// Optional project metadata
project {
    name "my-app"
    type "node"
}

// Scripts to run (managed by daemon)
scripts {
    dev {
        run "npm run dev"
        autostart true
        url-matchers "Local:\\s+{url}"
    }
}

// Reverse proxies for browser debugging
proxies {
    dev {
        script "dev"
        fallback-port 3000
    }
}

// Hook configuration for browser notifications
hooks {
    on-response {
        toast true      // Show toast notification in browser
        indicator true  // Flash the bug indicator
        sound false     // Play notification sound
    }
}

// Toast notification settings
toast {
    duration 4000           // Duration in ms
    position "bottom-right" // top-right, top-left, bottom-right, bottom-left
    max-visible 3           // Max simultaneous toasts
}
```

### 7. Explain What Happens

After creating the config, inform the user:

1. **Starting your dev environment**: Run `agnt run claude` to start your AI coding session. Scripts with `autostart true` start automatically. Proxies with explicit targets or `autostart true` also start automatically. Script-linked proxies start when their script's URL is detected.

2. **Status bar information**: The bottom status bar shows:
   - Running processes count (e.g., "2 proc")
   - Proxy URLs for browser access (e.g., "frontend:3000 -> proxy:18080")
   - Use **CTRL+Y** to toggle the overlay menu for more options

3. **Overlay menu (CTRL+Y)**: Press CTRL+Y to access:
   - List of running processes and proxies
   - Quick actions (restart, stop, view output)
   - Browser access links
   - System status

4. **Port visibility for OAuth**: The status bar shows both your dev server port AND proxy port (e.g., "dev:3000 -> proxy:18080"). Add BOTH to your OAuth redirect URLs:
   - Dev server: `http://localhost:3000`
   - Proxy: `http://localhost:18080` (for browser debugging)

5. **To modify**: Edit `.agnt.kdl` directly, or re-run `/setup-project`

6. **To restart a service**: Use the MCP tool `proc {action: "restart", process_id: "dev"}` or access via CTRL+Y menu

## Example Configurations

### Simple Node.js Project

**.agnt.kdl**:
```kdl
project {
    name "my-next-app"
    type "node"
}

scripts {
    dev {
        run "next dev"
        autostart true
        url-matchers "(Local|Network):\\s*{url}"
    }
}

proxies {
    dev {
        script "dev"
        fallback-port 3000
    }
}

hooks {
    on-response {
        toast true
        indicator true
    }
}
```

### Multi-Service Project (e.g., .NET + Vite)

**.agnt.kdl**:
```kdl
project {
    name "my-fullstack-app"
}

scripts {
    backend {
        run "dotnet watch --no-hot-reload --project src/MyApp"
        autostart true
        url-matchers "Now listening on {url}"
    }
    frontend {
        run "npx vite --port 5173"
        autostart true
        depends-on "backend"
        url-matchers "Local:\\s+{url}"
    }
}

proxies {
    dev {
        script "frontend"
        fallback-port 5173
    }
}

hooks {
    on-response {
        toast true
        indicator true
    }
}
```

### Multi-Service with Shell Orchestrator

For complex startup sequences, use a shell script:

**dev-ui.sh**:
```bash
#!/bin/bash
# Kill stale listeners
for port in 5000 5173; do
  lsof -ti:$port | xargs -r kill -9 2>/dev/null
done

# Start backend (--no-hot-reload prevents zombie listeners)
dotnet watch --no-hot-reload --project src/MyApp &
BACKEND_PID=$!

# Wait for backend health check
for i in $(seq 1 30); do
  curl -sf http://localhost:5000/health && break
  sleep 1
done

# Start frontend
npx vite --port 5173 &
FRONTEND_PID=$!

# Wait for any child to exit
wait -n
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
```

**.agnt.kdl**:
```kdl
project {
    name "my-fullstack-app"
}

scripts {
    dev {
        run "bash ./dev-ui.sh"
        autostart true
    }
}

proxies {
    dev {
        url "http://localhost:5173"
        autostart true
    }
}

hooks {
    on-response {
        toast true
        indicator true
    }
}
```

### Wails (Go Desktop App)

**.agnt.kdl**:
```kdl
project {
    name "my-wails-app"
    type "go"
}

scripts {
    dev {
        run "wails dev"
        autostart true
        url-matchers "Using DevServer URL:\\s*{url}"
    }
}

proxies {
    app {
        script "dev"
        url-pattern ":34115"
        fallback-port 34115
    }
}

hooks {
    on-response {
        toast true
        indicator true
    }
}
```

### Python Development

**.agnt.kdl**:
```kdl
project {
    name "my-flask-app"
    type "python"
}

scripts {
    dev {
        run "flask run --debug"
        autostart true
        url-matchers "Running on {url}"
    }
}

proxies {
    app {
        script "dev"
        fallback-port 5000
    }
}

hooks {
    on-response {
        toast true
        indicator true
    }
}
```
