---
name: scroll-and-motion
description: "This skill should be used when implementing scroll snapping, scroll-driven animations, view transitions (same-document or cross-document), sticky elements, smooth scrolling, page transitions, or carousels. Covers scroll-snap-type, scroll-behavior, animation-timeline scroll() and view(), document.startViewTransition, view-transition-name, view-transition-class, @view-transition for MPA, ::scroll-button() and ::scroll-marker, and prefers-reduced-motion gating. Use when: building a carousel, slideshow, or snap scroller; animating page transitions in SPA or MPA contexts; reacting to scroll position with effects; building sticky headers with reveal/hide behavior. Skip when: the page has no scrollable region or no animation requirements, or the user has explicitly disabled motion features."
paths: ["**/*.{css,scss,html,jsx,tsx,vue,svelte,astro}"]
---

# Scroll and Motion

## Scroll-snap (甲)

```css
.carousel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 1rem; }
.carousel > * { flex: 0 0 100%; scroll-snap-align: center; }
```

值：
- `scroll-snap-type: x mandatory | proximity` — 軸 + 強度。
- `scroll-snap-align: start | center | end`.
- `scroll-snap-stop: always` — 強單步。

a11y：scroll container 加 `role="region"` + `aria-label`。

## Smooth scroll (甲)

```css
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
```

或 JS：`element.scrollIntoView({ behavior: 'smooth' })`.

## Sticky (甲)

```css
.header { position: sticky; top: 0; z-index: 10; }
thead th { position: sticky; top: 0; }
```

注：Safari iOS 上 `<table>` collapsed border + sticky thead 偶 bug，驗之。

## Same-document view transitions (乙, 2025-10 Widely)

```js
function update(callback) {
  if (!document.startViewTransition) return callback();
  document.startViewTransition(callback);
}
```

```css
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root),
  ::view-transition-new(root) { animation-duration: 0.2s; }
}

.hero { view-transition-name: hero; }
```

`view-transition-class` (乙)：
```css
.card { view-transition-class: card; }
::view-transition-group(.card) { animation: ...; }
```

## Cross-document view transitions (丙, Firefox 未發)

```css
@view-transition { navigation: auto; }
```

必 fallback：Firefox 即 instant nav。配 Speculation Rules 加速。

## Scroll-driven animations (丙, 2026-05 Firefox 仍 disabled by default)

```css
@supports (animation-timeline: scroll()) {
  .progress { animation: progress linear; animation-timeline: scroll(); }
  @keyframes progress { from { width: 0; } to { width: 100%; } }
}
```

JS fallback (IO)：
```js
const io = new IntersectionObserver((es) => {
  for (const e of es) e.target.classList.toggle('in', e.isIntersecting);
});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
```

`animation-timeline: view()` — 元素入視動畫。
`scroll-timeline-name` / `view-timeline-name` — 多時間軸。

## 原生 carousel buttons (丙, Chrome 135+ only)

```css
@supports selector(::scroll-button(*)) {
  .carousel { scroll-marker-group: after; }
  .carousel::scroll-button(left)  { content: "←" / "Previous"; }
  .carousel::scroll-button(right) { content: "→" / "Next"; }
  .carousel > *::scroll-marker {
    content: ""; width: 10px; height: 10px;
    border-radius: 50%; background: #ccc;
  }
  .carousel > *::scroll-marker:target-current { background: currentColor; }
}
```

跨瀏需 JS 補。

## `@starting-style` + discrete animations (乙, 2024-08)

進出動畫從 `display: none`：

```css
.modal {
  opacity: 0;
  transition: opacity 0.2s, display 0.2s allow-discrete, overlay 0.2s allow-discrete;
}
.modal.open { opacity: 1; display: block; }
@starting-style {
  .modal.open { opacity: 0; }
}
```

三件齊：
1. `@starting-style { ... }` — 入態起點。
2. `transition-behavior: allow-discrete` 或 transition list 含 `display 0.2s allow-discrete`。
3. transition 列表含 `display`（top-layer 加 `overlay`）。

缺一則靜默失敗。

## 守則

- 一切動畫包 `@media (prefers-reduced-motion: no-preference) { ... }`（opt-in）。
- `forced-colors: active` 下 disable 裝飾動畫。
- LCP 元素勿動畫 transform。

## Refs

- `examples/scroll-snap.css`
- `examples/view-transitions.css`
- `examples/scroll-driven.css`
