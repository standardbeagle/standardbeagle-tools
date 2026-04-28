---
name: verdict-schema
description: "Canonical verdict-only return schema for adversarial reviewer subagents. Reviewers emit a compact ≤30-line verdict block; main loop parses verdict + blockers only. Use when: authoring or updating a reviewer agent, building a verdict consumer, debugging reviewer report parsing."
---

# Reviewer Verdict Schema (Canonical)

This document defines the **single source of truth** for the return shape every adversarial reviewer subagent emits. The main loop and orchestrator skills (e.g. `dartai:adversarial-quality-loop`, `workflow:loop-orchestration`) read **only** the fields defined here. Anything outside the schema is dropped at the boundary.

**Why verdict-only**: prose narrative across N reviewers per loop iteration bloats the main-thread context. The verdict block carries the same decision signal at ~80% token reduction. Detail still has a home — see `evidence_path`.

## Schema

| field          | type                  | required               | notes                                                              |
| -------------- | --------------------- | ---------------------- | ------------------------------------------------------------------ |
| verdict        | `pass` \| `fail` \| `warn` | yes               | single-token decision; `fail` blocks the gate, `warn` does not    |
| blockers       | `list[str]`           | required when `fail`   | one line each; include `file:line` refs when applicable           |
| advisories     | `list[str]`           | no                     | non-blocking nits, suggestions, follow-ups                         |
| confidence     | `high` \| `med` \| `low` | yes                 | reviewer self-rating; `low` is a signal to escalate or re-dispatch |
| evidence_path  | `str` (relative path) | no                     | path to a longer report file when depth is needed                  |

### Verdict values

- `pass` — no blockers, gate may proceed.
- `fail` — at least one blocker; gate must not proceed; `blockers` MUST be non-empty.
- `warn` — no blockers but advisories warrant attention; gate proceeds; orchestrator may surface advisories to the operator.

### Confidence values

- `high` — reviewer is sure; finding/no-finding is well-grounded.
- `med` — reviewer is reasonably sure; one or two ambiguities exist.
- `low` — reviewer is uncertain; orchestrator should consider re-dispatch with a different model or a tighter prompt, or escalate to a human.

### Optional `evidence_path`

When a finding genuinely needs more than a one-liner (e.g. a long stack-trace, a multi-step exploit chain, or a table of duplicate sites), write the detail to a file under `.dartai/reports/<task-id>/<reviewer-name>.md` and put the relative path here. The main loop will not read it; downstream tools or operators may.

## Wire format

Reviewer agents emit a single fenced YAML block as the **final message body**. No preamble, no postamble, no prose around it. Keep the entire block ≤30 lines.

````
```yaml
verdict: pass | fail | warn
confidence: high | med | low
blockers:
  - "<file:line> — <one-line description>"
advisories:
  - "<one-line nit or follow-up>"
evidence_path: ".dartai/reports/<task-id>/<reviewer-name>.md"  # optional
```
````

### Examples

**Pass with no notes:**

```yaml
verdict: pass
confidence: high
blockers: []
advisories: []
```

**Pass with advisories:**

```yaml
verdict: pass
confidence: med
blockers: []
advisories:
  - "src/auth.ts:42 — consider extracting role-check helper (used 3×)"
  - "no test for 0-length input on parseToken; happy path only"
```

**Fail with blockers:**

```yaml
verdict: fail
confidence: high
blockers:
  - "src/handler.ts:88 — SQL string-concat with user input (A03 injection)"
  - "test/handler.test.ts — missing assertion on error message"
advisories:
  - "src/handler.ts:120 — duplicate of util/parseQuery (LCI hit)"
evidence_path: ".dartai/reports/RXB0s0OPWWZF/code-quality-reviewer.md"
```

**Warn (advisory-only):**

```yaml
verdict: warn
confidence: med
blockers: []
advisories:
  - "test distribution 70/20/10 — slightly under target on adversarial cases"
```

## Length budget

The full block — including header, lists, and `evidence_path` — must be **≤30 lines**. If you cannot fit findings in that budget:

1. Collapse multiple related findings into one line with a count (e.g. "3× weak assertions in test/foo.test.ts").
2. Move detail into `evidence_path` and reference it.
3. Never split a single reviewer's output across multiple blocks.

## Consumer contract

The main loop and orchestrator skills:

- Parse `verdict` and `blockers` only.
- Treat `advisories` as informational; may surface or drop based on telemetry settings.
- Use `confidence: low` as a re-dispatch signal (per orchestrator policy).
- Read `evidence_path` only when explicitly requested by an operator.

Pass/fail gate semantics (preserved from prior prose-format reports):

- Any reviewer `verdict: fail` → gate fails; orchestrator collects `blockers` from all failing reviewers and routes them back to the implementer.
- All reviewers `verdict: pass` (or `warn`) → gate passes.
- Reviewers gated by `enabled_when` predicates are skipped when the diff does not match; skipped reviewers do not contribute to the AND.

## Authoring rules for reviewer agents

When updating a reviewer agent's "Report Format" / "Return" section:

1. Replace any prose-narrative template (`qa_report:`, `code_quality_report:`, `post_task_report:`, etc.) with a reference to this schema.
2. Specify in the agent's instructions: emit the YAML block defined above as the final message body, no preamble.
3. Keep the agent's *internal* analysis structure (review areas, attack vectors, etc.) — that shapes how the reviewer thinks. Only the *output* shape is constrained by this schema.
4. Map the reviewer's old verdict tokens to the new ones:
   - `PASS` / `pass` → `pass`
   - `FAIL` / `fail` / `REJECT` / `STOP` → `fail`
   - `NEEDS_WORK` / `WARNING` → `warn` (when no blocker is gate-breaking) or `fail` (when it is)
5. If the reviewer needs to express depth beyond ≤30 lines, write to `.dartai/reports/<task-id>/<reviewer-name>.md` and set `evidence_path`.

## Backward compatibility

Legacy reviewers emitting the old prose `*_report:` blocks remain readable but are deprecated. Orchestrators may log a one-time deprecation note and proceed by extracting `verdict` from the legacy block. New reviewer authors and edits MUST use the schema above.

## Reviewers using this schema

Always-dispatched (dartai plugin):
- `plugins/dartai/agents/qa-reviewer.md`
- `plugins/dartai/agents/code-quality-reviewer.md`
- `plugins/dartai/agents/post-task-reviewer.md`

Always-dispatched (workflow plugin mirrors):
- `plugins/workflow/agents/qa-reviewer.md`
- `plugins/workflow/agents/code-quality-reviewer.md`
- `plugins/workflow/agents/post-task-reviewer.md`

Conditional and compound reviewers (typescript-strict, cli-readiness, correctness, maintainability, testing) MAY adopt this schema in a follow-up; they currently emit the R2 §4.1 `review_report` shape. Until they migrate, orchestrators accept either shape and extract `verdict` from whichever is present.
