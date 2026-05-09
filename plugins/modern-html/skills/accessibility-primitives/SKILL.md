---
name: modern-html-accessibility-primitives
description: "This skill should be used whenever generating interactive UI, focus styles, motion, color, or modal/popover content. Covers focus-visible, focus-within, the inert attribute, prefers-reduced-motion, prefers-color-scheme, prefers-contrast, forced-colors, the accessibility-tree implications of dialog/popover/anchor positioning, and required ARIA labeling for native primitives. Use when: writing focus styles, implementing keyboard navigation, animating UI, picking colors, building modal or popover content, or auditing a component for accessibility. Skip when: working purely on backend code or non-rendered content."
paths: "[\"**/*.{css,scss,html,jsx,tsx,vue,svelte,astro}\"]"
---

# Accessibility Primitives

## `:focus-visible` (甲)

```css
:focus { outline: none; }                      /* 僅免於非鍵焦 */
:focus-visible { outline: 2px solid AccentColor; outline-offset: 2px; }
```

替傳統 `:focus` 樣式。鍵 focus 才示，鼠 click 不示（瀏覽器啟發判定）。

注：`outline: none` 無 `:focus-visible` 配 = a11y 罪。**必配對**。

## `:focus-within` (甲)

```css
.field:focus-within { background: oklch(95% 0 0); }
.menu:focus-within { display: block; }
```

親或後代 focus 即應。配 `:has()` 更靈。

## `inert` (甲, 2025-10 Widely 7月)

```html
<main inert>...</main>
```

效：移自 a11y tree + tab order + 點擊禁。`<dialog>`-modal 自 inert 餘頁。手用：自定 modal、SPA route swap、drawer scrim。

## Reduced motion (甲)

```css
@media (prefers-reduced-motion: no-preference) {
  .hero { animation: fade-in 0.3s; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

律：opt-**in** to motion (no-preference 內加)。**勿** opt-out。安於 UA default 為 reduce、用戶後設者。

JS：`window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

## `prefers-color-scheme` (甲)

見 `theming-and-color/SKILL.md`. 配 `light-dark()` 雙保。

## `prefers-contrast` (甲)

```css
@media (prefers-contrast: more) {
  :root { --bg: #fff; --fg: #000; --brand: #003eb3; }
  .border-subtle { border-color: currentColor; }
}
```

## `forced-colors` (甲)

```css
@media (forced-colors: active) {
  .btn-icon::before { forced-color-adjust: auto; }
  .decorative { display: none; }
}
```

system colors：`ButtonText ButtonFace LinkText Canvas CanvasText Highlight HighlightText`.
Windows High Contrast + Forced Colors 模式皆用。

## ARIA-related rules

### `<dialog>` modal
- 必 `aria-labelledby` 指 inner heading id；或 `aria-label`。
- **勿** `role="dialog"`。
- focus auto-trap，餘頁 inert。
- close 經 `<form method="dialog">`、`dialog.close()`、ESC（`requestClose()` 觸 cancel）。

### Popover
- **不**自連 trigger ↔ popover。手加 `aria-describedby`（tooltip 語）或 `aria-controls` + `aria-haspopup`（menu 語）。
- popover **不** inert 餘頁（非模）。
- ESC + click-outside 已內建（`popover=auto`）。

### Anchor positioning
- 不創 DOM/reading-order 關係。popover 仍應為 trigger 之 a11y 鄰 — 或 DOM 子，或 ARIA 連。

### Tabs
- 原生無。完整 ARIA：
  - container `role="tablist"` + `aria-label`.
  - tab `role="tab"` `aria-selected="true|false"` `aria-controls="panel-id"` `tabindex="0|-1"` (roving).
  - panel `role="tabpanel"` `aria-labelledby="tab-id"` `tabindex="0"`.
- 鍵：←→ 切 tab，Home/End 跳，Enter/Space 啟。

### Accordion (`<details>`)
- 已 button + disclosure role。**勿** ARIA 覆。
- 互斥 `<details name="g">` 仍鍵盤 + SR 通。

## Visible focus + colors

- focus indicator contrast ≥ 3:1 vs adjacent。
- text contrast ≥ 4.5:1（小字）/ 3:1（大字 ≥ 18.66px bold 或 24px regular）。
- non-text UI：≥ 3:1。
- `accent-color` 改 native control 色 — 仍須驗 contrast。

## Touch targets

≥ 24×24 CSS px (WCAG 2.2 SC 2.5.8 minimum)。豪選 ≥ 44×44 (Apple HIG)。
`padding` 或 `min-block-size`/`min-inline-size` 達標。

## Reading order / tab order

- DOM 序 = SR 序 = tab 序。`tabindex` 改變應極稀。
- `flex-direction: row-reverse`、`grid` 重排 — 視覺與 DOM 異。慎。
- popover / dialog 在 top-layer，但 a11y tree 仍依 DOM 連。

## 反模式

- `outline: 0` 無 `:focus-visible` 配對。
- `tabindex > 0` — 破自然序。
- color-only 信號（紅綠盲不見）。配 icon / 文。
- `aria-hidden="true"` 於可 focus 元素 — 焦至不可名。
- 自製 dropdown 無鍵盤 — 試 `popover` 先。
- 動畫無 `prefers-reduced-motion` 守。
