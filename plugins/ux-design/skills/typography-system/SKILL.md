---
name: ux-design-typography-system
description: "\"Design a complete typography system with font selection, scale creation, and responsive behavior. 設計完整字體系統：字體選擇、比例建立與響應式行為。 Use when: creating a typography system from scratch, selecting font pairings, generating a type scale, defining responsive type behavior.\""
disable-model-invocation: true
---

# Typography System Design

> Invoke the `Skill` tool with `skill: ux-design:typography` — 字體系統設計原則為本命令基礎。

汝正引導用戶創建全面的字體系統。

## Discovery Phase

### 1. Brand Personality
"What personality should your typography convey?
- **Authoritative & Professional**: Traditional serifs, structured hierarchy
- **Modern & Clean**: Geometric or humanist sans-serifs
- **Friendly & Approachable**: Rounded sans-serifs, open letterforms
- **Elegant & Refined**: High-contrast serifs, delicate details
- **Technical & Precise**: Monospace elements, structured grids
- **Playful & Creative**: Display fonts, varied weights"

### 2. Content Type
"What kind of content will this typography serve?
- Long-form reading (articles, documentation)
- Short-form UI (apps, dashboards)
- Marketing and landing pages
- Mixed content types
- Data-heavy interfaces"

### 3. Technical Requirements
"What platforms and constraints exist?
- Web only / Native apps / Both
- Performance budget concerns
- Variable font support
- Self-hosted vs. CDN (Google Fonts)
- Specific language/character needs"

### 4. Existing Brand Assets
"Are there existing fonts or brand guidelines?
- Existing brand fonts to use
- Fonts to avoid (competitor use)
- Font licenses already owned"

## Font Selection

根據回答，推薦2-3種字體組合：

### Pairing Template

```
Option A: [Pairing Name]

Heading Font: [Font Name]
- Category: [Serif/Sans/Display]
- Character: [Description of personality]
- Weights: [List available weights]
- Source: [Google Fonts / Adobe / Purchase link]

Body Font: [Font Name]
- Category: [Serif/Sans]
- Character: [Description of personality]
- Weights: [List recommended weights]
- Source: [Link]

Monospace (if needed): [Font Name]
- Use case: Code, data, technical content
- Source: [Link]

Why This Pairing Works:
[Explain the relationship - contrast type, shared characteristics]
```

## Type Scale Generation

### Scale Parameters

詢問用戶偏好：
"What scale ratio feels right for your content?
- **1.200 (Minor Third)**: Subtle, compact - good for UI-heavy
- **1.250 (Major Third)**: Balanced, versatile - most common
- **1.333 (Perfect Fourth)**: Strong hierarchy - good for marketing
- **1.414 (Augmented Fourth)**: Dramatic - editorial, luxury
- **1.500 (Perfect Fifth)**: Bold contrast - headlines-focused"

### Generate Scale

```
Base: 16px (1rem)
Scale: [Selected ratio]

Typography Scale:
─────────────────────────────────────────────────────
Token      | Size     | Line Height | Weight | Usage
─────────────────────────────────────────────────────
text-xs    | Xrem     | X           | 400    | Captions, legal
text-sm    | Xrem     | X           | 400    | Secondary, meta
text-base  | 1rem     | 1.5         | 400    | Body text
text-lg    | Xrem     | X           | 400    | Lead paragraphs
text-xl    | Xrem     | X           | 500    | Card headers
text-2xl   | Xrem     | X           | 600    | Section headers
text-3xl   | Xrem     | X           | 600    | Page sections
text-4xl   | Xrem     | X           | 700    | Page title
text-5xl   | Xrem     | X           | 700    | Hero headlines
─────────────────────────────────────────────────────
```

## Responsive Behavior

### Recommend Scale Adjustments

```
Mobile (< 640px):
- Base: 16px
- Scale: 1.200 (tighter)
- Max heading: ~32px

Tablet (640px - 1024px):
- Base: 16px
- Scale: 1.250
- Max heading: ~40px

Desktop (> 1024px):
- Base: 16-18px
- Scale: 1.250-1.333
- Max heading: ~48-56px
```

### Fluid Typography Option

```css
/* Fluid type scale example */
html {
  font-size: clamp(16px, 1vw + 14px, 20px);
}

h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}
```

## Line Height & Spacing

```
Recommended Line Heights:
─────────────────────────────
Size Range    | Line Height
─────────────────────────────
< 14px        | 1.6 - 1.7
14px - 18px   | 1.5 - 1.6
18px - 24px   | 1.4 - 1.5
24px - 32px   | 1.3 - 1.4
> 32px        | 1.1 - 1.2
─────────────────────────────

Paragraph Spacing: 1em - 1.5em
Letter Spacing:
- Normal text: 0 (default)
- All caps: 0.05em - 0.1em
- Large headlines: -0.01em to -0.02em
```

## Font Loading Strategy

根據需求推薦：

```
Performance-Critical:
- System font stack with similar fallbacks
- font-display: swap for web fonts
- Subset fonts to required characters

Standard Web:
- Preload critical fonts
- font-display: swap
- Limit to 2-3 font files

Premium Experience:
- Variable fonts where supported
- font-display: optional for non-critical
- Full character sets loaded async
```

## Deliverables

提供最終系統：

### 1. Token Definitions
```css
:root {
  /* Font Families */
  --font-heading: "Font Name", fallback, sans-serif;
  --font-body: "Font Name", fallback, sans-serif;
  --font-mono: "Font Name", fallback, monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  /* ... */

  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  /* ... */
}
```

### 2. Semantic Mappings
```css
/* Usage-based tokens */
--text-page-title: var(--text-4xl);
--text-section-title: var(--text-2xl);
--text-body: var(--text-base);
--text-caption: var(--text-sm);
```

### 3. Usage Guidelines
- 各尺寸何時使用
- 各情境的字重建議
- 做/不做示例

## Resources

為用戶指引：
- **Google Fonts**: fonts.google.com
- **Fontjoy**: fontjoy.com (pairing generator)
- **Type Scale**: type-scale.com (scale calculator)
- **Typewolf**: typewolf.com (real-world examples)
