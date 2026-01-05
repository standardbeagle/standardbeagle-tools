---
name: color-palette
description: Interactive color palette creation wizard with inspiration from Adobe Color, Coolors, and color theory principles
---

# Color Palette Creation

You are guiding the user through creating a purposeful, harmonious color palette. Use the color-theory skill as your foundation.

## Discovery Phase

Ask these questions to understand the context:

### 1. Brand & Emotional Direction
"What emotional qualities should this palette convey? For example:
- Trust and stability (blues, greens)
- Energy and excitement (reds, oranges)
- Calm and wellness (greens, soft blues)
- Luxury and sophistication (deep purples, golds, blacks)
- Playful and friendly (bright, saturated colors)
- Professional and neutral (grays, muted tones)"

### 2. Industry Context
"What industry or domain is this for? Different sectors have color conventions:
- Healthcare (blues, greens, white)
- Finance (blues, greens, grays)
- Food (reds, oranges, greens)
- Tech (blues, purples, gradients)
- Fashion (black, white, accent colors)
- Children's products (bright primaries)"

### 3. Existing Constraints
"Are there any colors you must include or avoid?
- Existing brand colors to preserve
- Competitor colors to differentiate from
- Cultural considerations for your audience"

### 4. Application Context
"Where will this palette be used?
- Digital only (web, app)
- Print materials
- Both digital and print
- Specific platform guidelines (iOS, Material)"

## Palette Generation

Based on their answers, generate palette options:

### Provide 2-3 Palette Options

For each option, include:

1. **Primary Color** - The dominant brand color
2. **Secondary Color** - Supporting color (complementary or analogous)
3. **Accent Color** - High-contrast for CTAs and emphasis
4. **Neutral Scale** - Grays with subtle color tinting
5. **Semantic Colors** - Success, warning, error, info

### Format Each Palette Like This:

```
Option A: [Descriptive Name]
Emotional Quality: [Description of feeling]

Primary:    #XXXXXX | RGB: X, X, X | HSL: X°, X%, X%
Secondary:  #XXXXXX | RGB: X, X, X | HSL: X°, X%, X%
Accent:     #XXXXXX | RGB: X, X, X | HSL: X°, X%, X%

Neutral Scale:
  50:  #XXXXXX (backgrounds)
  100: #XXXXXX (subtle backgrounds)
  200: #XXXXXX (borders)
  300: #XXXXXX (disabled)
  400: #XXXXXX (placeholder text)
  500: #XXXXXX (secondary text)
  600: #XXXXXX (body text)
  700: #XXXXXX (headings)
  800: #XXXXXX (emphasis)
  900: #XXXXXX (maximum contrast)

Semantic:
  Success: #XXXXXX
  Warning: #XXXXXX
  Error:   #XXXXXX
  Info:    #XXXXXX
```

## Validation

For each palette, verify and report:

### Contrast Compliance
- Primary on white: X:1 (WCAG AA: ✓/✗)
- Accent on white: X:1 (WCAG AA: ✓/✗)
- Body text on backgrounds: X:1 (WCAG AA: ✓/✗)

### Color Blindness Preview
Describe how the palette appears under:
- Deuteranopia (red-green)
- Protanopia (red-green)
- Tritanopia (blue-yellow)

## Inspiration Resources

Offer these tools for exploration:
- **Adobe Color**: color.adobe.com - Explore color wheel relationships
- **Coolors**: coolors.co - Generate and refine palettes
- **Realtime Colors**: realtimecolors.com - Preview in UI context
- **Color Hunt**: colorhunt.co - Community palettes
- **Happy Hues**: happyhues.co - Palettes with UI examples

## Dark Mode Extension

If requested, extend the palette for dark mode:
- Adjust primary/secondary saturation (typically reduce)
- Invert neutral scale
- Define surface elevation levels
- Verify contrast in dark context

## Deliverables

Provide the final palette as:
1. Named color tokens (CSS custom properties)
2. Semantic mappings (--color-action-primary, etc.)
3. Usage guidelines (when to use each color)
4. Contrast pair documentation
