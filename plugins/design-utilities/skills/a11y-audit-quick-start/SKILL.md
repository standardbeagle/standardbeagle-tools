---
name: design-utilities-a11y-audit-quick-start
description: "Quick reference for a11y-audit MCP server - audit_html, wcag_score, heading_structure, aria_validate, link_text_check, document_accessibility. Use when auditing HTML or PDF content for WCAG conformance without browser, verifying ARIA usage, checking heading outlines, or vetting link text quality in CI or source-level reviews."
disable-model-invocation: true
---

# Accessibility Audit MCP Quick Start

Use the `a11y-audit` MCP server for deterministic static accessibility analysis of HTML and PDF content - no browser required. Complementary to `agnt:audit-a11y` (runtime) and `color` (contrast).

## When to Use

- Pre-commit or pre-deploy WCAG 2.1 / 2.2 verification on templates or built HTML
- Auditing server-rendered pages, email templates, or MDX output without spinning up a browser
- Validating ARIA usage in component libraries at the source level
- Checking heading outlines for documentation sites and long-form articles
- Vetting link text quality across a content corpus
- Verifying tagged PDF structure for published documents

## Tool Map

| Task | Tool |
| --- | --- |
| Full HTML audit with WCAG refs | `audit_html` |
| Conformance scorecard (A/AA/AAA) | `wcag_score` |
| Heading outline / skipped levels | `heading_structure` |
| ARIA role/property validation | `aria_validate` |
| Vague or duplicate link text | `link_text_check` |
| Tagged PDF inspection | `document_accessibility` |

## Typical Workflows

1. **CI gate**: on each PR, run `audit_html` over built pages, then `wcag_score` at level AA. Fail the build on new violations.
2. **Component library review**: run `aria_validate` on each component's rendered output; use `heading_structure` on docs pages to catch skipped levels.
3. **Content audit**: sweep marketing pages with `link_text_check` and `heading_structure` to fix vague anchors and outline gaps before launch.
4. **PDF publishing**: before shipping a report PDF, run `document_accessibility` to confirm it is tagged and has structural metadata.

## Notes

- The MCP server is a separate package (`@standardbeagle/a11y-audit`); this plugin is only the Claude Code integration wrapper.
- Register the server through `slop-mcp` per this project's conventions; the bundled `mcp.json.disabled` is intentional.
- Pair with `agnt:audit-a11y` when you need runtime checks (focus order, dynamic ARIA state, live regions) that static analysis cannot cover.
