---
name: iconography
description: Icon design principles, selection criteria, and system creation. Build cohesive icon sets that enhance usability and reinforce brand identity.
---

# Iconography Design

You are an iconography expert helping designers select, create, and systematize icons that enhance usability and reinforce visual identity.

## Philosophy

Icons are visual shorthand. Effective iconography:

1. **Communicates instantly** - Meaning clear at a glance
2. **Supports text** - Enhances, doesn't replace labels
3. **Maintains consistency** - Same visual language throughout
4. **Scales gracefully** - Works from 12px to 64px+

## When to Use Icons

### Icons Add Value When

- **Space is limited** - Mobile nav, toolbars, dense UIs
- **Scanning is primary** - Lists, menus, dashboards
- **Recognition aids recall** - Repeat actions users learn
- **Universal concepts** - Search, home, settings, close

### Icons Cause Problems When

- **Concept is abstract** - "Synergy," "efficiency"
- **Meaning is ambiguous** - Multiple interpretations possible
- **Text is clearer** - "Account Settings" vs. gear icon
- **Users are unfamiliar** - Novel concepts, new products

### The Hybrid Approach

**Best practice**: Icon + text label
- Icon aids scanning
- Text ensures clarity
- Tooltip as fallback for icon-only
- Never icon-only for critical actions without testing

## Icon Styles

### Line Icons (Outline)

```
Characteristics:
- Strokes without fills
- Consistent stroke weight
- Open, airy feel

Best for:
- Modern, minimal interfaces
- Text-heavy environments
- Smaller sizes (less visual weight)

Examples: Heroicons, Feather Icons
```

### Solid Icons (Filled)

```
Characteristics:
- Filled shapes
- Strong visual presence
- Higher contrast

Best for:
- Navigation (selected state)
- High-emphasis needs
- Larger sizes
- Dark backgrounds

Examples: Font Awesome (solid), Material Symbols (filled)
```

### Duotone Icons

```
Characteristics:
- Two color layers
- Primary and secondary tones
- Depth and dimension

Best for:
- Marketing materials
- Feature highlights
- Illustrative uses

Examples: Font Awesome Pro (duotone)
```

### Illustrated Icons

```
Characteristics:
- Custom artwork
- Brand-specific style
- Higher detail

Best for:
- Empty states
- Onboarding
- Feature marketing
- Brand differentiation

Caution: Don't mix with utility icons
```

## Icon Anatomy

### Key Measurements

**Canvas Size** (base grid):
- 16x16, 20x20, 24x24 (common)
- 32x32, 48x48, 64x64 (larger uses)

**Optical Boundary** (content area):
- Circles/squares: Fill to edges
- Tall shapes: Leave horizontal padding
- Wide shapes: Leave vertical padding
- Goal: Optical balance, not pixel equality

**Stroke Weight**:
- Consistent throughout set
- Typical: 1px, 1.5px, 2px
- Scale proportionally with icon size

**Corner Radius**:
- Consistent throughout set
- Match brand's corner style
- Sharper = more technical
- Rounder = more friendly

### Optical Corrections

**Visual Weight Balance**:
- Circles appear smaller than squares at same size
- Scale circles ~103% for optical equivalence
- Triangles need extra adjustment

**Centering**:
- Visual center ≠ geometric center
- Right-pointing arrows: shift right slightly
- Play icons: shift right ~10%

## Creating an Icon System

### Define Style Guidelines

**Document These**:
```
Canvas: 24x24px with 2px padding
Stroke: 2px, round caps, round joins
Corner: 2px radius
Alignment: Pixel-perfect at 24px
Colors: Single color (inherits from text)
```

### Consistency Rules

**Visual Consistency**:
- Same stroke weight everywhere
- Same corner radius
- Same level of detail
- Same metaphor style (literal vs. abstract)

**Semantic Consistency**:
- Arrow always means navigate
- X always means close
- Plus always means add
- Gear always means settings

### Size Variants

**Why Different Sizes**:
- Detail doesn't scale linearly
- 12px needs simplification
- 48px can add detail

**Typical Set**:
```
12px - Minimal (status indicators)
16px - Compact (inline with text)
20px - Default (buttons, nav)
24px - Standard (primary actions)
32px - Large (feature icons)
48px - Hero (marketing, empty states)
```

## Icon Selection Criteria

### Recognition Testing

**Can Users Identify It?**:
- Test without labels
- Multiple choice: "What does this mean?"
- If <70% correct, add text label

**Universally Recognized**:
- Magnifying glass = search
- House = home
- Envelope = email
- Gear/cog = settings
- Person = account/profile

**Context-Dependent**:
- Hamburger (≡) = menu (learned)
- Heart = like OR favorite OR save
- Bell = notifications
- Star = favorite OR rate

### Cultural Considerations

**Icons with cultural variance**:
- Mailbox styles (US vs. international)
- Currency symbols
- Hand gestures (thumbs up, OK sign)
- Religious/spiritual symbols
- Color meanings (red, white)

**Safe Universal Concepts**:
- Arrows (direction)
- Plus/minus (add/remove)
- X (close)
- Check (confirm)

## Icon + Text Patterns

### Positioning

**Leading Icon** (before text):
```
[🔍] Search        [+] Add Item
```
- Most common pattern
- Left-to-right flow

**Trailing Icon** (after text):
```
Settings [⚙️]      More [▶]
```
- Indicates action/state
- Dropdown arrows, external links

**Stacked Icon** (above text):
```
  [🏠]
  Home
```
- Tab bars, bottom navigation
- Feature cards

### Spacing

**Icon-to-Text Gap**:
- Typically 8px (space-2)
- Adjust for visual balance
- Tighter for small text, wider for large

**Alignment**:
- Center-align icon with text x-height
- May need optical adjustment (1-2px)

## Accessibility Requirements

### Icon-Only Buttons

**Must Have**:
- aria-label describing action
- Tooltip on hover/focus
- sr-only text alternative

**Example**:
```
<button aria-label="Close dialog">
  <span class="sr-only">Close dialog</span>
  <XIcon aria-hidden="true" />
</button>
```

### Decorative Icons

**When icon has text**:
```
<button>
  <SearchIcon aria-hidden="true" />
  Search
</button>
```
- Icon is decorative (text provides meaning)
- Hide from screen readers

### Focus Visibility

- Focus ring on icon buttons
- Touch target: 44x44px minimum
- Visible hover/active states

## Icon Resources

### Free Icon Libraries

**Heroicons** (heroicons.com)
- By Tailwind Labs
- Outline and solid
- 24px and 20px
- MIT license

**Lucide** (lucide.dev)
- Fork of Feather
- Actively maintained
- Many variants
- ISC license

**Phosphor** (phosphoricons.com)
- 6 weights
- Consistent style
- MIT license

**Tabler Icons** (tabler-icons.io)
- 3000+ icons
- Stroke-based
- MIT license

**Material Symbols** (fonts.google.com/icons)
- Google's system
- Variable font
- Multiple styles
- Apache 2.0

### Premium Icons

**Font Awesome Pro**
- Massive library
- Multiple styles
- Support included

**Streamline**
- Multiple styles
- High quality
- Regular updates

**Noun Project**
- Millions of icons
- Various artists
- License per icon or subscription

### Custom Icon Tools

**Figma** - Vector design, icon creation
**Illustrator** - Professional vector
**IconJar** - Icon organization (Mac)
**Nucleo** - Icon management

## Icon System Checklist

### Creating Icons

- [ ] Consistent canvas size defined
- [ ] Stroke weight consistent
- [ ] Corner radius consistent
- [ ] Optical adjustments applied
- [ ] Tested at all target sizes
- [ ] Works in single color
- [ ] Metaphors are clear
- [ ] Style matches brand

### Implementing Icons

- [ ] All icons from same set
- [ ] Accessibility labels provided
- [ ] Decorative icons hidden from AT
- [ ] Touch targets adequate
- [ ] Focus states visible
- [ ] Sizing consistent per context
- [ ] Color inherits appropriately
- [ ] Loading states considered

### Documentation

- [ ] Style guidelines documented
- [ ] Usage guidelines per icon
- [ ] Size recommendations noted
- [ ] Color usage defined
- [ ] Accessibility requirements listed
- [ ] Do/don't examples included

## Common Mistakes

**Mixing Icon Sets**
- Different styles clash
- Inconsistent stroke weights
- Varying levels of detail

**Overusing Icons**
- Icon for every label
- Icons without meaning
- Decoration over function

**Size Inconsistency**
- Different sizes in same context
- Not adjusting detail for size
- Ignoring optical sizing

**Missing Labels**
- Icon-only critical actions
- Assuming universal recognition
- No tooltips for icon buttons

**Poor Contrast**
- Icons too light
- Not testing on backgrounds
- Insufficient active states
