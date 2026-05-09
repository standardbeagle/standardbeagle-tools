---
name: modern-html-native-form-controls
description: "This skill should be used when building forms, inputs, validation messages, color or date or range pickers, or auto-sizing text fields. Covers native constraint validation (required, pattern, type-specific inputs), :user-valid and :user-invalid pseudo-classes, accent-color, color-scheme on form elements, customizable select status (Limited - avoid as primary), and field-sizing: content (Limited - progressive enhancement only). Use when: building login, signup, search, or data-entry forms; styling validation states; tinting checkboxes/radios/range/progress; needing auto-grow textareas; replacing JS form libraries. Skip when: working on read-only display surfaces with no input controls."
paths: "[\"**/*.{html,jsx,tsx,vue,svelte,astro,erb,php}\"]"
---

# Native Form Controls

## Constraint validation (甲, 2025-09 Widely)

```html
<form>
  <label>Email <input type="email" required></label>
  <label>Phone <input type="tel" pattern="[0-9-]{10,}"></label>
  <label>Age <input type="number" min="13" max="120" required></label>
  <button>Submit</button>
</form>
```

屬性：`required pattern min max minlength maxlength step type`.
類型：`email url tel number date time datetime-local month week color range`.

JS 介面：
- `form.checkValidity()` → bool。
- `form.reportValidity()` → bool + UI 報。
- `input.setCustomValidity('msg')` → 自定錯。
- `input.validity` → ValidityState。
- `'invalid'` event 於提交無效時。

## `:user-valid` / `:user-invalid` (乙, 2026-04 Widely ~1月)

優於 `:valid` / `:invalid` —  待用戶交互後才應，避初載即紅。

```css
input:user-invalid { border-color: oklch(55% 0.2 25); }
input:user-valid   { border-color: oklch(55% 0.2 145); }
input:user-invalid + .err { display: block; }
```

`<form novalidate>` + 自定 UI 時：JS 仍可問 `input.validity.valueMissing`。

## `accent-color` (甲, 2025)

```css
:root { accent-color: oklch(60% 0.18 250); }
```

染：`<input type=checkbox|radio|range>` `<progress>`。OS-honored. 一行省百行。

## `color-scheme` (甲) + form 對齊

```css
:root { color-scheme: light dark; }
```

UA 表單控件 + scrollbar 即從系統色。配 `light-dark()` 自定色。

## Customizable `<select>` (丙) — 避作主

MDN 警告："This feature is not Baseline because it does not work in some of the most widely-used browsers." 部分 JS framework block / SSR hydration fail。

```css
/* 漸進增強，僅支持瀏 */
@supports (appearance: base-select) {
  select, ::picker(select) { appearance: base-select; }
}
```

主用：傳統 `<select>` + 自定 wrapper，或 popover-based menu（仍乙）。

## `field-sizing: content` (丙, Firefox stable 未) — 漸進

```css
textarea, input {
  field-sizing: content;
  min-inline-size: 10ch;
  max-inline-size: 60ch;
  min-block-size: 3lh;
}
```

不支瀏：固定尺寸 fallback（`min-*` 已給合理 default）。

## Date / time / color / range

```html
<input type="date" min="2024-01-01" max="2026-12-31">
<input type="time" step="900">           <!-- 15分 step -->
<input type="datetime-local">
<input type="color" value="#3344ff">
<input type="range" min="0" max="100" step="5" value="50" aria-label="Volume">
```

注：UA UI 不一。styling pseudo-elements (e.g. `::-webkit-calendar-picker-indicator`) 不一致 — 勿依賴。

## A11y 守則

- `<label>` 必，包 input 或 `for`+`id`。
- 錯訊：`aria-describedby` 連 input 至錯文字。勿僅靠色（contrast 3:1+）。
- `aria-invalid="true"` 於失敗 input。
- group 用 `<fieldset>` + `<legend>`。
- required field：`required` 自報，可加 `aria-required="true"` 為冗餘明示。

## 反模式

- `:invalid` 紅圈在初載。改 `:user-invalid`。
- 自製 `<div role="combobox">` 取代 `<select>` — 鍵盤 + a11y 多誤。先試 popover + button。
- 阻 native validation UI 而無自訊 — 失能無聲。

## Refs

- `examples/validation.html`
