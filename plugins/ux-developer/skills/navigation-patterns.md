---
name: navigation-patterns
description: Navigation design patterns for intuitive, accessible wayfinding
---

# Navigation Patterns

Design navigation that helps users find their way efficiently.

## Navigation Principles

1. **Be consistent** - Same navigation in same place across pages
2. **Be clear** - Labels should describe destinations, not actions
3. **Be concise** - 5-7 top-level items maximum
4. **Show location** - Users should always know where they are
5. **Be accessible** - Keyboard navigable with proper ARIA

## Primary Navigation Patterns

### Horizontal Navigation Bar

**Best for**: Desktop, 5-7 main sections

```html
<nav aria-label="Main navigation">
  <ul class="nav-list">
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li>
      <button aria-expanded="false" aria-controls="services-menu">
        Services
        <svg aria-hidden="true">▼</svg>
      </button>
      <ul id="services-menu" class="dropdown" hidden>
        <li><a href="/services/consulting">Consulting</a></li>
        <li><a href="/services/support">Support</a></li>
      </ul>
    </li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

### Hamburger Menu (Mobile)

**Best for**: Mobile devices, space-constrained layouts

```html
<nav aria-label="Main navigation">
  <button
    class="menu-toggle"
    aria-expanded="false"
    aria-controls="mobile-menu"
    aria-label="Open menu">
    <span class="hamburger-icon" aria-hidden="true"></span>
  </button>

  <div id="mobile-menu" class="mobile-menu" hidden>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/products">Products</a></li>
      <!-- ... -->
    </ul>
  </div>
</nav>
```

```javascript
// Toggle menu
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', !expanded);
  mobileMenu.hidden = expanded;

  if (!expanded) {
    // Focus first menu item when opening
    mobileMenu.querySelector('a').focus();
  }
});

// Close on Escape
mobileMenu.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
    menuButton.focus();
  }
});
```

### Sidebar Navigation

**Best for**: Apps, dashboards, deep hierarchies

```html
<nav class="sidebar" aria-label="Main navigation">
  <ul>
    <li>
      <a href="/dashboard" aria-current="page">
        <svg aria-hidden="true">📊</svg>
        <span>Dashboard</span>
      </a>
    </li>
    <li>
      <button aria-expanded="true" aria-controls="settings-submenu">
        <svg aria-hidden="true">⚙️</svg>
        <span>Settings</span>
      </button>
      <ul id="settings-submenu">
        <li><a href="/settings/profile">Profile</a></li>
        <li><a href="/settings/security">Security</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

### Bottom Navigation (Mobile)

**Best for**: Mobile apps, 3-5 main destinations

```html
<nav class="bottom-nav" aria-label="Main navigation">
  <a href="/" class="bottom-nav-item" aria-current="page">
    <svg aria-hidden="true">🏠</svg>
    <span>Home</span>
  </a>
  <a href="/search" class="bottom-nav-item">
    <svg aria-hidden="true">🔍</svg>
    <span>Search</span>
  </a>
  <a href="/cart" class="bottom-nav-item">
    <svg aria-hidden="true">🛒</svg>
    <span>Cart</span>
    <span class="badge">3</span>
  </a>
  <a href="/profile" class="bottom-nav-item">
    <svg aria-hidden="true">👤</svg>
    <span>Profile</span>
  </a>
</nav>
```

## Secondary Navigation

### Breadcrumbs

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/products/electronics">Electronics</a></li>
    <li aria-current="page">Laptops</li>
  </ol>
</nav>
```

```css
.breadcrumb li:not(:last-child)::after {
  content: "/";
  margin: 0 0.5rem;
  color: #666;
}
```

### Tabs

```html
<div class="tabs">
  <div role="tablist" aria-label="Account settings">
    <button role="tab"
            id="tab-profile"
            aria-selected="true"
            aria-controls="panel-profile">
      Profile
    </button>
    <button role="tab"
            id="tab-security"
            aria-selected="false"
            aria-controls="panel-security"
            tabindex="-1">
      Security
    </button>
    <button role="tab"
            id="tab-billing"
            aria-selected="false"
            aria-controls="panel-billing"
            tabindex="-1">
      Billing
    </button>
  </div>

  <div role="tabpanel"
       id="panel-profile"
       aria-labelledby="tab-profile">
    <!-- Profile content -->
  </div>
  <div role="tabpanel"
       id="panel-security"
       aria-labelledby="tab-security"
       hidden>
    <!-- Security content -->
  </div>
</div>
```

### Pagination

```html
<nav aria-label="Pagination">
  <ul class="pagination">
    <li>
      <a href="?page=1" aria-label="Previous page">
        <svg aria-hidden="true">←</svg>
        Previous
      </a>
    </li>
    <li><a href="?page=1">1</a></li>
    <li><a href="?page=2" aria-current="page">2</a></li>
    <li><a href="?page=3">3</a></li>
    <li><span aria-hidden="true">...</span></li>
    <li><a href="?page=10">10</a></li>
    <li>
      <a href="?page=3" aria-label="Next page">
        Next
        <svg aria-hidden="true">→</svg>
      </a>
    </li>
  </ul>
</nav>
```

## Navigation Accessibility

### Skip Links

```html
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  <a href="#main-nav" class="skip-link">
    Skip to navigation
  </a>

  <header>...</header>
  <nav id="main-nav">...</nav>
  <main id="main-content">...</main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Landmarks

```html
<header role="banner">
  <nav aria-label="Main navigation">...</nav>
</header>

<main role="main">
  <nav aria-label="Breadcrumb">...</nav>
  <!-- Page content -->
</main>

<aside role="complementary">
  <nav aria-label="Related pages">...</nav>
</aside>

<footer role="contentinfo">
  <nav aria-label="Footer navigation">...</nav>
</footer>
```

### Keyboard Navigation

```javascript
// Arrow key navigation for menu items
navList.addEventListener('keydown', (e) => {
  const items = navList.querySelectorAll('a, button');
  const current = document.activeElement;
  const index = Array.from(items).indexOf(current);

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      items[(index + 1) % items.length].focus();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      items[(index - 1 + items.length) % items.length].focus();
      break;
    case 'Home':
      e.preventDefault();
      items[0].focus();
      break;
    case 'End':
      e.preventDefault();
      items[items.length - 1].focus();
      break;
  }
});
```

## Current Page Indication

```html
<!-- Current page in navigation -->
<a href="/products" aria-current="page">Products</a>

<!-- Current step in process -->
<li aria-current="step">Shipping</li>

<!-- Current item in list -->
<li aria-current="true">Selected item</li>
```

```css
[aria-current="page"] {
  font-weight: bold;
  border-bottom: 2px solid currentColor;
}
```

## Responsive Navigation

```css
/* Mobile-first: hamburger menu */
.desktop-nav { display: none; }
.mobile-nav { display: block; }

/* Tablet and up: horizontal nav */
@media (min-width: 768px) {
  .desktop-nav { display: flex; }
  .mobile-nav { display: none; }
}

/* Large screens: expanded sidebar */
@media (min-width: 1024px) {
  .sidebar {
    width: 250px;
  }
  .sidebar-collapsed {
    width: 60px;
  }
}
```

## Navigation Checklist

- [ ] Consistent placement across pages
- [ ] Clear, descriptive labels
- [ ] Current page/section indicated
- [ ] Keyboard navigable
- [ ] Focus visible on all items
- [ ] ARIA labels on nav elements
- [ ] Skip links present
- [ ] Dropdown menus accessible
- [ ] Mobile navigation works with touch
- [ ] Navigation visible/accessible at all breakpoints
