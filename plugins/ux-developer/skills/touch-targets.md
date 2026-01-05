---
name: touch-targets
description: Touch target sizing and spacing guidelines for mobile and touch interfaces
---

# Touch Target Guidelines

Design touch interfaces that are easy to use accurately.

## Minimum Sizes

### Industry Standards

| Standard | Minimum Size | Notes |
|----------|--------------|-------|
| WCAG 2.2 AAA | 44x44 CSS px | Target Size (Enhanced) |
| Apple HIG | 44x44 pt | iOS guidelines |
| Material Design | 48x48 dp | Android guidelines |
| Microsoft | 40x40 px | Windows guidelines |

### Recommended Sizes

| Element Type | Minimum | Recommended | Spacing |
|--------------|---------|-------------|---------|
| Primary buttons | 44px | 48px height | 8px |
| Icon buttons | 44x44px | 48x48px | 8px |
| List items | 44px height | 48px+ height | - |
| Form inputs | 44px height | 48px height | 16px |
| Links (inline) | 44px tall area | - | 8px vertical |
| Checkboxes/Radio | 44x44px area | 48x48px | 8px |

## Implementation

### Buttons

```css
/* Primary button */
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  font-size: 16px;
}

/* Icon button */
.btn-icon {
  width: 44px;
  height: 44px;
  padding: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Small buttons still need touch area */
.btn-sm {
  min-height: 32px;
  padding: 4px 12px;
  position: relative;
}

.btn-sm::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
}
```

### Links

```css
/* Inline links need vertical padding for touch */
.content a {
  padding: 8px 0;
  margin: -8px 0;
  display: inline-block;
}

/* Navigation links */
.nav-link {
  display: block;
  padding: 12px 16px;
  min-height: 44px;
}
```

### Form Elements

```css
/* Text inputs */
input[type="text"],
input[type="email"],
input[type="password"],
select,
textarea {
  min-height: 44px;
  padding: 12px;
  font-size: 16px; /* Prevents iOS zoom */
}

/* Checkboxes and radios - expand touch area */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 8px 0;
}

.checkbox-wrapper input {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

/* Custom checkbox with larger touch area */
.custom-checkbox {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 44px;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.custom-checkbox .checkmark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid #666;
  border-radius: 4px;
}
```

### List Items

```css
/* Tappable list items */
.list-item {
  min-height: 48px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
}

/* If item has actions, ensure they're spaced */
.list-item-action {
  min-width: 44px;
  min-height: 44px;
  margin-left: 8px;
}
```

## Spacing Between Targets

### Minimum Spacing

```css
/* Between adjacent touch targets */
.btn + .btn {
  margin-left: 8px;
}

.icon-btn + .icon-btn {
  margin-left: 8px;
}

/* Vertical stacking */
.btn-stack > * + * {
  margin-top: 8px;
}
```

### Preventing Accidental Taps

```css
/* More spacing for destructive actions */
.btn-danger {
  margin-left: 16px;
}

/* Separate primary from secondary actions */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-bar .secondary-actions {
  display: flex;
  gap: 8px;
}

.action-bar .primary-action {
  margin-left: 24px;
}
```

## Visual vs Touch Area

Touch area can exceed visual bounds:

```html
<button class="icon-btn" aria-label="Close">
  <svg class="icon" width="24" height="24">...</svg>
</button>
```

```css
.icon-btn {
  /* Visual size */
  width: 32px;
  height: 32px;
  padding: 4px;

  /* Expand touch area */
  position: relative;
}

.icon-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
}

/* Or use negative margins with padding */
.icon-btn {
  padding: 10px;
  margin: -10px;
}
```

## Mobile-Specific Considerations

### Bottom of Screen

Targets at screen bottom should be larger (thumb zone):

```css
.bottom-nav-item {
  min-height: 56px;
  padding: 8px 0;
}

.floating-action-btn {
  width: 56px;
  height: 56px;
  bottom: 24px;
  right: 24px;
}
```

### Edge of Screen

Targets at edges are harder to hit:

```css
/* Add extra padding at edges */
.sidebar-link:first-child {
  padding-top: 16px;
}

.sidebar-link:last-child {
  padding-bottom: 16px;
}

/* Safe area for notched devices */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Thumb Zones

```
┌─────────────────────┐
│  HARD TO REACH      │
│                     │
├─────────────────────┤
│                     │
│  NATURAL REACH      │
│                     │
├─────────────────────┤
│  EASY (THUMB ZONE)  │
│  PRIMARY ACTIONS    │
└─────────────────────┘
```

Place primary actions in thumb zone (bottom third of screen).

## Testing Touch Targets

### Browser DevTools

```javascript
// Highlight small touch targets
document.querySelectorAll('a, button, input, [role="button"]')
  .forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      el.style.outline = '2px solid red';
      console.warn('Small target:', el, rect.width, 'x', rect.height);
    }
  });
```

### agnt Integration

```javascript
// Via agnt proxy exec
__devtool.auditAccessibility() // Includes touch target check
```

## WCAG 2.2 Compliance

### 2.5.8 Target Size (Minimum) - Level AA

- Targets at least 24x24 CSS pixels
- OR target has spacing so 24px circle doesn't overlap adjacent

### 2.5.5 Target Size (Enhanced) - Level AAA

- Targets at least 44x44 CSS pixels

### Exceptions

- Inline links within text blocks
- User agent controlled elements
- Essential presentation that can't be changed
- Legally required presentation

## Checklist

- [ ] All buttons minimum 44x44px
- [ ] All form inputs minimum 44px height
- [ ] 8px minimum spacing between targets
- [ ] Icons have expanded touch areas
- [ ] Links have adequate vertical padding
- [ ] Primary actions in thumb zone on mobile
- [ ] Edge targets have extra padding
- [ ] Destructive actions spaced from other actions
- [ ] Custom controls have proper hit areas
