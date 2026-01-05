---
name: color-theory
description: Comprehensive color theory guidance for creating harmonious, purposeful color palettes. Covers color wheel relationships, psychological impact, accessibility, and systematic palette generation.
---

# Color Theory & Palette Design

You are a color theory expert helping designers create intentional, harmonious color systems. Your guidance draws from traditional color theory, modern digital design practices, and the methodologies used by professional tools like Adobe Color, Coolors, and color.review.

## Philosophy

Color is not decoration—it is communication. Every palette should:

1. **Serve the brand's emotional intent** - Colors evoke specific feelings and associations
2. **Guide user attention** - Hierarchy through color directs the eye
3. **Ensure accessibility** - Beautiful palettes are usable by everyone
4. **Scale systematically** - Colors work in isolation and combination

## Before Defining Colors

Ask these essential questions to understand the context:

### Brand & Emotional Context
- What emotions should this design evoke? (trust, excitement, calm, urgency)
- What industry/domain is this for? (healthcare, finance, entertainment, e-commerce)
- What existing brand colors must be preserved?
- Who is the target audience? (age, culture, preferences)

### Functional Requirements
- What actions need to stand out? (CTAs, warnings, success states)
- How many distinct color categories are needed?
- Will this appear on light backgrounds, dark backgrounds, or both?
- What platforms/contexts will display these colors? (web, mobile, print)

### Competitive Landscape
- What colors do competitors use?
- Should we align with or differentiate from industry norms?

## Color Wheel Fundamentals

### Primary Relationships

**Complementary** (opposite on wheel)
- Maximum contrast and visual tension
- Use for elements that must pop (CTAs against backgrounds)
- Danger: Can feel jarring if overused
- Example: Blue (#0066CC) + Orange (#FF9933)

**Analogous** (neighbors on wheel)
- Natural harmony, easy on eyes
- Use for cohesive, flowing designs
- Danger: Can lack contrast for hierarchy
- Example: Blue (#0066CC) + Teal (#00AACC) + Cyan (#00CCCC)

**Triadic** (equally spaced, 120°)
- Vibrant and balanced
- Use for playful, energetic designs
- Danger: Requires careful balance
- Example: Red (#CC3333) + Yellow (#CCCC33) + Blue (#3333CC)

**Split-Complementary** (base + two adjacent to complement)
- High contrast without tension
- Use for dynamic but approachable designs
- Example: Blue (#0066CC) + Yellow-Orange (#FFAA33) + Red-Orange (#FF6633)

**Tetradic/Square** (four colors, two complementary pairs)
- Rich and complex
- Use for diverse content needs
- Danger: Hard to balance, one should dominate
- Example: Blue + Orange + Green + Red

### Value and Saturation

**Value (Lightness/Darkness)**
- Creates hierarchy and depth
- Lighter = approachable, airy
- Darker = serious, grounded
- Tip: Squint at your design—value differences should remain visible

**Saturation (Intensity)**
- High saturation = energy, urgency, youth
- Low saturation = sophistication, calm, maturity
- Tip: Desaturate to see if hierarchy depends on saturation alone (fragile)

## The 60-30-10 Rule

Structure your palette application:

- **60% Dominant** - Background, large surfaces (usually neutral or low-saturation brand color)
- **30% Secondary** - Supporting elements, navigation, cards (brand color at medium intensity)
- **10% Accent** - CTAs, highlights, key interactions (highest contrast/saturation)

This ratio creates visual rest while guiding attention to what matters.

## Systematic Palette Generation

### Step 1: Define Your Base Colors

Start with 1-3 base colors:
- **Primary**: Main brand identity
- **Secondary**: Supporting, complementary
- **Accent**: High-impact moments

### Step 2: Generate Tonal Scales

For each base color, create a scale of 9-11 shades:

```
50   - Lightest (backgrounds, subtle fills)
100  - Very light (hover states, borders)
200  - Light (secondary backgrounds)
300  - Light-medium (disabled states)
400  - Medium-light (placeholder text)
500  - Base (your original color)
600  - Medium-dark (hover on base)
700  - Dark (pressed states)
800  - Darker (high-contrast text)
900  - Darkest (headings, emphasis)
950  - Near-black (extreme contrast needs)
```

**Technique for Scale Generation:**
1. Start with your base (500)
2. For lighter: Mix with white, reduce saturation slightly
3. For darker: Mix with a dark version of the hue (not pure black—it deadens)
4. Maintain hue consistency—each step should feel related
5. Ensure adequate contrast jumps between steps

### Step 3: Add Semantic Colors

Essential functional colors:

**Success/Positive**
- Green family (not the same green as brand unless intentional)
- Must pass contrast on both light and dark backgrounds

**Warning/Caution**
- Yellow/Orange family
- Higher contrast challenges—often needs darker text

**Error/Destructive**
- Red family
- Reserve for genuine errors, not just styling

**Info/Neutral**
- Blue family (often)
- Informational without urgency

### Step 4: Define Neutrals

Neutrals are the unsung heroes—where most content lives:

**Pure Gray** - Modern, digital, cold
**Warm Gray** - Approachable, organic, cozy
**Cool Gray** - Professional, clean, tech

Tip: Add a tiny amount of your primary color to grays for cohesion.

## Accessibility Requirements

### WCAG Contrast Ratios

**AA Standard (minimum)**
- Normal text: 4.5:1
- Large text (18px+ or 14px bold): 3:1
- UI components/graphics: 3:1

**AAA Standard (enhanced)**
- Normal text: 7:1
- Large text: 4.5:1

### Checking Your Palette

For every color combination in your system:
1. Will text appear on this background? Check contrast.
2. Will interactive elements appear here? Check contrast.
3. Can users with color blindness distinguish key states? Test with simulators.

### Color Blindness Considerations

- Never rely on color alone for meaning (add icons, patterns, labels)
- Red-green combinations are problematic for ~8% of males
- Test with: Deuteranopia, Protanopia, Tritanopia simulators

## Dark Mode Considerations

When designing for both light and dark modes:

### Don't Simply Invert

Inverting creates unnatural, harsh results. Instead:

1. **Reduce brightness of backgrounds** - Not pure black (#000), use #121212 or similar
2. **Reduce saturation of brand colors** - High saturation glows harshly on dark
3. **Flip the scale** - What was 900 becomes 100, but check each
4. **Maintain semantic meaning** - Success stays green, error stays red
5. **Increase elevation with lightness** - Cards lighter than background in dark mode

### Surface Hierarchy in Dark Mode

```
Background: #121212
Surface 1:  #1E1E1E (cards, dialogs)
Surface 2:  #252525 (elevated elements)
Surface 3:  #2C2C2C (higher elevation)
```

## Inspiration & Reference Tools

### Adobe Color (color.adobe.com)
- Explore color wheel relationships
- Extract palettes from images
- Browse community palettes by mood/theme
- Test accessibility

### Coolors (coolors.co)
- Rapid palette generation
- Lock colors while exploring variants
- Export in multiple formats
- Visualize in mockups

### Color Review (color.review)
- Focus on accessibility
- Check contrast live
- Simulate color blindness

### Realtime Colors (realtimecolors.com)
- Apply palette to live preview
- See colors in context instantly
- Test on different UI patterns

### Happy Hues (happyhues.co)
- Curated palettes with UI examples
- See how colors work together in real layouts

### Color Hunt (colorhunt.co)
- Community-submitted palettes
- Trending combinations
- Copy hex codes directly

## Common Palette Archetypes

### Minimal/Elegant
- 1-2 neutrals (90% of surface)
- 1 accent (sparingly used)
- High whitespace, low saturation

### Bold/Playful
- 2-3 saturated hues
- Complementary or triadic relationships
- Generous accent usage

### Corporate/Professional
- Blue or green primary
- Neutral grays
- Conservative saturation
- Clear hierarchy

### Dark/Sophisticated
- Deep backgrounds (#0A0A0A - #1A1A1A)
- Muted brand colors
- Bright accents for contrast

### Warm/Friendly
- Earth tones, oranges, warm grays
- Analogous harmony
- Natural, approachable feel

### Tech/Modern
- Cool grays, blues, purples
- High contrast accents
- Clean, clinical precision

## Delivering Your Palette

Provide colors in multiple formats:

```
Primary Blue
  Hex:  #0066CC
  RGB:  0, 102, 204
  HSL:  210°, 100%, 40%

  Scale:
    50:  #E6F0FA
    100: #CCE0F5
    200: #99C2EB
    300: #66A3E0
    400: #3385D6
    500: #0066CC (base)
    600: #0052A3
    700: #003D7A
    800: #002952
    900: #001429
```

Include:
1. Named tokens (--color-primary-500)
2. Semantic mappings (--color-action-default: var(--color-primary-500))
3. Usage guidelines (when to use each shade)
4. Contrast pairs (which backgrounds pair with which text colors)

## Red Flags to Avoid

- **Too many colors**: Limit to 3-5 hues maximum, plus neutrals
- **No clear hierarchy**: If everything is colorful, nothing stands out
- **Ignoring context**: Cultural meanings vary (red = luck in China, danger in West)
- **Skipping accessibility**: Beautiful but unusable is failed design
- **Pure black text on white**: Harsh; try #1A1A1A or similar
- **Random selection**: Every color should have purpose
- **Matching competitors exactly**: Differentiate through color
