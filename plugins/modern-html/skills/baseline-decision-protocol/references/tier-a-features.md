# Tier A — Auto-adopt (Baseline Widely ≥9 months as of May 2026)

| Feature | Newly date | Widely date | Notes |
|---|---|---|---|
| `<dialog>` + `showModal()` / `show()` / `close()` / `::backdrop` | Mar 2022 | Sep 2024 | Must label (`aria-labelledby`). Don't add `role="dialog"`. `requestClose()` is Tier B (2025). |
| `<details>` / `<summary>` (basic) | 2020 | 2022 | Native focus, keyboard, `disclosure` role. |
| `inert` attribute | Apr 2023 | Oct 2025 | ~7 months Widely; treat as borderline Tier A. Removes from a11y tree + tab order. |
| `<search>` element | Oct 2023 | Apr 2026 | Just barely Widely; semantic landmark. |
| `loading="lazy"` on `<img>` / `<iframe>` | Long-Widely | — | Below-the-fold only. Set `width`/`height`. |
| `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `forced-colors` | All Widely 2022–2023 | — | Honor by default. |
| `focus-visible`, `focus-within` | 2022 | 2024 | Replace generic `:focus`. |
| `accent-color` | 2023 | 2025 | Tints checkboxes, radios, range, progress. |
| `:is()`, `:where()`, `:not()` (multi-arg) | 2021 | 2023 | |
| Cascade layers (`@layer`) | Mar 2022 | Sep 2024 | Single most important architecture primitive. |
| Container queries (size) `@container` `cqw/cqh/cqi/cqb` | Feb 2023 | Aug 2025 | Exactly at threshold. Style queries are Tier B. |
| `position: sticky` | Long-Widely | — | |
| `scroll-behavior: smooth` | Widely 2022 | — | Honor `prefers-reduced-motion`. |
| Scroll-snap (`scroll-snap-type`, `scroll-snap-align`) | Widely | — | |
| `aspect-ratio` | Widely 2022 | — | |
| Logical properties | Widely | — | `inline-size`, `block-size`, `margin-inline`, etc. |
| `gap` in flexbox | Widely 2024 | — | |
| Constraint validation API (`required`, `pattern`, `:valid`) | Mar 2023 | Sep 2025 | |
| `<input type="range">`, `type="color">`, `type="date">` | Widely | — | UI varies by OS/browser. |
| `contain` property | Widely | — | layout/style/paint/size/strict. |
| `contain-intrinsic-size` | — | Mar 2026 | Pairs with `content-visibility: auto` (B). |
| `color-scheme` | Widely | — | Required for `light-dark()`. |

**Rule**: features in this table get used directly with no `@supports` and no user prompt.
