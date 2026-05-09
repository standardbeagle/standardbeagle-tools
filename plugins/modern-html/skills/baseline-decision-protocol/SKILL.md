---
name: modern-html-baseline-decision-protocol
description: "This skill should be used whenever the agent considers using a modern HTML, CSS, or DOM feature. It enforces the Baseline-tier decision tree: auto-adopt features that have been Widely available for at least 9 months (Tier A), prompt the user (or consult project CLAUDE.md memory) for Newly-available or recently-Widely features (Tier B), and avoid Limited features unless an explicit fallback is documented (Tier C). Use when: writing CSS or HTML, picking a UI pattern, replacing a JS library, choosing a layout or animation primitive, before reaching for popover, dialog, container queries, anchor positioning, view transitions, scroll-driven animations, color-mix, oklch, or :has(). Skip when: editing code in a non-UI domain, working in a language without HTML/CSS output, or when the user has explicitly stated they want Tier-C bleeding-edge features without prompting."
when_to_use: "\"writing CSS, writing HTML, picking a UI pattern, replacing a JS library, choosing a layout or animation primitive\""
paths: "[\"**/*.{css,scss,sass,less,html,htm,jsx,tsx,vue,svelte,astro,mdx}\"]"
---

# Baseline Decision Protocol

核心律：先察 Baseline 階，後寫 code。

## 階分三等

- **甲 (Tier A)** — Widely ≥9月 → 直書。免 `@supports`。
- **乙 (Tier B)** — Newly 或 Widely <9月 → 詢用戶。或讀 `CLAUDE.md` 既存決議。
- **丙 (Tier C)** — Limited → 勿作主實。僅作漸進增強，須具 fallback。

截至 2026-05 標準。`oklch()` `color-mix()` Widely 僅 6 月，故按嚴格 9 月律屬乙。`anchor()` 2026-01 Newly，乙。`@scope` 2025-12 Newly，乙。`scroll-driven animations` Firefox 未發，丙。

## 六步決策

```
STEP 1 — 識模式範疇
  映用戶請求至 js-replacement-patterns 矩陣。
  例：modal → <dialog>；dropdown → popover+anchor；smooth scroll → scroll-behavior。

STEP 2 — 查原生對等
  consult native-html-primitives + js-replacement-patterns。
  無原生則記 JS 必要之由。

STEP 3 — 查 Baseline 階
  序：references/tier-a-features.md → tier-b-features.md → tier-c-features.md。
  不明則囑用戶驗於 web.dev/baseline 或 webstatus.dev。

STEP 4 — 應階律
  甲 → 用之。免問。
  乙 → 先讀 project CLAUDE.md 之 ## Baseline policy。已決則默從。未決則詢用戶按 Part 6 模板，並議存決議。
  丙 → 勿作主實。或 (i) JS fallback (ii) @supports 漸進增強於甲基 (iii) 棄之。

STEP 5 — 驗 a11y
  consult accessibility-primitives：必需 ARIA、focus、keyboard、reduced-motion。
  先布 a11y 後寫 code。

STEP 6 — 漸進增強
  層次：
    1. 甲基普適。
    2. 乙丙增強，包 @supports 或 feature detect。
    3. prefers-reduced-motion / prefers-color-scheme / forced-colors 守 motion 與 color。
  乙丙 block 上加單行注：
    /* Baseline Newly available (Oct 2025): same-document View Transitions */
```

## Memory contract

乙階特性無存決議時，按下模板問：

> 欲用 **[feature]**, became Baseline **[Newly|Widely]** [date] ([N]個月前). 支持: Chrome [v+], Edge [v+], Firefox [v+], Safari [v+]. 注意: [caveats from inventory].
>
> 1. **Use directly** — 老瀏覽器自然降級。
> 2. **Use with `@supports` fallback** — 甲基為底，乙層為增。
> 3. **Avoid for this project** — 用甲替代或 JS lib。
>
> Want me to remember this decision for the rest of this project?

用戶許則附 project `CLAUDE.md`：

```markdown
## Baseline policy (auto-managed by modern-html plugin)

- popover (Newly Jan 2025): use directly
- view-transitions same-document (Newly Oct 2025): use with @supports fallback
- anchor positioning (Newly Jan 2026): avoid; use Floating UI for now
- field-sizing: content (Limited): progressive enhancement only
- scroll-driven animations: avoid; use IntersectionObserver
```

## 三預設 policy

- **Conservative** — 僅甲。乙除非 `@supports` 包。
- **Modern** — 甲 + 乙 with `@supports` for risky (anchor, cross-doc view-transitions, scroll-driven)。
- **Bleeding edge** — 甲 + 乙 + 丙 with `@supports` and JS fallback inline。

## `@supports` 衛生

- 甲特性勿包 `@supports`。
- 乙特性已普及則可裸書，否則 `@supports (...)` 包。
- 丙特性必 `@supports` + JS/Tier-A fallback。
- 注意：`@supports selector(...)` 測 selector，`@supports (prop: val)` 測 property。

## Quick refs

- `references/tier-a-features.md` — 自採用清單。
- `references/tier-b-features.md` — 詢問清單。
- `references/tier-c-features.md` — 避用清單。
- `web.dev/baseline`, `webstatus.dev`, MDN compat tables, caniuse — 外部驗證。
