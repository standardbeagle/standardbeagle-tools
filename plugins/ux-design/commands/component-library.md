---
name: component-library
description: Design a cohesive component library structure with variant systems, state definitions, and documentation guidelines
---

# Component Library Planning

You are guiding the user through planning and designing a component library. Use the component-design skill as your foundation.

## Discovery Phase

### 1. Scope Assessment
"What's the scope of this component library?
- **Single Product**: One app or website
- **Product Suite**: Multiple related products
- **Organization-Wide**: Enterprise design system
- **Public/Open Source**: External consumption"

### 2. Platform Requirements
"What platforms will this library serve?
- Web only (React, Vue, vanilla CSS)
- Native mobile (iOS, Android)
- Cross-platform (React Native, Flutter)
- Design tool integration (Figma, Sketch)"

### 3. Existing Resources
"What exists already?
- Starting from scratch
- Existing UI to document/systematize
- Migrating from another system
- Extending an existing library (Material, etc.)"

### 4. Team Context
"Who will use and maintain this library?
- Team size (1-3, 4-10, 10+)
- Designer/developer ratio
- Experience with design systems
- Documentation culture"

## Foundation Tokens

Before components, establish tokens:

### Recommend Token Structure

```
Design Tokens
├── Color
│   ├── Palette (brand, semantic)
│   ├── Light theme mappings
│   └── Dark theme mappings
│
├── Typography
│   ├── Font families
│   ├── Size scale
│   ├── Line heights
│   └── Font weights
│
├── Spacing
│   ├── Base unit (4px or 8px)
│   └── Scale (0, 1, 2, 3, 4, 6, 8, 12, 16...)
│
├── Sizing
│   ├── Component heights
│   ├── Icon sizes
│   └── Border widths
│
├── Border Radius
│   └── Scale (none, sm, md, lg, full)
│
├── Shadows
│   └── Elevation levels (0-4)
│
└── Motion
    ├── Durations
    └── Easing curves
```

## Component Inventory

### Identify Required Components

Walk through common categories:

**Form Elements**
- [ ] Button (primary, secondary, ghost, link, icon)
- [ ] Input (text, number, password, search)
- [ ] Textarea
- [ ] Select / Dropdown
- [ ] Checkbox
- [ ] Radio
- [ ] Toggle / Switch
- [ ] Slider / Range
- [ ] Date Picker
- [ ] File Upload

**Display Elements**
- [ ] Badge / Tag
- [ ] Avatar
- [ ] Icon
- [ ] Card
- [ ] List / List Item
- [ ] Table
- [ ] Accordion
- [ ] Tabs
- [ ] Progress (bar, circular)
- [ ] Skeleton / Loader

**Navigation**
- [ ] Link
- [ ] Breadcrumb
- [ ] Pagination
- [ ] Menu / Dropdown Menu
- [ ] Navigation Bar
- [ ] Sidebar
- [ ] Tab Bar

**Feedback**
- [ ] Alert / Banner
- [ ] Toast / Notification
- [ ] Tooltip
- [ ] Modal / Dialog
- [ ] Popover
- [ ] Empty State
- [ ] Error State

**Layout**
- [ ] Container
- [ ] Grid / Stack
- [ ] Divider
- [ ] Spacer

## Component Design Framework

For each component, define:

### 1. Variant Dimensions

```
Button Component
───────────────────────────────
Variant   | Values
───────────────────────────────
variant   | solid, outline, ghost, link
color     | primary, secondary, danger, success
size      | xs, sm, md, lg, xl
state     | default, hover, focus, active, disabled, loading
───────────────────────────────
```

### 2. Slot/Content Model

```
Button Slots:
┌─────────────────────────────────────┐
│ [iconStart] [label] [iconEnd]       │
└─────────────────────────────────────┘

Required: label OR iconStart (with aria-label)
Optional: iconStart, iconEnd
Prohibited: Both icons without label (confusing)
```

### 3. State Matrix

```
Button States:
          │ Bg      │ Border  │ Text    │ Cursor      │
──────────┼─────────┼─────────┼─────────┼─────────────┤
Default   │ blue-500│ none    │ white   │ pointer     │
Hover     │ blue-600│ none    │ white   │ pointer     │
Focus     │ blue-500│ ring    │ white   │ pointer     │
Active    │ blue-700│ none    │ white   │ pointer     │
Disabled  │ gray-200│ none    │ gray-400│ not-allowed │
Loading   │ blue-400│ none    │ white   │ wait        │
```

### 4. Sizing Specifications

```
Button Sizes:
      │ Height │ Padding X │ Font Size │ Icon Size │
──────┼────────┼───────────┼───────────┼───────────│
xs    │ 24px   │ 8px       │ 12px      │ 12px      │
sm    │ 32px   │ 12px      │ 14px      │ 16px      │
md    │ 40px   │ 16px      │ 14px      │ 20px      │
lg    │ 48px   │ 20px      │ 16px      │ 24px      │
xl    │ 56px   │ 24px      │ 18px      │ 24px      │
```

## Documentation Template

For each component, document:

### Component Spec Structure

```markdown
# Button

## Purpose
When to use this component vs. alternatives.

## Anatomy
Visual diagram with labeled parts.

## Variants
Gallery of all variants with usage guidance.

## States
Visual examples of all states.

## Sizes
Size comparison with use case recommendations.

## Usage Guidelines
### Do
- Use primary for main actions
- Include accessible labels

### Don't
- Use multiple primary buttons
- Disable without explanation

## Accessibility
- Keyboard interaction model
- ARIA requirements
- Screen reader behavior

## Related Components
- Link (for navigation actions)
- IconButton (for icon-only needs)
```

## Quality Checklist

Provide verification criteria:

```
Component Quality Checklist:
─────────────────────────────────────────────────
Foundation
[ ] Uses design tokens (no hardcoded values)
[ ] Follows naming conventions
[ ] Consistent with other components

States
[ ] All states designed (default, hover, focus, active, disabled)
[ ] Loading state (if applicable)
[ ] Error state (if applicable)

Accessibility
[ ] Meets contrast requirements (4.5:1 text, 3:1 UI)
[ ] Focus indicator visible and compliant
[ ] Touch target 44x44px minimum
[ ] Works with keyboard only
[ ] Screen reader tested

Responsive
[ ] Works at all breakpoints
[ ] Text scales with browser settings
[ ] Touch-friendly on mobile

Documentation
[ ] Purpose clearly stated
[ ] All variants documented
[ ] Usage guidelines with do/don't
[ ] Accessibility notes included
─────────────────────────────────────────────────
```

## Deliverables

Provide:

### 1. Component Inventory
Prioritized list of components to design

### 2. Token System
Complete design token structure

### 3. Component Specs
Detailed specifications for priority components

### 4. Documentation Templates
Reusable templates for component documentation

### 5. Quality Criteria
Checklist for component review

## Resources

Reference existing systems:
- **Primer** (GitHub): primer.style
- **Carbon** (IBM): carbondesignsystem.com
- **Polaris** (Shopify): polaris.shopify.com
- **Radix** (Primitives): radix-ui.com
- **Chakra UI**: chakra-ui.com
