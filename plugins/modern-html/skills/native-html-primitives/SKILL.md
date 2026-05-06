---
name: native-html-primitives
description: "This skill should be used when generating modal dialogs, popovers, tooltips, accordions, disclosure widgets, search landmarks, lazy images, or button-driven UI commands. Teaches the dialog element (showModal, ::backdrop, requestClose), the Popover API (popover attribute, popovertarget, popovertargetaction, popover=auto/manual/hint), details/summary with the name attribute for exclusive accordions, the search element, the inert attribute, lazy loading attributes, and the new command/commandfor invoker buttons. Use when: writing dialog/modal/confirm UI, building tooltips or dropdowns, building FAQ or accordion UI, adding a search landmark, deferring offscreen images, or wiring buttons to control popovers or dialogs. Skip when: working entirely in CSS-only files or in non-HTML contexts."
paths: ["**/*.{html,htm,jsx,tsx,vue,svelte,astro,mdx,erb,php}"]
---

# Native HTML Primitives

## `<dialog>` (甲)

```html
<button command="show-modal" commandfor="confirm-dlg">Delete</button>
<dialog id="confirm-dlg" aria-labelledby="dlg-title">
  <h2 id="dlg-title">Delete this item?</h2>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="confirm" autofocus>Delete</button>
  </form>
</dialog>
```

要點：
- `showModal()` 自 trap focus、inert 餘頁。`show()` 非模。
- `dialog::backdrop` 樣 scrim。
- `aria-labelledby` 必。**勿** 加 `role="dialog"`。
- `requestClose()` 觸 cancel event (乙, 2025)。
- `command="show-modal" commandfor="..."` 是乙 (2025-12)。甲替：JS `dlg.showModal()`。

## Popover API (乙, 2025-01)

```html
<button popovertarget="help">?</button>
<div id="help" popover>Help text</div>
```

`popover` 值：
- `auto` (default) — light-dismiss + ESC + 一次一 popover/scope。
- `manual` — 手控。
- `hint` — 丙 (Interop 2026)。

注：popover **不**自設 `aria-describedby`。手加之。
iOS 早期 light-dismiss bug 已修於 Safari 18.3。

## Invokers `command` / `commandfor` (乙, 2025)

替 `popovertarget` 之更廣語義：

```html
<button command="show-modal" commandfor="dlg">Open</button>
<button command="close" commandfor="dlg">X</button>
<button command="toggle-popover" commandfor="menu">≡</button>
```

值：`show-modal`、`close`、`toggle-popover`、`show-popover`、`hide-popover`。

## `<details>` / `<summary>` (甲)

獨立：
```html
<details><summary>Q1</summary><p>A1</p></details>
<details><summary>Q2</summary><p>A2</p></details>
```

互斥（乙, 2025-04 Firefox 130）：
```html
<details name="faq"><summary>Q1</summary>...</details>
<details name="faq"><summary>Q2</summary>...</details>
```

a11y：`<summary>` 自報 button + `disclosure` role。勿覆 ARIA。

## `<search>` (甲, 2026-04)

```html
<search>
  <form>...</form>
</search>
```

語義 landmark。免 `role="search"`。

## `inert` (甲)

```html
<main inert>...</main>
```

移自 a11y tree + tab order。modal `<dialog>` 自 inert 餘頁，故無需手 inert。手用於 SPA 路由切換、自定 modal scrim。

## Lazy load (甲)

```html
<img src="..." loading="lazy" decoding="async" width="800" height="600" alt="...">
<iframe src="..." loading="lazy"></iframe>
```

必 `width`/`height` 防 CLS。**勿** lazy LCP / above-fold。

## Anti-patterns

1. unlabeled `<dialog>` — SR 報 "dialog" 無 context。
2. `title` attribute as tooltip — touch + 多 SR 不見。
3. popover 無 anchor fallback — 不支則居中於文檔。
4. 加 `role="dialog"` 於 `<dialog>` — 重複。
5. ARIA `accordion` 加於 `<details>` — 已具語義，覆則破。
6. tabs 用 `<details>` — 非語義 tabs；須 ARIA `tablist`。
7. `popover` 與 `<dialog>` 混用無協調 — 二者皆 top-layer，疊序須慎。
8. 動畫 `display:none` 缺三件 — 必 `@starting-style` + `transition-behavior: allow-discrete` + `display`/`overlay` in transition list。

## Refs

- `examples/dialog.html`
- `examples/popover-anchor.html`
- `examples/details-accordion.html`
- `examples/invokers.html`
- `references/a11y-notes.md`
