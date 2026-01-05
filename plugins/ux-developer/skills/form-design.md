---
name: form-design
description: Form design best practices for usability, accessibility, and conversion
---

# Form Design Best Practices

Create forms that are easy to use, accessible, and convert well.

## Core Principles

1. **Only ask what you need** - Every field has a cost
2. **One column layout** - Easier to scan and complete
3. **Labels above fields** - Better scanability and mobile-friendly
4. **Inline validation** - Immediate feedback on blur
5. **Clear error messages** - Tell users how to fix, not just what's wrong

## Field Design

### Labels

```html
<!-- Always use labels, never placeholder-only -->
<div class="field">
  <label for="email">Email address</label>
  <input type="email" id="email" name="email">
</div>

<!-- Required field indication -->
<label for="name">
  Full name
  <span class="required" aria-hidden="true">*</span>
</label>

<!-- Include legend for required fields -->
<p class="form-legend">
  <span aria-hidden="true">*</span> Required fields
</p>
```

### Placeholders

```html
<!-- Placeholder as example, not label -->
<label for="phone">Phone number</label>
<input type="tel" id="phone" placeholder="(555) 123-4567">

<!-- Never use placeholder as only label -->
<!-- BAD: <input placeholder="Enter your email"> -->
```

### Help Text

```html
<label for="password">Password</label>
<input type="password" id="password"
       aria-describedby="password-help">
<p id="password-help" class="help-text">
  At least 8 characters with one number and one special character
</p>
```

## Input Types and Attributes

### Choosing Input Types

| Data | Type | Inputmode | Autocomplete |
|------|------|-----------|--------------|
| Email | `email` | `email` | `email` |
| Phone | `tel` | `tel` | `tel` |
| URL | `url` | `url` | `url` |
| Number | `text` | `numeric` | varies |
| Date | `date` or text+picker | | varies |
| Password | `password` | | `current-password` or `new-password` |
| Search | `search` | `search` | |

### Input Attributes

```html
<!-- Email with autofill -->
<input type="email"
       autocomplete="email"
       autocapitalize="none"
       spellcheck="false">

<!-- Phone number -->
<input type="tel"
       inputmode="tel"
       autocomplete="tel"
       pattern="[0-9\-\+\s\(\)]+">

<!-- Currency/number -->
<input type="text"
       inputmode="decimal"
       pattern="[0-9]*\.?[0-9]*">

<!-- Credit card -->
<input type="text"
       inputmode="numeric"
       autocomplete="cc-number"
       pattern="[0-9 ]{13,19}">
```

## Validation

### Inline Validation Strategy

```javascript
// Validate on blur (leave field), not on every keystroke
input.addEventListener('blur', validate);

// Also validate on submit
form.addEventListener('submit', validateAll);

// Clear error when user starts typing
input.addEventListener('input', clearError);
```

### Error Messages

```html
<!-- Good: Specific and helpful -->
<p class="error" role="alert">
  Email must include @ and a domain (e.g., name@example.com)
</p>

<!-- Bad: Vague -->
<p class="error">Invalid email</p>
```

### Error Patterns

```html
<div class="field field--error">
  <label for="email">Email address</label>
  <input type="email" id="email"
         aria-invalid="true"
         aria-describedby="email-error">
  <p id="email-error" class="error" role="alert">
    Please enter a valid email address
  </p>
</div>
```

### Error Summary

```html
<!-- At top of form on submit -->
<div class="error-summary" role="alert" aria-labelledby="error-heading">
  <h2 id="error-heading">Please fix the following errors:</h2>
  <ul>
    <li><a href="#email">Email address is required</a></li>
    <li><a href="#password">Password must be at least 8 characters</a></li>
  </ul>
</div>
```

## Form Structure

### Grouping Related Fields

```html
<fieldset>
  <legend>Shipping Address</legend>

  <div class="field">
    <label for="street">Street address</label>
    <input type="text" id="street" autocomplete="street-address">
  </div>

  <div class="field-row">
    <div class="field">
      <label for="city">City</label>
      <input type="text" id="city" autocomplete="address-level2">
    </div>

    <div class="field">
      <label for="zip">ZIP code</label>
      <input type="text" id="zip"
             inputmode="numeric"
             autocomplete="postal-code"
             pattern="[0-9]{5}(-[0-9]{4})?">
    </div>
  </div>
</fieldset>
```

### Multi-Step Forms

```html
<form>
  <!-- Progress indicator -->
  <nav aria-label="Form progress">
    <ol class="progress">
      <li class="progress__step progress__step--complete">
        <span class="sr-only">Completed: </span>Account
      </li>
      <li class="progress__step progress__step--current" aria-current="step">
        Shipping
      </li>
      <li class="progress__step">
        Payment
      </li>
    </ol>
  </nav>

  <!-- Current step content -->
  <fieldset>
    <legend>Step 2: Shipping Information</legend>
    <!-- fields -->
  </fieldset>

  <!-- Navigation -->
  <div class="form-actions">
    <button type="button" class="btn-secondary">Back</button>
    <button type="submit" class="btn-primary">Continue to Payment</button>
  </div>
</form>
```

## Submit Buttons

### Button Text

```html
<!-- Specific action verbs -->
<button type="submit">Create Account</button>
<button type="submit">Place Order</button>
<button type="submit">Send Message</button>

<!-- Avoid generic text -->
<!-- <button type="submit">Submit</button> -->
```

### Loading States

```html
<button type="submit" disabled aria-busy="true">
  <span class="spinner" aria-hidden="true"></span>
  Creating account...
</button>
```

### Form Actions Layout

```html
<div class="form-actions">
  <!-- Primary action on right (in LTR) -->
  <button type="button" class="btn-text">Cancel</button>
  <button type="submit" class="btn-primary">Save Changes</button>
</div>
```

## Accessibility Checklist

- [ ] Every input has an associated label
- [ ] Required fields indicated visually AND in label
- [ ] Error messages associated via `aria-describedby`
- [ ] Error messages use `role="alert"` or live region
- [ ] `aria-invalid="true"` on fields with errors
- [ ] Focus moves to error summary or first error on submit
- [ ] Form can be completed with keyboard only
- [ ] Autocomplete attributes used for common fields
- [ ] Instructions provided before form, not just after

## Conversion Optimization

### Reduce Friction
- Remove optional fields or use progressive disclosure
- Pre-fill known information
- Use smart defaults
- Allow paste in all fields (including password)

### Build Trust
- Explain why you need each piece of data
- Show security indicators for sensitive forms
- Provide privacy policy links
- Show progress for long forms

### Reduce Errors
- Use input constraints (type, pattern, min/max)
- Format as user types (phone, credit card)
- Show requirements before user makes mistake
- Preserve all input on errors

### Clear Completion
- Confirm submission clearly
- Set expectations for next steps
- Send confirmation email for important forms
- Allow printing/saving confirmation
