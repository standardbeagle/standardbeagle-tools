---
name: keyboard-navigation
description: Keyboard accessibility patterns for operable, navigable interfaces
---

# Keyboard Navigation

Make all functionality accessible to keyboard users.

## Core Principles

1. **All functionality available** - No mouse-only features
2. **Visible focus** - Always show where focus is
3. **Logical order** - Tab order follows visual flow
4. **No traps** - Users can always move focus away
5. **Shortcuts for efficiency** - Power users benefit

## Focus Management

### Focus Visibility

```css
/* Never remove focus without replacement */
/* BAD: */
:focus { outline: none; }

/* GOOD: Custom focus styles */
:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* For mouse users who don't need focus ring */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

### Focus Order

```html
<!-- DOM order should match visual order -->
<header>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
<main>
  <h1>Page Title</h1>
  <button>Primary Action</button>
</main>

<!-- Avoid CSS that reorders content -->
<!-- BAD: CSS order with different DOM order -->
```

### Managing Focus Programmatically

```javascript
// Move focus after dynamic content changes
function openModal() {
  modal.hidden = false;
  modal.querySelector('h2').focus();
}

function closeModal() {
  modal.hidden = true;
  triggerButton.focus(); // Return focus to trigger
}

// Focus first error on form validation
function handleValidation(errors) {
  if (errors.length) {
    document.getElementById(errors[0].fieldId).focus();
  }
}
```

## Keyboard Patterns

### Tab Navigation

```html
<!-- Naturally focusable elements -->
<a href="/link">Link</a>
<button>Button</button>
<input type="text">
<select>...</select>
<textarea></textarea>

<!-- Make non-interactive elements focusable -->
<div tabindex="0" role="button">Custom Button</div>

<!-- Remove from tab order but allow programmatic focus -->
<div tabindex="-1" id="modal">Modal content</div>

<!-- Never use tabindex > 0 -->
<!-- BAD: <button tabindex="5">...</button> -->
```

### Standard Keyboard Controls

| Element | Keys | Action |
|---------|------|--------|
| Links | Enter | Activate |
| Buttons | Enter, Space | Activate |
| Checkboxes | Space | Toggle |
| Radio buttons | Arrows | Move selection |
| Select | Arrows, Enter | Navigate, select |
| Tabs | Arrows | Switch tabs |
| Menus | Arrows, Enter, Esc | Navigate, select, close |
| Modals | Esc | Close |

### Arrow Key Navigation

```javascript
// Roving tabindex pattern for groups
const items = toolbar.querySelectorAll('button');

toolbar.addEventListener('keydown', (e) => {
  const current = document.activeElement;
  const index = Array.from(items).indexOf(current);

  let next;
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      next = items[(index + 1) % items.length];
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      next = items[(index - 1 + items.length) % items.length];
      break;
    case 'Home':
      next = items[0];
      break;
    case 'End':
      next = items[items.length - 1];
      break;
  }

  if (next) {
    e.preventDefault();
    current.tabIndex = -1;
    next.tabIndex = 0;
    next.focus();
  }
});
```

## Component Patterns

### Modal Dialogs

```html
<div role="dialog"
     aria-modal="true"
     aria-labelledby="modal-title"
     tabindex="-1">
  <h2 id="modal-title">Modal Title</h2>
  <button>First focusable</button>
  <button>Last focusable</button>
  <button class="close" aria-label="Close">×</button>
</div>
```

```javascript
// Trap focus within modal
const modal = document.querySelector('[role="dialog"]');
const focusable = modal.querySelectorAll(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);
const first = focusable[0];
const last = focusable[focusable.length - 1];

modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (e.key === 'Escape') {
    closeModal();
  }
});
```

### Dropdown Menus

```html
<div class="dropdown">
  <button aria-haspopup="true"
          aria-expanded="false"
          aria-controls="dropdown-menu">
    Menu
  </button>
  <ul id="dropdown-menu" role="menu" hidden>
    <li role="menuitem"><a href="#">Option 1</a></li>
    <li role="menuitem"><a href="#">Option 2</a></li>
    <li role="menuitem"><a href="#">Option 3</a></li>
  </ul>
</div>
```

```javascript
// Dropdown keyboard handling
button.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openMenu();
    menu.querySelector('[role="menuitem"]').focus();
  }
});

menu.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      focusNext();
      break;
    case 'ArrowUp':
      e.preventDefault();
      focusPrevious();
      break;
    case 'Escape':
      closeMenu();
      button.focus();
      break;
    case 'Tab':
      closeMenu();
      break;
  }
});
```

### Tabs

```html
<div class="tabs">
  <div role="tablist">
    <button role="tab"
            id="tab-1"
            aria-selected="true"
            aria-controls="panel-1">Tab 1</button>
    <button role="tab"
            id="tab-2"
            aria-selected="false"
            aria-controls="panel-2"
            tabindex="-1">Tab 2</button>
  </div>

  <div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    Content 1
  </div>
  <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    Content 2
  </div>
</div>
```

```javascript
// Tab keyboard handling
tablist.addEventListener('keydown', (e) => {
  const tabs = tablist.querySelectorAll('[role="tab"]');
  const current = document.activeElement;
  const index = Array.from(tabs).indexOf(current);

  let next;
  switch (e.key) {
    case 'ArrowRight':
      next = tabs[(index + 1) % tabs.length];
      break;
    case 'ArrowLeft':
      next = tabs[(index - 1 + tabs.length) % tabs.length];
      break;
    case 'Home':
      next = tabs[0];
      break;
    case 'End':
      next = tabs[tabs.length - 1];
      break;
  }

  if (next) {
    e.preventDefault();
    selectTab(next);
  }
});
```

## Skip Links

```html
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>

  <header>
    <!-- Navigation, etc. -->
  </header>

  <main id="main-content" tabindex="-1">
    <!-- Main content -->
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  z-index: 9999;
  text-decoration: none;
}

.skip-link:focus {
  top: 16px;
}
```

## Keyboard Shortcuts

### Implementing Shortcuts

```javascript
document.addEventListener('keydown', (e) => {
  // Don't trigger when typing in inputs
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
    return;
  }

  // Single key shortcuts
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    switch (e.key) {
      case '/':
        e.preventDefault();
        searchInput.focus();
        break;
      case '?':
        openShortcutHelp();
        break;
    }
  }

  // Modifier shortcuts
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    save();
  }
});
```

### Document Shortcuts

```html
<!-- Provide discoverable documentation -->
<dialog id="shortcuts-help">
  <h2>Keyboard Shortcuts</h2>
  <dl>
    <dt><kbd>/</kbd></dt>
    <dd>Focus search</dd>

    <dt><kbd>?</kbd></dt>
    <dd>Show this help</dd>

    <dt><kbd>Ctrl</kbd> + <kbd>S</kbd></dt>
    <dd>Save changes</dd>
  </dl>
</dialog>
```

## Testing Checklist

- [ ] Can reach all interactive elements with Tab
- [ ] Focus order matches visual order
- [ ] Focus indicator visible on all elements
- [ ] Can activate all buttons with Enter/Space
- [ ] Can navigate menus with arrows
- [ ] Can close modals with Escape
- [ ] Focus trapped within open modals
- [ ] Focus returns to trigger when modal closes
- [ ] Skip link works and is visible on focus
- [ ] No keyboard traps anywhere
