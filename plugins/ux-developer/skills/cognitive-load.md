---
name: cognitive-load
description: Cognitive load reduction strategies for clearer, simpler user experiences
---

# Reducing Cognitive Load

Design interfaces that are easy to understand and use.

## Cognitive Load Types

### Intrinsic Load
Inherent complexity of the task itself. Can't eliminate, but can support.

### Extraneous Load
Unnecessary complexity from poor design. Should minimize.

### Germane Load
Mental effort for learning and building understanding. Should optimize.

## Strategies

### 1. Reduce Choices

**Miller's Law**: Humans can hold 7±2 items in working memory.

```html
<!-- Too many options at once -->
<nav>
  <a href="#">Products</a>
  <a href="#">Services</a>
  <a href="#">Solutions</a>
  <a href="#">Industries</a>
  <a href="#">Resources</a>
  <a href="#">Support</a>
  <a href="#">Company</a>
  <a href="#">Partners</a>
  <a href="#">News</a>
  <a href="#">Contact</a>
</nav>

<!-- Better: Grouped, fewer top-level items -->
<nav>
  <a href="#">Products</a>
  <a href="#">Solutions</a>
  <a href="#">Resources</a>
  <a href="#">Company</a>
  <a href="#">Support</a>
</nav>
```

**Hick's Law**: Decision time increases with number of choices.

```html
<!-- Overwhelming -->
<select>
  <option>Option 1</option>
  <!-- ... 50 more options ... -->
</select>

<!-- Better: Searchable, categorized -->
<input type="text" role="combobox" placeholder="Search options...">
```

### 2. Progressive Disclosure

Show only what's needed now, reveal more on demand.

```html
<!-- Primary info visible -->
<div class="product-card">
  <h3>Product Name</h3>
  <p class="price">$49.99</p>
  <button>Add to Cart</button>

  <!-- Details on demand -->
  <details>
    <summary>View specifications</summary>
    <dl>
      <dt>Dimensions</dt><dd>10" x 8" x 2"</dd>
      <dt>Weight</dt><dd>1.5 lbs</dd>
      <dt>Material</dt><dd>Aluminum</dd>
    </dl>
  </details>
</div>
```

```html
<!-- Form sections revealed progressively -->
<form>
  <fieldset>
    <legend>1. Account Information</legend>
    <!-- Always visible -->
  </fieldset>

  <fieldset hidden>
    <legend>2. Shipping Address</legend>
    <!-- Revealed after step 1 complete -->
  </fieldset>
</form>
```

### 3. Use Recognition Over Recall

Show options rather than requiring memory.

```html
<!-- Bad: Requires remembering syntax -->
<label>Date (MM/DD/YYYY)</label>
<input type="text" placeholder="MM/DD/YYYY">

<!-- Good: Date picker removes recall need -->
<label>Date</label>
<input type="date">

<!-- Good: Recent/saved items -->
<label>Shipping Address</label>
<select>
  <option>Home - 123 Main St, City</option>
  <option>Work - 456 Office Blvd, Town</option>
  <option value="new">+ Add new address</option>
</select>
```

### 4. Group Related Information

**Gestalt principle of proximity**: Items close together are perceived as related.

```html
<!-- Unorganized -->
<form>
  <input placeholder="First name">
  <input placeholder="Email">
  <input placeholder="Last name">
  <input placeholder="Phone">
</form>

<!-- Organized by relationship -->
<form>
  <fieldset>
    <legend>Name</legend>
    <input placeholder="First name">
    <input placeholder="Last name">
  </fieldset>

  <fieldset>
    <legend>Contact</legend>
    <input placeholder="Email">
    <input placeholder="Phone">
  </fieldset>
</form>
```

### 5. Provide Clear Visual Hierarchy

Direct attention to what matters.

```css
/* Primary action stands out */
.btn-primary {
  font-size: 1.125rem;
  font-weight: 600;
  padding: 16px 32px;
  background: #0066cc;
  color: white;
}

/* Secondary is subdued */
.btn-secondary {
  font-size: 1rem;
  font-weight: 400;
  padding: 12px 24px;
  background: transparent;
  border: 1px solid #ccc;
}
```

### 6. Use Consistent Patterns

Same patterns everywhere reduce learning.

```css
/* Consistent component styling */
.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 24px;
}

/* Consistent spacing scale */
:root {
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}

/* Consistent interaction patterns */
button:hover {
  transform: translateY(-1px);
}
```

### 7. Reduce Text

Write less, say more.

```html
<!-- Verbose -->
<p>
  In order to complete the registration process, you will need to
  click on the button labeled "Submit" which is located below this
  text, after which you will receive a confirmation email.
</p>

<!-- Concise -->
<p>Click Submit to complete registration. We'll send confirmation to your email.</p>
```

### 8. Smart Defaults

Pre-fill sensible choices.

```html
<!-- Pre-selected common option -->
<select>
  <option value="usa" selected>United States</option>
  <option value="canada">Canada</option>
  <!-- ... -->
</select>

<!-- Smart date defaults -->
<input type="date" value="2026-01-10"> <!-- Next week -->

<!-- Based on context -->
<select id="shipping">
  <!-- Pre-select based on user's location or history -->
</select>
```

### 9. Provide Feedback and Status

Reduce uncertainty about what's happening.

```html
<!-- Loading state -->
<button disabled aria-busy="true">
  <span class="spinner"></span>
  Saving...
</button>

<!-- Progress indication -->
<progress value="60" max="100">60% complete</progress>

<!-- Confirmation -->
<div role="status" class="toast toast-success">
  Changes saved successfully
</div>
```

### 10. Error Prevention Over Error Handling

Stop errors before they happen.

```html
<!-- Constrained input -->
<input type="number" min="1" max="100" step="1">

<!-- Real-time validation -->
<input type="email" pattern="[^@]+@[^@]+\.[^@]+">

<!-- Confirmation for destructive actions -->
<dialog id="confirm-delete">
  <p>Delete "Document.pdf"? This cannot be undone.</p>
  <button>Cancel</button>
  <button class="danger">Delete</button>
</dialog>
```

## Measuring Cognitive Load

### Indicators of High Cognitive Load

- High error rates
- Frequent backtracking
- Long task completion times
- Support requests
- User confusion in testing
- Low conversion rates

### Testing Questions

Ask users after testing:
- "On a scale of 1-10, how mentally demanding was this task?"
- "Did you feel overwhelmed at any point?"
- "Was it clear what you needed to do next?"

## Checklist

- [ ] Navigation has 7 or fewer top-level items
- [ ] Forms use progressive disclosure
- [ ] Common options are pre-selected
- [ ] Related items are visually grouped
- [ ] Primary actions are visually prominent
- [ ] Consistent patterns used throughout
- [ ] Text is concise and scannable
- [ ] Feedback provided for all actions
- [ ] Errors prevented where possible
- [ ] Users don't need to remember information
