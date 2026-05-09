---
name: simplify-code
description: "Simplify recently changed code for reuse, quality, efficiency while preserving behavior. Three parallel reviewers (reuse / quality / efficiency) over branch diff, then fix + verify. Use when: simplify recent changes, reduce duplication, dedupe utilities, polish before PR, post-feature cleanup. Skip: net-new greenfield, architecture redesign, full-codebase audit."
disable-model-invocation: true
argument-hint: "[blank for current branch diff, or describe scope]"
---

Engineer expert at simplifying code. Focus: clarity, consistency, maintainability. Preserve exact functionality. Readable explicit code over compact tricks. Apply project-specific best practices.

Review changed code for reuse, quality, efficiency. Fix issues found. Verify by running test suite.

## Step 1: Identify scope

Resolve simplification scope in order:

1. **User explicitly named scope** (file, dir, "function I just wrote", "today's changes") — use it. Do not widen.
2. **Otherwise in git repo** — diff between current branch and base (`git diff origin/main...` or configured upstream). Common case: pre-PR cleanup. No upstream/base ref → fall back to staged + unstaged (`git diff HEAD`).
3. **Outside git or no diff** — most recently modified files mentioned by user or edited earlier in conversation.

Empty scope → stop and ask. Don't guess.

## Step 2: Launch 3 review agents in parallel

Single message, three agents via `Agent` tool. Pass each the full diff (or resolved file set) for complete context. Use `model: "sonnet"` (mid-tier). Omit `mode` — user permission settings apply.

### Agent 1: Code Reuse Reviewer

Per change:
1. **Search existing utilities/helpers** that could replace new code. Check utility dirs, shared modules, files adjacent to changed ones.
2. **Flag new function duplicating existing functionality** — suggest existing.
3. **Flag inline logic that could use existing utility** — hand-rolled string manipulation, manual path handling, custom env checks, ad-hoc type guards.

### Agent 2: Code Quality Reviewer

Same changes, hacky patterns:

1. **Redundant state** — duplicates existing state, cached values that could be derived, observers/effects that could be direct calls
2. **Parameter sprawl** — adding params instead of generalizing or restructuring existing
3. **Copy-paste with slight variation** — near-duplicates that should unify with shared abstraction
4. **Leaky abstractions** — exposing internal details, breaking abstraction boundaries
5. **Stringly-typed code** — raw strings where constants/enums/branded types exist
6. **Unnecessary wrappers (framework-gated)** — JSX/Vue/Svelte/SwiftUI/Compose: wrapper containers adding no layout value when inner props (flexShrink, alignItems) suffice. Skip on non-component-tree codebases.
7. **Nested conditionals** — ternary chains, nested if/else, nested switch 3+ deep. Flatten with early returns, guards, lookup tables, if/else-if cascade.
8. **Unnecessary comments** — explaining WHAT (well-named identifiers do that), narrating change, referencing task/caller. Delete. Keep only non-obvious WHY.
9. **Dead code, unused imports/exports** — unreachable paths, unreferenced imports, exports with no callers. Verify "unused" via project linter (ESLint `no-unused-vars`/`unused-imports`, `knip`, `ruff F401`, `tsc --noUnusedLocals`, `golangci-lint unused`). Otherwise prefer `ast-grep` over plain grep. Account for re-exports (`export *`, barrels), dynamic imports, framework-specific exports (Next.js page exports, RSC, decorators). False positives high-cost — uncertain → skip.

### Agent 3: Efficiency Reviewer

Same changes, efficiency:

1. **Unnecessary work** — redundant computations, repeated file reads, duplicate API calls, N+1
2. **Missed concurrency** — independent ops sequential when parallelizable
3. **Hot-path bloat** — new blocking work in startup/per-request/per-render paths
4. **Recurring no-op updates** — state/store updates in polling/intervals/handlers firing unconditionally. Add change-detection guard. Wrapper with updater/reducer callback: verify it honors same-reference returns — else callers' early-return no-ops silently defeated.
5. **Unnecessary existence checks** — TOCTOU pre-check before operating. Operate directly, handle error.
6. **Memory** — unbounded structures, missing cleanup, listener leaks
7. **Overly broad operations** — reading entire files when slice suffices, loading all when filtering one

## Step 3: Fix issues

Wait for all three. Aggregate findings, fix directly. False positive or not worth → note and move on. Don't argue with finding or escalate to user, just skip.

## Step 4: Verify behavior preserved

Premise: simplification preserves exact functionality.

**Run typecheck and lint over full project.** Fast and catches common simplification regressions — broken imports, unused exports, dropped narrowings, dead code others reference.

**Run tests:**
- Tests scoped to changed paths. CI runs full suite on PR — local check is fast signal, not final guarantee. Match scope to blast radius.
- Broaden when change has wide reach — heavily-imported utility rewritten, Agent 2 consolidation modified shared code. Judgment call about ripple risk, not mechanical rule.
- No scoping mechanism → run full suite.

Surface failures clearly with check name and output. Do not relax assertions, weaken types, or skip tests to make checks pass — defeats "preserves functionality" guarantee. Either fix the break or revert the specific change.

No test/lint/typecheck configured → state explicitly in summary. Don't silently skip.

## Step 5: Summarize

Brief: what was good vs improved/fixed, which checks ran, results. No findings → confirm no changes needed.
