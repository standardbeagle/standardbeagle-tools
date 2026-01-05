---
name: error-handling
description: Error handling UX patterns for helpful, accessible, and recoverable error states
---

# Error Handling UX

Design error experiences that help users understand and recover.

## Error Message Principles

### What Makes a Good Error Message

1. **Explain what happened** - In plain language
2. **Explain why** - If helpful
3. **Tell how to fix** - Actionable next step
4. **Don't blame the user** - Never "you failed to..."

### Error Message Template

```
[What went wrong] + [How to fix it]

Examples:
- "Email address is missing the @ symbol. Please check and try again."
- "We couldn't connect to the server. Please check your internet connection."
- "This username is already taken. Try adding numbers or try a different name."
```

### Tone Guidelines

| Avoid | Use Instead |
|-------|-------------|
| "Invalid input" | "Please enter a valid email address" |
| "Error 500" | "Something went wrong on our end" |
| "Failed to submit" | "We couldn't save your changes" |
| "You entered wrong data" | "This field needs a different format" |
| "Unauthorized" | "Please sign in to continue" |

## Error Types and Patterns

### Form Validation Errors

**Inline (Field-Level)**
```html
<div class="field field--error">
  <label for="email">Email address</label>
  <input type="email" id="email"
         aria-invalid="true"
         aria-describedby="email-error">
  <p id="email-error" class="error" role="alert">
    <svg aria-hidden="true" class="error-icon">...</svg>
    Please enter a valid email address (e.g., name@example.com)
  </p>
</div>
```

**Summary (Form-Level)**
```html
<div class="error-summary" role="alert">
  <h2>There were 2 problems with your submission</h2>
  <ul>
    <li><a href="#email">Enter a valid email address</a></li>
    <li><a href="#password">Password must be at least 8 characters</a></li>
  </ul>
</div>
```

**Focus Management**
```javascript
// On form submit with errors:
// 1. Show error summary at top of form
// 2. Move focus to error summary
// 3. Error summary links jump to each field

form.addEventListener('submit', (e) => {
  const errors = validate();
  if (errors.length) {
    e.preventDefault();
    showErrorSummary(errors);
    document.querySelector('.error-summary').focus();
  }
});
```

### Network/System Errors

**Full-Page Error**
```html
<main class="error-page">
  <h1>Something went wrong</h1>
  <p>We're having trouble loading this page. This might be temporary.</p>

  <div class="error-actions">
    <button onclick="location.reload()">Try again</button>
    <a href="/">Go to homepage</a>
  </div>

  <!-- Optional: error details for technical users -->
  <details>
    <summary>Technical details</summary>
    <code>Error 500: Internal server error at /api/data</code>
  </details>
</main>
```

**Inline Error (Component Level)**
```html
<div class="card card--error" role="alert">
  <p class="error-message">
    <svg aria-hidden="true">...</svg>
    Couldn't load recent orders
  </p>
  <button onclick="retryLoad()">Try again</button>
</div>
```

**Toast/Notification**
```html
<!-- For non-blocking errors -->
<div class="toast toast--error" role="alert" aria-live="polite">
  <p>Couldn't save changes. <button>Retry</button></p>
  <button aria-label="Dismiss" onclick="dismissToast()">×</button>
</div>
```

### Empty States with Errors

```html
<div class="empty-state">
  <svg aria-hidden="true" class="empty-icon">...</svg>
  <h2>No search results</h2>
  <p>We couldn't find anything matching "xyz123"</p>
  <ul class="suggestions">
    <li>Check your spelling</li>
    <li>Try more general keywords</li>
    <li>Remove filters</li>
  </ul>
  <button onclick="clearSearch()">Clear search</button>
</div>
```

## Error Prevention

### Constrained Inputs

```html
<!-- Prevent impossible values -->
<input type="date" min="2024-01-01" max="2024-12-31">
<input type="number" min="1" max="100">
<select required>
  <option value="">Choose an option</option>
  <!-- valid options -->
</select>
```

### Confirmation for Destructive Actions

```html
<dialog id="confirm-delete">
  <h2>Delete this item?</h2>
  <p>This action cannot be undone. The item will be permanently removed.</p>
  <div class="dialog-actions">
    <button onclick="closeDialog()">Cancel</button>
    <button class="btn-danger" onclick="confirmDelete()">
      Yes, delete
    </button>
  </div>
</dialog>
```

### Input Formatting Assistance

```javascript
// Auto-format phone number
phoneInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 6) {
    value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6,10)}`;
  } else if (value.length >= 3) {
    value = `(${value.slice(0,3)}) ${value.slice(3)}`;
  }
  e.target.value = value;
});
```

## Recovery Patterns

### Undo

```html
<div class="toast toast--success" role="status">
  <p>Message deleted</p>
  <button onclick="undoDelete()">Undo</button>
</div>
```

### Auto-Save

```html
<p class="save-status" aria-live="polite">
  <span class="status-saving">Saving...</span>
  <span class="status-saved">All changes saved</span>
  <span class="status-error">
    Couldn't save. <button>Retry</button>
  </span>
</p>
```

### Retry Logic

```javascript
async function fetchWithRetry(url, options, retries = 3) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(response.status);
    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(1000 * (4 - retries)); // Exponential backoff
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}
```

### Preserve User Input

```javascript
// On validation error, don't clear the form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const result = await submitForm(form);

  if (result.errors) {
    showErrors(result.errors);
    // Form data is preserved automatically
    // Focus moves to first error field
  } else {
    // Only redirect/clear on success
    window.location = result.redirectUrl;
  }
});
```

## Accessibility Requirements

### Screen Reader Announcements

```html
<!-- Immediate announcement -->
<p role="alert">Email address is required</p>

<!-- Polite announcement (when not urgent) -->
<p aria-live="polite">Search found 0 results</p>

<!-- Associate error with field -->
<input aria-describedby="email-error" aria-invalid="true">
<p id="email-error">Please enter a valid email</p>
```

### Focus Management

```javascript
// Move focus to error summary
errorSummary.focus();

// Or to first field with error
firstErrorField.focus();

// Make error summary focusable
errorSummary.setAttribute('tabindex', '-1');
```

### Visual Indicators

```css
/* Don't rely on color alone */
.error {
  color: #d32f2f;           /* Color */
  border-left: 4px solid;   /* Shape */
}

.error::before {
  content: "⚠";             /* Icon */
  margin-right: 0.5em;
}

/* High contrast error states */
.field--error input {
  border-color: #d32f2f;
  background-color: #ffebee;
  outline: 2px solid #d32f2f;
}
```

## Error Tracking

### What to Log

```javascript
// Log errors with context
logError({
  error: error.message,
  stack: error.stack,
  component: 'CheckoutForm',
  action: 'submit',
  userId: user?.id,
  timestamp: Date.now(),
  url: window.location.href,
  userAgent: navigator.userAgent
});
```

### Error Boundaries (React)

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```
