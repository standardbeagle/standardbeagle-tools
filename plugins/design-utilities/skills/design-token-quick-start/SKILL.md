---
name: design-utilities-design-token-quick-start
description: "Quick reference for design-token MCP — tokens_generate, tokens_export, tokens_validate, tokens_diff, tokens_merge, tailwind_generate. Use when: build/maintain design token pipeline, export tokens to CSS/Tailwind/SCSS/Style Dictionary, validate token files, diff token versions, layer base/brand/mode themes."
disable-model-invocation: true
---

# Design Token MCP Quick Start

Use the `design-token` MCP server for Style Dictionary-compatible token pipelines - generation, multi-format export, validation, diffing, and theme layering. Complementary to `color` (palette/contrast) and `ux-design:design-tokens` (planning).

## When to Use

- Bootstrapping a design token set from a seed palette or scale
- Exporting tokens to multiple consumers (web CSS, native SCSS, Tailwind config, Style Dictionary pipeline)
- Validating hand-authored token JSON before a release
- Generating release notes by diffing token sets between versions
- Layering base theme + brand overrides + light/dark modes into a resolved set
- Producing or extending a `tailwind.config.js` from a normalized token tree

## Tool Map

| Task | Tool |
| --- | --- |
| Generate token set from seed | `tokens_generate` |
| Export tokens to CSS/Tailwind/SCSS/SD/JSON | `tokens_export` |
| Validate token file/tree | `tokens_validate` |
| Diff two token sets | `tokens_diff` |
| Merge theme layers | `tokens_merge` |
| Generate Tailwind config | `tailwind_generate` |

## Typical Workflows

1. **New design system**: start with `tokens_generate` from a palette + type scale, `tokens_validate` the output, then `tokens_export` to CSS and Tailwind for immediate use.
2. **Multi-theme build**: author base, brand, and mode layers as separate files; use `tokens_merge` with `resolve_aliases: true` to produce a resolved tree per theme variant, then `tokens_export` per variant.
3. **Release review**: run `tokens_diff` between previous and current token sets; surface the structured diff in the release PR to flag breaking changes before merge.
4. **Tailwind handoff**: after `tokens_merge`, pipe the resolved tree through `tailwind_generate` with `version: 4` and the team's preset to produce a ready-to-commit `tailwind.config.js`.
5. **CI validation**: in the design-system repo CI, run `tokens_validate --strict` on every PR to catch malformed references, orphan tokens, and circular aliases before they reach consumers.

## Notes

- The MCP server is a separate package (`@standardbeagle/design-token`); this plugin is only the Claude Code integration wrapper.
- Register the server through `slop-mcp` per this project's conventions; the bundled `mcp.json.disabled` is intentional.
- The output schema follows the W3C Design Tokens Community Group spec with Style Dictionary compatibility for toolchain interop.
- Pair with the `color` plugin for palette extraction and WCAG contrast verification before feeding values into `tokens_generate`.

## Related

- `design-utilities:design-token-overview` — 工具全覽與 setup
