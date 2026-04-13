---
name: code-quality
description: Thin dartai-specific wrapper that routes review-for-plan-updates proposals into Dart tasks. All code quality checklist content lives in .claude/rules/code-quality.md (project) and dev-standards:review-for-plan-updates (skill).
---

# Code Quality (dartai wrapper)

This skill is a **persistence wrapper only**. All review logic, trigger catalog, and proposal format live in `dev-standards:review-for-plan-updates`. Code quality standards (checklist, error handling, findability, cleanup) live in `.claude/rules/code-quality.md` — do not duplicate them here.

## What this skill does

1. Invokes `dev-standards:review-for-plan-updates` with the task diff
2. For each returned proposal:
   - Computes its fingerprint against `.claude/refactor-rejects.txt`
   - If not rejected, creates a Dart task in the `refactor-backlog` folder with tags `origin:review`, `parent:<task-id>`, `urgency:<low|medium|high>`
3. Returns a summary: number of proposals persisted, number skipped by reject list

## What this skill does NOT do

- Evaluate code quality directly — that content moved to `.claude/rules/code-quality.md` and the rule file is loaded automatically
- Run linters — use your language-specific lint command (see `.claude/rules/testing.md`)
- Decide whether to schedule a proposal now — that is the planner's decision at next planning cycle
- Edit code — never, under any circumstance

## Invocation

```
Called by:
  dartai:adversarial-quality-loop Phase 4.5
Returns:
  { persisted: <count>, rejected: <count>, total: <count> }
```

## Dart task format for persisted proposals

```yaml
dart_task:
  dartboard: "<same dartboard as surfacing task>"
  folder: "refactor-backlog"
  title: "<proposal.title>"
  description: |
    ## Origin
    Surfaced by review of task <surfacing-task-id> on <date>.

    ## Trigger
    <proposal.trigger>

    ## Evidence
    - Symbol: <proposal.evidence.symbol>
    - Observation: <proposal.evidence.observation>
    - Callers affected: <proposal.evidence.callers>

    ## Rationale
    <proposal.rationale>

    ## Estimated tier
    <proposal.estimated_tier>
  status: "To-do"
  priority: "Low | Medium | High"     # maps from urgency
  tags:
    - "origin:review"
    - "parent:<surfacing-task-id>"
    - "urgency:<low|medium|high>"
    - "principle:refactor-discipline.C"
```

## Reject list

`.claude/refactor-rejects.txt` is a newline-separated list of fingerprints. Each fingerprint is `<symbol>:<trigger>`. Before persisting a proposal, compute its fingerprint and skip if present. The planner appends to this file when it rejects a proposal.

## Related

- `dev-standards:review-for-plan-updates` — the reviewer this wrapper calls
- `dev-standards:grill-task` — when a proposal is later accepted, it gets grilled as a normal task
- `.claude/rules/code-quality.md` — project-specific code quality standards
- `.claude/rules/refactor-discipline.md` — A/B/C refactor rule
