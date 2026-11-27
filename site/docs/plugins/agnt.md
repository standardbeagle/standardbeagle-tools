---
title: agnt - Browser Superpowers Plugin for Claude Code
description: Debug web applications directly from Claude Code with reverse proxy, live screenshots, sketch mode, and comprehensive browser diagnostics. Install in seconds.
keywords: [Claude Code browser debugging, reverse proxy, browser automation, web debugging, screenshot, sketch mode, accessibility audit]
sidebar_position: 2
---

# agnt - Browser Superpowers

**agnt** gives Claude Code browser superpowers: reverse proxy, live screenshots, sketch mode, and comprehensive web application diagnostics.

## Why agnt?

:::tip Real-Time Browser Debugging
Debug your web applications directly from Claude Code. No more context switching between browser DevTools and your AI assistant.
:::

### Key Features

- **🔄 Reverse Proxy**: Route browser traffic through Claude Code for debugging
- **📸 Screenshots**: Capture page states for UI review and documentation
- **✏️ Sketch Mode**: Wireframe and annotate directly on web pages
- **🔍 Diagnostics**: JavaScript error detection, performance analysis, accessibility audits
- **🔔 Notifications**: Browser notifications for file changes and task completion

## Installation

```bash
# Install from marketplace
claude mcp add-dir https://github.com/standardbeagle/standardbeagle-tools
claude mcp add agnt --source ./plugins/agnt

# Or install directly
claude mcp add agnt --source ./plugins/agnt
```

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/setup-project` | Configure auto-start scripts and proxies | `/setup-project` |
| `/dev-proxy` | Start dev server with reverse proxy | `/dev-proxy` |
| `/screenshot` | Capture current browser page | `/screenshot` |
| `/sketch-mode` | Open wireframing overlay | `/sketch-mode` |
| `/check-errors` | Check for JavaScript errors | `/check-errors` |
| `/audit-a11y` | Run accessibility audit | `/audit-a11y` |
| `/audit-performance` | Analyze page performance | `/audit-performance` |
| `/audit-seo` | SEO best practices check | `/audit-seo` |
| `/audit-security` | Security vulnerability scan | `/audit-security` |
| `/analyze-ux` | UX heuristic analysis | `/analyze-ux` |
| `/qa-test` | Comprehensive QA testing | `/qa-test` |
| `/review-api` | Review API calls and responses | `/review-api` |
| `/stop-all` | Stop all running processes | `/stop-all` |

## Usage Examples

### Start Development Environment

```bash
# In Claude Code session
/setup-project

# Start dev server with proxy
/dev-proxy --port 3000
```

### Debug Frontend Issues

```bash
# Check for JavaScript errors
/check-errors

# Take a screenshot for review
/screenshot

# Analyze performance
/audit-performance
```

### Run Accessibility Audit

```bash
# Comprehensive a11y check
/audit-a11y

# Output includes:
# - WCAG 2.2 compliance issues
# - Keyboard navigation problems
# - Screen reader compatibility
# - Color contrast violations
```

### Use Sketch Mode

```bash
# Open sketch overlay
/sketch-mode

# Draw wireframes and annotations
# directly on the browser page
```

## Session Management

agnt includes automatic session lifecycle management:

- **SessionStart**: Connects to agnt daemon
- **PreToolUse**: Heartbeat to keep session alive
- **PostToolUse**: Activity tracking and notifications
- **Stop**: Clean disconnect from daemon

## Configuration

### Project Configuration (.agnt.kdl)

Create `.agnt.kdl` in your project root:

```kdl
scripts {
    start "npm run dev"
    test "npm test"
    build "npm run build"
}

proxies {
    frontend {
        from "localhost:3000"
        to "localhost:8080"
    }
    api {
        from "localhost:3001"
        to "localhost:8081"
    }
}
```

### Environment Variables

```bash
# Session code for multi-session support
export AGNT_SESSION_CODE="my-session"

# Project directory override
export CLAUDE_PROJECT_DIR="/path/to/project"
```

## MCP Server

agnt includes an MCP server providing tools for:

- Browser navigation and interaction
- Screenshot capture
- DOM inspection
- Network traffic monitoring

### NPM Package

```bash
npm install @standardbeagle/agnt
```

### MCP Configuration

```json
{
  "mcpServers": {
    "agnt": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/agnt@latest", "mcp"]
    }
  }
}
```

## Agents

### browser-debugger

Specialized agent for debugging browser issues:

- Analyzes JavaScript errors
- Inspects network requests
- Diagnoses performance problems
- Suggests fixes with code examples

### process-manager

Manages development processes and servers:

- Starts/stops dev servers
- Monitors process health
- Handles automatic restarts

### ui-designer

Provides UI design feedback:

- Analyzes layout and composition
- Suggests improvements
- Creates wireframes in sketch mode

## Hooks

agnt includes comprehensive lifecycle hooks:

| Hook | Script | Purpose |
|------|--------|---------|
| SessionStart | `session-start.js` | Initialize session |
| SessionStart | `session-connect.js` | Register with daemon |
| PreToolUse | `session-heartbeat.js` | Keep session alive |
| PostToolUse | `session-activity.js` | Track activity |
| PostToolUse | `notify-file-change.js` | Browser notifications |
| PostToolUseFailure | `session-error.js` | Error handling |
| Stop | `session-disconnect.js` | Cleanup |

## Troubleshooting

### Daemon Not Running

```bash
# Start agnt daemon
agnt daemon start

# Check daemon status
agnt daemon status
```

### Port Conflicts

```bash
# Use different port
/dev-proxy --port 3001
```

### Screenshot Fails

1. Ensure browser is connected via proxy
2. Check page has finished loading
3. Try refreshing the page

## Related Resources

- [tools Plugin](./tools) - Combined agnt + lci
- [MCP Server Documentation](/docs/mcp/agnt-server)
- [GitHub Repository](https://github.com/standardbeagle/agnt)
- [NPM Package](https://www.npmjs.com/package/@standardbeagle/agnt)

## Version History

| Version | Changes |
|---------|---------|
| 0.7.12 | Cross-platform Node.js hooks |
| 0.7.11 | Added workflow-engine hook |
| 0.7.10 | Session chain support |
