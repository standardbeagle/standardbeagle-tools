# typography

Typography MCP server: modular type scales (ratio-based px/rem), font metrics analysis (x-height, cap-height, ascender, descender, line-height recommendations), variable font axis parsing (wght/wdth/slnt with CSS), font subsetting to WOFF2 by Unicode range, and system-fallback font stacks with size-adjust — a complete type-system toolkit for design and web delivery.

## Why `mcp.json` is disabled

This plugin ships with `mcp.json.disabled` rather than `mcp.json`. That is intentional.

The `standardbeagle-tools` marketplace registers MCP servers through **slop-mcp** — a meta-server that owns MCP lifecycle, credential storage, and tool discovery for every plugin in the suite. Plugin-bundled `mcp.json` files conflict with slop-mcp's registration model: the same server would be registered twice (once by Claude Code from the plugin manifest, once by slop-mcp), producing duplicate tool entries and ambiguous routing.

Keeping the file as `mcp.json.disabled` lets Claude Code's plugin loader skip it while preserving the canonical config shape for users who want to opt out of slop-mcp.

## Recommended: install via slop-mcp

See `commands/overview.md` § *Installation via slop-mcp* for the full walkthrough. In short:

```bash
# After enabling the plugin in your marketplace
/slop-mcp:slop-add typography npx -y @standardbeagle/typography@latest mcp
```

slop-mcp will track the server, surface its tools through `mcp__plugin_slop-mcp_slop-mcp__execute_tool`, and keep registration consistent with the rest of the suite.

## Opt-in: plugin-bundled `mcp.json`

If you do **not** use slop-mcp and prefer Claude Code's native plugin-level MCP loading, copy the example template into place:

```bash
cp plugins/typography/mcp.json.example plugins/typography/mcp.json
```

**Caveat**: this conflicts with slop-mcp. If both are active, you will see duplicate `typography` tools. Pick exactly one path per workspace. The project memory note at the marketplace root (`MEMORY.md` → *MCP Configuration*) records this trade-off and should not be invalidated by enabling `mcp.json` here.

## File map

| File | Purpose |
| --- | --- |
| `mcp.json.disabled` | Canonical config, deliberately not loaded |
| `mcp.json.example` | Copy-ready template, identical content to `.disabled` |
| `commands/overview.md` | User-facing capability tour and installation steps |
| `.claude-plugin/plugin.json` | Plugin manifest (name, version, commands) |
