# Risk Pipeline Design

**Date**: 2026-04-21
**Status**: Draft — pending user review
**Author**: Andy Brummer (brainstormed with Claude)

## Problem

`dartai` and `workflow` plugins classify tasks by file count (≤5) and clarification count. Same adversarial pipeline (TDD + 3 reviewers) fires regardless of what the code does. Three pain points:

1. **Classification is lossy.** A 1-file edit to `auth/verifyToken` and a 1-file typo fix both land in "minimal" tier. File count is a poor danger proxy.
2. **Splitting is reactive.** Tasks split only when file count exceeds 5. No pre-flight decomposition. Encourages gaming ("spread it to 4 files to stay minimal").
3. **Process efficiency is flat.** Every task gets same pipeline, same model, same reviewer set. Typos pay for TDD + code-quality-reviewer + qa-reviewer + post-task-reviewer. Auth changes get the same treatment as CSS tweaks.

## Goals

- Classify tasks by **risk** (what could go wrong), not size (how many files).
- Make splitting a **proactive SOP**, not a reactive reject.
- Route **reviewers, models, and TDD discipline** per risk dimension — not as one-size-fits-all.
- Preserve **findability** — split decisions must not scatter related code or bloat files past context budgets.

## Non-goals

- Replace Dart as task store. Task metadata still lives in Dart + loop state files.
- Replace LCI. Risk pipeline consumes LCI for call-graph; no new index built.
- Automated tier-gaming detection. User trust is implicit; telemetry surfaces drift for manual audit.

---

## Architecture

### New plugin: `risk-pipeline`

```
plugins/risk-pipeline/
├── .claude-plugin/plugin.json
├── skills/
│   ├── risk-classify.md          # task spec → risk vector + pipeline verdict
│   ├── risk-tag-unit.md          # tag one code unit (hook + on-demand)
│   ├── risk-tag-sweep.md         # backfill untagged units (resumable)
│   ├── risk-budget.md            # aggregate + split decision
│   └── risk-pipeline-dispatch.md # risk vector → reviewers + model routing
├── hooks/
│   └── hooks.json                # PostToolUse Write|Edit → tag-changed-units.sh
├── scripts/
│   └── tag-changed-units.sh
├── rules/
│   └── risk-pipeline/
│       └── codedoc-schema.md     # @risk annotation spec (for humans)
├── commands/
│   ├── tag-sweep.md              # /risk-pipeline:tag-sweep
│   └── classify.md               # /risk-pipeline:classify (manual test)
└── mcp.json                      # empty — pure skills plugin
```

**Boundaries**:

- Depends on: LCI (symbol ranges, call-graph), Claude Code skill invocation.
- Consumed by: `dartai`, `workflow`, `dev-standards` (grill-task + setup-project).
- No MCP server. Tagger runs as skill invocations with model frontmatter routing.

### Data flow

```
[user edit] → PostToolUse hook → tag-changed-units.sh
                                    ↓
                             risk-tag-unit skill
                                    ↓
                          Haiku/Sonnet tagger LLM
                                    ↓
                          Edit @risk line in codedoc
                                    ↓
                           LCI reindex pulls @risk

[new task spec] → grill-task
                    ↓
             risk-pipeline:classify
                    ↓
              [pre-filter check]
              trivial? → smoke pipeline
              full?    → load tags for touched units
                           ↓
                    risk-pipeline:budget
                    (propagate + aggregate)
                           ↓
                    verdict: ok|split|refactor-first|escalate
                           ↓
                 risk-pipeline:dispatch
                 (reviewers, model, TDD flag)
                           ↓
               dartai/workflow runs pipeline
```

---

## Risk tag schema

Codedoc annotation on each public unit (functions, methods, classes, exported consts):

```typescript
/**
 * Verify JWT signature, return decoded claims.
 *
 * @risk b+d.s!r-u. tagged:2026-04-21 model:haiku conf:0.91
 * @risk-why "Signature bypass = auth bypass. Broad blast via callers."
 */
function verifyJWT(token: string): Claims { ... }
```

### Axes (fixed 5)

| Glyph | Axis | Meaning |
|-------|------|---------|
| `b` | blast | Consumers/call sites affected if this breaks |
| `d` | data | Risk to persistent/external data (migrations, schema, serialized) |
| `s` | security | Auth, crypto, authz, input validation, secrets |
| `r` | reversibility | Harder to undo (shipped artifacts, destructive ops) |
| `u` | unknowns | Novel patterns, no test coverage, unfamiliar API |

### Levels (4)

| Glyph | Level | Numeric |
|-------|-------|---------|
| `.` | low  | 0 |
| `-` | med  | 1 |
| `+` | high | 2 |
| `!` | crit | 3 |

### Fields

- `@risk b<L>d<L>s<L>r<L>u<L>` — fixed positional order. Required.
- `tagged:YYYY-MM-DD` — drift audit + staleness fallback.
- `model:haiku|sonnet` — escalation precedence.
- `conf:N.NN` — tagger self-reported confidence.
- `@risk-why "..."` — required when any axis = `!`, optional otherwise, ≤140 chars.

### Language mapping

| Language | Syntax |
|----------|--------|
| TS / JS  | JSDoc `/** */` |
| Python   | docstring, `@risk:` section |
| Go       | comment block above decl (Go doc convention) |
| Rust     | `///` doc comment |
| C# / F#  | XML `<risk>` element |
| Ruby     | YARD `@risk` tag |

### Granularity

Tag: functions, methods, classes, exported consts.
Skip: private closures, anonymous arrow fns, type aliases.
Module risk = `max()` across exported symbols.

### Staleness

Primary: PostToolUse hook refreshes on every edit.
Fallback: `tagged:` date vs `git log -1 --format=%at` of unit's line range. If git mtime > tagged → stale. LCI exposes this check.

### Emoji variant

Disabled by default. Configurable via `risk_pipeline.emoji_glyphs: true`. Trades scannability for 2–3× tokens.

---

## Tagger architecture

### Invocation paths

1. **On-save hook** (primary freshness) — `PostToolUse` matcher `Write|Edit`, script `tag-changed-units.sh` runs async.
2. **Sweep skill** (`risk-tag-sweep`) — manual via `/risk-pipeline:tag-sweep`. Enumerates untagged symbols via LCI. Parallel batches of 10. Checkpoints to `.risk-pipeline/sweep-state.json` — resumable.
3. **Grill-time lazy** — `risk-classify` invokes per-unit tagger when touched units are untagged or stale.

### Per-unit pipeline

```
Step 1: Read unit body (file[line_range])
Step 2: Read top-of-file imports
Step 3: LCI call-graph: 2 levels callers + callees (names only, not bodies)
Step 4: Extract relevant DOMAIN.md terms (if present)
Step 5: Haiku 4.5 prompt with unit + imports + graph + domain snippet
        Output strict JSON: {b,d,s,r,u,conf,why}
Step 6: If conf < 0.7 OR any axis = 3, escalate to Sonnet 4.6
Step 7: Render JSON → ASCII glyph codedoc block
Step 8: Edit file: insert/update @risk lines in unit's docblock
```

### Prompt template

```
You classify code risk across 5 axes. Output ONLY JSON.

Axes (0=low, 1=med, 2=high, 3=crit):
  b (blast): how many callers/consumers affected if this breaks
  d (data): risk to persistent/external data
  s (security): auth, crypto, authz, input validation, secrets
  r (reversibility): harder to undo (shipped artifacts, destructive ops)
  u (unknowns): novel patterns, no test coverage, unfamiliar API usage

Output: {"b":N,"d":N,"s":N,"r":N,"u":N,"conf":0.0-1.0,"why":"<=140 chars"}

UNIT:
<body>

IMPORTS: <list>
CALLERS (up to 8): <names>
CALLEES (up to 8): <names>
DOMAIN TERMS: <extracted>
```

### Concurrency

- Per-file lock at `.risk-pipeline/locks/<file-hash>.lock`
- Hook fires during sweep → hook queues, sweep wins
- Stale lock (>60s) → reclaimable

### Cost controls

- Hook skips re-tagging when unit body hash unchanged (whitespace-only edits)
- Per-project `daily_tag_cap` (config, default 500 units/day); over cap → defer to sweep
- Telemetry log (`.risk-pipeline/telemetry.jsonl`): token count, model, unit size — user audits cost

### Failure modes

- Invalid JSON → retry once, skip on second failure. Unit treated as unknowns:high at classify.
- Edit fails (file changed mid-run) → retry once with fresh read.
- Tagger unavailable → classify pessimistic (unknowns:high); pipeline still runs.

---

## Roll-up, budget, split

### Per-axis roll-up

**Blast** — call-graph propagation via LCI:

```
for each touched unit u:
  callers_reachable = LCI.callers(u, depth=3)
  amplification = ceil(log2(|callers_reachable| + 1))
  effective_b = min(3, u.b + amplification)

task.b = max(effective_b across touched units)
```

**Data / security / reversibility** — `max()` across touched units.

**Unknowns** — per-task, computed by `risk-classify`:

```
unknowns signals (each adds 1, cap at 3):
- spec references symbols not in LCI index
- spec touches modules with <50% test coverage
- spec introduces new domain concept not in DOMAIN.md
- tagger avg conf < 0.75 across touched units
```

### Scalar budget

`scalar = Σ(axis_level × axis_weight)`

**Default weights**:

| Axis | Weight | Rationale |
|------|--------|-----------|
| security | 4 | Hardest to recover from |
| data | 3 | Migrations hard to undo |
| reversibility | 3 | Shipped = real users |
| blast | 2 | Amplified already by call-graph |
| unknowns | 2 | Research mitigates |

**Default budget**: `10`.

**Examples**:

| Tag | Computed | Verdict |
|-----|----------|---------|
| `b.d.s.r.u.` | 0 | trivial |
| `b-d.s.r.u-` | 4 | pass |
| `b+d.s.r.u.` | 4 | pass |
| `b+d.s!r-u.` | 19 | split |
| `b.d+s.r+u.` | 12 | split |

### Hard crit rule

Any axis `= !` (crit=3) → mandatory specialist review + runbook regardless of scalar. Crit work may remain single task when indivisible (crypto primitive swap).

### Split SOP

```
1. Group touched units into candidate slices by call-graph proximity
   - LCI: units sharing public entry point → same slice
   - Units in same aggregate (DOMAIN.md) → same slice

2. For each slice, compute slice scalar

3. If every slice fits budget → split along slice boundaries
   Dependency graph: order by data-flow (producers before consumers)

4. If any single slice still over budget after slicing:
   - Dominant unit (contribution > budget alone) → flag REFACTOR-FIRST
     Insert refactor task: decompose dangerous unit before feature work
   - No dominant unit → warn, promote to architectural tier
     (composite pipeline + human checkpoint)

5. Findability preservation (hard constraint):
   - REJECT split that creates new files to hold orphaned fragments
   - REJECT split that scatters aggregate across N tasks all editing
     the same public entry point
   - Findability breach → collapse back to one task, escalate to
     architectural tier
```

### Pre-filter (trivial bypass)

All must hold:

```
1. No new files created
2. No new exported symbols
3. No symbol renames (LCI diff)
4. Line delta per file < 20 added, < 20 removed
5. Post-change file size < context_budget (default 800 lines)
6. No file grows > 1.2× current size
7. No file moves/renames
8. No edits inside security-flagged paths
   (hardcoded fallback for untagged codebases: auth/**, crypto/**, migrations/**)
```

**All hold** → skip tagger + classify. Pipeline = smoke (tests on touched files, self-review, lint, commit).
**Any fail** → full classify.

### Output of `risk-classify`

```yaml
task_id: abc123
verdict: ok | split_required | refactor_first_required | escalate
task_risk:
  b: 2, d: 0, s: 3, r: 1, u: 0
  scalar: 19
  crit_axes: [security]
budget: 10
over_by: 9
pipeline_tier: smoke | light | dim_matched | architectural
required_reviewers: [security, qa]
model: opus-4.7
tdd_required: true
split_proposal:
  - slice_1: {units: [...], scalar: 7}
  - slice_2: {units: [...], scalar: 8}
findability_notes: "..."
```

---

## Pipeline dispatch

### Reviewer roster

Existing: `code-quality-reviewer`, `qa-reviewer`, `post-task-reviewer`.

New:

- `security-reviewer` — auth/crypto/input-validation/authz focus
- `data-reviewer` — migrations, schema, serialized format compat, cache invalidation
- `reversibility-reviewer` — rollback plan, canary strategy, feature flag wiring
- `novelty-reviewer` — prior-art check, research summary, unknown-unknowns enumeration

### Dim-matched dispatch

| Trigger | Reviewer fires | Blocking |
|---------|----------------|----------|
| `s >= -` | security-reviewer | yes |
| `s = !` | + human checkpoint | hard-block |
| `d >= -` | data-reviewer | yes |
| `d = !` | + migration dry-run evidence | hard-block |
| `r >= +` | reversibility-reviewer | yes |
| `r = !` | + rollback runbook + canary plan | hard-block |
| `b >= +` | code-quality-reviewer (full) | yes |
| `u >= +` | novelty-reviewer + research task first | yes |
| Any axis >= - AND non-trivial | qa-reviewer | yes |
| All axes `.` | no reviewers | smoke |
| Trivial bypass | no reviewers | smoke |

Reviewers fire in parallel. Max 2 retries on failing reviewer only.

### Model routing

```yaml
impl:
  trivial_bypass: haiku-4.5
  scalar 0-4:     haiku-4.5
  scalar 5-9:     sonnet-4.6
  scalar 10-14:   sonnet-4.6
  scalar >= 15:   opus-4.7
  any axis = !:   opus-4.7
  u = !:          opus-4.7  # research phase

reviewer:
  default: one tier down from impl (floor haiku-4.5)
  security-reviewer: same tier as impl
  post-task-reviewer: same tier as impl

tagger:
  default: haiku-4.5
  escalate: sonnet-4.6 (low-conf or security-adjacent)
```

### TDD required vs skip

Required when any:

- `d >= -` (test migrations/transforms)
- `s >= -` (test auth paths)
- `b >= +` (regression surface)
- `u >= +` (pin behavior before exploring)

May skip when all above are `.` AND (trivial bypass OR pure styling/copy/config) AND no behavior change in LCI diff.

### Pipeline phase matrix

```
SMOKE            (trivial bypass)
  edit → lint → test-touched → commit
  no TDD, no reviewers, no subagent spawn

LIGHT            (scalar 1-4, no crit)
  TDD (if required) → self-review → qa-reviewer → lint+test → commit

DIM_MATCHED      (scalar 5-14)
  TDD → self-review → [qa + dim-matched parallel] → quality gates → commit
  post-task-reviewer fires if any axis = +

ARCHITECTURAL    (scalar >= 15 OR any axis = !)
  research task (if u >= +) → TDD → self-review →
  [qa + security + data + reversibility + novelty as triggered] →
  post-task-reviewer (sequential) → quality gates →
  human checkpoint (if any crit) → commit
```

### Telemetry

`.risk-pipeline/telemetry.jsonl` per-task:

```json
{"task_id":"abc","pipeline":"dim_matched","risk":{"b":2,"d":0,"s":2,"r":1,"u":0},
 "scalar":14,"reviewers":["qa","security","code-quality"],"model":"sonnet-4.6",
 "tokens":{"impl":12400,"review":8200,"tagger":340},"wall_ms":840000,
 "outcome":"pass","retries":0,"real_issues_found":["auth-bypass-in-edge-case"]}
```

Auditable: false-skip rate, over-review rate. Feeds budget/weight tuning.

---

## Config — `.claude/rules/risk.md`

```yaml
---
risk_pipeline:
  enabled: true
  schema_version: 1

  budget:
    scalar_max: 10
    daily_tag_cap: 500

  weights:
    security: 4
    data: 3
    reversibility: 3
    blast: 2
    unknowns: 2

  blast_propagation:
    lci_depth: 3
    caller_log_base: 2

  pre_filter:
    context_budget_lines: 800
    line_delta_trivial: 20
    growth_ratio_max: 1.2
    security_paths_hardcoded:
      - "auth/**"
      - "crypto/**"
      - "migrations/**"

  tagger:
    default_model: haiku-4.5
    escalate_model: sonnet-4.6
    conf_threshold: 0.7

  model_routing:
    impl:
      trivial: haiku-4.5
      "0-4":   haiku-4.5
      "5-9":   sonnet-4.6
      "10-14": sonnet-4.6
      "15+":   opus-4.7
    reviewer: one_tier_down
    security_reviewer: same_as_impl
    post_task_reviewer: same_as_impl

  tdd_required_when:
    - "d >= -"
    - "s >= -"
    - "b >= +"
    - "u >= +"

  emoji_glyphs: false

  telemetry:
    enabled: true
    path: .risk-pipeline/telemetry.jsonl
---

# Risk Pipeline Rules

(prose docs — axis meanings, glyph legend, worked examples)
```

Any key may be overridden per project. Missing keys fall to plugin defaults.

---

## Consumer integration

### dartai changes

- `skills/simple-planning.md` — delete tier classification (complexity_tiers, tier_detection, validation_by_tier). Step 0.5 invokes `risk-pipeline:classify`.
- `skills/adversarial-planning-loop.md` — Step 4 calls `risk-pipeline:budget`.
- `commands/start.md` — Section 5.5 phase dispatch reads `pipeline_tier` from classify output.
- `agents/task-executor.md` — consumes `required_reviewers` + `model` fields.

### workflow changes

- `commands/add-task.md` — Step 3 calls `risk-pipeline:classify`; enforces budget not file count.
- `skills/adversarial-quality.md` — Phase 4 reads `required_reviewers`; spawns only triggered agents.
- `skills/loop-orchestration.md` — state file adds `risk_vector` per task.

### dev-standards changes

- `dev-standards:grill-task` — returns `task_spec.risk` from `risk-pipeline:classify`.
- `dev-standards:setup-project` — writes `.claude/rules/risk.md` from template. Adds `.risk-pipeline/` to gitignore (optional telemetry commit).

### Plugin dependency graph

```
risk-pipeline (no deps except LCI)
  ↑
dev-standards (consumes for grill-task + setup)
  ↑
dartai (consumes via grill + direct)
workflow (consumes via add-task + direct)
```

Declared via `dependencies` in each `plugin.json`.

---

## Rollout + migration

### Phase 0 — Plugin build

risk-pipeline scaffold, tagger, classify skill, config template. No consumers touched. Manual tests via `/risk-pipeline:tag-sweep` + `/risk-pipeline:classify`.

### Phase 1 — Opt-in shadow mode

- Consumers invoke `risk-pipeline:classify` alongside existing tier logic.
- Both verdicts logged to telemetry.
- Pipeline still uses existing tier logic.
- User compares verdicts over N tasks.

### Phase 2 — Opt-in authoritative

- Project sets `risk_pipeline.enabled: true`.
- Consumers use risk verdicts, ignore tier.
- Tier code remains for projects without `.claude/rules/risk.md`.

### Phase 3 — Deprecate tiers

- Remove tier classification from dartai + workflow.
- Breaking change; plugin minor version bump.

### Codebase bootstrap (per project, one-time)

- `/risk-pipeline:tag-sweep --scope all`
- Checkpoints in `.risk-pipeline/sweep-state.json`; resumable
- Monorepos: scope by package first
- Cost estimate: 1000 units × Haiku ≈ $0.30–0.80 one-time

### Untagged project fallback

- Consumers work without risk-pipeline installed → fall back to tier logic.
- Risk-pipeline absent → classify returns `enabled: false` → existing pipeline runs.

---

## Test strategy

- Unit tests for `risk-classify`: tag vector → verdict table.
- Integration: synthetic project with tagged units → classify → assert pipeline tier.
- Regression: verdicts vs hand-labeled reference set of 30 historical tasks.
- Drift: re-tag same unit 10× → confidence/score variance below threshold.
- Fuzzing: malformed `@risk` lines → parser tolerates gracefully.

---

## Open questions (user review)

- [ ] Default scalar budget (10) — calibrate against reference set before committing number.
- [ ] Should `risk-pipeline` ship with a `/risk-pipeline:audit` command that replays last N tasks' telemetry and flags miscalibrated weights?
- [ ] Is `docs/superpowers/specs/` the right spec location for this project, or should it go under `plans/` (which already exists in this repo)?

---

## Effectiveness — risk model vs tiers

Summary table for the record:

| Goal | Tiers (file-count) | Risk model | Winner |
|------|--------------------|------------|--------|
| Classify by complexity + context | Gameable; 1-file auth = 1-file typo | Budget + dim vector reflects real cost | Risk |
| Split as SOP | Reactive (`>5 files`) | Proactive (budget + slice boundary + findability) | Risk |
| Right reviews / model | 4 fixed pipelines | Dim-matched reviewers + model per scalar | Risk |

Tiers retained as cheap pre-filter (trivial bypass) to avoid paying tagger for genuinely-trivial changes. Pre-filter enforces findability (no file bloat, no new-file orphans) so bypass can't hide risk.
