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

## Instructions

1. **Detect project type**: Use `mcp__agnt__detect` to identify the project
2. **Analyze codebase**: Use `mcp__lci__code_insight mode="overview"` to understand structure
3. **Configure auto-start**: Set up dev servers and proxies based on detected scripts
4. **Configure AI context**: Optionally customize the AI system prompt for this project
5. **Save configuration**: Write `.agnt.kdl` with appropriate settings

## Example Configuration

```kdl
// .agnt.kdl - agnt project configuration

// Scripts to auto-start
scripts {
    dev {
        autostart true
        url-matchers "(Local|Network):\\s*{url}"
    }
}

// Proxy for browser debugging
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

// AI configuration (optional)
// ai {
//     // Append project context to default prompt (recommended)
//     append-system-prompt "Project-specific instructions here."
//
//     // Or full system prompt override
//     // system-prompt "Custom prompt..."
//
//     // Skill/persona
//     // skill "debugging"
// }
```

## Steps

1. Detect project type and available scripts
2. Identify the main development server script
3. Determine the port used by the dev server
4. Configure proxy for browser debugging
5. Ask about AI configuration (skill, append-system-prompt, or full system-prompt)
6. Save configuration to `.agnt.kdl`
