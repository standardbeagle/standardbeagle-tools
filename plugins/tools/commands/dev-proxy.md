---
name: dev-proxy
description: Start a dev server with reverse proxy for browser debugging
allowed-tools:
  - mcp__agnt__detect
  - mcp__agnt__run
  - mcp__agnt__proc
  - mcp__agnt__proxy
  - mcp__agnt__proxylog
---

# Dev Proxy

Start a development server with reverse proxy for browser debugging capabilities.

## Instructions

1. **Detect project**: Use `mcp__agnt__detect` to find available scripts
2. **Start dev server**: Use `mcp__agnt__run script_name="dev"` to start the server
3. **Start proxy**: Use `mcp__agnt__proxy action="start"` targeting the dev server
4. **Monitor**: Use `mcp__agnt__proxylog` to check for errors

## Features When Using Proxy

- JavaScript error capture
- Performance metrics
- User interaction tracking
- DOM mutation monitoring
- Screenshot capability
- Sketch mode for wireframing
- Design mode for UI iteration

## Example

```
# Start dev server
mcp__agnt__run script_name="dev"

# Start proxy
mcp__agnt__proxy action="start" id="dev" target_url="http://localhost:3000"

# Check for errors
mcp__agnt__proxylog proxy_id="dev" action="summary"
```
