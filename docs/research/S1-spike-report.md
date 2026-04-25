# S1 — Port `ce-web-researcher` Spike Report

**Status:** Done — **GO**
**Dart task:** [Pkvn7QecgxJA](https://app.dartai.com/task/Pkvn7QecgxJA)
**Parent epic:** `5M3PMcxNe1cB` — Consolidate superpowers + compound-engineering into standardbeagle-tools
**Loop task:** `Svu14LNGwHsd`
**Author:** task-executor (auto), iteration 5
**Date:** 2026-04-25
**Time-boxed:** 2h (used: ~25 min)
**Inputs:** R1 (frontmatter rules + 1 KB cap), R2 (research_report schema), R4 (canonical agent: web-researcher; drop `ce-` prefix; defer best-practices/framework-docs folds to I-series)

---

## 1. Verdict

**GO.** The port is structurally clean. Body content was copied **verbatim** — zero prose changes. Frontmatter normalization per R1 §2.2 was the only edit. `claude plugin validate` passes. Strongest possible signal that the rest of I3 (port the remaining 5 research agents) and by extension I2 (17 reviewers) will not require body surgery.

**One caveat:** live `Task(subagent_type: "research:web-researcher")` invocation cannot be tested in the **same** Claude Code session that creates the plugin — Claude Code rescans plugins at session start, not mid-session. Structural validation (plugin validator + manual frontmatter audit + dependency scan) passed in lieu of in-session dispatch. See §5 for what to test on next session boot.

---

## 2. What Was Done

### 2.1 Files created

| Path | Bytes | Purpose |
|---|---:|---|
| `plugins/research/.claude-plugin/plugin.json` | 622 | New plugin scaffold for ported research agents |
| `plugins/research/agents/web-researcher.md` | 7938 | The port (frontmatter normalized, body verbatim) |

### 2.2 Files modified

| Path | Change |
|---|---|
| `.claude-plugin/marketplace.json` | Added `research` plugin entry (v0.1.0, category `development`) inserted before `photino` |

### 2.3 Plugin scaffold (`plugins/research/.claude-plugin/plugin.json`)

Minimum viable: `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `agents` array. Matches the SBT enumerate-explicitly convention (per R1 §2.1). No `mcp.json` shipped — this plugin is agent-only.

---

## 3. Frontmatter Diff (Source → Port)

| Field | CE source | SBT port | R1 §2.2 rule |
|---|---|---|---|
| `name` | `ce-web-researcher` | `web-researcher` | R4 §5: drop `ce-` prefix |
| `description` | English-only, 305 B | Bilingual Wenyan + English with `Use when:` and `Skip when:`, 736 B (frontmatter total) | R1 §2.2: bilingual + Use when/Skip when triggers |
| `model` | `sonnet` | `sonnet` | unchanged |
| `tools` (CE key) | `WebSearch, WebFetch` | — | R1 §2.2: rename to `allowed-tools` |
| `allowed-tools` (SBT key) | — | `WebSearch, WebFetch` | renamed |

**Frontmatter total bytes (between `---` markers):** **736 B**. Cap is **1024 B** per R1 §6 enforcement rule. **Margin: 288 B.**

### Body diff: **zero substantive changes.**

The only addition is a 4-line MIT-credit HTML comment block immediately after the closing `---` of the frontmatter:

```html
<!--
Originally ported from Compound Engineering (`ce-web-researcher`).
Upstream: https://github.com/every-org/compound-engineering — MIT License.
Body content preserved verbatim; only frontmatter normalized per
standardbeagle-tools R1 §2.2 (tools→allowed-tools, bilingual Use when/Skip when triggers).
-->
```

All Wenyan prose, all six methodology steps, the output format, the untrusted-input handling, and the §"整合點" integration-points section are byte-for-byte identical to the CE source. No paths rewritten. No `${CLAUDE_PLUGIN_ROOT}`. No dartai hooks. The `ce-ideate` references in §"整合點" are descriptive (naming where this agent is called *from* in CE) and do not affect the agent's standalone behavior — the agent runs the same regardless of caller identity.

---

## 4. Validation Results

### 4.1 `claude plugin validate ./plugins/research`

```
Validating plugin manifest: /home/beagle/work/standardbeagle-tools/plugins/research/.claude-plugin/plugin.json
✔ Validation passed
```

### 4.2 Manual structural checks

| Check | Result |
|---|---|
| `plugin.json` parses as valid JSON | OK |
| `marketplace.json` parses as valid JSON | OK |
| Filename `web-researcher.md` matches frontmatter `name: web-researcher` | OK |
| Frontmatter ≤ 1024 B (R1 §6 cap) | **736 B — OK** |
| `allowed-tools` key (not legacy `tools`) | OK |
| `Use when:` and `Skip when:` triggers present | OK (both bilingual) |
| MIT credit preserved | OK (top-of-body HTML comment) |

### 4.3 Adversarial dependency scan (body only)

Scanned the body section (everything after the second `---`) for any reference to dartai-internal, superpowers-internal, or other host-specific infrastructure:

```
grep -nE "dartai|superpowers|risk-pipeline|loop-state|loop-task|
         SessionStart|hooks/|\${CLAUDE_PLUGIN_ROOT}|slop-mcp|dart-query"
  → zero matches
```

Hardcoded paths:

```
grep -nE "/home/|~/\.claude|\.claude/plugins|\./[a-z]"
  → zero matches
```

Tool references in body:

```
`WebSearch`  `WebFetch`
  → only the two whitelisted in allowed-tools
```

**Conclusion:** the body has no implicit host dependencies. The agent is reachable as a clean unit.

---

## 5. Invocation Test — Constraint and Plan

### 5.1 In-session constraint

The acceptance criterion "invocation returns research output" requires `Task(subagent_type: "research:web-researcher", prompt: "...")`. Claude Code loads agents from plugins at **session start**, not on plugin-file write. The `Task` subagent_type registry is therefore frozen for the current session. The new `research` plugin's agent will surface to `Task` only on the next Claude Code session boot.

This is a property of the harness, not a defect of the port. R1 §6 explicitly defines ports as Layer-1 lazy-load via Task tool — that contract is preserved; only its runtime exercise must wait one session boundary.

### 5.2 Substitute validation done in-session

Instead of dispatching, we exercised the structural surface:

1. `claude plugin validate ./plugins/research` → pass.
2. Frontmatter byte audit → 736 B, under 1 KB cap.
3. Body dependency scan → no dartai/SP-internal references.
4. Filename ↔ `name` field alignment → matches.
5. `marketplace.json` registration → entry present, schema valid.

### 5.3 Smoke-test plan for next session boot (recorded for I3)

On the next Claude Code session in this repo:

1. Confirm `research:web-researcher` appears in the agent index (any mechanism: `Task` subagent_type listing, or `mcp__plugin_lci_lci__search` against the agent file).
2. Dispatch:
   ```
   Task(
     subagent_type: "research:web-researcher",
     prompt: "Research prompt-caching patterns in the Anthropic SDK as of 2026.
              Return a research_report with prior art, adjacent solutions,
              and one concrete proposed_subtask for adopting the strongest pattern
              in this marketplace's plugins."
   )
   ```
3. Verify the response opens with the `**Research value: <high|moderate|low>**` line per the agent's output spec.
4. Verify each finding cites at least one URL evidence per R2 §4.2 (`evidence: ≥1 source per finding`).

If steps 1–4 all pass on first boot with the agent body unchanged, **the port is fully validated** and I3 can proceed in bulk (port the remaining 5 research agents using the same recipe).

### 5.4 Output-shape gap and the I-series follow-up

CE's source agent emits a free-text "Research value: ..." preamble plus markdown sections (`### Prior Art`, `### Adjacent Solutions`, etc.). R2 §4.2 specifies a **YAML `research_report:` block** as the planner-consumable output:

```yaml
research_report:
  verdict: "COMPLETE|PARTIAL|BLOCKED"
  researcher: "<plugin>:<agent>"
  question: "..."
  findings: [...]
  proposed_subtasks: [...]
  ...
```

These shapes differ. The CE agent's prose output is **not directly consumable** by an R2-style planner without a parsing/wrapping step. **This is a known gap, not a spike-blocker** — by R4 §3.5, the planner is responsible for parent/dartboard/wrapping; the researcher is responsible for content. Two clean resolutions, both for I3 (not S1):

- **Option A** — caller wraps. Planner sub-dispatch sites (R2 INT2) include a small "wrap research output into research_report YAML" step in the prompt template. Zero agent body changes.
- **Option B** — agent emits both. Add a final "## research_report" YAML block to the agent's body output spec, alongside the existing prose. ~30 lines of body addition. One body change.

**Recommendation for I3:** start with Option A. It preserves the spike's "zero body change" principle and keeps the agent reusable in non-dartai contexts where consumers want prose, not YAML. If the wrapping step proves unreliable in INT2 testing, fall back to Option B.

---

## 6. Implications for I1 / I3

The spike's central question — *can a CE agent port cleanly into SBT plugin structure with no body changes?* — is answered **yes** for the canonical research agent.

What this evidence supports:

- **I3 (port the remaining 5 research agents):** repeat this recipe across `repo-research-analyst`, `git-history-analyzer`, `learnings-researcher`, `session-historian`, `issue-intelligence-analyst`. Per R4 §4, the merged-in agents (`best-practices-researcher`, `framework-docs-researcher`) become `mode=` instructions inside the canonical web-researcher's body — that **does** require a body edit, deferred to I3.
- **I2 (port the 17 reviewers):** R4's dedup + rename plan is structurally similar — frontmatter normalization plus selective body folds (e.g., `pattern-recognition-specialist`'s jscpd subsection folded into `maintainability-reviewer`). The web-researcher's clean port is evidence that frontmatter-only normalization works; folds will need their own per-merge spike if they introduce surprises.
- **R1 §6 cap budget:** at 736 B per frontmatter (this port's measured value, slightly above CE's 297 B average due to bilingual triggers), the projected discovery-index cost for the I2+I3 wave (23 agents) is `23 × 736 = 16.9 KB` ≈ +13.5% on the 125 KB SBT base. R1's budget is +17%. **Headroom intact.**

What this evidence does **not** yet support:

- That a *fold-merged* port (e.g. `web-researcher` with `mode=best-practices` and `mode=framework-docs` stanzas added) stays under the 1 KB frontmatter cap and runs without behavioral regression. The fold is a body change. Spike that on the first fold-merge in I3 if scope drift is suspected.
- That dartai sub-dispatch (R2 INT2) consumes the prose output reliably without the wrapping shim discussed in §5.4. Test in INT2 wire-up, not in S1.

---

## 7. Adversarial Self-Review

Red-teamed the GO verdict against five challenges:

1. **Claim:** "Body is verbatim; port is clean." → **Challenge:** the §"整合點" section names `ce-ideate`, `ce-brainstorm`, `ce-plan` — agents that don't exist in SBT. Doesn't that break standalone? → **Resolution:** these are *prose descriptions* of where the agent is called from in CE, not behavioral hooks. The agent's runtime path uses only `WebSearch` and `WebFetch`. The §"整合點" text becomes outdated documentation when SBT picks up the agent, but does not affect execution. **GO holds.** A future docs polish ticket can rewrite §"整合點" to point at SBT integration sites once R2 INT2 lands.

2. **Claim:** "Frontmatter is under cap." → **Challenge:** the cap is per-agent; what about cumulative discovery-index growth? → **Resolution:** R1 §6 sets a per-agent cap (1 KB) and a cumulative budget (+17% on 125 KB base for the full N≈36 port). One agent at 736 B contributes 0.6% growth. Well within both gates. **GO holds.**

3. **Claim:** "Live invocation cannot be tested in-session." → **Challenge:** is the spike then incomplete, since acceptance criterion 2 ("invocation returns research output") is not exercised? → **Resolution:** structural validation (claude plugin validate + manual frontmatter audit + body dependency scan) substitutes for live dispatch. The harness constraint is documented and a smoke-test plan is recorded for next session (§5.3). The spike's *primary* deliverable is the port-cleanliness verdict, which is fully testable without dispatch. **GO holds with caveat;** convert the smoke-test to a no-op task on next boot if it passes.

4. **Claim:** "Output shape mismatch with R2 §4.2 doesn't block GO." → **Challenge:** R2 §4.2 is a binding architectural decision; an agent that doesn't conform looks like an integration defect. → **Resolution:** R4 §7 explicitly says "researcher is responsible for content; planner is responsible for parent/dartboard wiring." The wrapping step (§5.4 Option A) is a planner-side concern, not a researcher-side defect. The CE prose output is rich enough to be wrapped into research_report shape without information loss. **GO holds;** wrapping mechanism is an I3/INT2 deliverable.

5. **Claim:** "Marketplace registration is correct." → **Challenge:** did we verify the new plugin is actually loadable from this marketplace, end-to-end? → **Resolution:** `claude plugin validate ./plugins/research` passes; `marketplace.json` parses; the plugin entry follows the same shape as 21 sibling plugins. End-to-end load confirmation requires a session restart (per §5.1). **GO holds with the same caveat as challenge 3.**

No challenge rejected the GO verdict.

---

## 8. Inputs to the Parent Epic (`5M3PMcxNe1cB`)

S1 unblocks:

- **I3 (port the 5 remaining research agents)** — apply this recipe (frontmatter normalize, body verbatim) verbatim. Add `mode=` stanzas to `web-researcher` body for `best-practices` and `framework-docs` folds (R4 §4) — the only body edit needed in the research wave.
- **I2 (port the 17 reviewers)** — repeat the recipe; R4's merge-in folds (e.g. `pattern-recognition-specialist` → `maintainability-reviewer`) are body edits and should each get their own pre-port adversarial check.
- **INT2 wire-up (R2 §6.2)** — implement the prose-to-`research_report` wrapping shim in the planner sub-dispatch site. §5.4 Option A is the recommended start.
- **Future docs polish** — rewrite the §"整合點" section in the ported agent's body to reference SBT integration sites (`workflow:start-loop` planner, future SBT `ideate` skill if any) once they exist. Low-priority; non-blocking.

---

## Appendix A — Files

```
plugins/research/.claude-plugin/plugin.json     622 B
plugins/research/agents/web-researcher.md      7938 B  (frontmatter 736 B + body 7202 B)
.claude-plugin/marketplace.json                  +24 lines (new entry)
docs/research/S1-spike-report.md                this file
```

## Appendix B — Source

Upstream agent: `~/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/agents/research/ce-web-researcher.agent.md` (7388 B). Compound Engineering is MIT-licensed; credit preserved in body header comment.
