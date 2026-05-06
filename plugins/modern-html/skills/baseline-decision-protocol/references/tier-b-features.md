# Tier B — Prompt user / check memory (Baseline Newly, or recently Widely)

| Feature | Newly date | Status May 2026 | Browser support / gotchas |
|---|---|---|---|
| `:has()` | Dec 2023 | Newly (Widely ~Jun 2026) | Avoid `body:has(...)` wide scope. Engines optimize most patterns. |
| Subgrid | Sep 2023 | Widely Mar 2026 (~2 mo) | Solves card-grid alignment. Independent column/row axes. |
| CSS nesting | Aug 2023 | Widely Feb 2026 (~3 mo) | Compound selectors require `&`. |
| Popover API (`popover`, `popovertarget`) | Jan 27 2025 | Newly | Light-dismiss bug fixed Safari 18.3. |
| Invokers (`command`, `commandfor`) | 2025 (Safari 26.2 Dec 2025) | Newly | Replaces `popovertarget` with broader semantics. |
| `<details name>` exclusive accordion | Apr 2025 (FF 130) | Newly | Native, keyboard + SR work. |
| `dialog.requestClose()` | 2025 | Newly | Fires cancel event. |
| `text-wrap: balance` | May 2024 | Newly | Limited to ≤6 lines (Chromium) / ≤10 (Firefox). Headings only. |
| `text-wrap: stable` | 2024 | Newly | For `contenteditable`. |
| `@starting-style` + `transition-behavior: allow-discrete` | Aug 2024 (FF 129) | Newly | Enables enter/exit from `display:none`. Need `display` and `overlay` in transition list. |
| `@scope` | Dec 2025 (FF 146) | Newly | Replaces BEM scoping for many cases. |
| Same-doc View Transitions | Oct 14 2025 (FF 144) | Newly | `document.startViewTransition()`, `view-transition-name`, `::view-transition-*`, `view-transition-class`. Cross-document is Tier C. |
| `content-visibility: auto` | Sep 2025 | Newly | `contain-intrinsic-size` Widely Mar 2026. |
| `scrollbar-color` | Apr 2025 | Newly | `scrollbar-width` Newly older. `scrollbar-gutter` Widely. |
| `light-dark()` | May 2024 | Newly | Requires `color-scheme`. |
| `oklch()`, `oklab()` | May 2023 → Widely Nov 2025 | ~6 mo Widely → Tier B by strict 9-mo rule (Tier A Aug 2026) | No fallback strictly needed. |
| `color-mix()` | May 2023 → Widely Nov 2025 | ~6 mo Widely → Tier B | Same. |
| Relative color syntax | — | Newly | `oklch(from var(--c) ...)`. |
| `@property` | Jul 2024 | Newly | Required for animating custom properties. |
| `:user-valid` / `:user-invalid` | Oct 2023 | Widely Apr 2026 (~1 mo) | Better than `:valid`/`:invalid`. |
| `inert` attribute | Apr 2023 | Widely Oct 2025 (~7 mo) | Borderline; treat near-Tier A. |
| Anchor positioning — `anchor()`, `anchor-name`, `position-anchor`, `position-area`, `position-try`, `position-try-fallbacks` | Jan 2026 (FF 147) | Newly | Firefox bug 1993699 (range thumb cannot anchor). |
| Cascade layers + nesting + `@scope` together | — | Composite Tier B | Architecture. |
| Invokers full semantics (`command-set`, `command-data`) | Dec 2025 | Newly | |
| `caret-position-from-point`, `scrollend` event, JSON import attributes | 2025 | Newly | |
| LCP API, Event Timing API | Dec 12 2025 | Newly | Core Web Vitals measurement. |
| `accent-color` | 2023 | 2025 | (Borderline; treat A.) |
| Style queries `@container style(...)` | — | Newly | Custom property values only. |
| Container query units `cqw/cqh/cqi/cqb` | — | Widely Aug 2025 | Borderline A. |

**Rule**: read project `CLAUDE.md` `## Baseline policy` first. If no decision, prompt user with template (decision-protocol §6). Persist answer if user agrees.
