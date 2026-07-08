---
name: design-utilities-a11y-audit-overview
description: "Overview of a11y-audit MCP server tools for static accessibility analysis - HTML audits, WCAG scoring, heading outlines, ARIA validation, link text checks, and PDF accessibility inspection without browser."
disable-model-invocation: true
---

# Accessibility Audit MCP Overview

The `a11y-audit` MCP server provides static accessibility analysis for HTML and PDF content. It runs without a browser, making it suitable for CI pipelines, source-level audits, and pre-deploy verification. It lives in a separate repository and is consumed here as a thin plugin wrapper.

## Proposed Tools

### `audit_html`
Run a comprehensive rule-based audit over raw HTML or a local file. Checks image `alt` text, ARIA usage, heading structure, form label associations, landmark roles, and other WCAG-aligned rules. Returns findings with WCAG success criterion references (e.g., `1.1.1`, `1.3.1`, `4.1.2`).

Inputs: `html` (string) or `path` (file), optional `rules` (subset filter), `level` (`A` | `AA` | `AAA`).

### `wcag_score`
Produce a pass/fail summary against WCAG 2.1 or 2.2 at the chosen conformance level. Aggregates `audit_html` findings into a conformance scorecard with per-criterion status and counts.

Inputs: `html` (string) or `path`, `version` (`2.1` | `2.2`), `level` (`A` | `AA` | `AAA`).

### `heading_structure`
Extract the heading outline (`h1`-`h6`) and flag skipped levels, empty headings, and documents missing an `h1`. Useful for verifying semantic document structure.

Inputs: `html` (string) or `path`, optional `scope` (CSS selector to restrict).

### `aria_validate`
Validate ARIA roles, states, and properties against the WAI-ARIA 1.2 spec. Catches invalid role names, disallowed child roles, missing required properties, and role/element mismatches.

Inputs: `html` (string) or `path`, optional `spec_version` (`1.1` | `1.2`).

### `link_text_check`
Detect vague or non-descriptive link text ("click here", "read more", "learn more", bare URLs, icon-only links without accessible names). Flags duplicate link text that points to different destinations.

Inputs: `html` (string) or `path`, optional `allowlist` (phrases to ignore).

### `document_accessibility`
Inspect PDF documents for tagged structure, reading order, alt text on images, language declaration, title metadata, and form field labels. Reports whether the PDF is tagged and lists structural issues.

Inputs: `path` (PDF file) or `buffer` (base64), optional `checks` (subset of structural rules).

## Setup

This plugin ships with `mcp.json.disabled` because the marketplace manages MCP servers through `slop-mcp`. To activate:

1. Publish `@standardbeagle/a11y-audit` to npm
2. Register via `slop-mcp:slop-add` (recommended) or enable the bundled mcp config out-of-band

## Installation via slop-mcp

```bash
# Register MCP server
claude mcp add standardbeagle-a11y-audit -- npx -y @standardbeagle/a11y-audit@latest mcp
```

Or via slop-mcp KDL config:

```kdl
// .slop-mcp/servers.kdl
server "standardbeagle-a11y-audit" {
    command "npx"
    args "-y" "@standardbeagle/a11y-audit@latest" "mcp"
}
```

Verify by calling `list_tools` on the registered server.

## Related

- `design-utilities:a11y-audit-quick-start` — 工具調用速查
- `ux-developer:a11y-check` — WCAG 2.2 audit workflow with manual checklist
- `agnt:audit-a11y` — runtime browser-based accessibility audit (complementary)
- `color` plugin — WCAG contrast verification for palette-level issues
