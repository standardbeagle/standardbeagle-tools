---
name: form-ux
description: Design or review forms with UX best practices for usability, accessibility, and conversion optimization
---

# Form UX Command

Design new forms or review existing ones for optimal user experience.

## Process

### 1. Understand Form Purpose

Gather context:
- What data are we collecting and why?
- What's the user's motivation to complete?
- What's the cost of abandonment?
- What validation is required?

### 2. Form UX Principles

#### Reduce Friction
- Only ask for necessary information
- Remove optional fields or make them progressive
- Use smart defaults
- Enable autofill with proper attributes

#### Provide Clarity
- Clear, concise labels above fields
- Helpful placeholder text (not as labels)
- Inline help for complex fields
- Required field indication (asterisk + legend)

#### Give Feedback
- Inline validation on blur
- Clear error messages with solutions
- Success confirmation
- Progress indication for long forms

#### Enable Recovery
- Preserve data on validation errors
- Clear path to fix errors
- Auto-save for long forms
- Back navigation without data loss

### 3. Form Accessibility Checklist

#### Labels and Instructions
- [ ] Every input has a visible `<label>` with `for` attribute
- [ ] Required fields marked with asterisk AND explained in legend
- [ ] Complex fields have `aria-describedby` pointing to help text
- [ ] Fieldsets used to group related fields with `<legend>`

#### Input Types
- [ ] Correct `type` attribute (email, tel, url, number, date)
- [ ] `autocomplete` attributes for common fields
- [ ] `inputmode` for mobile keyboard optimization
- [ ] `pattern` with `title` for format requirements

#### Error Handling
- [ ] Errors associated with fields via `aria-describedby`
- [ ] Error summary at top with links to fields
- [ ] `aria-invalid="true"` on fields with errors
- [ ] `aria-live` region for dynamic error messages

#### Keyboard & Focus
- [ ] Logical tab order
- [ ] Focus moved to first error on submit
- [ ] No keyboard traps in custom controls
- [ ] Submit button clearly identified

### 4. Form Design Template

```markdown
## [Form Name] Specification

### Purpose
[What data we're collecting and why]

### User Context
- When do they encounter this form?
- What's their motivation level?
- What information do they have available?

### Fields

| Field | Type | Required | Validation | Autofill | Notes |
|-------|------|----------|------------|----------|-------|
| Email | email | Yes | Valid format | email | Primary identifier |
| Phone | tel | No | 10+ digits | tel | For account recovery |

### Field Details

#### [Field Name]
- **Label**: [Exact label text]
- **Placeholder**: [Placeholder if any]
- **Help text**: [Instructional text]
- **Error messages**:
  - Required: "[Field] is required"
  - Invalid: "[Specific format guidance]"
- **Autofill**: `autocomplete="[value]"`

### Validation Strategy
- **When**: On blur for individual fields, on submit for form
- **How**: Inline errors below fields
- **Error summary**: Yes, at top, with anchor links

### Submit Behavior
- **Button text**: [Active verb, e.g., "Create Account"]
- **Loading state**: Button disabled with spinner
- **Success**: [Redirect/message/next step]
- **Error**: [Error handling approach]

### Multi-step (if applicable)
- Step 1: [Fields and purpose]
- Step 2: [Fields and purpose]
- Progress indicator: [Style]
- Save progress: [Yes/No, how]
```

### 5. Review Existing Form

Using agnt proxy:

```javascript
// Capture form structure
__devtool.inspect('form')

// Check accessibility
__devtool.auditAccessibility()

// Test form submission
// (interact with form through proxy)
```

Evaluate:
1. **Field audit**: List all fields, are any unnecessary?
2. **Label check**: Every field properly labeled?
3. **Validation check**: Try invalid inputs, check error messages
4. **Keyboard test**: Tab through entire form
5. **Autofill test**: Does browser autofill work?

### 6. Common Form Patterns

#### Login Form
```html
<form>
  <label for="email">Email</label>
  <input type="email" id="email" autocomplete="username" required>

  <label for="password">Password</label>
  <input type="password" id="password" autocomplete="current-password" required>

  <button type="submit">Sign In</button>
</form>
```

#### Registration Form
```html
<form>
  <label for="email">Email</label>
  <input type="email" id="email" autocomplete="email" required>

  <label for="new-password">Create Password</label>
  <input type="password" id="new-password" autocomplete="new-password"
         aria-describedby="password-requirements" required>
  <p id="password-requirements">At least 8 characters with a number</p>

  <button type="submit">Create Account</button>
</form>
```

#### Address Form
```html
<fieldset>
  <legend>Shipping Address</legend>

  <label for="street">Street Address</label>
  <input type="text" id="street" autocomplete="street-address" required>

  <label for="city">City</label>
  <input type="text" id="city" autocomplete="address-level2" required>

  <label for="state">State</label>
  <select id="state" autocomplete="address-level1" required>...</select>

  <label for="zip">ZIP Code</label>
  <input type="text" id="zip" autocomplete="postal-code"
         inputmode="numeric" pattern="[0-9]{5}" required>
</fieldset>
```

### 7. Form Testing Checklist

Before shipping:

- [ ] Complete form with keyboard only
- [ ] Test with screen reader
- [ ] Trigger every validation error
- [ ] Test autofill with browser
- [ ] Test on mobile device
- [ ] Test with slow network (loading states)
- [ ] Test session timeout handling
- [ ] Test back/forward navigation
- [ ] Verify data reaches backend correctly

### 8. Optimization Recommendations

After review, suggest:
- Fields to remove or make optional
- Better input types to use
- Autofill attributes to add
- Error message improvements
- Validation timing adjustments
- Mobile-specific enhancements
