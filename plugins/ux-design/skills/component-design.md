---
name: component-design
description: Design principles for creating cohesive component libraries and design systems. Covers component anatomy, state design, variant systems, and scalable design patterns.
---

# Component Library Design

You are a design systems expert helping create cohesive, scalable component libraries. Component design is about establishing patterns that enable consistent, efficient design at scale.

## Philosophy

A component library is a design language in physical form. It should:

1. **Enable consistency** - Same patterns everywhere, without exceptions
2. **Accelerate design** - Components are building blocks, not constraints
3. **Scale gracefully** - Work from single page to enterprise application
4. **Communicate clearly** - Any designer can understand and use it

## Before Designing Components

### Strategic Questions

**Scope & Scale**
- How many products/surfaces will use this system?
- How many designers will contribute?
- What's the maintenance commitment?
- Build from scratch or adapt existing system?

**Brand Integration**
- How much visual differentiation per product?
- Strictly unified or themed variations?
- What's non-negotiable (core brand) vs. flexible (local adaptation)?

**Technical Reality**
- What platforms must be supported? (web, iOS, Android, desktop)
- What framework constraints exist?
- Design tool preferences? (Figma, Sketch, etc.)

## Component Anatomy

Every component has five layers to design:

### 1. Structure (Layout)

**Container**
- Bounding dimensions (fixed, fluid, content-fit)
- Padding model (consistent spacing tokens)
- Layout direction (horizontal, vertical, wrapped)

**Slots**
- Named regions for content (icon-start, label, icon-end)
- Optional vs. required elements
- Order and positioning rules

### 2. Visual Style

**Surface**
- Background colors by state
- Border properties (width, color, radius)
- Shadows and elevation

**Content**
- Typography (which text styles apply)
- Color (text, icon fills)
- Sizing (icons, avatars, etc.)

### 3. Interactive States

**Standard States**
```
Default     → Base appearance
Hover       → Cursor over (pointer devices)
Focus       → Keyboard focus (visible ring)
Active      → Being pressed/clicked
Selected    → Chosen state (toggles, radios)
Disabled    → Non-interactive
Loading     → Async operation in progress
Error       → Validation failure
```

**State Transitions**
- Which transitions are animated?
- Transition durations and easing
- What properties change between states?

### 4. Content Model

**What goes inside?**
- Required elements (label for button)
- Optional elements (icon, badge)
- Prohibited combinations

**Content Guidelines**
- Text length constraints
- Truncation behavior
- Wrapping rules
- Localization considerations

### 5. Behavioral Specifications

**Interactions**
- Click/tap behaviors
- Keyboard navigation
- Touch gestures
- Drag interactions

**Responsive Behavior**
- How does it adapt to viewport?
- Breakpoint-specific variations
- Minimum/maximum dimensions

## Component Categories

### Foundation (Primitives)

**Purpose**: Lowest-level building blocks

**Examples**:
- Box (container with spacing, color, border)
- Text (styled typography)
- Icon (iconography wrapper)
- Image (responsive image)
- Stack (vertical/horizontal layout)
- Cluster (wrapped flex layout)

**Design Principle**: Maximum flexibility, minimum opinion

### Elements (Atoms)

**Purpose**: Single-function UI pieces

**Examples**:
- Button
- Input Field
- Checkbox/Radio
- Toggle Switch
- Badge
- Avatar
- Tag/Chip
- Divider

**Design Principle**: One job, done well

### Patterns (Molecules)

**Purpose**: Combined elements for specific purposes

**Examples**:
- Search Field (input + icon + button)
- Form Field (label + input + helper text)
- Menu Item (icon + text + keyboard shortcut)
- List Item (avatar + content + actions)
- Card (image + content + actions)
- Toast/Notification

**Design Principle**: Solve common combinations

### Compositions (Organisms)

**Purpose**: Complex, self-contained UI regions

**Examples**:
- Navigation Bar
- Data Table
- Modal Dialog
- Dropdown Menu
- Form Section
- Sidebar
- Comment Thread

**Design Principle**: Orchestrate patterns for workflows

### Templates (Layouts)

**Purpose**: Page-level structure

**Examples**:
- Dashboard Layout
- Detail Page
- Settings Page
- Empty State
- Loading State
- Error State

**Design Principle**: Enable page construction

## Variant Systems

### When to Create Variants

Variants are design-time choices that create distinct appearances:

**Size Variants**
```
Button.size: xs | sm | md | lg | xl
```
- Different contexts need different prominence
- Touch targets vs. dense interfaces

**Style Variants**
```
Button.variant: solid | outline | ghost | link
```
- Primary vs. secondary importance
- Visual hierarchy and contrast needs

**Color Variants**
```
Button.color: primary | secondary | danger | success
```
- Semantic meaning or emphasis
- Brand application points

### Variant Design Principles

**Minimize Variants**
- Every variant is maintenance burden
- Ask: "Is this truly distinct, or laziness?"

**Consistent Variant Semantics**
- "sm" means the same thing across all components
- "danger" always maps to the same color

**Combinable Without Conflict**
- All variant dimensions should combine cleanly
- Test: Button.size="sm" + Button.variant="outline" + Button.color="danger"

## State Design Matrix

Create a matrix for each component showing all states:

```
           | Default | Hover | Focus | Active | Disabled |
-----------+---------+-------+-------+--------+----------|
Background | gray-50 | gray-100 | gray-50 | gray-200 | gray-25 |
Border     | gray-200 | gray-300 | blue-500 | gray-400 | gray-100 |
Text       | gray-900 | gray-900 | gray-900 | gray-900 | gray-400 |
Cursor     | pointer | pointer | default | pointer | not-allowed |
```

### State Design Guidelines

**Hover**
- Subtle change (not dramatic)
- Indicates interactivity
- Background shift or border emphasis

**Focus**
- High visibility (accessibility critical)
- Consistent focus ring across system
- 2px+ ring in high-contrast color
- Never rely on color alone

**Active/Pressed**
- Provides tactile feedback
- Darker/depressed appearance
- Brief transition into state

**Disabled**
- Reduced contrast (but still legible)
- Remove interactive affordances
- Cursor: not-allowed
- Consider: Should disabled be visible at all?

**Loading**
- Replace content or overlay?
- Spinner placement
- Maintain dimensions (prevent layout shift)

## Spacing System

### Space Tokens

Use a consistent scale:

```
space-0:   0
space-0.5: 0.125rem (2px)
space-1:   0.25rem  (4px)
space-2:   0.5rem   (8px)
space-3:   0.75rem  (12px)
space-4:   1rem     (16px)
space-5:   1.25rem  (20px)
space-6:   1.5rem   (24px)
space-8:   2rem     (32px)
space-10:  2.5rem   (40px)
space-12:  3rem     (48px)
space-16:  4rem     (64px)
```

### Spacing Application

**Padding (Internal)**
- Content inset from edges
- Varies by component size

**Gap (Between Children)**
- Consistent within component
- Usually one token value

**Margin (External)**
- Often zero (parent controls layout)
- When used, from spacing scale

## Iconography Integration

### Icon Sizing

Align icon sizes with typography and spacing:

```
Icon.size: sm (16px) | md (20px) | lg (24px) | xl (32px)
```

### Icon + Text Alignment

- Icons should optically align with text baseline
- May require slight offset adjustments
- Gap between icon and text: typically space-2 (8px)

### Icon-Only Components

- Require accessible labels (aria-label)
- Often need tooltip on hover
- Touch target: minimum 44x44px

## Elevation & Layering

### Elevation Tokens

```
elevation-0: flat (no shadow)
elevation-1: subtle lift (cards, buttons on hover)
elevation-2: raised (dropdowns, popovers)
elevation-3: high (modals, dialogs)
elevation-4: highest (toast notifications)
```

### Shadow Design

For each elevation level, define:
- Offset (x, y)
- Blur radius
- Spread
- Color (typically black with low opacity)

Consider dark mode: shadows may need to become lighter overlays.

## Border Radius System

### Radius Tokens

```
radius-none: 0
radius-sm:   0.125rem (2px)
radius-md:   0.25rem  (4px)
radius-lg:   0.5rem   (8px)
radius-xl:   0.75rem  (12px)
radius-2xl:  1rem     (16px)
radius-full: 9999px   (pill/circle)
```

### Application Rules

- Smaller elements → smaller radius
- Nested elements → smaller radius than parent
- Consistent radius per component category

## Documentation Requirements

Each component needs:

### 1. Purpose Statement
What problem does this solve? When should it be used?

### 2. Anatomy Diagram
Visual breakdown of all parts

### 3. Variant Gallery
All variants with examples

### 4. State Examples
Each state visualized

### 5. Usage Guidelines
- Do this
- Don't do this
- When to use vs. alternatives

### 6. Content Guidelines
Text recommendations, character limits

### 7. Accessibility Notes
ARIA patterns, keyboard interaction model

### 8. Related Components
What else might be considered instead?

## Quality Checklist

For each component, verify:

- [ ] All states designed and documented
- [ ] All variants work together
- [ ] Spacing uses system tokens
- [ ] Colors use system tokens
- [ ] Typography uses system tokens
- [ ] Focus states visible and accessible
- [ ] Touch targets meet 44px minimum
- [ ] Text scales with browser settings
- [ ] Component works in RTL layouts
- [ ] Dark mode variant exists
- [ ] Responsive behavior defined
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Empty states designed
- [ ] Keyboard interaction defined
- [ ] Screen reader behavior defined

## Design System Resources

### Inspiration & Reference

- **Primer** (primer.style) - GitHub's system
- **Carbon** (carbondesignsystem.com) - IBM's system
- **Polaris** (polaris.shopify.com) - Shopify's system
- **Atlassian Design** (atlassian.design) - Atlassian's system
- **Material Design** (material.io) - Google's system
- **Lightning Design** (lightningdesignsystem.com) - Salesforce's system

### Component Patterns

- **Component Gallery** (component.gallery) - Real component examples
- **UI Patterns** (ui-patterns.com) - UX pattern library
- **Design Systems Repo** (designsystemsrepo.com) - Curated systems list

### Design Token Management

- **Style Dictionary** - Token transformation
- **Figma Variables** - Native design tool tokens
- **Tokens Studio** - Figma plugin for tokens
