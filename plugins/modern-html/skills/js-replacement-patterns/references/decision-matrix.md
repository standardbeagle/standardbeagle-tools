# JS-Replacement Decision Matrix (full)

| UI Pattern | Native (preferred) | Tier | JS still needed when | Accessibility notes |
|---|---|---|---|---|
| Modal dialog | `<dialog>` + `showModal()`; `::backdrop` for scrim; `dialog.close()` | A | Custom non-modal stacked dialog managers, complex multi-step wizards. | Provide accessible name (`aria-labelledby` or wrapped heading). Focus managed automatically; do not add `role="dialog"`. |
| Tooltip (click) | `<button popovertarget="t">` + `<div id="t" popover>` | B | Hover-with-delay ergonomics not yet standard. | `popover` does not auto-create `aria-describedby`; add manually. `title` attribute invisible to touch + many SR users. |
| Hover tooltip with delay | None Baseline | B/C | Yes — JS for now (`mouseenter` with timeout) until Interest Invoker ships. | Provide focus-equivalent. Honor `prefers-reduced-motion`. |
| Dropdown / menu / popover | `popover` + Anchor Positioning | B | Virtualized menus (1k+), shadow-DOM-isolated, complex nested with dynamic loading. | Anchor positioning still has Safari rough edges and Firefox bug 1993699. Polyfill: oddBird. Add `role="menu"` + `aria-haspopup` for menu semantics. |
| Accordion (independent panels) | `<details><summary>` | A | Almost never. | `<summary>` reports button + `disclosure`. |
| Accordion (exclusive) | `<details name="g">` | B | Almost never. | Keyboard + SR work without ARIA. |
| Tabs | JS still required for true ARIA `tablist`/`tab`/`tabpanel` with arrow keys | — | Lightweight implementation; preferred fallback `<details name>`. | Native tabs on Open UI roadmap, not shipping. |
| Carousel / slider | Scroll-snap (`scroll-snap-type: x mandatory; scroll-snap-align: center`) | A | When `::scroll-button()` / `::scroll-marker` not in target browsers. | `@supports selector(::scroll-button(*))` for enhancement. Container `role="region"` + `aria-label`. |
| Carousel buttons + dots | `::scroll-button(left/right)`, `::scroll-marker`, `:target-current`, `scroll-marker-group: after` | C (Chrome only) | Always for cross-browser. | Native pseudo-elements expose proper button semantics. |
| Sticky header | `position: sticky; top: 0` | A | Animated reveal/hide on scroll direction may need JS or scroll-driven (C). | Verify Safari iOS sticky thead. |
| Smooth scrolling | `html { scroll-behavior: smooth }` or `element.scrollIntoView({behavior:'smooth'})` | A | Custom easing. | Wrap in `@media (prefers-reduced-motion: no-preference)`. |
| Custom scrollbar | `scrollbar-color`, `scrollbar-width`, `scrollbar-gutter: stable` | B (color), A (width/gutter) | Per-element gradient on iOS. | Don't reduce contrast below 3:1. |
| Show/hide toggles | `<details>`, `popover`, `[hidden]`, `:has(:checked)` | A/B | Animated entry/exit needs `@starting-style` (B) or display-discrete transitions. | `[hidden]` removes from a11y tree. |
| Form validation | `required`, `pattern`, `type=email` + `:user-valid`/`:user-invalid` | A (constraint API), B (`:user-valid`) | Cross-field validation, server-side echo. | `<form novalidate>` + JS only when intercepting native messages. Visible error text, not just color. |
| Lazy loading | `<img loading="lazy" decoding="async" width height>` | A | Component-level intersection logic. | Preserve aspect ratio with explicit dimensions. Not for above-fold/LCP. |
| Image-comparison slider | `<input type="range">` driving CSS variable + `clip-path: inset(...)` | A | Two-axis comparisons. | Range gives keyboard for free. |
| Theme switching (dark mode) | `color-scheme: light dark` + `light-dark(a, b)` + `prefers-color-scheme` | B (`light-dark()` Newly) | User-toggle (vs system) needs attribute switch. | `color-scheme` opts UA forms/scrollbars in. Always offer manual override. |
| Animations on scroll | `animation-timeline: view()` / `scroll()` | C (Firefox not shipped May 2026) | Yes — until Firefox lands. IntersectionObserver fallback. | Honor `prefers-reduced-motion`. `@supports (animation-timeline: scroll())`. |
| Page transitions (SPA) | `document.startViewTransition()` + `view-transition-name` | B (same-doc) | Complex orchestration with route-data dependencies. | Skip on `prefers-reduced-motion`. |
| Page transitions (MPA) | `@view-transition { navigation: auto }` | C (Firefox missing) | Yes — instant fallback. | Pair with Speculation Rules. |
| Counters / numeric animation | CSS counters; `@property --num <integer>` + transition | B | Currency, locale-aware numbers. | `aria-live` if value meaningful. |
| Resizable panels | `resize: both` + container queries | A (resize), A (size CQ) | Persist size across reloads (localStorage). | Visible drag handle if corner subtle. |
| Truncation (multi-line) | `line-clamp: N` + legacy `-webkit-line-clamp` for Safari | A (legacy), B (modern shorthand) | "Read more" reflow. | Hidden full text for SR or "show more". |
| Sticky table headers | `thead th { position: sticky; top: 0 }` | A | Cross-browser quirks on collapsed tables. | `<th scope="col">`. |
| Virtual scrolling alternative | `content-visibility: auto; contain-intrinsic-size: 1000px` | B | Truly massive datasets (10k+) needing recycling. | Set `contain-intrinsic-size` close to actual height. |
