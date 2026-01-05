---
name: wcag-guidelines
description: WCAG 2.2 accessibility guidelines reference for web development
---

# WCAG 2.2 Guidelines Reference

Web Content Accessibility Guidelines for building inclusive web experiences.

## WCAG Principles: POUR

### Perceivable
Information must be presentable in ways users can perceive.

### Operable
Interface components must be operable by all users.

### Understandable
Information and UI operation must be understandable.

### Robust
Content must be robust enough for diverse user agents and assistive technologies.

---

## Level A (Minimum)

### 1.1 Text Alternatives

**1.1.1 Non-text Content**
All non-text content has text alternative.

```html
<!-- Images -->
<img src="chart.png" alt="Sales increased 25% in Q4 2024">

<!-- Decorative images -->
<img src="divider.png" alt="" role="presentation">

<!-- Complex images -->
<figure>
  <img src="diagram.png" alt="System architecture overview">
  <figcaption>Detailed description of the architecture...</figcaption>
</figure>

<!-- Icons with meaning -->
<button>
  <svg aria-hidden="true">...</svg>
  <span class="sr-only">Delete item</span>
</button>
```

### 1.3 Adaptable

**1.3.1 Info and Relationships**
Structure conveyed through presentation is available programmatically.

```html
<!-- Use semantic HTML -->
<nav aria-label="Main navigation">...</nav>
<main>...</main>
<aside>...</aside>

<!-- Proper heading hierarchy -->
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>

<!-- Data tables -->
<table>
  <caption>Monthly Sales</caption>
  <thead>
    <tr><th scope="col">Month</th><th scope="col">Sales</th></tr>
  </thead>
  <tbody>...</tbody>
</table>
```

**1.3.2 Meaningful Sequence**
Reading order is logical and intuitive.

**1.3.3 Sensory Characteristics**
Instructions don't rely solely on shape, size, location, or sound.

```html
<!-- Bad -->
<p>Click the round button on the right</p>

<!-- Good -->
<p>Click the "Submit" button to continue</p>
```

### 1.4 Distinguishable

**1.4.1 Use of Color**
Color is not the only means of conveying information.

```html
<!-- Bad: color only -->
<span style="color: red">Error</span>

<!-- Good: color + icon + text -->
<span class="error">
  <svg aria-hidden="true">...</svg>
  Error: Please enter a valid email
</span>
```

### 2.1 Keyboard Accessible

**2.1.1 Keyboard**
All functionality available via keyboard.

```html
<!-- Ensure custom controls are focusable and operable -->
<div role="button" tabindex="0"
     onkeydown="handleKeyDown(event)"
     onclick="handleClick()">
  Custom Button
</div>
```

**2.1.2 No Keyboard Trap**
Focus can be moved away from any component using keyboard.

### 2.4 Navigable

**2.4.1 Bypass Blocks**
Skip repetitive content blocks.

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

**2.4.2 Page Titled**
Pages have descriptive titles.

```html
<title>Product Details - My Store</title>
```

**2.4.3 Focus Order**
Focus order preserves meaning and operability.

**2.4.4 Link Purpose (In Context)**
Link purpose determinable from link text or context.

```html
<!-- Bad -->
<a href="/article">Read more</a>

<!-- Good -->
<a href="/article">Read more about accessibility guidelines</a>
```

### 3.1 Readable

**3.1.1 Language of Page**
Default language is programmatically determinable.

```html
<html lang="en">
```

### 4.1 Compatible

**4.1.2 Name, Role, Value**
Custom UI components expose name, role, and state.

```html
<button aria-expanded="false" aria-controls="menu">
  Menu
</button>
<ul id="menu" hidden>...</ul>
```

---

## Level AA (Target for Most Sites)

### 1.4 Distinguishable

**1.4.3 Contrast (Minimum)**
- Text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio

**1.4.4 Resize Text**
Text resizable to 200% without loss of functionality.

**1.4.5 Images of Text**
Use actual text instead of images of text.

**1.4.10 Reflow**
Content reflows at 320px width without horizontal scrolling.

**1.4.11 Non-text Contrast**
UI components and graphics have 3:1 contrast.

**1.4.12 Text Spacing**
No loss of content when text spacing is adjusted.

**1.4.13 Content on Hover or Focus**
Additional content on hover/focus is dismissible, hoverable, and persistent.

### 2.4 Navigable

**2.4.5 Multiple Ways**
Multiple ways to locate pages within a site.

**2.4.6 Headings and Labels**
Headings and labels describe topic or purpose.

**2.4.7 Focus Visible**
Keyboard focus indicator is visible.

```css
:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* Never do this without replacement */
/* :focus { outline: none; } */
```

### 2.5 Input Modalities

**2.5.3 Label in Name**
Accessible name contains visible label text.

```html
<!-- Visible label: "Search" -->
<!-- Accessible name must include "Search" -->
<input type="search" aria-label="Search products">
```

### 3.2 Predictable

**3.2.3 Consistent Navigation**
Navigation is consistent across pages.

**3.2.4 Consistent Identification**
Components with same function identified consistently.

### 3.3 Input Assistance

**3.3.1 Error Identification**
Errors are identified and described in text.

**3.3.2 Labels or Instructions**
Labels or instructions provided for user input.

**3.3.3 Error Suggestion**
Suggestions for fixing errors when known.

**3.3.4 Error Prevention (Legal, Financial, Data)**
Submissions are reversible, checked, or confirmed.

---

## Level AAA (Enhanced)

Notable AAA criteria:

**1.4.6 Contrast (Enhanced)**: 7:1 for text, 4.5:1 for large text

**2.4.9 Link Purpose (Link Only)**: Purpose determinable from link text alone

**3.1.5 Reading Level**: Content readable at lower secondary education level

---

## Quick Reference Checklist

### Before Development
- [ ] Design reviewed for color contrast
- [ ] Semantic HTML structure planned
- [ ] Keyboard interaction patterns defined
- [ ] Error states designed accessibly

### During Development
- [ ] Semantic HTML used correctly
- [ ] ARIA only when HTML insufficient
- [ ] Focus management implemented
- [ ] Form labels properly associated
- [ ] Alt text for all meaningful images
- [ ] Skip links implemented
- [ ] Language attribute set

### Before Launch
- [ ] Automated accessibility audit passes
- [ ] Keyboard-only navigation tested
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Zoom to 200% tested
- [ ] Color contrast verified
- [ ] Form error handling tested

---

## Testing Tools

**Automated**:
- axe DevTools (browser extension)
- Lighthouse Accessibility
- WAVE (webaim.org/wave)
- pa11y (CLI)

**Manual**:
- Keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver, JAWS)
- Browser zoom testing
- Color contrast analyzers

**agnt Integration**:
```javascript
// Run accessibility audit via agnt proxy
__devtool.auditAccessibility()
```
