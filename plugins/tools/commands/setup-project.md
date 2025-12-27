---
name: setup-project
description: Configure scripts and proxies to auto-start when opening this project
allowed-tools:
  - mcp__agnt__detect
  - mcp__agnt__run
  - mcp__agnt__proxy
  - mcp__cs__code_insight
  - Read
  - Write
  - Glob
---

# Project Setup

Configure your project for optimal development with agnt and lci.

## Instructions

1. **Detect project type**: Use `mcp__agnt__detect` to identify the project
2. **Analyze codebase**: Use `mcp__cs__code_insight mode="overview"` to understand structure
3. **Configure auto-start**: Set up dev servers and proxies based on detected scripts
4. **Save configuration**: Write `.agnt.kdl` with appropriate settings

## Example Configuration

```kdl
// .agnt.kdl
scripts {
    dev auto-start=true
}

proxy "dev" {
    script "dev"
    port-detect "auto"
    fallback-port 3000
}
```

## Steps

1. Detect project type and available scripts
2. Identify the main development server script
3. Determine the port used by the dev server
4. Configure proxy for browser debugging
5. Save configuration to `.agnt.kdl`
