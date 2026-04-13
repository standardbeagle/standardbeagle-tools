---
name: review-for-plan-updates
description: This skill should be used when a task has reached GREEN and before the quality gate commits, to surface C-class refactor discoveries (parameter bloat, duplication, naming drift, etc.) as structured plan-update proposals. Never edits code. Proposals flow to the calling plugin's planner for accept/defer/reject.
---

# Review for Plan Updates

Look at the diff of a just-completed task and surface C-class refactor discoveries. Never modify the task. Never edit code. Emit structured proposals that the planner can decide about with full release-cadence context.

## When to run

- After the task's last GREEN test passes
- Before the quality gate commits
- Scope-locked — findings never modify the just-finished task

## Inputs

- `git diff <task-base>..HEAD` — only files the task touched
- LCI call graph one hop out from changed symbols (see who is affected)
- `.claude/rules/karpathy-principles.md`
- `.claude/rules/refactor-discipline.md` (urgency thresholds, backlog config)
- `.claude/rules/code-quality.md` (project-specific complexity limits)

## Trigger catalog (C-class only)

Look for these patterns. Each example shows a signal and what a finding for that signal says.

| Signal | Example finding |
|---|---|
| Parameter bloat | "`createOrder` now has 9 params + 3 overloads — options object or builder" |
| Cross-task duplication | "Same validation pattern now written 3× across `checkout/`, `cart/`, `admin/`" |
| Naming drift | "`User`, `Account`, `Customer` all used for same concept — pick one in DOMAIN.md" |
| Grown responsibilities | "`OrderService` crossed 400 lines across last 3 tasks — split candidate" |
| Test setup duplication | "Same fixture built inline in 5 tests — extract builder" |
| Visible complexity debt | "Nested conditional now 4-deep in `applyDiscount` — guard-clause or state machine" |
| Dead branches | "Feature-flag branches exist for a flag that has been on everywhere for 30+ days" |

**Not looked for:** style preferences, unused imports, formatting, anything the linter handles.

## Detection thresholds (read from `.claude/rules/code-quality.md`)

Thresholds are project-specific. Defaults when the rule file does not override:

- Parameters: flag at 5+
- Method lines: flag at 30+
- File lines: flag at 400+
- Nesting depth: flag at 4+
- Duplication: flag at 3+ copies across files

Read the project's `code-quality.md` for overrides before applying.

## Output format

Emit a YAML document with a `proposals` list. Each proposal is structured data, not prose.

```yaml
proposals:
  - title: "Extract OrderCreation options object"
    trigger: parameter_bloat
    evidence:
      symbol: "src/orders/create.ts:createOrder"
      observation: "9 params, 3 overloads, callers pass flags positionally"
      callers: 14   # from LCI
    rationale: "Options object removes positional confusion"
    estimated_tier: standard
    blocks: []
    urgency: low            # low | medium | high
    principle: refactor-discipline.C
```

Proposals reference evidence; they do not embed code.

## Deferred decisions (for the planner, not the reviewer)

The reviewer does not decide. Decisions belong to the calling plugin's planner, which sees release cadence, what else is in flight, and team priorities.

- **Accept now** — proposal is grilled as a normal task and scheduled next
- **Defer** — stays in backlog with urgency tag; promoted over time
- **Reject** — marked rejected with a one-line reason; fingerprint recorded to prevent re-proposing

## Reject-list discipline

Before emitting a proposal, compute a fingerprint from (`evidence.symbol`, `trigger`) and check it against the reject list at `.claude/refactor-rejects.txt`. If present, skip emission. The reject list is written by the planner when it rejects a proposal and lives in the project, not the plugin.

## Routing (plugin-specific wrappers handle this)

- **dartai** — proposals become Dart tasks in a `refactor-backlog` folder, tagged `origin:review`, with a link back to the task that surfaced them.
- **workflow** — proposals append to `.workflow/loop-state.json` under `pending_plan_updates[]`.

This skill returns the YAML; the wrapper persists it.

## Discipline

- **Never edit code.** The just-finished task is scope-locked. Any edit here violates refactor-discipline.B.
- **Never decide.** You only see the diff. Accept/defer/reject requires wider context.
- **Evidence, not code.** Proposals reference symbols and file:line locations. The planner reads the files if needed.
- **Short proposals.** Each proposal under 20 lines of YAML. If the rationale needs more, the task is ambiguous — refine the signal instead.

## Related skills

- `dev-standards:grill-task` — proposals that are accepted get grilled as new tasks
- `dev-standards:decide` — if a proposal surfaces an architecture decision, invoke decide when accepted
