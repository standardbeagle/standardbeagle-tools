---
name: grill-task
description: "This skill should be used when any plugin creates a task or schedules work, to interrogate the request before it is persisted. Extracts intent, user flow, domain terms, design patterns, scope, and verification with tier-gated depth (minimal skips, standard+ runs). Writes to two channels: ephemeral task spec and permanent project-context backflow via writer skills."
---

# Grill-Task

Runs at task creation. Measures twice so execution only has to cut once.

## Invocation

```
Called by:
  dartai: /dartai:task, skills/simple-planning, skills/adversarial-planning-loop
  workflow: /workflow:add-task
Returns:
  task_spec (required)
  backflow_writes (list of {skill, path, changes}; may be empty)
```

## Step 0 — Read project context (silent)

Read before asking anything. The more context you have, the fewer questions you need.

- `.claude/rules/*` — project posture (security, testing, TDD level, architecture style)
- `CLAUDE.md` or `.claude/CLAUDE.md` — project identity
- `docs/DOMAIN.md` or `docs/domain/*.md` — canonical domain terms
- `docs/user-stories/` — existing stories
- `docs/user-flows/` — existing flows
- `docs/design-guidelines.md` and any component library READMEs detected
- Recent related tasks (for dartai: same folder; for workflow: `.workflow/loop-state.json.tasks[]`)
- LCI search results for the nouns and verbs in the raw request

## Step 1 — Classify tier

Decide which tier this request falls into:

| Tier | Indicators | Action |
|---|---|---|
| Minimal | 1 file, trivial, unambiguous (typo, text, one-line fix) | **Skip grill entirely**, return one-line spec, done |
| Standard | 2-5 files, single feature/fix, minor clarification needed | Run full layered interrogation |
| Comprehensive | 5+ files, multiple criteria, significant discussion | Run full layered interrogation, all layers |
| Architectural | cross-cutting, multiple subsystems, new patterns | Run full layered interrogation, plus escalation if too large |

For minimal tier, return immediately:

```yaml
task_spec:
  requested: "<user's exact words>"
  tier: minimal
  scope:
    files_to_modify: [<single file>]
  acceptance: [<one-line criterion>]
backflow_writes: []
```

## Step 2 — Layered questions (standard tier and above)

Ask one question per turn, terminal-side, in this order. Skip a layer entirely if its "reads from" already answers it — summarize what you know and ask "is this still accurate?" rather than starting from scratch.

### Layer 1 — Intent

- **Reads from:** `docs/user-stories/`
- **If missing, asks:** Who benefits? What specific outcome? How is success measured?
- **Writes back via:** project-local `write-user-story` (if present)

### Layer 2 — Flow

- **Reads from:** `docs/user-flows/`
- **If missing, asks:** Entry point? What adjacent steps? What exit criteria?
- **Writes back via:** project-local `define-user-flow` (if present)

### Layer 3 — Domain

- **Reads from:** `docs/DOMAIN.md`
- **If missing, asks:** What is the canonical term for this concept? Are there synonyms to avoid?
- **Writes back via:** project-local `domain-update` (if present), or `domain-init` if no DOMAIN.md exists yet

### Layer 4 — Design

- **Reads from:** `docs/design-guidelines.md`, component library README, existing patterns via LCI
- **If missing, asks:** What pattern should this follow? Is there an existing component to reuse?
- **Writes back via:** plugin-local `dev-standards:update-rules` (edits a project rule file)

### Layer 5 — Scope

- **Reads from:** LCI search on nouns/verbs
- **If missing, asks:** Which files need to change? What is explicitly NOT included?
- **Writes back:** task spec only (no permanent writeback)

### Layer 6 — Verification

- **Reads from:** `.claude/rules/testing.md`, `.claude/rules/tdd.md`
- **If missing, asks:** How is done measured? Is there a RED test planned? Any manual verification step?
- **Writes back:** task spec only (no permanent writeback)

## Step 3 — Graceful degradation for absent writers

Before invoking any **project-local** writer skill, probe for its presence:

```bash
test -f .claude/skills/<skill-name>/SKILL.md
```

If absent, do NOT fail the grill. Record a TODO line in the task spec:

```yaml
notes:
  - "TODO: install .claude/skills/write-user-story to persist Intent layer gap"
```

The next iteration of grill-task picks up the writer if the project eventually installs it (via `dev-standards:add-skill` or a later `setup-project` run with a different docs level).

**Plugin-local writers** (`decide`, `update-rules`, `update-project`, `add-skill`) are always available — no probing required.

## Step 4 — Hard caps

- Max **2 rounds** of follow-up questions after the initial pass
- Max **12 questions total** even for architectural tier
- If caps are hit and the request is still ambiguous, escalate: return `task_spec.verdict = "TOO_LARGE_TO_GRILL"` and recommend splitting the task

## Step 5 — Confirmation screen

Before writing either output channel, present both the proposed task spec and all pending backflow writes as a single confirmation screen:

```
Grilled Task Spec
=================
<task spec YAML>

Pending backflow writes
=======================
- write-user-story: docs/user-stories/US-43.md  (new, 42 lines)
- domain-update:   docs/DOMAIN.md  (append LineItem definition)

Approve [y] / Edit field [e] / Another round [r] / Abort [x] ?
```

On `y`: perform all backflow writes atomically (collect as a staging object, apply together), then return the task spec to the caller.
On `e`: ask which field to edit.
On `r`: go to Step 2 with an additional question budget (still under cap).
On `x`: write nothing, return `task_spec.verdict = "ABORTED"`.

## Output format

```yaml
task_spec:
  requested: "<user's exact words>"
  tier: standard | comprehensive | architectural
  refs:
    user_story: docs/user-stories/US-42.md    # or null
    flow: docs/user-flows/checkout.md         # or null
    domain: [Order, LineItem]
    design: rules/design-guidelines.md#buttons
  scope:
    files_to_modify: [<paths, max 5>]
    not_included: [<explicit exclusions>]
  acceptance:
    - <RED→GREEN criterion 1>
    - <RED→GREEN criterion 2>
  verification:
    runner: vitest                             # or pytest, go test, etc.
    manual: <optional manual check>
  notes: []                                    # populated on graceful degradation
  verdict: OK | TOO_LARGE_TO_GRILL | ABORTED

backflow_writes:
  - skill: <skill-name>
    location: plugin-local | project-local
    path: <file path written>
    summary: <one line>
```

## Discipline

- Ask one question per turn. Never stack multiple questions in one message.
- Prefer multiple-choice when possible; open-ended only when no sensible choices exist.
- Never grill a minimal-tier task. Grilling a typo fix is worse than shipping it wrong.
- Never embed project-local writer skill content into this skill. Invoke them.
- Never persist partial backflow writes — collect, confirm, commit atomically.
- Respect `.claude/rules/karpathy-principles.md`: push back when unsure, surface tradeoffs, do not "run with" an assumption.

## Related skills

- `dev-standards:refactor-first-assessment` — invoked by planning skills after grill-task
- `dev-standards:decide` — backflow writer for undecided architecture questions
- `dev-standards:update-rules` — backflow writer for new project rules
- `dev-standards:add-skill` — backflow writer for new project-specific skills
- `dev-standards:update-project` — backflow writer for project description changes
