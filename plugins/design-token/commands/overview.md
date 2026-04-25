---
name: design-token-overview
description: Overview of the design-token MCP server tools for design system token management - generate, export (CSS/Tailwind/Style Dictionary/SCSS/JSON), validate, diff, merge theme layers, and Tailwind config generation.
---

# Design Token MCP Overview

The `design-token` MCP server provides a Style Dictionary-compatible pipeline for managing design system tokens - the single source of truth for color, spacing, typography, radius, shadow, and motion values shared between design and code. It lives in a separate repository and is consumed here as a thin plugin wrapper.

## Proposed Tools

### `tokens_generate`
Generate a design token set from a high-level description, seed palette, or existing style references. Produces a normalized token tree (colors, spacing, typography, radii, shadows, motion) following the W3C Design Tokens Community Group spec.

Inputs: `seed` (palette or base values), optional `scale` (spacing/type scale multiplier), `categories` (subset to generate).

### `tokens_export`
Transform a normalized token tree into any supported output format: CSS custom properties, Tailwind config, Style Dictionary JSON, SCSS variables, or plain JSON. Respects naming conventions and nesting depth per format.

Inputs: `tokens` (normalized tree), `format` (`css` | `tailwind` | `style-dictionary` | `scss` | `json`), optional `prefix`, `selector` (for CSS), `flat` (bool).

### `tokens_validate`
Validate a token file against the W3C Design Tokens spec and common conventions. Catches malformed references (`{color.primary.500}`), circular aliases, missing types, invalid value shapes, and orphan tokens.

Inputs: `tokens` (tree or path), optional `schema` (custom validation rules), `strict` (bool).

### `tokens_diff`
Compare two token sets and produce a structured diff: added, removed, changed (with before/after values), and renamed tokens. Useful for release notes, breaking-change detection, and design handoff review.

Inputs: `before` (tree or path), `after` (tree or path), optional `ignore` (glob patterns for tokens to skip).

### `tokens_merge`
Merge multiple token layers into a single resolved set. Typical use: base theme + brand overrides + mode overrides (light/dark/high-contrast). Later layers override earlier ones; aliases are resolved after merge.

Inputs: `layers` (ordered array of trees or paths), optional `resolve_aliases` (bool), `conflict_strategy` (`override` | `error` | `warn`).

### `tailwind_generate`
Generate a Tailwind CSS config (`tailwind.config.js` or `theme` extend block) from a normalized token tree. Maps token categories to Tailwind theme keys (colors, spacing, fontFamily, borderRadius, boxShadow, transitionDuration).

Inputs: `tokens` (normalized tree), optional `extend` (bool, default true), `version` (`3` | `4`), `preset` (starter config to extend).

## Setup

This plugin ships with `mcp.json.disabled` because the marketplace manages MCP servers through `slop-mcp`. To activate:

1. Publish `@standardbeagle/design-token` to npm
2. Register via `slop-mcp:slop-add` (recommended) or enable the bundled mcp config out-of-band

## Installation via slop-mcp

```bash
# Register MCP server
claude mcp add standardbeagle-design-token -- npx -y @standardbeagle/design-token@latest mcp
```

Or via slop-mcp KDL config:

```kdl
// .slop-mcp/servers.kdl
server "standardbeagle-design-token" {
    command "npx"
    args "-y" "@standardbeagle/design-token@latest" "mcp"
}
```

Verify by calling `list_tools` on the registered server.

## Related

- `ux-design:design-tokens` — design-time token system planning skill
- `color` plugin — palette extraction and contrast checks that feed token generation
- `figma-query` plugin — extract design tokens from Figma files as input to `tokens_generate`
