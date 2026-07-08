# Code Smell Baseline (Fowler, _Refactoring_ ch.3)

A fixed set of high-signal code smells that applies even when a repo documents
no standards of its own. Use it as a review lens over a diff, and as the
"what to look for" companion to the deep-module vocabulary in
[LANGUAGE.md](LANGUAGE.md) (which is the "how to fix it deeply").

## Two rules bind the baseline

- **The repo overrides.** A documented repo standard always wins. Where a
  project convention endorses something the baseline would flag, suppress the
  smell — don't relitigate a decision the repo already made.
- **Always a judgement call.** Each smell is a labelled heuristic
  ("possible Feature Envy"), never a hard violation. And skip anything tooling
  (linter/formatter/type-checker) already enforces — that's the tool's job.

## The smells — *what it is* → *how to fix*

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal
  what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or
  file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than
  its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together
  (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain
  concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs
  across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many
  files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated
  reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs
  the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't
  depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward.
  → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most
  of what it inherits. → drop the inheritance, use composition.

## Reporting

Name the smell and quote the hunk. Keep it a judgement call, not a verdict:
"possible Message Chain at `x.ts:42`" beats "violation". A documented repo
standard, or a genuine domain reason, overrides any flag here.

> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) v1.1
> (MIT), `skills/engineering/code-review` smell baseline. Smells are Martin
> Fowler, _Refactoring_ 2nd ed., ch.3.
