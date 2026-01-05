---
name: design-tokens
description: Create a comprehensive design token system for design-to-development handoff
---

# Design Token System Creation

You are helping create a complete design token system that bridges design and development. This focuses on defining and organizing tokens for handoff.

## Discovery Phase

### 1. Platform Targets
"What platforms will consume these tokens?
- Web (CSS custom properties)
- React/Vue/etc. (JavaScript/TypeScript)
- iOS (Swift)
- Android (Kotlin/XML)
- Design tools (Figma, Sketch)
- Multiple platforms (Style Dictionary output)"

### 2. Existing Assets
"What design decisions are already made?
- Color palette defined
- Typography selected
- Spacing system established
- Starting from scratch on all"

### 3. Theming Requirements
"Do you need theme support?
- Light theme only
- Light and dark themes
- Multiple brand themes
- User-customizable themes"

## Token Architecture

### Token Categories

```
Design Token System
═══════════════════════════════════════════════════════

PRIMITIVE TOKENS (Raw values)
├── color
│   ├── palette
│   │   ├── blue-50 through blue-950
│   │   ├── gray-50 through gray-950
│   │   └── [other hues...]
│   └── semantic
│       ├── brand-primary
│       ├── brand-secondary
│       ├── success
│       ├── warning
│       ├── error
│       └── info
│
├── spacing
│   ├── 0 (0)
│   ├── 1 (4px / 0.25rem)
│   ├── 2 (8px / 0.5rem)
│   └── [scale continues...]
│
├── sizing
│   ├── heights (24, 32, 40, 48px)
│   ├── widths (max-content values)
│   └── icon-sizes (16, 20, 24, 32px)
│
├── typography
│   ├── font-family (heading, body, mono)
│   ├── font-size (scale)
│   ├── font-weight (values)
│   ├── line-height (values)
│   └── letter-spacing (values)
│
├── border
│   ├── width (1, 2, 4px)
│   └── radius (none, sm, md, lg, full)
│
├── shadow
│   └── elevation (0 through 4)
│
└── motion
    ├── duration (fast, normal, slow)
    └── easing (ease-out, ease-in-out, spring)

═══════════════════════════════════════════════════════

SEMANTIC TOKENS (Purpose-based)
├── color
│   ├── background
│   │   ├── default
│   │   ├── subtle
│   │   ├── muted
│   │   └── inverse
│   ├── foreground
│   │   ├── default
│   │   ├── muted
│   │   ├── subtle
│   │   └── inverse
│   ├── border
│   │   ├── default
│   │   ├── muted
│   │   └── focus
│   └── action
│       ├── primary (default, hover, active)
│       ├── secondary
│       └── destructive
│
├── typography
│   ├── heading-1 (size, weight, line-height)
│   ├── heading-2
│   ├── body
│   ├── body-small
│   └── caption
│
└── spacing
    ├── page-margin
    ├── section-gap
    ├── component-gap
    └── inline-gap

═══════════════════════════════════════════════════════

COMPONENT TOKENS (Component-specific)
├── button
│   ├── padding-x
│   ├── padding-y
│   ├── border-radius
│   ├── font-size
│   └── [variant-specific overrides]
│
├── input
│   ├── height
│   ├── padding-x
│   ├── border-radius
│   └── [state-specific values]
│
└── [other components...]

═══════════════════════════════════════════════════════
```

## Token Naming Convention

### Recommended Format

```
Category → Property → Variant → State

Examples:
color-background-default
color-background-subtle
color-text-primary
color-text-muted
color-action-primary-hover
spacing-component-gap
border-radius-lg
```

### Naming Rules

```
1. Use kebab-case: color-primary (not colorPrimary)
2. Be specific: color-text-heading (not just text)
3. Order: general → specific
4. Avoid abbreviations: background (not bg)
5. State suffix: -hover, -active, -disabled
6. Scale suffix: -sm, -md, -lg, -xl OR -100, -200, etc.
```

## Token Definition Format

### JSON Structure (Style Dictionary compatible)

```json
{
  "color": {
    "palette": {
      "blue": {
        "50": { "value": "#eff6ff" },
        "100": { "value": "#dbeafe" },
        "500": { "value": "#3b82f6" },
        "900": { "value": "#1e3a8a" }
      }
    },
    "semantic": {
      "primary": { "value": "{color.palette.blue.500}" },
      "background": {
        "default": { "value": "#ffffff" },
        "subtle": { "value": "{color.palette.gray.50}" }
      },
      "text": {
        "default": { "value": "{color.palette.gray.900}" },
        "muted": { "value": "{color.palette.gray.500}" }
      }
    }
  },
  "spacing": {
    "1": { "value": "4px" },
    "2": { "value": "8px" },
    "4": { "value": "16px" },
    "8": { "value": "32px" }
  }
}
```

### CSS Output

```css
:root {
  /* Palette */
  --color-palette-blue-50: #eff6ff;
  --color-palette-blue-500: #3b82f6;

  /* Semantic */
  --color-primary: var(--color-palette-blue-500);
  --color-background-default: #ffffff;
  --color-background-subtle: var(--color-palette-gray-50);
  --color-text-default: var(--color-palette-gray-900);
  --color-text-muted: var(--color-palette-gray-500);

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-4: 16px;
}
```

## Theme Tokens

### Light/Dark Theme Structure

```json
{
  "color": {
    "background": {
      "default": {
        "$value": "#ffffff",
        "$themes": {
          "light": "#ffffff",
          "dark": "#0a0a0a"
        }
      }
    },
    "text": {
      "default": {
        "$value": "{color.palette.gray.900}",
        "$themes": {
          "light": "{color.palette.gray.900}",
          "dark": "{color.palette.gray.50}"
        }
      }
    }
  }
}
```

### Theme Application

```css
/* Light theme (default) */
:root {
  --color-background-default: #ffffff;
  --color-text-default: #171717;
}

/* Dark theme */
[data-theme="dark"] {
  --color-background-default: #0a0a0a;
  --color-text-default: #fafafa;
}

/* System preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-background-default: #0a0a0a;
    --color-text-default: #fafafa;
  }
}
```

## Complete Token Categories

Generate tokens for each category:

### Color Tokens
```
Palette: All hue scales (50-950)
Semantic: Primary, secondary, success, warning, error, info
Background: Default, subtle, muted, inverse, overlay
Foreground: Default, muted, subtle, inverse
Border: Default, muted, focus, error
Action: Primary, secondary, destructive (+ states)
```

### Typography Tokens
```
Family: Heading, body, mono
Size: Scale from xs to 5xl
Weight: Normal (400), medium (500), semibold (600), bold (700)
Line-height: Tight, normal, loose
Letter-spacing: Tight, normal, wide
```

### Spacing Tokens
```
Scale: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24
Semantic: page, section, component, inline, stack
```

### Border Tokens
```
Width: 0, 1, 2, 4
Radius: none, sm, md, lg, xl, full
```

### Shadow Tokens
```
Elevation: 0 (none), 1 (subtle), 2 (medium), 3 (raised), 4 (floating)
```

### Motion Tokens
```
Duration: instant (0), fast (100ms), normal (200ms), slow (300ms)
Easing: linear, ease-out, ease-in-out, spring
```

## Deliverables

### 1. Token Specification
Complete JSON/YAML token definition file

### 2. Reference Documentation
Visual reference of all tokens with values

### 3. Usage Guidelines
When to use primitive vs. semantic tokens

### 4. Theme Definitions
Light and dark (if applicable) theme values

### 5. Export Formats
Tokens in required platform formats:
- CSS custom properties
- JavaScript/TypeScript constants
- Design tool format (Figma tokens)

## Tools & Resources

### Token Management
- **Style Dictionary**: Amazon's token build system
- **Tokens Studio**: Figma plugin for token management
- **Specify**: Design token platform

### Design Integration
- **Figma Variables**: Native token support
- **Figma Tokens**: Plugin for extended features

### Documentation
- **Storybook**: Component documentation with tokens
- **ZeroHeight**: Design system documentation
