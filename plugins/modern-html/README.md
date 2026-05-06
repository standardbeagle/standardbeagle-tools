# modern-html

Direct AI coding agents toward native HTML and modern CSS gated by Web Platform Baseline status. Auto-adopt features Widely available ≥9 months. Prompt before Newly available. Avoid Limited without explicit fallback.

## Tiers (May 2026 cutoff)

- **Tier A** — Baseline Widely ≥9 months → auto-adopt, no `@supports` needed.
- **Tier B** — Baseline Newly OR Widely <9 months → prompt user / consult `CLAUDE.md` policy.
- **Tier C** — Limited availability → progressive enhancement only, never primary.

## Skills

| Skill | Purpose |
|---|---|
| `baseline-decision-protocol` | Meta-skill: tier decision tree, memory contract, `@supports` hygiene |
| `js-replacement-patterns` | Native primitives that retire JS UI libraries (Floating UI, Headless UI, Swiper, etc.) |
| `native-html-primitives` | `<dialog>`, popover, `<details name>`, `<search>`, `inert`, invokers |
| `modern-css-layout` | Container queries, subgrid, `:has()` |
| `css-architecture` | `@layer`, `@scope`, native nesting |
| `scroll-and-motion` | Scroll-snap, view transitions, scroll-driven animations |
| `native-form-controls` | Constraint validation, `:user-valid`, `accent-color` |
| `theming-and-color` | `color-scheme`, `light-dark()`, `oklch()`, `color-mix()` |
| `performance-and-containment` | `content-visibility`, `contain-intrinsic-size` |
| `accessibility-primitives` | `focus-visible`, `inert`, motion/contrast/colors-scheme media queries |

## Memory contract

Tier-B decisions persist in project `CLAUDE.md` under `## Baseline policy`. Three preset policies offered: **Conservative** (Tier A only), **Modern** (A+B with `@supports`), **Bleeding edge** (A+B+C with fallbacks).

## Source

Inventory verified against `web.dev/baseline/2025`, `web.dev/baseline/2026`, monthly Baseline digests through Mar 2026, and current MDN compat data. Refresh monthly via `web-features` npm package.
