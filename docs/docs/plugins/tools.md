---
title: tools - Combined Toolkit Plugin for Claude Code
description: The ultimate Claude Code plugin combining browser debugging (agnt) and semantic code search (lci) in one package. Full-stack development superpowers.
keywords: [Claude Code plugin, browser debugging, code search, full-stack development, combined toolkit, agnt, lci]
sidebar_position: 4
---

# tools - Combined Toolkit

**tools** combines the power of `agnt` (browser superpowers) and `lci` (code intelligence) into a single, unified plugin for full-stack development.

## Why tools?

:::tip One Plugin, All Features
Get browser debugging AND code intelligence in a single install. Perfect for full-stack developers who need both capabilities.
:::

### Included Capabilities

From **agnt**:
- 🔄 Reverse proxy for browser debugging
- 📸 Screenshots and sketch mode
- 🔍 JavaScript error detection
- ♿ Accessibility audits
- ⚡ Performance analysis

From **lci**:
- ⚡ Sub-millisecond semantic code search
- 📊 79.8% context reduction
- 🔗 Dependency tracking
- 🚫 Force-LCI mode

## Installation

```bash
# Install from marketplace
claude mcp add-dir https://github.com/standardbeagle/standardbeagle-tools
claude mcp add tools --source ./plugins/tools

# Or install directly
claude mcp add tools --source ./plugins/tools
```

## Available Commands

### From agnt (Browser)

| Command | Description |
|---------|-------------|
| `/setup-project` | Configure auto-start scripts and proxies |
| `/dev-proxy` | Start dev server with reverse proxy |
| `/screenshot` | Capture current browser page |
| `/sketch-mode` | Open wireframing overlay |
| `/check-errors` | Check for JavaScript errors |
| `/audit-a11y` | Run accessibility audit |
| `/audit-performance` | Analyze page performance |
| `/audit-seo` | SEO best practices check |
| `/audit-security` | Security vulnerability scan |
| `/analyze-ux` | UX heuristic analysis |
| `/qa-test` | Comprehensive QA testing |
| `/stop-all` | Stop all running processes |

### From lci (Code Intelligence)

| Command | Description |
|---------|-------------|
| `/search` | Semantic code search |
| `/explore` | Explore codebase structure |
| `/context` | Get symbol context |

## Usage Examples

### Full-Stack Debugging Workflow

```bash
# 1. Set up project
/setup-project

# 2. Start dev environment
/dev-proxy --port 3000

# 3. Search for relevant code
/search user authentication flow

# 4. Debug frontend issues
/check-errors
/screenshot

# 5. Run audits
/audit-a11y
/audit-performance
```

### Code Review Workflow

```bash
# 1. Find the code to review
/context PaymentService.process

# 2. Understand dependencies
/explore src/payment/

# 3. Check for issues
/audit-security

# 4. Document with screenshots
/screenshot
```

## MCP Servers

The tools plugin includes both MCP servers:

```json
{
  "mcpServers": {
    "agnt": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/agnt@latest", "mcp"]
    },
    "lci": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/lci@latest", "mcp"]
    }
  }
}
```

## Agents

Combined agents from both plugins:

- **browser-debugger**: Debug browser issues
- **process-manager**: Manage dev processes
- **ui-designer**: UI design feedback
- **code-explorer**: Code exploration with LCI

## Hooks

The tools plugin includes all hooks from both agnt and lci:

| Hook | Purpose | Source |
|------|---------|--------|
| SessionStart | Initialize session | agnt |
| SessionStart | Connect to daemon | agnt |
| PreToolUse | Heartbeat | agnt |
| PreToolUse | Block Grep/Glob (force-LCI) | lci |
| PostToolUse | Activity tracking | agnt |
| PostToolUse | File change notifications | agnt |
| PostToolUseFailure | Error handling | agnt |
| Stop | Cleanup | agnt |
| Notification | Forward to browser | agnt |

## Configuration

### Project Setup

Create both `.agnt.kdl` and enable force-LCI mode:

```bash
# Enable semantic search enforcement
touch ~/.config/claude-code/lci-force-mode
```

### .agnt.kdl

```kdl
scripts {
    start "npm run dev"
    test "npm test"
}

proxies {
    frontend {
        from "localhost:3000"
        to "localhost:8080"
    }
}
```

## When to Use tools vs. Individual Plugins

### Use `tools` when:
- You're a full-stack developer
- You need both browser and code capabilities
- You want simplified configuration
- You're setting up a new project

### Use individual plugins when:
- You only need browser debugging (`agnt`)
- You only need code search (`lci`)
- You want minimal dependencies
- You're customizing a specific workflow

## Performance

Both MCP servers are optimized for speed:

| Operation | Response Time |
|-----------|---------------|
| Semantic search | `<1ms` |
| Browser screenshot | ~100ms |
| Proxy connection | ~10ms |
| Accessibility audit | ~2s |

## Troubleshooting

### Both MCP Servers Not Starting

```bash
# Check both packages are available
npm view @standardbeagle/agnt
npm view @standardbeagle/lci

# Reinstall plugin
claude mcp remove tools
claude mcp add tools --source ./plugins/tools
```

### Commands Not Found

1. Restart Claude Code session
2. Check both command directories exist
3. Verify plugin.json includes all commands

## Related Resources

- [agnt Plugin](./agnt) - Browser superpowers only
- [lci Plugin](./lci) - Code intelligence only
- [Getting Started](/docs/getting-started)

## Version History

| Version | Changes |
|---------|---------|
| 1.0.0 | Combined agnt + lci with cross-platform hooks |
