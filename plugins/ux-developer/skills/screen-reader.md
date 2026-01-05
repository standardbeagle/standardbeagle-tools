---
name: screen-reader
description: Screen reader accessibility patterns for semantic, announced, navigable content
---

# Screen Reader Accessibility

Build experiences that work well with screen readers.

## How Screen Readers Work

Screen readers:
- Read content linearly through the DOM
- Navigate by landmarks, headings, links, forms
- Announce element roles, names, and states
- Respond to ARIA attributes

## Semantic HTML First

### Use Native Elements

```html
<!-- Native elements have built-in accessibility -->
<button>Click me</button>        <!-- Announced as "button" -->
<a href="/page">Link text</a>    <!-- Announced as "link" -->
<input type="checkbox">          <!-- Announced as "checkbox" -->

<!-- Avoid div/span for interactive elements -->
<!-- BAD: -->
<div onclick="doSomething()">Click me</div>

<!-- If you must, add ARIA: -->
<div role="button" tabindex="0" onclick="doSomething()">
  Click me
</div>
```

### Landmarks

```html
<header role="banner">           <!-- "banner" landmark -->
  <nav aria-label="Main">        <!-- "navigation" landmark -->
    ...
  </nav>
</header>

<main role="main">               <!-- "main" landmark -->
  <article>...</article>
</main>

<aside role="complementary">     <!-- "complementary" landmark -->
  ...
</aside>

<footer role="contentinfo">      <!-- "contentinfo" landmark -->
  ...
</footer>
```

### Headings

```html
<!-- Screen readers navigate by headings -->
<h1>Page Title</h1>              <!-- "heading level 1" -->
  <h2>Section</h2>               <!-- "heading level 2" -->
    <h3>Subsection</h3>          <!-- "heading level 3" -->

<!-- Don't skip levels -->
<h1>Title</h1>
<h3>Section</h3>  <!-- BAD: skipped h2 -->
```

## Accessible Names

### Labels

```html
<!-- Form inputs need labels -->
<label for="email">Email address</label>
<input type="email" id="email">

<!-- Announces: "Email address, edit text" -->

<!-- Or wrap input in label -->
<label>
  Email address
  <input type="email">
</label>
```

### aria-label

```html
<!-- When visible label isn't appropriate -->
<button aria-label="Close dialog">
  <svg>×</svg>
</button>
<!-- Announces: "Close dialog, button" -->

<!-- Icon-only buttons -->
<button aria-label="Search">
  <svg class="search-icon">...</svg>
</button>

<!-- Navigation landmarks -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Footer links">...</nav>
```

### aria-labelledby

```html
<!-- Reference existing text -->
<h2 id="billing-heading">Billing Address</h2>
<form aria-labelledby="billing-heading">
  ...
</form>

<!-- Multiple sources -->
<button aria-labelledby="action item-name">
  <span id="action">Delete</span>
</button>
<span id="item-name">Document.pdf</span>
<!-- Announces: "Delete Document.pdf, button" -->
```

### aria-describedby

```html
<!-- Additional description -->
<label for="password">Password</label>
<input type="password" id="password"
       aria-describedby="password-hint">
<p id="password-hint">
  At least 8 characters with a number
</p>
<!-- Announces: "Password, edit text, At least 8 characters with a number" -->
```

## Live Regions

### Announcing Dynamic Content

```html
<!-- Polite: waits for pause in speech -->
<div aria-live="polite">
  Search found 5 results
</div>

<!-- Assertive: interrupts immediately -->
<div aria-live="assertive" role="alert">
  Error: Form submission failed
</div>

<!-- Status: polite + role="status" -->
<div role="status">
  Saving...
</div>
```

### Implementation

```html
<!-- Add empty container, then fill it -->
<div id="announcer" aria-live="polite" class="sr-only"></div>
```

```javascript
function announce(message) {
  const announcer = document.getElementById('announcer');
  announcer.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

// Usage
announce('Item added to cart');
announce('Search returned 5 results');
```

## Hidden Content

### Visually Hidden (SR Only)

```css
/* Visible to screen readers, hidden visually */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Becomes visible on focus (for skip links) */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

```html
<!-- Add context for screen readers -->
<button>
  Delete
  <span class="sr-only">Document.pdf</span>
</button>
<!-- Announces: "Delete Document.pdf, button" -->
```

### Hidden from Screen Readers

```html
<!-- Decorative content -->
<img src="decorative.png" alt="" role="presentation">
<svg aria-hidden="true">...</svg>

<!-- Duplicated content -->
<a href="/profile">
  <img src="avatar.jpg" alt=""> <!-- Don't repeat name -->
  <span>John Doe</span>
</a>
```

## ARIA States

### Common States

```html
<!-- Expanded/collapsed -->
<button aria-expanded="false" aria-controls="menu">
  Menu
</button>
<ul id="menu" hidden>...</ul>

<!-- Selected -->
<li role="option" aria-selected="true">Option 1</li>

<!-- Pressed (toggle buttons) -->
<button aria-pressed="false">Mute</button>

<!-- Checked -->
<div role="checkbox" aria-checked="true">...</div>

<!-- Disabled -->
<button aria-disabled="true">Submit</button>

<!-- Invalid -->
<input aria-invalid="true" aria-describedby="error">
<p id="error">Please enter a valid email</p>

<!-- Busy/loading -->
<div aria-busy="true">Loading content...</div>
```

## Testing with Screen Readers

### Quick Test Flow

1. **Turn on screen reader**
   - macOS: Cmd+F5 (VoiceOver)
   - Windows: Start NVDA or Narrator

2. **Navigate by landmarks**
   - VoiceOver: VO+U, select Landmarks
   - NVDA: D for landmarks

3. **Navigate by headings**
   - VoiceOver: VO+Cmd+H
   - NVDA: H for next heading

4. **Tab through interactive elements**
   - Check all are reachable
   - Check announcements are clear

5. **Test forms**
   - Labels announced correctly
   - Errors announced
   - Required fields indicated

6. **Test dynamic content**
   - Changes announced
   - Focus managed properly

### Common Issues

| Issue | Solution |
|-------|----------|
| No accessible name | Add label, aria-label, or aria-labelledby |
| Image not described | Add meaningful alt text |
| Button says "button" only | Add text content or aria-label |
| Link says "link" only | Use descriptive link text |
| Form field not labeled | Associate label with for/id |
| Dynamic content not announced | Use aria-live region |
| Focus lost after action | Manage focus programmatically |

## Checklist

- [ ] All interactive elements have accessible names
- [ ] All images have appropriate alt text
- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] Landmarks used to structure page
- [ ] Form inputs have associated labels
- [ ] Error messages associated with fields
- [ ] Dynamic content changes announced
- [ ] Decorative content hidden from SR
- [ ] Focus managed after page changes
- [ ] Content makes sense when read linearly
