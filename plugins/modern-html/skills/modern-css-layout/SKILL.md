---
name: modern-css-layout
description: "This skill should be used when designing responsive layouts, component-driven sizing, conditional styles based on parent state, or grid/subgrid alignment. Covers container queries (size and style), container query units (cqw, cqh, cqi, cqb), subgrid, and the :has() relational selector. Use when: building cards, sidebars, dashboards, or responsive components; aligning grandchild rows across siblings; styling parents conditionally based on descendants; replacing viewport media queries with component-aware queries. Skip when: working on a static or single-viewport layout with no component reuse, or when the project mandates only Baseline-Widely-3yr features."
paths: ["**/*.{css,scss,sass,less,html,jsx,tsx,vue,svelte,astro}"]
---

# Modern CSS Layout

## Container queries (甲, size queries 2025-08)

```css
.card { container-type: inline-size; }
@container (min-width: 24rem) {
  .card__inner { display: grid; grid-template-columns: 8rem 1fr; gap: 1rem; }
}
```

何時用：元件多處復用，受父寬制。媒體查詢以視口為據，不知元件實寬。

`container-type` 值：
- `inline-size` — 查 inline 軸。多用。
- `size` — 查雙軸。需明 `block-size`。
- `normal` — 默。僅 style queries。

`container-name` 命名：
```css
.sidebar { container: nav / inline-size; }
@container nav (min-width: 12rem) { ... }
```

## Container query units

`cqw cqh cqi cqb cqmin cqmax` — 替 `vw vh` 於 card 內。

```css
@container (min-width: 20rem) {
  .card h2 { font-size: clamp(1rem, 4cqi, 1.5rem); }
}
```

## Style queries (乙)

```css
@container style(--theme: dark) { ... }
```

僅 custom property 值。Element 質詢仍 限。

## 無限環陷阱

`container-type: inline-size` 於 A，再 `@container` 改 A 之寬 → 環。律：query 元素之 `container-type` 須置於 **父**，且該軸不依子內容尺寸。

## Subgrid (乙, 2026-03 Widely)

何時用：grid 之足，僅子需父之 tracks。
何時須 subgrid：**孫**須跨 sibling 對齊（card 行：title 行 + desc 行 + footer 行齊一線）。

```css
.cards { display: grid; grid-template-columns: repeat(3, 1fr);
         grid-template-rows: auto auto auto; gap: 1rem; }
.card { display: grid; grid-row: span 3; grid-template-rows: subgrid; }
```

注：軸獨立指定 — `grid-template-columns: subgrid` 與 `-rows: subgrid` 各。

## `:has()` (乙, Widely ~2026-06)

```css
.card:has(img) { padding: 0; }
.label:has(+ input:focus) { color: var(--brand); }
form:has(:invalid) button[type=submit] { opacity: 0.5; }
```

性能：避 `body:has(.modal-open)` 之全域查。優先 `:has(> ...)` 直子勝後代。引擎已優多模式。

## 漸進式 layout

層次：
1. flex 為基（gap 甲 2024）。
2. grid 為塊（甲）。
3. subgrid 為對齊（乙）。
4. CQ 為元件響應（甲）。
5. `:has()` 為條件樣（乙）。

## 反模式

- container query 上元件自身。
- subgrid 用於 grid 即足之地。
- `:has(*)` 全選。
- viewport unit 於元件內（用 cqi 替）。

## Refs

- `examples/container-queries.css`
- `examples/subgrid.css`
- `examples/has.css`
