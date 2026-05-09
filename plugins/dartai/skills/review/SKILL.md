---
name: review
description: Adversarial audit of past Dart tasks and Claude/opencode/kimi session logs - surfaces inefficiencies (rework, loops, abandoned approaches, slow turns) and gaps (missing skills, weak docs, planning blind spots) with concrete amendment recommendations. 對抗性審查歷史Dart任務及Claude/opencode/kimi會話日誌：揭示低效（返工、循環、廢棄方法、慢迭代）與缺口（技能缺失、文檔薄弱、規劃盲點），給出具體修訂建議。 Use when: process improvement audit, find inefficiencies, identify skill gaps, retrospective, why are tasks slow, where do agents get stuck, what should we document
---

# Work Review

對歷史工作做對抗性審查，找出低效模式與規劃缺口，產出對docs/skills/planning流程之修訂建議。

> **Access Pattern**: Always call dart-query through slop-mcp:
> ```yaml
> tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
> params:
>   mcp_name: "dart-query"
>   tool_name: "<tool>"
>   parameters: { ... }
> ```

> Companion: `dartai:report` for status dashboard. This skill consumes overlapping data but with critical lens.

## Inputs

```yaml
dartboard: string         # required
project_root: path        # default: cwd
window_days: integer      # default: 30
output: path              # default: ./reports/dartai/<timestamp>/review.md
create_dart_tasks: bool   # default: false - when true, file recommendations as Dart tasks
```

Default to writing markdown not HTML — output is for humans + future skill amendments, not a dashboard.

## Stance

Adversarial. Default assumption: existing process has waste. Every recommendation must cite evidence (task id, session file, line range). No speculative "consider X" without grounding.

Skip findings you cannot evidence. Better to report 5 grounded gaps than 20 speculative ones.

## Data Sources

Same as `dartai:report` — see that skill for log paths and dart-query queries. Reuse aggregation logic; do not duplicate.

## Inefficiency Patterns to Detect

### Rework signals
- Same file edited in ≥3 sessions across different tasks within window
- Status flip `Done → In Progress` or `Done → Blocked`
- Comment text matching `revert`, `redo`, `actually broken`, `regression`

### Loop signals
- Ralph Wiggum loop tasks where same pipeline phase ran ≥3 times
- Session with ≥10 consecutive tool calls of same name without progress (e.g. repeated Read of same file)
- Identical or near-identical user prompts within one session

### Abandoned approach signals
- Task with planning comments then status → Cancelled / deleted
- Branch references in logs with no merge commit
- File created then deleted within same task

### Slow turn signals
- Median assistant response latency above session p90 baseline
- Task elapsed wall time > 3× median for its size class (when size set)
- Tool call sequences where >50% are read/search vs edit/write — suggests poor target acquisition

### Process bypass signals
- Edits without prior Read in same session
- Commits without test runs (no `pytest`/`npm test`/`go test`/`cargo test` Bash calls before commit)
- Skill registered as relevant but never invoked despite matching trigger keywords in prompts

## Gap Patterns to Detect

### Documentation gaps
- Repeated user clarification on same topic across sessions → missing doc
- High `WebFetch`/`WebSearch` rate for same domain → missing local reference
- Recurring `mcp__*__get_metadata` calls for same tool → missing skill quick-ref

### Skill gaps
- Workflow repeated by hand across ≥3 sessions with no skill invocation → candidate skill
- Existing skill bypassed in favor of ad-hoc tool sequence → skill description likely fails to trigger
- Skill invoked then abandoned mid-execution → skill quality issue

### Planning gaps
- Tasks completed without Dart entry (DART-id absent from session) → planning bypass
- Replans concentrated in one task class → planning template missing for that class
- Tasks with no `subtask_ids` but multi-day duration → decomposition missing
- Blocker tasks with no `blocker_ids` set → relationship hygiene missing

## Process

### 1. Gather

- Reuse data collection from `dartai:report` (tasks within window, session logs, replan signals).
- Load skill registry: scan `plugins/*/skills/*.md` and `plugins/*/.claude-plugin/plugin.json` for available skills + descriptions + trigger keywords.
- Load doc registry: `README.md`, `CLAUDE.md`, `docs/**/*.md` within project root.

### 2. Detect

Run each pattern detector. For each match record:
```yaml
finding:
  pattern: <category>/<name>
  severity: low | medium | high
  evidence:
    - kind: dart_task | session | file
      ref: <id or path>
      excerpt: "..."   # short, verbatim
  cost_estimate: "<rough impact - e.g. ~3 hours redone work>"
```

Be conservative on severity. `high` requires repeated occurrences or measurable cost.

### 3. Map to Amendments

For each finding cluster, propose ONE concrete amendment in this shape:

```yaml
recommendation:
  target: docs | skill | planning_template | hook | role_rule
  action: create | update | retire | clarify
  artifact: <path or skill name>
  diff_sketch: |
    <2-5 line summary of the change>
  rationale: <why this amendment removes the inefficiency>
  evidence_refs: [finding_id, ...]
```

Group recommendations by `target` so the user can act in batches.

Prefer soft guidance amendments ("prefer X", "default toward Y") over hard rules unless evidence shows the soft form already failed.

### 4. Output

Write `output` markdown:

```markdown
# Work Review — <dartboard> — <window>

## Summary
- Findings: <N> (<high>/<med>/<low>)
- Recommendations: <N> across <targets>
- Estimated waste in window: <hours/cost>

## Inefficiencies
### <pattern> — severity
Evidence: ...
Cost: ...

## Gaps
### <pattern> — severity
Evidence: ...

## Recommended Amendments
### docs/<file>
- <action>: <diff sketch>
  Rationale: ...
  Evidence: [finding-3, finding-7]

### skills/<name>
- ...

## Appendix
- Sessions scanned: <list>
- Tasks reviewed: <list>
```

If `create_dart_tasks: true`, also create one Dart task per recommendation with title `Amend <target>: <action> <artifact>` and body containing the recommendation block. Set `priority` based on severity (high→`high`, med→`medium`, low→`low`). Use string enums per workspace conventions.

### 5. Self-check

Before declaring done:
- Every finding has ≥1 verifiable evidence ref.
- Every recommendation traces to ≥1 finding.
- No recommendation invents a new abstraction without evidence the existing form failed.
- Recommendations that would set hard limits include an escape valve.

If self-check fails, drop the unsupported items rather than weaken evidence standards.

## Quality Bar

- Adversarial but not inflationary. Empty findings list is a valid result.
- Every metric reproducible from cited sources.
- Output deltable — no recommendation that says "improve X" without saying how.
- No critique of user behavior; critique of process artifacts only.

## Usage

```
Skill: dartai:review
Args: dartboard="Personal/agnt" window_days=30 create_dart_tasks=true
```

## Related

- `dartai:report` — neutral status dashboard, run first
- `dartai:doc-templates` — formats for the recommended amendments
- `dartai:simple-planning` — target for planning-template amendments
- `workflow:review-memories` — sibling pattern for skill-level review
