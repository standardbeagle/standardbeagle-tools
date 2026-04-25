# R2 — Dartai Sub-Dispatch Interface for Ported Agents

**Status:** Done
**Dart task:** [Pz0DaAZ35XCk](https://app.dartai.com/task/Pz0DaAZ35XCk)
**Parent epic:** `5M3PMcxNe1cB` — Consolidate superpowers + compound-engineering into standardbeagle-tools
**Author:** task-executor (auto), iteration 2
**Date:** 2026-04-25
**Time-boxed:** 2h
**Depends on:** [R1 plugin manifest audit](./R1-plugin-manifest-audit.md) — binding architectural rule cited throughout.

---

## 1. Executive Summary

Three live sub-dispatch sites exist in dartai today. R2 traces them, names them, and locks the interface every ported SP/CE agent must satisfy.

| # | Live dispatch site | Caller (file:section) | Callee (agent) | Mechanism |
|---|---|---|---|---|
| D1 | Quality-loop fast gate (Phase 3) | `plugins/dartai/skills/adversarial-quality-loop.md:667–728` | `dartai:code-quality-reviewer`, `dartai:qa-reviewer` | **Task tool** (parallel, two `subagent_type` calls) |
| D2 | Quality-loop deep review (Phase 5) | `plugins/dartai/skills/adversarial-quality-loop.md:858–910` | `dartai:post-task-reviewer` | **Task tool** (single sequential call) |
| D3 | Quality-loop completion docs (5.7) | `plugins/dartai/commands/start.md:736–745` | `dartai:doc-updater` | **Task tool** (optional, conditional) |

**There is no SessionStart injection. There is no direct file Read. There is no Skill-tool dispatch of agents.** All three live sites use the same primitive: `Task tool` with `subagent_type: "<plugin>:<agent-name>"`, a free-form `prompt:` string, and the implicit contract that the callee returns one structured YAML report at the end of its final assistant message.

**Decision (binding):** ported agents adopt the same primitive. **Task tool, plugin-namespaced `subagent_type`, prompt-templated input, structured-YAML output as the final message body.** No new mechanism is introduced. R1's conditional-dispatch / no-SessionStart-bloat rule is preserved by construction — `Task` lazy-loads agent body on invocation, never at session start.

**Three integration points named:**

- **INT1** — Wire ported CE/SP review-personas into the fast adversarial gate (D1). New plugin `compound-review` clusters them (per R1 §5.2(4)). Dispatched in parallel alongside `code-quality-reviewer` + `qa-reviewer` when the work-task type triggers them.
- **INT2** — Wire ported CE/SP research agents into `adversarial-planning-loop` (new dispatch site at planning Step 3.5). `Task tool` with `subagent_type: "compound-research:<agent>"`. Returns a research-report shape that the planner consumes to build research subtasks.
- **INT3** — Wire ported CE doc-review agents into `post-task-reviewer` Phase 3 (D2 callee, internal sub-dispatch) **or** as a sibling Phase 5b dispatch from the quality loop. Recommended: sibling Phase 5b (avoids nesting Task-inside-Task, which inflates token cost and blurs failure ownership).

**Spec is concrete. Schemas, not vibes.** §3 fixes the input contract. §4 fixes the output contract. §5 picks the dispatch mechanism with rationale tied back to R1. §6 gives one full wire-up example per INT.

---

## 2. Current Sub-Dispatch Trace (Evidence)

### 2.1 D1 — Fast Adversarial Gate (Phase 3)

Source: `plugins/dartai/skills/adversarial-quality-loop.md`, lines 667–728. Caller is the `dartai:task-executor` agent running the quality-loop skill.

**Mechanism:** `Task tool`, two parallel calls, one block per reviewer. The skill literally instructs `**Dispatch both in parallel using the Task tool:**` and emits a YAML config block with `subagent_type`, `description`, and `prompt` keys per agent.

**Input (per callee):**
```yaml
subagent_type: "dartai:code-quality-reviewer"     # or dartai:qa-reviewer
description: "Review code quality for [task-title]"
prompt: |
  Review code quality for task [TASK_ID].

  ## Changed Files
  [list of files changed]

  ## Acceptance Criteria
  [criteria from task]

  Focus on: project coherence, best practices, no bloat,
  no fallbacks/TODOs, code duplication, cleanup and refactoring.

  Return structured verdict: PASS, FAIL, or NEEDS_WORK with issues.
```

**Output expectation:** the skill's `result_handling` block (lines 711–728) consumes a single field — `<reviewer>_verdict ∈ {PASS, FAIL, NEEDS_WORK}` — and branches:
- both PASS → proceed.
- any NEEDS_WORK or FAIL → fix-and-redispatch the failing reviewer only (max 2 retries), then escalate to RETURN-with-failure.

The verdict field comes from the structured YAML report each reviewer emits (§4 below).

**Caller-side state:** none. The Task tool isolates the callee. The caller reads only the returned final message text and parses the YAML report.

### 2.2 D2 — Post-Task Deep Review (Phase 5)

Source: `plugins/dartai/skills/adversarial-quality-loop.md`, lines 858–910.

**Mechanism:** `Task tool`, single sequential call after quality gates pass and after Phase 4.5's `dev-standards:review-for-plan-updates` skill invocation.

**Input:**
```yaml
subagent_type: "dartai:post-task-reviewer"
description: "Deep review for [task-title]"
prompt: |
  Run post-task deep review for task [TASK_ID].

  ## Changed Files
  [list]

  ## Acceptance Criteria
  [criteria]

  ## Context
  The fast adversarial gate (code-quality-reviewer + qa-reviewer) already
  passed. Quality gates (lint, test, coverage) are green.

  Run all four phases sequentially:
  1. Security audit (attacker mindset, OWASP, attack vectors)
  2. In-depth code review (performance, concurrency, architecture)
  3. PM review (documentation accuracy, user flows, changelog)
  4. Replan (adjust remaining tasks based on findings)

  Return structured post-task report with verdict and replan recommendations.
```

**Output expectation:** caller reads `verdict` (PASS|FAIL|NEEDS_WORK), `security_audit.overall_risk`, `replan.tasks_to_create|modify|remove`. The full schema is fixed in `plugins/dartai/agents/post-task-reviewer.md:358–404`.

**Caller-side state:** none. Same isolation as D1.

### 2.3 D3 — Doc Updater (5.7, optional)

Source: `plugins/dartai/commands/start.md`, lines 736–745. Dispatched from the **start command (loop driver)**, not from the quality-loop skill itself, because doc updates run after task release/commit.

**Mechanism:** `Task tool` with `max_turns: 20` (shorter cap because doc updates are bounded I/O work, not deep analysis).

**Input:**
```yaml
subagent_type: "dartai:doc-updater"
description: "Update docs for completed task"
max_turns: 20
prompt: "Update documentation for task [TASK_ID]..."
```

**Output expectation:** caller logs the returned summary message. No structured-YAML required; this is the lightest contract of the three.

### 2.4 Negative space — what is NOT used today

| Mechanism | Used by dartai? | Why we don't need it |
|---|---|---|
| `Skill` tool to invoke an agent | **No** | Skills can't run as isolated subagents — they execute in caller context. Used by dartai for `dev-standards:review-for-plan-updates` (Phase 4.5) — a skill, not an agent. |
| Direct `Read` of agent body | **No** | Would defeat conditional-dispatch. R1 forbids it (§5.3). |
| `SessionStart` body injection | **No** | R1 §6 binding decision: forbidden. Discovery-index frontmatter is sufficient. |
| Hook-driven dispatch (`hooks.json` `Stop`/`PreToolUse` spawning a Task) | **Yes, narrowly** | `hooks/hooks.json` Stop hook spawns the loop-guardian subagent (`scripts/mark-interrupted.js` for SessionEnd). Out of scope for **agent** dispatch — this is harness-level orchestration, not work-task review. Ports must not piggy-back here. |
| Agent → Agent nested Task call | **Possible** | The fast-gate reviewers have `Task` in their `tools:` allowlist (e.g. `code-quality-reviewer.md` line 5), so they *could* sub-dispatch. **Not currently used.** Recommended to keep flat for INT1/INT2/INT3 — see §5.4. |

---

## 3. Input Contract (How Dartai Invokes a Ported Agent)

Every ported agent MUST be dispatchable with exactly this Task-tool call shape. No exceptions.

### 3.1 Frontmatter requirements (the agent-side contract)

The ported agent's `.md` frontmatter MUST declare:

```yaml
---
name: <kebab-case-agent-name>            # required, must equal filename stem
description: |                            # required, ≤ 1 KB per R1 §6 cap
  <Wenyan one-liner>. <English one-liner>. Use when: <comma-separated triggers>. Skip when: <negative case>.
model: <opus|sonnet|haiku|inherit>        # required; ports default `inherit` unless deep-analysis use case
tools:                                    # required; explicit allowlist
  - Read
  - Grep
  - Glob
  - Bash                                  # if needed
  - mcp__plugin_lci_lci__search           # if needed
  - mcp__plugin_lci_lci__get_context      # if needed
  - Task                                   # ONLY if agent itself sub-dispatches; default omit
  - mcp__plugin_slop-mcp_slop-mcp__execute_tool   # if dart-query writes are needed
whenToUse: |                              # optional but recommended; inline <example> blocks
  <example>...</example>
---
```

**Naming rule:** `<plugin-name>:<agent-name>` is the wire identifier. So `compound-review:ce-typing-czar` (port of CE's `ce-typing-czar` review persona) is dispatched as `subagent_type: "compound-review:ce-typing-czar"`.

**Frontmatter size enforcement:** R1 §6 caps total frontmatter at 1 KB per agent. INT1's acceptance criteria adds a lint hook in `risk-pipeline` that scopes to `plugins/*/agents/*.md` and rejects ports breaking the cap.

**`tools:` not `allowed-tools:`:** SP/CE use `tools:` (R1 §2.2). SBT existing agents use `allowed-tools:` *informally in some places*, but the dartai/workflow agents themselves use `tools:`. Ported agents follow the dartai convention (`tools:`).

### 3.2 Caller-side prompt template

The caller (a dartai skill or command) MUST shape the prompt with this sectioned structure. Sections in **bold** are required; others are optional/context-dependent.

```
**Header line: one-sentence task statement.**

## Task ID
[dart_task_id]

## Changed Files
- file1
- file2
...

## Acceptance Criteria
- criterion 1
- criterion 2

## Risk Vector (optional)
{ b, d, s, r, u, scalar, verdict, pipeline_tier, required_reviewers, model, tdd_required }

## Context (optional, per-INT semantics)
[free-form — INT1 includes prior reviewer verdicts; INT2 includes parent task description; INT3 includes the post-task report]

## Focus
[one-line statement of what THIS reviewer is uniquely responsible for]

## Return
Return structured <report-shape-name> as the final message body, no preamble.
```

The trailing **Return** instruction is load-bearing: it tells the callee to emit YAML/JSON only at the end of its last message (no streaming preface, no "Hope this helps!" trailing). The caller-side parser scans the last assistant message for a fenced code block and parses it.

### 3.3 Optional Task-tool parameters

| Parameter | When to set | Default | Source |
|---|---|---|---|
| `description` | always | one-sentence label | `start.md:474`, `quality-loop:677,693,867` |
| `subagent_type` | always | `<plugin>:<agent>` | per §3.1 naming rule |
| `prompt` | always | per §3.2 template | n/a |
| `max_turns` | bounded I/O agents (e.g. doc-updater) | unset (no cap) | `start.md:743` |
| `model` (override) | when `risk_vector.model` is supplied | inherit from risk-pipeline | `task-executor.md:72` |

### 3.4 What dartai never passes to a sub-dispatched agent

- **Conversation history.** The Task tool gives the callee a fresh context. Pass everything it needs in the prompt.
- **Live file paths only — not file contents.** The callee reads files itself via its `Read` tool. Pre-loading content into the prompt would inflate caller-side context and defeat isolation.
- **Caller-side mutable state.** No "you're agent #2 of 5 in this loop" sequence numbers. Each callee assumes single-shot.

---

## 4. Output Contract (What Dartai Expects Back)

The callee's final assistant message MUST end with one fenced YAML or JSON code block matching one of three report shapes. Anything before the fence is human-readable narrative; the parser ignores it.

### 4.1 Report shape: `review-report` (INT1, fast gate)

Mirrors the existing `code-quality-reviewer` and `qa-reviewer` outputs. Source: `plugins/dartai/agents/qa-reviewer.md:361–411`.

```yaml
review_report:
  verdict: "PASS|FAIL|NEEDS_WORK"        # required, drives caller branching
  reviewer: "<plugin>:<agent>"           # required, identity for caller logs
  target: "<task-id-or-file-list>"       # required, audit trail
  summary:                                # required
    issues_found: <int>
    severity_counts: { critical: <int>, high: <int>, medium: <int>, low: <int> }
  issues:                                 # required (may be empty array)
    - id: <int>
      severity: "critical|high|medium|low"
      category: "<reviewer-specific-string>"  # e.g. "type-safety", "duplication"
      description: "<what's wrong>"
      location: "<file:line>"             # required; "n/a" if cross-cutting
      recommendation: "<how to fix>"
  positive_findings: ["<what was done well>"]   # optional but encouraged
  risk_vector_acknowledged: <bool>        # required when risk_vector was supplied
```

**Caller branching rule (matches D1 today):**
- `verdict: PASS` → continue.
- `verdict: NEEDS_WORK | FAIL` → fix issues inline, redispatch this reviewer once. Cap retries at 2. Escalate to RETURN-failure on third strike.

### 4.2 Report shape: `research-report` (INT2, planning research)

New shape — there is no precedent in dartai today. Designed to be planner-consumable: each finding maps directly to a Dart-task-creatable proposal.

```yaml
research_report:
  verdict: "COMPLETE|PARTIAL|BLOCKED"     # required
  researcher: "<plugin>:<agent>"          # required
  question: "<the original research question>"  # required, audit trail
  findings:                               # required, ≥ 1 entry
    - id: <int>
      claim: "<one-sentence factual claim>"
      evidence: ["<url|file-path|cite>"]  # required, ≥ 1 source per finding
      confidence: "high|medium|low"
      challenged_against: "<adversarial counter-claim or 'none'>"  # required for high-confidence
  proposed_subtasks:                       # required (may be empty)
    - title: "<≤70 chars, concrete deliverable>"
      rationale: "<why this proposal>"
      acceptance_criteria: ["<criterion>"]
      size: "XS|S|M|L|XL"                 # string per dart-query quirk
      depends_on: ["<finding-id>"]
  open_questions: ["<question>"]           # optional, becomes future R-tasks
  sources_consulted: ["<url-or-path>"]    # required, full audit trail
```

**Caller branching rule (planner side):**
- `verdict: COMPLETE` and ≥ 1 `proposed_subtasks` → planner creates Dart tasks under the parent epic.
- `verdict: PARTIAL` → planner creates open-question tasks plus whatever subtasks were proposed.
- `verdict: BLOCKED` → planner stops, surfaces blocker as a fix-task under the loop task.

### 4.3 Report shape: `doc-review-report` (INT3, post-task doc audit)

Extends the existing `post-task-reviewer.pm_review` block (`plugins/dartai/agents/post-task-reviewer.md:383–395`). Designed so a post-task-reviewer **could** consume a fleet of doc-review specialists in parallel and merge their reports — but the recommended INT3 wiring keeps the doc-review agent as a Phase-5b sibling, not a sub-dispatch (see §5.4 and §6.3).

```yaml
doc_review_report:
  verdict: "PASS|NEEDS_WORK|FAIL"         # required
  reviewer: "<plugin>:<agent>"            # required
  scope: "<docs-glob-or-file-list>"       # required
  documentation_status:                    # required
    api_docs: "current|needs_update|missing|n/a"
    user_stories: "current|needs_update|missing|n/a"
    user_flows: "current|needs_update|missing|n/a"
    tech_docs: "current|needs_update|missing|n/a"
    changelog: "current|needs_update|missing|n/a"
    readme: "current|needs_update|missing|n/a"
  stale_docs_found: <int>                  # required
  doc_issues:                              # required (may be empty)
    - description: "<what needs updating>"
      location: "<file>"
      recommendation: "<what to change>"
      severity: "critical|high|medium|low"
  proposed_doc_tasks: ["<task title>"]     # optional; becomes Dart tasks
```

**Caller branching rule:**
- `verdict: PASS` → no action.
- `verdict: NEEDS_WORK` → caller spawns `dartai:doc-updater` (D3 mechanism) with the issues list as input.
- `verdict: FAIL` → critical doc gap blocks task completion; create blocker subtask, mark work task `Blocked`.

### 4.4 Mandatory output discipline (all three shapes)

1. **Final fenced code block only.** No mid-message YAML — the parser reads the *last* fenced block.
2. **No partial reports.** If the callee can't fill a required field, it sets `verdict: BLOCKED|FAIL` and explains in `summary` or `findings`. Never silently omits.
3. **No prose continuation after the fence.** The fence is the end of the report. Any trailing prose is treated as ignorable narrative but should be omitted.
4. **Wenyan in narrative is fine; report fields are English-only.** Field values are machine-consumed. Wenyan in field values breaks the planner.

---

## 5. Dispatch Mechanism Decision

### 5.1 Options considered

| Mechanism | Loads agent body? | Isolated context? | Frontmatter cost? | Caller-callee state coupling? |
|---|---|---|---|---|
| **A. Task tool with `subagent_type`** | Lazy, on invocation | **Yes** (fresh context) | Frontmatter only at session start | None |
| B. Skill tool (`Skill skill_name`) | Lazy, on invocation | **No** (caller context) | Frontmatter only at session start | High — skill body executes in caller |
| C. Direct `Read` of agent body, then prompt-inject | Eager, on caller turn | No | Caller pays full body cost | High — caller orchestrates everything |
| D. SessionStart hook injection | Eager, every session | No | Full body in session preamble | N/A — no dispatch, just preamble |

### 5.2 Decision

**Pick A. Task tool with `subagent_type`.** Same primitive dartai already uses at D1, D2, D3.

**Rationale (tied to R1):**

1. **R1 §6 binding decision** — *all ported agents must use Layer-1 conditional-dispatch, no SessionStart bloat*. Option A is Layer-1 by construction (Task tool lazy-loads the agent body only at invocation). Options C and D violate R1 directly (eager loading, body in session preamble respectively). Option B technically also lazy-loads but conflates caller and callee context.

2. **Isolation is the reason fast-gate parallel review works.** D1's parallel `code-quality-reviewer` + `qa-reviewer` dispatch only works because each callee gets fresh context. If they shared caller context, the second reviewer would see the first reviewer's findings and bias its own output. Option A is the only mechanism that preserves this.

3. **Single primitive across all three INTs.** Adding a second mechanism (e.g. Skill for INT2 because "research feels like a skill") doubles the surface area future readers must learn. R1's bloat-cap argument extends here: keep the integration story flat.

4. **Caller-side state stays zero.** Options C and D require the caller to track which agents have been invoked, what they returned, etc. Option A delegates state to the harness — caller just reads the final assistant message.

### 5.3 Rejection rationale (one line each)

- **B (Skill).** Loses isolation. Fast-gate parallel review pattern breaks.
- **C (Read + inject).** Eager body load. Violates R1 §6. Per-call cost is full agent body, not just frontmatter.
- **D (SessionStart).** Forbidden by R1 §6. Loads all ported bodies on every session, regardless of whether work-task type triggers them.

### 5.4 Open question: nesting (Task-inside-Task)

The fast-gate reviewers have `Task` in their `tools:` list, meaning a ported reviewer *could* sub-dispatch further. Should INT1/INT2/INT3 ports do that?

**Recommendation: no, keep dispatch flat.** Reasons:

1. **Token cost stacks.** Each Task hop is a fresh context with its own frontmatter index. Two-level nesting at N=10 reviewers = N² (~100) frontmatter loads worst case.
2. **Failure ownership blurs.** When a Task-inside-Task fails, the outer caller sees a generic Task-failure result with no insight into which inner agent broke. Today's flat D1 dispatch surfaces failures cleanly via the per-reviewer verdict.
3. **The post-task-reviewer alternative covers the legitimate use case.** If a port needs orchestration logic (e.g. "run six doc-review specialists, merge"), promote it to a sibling Phase 5b dispatch (§6.3), not nested inside post-task-reviewer.

**Forbid:** ported agents under INT1/INT2/INT3 must NOT include `Task` in `tools:` unless explicitly justified in their PR. Default omit.

---

## 6. Wiring Recipe — One Concrete Example per INT

Each recipe shows: (a) where the new dispatch site lives, (b) the exact Task-tool invocation block to add, (c) the result-handling branch.

### 6.1 INT1 — Wire ported review-personas into the fast adversarial gate

**Dispatch site:** `plugins/dartai/skills/adversarial-quality-loop.md`, Phase 3 (line ~671). Extend the existing `concurrent_agents` YAML block.

**Concrete example: port CE's `ce-typing-czar` (TypeScript type-safety persona).**

After porting, the agent lives at `plugins/compound-review/agents/ce-typing-czar.md` with frontmatter:

```yaml
---
name: ce-typing-czar
description: TypeScript type-safety enforcement — no `any`, exhaustive unions, branded primitives. 嚴守TypeScript類型安全。 Use when: TS code review, type-safety audit, generic correctness. Skip when: non-TS code, runtime-only checks
model: inherit
tools: [Read, Grep, Glob, mcp__plugin_lci_lci__search]
---
```

Frontmatter ≈ 380 B → well under R1 §6's 1 KB cap.

**Wire-up — add to `adversarial-quality-loop.md:673` `concurrent_agents:` block when `risk_vector.required_reviewers` includes typing or when changed files match `**/*.ts` ∪ `**/*.tsx`:**

```yaml
concurrent_agents:
  code_quality_reviewer:
    subagent_type: "dartai:code-quality-reviewer"
    description: "Code quality review for [task-title]"
    prompt: |
      [existing prompt]

  qa_reviewer:
    subagent_type: "dartai:qa-reviewer"
    description: "QA review for [task-title]"
    prompt: |
      [existing prompt]

  ce_typing_czar:                          # NEW dispatch — INT1
    enabled_when: "any(file.endsWith('.ts') || file.endsWith('.tsx'))"
    subagent_type: "compound-review:ce-typing-czar"
    description: "Type-safety review for [task-title]"
    prompt: |
      Run type-safety review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of *.ts / *.tsx files]

      ## Acceptance Criteria
      [criteria]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Type safety only. No `any`, exhaustive unions, no unsafe assertions,
      branded-primitive opportunities, generic constraint correctness.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.
```

**Result handling — extend `result_handling:` block (line 711):**

```yaml
result_handling:
  all_pass:
    action: "Proceed to Phase 4"
    note: "All gate reviewers approved"

  any_needs_work:
    action: "Fix issues, re-dispatch ONLY the failing reviewer(s)"
    max_retries: 2

  any_fail:
    action: "Fix issues, re-dispatch ONLY the failing reviewer(s)"
    max_retries: 2
    escalate_after: "If still failing after 2 retries, RETURN with failure"
```

No structural change — the existing handling is N-reviewer-agnostic. Just adds `ce_typing_czar_verdict` to the joined-AND of `pass_if`.

**Frontmatter cap check (lint-enforced per R1 §6):** ce-typing-czar at 380 B → pass. The new `compound-review` plugin at N=10 review personas adds ~3.8 KB to the discovery index — well under the 5400-token consolidation budget.

### 6.2 INT2 — Wire ported research agents into adversarial-planning-loop

**Dispatch site:** new — `plugins/dartai/skills/adversarial-planning-loop.md`, insert at Step 3.5 between Step 3 (Build Task Hierarchy) and Step 4 (Context-Sized Task Validation). Today there is no live research dispatch; this is the new site.

**Concrete example: port CE's `ce-web-researcher` (S1 spike target — see Dart task `Pkvn7QecgxJA`).**

After porting, the agent lives at `plugins/compound-research/agents/ce-web-researcher.md`:

```yaml
---
name: ce-web-researcher
description: Web research with adversarial source verification — claims + evidence + counter-claim per finding. 網絡研究及對抗性來源驗證。 Use when: external research needed, evidence gathering, fact-checking. Skip when: codebase-only questions
model: inherit
tools: [Read, WebSearch, WebFetch, mcp__plugin_slop-mcp_slop-mcp__execute_tool]
---
```

**Wire-up — new Step 3.5 in `adversarial-planning-loop.md`:**

```markdown
### Step 3.5: Dispatch Research Agents (INT2)

When the planner identifies open knowledge gaps that must be answered before
creating a context-sized task hierarchy, dispatch research agents in parallel
via the Task tool. Each gap → one research agent invocation.

**Dispatch:**

```yaml
research_dispatch:
  for_each_gap:
    subagent_type: "compound-research:ce-web-researcher"  # or other ported researcher
    description: "Research: [gap.question]"
    prompt: |
      Run external research for question: [gap.question]

      ## Parent Task
      [parent_task_id] — [parent_task_title]

      ## Research Question
      [gap.question]

      ## Context (from planning so far)
      [planner-accumulated context: domain, constraints, prior findings]

      ## Acceptance for this research
      - At least 3 sources consulted
      - Each finding has ≥1 source citation
      - Each high-confidence finding has an adversarial counter-claim
      - Output ≥1 proposed_subtasks if any actionable next step exists

      ## Return
      Return structured research_report (per R2 §4.2) as the final message
      body, no preamble. verdict ∈ {COMPLETE, PARTIAL, BLOCKED}.
```

**Result handling:**

```yaml
result_handling:
  complete:
    action: "Apply proposed_subtasks — create Dart tasks under parent epic"
    next: "Continue to Step 4"

  partial:
    action: "Create open-question tasks + apply any proposed_subtasks"
    next: "Continue to Step 4 with reduced confidence flag"

  blocked:
    action: "RETURN with failure to outer planning loop"
    note: "Researcher couldn't make progress — escalate to human review"
```
```

**Persistence:** the `proposed_subtasks` go through dart-query `create_task` calls under the parent epic. Per the project memory rule, parentage is set by adding `subtask_ids` to the parent after children are created (not via `parentId` on creation).

**Frontmatter cap check:** ce-web-researcher ≈ 360 B → pass. Adding 3 researchers (R1 audit's CE research-agent count is small) at ~1 KB combined.

### 6.3 INT3 — Wire ported doc-review agents into post-task review

**Dispatch site recommendation:** **sibling Phase 5b**, not nested inside `post-task-reviewer`. Add to `adversarial-quality-loop.md` between Phase 5 and Phase 6.

**Why sibling, not nested:** §5.4 — flat dispatch keeps failure ownership clean and avoids Task-inside-Task token amplification. Post-task-reviewer's PM review (its own Phase 3) already handles broad doc-status checks; INT3 covers specialist deep-dives (e.g. API doc accuracy) that benefit from a dedicated agent.

**Concrete example: port CE's `ce-api-doc-reviewer`.**

After porting, lives at `plugins/compound-review/agents/ce-api-doc-reviewer.md`:

```yaml
---
name: ce-api-doc-reviewer
description: API documentation accuracy review — JSDoc/TSDoc coverage, parameter shape drift, example correctness. API文檔準確性審查。 Use when: public API surface changed, doc drift suspected. Skip when: internal-only changes, no public exports
model: inherit
tools: [Read, Grep, Glob, mcp__plugin_lci_lci__search]
---
```

**Wire-up — new Phase 5b in `adversarial-quality-loop.md` after line ~921 (Plan Adjustment Point 5):**

```markdown
## Phase 5b: Specialist Doc Review (INT3)

When the post-task-reviewer's pm_review block flagged any of
{api_docs, tech_docs, user_flows} as `needs_update`, dispatch the matching
specialist doc-reviewer for a deep audit. Skip this phase if pm_review
returned all `current`.

**Dispatch (single sequential, may parallelize if multiple flagged):**

```yaml
doc_review_dispatch:
  enabled_when: "post_task_report.pm_review.documentation_status.api_docs == 'needs_update'"
  subagent_type: "compound-review:ce-api-doc-reviewer"
  description: "API doc audit for [task-title]"
  prompt: |
    Run specialist API documentation audit for task [TASK_ID].

    ## Task ID
    [TASK_ID]

    ## Changed Files
    [list of files with public exports]

    ## Acceptance Criteria
    [criteria]

    ## Context
    Post-task PM review flagged api_docs as `needs_update`. Source review:
    [post_task_report.pm_review excerpt]

    ## Focus
    Public API only. JSDoc/TSDoc coverage on every exported symbol,
    parameter shape matches signature, example code compiles, return types
    documented.

    ## Return
    Return structured doc_review_report (per R2 §4.3) as the final message
    body, no preamble. verdict ∈ {PASS, NEEDS_WORK, FAIL}.
```

**Result handling:**

```yaml
result_handling:
  pass:
    action: "Proceed to Phase 6"

  needs_work:
    action: "Spawn dartai:doc-updater (D3) with doc_review_report.doc_issues"
    next: "After doc-updater returns, proceed to Phase 6"

  fail:
    action: "Critical doc gap. Create blocker subtask under loop task."
    next: "Mark work task Blocked, RETURN failure to loop driver"
```
```

**Frontmatter cap check:** ce-api-doc-reviewer ≈ 380 B → pass. Phase 5b adds zero tokens to the steady-state index — the dispatch is gated on `pm_review` flag.

---

## 7. Adversarial Self-Review (Verifier Pass)

Red-team the spec against R1's bloat-cap and conditional-dispatch rules.

| # | Claim | Challenge | Verdict |
|---|---|---|---|
| 1 | "All three INTs use Task-tool dispatch, no new mechanism." | Did I introduce a Skill or SessionStart sneak-in? Re-read §6. INT1 extends `concurrent_agents` (Task). INT2 adds Step 3.5 (Task). INT3 adds Phase 5b (Task). All three: Task tool. **No new mechanism introduced.** | Holds |
| 2 | "Frontmatter cap of 1 KB per port (R1 §6)." | Three example agents listed: ce-typing-czar 380 B, ce-web-researcher 360 B, ce-api-doc-reviewer 380 B. All under cap. Risk: if a CE port has a long `whenToUse:` block, it could blow the cap. Mitigation: lint hook (R1 §6 enforcement). | Holds |
| 3 | "No SessionStart injection, no eager body load." | All three INTs lazy-load via Task tool. Discovery-index growth is pure frontmatter, not bodies. Compatible with R1's ~17% growth budget at N≈36. | Holds |
| 4 | "Forbid Task-in-Task nesting." | §5.4 forbids it. But §6.3 spawns doc-updater from inside Phase 5b's result-handling. Is that nesting? **No — Phase 5b is a sibling sequential dispatch from the quality-loop skill, and doc-updater is dispatched from the loop's start command after task release. The dispatch graph stays flat: skill → reviewer → return; skill → doc-updater → return.** Adversary's challenge dismissed; the spec is internally consistent. | Holds |
| 5 | "research_report shape is genuinely planner-consumable." | Test: can `proposed_subtasks` be created via dart-query `create_task` directly from the YAML? Required fields: `title`, dartboard, size string. Spec includes `title`, `size: "XS\|S\|M\|L\|XL"` (string per project memory), depends_on. Missing: `dartboard` (planner supplies from context). **OK — planner is responsible for parent/dartboard wiring, researcher is responsible for content.** | Holds |
| 6 | "Caller-callee isolation prevents bias in fast-gate parallel review." | The Task tool gives each callee fresh context. Confirmed by D1's existing pattern. INT1 inherits this property. | Holds |
| 7 | "INT3 sibling-dispatch is correct, not nested-in-post-task-reviewer." | Adversary: "isn't doc review part of PM review, which is part of post-task-reviewer's Phase 3? Why a separate phase?" Answer: post-task-reviewer's PM review is the cheap heuristic ('is it stale?'). Specialist agents do the expensive deep-dive (e.g. compile examples, check param shapes). Splitting them lets post-task-reviewer flag broadly and Phase 5b dive narrowly only when triggered. Avoids per-task double-cost. | Holds |
| 8 | "tools: vs allowed-tools: naming." | R1 §2.2 noted SBT inconsistency. Spec §3.1 picks `tools:` (matches dartai/workflow agents). If a port uses `allowed-tools:`, the lint hook from R1 §6 enforcement should normalize. | Holds — and surfaces a follow-up: extend lint to enforce `tools:` over `allowed-tools:` |
| 9 | "Output is final fenced block only — but agents emit narrative too." | §4.4 mandates last fenced block wins. Risk: caller-side parser must implement "find last fenced YAML/JSON block" not "first" or "anywhere." This is a small but real burden on the integration code. **Acceptable; no alternative is simpler.** | Holds |
| 10 | "Integration adds ≤17% to discovery index (R1 §6 budget)." | Three new plugins assumed: compound-review, compound-research. Budget: ~5400 tokens. Per-agent cost ~600 B = ~150 tokens. Budget supports ~36 ported agents total. R1's audit identified 28 review + 7 doc-review + research-? in CE → fits if cap held. | Holds |

**No claim was rejected after challenge.**

**Open follow-ups for INT1 ticket scope (not blockers for R2):**

- Lint hook in `risk-pipeline` plugin to enforce: `tools:` (not `allowed-tools:`), frontmatter ≤ 1 KB, no `Task` in tools allowlist unless justified.
- Caller-side parser library: shared utility for "find last fenced block, parse YAML, validate against shape." Currently each dispatch site re-implements this informally.
- Decide naming convention: prefix all CE ports with `ce-` (as in examples), all SP ports with `sp-`. Avoids name collisions in the merged plugin discovery index.

---

## 8. Inputs to INT Tickets (Concrete Acceptance Criteria)

R2 unblocks INT1, INT2, INT3 with these concrete criteria:

**INT1 acceptance:**
- New plugin `compound-review` exists with ≥1 ported agent (e.g. ce-typing-czar).
- `adversarial-quality-loop.md` Phase 3 `concurrent_agents:` block extended with conditional dispatch (per §6.1).
- Lint hook in `risk-pipeline` rejects ports breaking 1 KB frontmatter cap.
- Result-handling extended for new reviewers — verdict joins existing AND.

**INT2 acceptance:**
- New plugin `compound-research` exists with ≥1 ported research agent (e.g. ce-web-researcher).
- `adversarial-planning-loop.md` Step 3.5 added (per §6.2).
- `research_report` shape (R2 §4.2) consumed by planner — `proposed_subtasks` create real Dart tasks under parent epic.
- Per-finding adversarial counter-claim is enforced for `confidence: high` findings.

**INT3 acceptance:**
- ≥1 ported doc-review agent (e.g. ce-api-doc-reviewer) lives in `compound-review` plugin.
- `adversarial-quality-loop.md` Phase 5b added (per §6.3) — gated on `post_task_report.pm_review` flags.
- `doc_review_report` shape (R2 §4.3) consumed by Phase 5b result-handling — feeds back into D3 doc-updater dispatch.
- Sibling, not nested. Phase 5b runs as flat skill-level dispatch.

---

## Appendix A — Files Inspected

- `/home/beagle/work/standardbeagle-tools/docs/research/R1-plugin-manifest-audit.md` (parent reference)
- `/home/beagle/work/standardbeagle-tools/plugins/dartai/agents/{task-executor,code-quality-reviewer,qa-reviewer,post-task-reviewer,doc-updater}.md`
- `/home/beagle/work/standardbeagle-tools/plugins/dartai/skills/{adversarial-quality-loop,adversarial-planning-loop}.md`
- `/home/beagle/work/standardbeagle-tools/plugins/dartai/commands/{start,task}.md`
- `/home/beagle/work/standardbeagle-tools/plugins/dartai/scripts/mark-interrupted.js`
- `/home/beagle/work/standardbeagle-tools/plugins/dartai/hooks/hooks.json`
- `/home/beagle/work/standardbeagle-tools/plugins/dartai/.claude-plugin/plugin.json`
- `/home/beagle/work/standardbeagle-tools/plugins/workflow/agents/{task-executor,code-quality-reviewer,qa-reviewer,post-task-reviewer}.md`
- `/home/beagle/work/standardbeagle-tools/plugins/workflow/skills/loop-orchestration.md`

## Appendix B — Glossary

- **Sub-dispatch.** A live dispatch site at which a caller (skill, command, or agent) invokes another agent for isolated work.
- **Layer-1 conditional-dispatch.** R1's binding rule: agent body loads only at invocation, never at SessionStart or eagerly.
- **Discovery-index.** Frontmatter-only summary of all skills/agents/commands surfaced to the model at session start. Capped at ~125 KB today, R1 budget ≤ +17% growth (~5400 tokens) for the consolidation epic.
- **D1 / D2 / D3.** The three live sub-dispatch sites in dartai today (fast gate, post-task review, doc-updater).
- **INT1 / INT2 / INT3.** The three planned integration tickets R2 gates: review-personas → fast gate, research → planning, doc-review → post-task sibling.
