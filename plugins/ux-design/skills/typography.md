---
name: typography
description: Typography system design covering type selection, scale creation, pairing strategies, and readability optimization. Create cohesive type systems that enhance brand identity and user experience.
---

# Typography Design

You are a typography expert helping designers create intentional, readable, and characterful type systems. Typography carries 90%+ of web content—it deserves meticulous attention.

## Philosophy

Typography is the voice of your design. It should:

1. **Reflect brand personality** - Fonts have character; choose deliberately
2. **Ensure readability** - Beautiful type that can't be read is failure
3. **Create hierarchy** - Guide readers through content effortlessly
4. **Scale systematically** - Work across all contexts and sizes

## Before Selecting Fonts

### Essential Questions

**Brand Context**
- What personality should type convey? (friendly, authoritative, playful, elegant)
- Is this a rebrand or fresh start?
- What existing brand elements must type complement?

**Content Nature**
- Long-form reading or headlines/UI only?
- Code, data tables, or specialized content?
- Multiple languages with special character needs?

**Technical Constraints**
- Performance budget for font loading?
- Variable fonts supported?
- System fonts acceptable for any uses?

**Target Audience**
- Age range (larger sizes for older audiences)
- Expected reading devices (mobile, desktop, low-res displays)
- Accessibility requirements

## Font Categories & Their Character

### Serif

**Old Style** (Garamond, Bembo, Palatino)
- Warm, classic, literary
- Use: Editorial, luxury, tradition

**Transitional** (Times, Baskerville, Georgia)
- Balanced, professional, established
- Use: Business, academia, journalism

**Modern/Didone** (Bodoni, Didot, Playfair)
- Elegant, high-contrast, dramatic
- Use: Fashion, luxury, bold headlines

**Slab Serif** (Rockwell, Roboto Slab, Clarendon)
- Strong, confident, mechanical
- Use: Marketing, bold statements, brands

### Sans-Serif

**Grotesque** (Helvetica, Arial, Univers)
- Neutral, utilitarian, universal
- Use: Corporate, UI, when type shouldn't distract

**Neo-Grotesque** (Inter, SF Pro, Roboto)
- Modern, clean, screen-optimized
- Use: Digital products, apps, interfaces

**Geometric** (Futura, Avant Garde, Poppins)
- Modern, structured, mathematical
- Use: Tech, architecture, minimalism

**Humanist** (Gill Sans, Open Sans, Lato)
- Friendly, approachable, readable
- Use: Body text, approachable brands

### Display & Decorative

**Use sparingly** - Headlines, logos, moments of impact
- Avoid for body text or UI elements
- One display font maximum in most projects

### Monospace

**Code & Data** (JetBrains Mono, Fira Code, Source Code Pro)
- Fixed-width for alignment
- Use: Code, technical data, tabular numbers

## Type Pairing Strategies

### The Contrast Principle

Successful pairings create clear distinction without discord:

**Pair Different Categories**
```
Headlines: Playfair Display (serif)
Body: Source Sans Pro (sans-serif)
```

**Pair Different Weights**
```
Headlines: Montserrat Bold
Body: Montserrat Regular
```

**Pair Different Styles**
```
Headlines: Georgia Italic
Body: Georgia Regular
```

### Proven Pairing Approaches

**1. Same Family (Safest)**
Use weight, style, and size for contrast within one typeface.
```
Heading: Roboto Bold
Body: Roboto Regular
```

**2. Designer Match**
Fonts by same designer often harmonize.
```
FF Meta (Erik Spiekermann) + FF Meta Serif
```

**3. Era Match**
Fonts from same historical period share DNA.
```
Baskerville + Caslon (both 18th century)
```

**4. X-Height Match**
Fonts with similar x-heights blend smoothly.
```
Compare x-height at same point size before committing
```

**5. Superfamily**
Type families with serif and sans-serif variants.
```
Source Serif Pro + Source Sans Pro
Merriweather + Merriweather Sans
```

### Pairings to Avoid

- Two serif display fonts
- Two competing decorative fonts
- Fonts with similar but not identical structure (looks like a mistake)
- More than 2-3 fonts total in a project

## Modular Type Scales

### The Mathematical Approach

Choose a ratio and apply consistently:

**Minor Second** (1.067) - Subtle, compact
**Major Second** (1.125) - Gentle progression
**Minor Third** (1.200) - Balanced, common
**Major Third** (1.250) - Clear hierarchy
**Perfect Fourth** (1.333) - Strong contrast
**Augmented Fourth** (1.414) - Dramatic
**Perfect Fifth** (1.500) - Bold hierarchy
**Golden Ratio** (1.618) - Classical proportion

### Generating a Scale

Base size: 16px (1rem)
Ratio: 1.250 (Major Third)

```
xs:    10.24px  (0.64rem)  - Legal, captions
sm:    12.8px   (0.8rem)   - Secondary text
base:  16px     (1rem)     - Body text
lg:    20px     (1.25rem)  - Lead paragraphs
xl:    25px     (1.563rem) - H4
2xl:   31.25px  (1.953rem) - H3
3xl:   39.06px  (2.441rem) - H2
4xl:   48.83px  (3.052rem) - H1
5xl:   61.04px  (3.815rem) - Display
```

### Scale Resources

- **Type-scale.com** - Interactive scale generator
- **Modularscale.com** - Mathematical foundations
- **Typescale.com** - Visual previews

## Line Height (Leading)

### Guidelines by Context

**Body Text**: 1.4 - 1.6
- Longer lines need more leading
- Dense content (legal) can go higher (1.6-1.7)

**Headings**: 1.1 - 1.3
- Tighter for visual compactness
- Multi-line headlines need more (1.3)

**UI Elements**: 1.2 - 1.4
- Buttons, labels, navigation
- Compact but legible

### Formula Approach

```
Ideal line-height = font-size * (1 + (2 / font-size-in-px))
```

For 16px: 16 * (1 + 2/16) = 18px (1.125)
For 24px: 24 * (1 + 2/24) = 26px (1.083)

Larger type needs proportionally less leading.

## Line Length (Measure)

### The 45-75 Character Rule

**Optimal**: 66 characters per line
**Acceptable**: 45-75 characters

```css
/* Fluid line length */
p {
  max-width: 65ch;
}

/* Or fixed */
.article-body {
  max-width: 680px; /* ~65ch at 16px */
}
```

### Calculating Width

At 16px, average character width ≈ 8-10px
- 65 characters × 9px = ~585px
- Add padding: ~640-700px container

## Letter Spacing (Tracking)

### Headlines

**Large headlines** benefit from negative tracking:
```css
h1 {
  letter-spacing: -0.02em; /* Tighten */
}
```

### All Caps

**Always add positive tracking** to all-caps text:
```css
.caps {
  text-transform: uppercase;
  letter-spacing: 0.1em; /* Open up */
}
```

### Body Text

**Leave default** - Fonts are designed for natural spacing
Exceptions: Very light/thin weights may need slight opening

## Responsive Typography

### Fluid Type Scales

```css
/* Using clamp() */
h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}

/* Scales fluidly between 32px and 64px */
```

### Breakpoint Adjustments

```css
/* Mobile-first approach */
html {
  font-size: 16px;
}

@media (min-width: 768px) {
  html {
    font-size: 17px;
  }
}

@media (min-width: 1200px) {
  html {
    font-size: 18px;
  }
}
```

### Scale Compression on Mobile

Use a tighter ratio on small screens:

```
Desktop: Major Third (1.250)
Mobile:  Minor Third (1.200)
```

This prevents headlines from dominating limited viewport space.

## Font Loading & Performance

### Loading Strategies

**font-display: swap**
- Text visible immediately with fallback
- Flash of unstyled text (FOUT)
- Best for body text

**font-display: optional**
- Uses cached font or fallback
- No layout shift
- Best for non-critical display fonts

### Subsetting

Only load characters you need:
- Latin Extended for European languages
- Remove Cyrillic if not needed
- Custom subset for display fonts (headline-only characters)

### Variable Fonts

Single file with all weights/styles:
```css
@font-face {
  font-family: 'Inter';
  src: url('Inter-VariableFont.woff2') format('woff2-variations');
  font-weight: 100 900;
}
```

Benefits:
- Smaller total file size for multiple weights
- Infinite weight/width variations
- Better animation of font properties

## Delivering a Type System

### Token Structure

```
Typography Tokens
├── Font Families
│   ├── font-family-heading: "Playfair Display", Georgia, serif
│   ├── font-family-body: "Source Sans Pro", Arial, sans-serif
│   └── font-family-mono: "JetBrains Mono", Consolas, monospace
├── Font Sizes
│   ├── font-size-xs: 0.75rem
│   ├── font-size-sm: 0.875rem
│   ├── font-size-base: 1rem
│   ├── font-size-lg: 1.125rem
│   ├── font-size-xl: 1.25rem
│   └── (continue scale...)
├── Font Weights
│   ├── font-weight-normal: 400
│   ├── font-weight-medium: 500
│   ├── font-weight-semibold: 600
│   └── font-weight-bold: 700
├── Line Heights
│   ├── line-height-tight: 1.2
│   ├── line-height-normal: 1.5
│   └── line-height-loose: 1.75
└── Letter Spacing
    ├── letter-spacing-tight: -0.02em
    ├── letter-spacing-normal: 0
    └── letter-spacing-wide: 0.1em
```

### Semantic Mappings

```css
/* Map tokens to usage */
--text-heading-1: var(--font-size-4xl);
--text-heading-2: var(--font-size-3xl);
--text-body: var(--font-size-base);
--text-caption: var(--font-size-sm);
```

## Font Resources

### Quality Free Fonts

- **Google Fonts** (fonts.google.com) - Vast library, variable font support
- **Font Squirrel** (fontsquirrel.com) - Curated free fonts
- **The League of Moveable Type** - Open source originals

### Premium Fonts

- **Adobe Fonts** (fonts.adobe.com) - CC subscription
- **Hoefler & Co** - Exceptional quality
- **Commercial Type** - Contemporary classics
- **Klim Type Foundry** - Distinctive designs

### Testing & Pairing Tools

- **Fontjoy** (fontjoy.com) - AI pairing generator
- **Typewolf** (typewolf.com) - Real-world examples
- **Fonts In Use** (fontsinuse.com) - Curated applications
- **Archetype** (archetypeapp.com) - Type scale builder

## Typography Checklist

Before finalizing any type system:

- [ ] Fonts support all required languages/characters
- [ ] Body text passes WCAG contrast requirements
- [ ] Line length stays within 45-75 characters
- [ ] Scale creates clear visual hierarchy
- [ ] Font files are optimized (subset, compressed)
- [ ] Fallback fonts are specified and similar
- [ ] Responsive behavior tested on actual devices
- [ ] Font licenses permit intended usage
- [ ] Letter spacing adjusted for all-caps text
- [ ] Line height appropriate for each size
- [ ] No more than 2-3 font families
- [ ] Loading strategy defined (swap, optional, etc.)
