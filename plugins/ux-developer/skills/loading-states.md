---
name: loading-states
description: Loading state patterns for responsive, accessible, and visually polished user feedback
---

# Loading States UX

Design loading experiences that keep users informed and engaged.

## When to Show Loading

| Delay | User Perception | Recommended Pattern |
|-------|-----------------|---------------------|
| < 100ms | Instantaneous | No indicator needed |
| 100-300ms | Slight delay | Consider subtle indicator |
| 300ms-1s | Noticeable | Show spinner or progress |
| 1-10s | Slow | Progress bar + message |
| > 10s | Very slow | Detailed progress + cancel |

## Loading Patterns

### Spinners

**When to use**: Unknown duration, relatively quick operations

```html
<!-- Basic spinner -->
<div class="spinner" role="status" aria-label="Loading">
  <svg class="spinner-icon" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor"
            stroke-width="3" fill="none" opacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"
          stroke-width="3" fill="none"/>
  </svg>
</div>

<!-- Button with spinner -->
<button disabled aria-busy="true">
  <span class="spinner-sm" aria-hidden="true"></span>
  <span>Saving...</span>
</button>
```

```css
.spinner-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .spinner-icon {
    animation: none;
  }
}
```

### Progress Bars

**When to use**: Known progress, file uploads, multi-step processes

```html
<!-- Determinate progress -->
<div role="progressbar"
     aria-valuenow="45"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Upload progress: 45%">
  <div class="progress-bar" style="width: 45%"></div>
</div>

<!-- Indeterminate progress -->
<div role="progressbar"
     aria-label="Loading content"
     class="progress-indeterminate">
  <div class="progress-bar"></div>
</div>
```

```css
.progress-indeterminate .progress-bar {
  width: 30%;
  animation: indeterminate 1.5s ease-in-out infinite;
}

@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
```

### Skeleton Screens

**When to use**: Content loading, known layout structure

```html
<div class="card card--loading" aria-busy="true" aria-label="Loading card">
  <div class="skeleton skeleton-image"></div>
  <div class="skeleton skeleton-title"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text skeleton-text--short"></div>
</div>
```

```css
.skeleton {
  background: linear-gradient(90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin-bottom: 12px;
}

.skeleton-text {
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton-text--short {
  width: 40%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: #e0e0e0;
  }
}
```

### Blur/Placeholder (LQIP)

**When to use**: Image loading, visual continuity

```html
<div class="image-container">
  <!-- Low quality placeholder -->
  <img src="data:image/jpeg;base64,/9j/4AAQ..."
       class="image-placeholder"
       aria-hidden="true">
  <!-- Full image -->
  <img src="full-image.jpg"
       alt="Description"
       loading="lazy"
       onload="this.classList.add('loaded')">
</div>
```

```css
.image-container {
  position: relative;
}

.image-placeholder {
  position: absolute;
  inset: 0;
  filter: blur(20px);
  transform: scale(1.1);
}

.image-container img:not(.image-placeholder) {
  opacity: 0;
  transition: opacity 0.3s;
}

.image-container img.loaded {
  opacity: 1;
}
```

## Page-Level Loading

### Initial Page Load

```html
<!-- Critical CSS inline, defer non-critical -->
<style>
  .page-loader {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    z-index: 9999;
  }
</style>

<div class="page-loader" role="status" aria-label="Loading page">
  <div class="spinner"></div>
</div>
```

### Route/Navigation Loading

```html
<!-- Top progress bar (like YouTube/GitHub) -->
<div class="nav-progress" role="progressbar" aria-label="Loading page">
  <div class="nav-progress-bar"></div>
</div>
```

```css
.nav-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 9999;
}

.nav-progress-bar {
  height: 100%;
  background: #0066cc;
  transition: width 0.2s;
}
```

## Component-Level Loading

### List Loading

```html
<ul class="list" aria-busy="true">
  <li class="skeleton-item">
    <div class="skeleton skeleton-avatar"></div>
    <div class="skeleton skeleton-text"></div>
  </li>
  <!-- Repeat 3-5 skeleton items -->
</ul>
```

### Button Loading

```html
<!-- Before -->
<button type="submit">Submit</button>

<!-- During -->
<button type="submit" disabled aria-busy="true">
  <span class="btn-spinner" aria-hidden="true"></span>
  <span>Submitting...</span>
</button>

<!-- After (success) -->
<button type="submit" class="btn-success">
  <svg aria-hidden="true">✓</svg>
  <span>Submitted!</span>
</button>
```

### Infinite Scroll Loading

```html
<ul class="feed">
  <!-- Existing items -->
</ul>

<!-- Load more trigger -->
<div class="load-more" aria-live="polite">
  <div class="spinner" role="status">
    <span class="sr-only">Loading more items...</span>
  </div>
</div>
```

## Accessibility Requirements

### ARIA Attributes

```html
<!-- Spinner -->
<div role="status" aria-label="Loading">
  <span class="sr-only">Loading...</span>
</div>

<!-- Progress bar -->
<div role="progressbar"
     aria-valuenow="45"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="File upload: 45% complete">
</div>

<!-- Loading region -->
<section aria-busy="true" aria-live="polite">
  <!-- Content being loaded -->
</section>
```

### Focus Management

```javascript
// After loading completes
function onLoadComplete() {
  // Remove loading state
  container.removeAttribute('aria-busy');

  // Announce to screen readers
  announcer.textContent = 'Content loaded';

  // Move focus if appropriate
  if (userInitiated) {
    firstNewItem.focus();
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .spinner,
  .skeleton,
  .progress-bar {
    animation: none;
  }

  /* Use opacity change instead */
  .skeleton {
    opacity: 0.5;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    50% { opacity: 0.3; }
  }
}
```

## Loading Performance Patterns

### Optimistic UI

```javascript
// Update UI immediately, revert on error
async function likePost(postId) {
  // Optimistic update
  updateLikeCount(postId, +1);

  try {
    await api.likePost(postId);
  } catch (error) {
    // Revert on failure
    updateLikeCount(postId, -1);
    showError('Could not like post');
  }
}
```

### Lazy Loading

```html
<!-- Native lazy loading for images -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- Intersection Observer for components -->
<div class="lazy-component" data-component="heavy-chart">
  <!-- Placeholder until in viewport -->
</div>
```

### Prioritized Loading

```javascript
// Load critical content first
async function loadPage() {
  // Critical: header, main content
  await loadCriticalContent();

  // Secondary: sidebar, comments
  loadSecondaryContent();

  // Tertiary: analytics, ads
  requestIdleCallback(() => {
    loadTertiaryContent();
  });
}
```

## Error States After Loading

```html
<!-- Loading failed -->
<div class="error-state" role="alert">
  <svg aria-hidden="true">...</svg>
  <p>Couldn't load content</p>
  <button onclick="retry()">Try again</button>
</div>

<!-- Empty state (no results) -->
<div class="empty-state">
  <svg aria-hidden="true">...</svg>
  <p>No items yet</p>
  <button>Create your first item</button>
</div>
```
