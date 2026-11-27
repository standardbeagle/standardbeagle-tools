---
title: agnt MCP Server - Browser Debugging for Claude Code
description: MCP server providing browser debugging tools including navigation, screenshots, DOM inspection, and network monitoring for Claude Code.
keywords: [MCP server, browser debugging, Claude Code browser, screenshot MCP, DOM inspection, network monitoring]
sidebar_position: 2
---

# agnt MCP Server

The **agnt MCP server** provides browser debugging tools for Claude Code, enabling navigation, screenshots, DOM inspection, and network monitoring.

## Installation

```bash
# Using npx (recommended)
npx @standardbeagle/agnt@latest mcp

# Global installation
npm install -g @standardbeagle/agnt
agnt mcp
```

## Configuration

### Claude Code

```json
{
  "mcpServers": {
    "agnt": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/agnt@latest", "mcp"],
      "env": {
        "AGNT_DAEMON_URL": "http://localhost:8080"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGNT_DAEMON_URL` | URL of agnt daemon | `http://localhost:8080` |
| `AGNT_SESSION_CODE` | Session identifier | Auto-generated |

## Available Tools

### Navigation

| Tool | Description | Parameters |
|------|-------------|------------|
| `navigate` | Navigate to URL | `url: string` |
| `go_back` | Go back in history | - |
| `go_forward` | Go forward in history | - |
| `refresh` | Refresh current page | - |

### Screenshots

| Tool | Description | Parameters |
|------|-------------|------------|
| `screenshot` | Capture page screenshot | `selector?: string`, `full_page?: boolean` |
| `screenshot_element` | Screenshot specific element | `selector: string` |

### DOM Inspection

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_html` | Get page HTML | `selector?: string` |
| `get_text` | Get element text | `selector: string` |
| `get_attributes` | Get element attributes | `selector: string` |
| `query_selector_all` | Query multiple elements | `selector: string` |

### Interaction

| Tool | Description | Parameters |
|------|-------------|------------|
| `click` | Click element | `selector: string` |
| `type` | Type text into input | `selector: string`, `text: string` |
| `select` | Select dropdown option | `selector: string`, `value: string` |
| `hover` | Hover over element | `selector: string` |

### Network

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_network_logs` | Get network requests | `filter?: object` |
| `get_console_logs` | Get console messages | `filter?: object` |
| `wait_for_request` | Wait for specific request | `pattern: string`, `timeout?: number` |

### Diagnostics

| Tool | Description | Parameters |
|------|-------------|------------|
| `check_errors` | Check for JS errors | - |
| `get_performance` | Get performance metrics | - |
| `run_audit` | Run accessibility/performance audit | `type: string` |

## Usage Examples

### Navigate and Screenshot

```javascript
// Navigate to page
await navigate({ url: "https://example.com" });

// Take screenshot
const screenshot = await screenshot({ full_page: true });
```

### Check for Errors

```javascript
// Check JavaScript errors
const errors = await check_errors();
console.log(errors);
// Output: { errors: [{ message: "...", stack: "..." }] }
```

### Run Accessibility Audit

```javascript
// Run WCAG audit
const audit = await run_audit({ type: "accessibility" });
console.log(audit);
// Output: { violations: [...], passes: [...], score: 85 }
```

### Query DOM

```javascript
// Get all links
const links = await query_selector_all({ selector: "a" });

// Get specific element text
const title = await get_text({ selector: "h1" });
```

## Daemon Integration

The agnt MCP server connects to the agnt daemon for:

- Session management
- Proxy routing
- Notification forwarding

### Starting the Daemon

```bash
# Start daemon
agnt daemon start

# Check status
agnt daemon status

# Stop daemon
agnt daemon stop
```

## Response Format

All tools return responses in this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ELEMENT_NOT_FOUND",
    "message": "Element not found: selector '#missing'"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `NAVIGATION_FAILED` | Page failed to load |
| `ELEMENT_NOT_FOUND` | Selector didn't match any element |
| `TIMEOUT` | Operation timed out |
| `DAEMON_NOT_CONNECTED` | Not connected to agnt daemon |
| `INVALID_URL` | URL is malformed |

## Version History

| Version | Changes |
|---------|---------|
| 0.7.12 | Cross-platform improvements |
| 0.7.11 | Added audit tools |
| 0.7.10 | Network monitoring |

## Related Resources

- [agnt Plugin](/docs/plugins/agnt)
- [NPM Package](https://www.npmjs.com/package/@standardbeagle/agnt)
- [GitHub Repository](https://github.com/standardbeagle/agnt)
