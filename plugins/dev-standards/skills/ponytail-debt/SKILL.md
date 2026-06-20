---
name: dev-standards-ponytail-debt
description: "Harvest `ponytail:` shortcut comments into a debt ledger so deferrals don't rot into 'later means never'. 收割 ponytail: 捷徑註解為債務台帳，使延遲不腐爛為永不。 Use when: 'ponytail debt', list the shortcuts, what did we defer, ponytail ledger, periodic tech-debt sweep, before a refactor pass. One-shot report — changes nothing unless asked to persist."
disable-model-invocation: true
---

# Ponytail Debt

Every deliberate [[ponytail]] shortcut is marked with a `ponytail:` comment naming its ceiling and upgrade path. This collects them into one ledger so a deferral can't quietly become permanent. It is the durable record of what past execution chose *not* to build — the input side of learning from past execution.

## Scan

Grep the repo for the comment marker, skipping `node_modules`, `.git`, and build output:

```bash
grep -rnE '(#|//|--|/\*) ?ponytail:' . --exclude-dir=node_modules --exclude-dir=.git
```

Add other comment prefixes if your stack uses them. Each hit is one ledger row. The `ponytail:` prefix keeps prose that merely mentions the convention out of the ledger.

## Output

One row per marker, grouped by file:

`<file>:<line> — <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>.`

The convention is `ponytail: <ceiling>, <upgrade path>`, so pull the ceiling and the trigger straight from the comment. Want an owner per row? add `git blame -L<line>,<line>`.

Flag the rot risk: any `ponytail:` comment that names no upgrade path or trigger gets a `no-trigger` tag — those are the ones that silently rot.

End with `<N> markers, <M> with no trigger.` Nothing found: `No ponytail: debt. Clean ledger.`

## Acting on the ledger

The ledger reports; it does not decide. Route findings, don't fix them inline:

- **Ceiling crossed** (the named limit is now real — throughput exceeded, n grew, heuristic now wrong) → surface as a plan-update proposal via [[review-for-plan-updates]], or document the matured deferral via [[ce-compound]] (knowledge track) so the loop learns which deferrals pay off.
- **`no-trigger` rows** → either add a real ceiling/upgrade to the comment, or delete the shortcut if it no longer earns its place.
- **Still under ceiling** → leave it. A live, correctly-bounded shortcut is finished work, not debt to repay.

## Boundaries

Reads and reports only — changes nothing. To persist it, ask, then write the ledger to a file (e.g. `PONYTAIL-DEBT.md`). One-shot. "stop ponytail-debt" or "normal mode" to revert.

> Adapted from [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) (MIT). Original: `skills/ponytail-debt`. Routing to `review-for-plan-updates` / `ce-compound` added for this repo.
