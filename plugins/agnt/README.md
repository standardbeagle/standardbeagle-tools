# agnt Plugin

**Give your AI coding agent browser superpowers.**

MCP server plugin for Claude Code that bridges your AI agent and the browser, extending what's possible during vibe coding sessions.

## Features

- **Browser Debugging** - Screenshots, DOM inspection, computed styles, layout diagnostics, and 50+ `__devtool` functions
- **Real-Time Error Capture** - JavaScript errors and HTTP failures surface to your agent automatically
- **Incident Pipeline** - Deduped, priority-ordered error inbox (`get_incidents`) so the agent acts on signal, not noise
- **Process Management** - Run and manage dev servers with output capture and clean shutdown
- **Reverse Proxy** - HTTP traffic logging with automatic frontend instrumentation
- **Quality Audits** - Accessibility, performance, security, SEO, responsive, API efficiency, and loading-UX audits
- **Visual Regression** - Baseline/compare screenshots (`snapshot`)
- **Replay Testing** - Record → worker-mock → replay front-end testing (`replaytest`, Pro)
- **Tunnels** - Expose a local proxy via Cloudflare or ngrok
- **Sketch & Design Mode** - Wireframe on the live UI and iterate on designs with the agent
- **Channel Mode** - Push-based browser-to-agent messaging (Claude Code, beta)

## Installation

### From Marketplace

```bash
# Add the marketplace
/plugin marketplace add standardbeagle/standardbeagle-tools

# Install the plugin
/plugin install agnt@standardbeagle-tools
```

CLI equivalents:

```bash
claude plugin marketplace add standardbeagle/standardbeagle-tools
claude plugin add agnt@standardbeagle-tools
```

### Install the agnt binary

The plugin drives the `agnt` MCP server, which needs the `agnt` binary:

```bash
# Via npm (recommended)
npm install -g @standardbeagle/agnt

# Via pip
pip install agnt
```

Or build from source / grab a [GitHub release](https://github.com/standardbeagle/agnt).

## Skills

The plugin ships skills that load on demand and are also invokable as slash commands (`/agnt:<name>`).

### Dev Server, Proxy & Workflow

| Skill | Description |
|-------|-------------|
| `dev-proxy` | Start a dev server with reverse proxy for browser debugging |
| `process-proxy` | Manage dev-server lifecycle and reverse proxies (start/stop/restart/cleanup port) |
| `setup-project` | Configure scripts and proxies to auto-start when opening a project |
| `setup-mcp` | Install the agnt MCP server (local binary, npx, or slop-mcp) |
| `schedule` | Schedule delayed messages to AI agent sessions |
| `chain` | Chain commands to run automatically when events occur |
| `workflow` | Enforce review-gated task-completion workflows |
| `stop-all` | Stop all running processes and proxies |
| `lci-companion` | Hand off to the sibling lci plugin for semantic code search |
| `mcp-tools` | Reference for every agnt MCP tool's parameter schema and examples |

### Browser Debugging & Inspection

| Skill | Description |
|-------|-------------|
| `browser-debug` | End-to-end browser debugging workflow (inspect, layout, interactions, visual) |
| `browser-diagnostics` | Element inspect, layout diagnostics, and tree walk via `__devtool` helpers |
| `current-page` | Extract full current-page info (URL, content, links, performance, visual state) |
| `check-errors` | Check for JavaScript errors in the browser |
| `error-monitor` | Cross-proxy/process error check with aggregation and dedup |
| `error-watch` | Stream proxy/process errors in real time (`agnt watch` + Monitor) |
| `event-watch` | Stream browser overlay interactions in real time (clicks, panel messages, sketches) |
| `interaction-tracking` | Track user interactions and DOM mutations for debugging |
| `review-api` | Review API calls, responses, and network traffic |
| `screenshot` | Take a screenshot of the current browser page |

### Quality Audits & Analysis

| Skill | Description |
|-------|-------------|
| `accessibility-audit` | Accessibility audit: axe-core, ARIA, contrast, tab order, screen-reader sim |
| `audit-a11y` | Run a comprehensive accessibility audit on the current page |
| `audit-performance` | Analyze page performance, load times, and network resources |
| `audit-security` | Audit the page for security vulnerabilities |
| `audit-seo` | Audit the page for SEO best practices |
| `quality-audits` | Page quality audit: DOM complexity, CSS architecture, security, SEO meta |
| `analyze-frontend` | Comprehensive frontend analysis (DOM, CSS, layout, structure) |
| `analyze-ux` | Analyze user experience, interactions, and usability |
| `qa-test` | Run a comprehensive QA test suite on the current page |
| `responsive-check` | Detect responsive-layout risks (fixed widths, touch targets, horizontal scroll) |
| `visual-diagnostics` | Visual overlays for layout debugging (outlines, grid/flex, typography, z-index) |

### Sketch & Design

| Skill | Description |
|-------|-------------|
| `sketch-mode` | Open sketch mode for wireframing on the browser page |
| `sketch-visual` | Wireframe with sketch mode plus visual highlighting and annotation |

## Subagents

| Agent | Description |
|-------|-------------|
| `browser-debugger` | Debug browser issues using agnt proxy diagnostics |
| `process-manager` | Manage development processes and servers |
| `tdd-refactor` | Antagonistic TDD refactoring with runtime verification via proxy and audits |
| `ui-designer` | UI design feedback using sketch mode and visual diagnostics |

## MCP Tools

| Tool | Description |
|------|-------------|
| `detect` | Detect project type and available scripts |
| `run` | Run scripts or commands (background/foreground) |
| `proc` | Manage processes: status, output, stop, list, cleanup port |
| `proxy` | Reverse proxy: start, stop, exec, toast |
| `proxylog` | Query proxy traffic logs |
| `tunnel` | Tunnel management (Cloudflare / ngrok) for mobile testing |
| `currentpage` | View active page sessions |
| `get_incidents` | Incident inbox: cursor-based, priority-ordered errors with remediation hints |
| `get_errors` | Unified error view (legacy; superseded by `get_incidents`) |
| `responsive_audit` | Responsive design audit across viewport sizes |
| `api_audit` | API efficiency audit (waterfall, N+1, duplicate, chatty-load) |
| `loading_audit` | Loading-UX audit (spinner cascade, concurrent fragmentation) |
| `snapshot` | Visual regression testing (baseline / compare screenshots) |
| `replaytest` | Record → worker-mock → replay front-end testing (Pro) |
| `session` | Manage sessions and schedule messages |
| `watch` | Get the `agnt monitor` command for streaming events |
| `channel_reply` | Send messages to the developer's browser overlay (channel mode, beta) |
| `daemon` | Manage the background daemon |

## Quick Start

1. Start a dev server with proxy:
   ```
   /agnt:dev-proxy
   ```

2. Open the proxy URL in your browser (shown in output)

3. Run a full QA test:
   ```
   /agnt:qa-test
   ```

4. Or run specific audits:
   ```
   /agnt:audit-a11y
   /agnt:audit-performance
   /agnt:audit-security
   ```

5. Schedule a follow-up message:
   ```
   /agnt:schedule claude-1 5m "Verify the tests passed and report any failures"
   ```

## Browser API

The proxy injects `window.__devtool` into all proxied pages with 50+ diagnostic functions:

### Logging & Screenshots
- `log(message, level, data)` - Send custom log
- `screenshot(name, selector?)` - Capture screenshot
- `toast.success/error/info/warning(msg)` - Show toast notification

### Element Inspection
- `inspect(selector)` - Comprehensive element inspection
- `getElementInfo(selector)` - Basic element info
- `getComputed(selector)` - Computed styles
- `getBox(selector)` - Box model (margin, border, padding)
- `getLayout(selector)` - Flexbox/Grid layout info
- `getStacking(selector)` - Z-index and stacking context

### Layout Diagnostics
- `findOverflows()` - Find scroll/hidden overflow elements
- `findStackingContexts()` - Find z-index layers
- `findOffscreen()` - Find elements outside viewport
- `diagnoseLayout(selector?)` - Comprehensive layout report

### Accessibility
- `auditAccessibility()` - Full accessibility audit
- `getA11yInfo(selector)` - ARIA and role information
- `getContrast(fg, bg)` - Color contrast ratio check
- `getTabOrder()` - Keyboard navigation order
- `getScreenReaderText(selector)` - Screen reader output

### Quality Audits
- `auditDOMComplexity()` - DOM size and depth analysis
- `auditCSS()` - CSS quality issues
- `auditSecurity()` - Security vulnerability check
- `auditPageQuality()` - SEO and page quality

### Interaction Tracking
- `interactions.getHistory()` - All user interactions
- `interactions.getLastClick()` - Last click details
- `interactions.getLastClickContext()` - Full click context

### Mutation Tracking
- `mutations.getHistory()` - DOM change history
- `mutations.highlightRecent(ms)` - Highlight recent changes
- `mutations.getAdded/Removed/Modified()` - Filtered mutations

### Visual Tools
- `highlight(selector)` - Highlight element
- `isVisible(selector)` - Check visibility
- `isInViewport(selector)` - Check if in viewport
- `checkOverlap(sel1, sel2)` - Check element overlap

### Sketch Mode
- `sketch.open()` / `sketch.close()` - Toggle sketch mode
- `sketch.save()` - Save and send sketch to agent
- `sketch.setTool(name)` - Select drawing tool

### Session Scheduling
- `session.list()` - List active agent sessions
- `session.get(code)` - Get session details
- `session.send(code, message)` - Send message immediately
- `session.schedule(code, duration, message)` - Schedule message delivery
- `session.tasks()` - List pending scheduled tasks
- `session.cancel(taskId)` - Cancel a scheduled task

### State Capture
- `captureDOM()` - Full DOM snapshot
- `captureStyles(selector)` - Element styles
- `captureState()` - Storage and cookies
- `captureNetwork()` - Network resources

## Keyboard Shortcuts

When running with `agnt run`:
- `Ctrl+P`: Toggle overlay menu

## Configuration

Example MCP configuration (`.mcp.json`):

```json
{
  "agnt": {
    "command": "agnt",
    "args": ["mcp"],
    "env": {}
  }
}
```

## License

MIT
