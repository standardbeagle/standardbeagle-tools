---
name: setup-project
description: Configure scripts and proxies to auto-start when opening this project
allowed-tools:
  - mcp__agnt__detect
  - mcp__agnt__run
  - mcp__agnt__proxy
  - mcp__lci__code_insight
  - Read
  - Write
  - Glob
  - AskUserQuestion
---

# Project Setup

Configure your project for optimal development with agnt and lci.

## How .agnt.kdl Works

`.agnt.kdl` is the primary configuration file. It defines scripts, proxies, hooks, toast settings, alerts, and AI context:

- **`scripts {}`**: Define scripts with `run`, `command/args`, `autostart`, `url-matchers`, `env`, `cwd`, `depends-on`, `shell`
- **`proxies {}`**: Define reverse proxies with `url`/`port`, `script` (link to script), `url-pattern`, `bind`, `autostart`, `fallback-port`
- **`project {}`**: Optional metadata (name, type)
- **`hooks {}`**: Browser notification config
- **`toast {}`**: Toast notification settings
- **`alerts {}`**: Process output monitoring
- **`ai {}`**: AI agent config (skill, system-prompt, append-system-prompt, env)

The `detect` tool auto-detects available scripts from package managers/build systems to help you decide what to configure.

## Instructions

1. **Detect project type**: Use `mcp__agnt__detect` to identify the project and its available scripts
2. **Analyze codebase**: Use `mcp__lci__code_insight mode="overview"` to understand structure
3. **Configure scripts**: Add scripts to the `scripts {}` block in `.agnt.kdl` with `autostart true`
4. **Configure proxies**: Add proxies to the `proxies {}` block — either explicit targets or script-linked for auto-detection
5. **Configure AI context**: Optionally customize the AI system prompt via the `ai {}` block
6. **Save configuration**: Write `.agnt.kdl` with all configuration blocks

## Example Configuration

**.agnt.kdl**:
```kdl
// .agnt.kdl - agnt project configuration

// Optional project metadata
project {
    name "my-app"
    type "node"
}

// Scripts to run (managed by daemon)
scripts {
    dev {
        run "vite"
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

// Browser notifications
hooks {
    on-response {
        toast true
        indicator true
    }
}

// Toast settings
toast {
    duration 4000
    position "bottom-right"
    max-visible 3
}
```

## Multi-Service Projects

For projects with multiple services, use `depends-on` for ordering:

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

proxies {
    dev {
        script "frontend"
        fallback-port 5173
    }
}
```

Alternatively, for complex orchestration, create a shell script:
```kdl
scripts {
    dev {
        run "bash ./dev-ui.sh"
        autostart true
    }
}
```

## KDL String Escaping

KDL strings interpret backslash sequences. Unknown escapes like `\s`, `\d`, `\w` silently drop the backslash. Always double the backslash for regex metacharacters in URL matchers:
```
BAD:  "Local\s+{url}"       // KDL drops \s -> "Locals+{url}"
GOOD: "Local\\s+{url}"      // KDL keeps \\ -> regex "Local\s+{url}"
```

## Steps

1. Detect project type and available scripts
2. Identify the main development server script(s)
3. Configure scripts in `.agnt.kdl` `scripts {}` block with `autostart true`
4. Configure proxies — script-linked (auto-detect URL) or explicit target
5. For multi-service projects, use `depends-on` or a shell orchestrator
6. Ask about AI configuration (skill, append-system-prompt, or full system-prompt)
7. Save `.agnt.kdl` with all configuration
