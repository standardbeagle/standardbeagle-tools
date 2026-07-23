# Context-owned review design

> **Historical / Superseded (2026-07-20):** `compound-review` has been retired. Worktrack owns workflow-integrated review; other callers use a self-contained generic reviewer. This document records the superseded design only.

## Goal

Replace compound-review's persona-per-lens execution with one public, context-owning review engine. Keep Worktrack's MCP integration deep while removing duplicated review intelligence from the private worktrack-loop plugin.

Provenance:
- `plugins/compound-review/skills/simplify-code/SKILL.md:22-61` — current full-diff multi-persona fan-out.
- `/home/beagle/work/marketplaces/marketplace/plugins/worktrack-loop/skills/review-panel/SKILL.md:8-24` — established context-not-persona rule.
- User decision, 2026-07-18 — no backward compatibility required; prefer overlap in the public repository and explicit private-to-public dependency.

## Repository boundary

### Public: `compound-review`

The public plugin owns provider-neutral review intelligence:

- one review agent and one review skill;
- one read of the supplied diff and acceptance criteria;
- specification compliance first;
- correctness and maintainability in the same pass;
- conditional testing, TypeScript-strict, CLI-readiness, and rationalization rubrics;
- fan-out only when a check needs repository context not already owned by the reviewer;
- one structured, provider-neutral result containing findings, severity, confidence, evidence, and fix hints.

The public review engine must not depend on Worktrack, DartAI, task comments, workflow state, or `.dartai/reports`.

Remove the persona reviewer agents and their fork companion skills. Remove unrelated `debug`, `simplify-code`, `strategy`, and `product-pulse` skills from compound-review; their functionality is either duplicated elsewhere or outside the plugin's review responsibility.

### Private: `worktrack-loop`

The private plugin remains a deep Worktrack integration. Its review-context owns:

- MCP discovery and routing inheritance;
- task, step, attempt, lease, and scope identity;
- `task_spawn_context` and authoritative diff/criteria acquisition;
- invoking the public `compound-review:review` intelligence;
- converting the public result to `reviewer_verdict_v1`;
- blocker-to-scope and blocker-to-acceptance-criteria mapping;
- rewind selection and attempt-budget handling;
- `task_workflow_step_advance`, durable completion, reconciliation, and coordinator continuation;
- all Worktrack-specific failures and recovery semantics.

No other worktrack-loop subsystem is flattened. Task claiming, leases, macros, context fan-out, model routing, group execution, worktree isolation, coordinator rotation, cold recovery, scheduling, and learning integration remain deep private modules.

## Dependency direction

```text
worktrack-loop review-context
  ├── deep Worktrack lifecycle + MCP semantics
  └── invokes compound-review:review
                    │
                    └── pure diff analysis + structured findings
```

Dependency is private → public only. `compound-review` must contain no reference to worktrack-loop.

## Public review flow

1. Accept a review packet: diff, changed files, acceptance criteria, commit/PR text, and optional project conventions.
2. Check every acceptance criterion against diff evidence. A specification failure short-circuits cleanup rubrics.
3. In the same context, inspect correctness and maintainability.
4. Enable additional inline rubrics from the review packet:
   - testing: tests changed or behavior changed;
   - TypeScript strictness: TypeScript changed;
   - CLI readiness: CLI definition, parser, handler, or output contract changed;
   - rationalization: large or critical-path diff with explanatory text.
5. Fan out only when validation requires a distinct repository context body, such as searching the wider capability surface for an existing helper or validating a load-bearing claim against live code.
6. Deduplicate findings and return one result. Do not run a finder fleet followed by one verifier per candidate.

## Public result contract

The review skill returns a single object conceptually shaped as:

```json
{
  "status": "passed | failed",
  "findings": [
    {
      "severity": "critical | major | minor",
      "file": "path",
      "line": 1,
      "message": "concrete defect",
      "failureScenario": "input/state to wrong outcome",
      "fixHint": "direct correction",
      "confidence": "high | medium",
      "evidence": "quoted diff or source evidence"
    }
  ],
  "rubricsApplied": ["spec", "correctness", "maintainability"]
}
```

Low-confidence speculation is suppressed. The result has no persistence side effects.

## Worktrack adaptation

`worktrack-loop:review-context` consumes the public result and performs the existing Worktrack-specific transformation and persistence. The private `review-panel` rubric implementation is removed or reduced to a short dependency note; it must not duplicate public checklists.

The red-green TDD workflow must target the unified private review-context rather than `compound-review:testing-reviewer`. Testing remains a conditional rubric within the public single pass.

## Versioning

Per user instruction, use patch-component increments despite removal of old public identifiers:

- `compound-review` `0.3.4` → `0.3.5`;
- `worktrack-loop` `0.7.2` → `0.7.3`.

No backward-compatibility aliases or deprecated persona files remain.

## Verification

Public repository:

- marketplace validator passes;
- no `dartai:`, `.dartai/reports`, removed reviewer IDs, or removed compound-review skills remain in active plugin files;
- public review skill contains each retained rubric exactly once;
- plugin version and marketplace catalog agree.

Private repository:

- marketplace validator self-test and full validation pass;
- no direct persona reviewer references remain;
- review-context invokes the public review skill and retains all Worktrack lifecycle responsibilities;
- red-green TDD and reviewer verdict shaping reference the unified path;
- plugin dependency declares `compound-review`;
- plugin version and catalog agree.

Deployment:

- push both default branches;
- update public marketplace before private marketplace;
- propagate both plugins to all six Claude surfaces;
- refresh finder/manual links and Codex entry skills;
- verify per-surface versions and no actionable drift.

## Risks and controls

- **Hidden removed-ID consumers:** search both repositories and generated agent projections before push; fail validation on stale active references.
- **Public/private schema drift:** public result is provider-neutral; private adapter is the only `reviewer_verdict_v1` conversion point.
- **Review overload recurrence:** public flow explicitly forbids persona-per-lens fan-out and per-candidate verifier fleets.
- **Loss of deep MCP behavior:** private review-context retains every Worktrack state, lease, persistence, rewind, and recovery operation.
