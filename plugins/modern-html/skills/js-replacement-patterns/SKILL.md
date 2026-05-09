---
name: modern-html-js-replacement-patterns
description: "This skill should be used when the agent considers writing or recommending JavaScript for a UI pattern. It looks up native HTML/CSS replacements and recommends the simplest native solution. Covers modal, tooltip, popover, dropdown, accordion, tabs, carousel, sticky header, smooth scroll, custom scrollbar, show/hide toggles, form validation, lazy loading, image comparison, theme switching, scroll animations, page transitions, line clamp, sticky table headers, and virtual scrolling alternatives. Use when: replacing or evaluating Floating UI, Popper, Headless UI, Radix, Reach, Tippy, Swiper, GSAP, Framer Motion, or IntersectionObserver-based libraries; building modal, tooltip, dropdown, menu, accordion, tabs, carousel, sticky, scroll-effect, or form-validation UI; removing JS dependencies from a frontend. Skip when: writing backend code or working on a domain with no UI surface."
when_to_use: "\"replacing JS UI library, building modal/tooltip/dropdown/menu/accordion/tabs/carousel/sticky/scroll-effect/form-validation, removing dependencies\""
---

# JS Replacement Patterns

宗旨：先原生，後 JS。每模式查階後施。

## 硬律 — 永用原生

- modal → `<dialog>` + `showModal()`。**勿** 自造 `role="dialog"` div。
- accordion → `<details><summary>`。獨開組 → `<details name="g">`。
- lazy load → `<img loading="lazy" decoding="async" width height>`。
- sticky header → `position: sticky; top: 0`。
- smooth scroll → `html { scroll-behavior: smooth }`。守 `prefers-reduced-motion`.
- form validation → `required pattern type=email` + `:user-valid` / `:user-invalid`。
- truncate → `line-clamp: N`（or legacy `-webkit-line-clamp` for Safari）。
- image compare → `<input type=range>` 驅 `--p` var, `clip-path: inset(...)`。
- carousel → scroll-snap container。
- show/hide → `<details>` 或 `[hidden]` 或 `:has(:checked)`。
- 暗色 → `color-scheme: light dark` + `light-dark(a,b)` + `prefers-color-scheme`.

## 決策矩陣

| 模式 | 原生 | 階 | JS 仍需 |
|---|---|---|---|
| Modal | `<dialog>`+`showModal()` | 甲 | 多步嚮導；非模 stack 管 |
| Tooltip (click) | `popover` attr | 乙 | hover-delay (Interest Invoker 未發) |
| Tooltip (hover delay) | 無 | 乙/丙 | 是 — 須 JS 至 Interest Invoker 發 |
| Dropdown / Menu | `popover` + anchor | 乙 | 虛擬 1k+ 項；shadow-DOM 隔；嵌套動加載 |
| Accordion (獨立) | `<details>` | 甲 | 幾乎不需 |
| Accordion (互斥) | `<details name>` | 乙 | 幾乎不需 |
| **Tabs** | **無原生** | — | **是 — 須完整 ARIA tablist + 箭頭鍵 + roving tabindex**。可降級為 `<details name>` |
| Carousel | scroll-snap | 甲 | `::scroll-button` 未跨瀏 |
| Carousel buttons/dots | `::scroll-button` `::scroll-marker` | 丙 (Chrome only) | 是 — 跨瀏需 |
| Sticky header | `position: sticky` | 甲 | 滾向動隱顯需 JS 或 scroll-driven (丙) |
| Smooth scroll | `scroll-behavior` | 甲 | 自定 ease |
| Custom scrollbar | `scrollbar-color/width/gutter` | 乙/甲 | 漸變每元 iOS |
| Show/hide | `<details>` `[hidden]` `:has(:checked)` | 甲/乙 | 進出動需 `@starting-style` (乙) |
| Form validate | constraint API + `:user-valid` | 甲/乙 | 跨欄；server echo |
| Lazy load | `loading="lazy"` | 甲 | 元件級 IO 邏輯 |
| Image compare | `range` + `clip-path` | 甲 | 雙軸對比 |
| Theme switch | `color-scheme` + `light-dark()` | 乙 | 用戶 toggle vs 系統 → 屬性切換 `[data-theme=dark]` |
| Scroll animation | `animation-timeline` | **丙** (Firefox 未) | 是 — IO fallback 必 |
| Page trans (SPA) | `startViewTransition()` | 乙 | 路由數據依賴 |
| Page trans (MPA) | `@view-transition` | 丙 (Firefox 未) | 是 — instant fallback |
| Counter / number anim | counters; `@property --num` | 乙 | 貨幣 / locale |
| Resizable panels | `resize: both` + CQ | 甲 | localStorage 持久 |
| Truncate | `line-clamp` | 甲/乙 | "Read more" 重排 |
| Sticky thead | `thead th { position: sticky }` | 甲 | collapsed table quirks |
| Virtual scroll | `content-visibility: auto` | 乙 | 真海量 (10k+) 需 recycle |

## A11y 守則

- `<dialog>`：必 `aria-labelledby` 或內含標題。**勿** 加 `role="dialog"`。
- popover：**不**自連 `aria-describedby` 至 trigger，須手加。
- accordion：`<summary>` 已報 `disclosure` role，勿覆 ARIA。
- tabs：原生無，必完整 `role="tablist|tab|tabpanel"` + 箭鍵 + roving tabindex。
- 動畫：包 `@media (prefers-reduced-motion: no-preference)` 之內 (opt-in)。

## 反模式

詳見 `native-html-primitives/SKILL.md` § Anti-Patterns。

## Refs

- `references/decision-matrix.md` — 全表細注。
