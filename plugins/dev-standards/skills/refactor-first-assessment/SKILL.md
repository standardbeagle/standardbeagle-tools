---
name: refactor-first-assessment
description: This skill should be used when creating an implementation plan, after grill-task has produced a task spec, to decide whether a preparatory refactor step needs to be inserted before implementation. Runs the A-rule check: four parallel assessments (natural extension, naming fit, co-location, friction).
---

# Refactor-First Assessment

Assess whether the existing codebase structure supports the planned change naturally. If it does not, insert a preparatory refactor step into the plan *before* implementation.

## When to run

- During planning, **after** `dev-standards:grill-task` has produced a task spec
- **Before** the plan's implementation steps are written
- Once per task, not once per file

## Inputs

- Task spec from grill-task (scope, intent, domain terms)
- Current file contents of files in `scope.files_to_modify`
- LCI search results for the task's key nouns/verbs (find the natural home)

## Four checks

Run these in order. Any "no" adds a preparatory refactor step to the plan.

### 1. Natural extension

Is there an obvious place to add this change? Can you point to a file and line where the new code clearly belongs?

- **Yes:** move on.
- **No:** the structure needs a home created first. Add a refactor step: "create the home for X by extracting Y from Z."

### 2. Naming fit

Do existing names make room for the new concept, or would the new code overlap with a differently-named existing concept?

- **Yes:** move on.
- **No:** add a refactor step to rename the existing concept or clarify the naming before the new code lands.

### 3. Co-location

Would related code end up in the right file/module? Specifically, does the new code's domain concept already live somewhere, or is it being scattered across unrelated files?

- **Yes:** move on.
- **No:** add a refactor step to consolidate the domain's existing code before adding more to it.

### 4. Friction

Would you need to fight existing code to add the new change? Signs: deep nesting, unrelated parameters threaded through, callers updated in places that should not care.

- **No (no friction):** move on.
- **Yes (friction):** add a refactor step to reduce the friction first.

## Output

A plan-edit instruction, one of:

- **Sign off:** "No refactor needed. Proceed with implementation as planned."
- **Insert refactor step:** "Before implementation, add step: `Refactor <target> to <action> (move/rename/extract/inline)`. Then re-run existing tests before the first new RED test."

If multiple checks failed, insert multiple refactor steps in the order: extract/move → rename → reduce friction. Never combine refactor and implementation in the same step.

## Discipline

- Refactor steps must pass existing tests before the new RED test is written. If the refactor breaks an existing test, that is a bug — fix it as part of the refactor step, not the implementation step.
- Refactor steps are **A-class only** (preparatory, in plan). They are not a backdoor for opportunistic cleanup. See `.claude/rules/refactor-discipline.md`.
- If more than two refactor steps are needed, the task is likely too large — escalate to "split this task" rather than pile on refactors.

## Example output

```yaml
assessment:
  natural_extension: yes
  naming_fit: no        # "OrderLine" and "LineItem" both in use
  co_location: yes
  friction: no

refactor_steps_to_insert:
  - "Rename OrderLine -> LineItem across src/orders/ and tests/orders/"
  - "Run existing test suite, confirm GREEN"

then_proceed_with:
  - "Original implementation steps from plan"
```
