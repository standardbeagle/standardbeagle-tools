---
name: performance-and-containment
description: "This skill should be used when optimizing long lists, articles, dashboards, or pages with many off-screen elements. Covers content-visibility: auto, contain-intrinsic-size, the contain property, will-change discipline, and using container queries to reduce layout thrash. Use when: rendering long article archives, chat logs with many messages, infinite-scroll feeds, dashboards with off-screen widgets, or before reaching for virtual-scrolling libraries. Skip when: page content is short, fully above-the-fold, or already heavily virtualized by an existing framework component."
paths: ["**/*.{css,scss,html,jsx,tsx,vue,svelte,astro}"]
---

# Performance and Containment

## `content-visibility: auto` (乙, 2025-09)

```css
article { content-visibility: auto; contain-intrinsic-size: 1000px 800px; }
.message { content-visibility: auto; contain-intrinsic-size: auto 200px; }
```

效：屏外元素 skip render。引擎以 `contain-intrinsic-size` 占位防 layout shift。

`contain-intrinsic-size` (甲, 2026-03 Widely)：
- `1000px 800px` — width + height 固定。
- `auto 200px` — 入視後記實尺寸。
- `auto` 無備用 — 0 占位，scroll jump。

## `contain` (甲)

```css
.card { contain: layout style; }
.feed { contain: paint; }      /* clip overflow render */
.widget { contain: strict; }   /* layout style paint size */
```

值：
- `size` — 子不影親 size。需顯尺寸。
- `layout` — 內 layout 不影外。
- `style` — counters/quotes 不漏。
- `paint` — 子繪不出邊。
- `strict` = size + layout + paint + style.

何時用：獨立 widget、card、message、log entry — 引擎可隔。

## `will-change` 律

```css
.element:hover { will-change: transform; }   /* 即用即去 */
```

**勿** 全域 `will-change: transform` — 創 GPU layer 持久，記憶體腫。
僅於 imminent change 加，change 後移。或於 `:hover` `:focus` triggers。

## `aspect-ratio` (甲) 防 CLS

```css
img, video { aspect-ratio: attr(width) / attr(height); }   /* attr() 限值 */
.thumb { aspect-ratio: 16 / 9; }
```

`<img width height>` 屬性即 UA 算 aspect-ratio，配 lazy load。

## CQ 減 layout thrash

CQ 元素內 `@container` 規則僅影自身 layout subtree，引擎可 skip 餘樹。媒體查詢 trigger 全頁 recalc。

## 真虛擬 scroll 何時須

`content-visibility` 解 90% 案例。仍須真虛擬 (recycle) 於：
- 10k+ 行 + 複雜每行 cell。
- 動態高度且不可預估。
- DOM 限制（IE? 無；舊 Safari iOS 偶 `contain` glitch）。

否則先試 CSS-only。

## 圖像

```html
<img src="..." srcset="...-400.jpg 400w, ...-800.jpg 800w, ...-1600.jpg 1600w"
     sizes="(min-width: 60rem) 800px, 100vw"
     loading="lazy" decoding="async"
     width="800" height="600" alt="..."
     fetchpriority="auto">
```

LCP 圖：`fetchpriority="high"` + **勿** lazy。
above-fold + `<link rel="preload" as="image" imagesrcset="...">` 加速。

## CSS 性能反模式

- universal selector 後重 selector（`* + *`）— 大樹下慢。
- `:has()` 全域: `body:has(.x)` — engine 全樹查。scope 之。
- 大 box-shadow / blur 全頁 — paint 重。`backdrop-filter` 內含。
- 過多 `@keyframes` 持運 — battery / CPU 重。
- 動 `top` `left` 而非 `transform` — layout / paint 重。

## Refs

- `examples/content-visibility.css`
