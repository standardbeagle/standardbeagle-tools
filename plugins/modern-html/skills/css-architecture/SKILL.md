---
name: modern-html-css-architecture
description: "Cascade layers (@layer), @scope at-rule, native CSS nesting for stylesheet structure, specificity, component scoping, replacing BEM/CSS-Modules. Use when: new design system, migrating off Sass mixins, organizing token layers, specificity battles, scoping component CSS sans build step. Skip: single-file demo or prototype, architecture overhead not worth it."
paths: "[\"**/*.{css,scss,sass,less}\"]"
---

# CSS Architecture

## `@layer` (甲, 2024-09 Widely)

層序定先，內中 specificity 自然。

```css
@layer reset, tokens, base, layout, components, utilities, overrides;

@layer reset { *, *::before, *::after { box-sizing: border-box; } }
@layer tokens { :root { --brand: oklch(60% 0.18 250); } }
@layer base { body { font-family: system-ui; } }
@layer components { .button { ... } }
@layer utilities { .mt-4 { margin-top: 1rem; } }
```

要點：
- 層**之間** 後勝先，無視 specificity。
- 層**內** specificity 仍計：`.button.button--primary` 勝 `.button` 同層。
- 未分層樣式勝任何層。
- `!important` 反序：層內外皆。

層名可前後聲明：
```css
@layer reset, tokens; /* 序定 */
@layer reset { ... } /* 後填 */
```

## `@scope` (乙, 2025-12 Firefox 146)

替 BEM / CSS Modules 多用例。

獨立形：
```css
@scope (.card) {
  :scope { padding: 1rem; }
  h3 { margin: 0 0 .5rem; }
  a { color: var(--brand); }
}
```

加 limit（後代但不過 limit）：
```css
@scope (.card) to (.card__nested) {
  h3 { ... } /* 不及嵌套 .card__nested 內 */
}
```

嵌入 stylesheet：
```html
<style>
  @scope { :scope { ... } }
</style>
```

注：`@scope` 限樣式於 root 後代，**非** isolation。仍受 cascade。

## 原生 nesting (乙, 2026-02 Widely)

```css
.card {
  padding: 1rem;
  & > h2 { margin: 0; }
  &:hover { box-shadow: ... }
  & a { color: var(--brand); &:hover { text-decoration: underline; } }
  @media (min-width: 40rem) { & { padding: 2rem; } }
}
```

律：
- 複合 selector 必前 `&`：`& a`、`&.active`、`& > .child`。
- 元素 selector 直書亦可：`a` 等價 `& a`（規範 2024 修正後）。
- `@media` 內須 `& { ... }` 包當前 selector 規則。

## 三合用

```css
@layer components {
  @scope (.card) to (.card__nested) {
    :scope { padding: 1rem; border-radius: .75rem; container-type: inline-size; }
    h3 { margin: 0 0 .5rem; }
    a {
      color: var(--brand);
      &:hover { text-decoration: underline; }
    }
    @container (min-width: 24rem) {
      :scope { padding: 1.5rem; }
    }
  }
}
```

## Sass 替代

| Sass | Native |
|---|---|
| nesting | native nesting |
| `@use` modules | `@layer` 分區 |
| BEM `__elem` | `@scope` |
| `lighten()` `darken()` | `color-mix(in oklch, var(--c), white 20%)` |
| variables | `--custom-property` |
| **mixins** | **無** — 仍須 Sass / PostCSS / Lightning CSS |
| `@extend` | `:is(.a, .b) { ... }` 多用例 |

## 反模式

- 期 `@layer` 改層內 specificity（不改）。
- 嵌套深過 3 級。
- `@scope` 用於 isolation（仍 cascade）。
- `!important` 解決 layer order（反序，更糟）。

## Refs

- `examples/layers.css`
- `examples/scope.css`
- `examples/nesting.css`

## Related

- `modern-html:baseline-decision-protocol` — 前置 Tier A/B/C 閘；先判可用層，再取此技各特性。
- `modern-html:theming-and-color` — 色彩 / 主題層依此架構落位，配對取用。
