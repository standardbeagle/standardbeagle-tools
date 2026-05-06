---
name: theming-and-color
description: "This skill should be used when implementing dark mode, color tokens, accessible color palettes, or dynamic color generation. Covers color-scheme, light-dark(), prefers-color-scheme, oklch() and oklab(), color-mix(), relative color syntax, @property for animatable color tokens, and how to gate Newly-available color features behind @supports. Use when: building a dark mode toggle, defining brand color tokens, generating tonal scales, animating colors smoothly, or interpolating between brand and neutral colors. Skip when: the project mandates only sRGB hex colors or no theming is in scope."
paths: ["**/*.{css,scss,sass,less,html,jsx,tsx,vue,svelte,astro}"]
---

# Theming and Color

## `color-scheme` (甲)

```css
:root { color-scheme: light dark; }
[data-theme="light"] { color-scheme: light; }
[data-theme="dark"]  { color-scheme: dark; }
```

效：UA 表單 + scrollbar + `light-dark()` 從系統 / override。**必聲** 否則 `light-dark()` 失靈。

## `light-dark()` (乙, 2024-05 Newly)

```css
:root {
  color-scheme: light dark;
  --bg: light-dark(#fff, #111);
  --fg: light-dark(#111, #f5f5f5);
  --brand: light-dark(oklch(55% 0.2 250), oklch(75% 0.18 250));
}
body { background: var(--bg); color: var(--fg); }
```

無 `color-scheme` 則默 light。

## `prefers-color-scheme` (甲)

```css
@media (prefers-color-scheme: dark) {
  :root { --bg: #111; --fg: #eee; }
}
```

`light-dark()` 已自應。手動 toggle 需 attribute switch (`[data-theme]`)。

## `oklch()` / `oklab()` (乙, 2025-11 Widely 6月)

```css
:root {
  --brand:    oklch(60% 0.18 250);
  --brand-2:  oklch(70% 0.18 250);  /* 同 hue/chroma，淺 */
  --brand-3:  oklch(50% 0.18 250);  /* 深 */
  --danger:   oklch(55% 0.22 25);
  --success:  oklch(55% 0.18 145);
}
```

優：感知一致。同 chroma 不同 hue 視覺等亮。
注：高 chroma + 暗主題易 sRGB out-of-gamut clip。chroma ≤ 0.2 安全於通用 UI。
驗於 `oklch.com` picker。

## `color-mix()` (乙, 2025-11 Widely 6月)

```css
.btn { background: color-mix(in oklch, var(--brand), white 20%); }
.btn:hover { background: color-mix(in oklch, var(--brand), black 10%); }

/* alpha 混 */
--glass: color-mix(in oklab, var(--bg) 80%, transparent);

/* relative color (Newly) */
--brand-soft: oklch(from var(--brand) 95% 0.04 h);
```

color space：`in oklch | oklab | srgb | hsl | lab | lch`. **首選 `oklch`** 為感知一致。

## Relative color syntax (乙)

```css
:root {
  --brand: oklch(60% 0.18 250);
  --brand-fade:  oklch(from var(--brand) l c h / 0.5);
  --brand-bright: oklch(from var(--brand) calc(l + 15%) c h);
}
```

## `@property` (乙, 2024-07)

custom property 動畫之必：

```css
@property --num {
  syntax: '<integer>';
  inherits: false;
  initial-value: 0;
}
.counter { transition: --num 1s; --num: 0; }
.counter.go { --num: 100; }
.counter::after { content: counter(num); counter-reset: num var(--num); }
```

色動畫：
```css
@property --tint {
  syntax: '<color>';
  inherits: true;
  initial-value: transparent;
}
```

## `forced-colors` (甲)

```css
@media (forced-colors: active) {
  .btn { border: 1px solid ButtonText; background: ButtonFace; color: ButtonText; }
}
```

system colors：`Canvas CanvasText LinkText VisitedText ButtonFace ButtonText Field FieldText Highlight HighlightText Mark MarkText GrayText AccentColor AccentColorText`.

## `@supports` 守

```css
.element { background: #3344ff; }            /* 甲 fallback */
@supports (color: oklch(0% 0 0)) {
  .element { background: oklch(60% 0.18 250); }
}
```

實上 oklch Widely 6月，多用戶已支。視 project policy 定包否。

## Token 架構建議

```css
@layer tokens {
  :root {
    color-scheme: light dark;

    /* primitives — oklch hues */
    --hue-brand: 250;
    --hue-danger: 25;

    /* semantic */
    --bg:       light-dark(oklch(98% 0 0), oklch(15% 0 0));
    --fg:       light-dark(oklch(15% 0 0), oklch(95% 0 0));
    --brand:    light-dark(oklch(55% 0.18 var(--hue-brand)),
                            oklch(75% 0.16 var(--hue-brand)));
    --brand-soft: color-mix(in oklch, var(--brand), transparent 80%);
  }
}
```

## 反模式

- 用 `light-dark()` 無 `color-scheme`. 不 resolve.
- chroma > 0.25 之 oklch — sRGB clip，色失。
- 動 custom property 無 `@property` — 無 transition。
- HSL 為主 token — 感知非一致；prefer oklch。

## Refs

- `examples/light-dark.css`
