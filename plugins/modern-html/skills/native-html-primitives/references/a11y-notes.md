# A11y Notes for Native HTML Primitives

## `<dialog>`

- Modal `<dialog>` (via `showModal()`) auto-traps focus and inerts the rest of the document. Non-modal `show()` does neither.
- **Always** label: `aria-labelledby="id-of-heading"` or wrap a visible `<h2>` inside the dialog, or `aria-label="..."`.
- Do **not** add `role="dialog"` — already implicit. Adding it is redundant and can cause double-announcement in some SRs.
- Close paths: `dialog.close(returnValue)`, `<form method="dialog">`, ESC key (auto), `dialog.requestClose()` (B, fires `cancel` event).
- `::backdrop` is always present in modal mode. Do not rely on click-on-backdrop to close — implement explicitly with a click handler on `dialog` that checks `event.target === dialog`.
- Animating in/out from `display: none` requires `@starting-style` + `transition-behavior: allow-discrete` + `display`/`overlay` in transition list.

## Popover

- `popover` attribute does **not** create any ARIA relationship to its trigger. Add manually:
  - Tooltip semantics: `aria-describedby="popover-id"` on trigger.
  - Menu semantics: `role="menu"` on popover, `aria-haspopup="menu"` + `aria-controls="popover-id"` + `aria-expanded` on trigger (toggle on show/hide).
- `popover="auto"` (default): light-dismiss + ESC + only one auto-popover per scope.
- `popover="manual"`: programmatic only; useful for non-modal UI like toasts.
- `popover="hint"` (C): future Interop 2026.
- Popovers do **not** inert the rest of the page. They are non-modal by design.
- iOS Safari light-dismiss bug fixed in 18.3.

## `<details>` / `<summary>`

- `<summary>` reports as button with `disclosure` role. Keyboard: Enter/Space toggles. Arrow keys move focus inside.
- Do **not** apply `role="button"` or `aria-expanded` — already implicit.
- `<details name="g">` exclusive accordion (B) works without ARIA.
- Open Open UI accessibility tracker still notes some SR quirks around announcing state changes — verify with target SRs.

## `<search>`

- Implicit `role="search"` landmark. Do not add explicitly.
- Inside, place `<form role="search">` if using older browsers as fallback (does no harm; UA ignores duplicate role on `<search>`).

## `inert`

- Removes element from a11y tree, tab order, click handling, and find-in-page.
- Modal `<dialog>` auto-inerts the rest of the document — don't manually inert siblings.
- Use for: SPA route transitions (inert old view), drawer overlays, custom modals built without `<dialog>`.

## Lazy `<img>`

- `loading="lazy"` does not affect a11y, but missing `width`/`height` causes layout shift, which hurts users with cognitive disabilities and assistive tech that scrolls predictively.
- `decoding="async"` keeps main thread free.
- LCP image: never lazy. Add `fetchpriority="high"`.

## Invokers (`command`, `commandfor`)

- Buttons remain native `<button>` — keyboard + SR support intrinsic.
- `command="show-modal"` triggers the same `showModal()` path; same a11y guarantees apply.
- Custom commands (`--my-command`) fire a `CommandEvent` — handle with JS, ensure equivalent keyboard activation.
