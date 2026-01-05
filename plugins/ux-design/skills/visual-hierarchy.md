---
name: visual-hierarchy
description: Master layout composition, visual weight distribution, and attention flow. Create designs that guide users effortlessly through content with intentional hierarchy.
---

# Visual Hierarchy & Layout Composition

You are a visual design expert helping create layouts that guide the eye, establish clear priority, and communicate structure through visual means.

## Philosophy

Every design has a visual story. Hierarchy ensures users:

1. **See what matters first** - Primary content dominates attention
2. **Navigate effortlessly** - Structure is self-evident
3. **Understand relationships** - Grouping conveys meaning
4. **Know what to do** - Actions are discoverable by importance

## The Hierarchy Toolkit

You have five primary tools to establish visual hierarchy:

### 1. Size

**The most powerful differentiator.**

- Larger elements demand attention first
- Size differences must be meaningful (not just 10%)
- Establish clear size "stops" in your scale

**Size Ratios That Work**:
```
Extreme contrast:  3:1 or greater
Strong contrast:   2:1
Moderate contrast: 1.5:1
Subtle contrast:   1.25:1
```

**Application**:
- Headings vs. body (2:1 minimum)
- Primary CTA vs. secondary (1.5:1)
- Featured content vs. supporting

### 2. Color & Contrast

**Direct attention through chromatic emphasis.**

- High contrast = high attention
- Saturated color on neutral field = focal point
- Dark on light (or vice versa) for text hierarchy

**Contrast Strategies**:
```
Value contrast:      Light vs. dark
Saturation contrast: Vivid vs. muted
Hue contrast:        Complementary colors
Temperature:         Warm vs. cool
```

**Application**:
- Primary button: brand color on neutral
- Links: distinct from body text
- Errors: red draws immediate attention
- Disabled: reduced contrast signals inaction

### 3. Position & Placement

**Eye entry points and reading patterns.**

**Reading Patterns**:

*F-Pattern (text-heavy)*
- Strong horizontal movement at top
- Secondary horizontal sweep below
- Vertical scan down left edge

*Z-Pattern (minimal content)*
- Top-left to top-right
- Diagonal to bottom-left
- Bottom-left to bottom-right

*Gutenberg Diagram (balanced)*
- Primary optical area: top-left
- Strong fallow area: top-right
- Weak fallow area: bottom-left
- Terminal area: bottom-right (CTA placement)

**Application**:
- Logo/brand: top-left (first seen)
- Primary CTA: terminal area or strong fallow
- Most important content: above the fold
- Progressive disclosure: top to bottom

### 4. Whitespace (Negative Space)

**Empty space is a design element, not wasted space.**

- Space isolates and emphasizes
- Generous margins elevate importance
- Cramped layouts diminish hierarchy

**Whitespace Techniques**:
```
Macro whitespace: Large gaps between sections
Micro whitespace: Spacing within components
Active whitespace:  Intentionally directs attention
Passive whitespace: Results from layout structure
```

**Application**:
- Hero sections: generous padding
- Premium feel: more whitespace
- Data-dense: strategic micro whitespace
- Separation > borders: use space to divide

### 5. Typography

**Text styling creates inherent hierarchy.**

**Typographic Hierarchy**:
```
Weight:     Bold vs. regular
Size:       Large vs. small
Case:       Uppercase (labels) vs. sentence
Style:      Italic for emphasis
Family:     Display vs. body
Color:      Black vs. gray
```

**Application**:
- Headings: larger, bolder, darker
- Body: comfortable reading size
- Captions: smaller, lighter
- Labels: often uppercase, spaced

## Compositional Structures

### Grid Systems

**Why Grids Matter**:
- Create alignment and consistency
- Establish visual rhythm
- Enable responsive behavior
- Reduce arbitrary decisions

**Common Grid Types**:

*12-Column Grid*
- Maximum flexibility
- Divides evenly: 1, 2, 3, 4, 6, 12
- Standard for responsive web

*8-Point Grid*
- All spacing multiples of 8
- Icons, type, components align
- Clean scaling for devices

*Modular Grid*
- Horizontal AND vertical division
- For complex, structured layouts
- Magazine, dashboard design

### Layout Patterns

**Single Column**
- Focus on content flow
- Best for reading, mobile
- Minimal distraction

**Split/Two Column**
- Image + text
- Navigation + content
- Sidebar patterns

**Cards**
- Discrete, scannable units
- Flexible reordering
- Equal or varied sizing

**Asymmetric**
- Creates visual interest
- Emphasizes through imbalance
- Requires skill to execute

**Masonry**
- Dynamic, content-driven
- Good for varied media
- Maintains alignment

### Rule of Thirds

Divide your canvas into a 3x3 grid. Key elements at intersections or along lines create dynamic, pleasing compositions.

**Power Points**: The four intersections are natural focal areas.

### Golden Ratio (1:1.618)

For those seeking classical proportion:
- Width to height relationships
- Content area to sidebar
- Image cropping

## Creating Clear Hierarchy

### The Squint Test

Blur your vision (or literally blur the design). You should still see:
- Primary focal point
- Major groupings
- General structure

If everything blurs together: hierarchy has failed.

### One Primary Per Level

At each level of your hierarchy, ONE element should dominate:
- One primary heading on a page
- One primary action per screen
- One featured item in a list

Multiple "primaries" create competition and confusion.

### Hierarchy Levels

Establish consistent levels throughout your design:

```
Level 1: Page/Screen Title (largest, boldest)
Level 2: Section Headers
Level 3: Subsection Headers
Level 4: Content Groups
Level 5: Body Content
Level 6: Supporting/Meta Content
```

## Grouping & Relationships

### Gestalt Application

**Proximity**
- Close = related
- Use consistent spacing
- Gap size signals relationship

```
Group A      Gap      Group B
[item] [item]  |  [item] [item]
  2px gap      |    8px gap between groups
```

**Similarity**
- Same styling = same category
- Color, size, shape, texture
- Break similarity for emphasis

**Enclosure**
- Containers group content
- Cards, boxes, backgrounds
- Strongest grouping method

**Common Region**
- Shared background groups elements
- Alternating colors for row grouping
- Section backgrounds

### Visual Separation Methods

**From strongest to weakest**:
1. Different surface/page
2. Full-bleed dividers
3. Background color change
4. Heavy border/line
5. Light border/line
6. Whitespace only

Prefer weakest effective method—less visual noise.

## Attention Flow

### Entry Points

Where does the eye land first? Control this through:
- Size (largest element)
- Position (top-left or center)
- Color (most saturated)
- Motion (if present)
- Human faces (evolutionary draw)

### Guided Paths

Lead the eye through intended sequence:
- Numbers or steps
- Arrows and lines
- Color progression
- Size gradient
- Alignment paths

### Exit Points

Where should users ultimately act?
- CTAs should be in terminal/completion areas
- Secondary actions nearby but subdued
- Path should feel complete, not abrupt

## Common Hierarchy Patterns

### Hero Sections

```
[        Brand/Logo        ]
[                          ]
[     LARGE HEADLINE       ]
[     Supporting text      ]
[     [Primary CTA]        ]
[                          ]
```

- Maximum size for headline
- Single, clear CTA
- Supporting text bridges headline to action

### Content Lists

```
[ Image ] [ Title (bold, larger)    ]
[       ] [ Subtitle (lighter)      ]
[       ] [ Meta info (smallest)    ]
          [ [Action] ]
```

- Consistent structure per item
- Primary info scanned first
- Actions accessible but not dominant

### Forms

```
Field Label (small, above or left)
[ Input Field (prominent) ]
Helper text (smallest, muted)
```

- Labels guide, inputs receive focus
- Errors break hierarchy appropriately
- Buttons follow form completion

### Dashboards

```
[ Key Metric ][ Key Metric ][ Key Metric ]
[          Primary Chart                  ]
[ Secondary ] [ Secondary ]
[ Table/List with data                    ]
```

- Most important data at top
- Primary visualization dominates
- Supporting details below

## Dark Mode Hierarchy

Hierarchy principles remain, but implementation differs:

- Light text on dark = reversed emphasis
- Bright colors feel louder on dark
- Use elevation (lightness) for layering
- Shadows less effective; use surface color

## Testing Your Hierarchy

### Questions to Ask

1. What do you see first? (Should match intent)
2. What do you see second? (Should be next priority)
3. What's the main action? (Should be obvious)
4. What goes together? (Groups should be clear)
5. What can you ignore? (Secondary content should recede)

### Hierarchy Audit Checklist

- [ ] Single, clear primary focal point
- [ ] Consistent heading hierarchy
- [ ] Primary action most prominent
- [ ] Related items visually grouped
- [ ] Spacing establishes grouping
- [ ] Color emphasis used sparingly
- [ ] Squint test passes
- [ ] Reading pattern considered
- [ ] Whitespace supports structure
- [ ] Works without color (for accessibility)

## Resources

### Layout Inspiration
- **Mobbin** (mobbin.com) - Real app screenshots
- **Land-book** (land-book.com) - Landing pages
- **Awwwards** (awwwards.com) - Award-winning designs

### Grid Tools
- **Grid Calculator** (gridcalculator.dk)
- **Modular Scale** (modularscale.com)
- **8-Point Grid** (spec.fm/specifics/8-pt-grid)

### Composition Theory
- **The Art of Layout** - Various books
- **Grid Systems in Graphic Design** - Josef Müller-Brockmann
- **Making and Breaking the Grid** - Timothy Samara
