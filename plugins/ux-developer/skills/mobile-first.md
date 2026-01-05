---
name: mobile-first
description: Mobile-first design and development principles for responsive web experiences
---

# Mobile-First Design Principles

Build for mobile constraints first, then enhance for larger screens.

## Core Philosophy

**Mobile-first means**:
- Start with essential content and features
- Design for touch interaction first
- Use progressive enhancement
- Test on real devices, not just emulators

## Touch Target Guidelines

### Minimum Sizes

| Element | Minimum Size | Recommended | Spacing |
|---------|--------------|-------------|---------|
| Buttons | 44x44px | 48x48px | 8px between |
| Links (inline) | 44px height | 48px height | Adequate padding |
| Form inputs | 44px height | 48px height | 16px margin |
| Icons (tappable) | 44x44px | 48x48px | 8px padding |

### Implementation

```css
/* Ensure touch targets */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* Inline links need vertical padding */
.content a {
  padding: 8px 0;
  display: inline-block;
}

/* Form inputs */
input, select, textarea {
  min-height: 44px;
  padding: 12px;
  font-size: 16px; /* Prevents iOS zoom */
}
```

## Responsive Breakpoints

### Recommended Breakpoints

```css
/* Mobile-first: base styles are for mobile */

/* Small tablets and large phones */
@media (min-width: 640px) { }

/* Tablets */
@media (min-width: 768px) { }

/* Laptops */
@media (min-width: 1024px) { }

/* Desktops */
@media (min-width: 1280px) { }

/* Large screens */
@media (min-width: 1536px) { }
```

### Content Considerations

```css
/* Typography scales with viewport */
html {
  font-size: 16px;
}

@media (min-width: 768px) {
  html {
    font-size: 18px;
  }
}

/* Fluid typography alternative */
html {
  font-size: clamp(16px, 1vw + 14px, 20px);
}
```

## Layout Patterns

### Single Column (Mobile Default)

```css
.container {
  width: 100%;
  max-width: 100%;
  padding: 0 16px;
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
  }
}
```

### Stack to Grid

```css
.grid {
  display: grid;
  gap: 16px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Navigation Patterns

**Mobile**: Hamburger menu or bottom navigation
**Tablet**: Collapsed sidebar or horizontal nav
**Desktop**: Full horizontal navigation

```css
.nav-mobile { display: flex; }
.nav-desktop { display: none; }

@media (min-width: 768px) {
  .nav-mobile { display: none; }
  .nav-desktop { display: flex; }
}
```

## Mobile-Specific Considerations

### Prevent iOS Input Zoom

```css
/* Font size 16px or larger prevents zoom */
input, select, textarea {
  font-size: 16px;
}
```

### Disable Double-Tap Zoom

```css
/* On interactive elements */
.button {
  touch-action: manipulation;
}
```

### Safe Areas (Notches)

```css
.header {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.footer {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Viewport Configuration

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Performance for Mobile

### Image Optimization

```html
<!-- Responsive images -->
<img
  srcset="image-320.jpg 320w,
          image-640.jpg 640w,
          image-1024.jpg 1024w"
  sizes="(max-width: 640px) 100vw, 640px"
  src="image-640.jpg"
  alt="Description"
  loading="lazy"
>

<!-- Modern formats with fallback -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

### Reduce Data Usage

- Lazy load images below the fold
- Use appropriate image formats (WebP, AVIF)
- Minimize JavaScript payload
- Use system fonts when possible
- Subset custom fonts

### Touch Responsiveness

```css
/* Immediate visual feedback */
.button:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* Remove tap highlight */
.button {
  -webkit-tap-highlight-color: transparent;
}
```

## Forms on Mobile

### Input Types

```html
<!-- Appropriate keyboards -->
<input type="email" inputmode="email">
<input type="tel" inputmode="tel">
<input type="number" inputmode="numeric">
<input type="url" inputmode="url">
<input type="search" inputmode="search">
```

### Autofill

```html
<input type="text" autocomplete="name">
<input type="email" autocomplete="email">
<input type="tel" autocomplete="tel">
<input type="text" autocomplete="street-address">
<input type="text" autocomplete="postal-code">
```

### Form Layout

```css
/* Stack labels and inputs on mobile */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

/* Side by side on larger screens */
@media (min-width: 768px) {
  .form-group {
    flex-direction: row;
    align-items: center;
  }

  .form-group label {
    width: 200px;
  }
}
```

## Testing Checklist

### Device Testing
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Test landscape orientation
- [ ] Test with different text sizes (accessibility settings)

### Interaction Testing
- [ ] All touch targets 44px minimum
- [ ] No hover-dependent functionality
- [ ] Forms work with on-screen keyboard
- [ ] Gestures have alternatives

### Performance Testing
- [ ] Test on 3G/slow connection
- [ ] First contentful paint < 2s
- [ ] Time to interactive < 5s
- [ ] No layout shifts during load

### Viewport Testing
- [ ] Content fits 320px width
- [ ] No horizontal scrolling
- [ ] Text readable without zoom
- [ ] Images scale appropriately
