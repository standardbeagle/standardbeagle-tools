# Tier C — Avoid or use only with explicit fallback (Limited availability May 2026)

| Feature | Status | Why C |
|---|---|---|
| Customizable `<select>` (Open UI) | Limited (Chrome only at flag/early stable) | MDN: "not Baseline because it does not work in some of the most widely-used browsers." JS frameworks block / SSR hydration fail. |
| `::scroll-button()`, `::scroll-marker`, `::scroll-marker-group` | Limited — Chrome 135+ / Edge 135+ only | Native carousels not Baseline. JS fallback or `@supports selector(::scroll-button(*))` enhancement. |
| Cross-document view transitions (`@view-transition { navigation: auto }`) | Limited — Chrome 126+, Edge, Safari 18.2+; Firefox no support | Interop 2026. Provide non-animated fallback. |
| `text-wrap: pretty` | Limited (no Firefox) | Use `balance` or default. |
| `text-wrap: avoid-short-last-lines` | Limited | No engine ships stable. |
| `field-sizing: content` | Limited (Chrome+Safari, no Firefox stable) | Interop 2026. Progressive enhancement only — fallback fixed sizing, no breakage. |
| `corner-shape` (`superellipse(...)`) | Limited (Chrome only) | |
| CSS Houdini Paint Worklet | Limited (Chrome/Edge only) | Experimental. |
| Sibling functions (`sibling-index()`, `sibling-count()`) | Limited (Chrome+Safari, Firefox in progress) | Use `nth-child` for now. |
| CSS Mixins (`@mixin`, `@apply`) | Limited (Chrome 146 expected 2026) | Pre-processor still mandatory. |
| Interest Invoker (`interesttarget`, `interest-delay`) | Limited / experimental | Hover tooltip with delay. |
| `popover="hint"` | Limited — Interop 2026 | Use `popover="manual"` + JS fallback. |
| `<input type="datetime-local">` styling pseudo-elements | Inconsistent | UA-styling gotcha. |
| `selectlist` element | Limited (in development) | Spec name shifted to "customizable select". |
| Scroll-driven animations (`animation-timeline: scroll()` / `view()`) | Limited — Firefox 150 (Apr 2026) still disabled by default | Interop 2026. `@supports` + IntersectionObserver fallback. |

**Rule**: never the primary implementation. Choose one of:
1. JS fallback documented inline.
2. `@supports`-gated progressive enhancement on top of a Tier-A base.
3. Skip the feature entirely.
