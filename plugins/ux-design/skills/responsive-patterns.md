---
name: responsive-patterns
description: Responsive design strategies, breakpoint systems, and adaptive layout patterns. Create designs that work beautifully across all devices and contexts.
---

# Responsive Design Patterns

You are a responsive design expert helping create layouts that adapt gracefully across devices, orientations, and contexts.

## Philosophy

Responsive design is about serving content appropriately for the context:

1. **Content first** - What matters most should work everywhere
2. **Progressive enhancement** - Start simple, add complexity for capability
3. **Fluid over fixed** - Embrace the flexibility of the medium
4. **Test real devices** - Emulators lie

## Breakpoint Strategy

### Common Breakpoints

```
320px  - Small phones (iPhone SE, older devices)
375px  - Standard phones (iPhone, modern Android)
428px  - Large phones (iPhone Pro Max)
768px  - Tablets portrait
1024px - Tablets landscape, small laptops
1280px - Laptops, small desktops
1440px - Standard desktops
1920px - Large desktops
2560px - Ultra-wide/4K
```

### Recommended System

**Minimum Viable Breakpoints**:
```
sm:  640px  - Large phones
md:  768px  - Tablets
lg:  1024px - Laptops
xl:  1280px - Desktops
```

**Extended System**:
```
xs:  475px  - Large phones
sm:  640px  - Small tablets
md:  768px  - Tablets
lg:  1024px - Laptops
xl:  1280px - Desktops
2xl: 1536px - Large screens
```

### Breakpoint Design Principles

**Design for breakpoint ranges, not specific devices**:
- Devices change constantly
- Breakpoints should reflect layout needs, not device specs
- Add breakpoints when content breaks, not at arbitrary widths

**Mobile-first approach**:
- Start with smallest layout
- Add complexity as space allows
- Default styles are mobile; media queries add larger

## Layout Patterns

### Column Drop

Content stacks vertically on small screens, spreads horizontally on larger.

```
Mobile:          Desktop:
[ A ]            [ A ] [ B ] [ C ]
[ B ]
[ C ]
```

**When to use**:
- Marketing pages
- Feature comparisons
- Card grids

### Layout Shifter

Significant layout changes between breakpoints.

```
Mobile:          Tablet:          Desktop:
[ Head ]         [ Head  ]        [ Nav ][ Content ]
[ Nav  ]         [ Nav   ]        [     ][ Sidebar ]
[ Main ]         [ Main  ]
[ Side ]         [ Side  ]
```

**When to use**:
- Complex applications
- Dashboards
- Multi-section pages

### Mostly Fluid

Content area has max-width, margins grow on large screens.

```
Small:           Large:
[  Content  ]    [    ][Content][    ]
full-width       centered + margins
```

**When to use**:
- Reading-focused content
- Blogs, articles
- Simple apps

### Off-Canvas

Some content hidden off-screen until triggered.

```
Mobile:                    Mobile (nav open):
[≡][ Title ]              [ Nav   ][Title ]
[ Content   ]             [ Link  ][      ]
                          [ Link  ][      ]
```

**When to use**:
- Navigation on mobile
- Filter panels
- Secondary content

### Tiny Tweaks

Minor adjustments; no major restructuring.

```
Mobile:          Desktop:
Same layout      Same layout
smaller text     larger text
```

**When to use**:
- Simple, single-column content
- Minimal interfaces
- Performance-critical sites

## Navigation Patterns

### Hamburger → Full Nav

```
Mobile:               Desktop:
[≡]                   [Home][About][Services][Contact]
↓ (on tap)
[Home]
[About]
[Services]
[Contact]
```

**Considerations**:
- Hamburger hurts discoverability
- Consider bottom nav for mobile apps
- Priority+ pattern as alternative

### Priority+ Navigation

Most important items visible; overflow to "More" menu.

```
Narrow:               Wide:
[Home][About][⋮]      [Home][About][Svc][Port][Contact]
```

**When to use**:
- Many nav items
- Variable importance
- Space-constrained headers

### Bottom Navigation (Mobile)

```
[🏠][🔍][➕][👤][≡]
Home Search Add Profile More
```

**Guidelines**:
- 3-5 items maximum
- Top destinations only
- Icons + labels
- Thumb-reachable zone

### Tab Bar vs. Hamburger

**Tab Bar** (iOS style):
- Always visible
- Direct access
- Limited items (5 max)

**Hamburger**:
- Hidden until needed
- Unlimited items
- Lower discoverability

## Content Adaptation

### Images

**Responsive Images**:
- Different sizes for different viewports
- Art direction (cropping for context)
- Format adaptation (WebP where supported)

**Strategies**:
```
srcset: Different sizes
sizes:  When to use each size
<picture>: Art direction, format fallbacks
```

### Typography

**Fluid Typography**:
```
font-size: clamp(16px, 4vw, 24px);
```

**Scale Compression**:
- Tighter ratio on mobile (1.2)
- Larger ratio on desktop (1.25-1.333)

**Line Length**:
- Constrain max-width for readability
- 65ch optimal regardless of screen

### Tables

**Options for Responsive Tables**:

*Horizontal scroll*
- Table scrolls independently
- Works for data tables

*Card transformation*
- Each row becomes a card
- Label/value pairs stacked

*Column hiding*
- Priority columns visible
- Others in expandable row

*Reflow*
- Columns become rows
- Header becomes label

### Forms

**Adaptations**:
- Stacked labels on mobile (above input)
- Inline labels on desktop (left of input)
- Full-width inputs on mobile
- Date pickers optimized per platform
- Touch-friendly select menus

## Touch vs. Pointer

### Target Sizing

```
Touch minimum:    44x44px
Mouse optimum:    24x24px (can be smaller)
```

**Adaptive Approach**:
- Size for touch by default
- Fine pointer can reduce if needed
- @media (pointer: fine) { }

### Hover States

```css
/* Only apply hover on devices that support it */
@media (hover: hover) {
  .button:hover {
    background: var(--hover-color);
  }
}
```

**Touch alternatives**:
- Long press for tooltips
- Tap once to preview, again to activate
- Swipe for additional actions

### Spacing

Touch interfaces need:
- More padding between targets
- Generous margins for gestures
- Comfortable spacing for thumb reach

## Viewport Considerations

### Safe Areas

Modern devices have notches, rounded corners:
- env(safe-area-inset-top)
- env(safe-area-inset-bottom)
- env(safe-area-inset-left)
- env(safe-area-inset-right)

**Always account for**:
- iPhone notch
- Home indicator bar
- Android system bars

### Viewport Height

**100vh problem**:
- Mobile browsers show/hide UI
- 100vh causes jump

**Solutions**:
- 100dvh (dynamic viewport height)
- 100svh (small viewport height)
- JavaScript measurement

### Orientation

**Portrait vs. Landscape**:
- Tablets: significant layout changes
- Phones: often portrait-only by design
- Consider locking if experience breaks

## Responsive Patterns Library

### Hero Sections

```
Mobile:                    Desktop:
[      Image       ]       [  Text   ][   Image    ]
[   Headline       ]       [  CTA    ][            ]
[   CTA            ]
```

### Card Grids

```
Mobile:   Tablet:    Desktop:
[Card]    [C1][C2]   [C1][C2][C3][C4]
[Card]    [C3][C4]
[Card]
[Card]
```

**Grid behavior**:
- 1 column → 2 → 3 → 4
- Auto-fill for maximum items
- Minimum card width maintained

### Sidebars

```
Mobile:                Desktop:
[Content      ]        [Sidebar][Content     ]
[Button: More ]        [       ][            ]
      ↓
[Sidebar (overlay)]
```

**Patterns**:
- Collapsible drawer
- Off-canvas with overlay
- Tab bar replacement
- Accordion in content

### Data Tables

```
Mobile (cards):        Desktop (table):
┌─────────────┐       | Name | Role | Status |
│ John Smith  │       | John | Dev  | Active |
│ Developer   │       | Jane | PM   | Active |
│ Active      │
└─────────────┘
```

## Testing Strategy

### Device Testing Priorities

**Must Test**:
1. Most common phones (iPhone, Samsung)
2. Popular tablets (iPad)
3. Standard desktop
4. Common laptop sizes

**Should Test**:
- Edge case sizes (320px, 4K)
- Multiple browsers
- Different orientations
- Slow connections

### Debugging Approach

1. Resize browser continuously (not just snapping to sizes)
2. Identify where layout breaks
3. Add breakpoint at break point (not device size)
4. Test real devices for touch behavior

## Performance Considerations

### Mobile Performance

- Smaller images for mobile
- Defer non-critical CSS
- Reduce JavaScript payload
- Lazy load below-fold content

### Connection-Aware Design

```css
/* Reduce motion/animation on slow connections */
@media (prefers-reduced-data: reduce) {
  img { filter: blur(5px); }
}
```

**Strategies**:
- Low-res image placeholders
- Text before images
- Critical content first

## Design Deliverables

### Artboards to Produce

**Minimum**:
- 375px (mobile)
- 768px (tablet)
- 1440px (desktop)

**Extended**:
- 320px (small mobile)
- 375px (mobile)
- 768px (tablet)
- 1024px (small desktop)
- 1440px (desktop)
- 1920px (large desktop)

### Documentation

For each breakpoint, specify:
- Grid columns and gutters
- Typography scale changes
- Navigation behavior
- Component adaptations
- Image sizes
- Spacing changes

## Resources

### Testing Tools
- **Chrome DevTools** - Device emulation
- **Responsively** (responsively.app) - Multi-device view
- **BrowserStack** - Real device testing

### Pattern Libraries
- **Responsive Patterns** (responsivedesign.is/patterns)
- **Brad Frost Patterns** (bradfrost.com/blog/post/responsive-nav-patterns)

### Layout Tools
- **CSS Grid Generator** (cssgrid-generator.netlify.app)
- **Flexbox Froggy** (flexboxfroggy.com) - Learning tool
