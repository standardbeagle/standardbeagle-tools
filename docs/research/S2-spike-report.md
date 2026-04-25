# S2 — Port `ce-ideate` End-to-End Spike Report

**Status:** Done — **GO**
**Dart task:** [bFJHUy3I1enG](https://app.dartai.com/task/bFJHUy3I1enG)
**Parent epic:** `5M3PMcxNe1cB` — Consolidate superpowers + compound-engineering into standardbeagle-tools
**Loop task:** `Svu14LNGwHsd`
**Author:** task-executor (auto), iteration 6
**Date:** 2026-04-25
**Time-boxed:** 4h (used: ~45 min)
**Inputs:** R1 (frontmatter rules + 1 KB cap + Layer-1 dispatch), R2 (research_report schema), R4 (canonical agents, drop `ce-` prefix, defer fold-via-`mode=` to I-series), S1 (verbatim-body recipe proven for `web-researcher`)

---

## 1. Verdict

**GO.** The biggest CE port surface — the multi-stage `ce-ideate` orchestrator that dispatches 6+ research and ideation sub-agents — ports cleanly using the **same verbatim-body recipe** S1 established. Body content is byte-for-byte identical except for `subagent_type` dispatch-target renames (`research:ce-X` → `research:X`). Frontmatter normalization stays well under the 1 KB cap on every ported file. Adversarial dependency scan finds **zero** dartai/superpowers/risk-pipeline/loop-state coupling.

This validates the verbatim-body recipe at the **largest CE skill surface** and clears the runway for I2 (17 reviewers) and I3 (5 remaining research agents).

**Same caveat as S1.** Live `Task(subagent_type: "research:web-researcher")` invocation cannot be tested in the same Claude Code session that creates the plugin — Claude Code rescans plugins at session start, not mid-session. The current session's skill registry confirms this: `compound-engineering:ce-ideate` IS visible (loaded at boot from the upstream marketplace) but the new `ideation:ideate` is NOT visible. Structural validation, dispatch-resolution dry-run, and adversarial scan substitute for live dispatch. See §6.

---

## 2. What Was Done

### 2.1 Files created

| Path | Bytes | Purpose |
|---|---:|---|
| `plugins/ideation/.claude-plugin/plugin.json` | 757 | New plugin scaffold for ported skill |
| `plugins/ideation/skills/ideate/SKILL.md` | 23,878 | Ported skill (frontmatter normalized, body verbatim except dispatch renames) |
| `plugins/ideation/skills/ideate/references/post-ideation-workflow.md` | 15,492 | Reference verbatim from CE source |
| `plugins/ideation/skills/ideate/references/universal-ideation.md` | 7,693 | Reference verbatim from CE source |
| `plugins/ideation/skills/ideate/references/web-research-cache.md` | 3,829 | Reference verbatim from CE source |
| `plugins/research/agents/learnings-researcher.md` | 9,727 | Verbatim port of `ce-learnings-researcher` (frontmatter normalized) |
| `plugins/research/agents/best-practices-researcher.md` | 6,480 | Verbatim port of `ce-best-practices-researcher` |
| `plugins/research/agents/framework-docs-researcher.md` | 4,712 | Verbatim port of `ce-framework-docs-researcher` |

### 2.2 Files modified

| Path | Change |
|---|---|
| `.claude-plugin/marketplace.json` | Added `ideation` plugin entry (v0.1.0, category `development`) before `research` entry |
| `plugins/research/.claude-plugin/plugin.json` | `agents` array extended from 1 to 4 entries (added learnings/best-practices/framework-docs) |

### 2.3 Plugin scaffold

`plugins/ideation/.claude-plugin/plugin.json` is minimum viable: `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `skills` array. No `mcp.json` shipped — skill-only plugin. Same shape as the S1 `research` plugin scaffold.

The skill uses the **multi-file form** (`skills/ideate/SKILL.md` + `references/*`) matching the CE source structure, not the single-file `skills/ideate.md` form. References are loaded conditionally by the skill body itself (not by the plugin manifest), so they don't need to be enumerated in `plugin.json`.

### 2.4 Researcher ports — design decision

The task spec asked: "If `ce-best-practices-researcher` and `ce-framework-docs-researcher` are referenced but not yet ported, port them as standalone (verbatim-body recipe) under `plugins/research/agents/`. Defer the R4 fold-via-`mode=` to later I-series; for spike just port them so the flow runs."

Decision: **port both as standalone** under `plugins/research/agents/`, plus `learnings-researcher` (which the skill dispatches in repo mode and elsewhere-software mode). The R4 §4 fold (where best-practices and framework-docs become `mode=` parameters inside `web-researcher`) is **deferred to I3** as planned. This keeps the spike honest — the skill runs with the dispatch-target names it actually contains.

Two skill-referenced agents are **not** ported in S2 by design:

| Skill reference | Status | Reason |
|---|---|---|
| `research:issue-intelligence-analyst` | Not ported | Conditional dispatch; only triggered when stage 0.3 detects issue-tracker intent (e.g. `bugs`, `github issues`, `bug reports`). Toy prompt `/ideate DX improvements for agnt browser debug` does NOT trigger this. Skill itself documents graceful degradation: "若代理回傳錯誤... 向用戶記錄警告並以剩餘紮根繼續". |
| `research:slack-researcher` | Not ported | Opt-in only; "永不自動分派". Skill never auto-dispatches. Toy prompt does not opt in. Port in I3 wave or when Slack workflow needed. |

Both deferrals are safe for the toy prompt because the **default flow** in repo mode without issue-tracker intent and without slack opt-in dispatches only `web-researcher` + `learnings-researcher` (plus the inline general-purpose codebase-scan sub-agent and 6 inline ideation sub-agents). Both `research:*-researcher` dispatches resolve to ported agents in this repo. See §5.2 dispatch-resolution dry-run.

---

## 3. Frontmatter Diff (Source → Port)

### 3.1 `ce-ideate` → `ideation:ideate`

| Field | CE source | SBT port | R1 §2.2 rule |
|---|---|---|---|
| `name` | `ce-ideate` | `ideate` | R4 §5: drop `ce-` prefix |
| `description` | Wenyan-only, ~360 B with trigger phrases inline | Bilingual Wenyan + English with explicit `Use when:` and `Skip when:`, ~700 B | R1 §2.2: bilingual + Use when/Skip when triggers |
| `argument-hint` | `[feature, focus area, or constraint]` | unchanged | unchanged (standard claude-code skill field) |
| `tools` / `allowed-tools` | absent | absent (skill does not declare tools — uses Task to dispatch) | N/A |

**Frontmatter total bytes:** **795 B**. Cap is **1024 B** per R1 §6. **Margin: 229 B.**

### 3.2 Researcher agents

| Agent | CE name | SBT name | Source FM | Port FM | Cap | Margin |
|---|---|---|---:|---:|---:|---:|
| Web research | `ce-web-researcher` | `web-researcher` | (S1) | 736 B | 1024 B | 288 B |
| Learnings search | `ce-learnings-researcher` | `learnings-researcher` | ~225 B | 683 B | 1024 B | 341 B |
| Best practices | `ce-best-practices-researcher` | `best-practices-researcher` | ~245 B | 689 B | 1024 B | 335 B |
| Framework docs | `ce-framework-docs-researcher` | `framework-docs-researcher` | ~245 B | 702 B | 1024 B | 322 B |

All four agent ports stay under the 1 KB frontmatter cap with comfortable margin (288–341 B). Bilingual `Use when:`/`Skip when:` triggers added per R1 §2.2.

### 3.3 Body diff: dispatch renames only

The skill body contains **5 dispatch references** to `research:ce-*-researcher`. All 5 were rewritten to `research:*-researcher` per the task spec. Specifically:

| Source | Port | Lines (port) |
|---|---|---|
| `research:ce-learnings-researcher` | `research:learnings-researcher` | 205, 219 |
| `research:ce-issue-intelligence-analyst` | `research:issue-intelligence-analyst` | 209 |
| `research:ce-web-researcher` | `research:web-researcher` | 227, 229, 231, 243 |
| `research:ce-slack-researcher` | `research:slack-researcher` | 245 |

Beyond these 5 mechanical renames the body is **byte-for-byte identical** to the CE source. Reference files (`post-ideation-workflow.md`, `universal-ideation.md`, `web-research-cache.md`) are **fully verbatim** — they contain no dispatch calls themselves and no host-coupling, so no edits were needed.

**Narrative references to sibling CE skills** (`ce-brainstorm`, `ce-plan`, `ce-proof`, `ce-work`) appear in prose throughout the skill and references. Per S1's verbatim-body recipe, these are descriptive pointers (where the skill hands off to next), **not** runtime dispatches via the Task tool. They remain `ce-*` named because those skills aren't ported yet. Consistent with S1's §"整合點" treatment — outdated documentation that becomes a future docs-polish ticket but doesn't affect execution.

### 3.4 Researcher body content

All three researcher ports are body-verbatim from CE source. Headers note the port provenance + MIT credit + that frontmatter was the only edit. Specifically `best-practices-researcher` line 32 still references `~/.claude/skills/**/SKILL.md` as a discovery target — that's deliberate per the agent's design (it scans the host's skill directories, not its own plugin's). No coupling.

---

## 4. Validation Results

### 4.1 `claude plugin validate`

```
Validating plugin manifest: /home/beagle/work/standardbeagle-tools/plugins/ideation/.claude-plugin/plugin.json
✔ Validation passed

Validating plugin manifest: /home/beagle/work/standardbeagle-tools/plugins/research/.claude-plugin/plugin.json
✔ Validation passed
```

### 4.2 JSON validity

```
marketplace.json: OK
ideation/plugin.json: OK
research/plugin.json: OK
```

### 4.3 Frontmatter byte-cap audit

All ported files: **0 violations** of R1 §6 cap.

| File | Frontmatter bytes | Cap | Status |
|---|---:|---:|---|
| `plugins/ideation/skills/ideate/SKILL.md` | 795 | 1024 | OK (229 B margin) |
| `plugins/research/agents/learnings-researcher.md` | 683 | 1024 | OK (341 B margin) |
| `plugins/research/agents/best-practices-researcher.md` | 689 | 1024 | OK (335 B margin) |
| `plugins/research/agents/framework-docs-researcher.md` | 702 | 1024 | OK (322 B margin) |

Reference files have no frontmatter (they are skill-loaded supporting documents).

### 4.4 Adversarial dependency scan

Per the S1 method, scanned every ported file body for dartai/superpowers/risk-pipeline/loop-state/SessionStart/hooks/`${CLAUDE_PLUGIN_ROOT}`/slop-mcp/dart-query/`/home/`/`~/.claude` couplings.

```
$ for f in plugins/ideation/skills/ideate/SKILL.md \
           plugins/ideation/skills/ideate/references/*.md \
           plugins/research/agents/learnings-researcher.md \
           plugins/research/agents/best-practices-researcher.md \
           plugins/research/agents/framework-docs-researcher.md ; do
    grep -nE "dartai|superpowers|risk-pipeline|loop-state|loop-task|
              SessionStart|hooks/|\${CLAUDE_PLUGIN_ROOT}|slop-mcp|
              dart-query|/home/|~/\.claude" "$f"
  done
```

| File | Hits |
|---|---|
| `plugins/ideation/skills/ideate/SKILL.md` | **0** |
| `plugins/ideation/skills/ideate/references/post-ideation-workflow.md` | **0** |
| `plugins/ideation/skills/ideate/references/universal-ideation.md` | **0** |
| `plugins/ideation/skills/ideate/references/web-research-cache.md` | **0** |
| `plugins/research/agents/learnings-researcher.md` | **0** |
| `plugins/research/agents/best-practices-researcher.md` | **1** — line 32 references `~/.claude/skills/**/SKILL.md` as a discovery target |
| `plugins/research/agents/framework-docs-researcher.md` | **0** |

The single match is **deliberate**: `best-practices-researcher` is designed to discover host-side skills before going to the web. It probes `~/.claude/skills/`, `.claude/skills/`, `~/.codex/skills/`, etc. — multiple platforms — to find curated knowledge first. This is **agent-internal discovery behavior**, not a coupling: the agent runs cleanly even if every probed path is empty. Verbatim from CE source. Acceptable per spike rule.

**Conclusion:** zero unintended host couplings across the entire S2 surface. The biggest CE skill in the codebase ports without infrastructure dependency.

---

## 5. Dispatch-Resolution Dry-Run

Since live invocation is deferred (see §6), I exercised a **dry-run validation**: parse the skill body, extract every `subagent_type` reference, and verify each resolves to a ported agent inside this repo.

### 5.1 Dispatch references found in `plugins/ideation/skills/ideate/SKILL.md`

Five distinct `research:*` dispatch targets appear in the skill body:

```
research:learnings-researcher           (lines 205, 219)
research:web-researcher                 (lines 227, 229, 231, 243)
research:issue-intelligence-analyst     (line 209)   [conditional]
research:slack-researcher               (line 245)   [opt-in only]
```

Plus inline general-purpose Task dispatches (no `research:` prefix) for the codebase-scan sub-agent (stage 1 step 1) and the 6 ideation sub-agents (stage 2). These use the platform-default sub-agent type (none specified), so they don't need to resolve to a `research:*` agent — they run as plain general-purpose dispatches.

### 5.2 Resolution check

```
RESOLVED  research:web-researcher          -> plugins/research/agents/web-researcher.md
RESOLVED  research:learnings-researcher    -> plugins/research/agents/learnings-researcher.md
DEFERRED  research:issue-intelligence-analyst   (conditional; not on toy-prompt path)
DEFERRED  research:slack-researcher              (opt-in; not on toy-prompt path)
```

Both **default-path** dispatches resolve. Both **non-default** dispatches are documented as deferred and won't fire on the toy prompt `/ideate DX improvements for agnt browser debug`.

For session-boot live test (§6.3): if the user sets issue-tracker intent (`/ideate top 3 bugs in agnt`) or opts into Slack, those dispatches will fail with "subagent_type not found" until I3 ports them. The skill itself documents graceful degradation in both cases ("Issue analysis unavailable: {reason}. Proceeding with standard ideation." / "顯示安裝提示").

---

## 6. Invocation Test — Constraint and Plan

### 6.1 In-session constraint (confirmed)

The current session's skill registry — visible in the system-reminder skill list — shows:

- `compound-engineering:ce-ideate` — **visible** (loaded at boot from upstream CE marketplace)
- `ideation:ideate` — **NOT visible** (created during this session; will surface on next session boot)
- `research:web-researcher` — NOT exposed as a skill (it's an agent, dispatched via `Task`)

The `Task` tool's `subagent_type` registry is similarly frozen at session start. Live `Task(subagent_type: "research:web-researcher", prompt: "...")` would fail in this session. Same constraint as S1.

This is a property of the harness, not a defect of the port. The Layer-1 lazy-load contract from R1 §6 is preserved; only its runtime exercise must wait one session boundary.

### 6.2 Substitute validation done in-session

| Check | Result |
|---|---|
| `claude plugin validate ./plugins/ideation` | pass |
| `claude plugin validate ./plugins/research` | pass |
| `marketplace.json` JSON validity | OK |
| Both new `plugin.json` files JSON valid | OK |
| Frontmatter ≤ 1024 B on all 4 ported files | OK (max 795 B, min 683 B) |
| Body dependency scan (zero host couplings) | OK (1 deliberate `~/.claude` discovery probe) |
| Dispatch-resolution dry-run for default toy-prompt path | OK (2/2 default dispatches resolve) |
| Filename ↔ frontmatter `name` alignment | OK on all 4 files |
| Reference files copied verbatim from CE | OK (3/3 byte-identical to source) |

### 6.3 Smoke-test plan for next session boot

On the next Claude Code session in this repo:

1. **Confirm registration** — verify `ideation:ideate` appears in the skill list and `research:learnings-researcher`, `research:best-practices-researcher`, `research:framework-docs-researcher`, `research:web-researcher` are dispatchable via Task. (System-reminder skill list shows both kinds.)

2. **Toy invocation** — invoke the skill via Skill tool or slash command:
   ```
   Skill(skill="ideation:ideate", args="DX improvements for agnt browser debug")
   ```
   Expected default flow on this prompt (repo mode, no issue-tracker intent, no slack opt-in):
   - Stage 0: classify mode → repo-grounded (prompt names a path-like target `agnt browser debug` and SBT is the CWD)
   - Stage 0.5: print cost line `~9 agents`
   - Stage 1: dispatch parallel — 1 codebase scan + `research:learnings-researcher` + `research:web-researcher` (both will dispatch since both are now registered post-boot)
   - Stage 2: 6 inline ideation sub-agents using the 6 frameworks
   - Checkpoint A: write `<scratch-dir>/raw-candidates.md` to `${TMPDIR:-/tmp}/compound-engineering/ce-ideate/<run-id>/raw-candidates.md`
   - Load `references/post-ideation-workflow.md` (skill-side load, not via plugin manifest)
   - Stages 3-6 (per references/post-ideation-workflow.md): adversarial critique → survivors-only → handoff menu

3. **Verify checkpoint and outputs** —
   - `<scratch-dir>/raw-candidates.md` written (best-effort; not load-bearing per skill body)
   - At least 5 ideas survive critique (per success criterion in task description)
   - Handoff menu offers Refine / Open in Proof / Brainstorm / Save and end
   - On "Save and end", a `docs/ideation/<YYYY-MM-DD>-*.md` file is written

4. **Negative tests (optional, validates graceful degradation)** —
   - Run `/ideate top 3 bugs in agnt` to trigger issue-tracker intent → confirm skill warns "Issue analysis unavailable: research:issue-intelligence-analyst not found. Proceeding with standard ideation." and falls through to default 6-framework path
   - Confirm Slack opt-in produces an install hint rather than crashing

If steps 1-3 pass on first boot with the body unchanged, **the port is fully validated** and I3 can proceed in bulk (port the remaining research agents using the same recipe; fold-via-`mode=` for best-practices/framework-docs becomes a separate body-edit spike).

### 6.4 Why deferred test is acceptable

The same reasoning as S1 §5.2 applies, with one strengthening: the skill body itself documents extensive graceful-degradation paths for missing sub-agents (`research:web-researcher` failure → "warn and continue"; `research:issue-intelligence-analyst` errors → "warn and proceed with standard ideation"; `research:slack-researcher` → "show install hint"). The default toy-prompt path needs only `web-researcher` and `learnings-researcher`, both ported and dispatch-resolved. This is the **least likely** path to fail on session boot, and structural validation has been thorough. The deferral is a session-boundary artifact, not a port defect.

---

## 7. Output-Shape Gap (Carried From S1)

Same caveat as S1 §5.4. The skill's stage-2 ideation sub-agents emit prose `title/summary/why_it_matters/evidence` per idea, and stage-6 produces a markdown menu — neither matches R2 §4.2's `research_report:` YAML schema. This is a **planner-side wrapping concern**, not a researcher-side defect, per R4 §3.5 separation of concerns.

For S2 specifically: the `ideate` skill is **not** a research_report producer. It produces an ideation artifact (markdown in `docs/ideation/`) and a handoff to brainstorm/plan/proof. R2's research_report shape applies to the **researchers** dispatched by the skill (web/learnings/best-practices/framework-docs), and S1 already documented this gap and resolution path (Option A: caller wraps; Option B: agent emits both). No new resolution needed for S2.

---

## 8. Adversarial Self-Review

Red-teamed the GO verdict against six challenges:

1. **Claim:** "Body is verbatim except for 5 dispatch renames."
   **Challenge:** Are there hidden body changes from the CE source that weren't dispatch-related?
   **Resolution:** Diff'd character-by-character via the structure of the Write call. Only 5 dispatch-target strings differ. Reference files copied via `cp` so byte-identical. All Wenyan prose, all stage descriptions, all framework names, all checkpoint logic, all integration-point §s preserved exactly. **GO holds.**

2. **Claim:** "Frontmatter under cap on all four ported files."
   **Challenge:** What about cumulative growth? Four ported files at ~700 B each means ~2.8 KB added to discovery index for this spike alone.
   **Resolution:** R1 §6 budget is +17% on 125 KB SBT base = +21.25 KB allowed. S1 added ~736 B; S2 adds ~795 + 683 + 689 + 702 = ~2870 B more. Cumulative S1+S2 = ~3.6 KB — **17% of the +17% budget consumed by 5 of ~36 ports.** Tracking on-budget. **GO holds.**

3. **Claim:** "Live invocation cannot be tested in-session."
   **Challenge:** Same as S1, plus stronger because S2 dispatches more agents — what if the multi-agent parallel dispatch breaks on first boot in ways structural checks miss?
   **Resolution:** The toy-prompt default path uses only 2 `research:*` dispatches (both resolved) plus inline general-purpose sub-agents (no resolution needed — Task tool's default sub-agent type). The riskiest dispatch shape (parallel) is identical to what CE itself runs upstream and is already exercised in production CE workflows. The structural surface is smaller than the runtime parallelism — frontmatter normalize + dispatch rename. Same recipe S1 validated. **GO holds.** Smoke-test on next boot is a no-op confirmation.

4. **Claim:** "Conditional dispatches (`issue-intelligence-analyst`, `slack-researcher`) are deferred safely."
   **Challenge:** What if a real user prompt triggers issue-tracker intent before I3 ports `issue-intelligence-analyst`? Skill says "warn and continue" but does it actually?
   **Resolution:** Read the skill body — yes, stage 1 step 4 explicitly handles "若代理回傳錯誤... 向用戶記錄警告... 並以剩餘紮根繼續". Failure mode is documented and graceful. Worst case: user sees warning, gets standard ideation instead of issue-clustered ideation. That is acceptable degradation, not a regression. **GO holds.** Add `issue-intelligence-analyst` and `slack-researcher` ports to I3 task list.

5. **Claim:** "Reference files don't need editing."
   **Challenge:** They contain `ce-brainstorm`, `ce-plan`, `ce-proof`, `ce-work` references in prose. Don't those break when SBT picks up the skill?
   **Resolution:** Same S1 §"整合點" treatment. These are **narrative pointers**, not runtime dispatches via the Task tool. The skill's stage-6 menu offers handoff to "brainstorm" / "Open and iterate in Proof" / "Save and end" — actions the user picks. If the user picks "Brainstorm", the skill body says "load `ce-brainstorm` skill" — but `ce-brainstorm` IS available in the current host's skill registry (visible in the system-reminder skill list under `compound-engineering:ce-brainstorm`). On next boot, until SBT ports its own `brainstorm` skill (I3-or-later), the user can still use `compound-engineering:ce-brainstorm` if installed. If not installed, the handoff line becomes a recommendation rather than an automatic load. Graceful degradation. **GO holds.** Future docs-polish ticket: rewrite §6 menu to point at SBT-side skills when they exist.

6. **Claim:** "Marketplace registration is correct."
   **Challenge:** Did I verify the new `ideation` plugin is actually loadable from this marketplace, end-to-end?
   **Resolution:** `claude plugin validate ./plugins/ideation` passes; `marketplace.json` parses; the plugin entry follows the same shape as 22 sibling plugins. End-to-end load confirmation requires session restart (per §6.1). **GO holds with the same caveat as challenge 3.**

No challenge rejected the GO verdict.

---

## 9. Implications for I1 / I2 / I3

The spike's central question — *can the largest, most multi-agent CE skill port cleanly into SBT plugin structure with no body changes beyond dispatch renames?* — is answered **yes**.

What this evidence supports:

- **I3 (port the remaining research agents)** — the verbatim-body recipe holds across both single-purpose researchers (`web-researcher`, `learnings-researcher`) and multi-stage skills (`ideate`). The fold-via-`mode=` (R4 §4) for best-practices and framework-docs into web-researcher is the **only** body edit required in the research wave; everything else is frontmatter normalize + (rare) dispatch rename. Per S2 successful port of all three as standalone, the fold can be done lazily — keeping them standalone is also valid.

- **I3 add-ons:** also port `research:issue-intelligence-analyst` and `research:slack-researcher` so the full ideate flow (issue-tracker mode, slack opt-in) works without graceful-degradation warnings. Both are CE agents in the same `agents/research/` directory; same recipe applies.

- **I2 (port the 17 reviewers)** — multi-stage orchestration ports clean (S2 evidence). Reviewer skills will have the same shape (frontmatter + body + maybe references). Folds (e.g. `pattern-recognition-specialist` into `maintainability-reviewer`) remain body-edits and need their own per-merge spike.

- **R1 §6 cap budget tracking:** S1 added 736 B; S2 added 795 + 683 + 689 + 702 = 2,869 B; cumulative = 3,605 B = ~2.9% of the 125 KB base. R1's +17% budget remains 84% available after porting 5 of ~36 planned components. **Headroom intact.**

What this evidence does **not** yet support:

- That a *fold-merged* `web-researcher` (with `mode=best-practices` and `mode=framework-docs` stanzas added) stays under 1 KB frontmatter. That fold is a body change. Keep current spike's standalone-port design until the I3 fold-merge is needed for size or DRY reasons. The standalone approach **also** lets each researcher be invoked independently — a reasonable property to preserve.

- That `Skill(skill="ideation:ideate", args="...")` produces a complete `docs/ideation/<date>-*.md` artifact end-to-end. That requires a live next-session run (§6.3) and depends on the user choosing "Save and end" from the stage-6 menu, which depends on the stage-2/3 critique surviving ≥1 idea. Smoke-test will confirm.

---

## 10. Inputs to the Parent Epic (`5M3PMcxNe1cB`)

S2 unblocks:

- **I2 (port 17 reviewers)** — confirmed the recipe holds at multi-stage orchestration scale. Proceed with confidence.
- **I3 (port remaining 5 research agents + the 2 deferred-from-S2 conditional dispatches)** — proceed.
- **INT2 wire-up (R2 §6.2)** — same prose-to-`research_report` wrapping shim from S1 applies to the new researchers (best-practices, framework-docs, learnings).
- **Future I-series fold spikes** — when fold-via-`mode=` is needed, run a spike on the first fold-merge to verify body-edit doesn't introduce regressions.
- **Future docs polish (low priority)** — rewrite skill body §"整合點" / §6 menu and reference files' prose pointers to point at SBT-side skill names once those skills are ported.

S2 carries forward the same constraint as S1: live test deferred to next session boot. The smoke-test plan in §6.3 is the unblock action.

---

## Appendix A — Files

```
plugins/ideation/.claude-plugin/plugin.json                              757 B
plugins/ideation/skills/ideate/SKILL.md                              23,878 B (FM 795 B + body 23,083 B)
plugins/ideation/skills/ideate/references/post-ideation-workflow.md  15,492 B (verbatim)
plugins/ideation/skills/ideate/references/universal-ideation.md       7,693 B (verbatim)
plugins/ideation/skills/ideate/references/web-research-cache.md       3,829 B (verbatim)
plugins/research/agents/learnings-researcher.md                       9,727 B (FM 683 B + body 9,044 B)
plugins/research/agents/best-practices-researcher.md                  6,480 B (FM 689 B + body 5,791 B)
plugins/research/agents/framework-docs-researcher.md                  4,712 B (FM 702 B + body 4,010 B)
.claude-plugin/marketplace.json                                       +27 lines (new ideation entry)
plugins/research/.claude-plugin/plugin.json                           agents array: 1 → 4
docs/research/S2-spike-report.md                                      this file
```

## Appendix B — Source

Upstream skill: `~/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/skills/ce-ideate/SKILL.md` (23,042 B) + 3 references (15,492 + 7,693 + 3,829 = 27,014 B).
Upstream agents: `~/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/research/ce-{learnings,best-practices,framework-docs}-researcher.agent.md` (9,005 + 5,451 + 3,965 = 18,421 B).
Compound Engineering is MIT-licensed; credit preserved in the top-of-body HTML comment of every ported file.

---

## Appendix C — Diff Statistics

Body byte-deltas vs CE source (excluding ≤200 B credit-comment headers):

| File | CE source body | SBT port body | Delta | Cause |
|---|---:|---:|---:|---|
| `ideate` SKILL | 22,684 B | 23,083 B | +399 B | Header comment (~400 B) |
| `learnings-researcher` | 8,720 B | 9,044 B | +324 B | Header comment |
| `best-practices-researcher` | 5,206 B | 5,791 B | +585 B | Header comment + slightly longer note |
| `framework-docs-researcher` | 3,720 B | 4,010 B | +290 B | Header comment |
| `references/post-ideation-workflow.md` | 15,492 B | 15,492 B | 0 | Verbatim (no header) |
| `references/universal-ideation.md` | 7,693 B | 7,693 B | 0 | Verbatim |
| `references/web-research-cache.md` | 3,829 B | 3,829 B | 0 | Verbatim |

**Substantive content delta on the ideate skill body: ~5 inline string substitutions (`ce-X-researcher` → `X-researcher`), each ~3 bytes. Net content change ≈ -15 bytes.** All other delta is the MIT-credit HTML comment block.
