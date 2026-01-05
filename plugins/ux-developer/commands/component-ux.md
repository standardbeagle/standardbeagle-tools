---
name: component-ux
description: Design or review a UI component with UX best practices, accessibility, and interaction patterns
---

# Component UX Command

Design a new component or review an existing one with comprehensive UX considerations.

## Process

### 1. Understand the Component

Gather requirements:
- What is the component's purpose?
- What user problem does it solve?
- What are the interaction states?
- What's the usage context (form, navigation, display)?

### 2. Component UX Checklist

#### Accessibility Foundation
- [ ] Semantic HTML element chosen (button, input, nav, etc.)
- [ ] Keyboard accessible (focusable, operable)
- [ ] ARIA attributes only when semantic HTML insufficient
- [ ] Role, name, and state communicated to assistive tech
- [ ] Focus management for complex widgets
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)

#### Interaction States
Every interactive component needs these states defined:

| State | Visual | Behavior | Screen Reader |
|-------|--------|----------|---------------|
| Default | | | |
| Hover | | | |
| Focus | visible ring/outline | | announced |
| Active/Pressed | | | |
| Disabled | reduced opacity, no pointer | not clickable | aria-disabled |
| Loading | spinner/skeleton | | aria-busy |
| Error | error styling | | aria-invalid + message |
| Success | success styling | | announced |

#### Touch & Click Targets
- Minimum 44x44px touch target
- Adequate spacing between targets (8px minimum)
- No hover-only functionality on touch devices

#### Responsive Behavior
- Define breakpoint adaptations
- Touch vs mouse interactions
- Orientation changes handled

#### Motion & Animation
- Respect `prefers-reduced-motion`
- Animations serve a purpose (feedback, orientation)
- Duration appropriate (150-300ms for micro-interactions)

### 3. Component Design Template

```markdown
## [Component Name]

### Purpose
[What problem does this solve for users?]

### Anatomy
[Describe the parts of the component]
- Container
- Label
- Icon (optional)
- Helper text (optional)

### States
[Visual representation of each state]

### Behavior

#### Keyboard
- `Tab`: Focus the component
- `Enter/Space`: Activate
- `Escape`: Close/cancel (if applicable)
- Arrow keys: Navigate (if applicable)

#### Mouse/Touch
- Click: [action]
- Hover: [feedback]
- Long press: [action if applicable]

### Accessibility
- Role: [button/checkbox/etc.]
- Required attributes: [aria-label, aria-describedby, etc.]
- Announcements: [what screen reader should say]

### Variations
- Size: small, medium, large
- Style: primary, secondary, ghost
- State: default, loading, disabled

### Do's and Don'ts
| Do | Don't |
|----|-------|
| [Good practice] | [Anti-pattern] |

### Code Example
[Accessible implementation example]
```

### 4. Review Existing Component

If reviewing existing code:

1. **Analyze current implementation**
   ```
   Read the component code
   Identify HTML structure, event handlers, styles
   ```

2. **Test with agnt proxy**
   ```
   Use proxy to view component in browser
   Use __devtool.inspect() on the component
   Run __devtool.auditAccessibility()
   Test keyboard navigation
   ```

3. **Generate improvement report**
   - Current state assessment
   - Specific issues found
   - Prioritized recommendations
   - Code fixes

### 5. Generate Component Specification

Output a complete spec:

```markdown
# [Component] Specification

## Overview
[Purpose and usage context]

## Props/API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| | | | |

## Accessibility Specification
- **Role**:
- **Keyboard**:
- **Screen Reader**:
- **Focus**:

## Visual Specification
- **Dimensions**:
- **Colors**: (reference design tokens)
- **Typography**:
- **Spacing**:

## States
[Defined above]

## Testing Checklist
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Touch targets adequate
- [ ] All states implemented
- [ ] Reduced motion respected
- [ ] Error states accessible
```

### 6. Implementation Assistance

Offer to:
1. Generate accessible component code
2. Create unit tests for accessibility
3. Write Storybook stories for each state
4. Create documentation
