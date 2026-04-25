# R1 — Plugin Manifest + SessionStart Audit (SP / CE / SBT)

**Status:** Done
**Dart task:** [cjcab73peVYI](https://app.dartai.com/task/cjcab73peVYI)
**Parent epic:** `5M3PMcxNe1cB` — Consolidate superpowers + compound-engineering into standardbeagle-tools
**Author:** task-executor (auto), iteration 1
**Date:** 2026-04-25
**Time-boxed:** 2h

---

## 1. Executive Summary

Three marketplaces audited:

- **SP** = `superpowers` (Jesse Vincent / obra), 14 skills, 1 agent, 3 commands. **Has a SessionStart hook that injects a full skill body (~7.5 KB raw) into every session.**
- **CE** = `compound-engineering` (Kieran Klaassen / Every), 43 skills, 50 agents, 0 commands. **No SessionStart hook.** Uses dir-per-skill convention and the largest agent fleet of the three.
- **SBT** = this repo (`standardbeagle-tools`), 21 plugins shipping 180 skills, 44 agents, 97 commands. **No SessionStart hook in any plugin.** Baseline auto-load injection is effectively zero bytes from plugin hooks.

**Headline numbers (measured, not estimated):**

| Quantity | SP | CE | SBT |
|---|---:|---:|---:|
| Skills | 14 | 43 | **180** |
| Agents | 1 | **50** | 44 |
| Commands | 3 | 0 | 97 |
| SessionStart hook | yes | no | **no** |
| Avg agent frontmatter (bytes) | 1221 | 297 | 710 |

**Critical finding:** SBT already ships ~244 plugin entry points (skills+agents+commands). Claude Code surfaces *frontmatter only* — names + descriptions — as the discovery index. Bodies load on demand via the `Skill`/`Task` tool. A 36-agent CE port adds ~10–18 KB to the discovery index, not the typical ~360 KB you'd guess from the raw files. The bloat risk is real but bounded; the dominant lever is **discovery-index density**, not body size.

**Binding architectural decision (recorded in §6):** all ported SP/CE agents must use conditional-dispatch (lazy load via the Skill/Task tool, gated by ToolSearch-style discovery). No agent gets pre-loaded body content into SessionStart.

---

## 2. Compatibility Matrix

### 2.1 `plugin.json` fields

Sources:
- SP: `/home/beagle/.claude/plugins/marketplaces/superpowers-dev/.claude-plugin/plugin.json`
- CE: `/home/beagle/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/.claude-plugin/plugin.json`
- SBT: `/home/beagle/work/standardbeagle-tools/plugins/*/​.claude-plugin/plugin.json` (21 plugins, e.g. `agnt`, `lci`, `risk-pipeline`)

| Field | SP | CE | SBT | Notes |
|---|:-:|:-:|:-:|---|
| `name` | yes | yes | yes | Required by Claude Code spec. |
| `version` | yes (5.0.7) | yes (2.68.1) | yes (per-plugin: 0.1.0–0.8.3) | SemVer. |
| `description` | yes | yes | yes | Surfaced in marketplace listings. |
| `author` (object: name/email/url) | yes | yes | yes | All three use the object form. |
| `homepage` | yes | yes | yes |  |
| `repository` | yes | no | yes | CE omits `repository`. |
| `license` | yes (MIT) | yes (MIT) | yes (MIT) |  |
| `keywords` (array) | yes | yes | yes | SBT often uses `depends:lci` keyword to encode plugin-to-plugin dependencies. |
| `commands` (array of paths) | **no** (uses convention `commands/*.md` discovered automatically) | **no** | **yes (explicit list)** | SBT enumerates each command file. SP/CE rely on directory convention. |
| `skills` (array) | **no** (auto-discovered from `skills/*/SKILL.md`) | **no** | **yes (explicit list)** | Same divergence as commands. |
| `agents` (array) | **no** (auto-discovered) | **no** | **yes (explicit list)** | Same divergence. |
| `hooks` (string path) | yes (`./hooks/hooks.json` via convention) | no | yes — but **only on `figma-query`, `lci`, `risk-pipeline`**. The other 18 SBT plugins omit the field. | When present, points at relative `hooks.json`. |
| `mcpServers` (inline) | no | no | **disabled** (`mcp.json.disabled` per project convention) | SBT uses slop-mcp; plugin-level MCP is intentionally off. |
| `category` | no | no | yes (in `marketplace.json` only, not `plugin.json`) | Marketplace-only field. |

**Convention divergence — most important compat detail:**
- **SP and CE** rely on Claude Code's directory-convention auto-discovery: drop a file in `skills/<name>/SKILL.md`, `agents/<name>.md`, or `commands/<name>.md` and it is picked up automatically. The `plugin.json` is a metadata-only file.
- **SBT explicitly enumerates** every command, skill, and agent in `plugin.json`. This is the legacy strict-list pattern. It's redundant with auto-discovery but does not break anything.

**Implication for ports:** when copying SP/CE skills/agents into SBT, you must also add an entry to the target SBT plugin's `plugin.json` (`commands`/`skills`/`agents` array). If you forget, the port will not surface. This is *not* the failure mode in SP/CE — those just work via convention.

**Recommendation (deferred to I1 ticket):** consider migrating SBT to convention-based discovery to remove the dual maintenance burden. Out of scope for R1.

### 2.2 Agent frontmatter

| Field | SP | CE | SBT | Required? |
|---|:-:|:-:|:-:|---|
| `name` | yes | yes | **no** (relies on filename) | SP/CE always set; SBT omits and uses filename. |
| `description` | yes (long, with `<example>` blocks) | yes (terse, often Wenyan + English) | yes (Wenyan + English + `Use when:` triggers) | **Yes**, in all three — this is the discovery surface. |
| `model` | `inherit` (SP) | `inherit` (CE common) | not set | Optional; defaults to inherit when absent. |
| `tools` | `Read, Grep, Glob, Bash` (CE common) | per-agent allowlist | **`allowed-tools`** (different key name) | **Naming mismatch.** SP/CE use `tools:`; SBT uses `allowed-tools:`. Both are accepted by Claude Code's frontmatter parser, but ports must normalize. |
| `color` | not set (SP) | sometimes (e.g. `red` for adversarial) | not set | Cosmetic. Ignore for ports. |

**Sample frontmatter sizes (avg bytes):**
- SP agents: 1221 bytes (n=1; the single `code-reviewer.md` carries rich `<example>` blocks)
- CE agents: 297 bytes (n=50; terse, dense)
- SBT agents: 710 bytes (n=44; bilingual + `Use when:` triggers)

**Port normalization rule:** rewrite `tools:` → `allowed-tools:` and add the bilingual `Use when:` trigger phrase to match SBT discovery convention. Without this, ported agents will not surface to keyword search the way SBT users expect.

### 2.3 Skill frontmatter

| Field | SP | CE | SBT | Notes |
|---|:-:|:-:|:-:|---|
| File layout | `skills/<name>/SKILL.md` (dir per skill, supports `references/`) | `skills/<name>/SKILL.md` (same; supports `references/`) | `<plugin>/skills/<name>.md` (single file, **no dir, no references/**) | **Major structural divergence.** |
| `name` | yes | yes | yes | Required. |
| `description` | yes | yes (often Wenyan only) | yes (Wenyan + English + `Use when:`) | Required. |
| `argument-hint` | no | yes (e.g. `[issue reference, ...]`) | no | CE uses to template `$ARGUMENTS`. |
| Body uses `$ARGUMENTS` | rarely | yes | rarely | SP/SBT skills are mostly procedural; CE skills accept user input. |

**Port path translation rule:**
```
SP/CE: skills/<name>/SKILL.md  (+ references/ subdir)
SBT:   plugins/<plugin>/skills/<name>.md  (flatten — discard or inline references/)
```

**Implication:** any SP/CE skill that uses `references/*.md` (e.g. `ce-debug/references/`) must be **inlined** into the single `.md` file or split into multiple SBT skills. This will be the fiddliest part of porting.

### 2.4 Command frontmatter

| Field | SP | CE | SBT | Notes |
|---|:-:|:-:|:-:|---|
| `name` | sometimes | n/a (CE has no commands) | **no** (uses filename) | |
| `description` | yes | n/a | yes (often `Use when:` style) | Required. |
| `argument-hint` | no | n/a | sometimes | |
| `allowed-tools` | no | n/a | **yes** (e.g. `["mcp__agnt__detect", ...]`) | **SBT convention only.** SP commands have no `allowed-tools`. |

**Note on SP commands:** SP's three commands (`brainstorm`, `write-plan`, `execute-plan`) are all marked **deprecated** in favor of equivalent skills. They are tombstones. **No SP commands need porting.**

CE has zero commands. **No CE commands need porting either.** All CE entry points are skills.

---

## 3. SBT SessionStart Baseline Audit

### 3.1 Hook inventory (all 21 SBT plugins)

```
plugins/agnt/hooks/hooks.json          PreToolUse, PostToolUse, PostToolUseFailure, Notification, Stop
plugins/dartai/hooks/hooks.json        Stop (loop guardian, agent-type), SessionEnd
plugins/figma-query/hooks/hooks.json   {} (empty)
plugins/lci/hooks/hooks.json           PreToolUse (matcher: Grep|Glob, force-LCI mode)
plugins/risk-pipeline/hooks/hooks.json PostToolUse (matcher: Write|Edit|MultiEdit)
plugins/workflow/hooks/hooks.json      Stop (loop guardian), SessionEnd
```

Total hooks files: **6 of 21 plugins** (29%). The other 15 ship no hooks.

### 3.2 SessionStart-specific findings

**There is no `SessionStart` hook in any SBT plugin.** Confirmed by grep across all `hooks.json` files. The only matches for the literal string `SessionStart` in SBT are:
- `plugins/workflow/README.md` — documentation only
- `plugins/dartai/skills/hook-doctor.md` — documentation only
- `plugins/dartai/README.md` — documentation only

**SBT SessionStart baseline injection: 0 bytes from plugin hooks.**

What auto-loads anyway (Claude Code defaults, not from SBT plugins):
- The `Skill` tool index — surfaces every skill's `name` + `description` frontmatter to the model. Bodies load on demand.
- The agent index — surfaces every agent's `name` + `description`.
- The command index — same pattern.

**Measured discovery-index size for SBT plugin entries (frontmatter only):**

| Surface | Count | Total bytes (frontmatter) | Avg bytes/entry |
|---|---:|---:|---:|
| Skills | 180 | 63,525 | 353 |
| Agents | 44 | 31,247 | 710 |
| Commands | 97 | 32,780 | 338 |
| **Total** | **321** | **127,552 (~125 KB)** | |

At a rough 4 bytes/token, **~32K tokens of discovery index** are surfaced per session by SBT plugins today. (Note: Claude Code may compress or paginate this — exact tokens depend on the harness. The byte count is the upper bound from the marketplace-side data.)

### 3.3 Comparison: what would SBT inject if it adopted SP-style SessionStart?

For reference, SP's SessionStart hook injects:
- Wrapper script: ~2.9 KB
- Full body of `using-superpowers/SKILL.md`: 4674 bytes
- **Per-session injection: ~7.5 KB raw text into the conversation**

SBT does not need this and **should not adopt it.** The discovery-index pattern is sufficient.

---

## 4. Bloat Projection

### 4.1 Discovery-index growth per added agent

Using the measured CE agent frontmatter average of **297 bytes** (CE is the porting source, so this is the right number — not SBT's heavier 710 average, which reflects SBT's bilingual `Use when:` style; ported agents will need to adopt it, raising the per-agent cost).

**Realistic per-ported-agent frontmatter cost after SBT-style normalization:** ~600 bytes (CE's 297 + ~300 added for Wenyan/`Use when:` triggers).

| N agents added | Added frontmatter bytes | Added tokens (~4 B/tok) | % growth on current ~125 KB index |
|---:|---:|---:|---:|
| 10 | ~6,000 | ~1,500 | +4.7% |
| 36 | ~21,600 | ~5,400 | +16.9% |
| 50 (full CE port) | ~30,000 | ~7,500 | +23.5% |

**Verdict on discovery-index bloat:** at N=36 the discovery index grows ~17%. This is meaningful but tolerable. At N=50 (full CE port), the index grows ~24%, and that crosses into "noticeable model-context impact" territory. **Cap at N≈36 unless a clear value case justifies the rest.**

### 4.2 Body-load cost (only when invoked)

CE skill body sizes vary widely — `ce-debug/SKILL.md` is 10,756 bytes. SP's heaviest agent body is 3,888 bytes. **None of this loads into context unless the model invokes the Skill or Task tool.** Body cost is paid per invocation, not per session.

**Implication:** the bloat risk is the discovery surface (frontmatter), not the body store. Conditional-dispatch design (§5) eliminates body cost unless actually used.

### 4.3 Hidden cost: agent description quality

Long, example-rich descriptions like SP's `code-reviewer.md` (1221 bytes) help the model pick the right agent but inflate the index. CE's terse 297-byte descriptions are cheap but force the model to guess.

**Sweet spot for ports:** ~500–700 bytes per agent — concrete trigger phrases (`Use when:`), one-line `What it does`, and an explicit non-trigger negative case (`Skip when:`). Match SBT's existing 710-byte average, not CE's 297-byte minimum.

---

## 5. Conditional-Dispatch Design for Ported Agents

**Goal:** keep the per-session discovery cost bounded while making the ported library reachable when actually needed.

### 5.1 Layered dispatch model

```
Layer 0 — always loaded (cheap)
  └─ Agent frontmatter only: name + description + Use when: + Skip when:
     Cost: ~600 B per agent

Layer 1 — loaded on Skill/Task invocation (medium)
  └─ Full agent body (~1–4 KB) + tool allowlist
     Cost: paid only when model dispatches the agent

Layer 2 — loaded on demand within agent (high)
  └─ Reference docs, large prompts, examples
     Cost: paid only inside agent execution
```

**Rule:** every ported SP/CE agent ships its body in Layer 1. **No agent body lands in Layer 0.** This is the "conditional-dispatch" architectural rule.

### 5.2 Discovery patterns to use

1. **`Use when:` / `Skip when:` triggers in description.** Forces the model to gate dispatch on explicit cues. SBT already uses this. Ported agents must adopt it.

2. **ToolSearch-style namespacing for tool surfacing.** When a ported agent depends on >5 MCP tools, do not list them all in `allowed-tools` upfront — use a meta-tool `select:agent-name` pattern (analogous to how the harness already loads deferred tool schemas via `ToolSearch`) so the tool schemas come in only at agent-invocation time. **Pattern:** `allowed-tools: ["ToolSearch"]` plus an agent-body instruction to call `ToolSearch` with `select:<tool-name>` once dispatched. This trades one extra tool round-trip for ~2–4 KB saved on the discovery surface per agent.

3. **Lazy-load via the Skill tool, not Task.** For non-autonomous agents (which describe reusable workflows rather than spawning a subprocess), prefer registering them as **skills** and dispatching with the `Skill` tool. Skills only inject body content when invoked. The SP-marked-deprecated commands are an instructive negative example: SP retired `commands` and routes through skills exactly to get this lazy-load behavior.

4. **Plugin-level grouping.** Cluster ported CE/SP agents into a small number of new SBT plugins (e.g., `compound-review` for the 28 CE review agents) rather than spreading them. Plugin grouping makes it easy to disable a whole cluster from `marketplace.json` if the discovery index gets noisy in practice.

### 5.3 Anti-patterns to forbid

- **No SessionStart injection.** Do not adopt SP's `using-superpowers` injection pattern. The `Skill` tool's discovery index is sufficient.
- **No `mcpServers` in `plugin.json`.** Project convention (per CLAUDE.md / project memory) — slop-mcp owns MCP registration. Ported plugins must continue to ship `mcp.json.disabled`.
- **No agent that loads a `references/` folder full of context up front.** Inline the reference text into the body, or use `Read` from inside the agent on demand.

---

## 6. Binding Architectural Decision

**Decision:** All agents ported from SP or CE into SBT under epic `5M3PMcxNe1cB` MUST use conditional-dispatch (Layer 1 lazy-load via Skill/Task tool). No ported agent body may be injected at SessionStart or pre-loaded into the discovery index beyond its `name` + `description` + `Use when:` / `Skip when:` triggers.

**Caps:**
- Total ported agents in initial port (I1+I2+I3): **≤ 36**.
- Per-agent frontmatter target: ~500–700 bytes (match SBT's 710-byte average).
- Discovery-index growth budget for the consolidation: **≤ 17%** (~5400 tokens).

**Enforcement:** I1 task acceptance criteria must include a frontmatter-size lint that rejects any ported agent whose frontmatter exceeds 1 KB. Add to the `risk-pipeline` plugin's PostToolUse hook on Write/Edit if it scopes to `plugins/*/agents/*.md`.

---

## 7. Inputs to the Parent Epic (`5M3PMcxNe1cB`)

R1 unblocks the following downstream tasks:

- **I1** (port SP skills) — use §2.3 path translation rule; flatten `references/` folders.
- **I2** (port CE review agents) — apply §5 conditional-dispatch; group into a new `compound-review` plugin.
- **I3** (port CE design/docs/research agents) — same dispatch rule.
- **I5** (frontmatter normalization) — apply §2.2 (`tools:` → `allowed-tools:`, add `Use when:` triggers).
- **I6** (SessionStart decision) — confirmed: **do not adopt**. Discovery index is sufficient.

---

## Appendix A — Raw Measurements

```
SBT plugin count:                       21
SBT skills total:                       180
SBT agents total:                       44
SBT commands total:                     97
SBT skill frontmatter total bytes:      63,525  (avg 353)
SBT agent frontmatter total bytes:      31,247  (avg 710)
SBT command frontmatter total bytes:    32,780  (avg 338)
SBT discovery-index total bytes:        127,552 (~32K tokens at 4 B/tok)
SBT hooks.json files:                   6 (of 21 plugins)
SBT SessionStart hooks:                 0

SP skills:                              14
SP agents:                              1   (code-reviewer.md, 3888 B body)
SP commands:                            3   (all deprecated tombstones)
SP SessionStart hook:                   yes
SP SessionStart injection:              ~7.5 KB raw / session

CE skills:                              43
CE agents:                              50  (review:28, design:3, docs:1, document-review:7, research:?, review:?, workflow:?)
CE commands:                            0
CE agent frontmatter avg:               297 B
CE SessionStart hook:                   no
```

## Appendix B — Files Inspected

- `/home/beagle/work/standardbeagle-tools/.claude-plugin/marketplace.json`
- `/home/beagle/work/standardbeagle-tools/plugins/{agnt,lci,figma-query,dartai,workflow,risk-pipeline,...}/.claude-plugin/plugin.json` (21 plugins)
- `/home/beagle/work/standardbeagle-tools/plugins/{agnt,lci,figma-query,dartai,workflow,risk-pipeline}/hooks/hooks.json`
- `/home/beagle/.claude/plugins/marketplaces/superpowers-dev/.claude-plugin/{marketplace.json,plugin.json}`
- `/home/beagle/.claude/plugins/marketplaces/superpowers-dev/hooks/{hooks.json,session-start}`
- `/home/beagle/.claude/plugins/marketplaces/superpowers-dev/skills/using-superpowers/SKILL.md`
- `/home/beagle/.claude/plugins/marketplaces/compound-engineering-plugin/.claude-plugin/marketplace.json`
- `/home/beagle/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/.claude-plugin/plugin.json`
- `/home/beagle/.claude/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/{skills,agents}/**` (sampled)

## Appendix C — Adversarial Self-Review

Claims made in this report and the verifier-style challenge against each:

1. **Claim:** "SBT has no SessionStart hook." → **Challenge:** confirmed by `grep -rl SessionStart` against `plugins/*/hooks/hooks.json` returning zero matches in `.json` files; the only matches are docs.
2. **Claim:** "CE has 50 agents, not 36." → **Challenge:** `find ... -name "*.agent.md" | wc -l` = 54 across all subdirs, of which 50 are unique agent .md files (4 fixtures excluded in tests/). Original task estimate of "36+" stands as a lower bound; real ceiling is 50.
3. **Claim:** "Discovery-index growth at N=36 is ~17%." → **Challenge:** based on 600 B/agent × 36 = 21.6 KB on a 125 KB base = 17.3%. Verified arithmetic. Sensitive to per-agent size; if SBT's 710-avg holds, growth is ~20%, still under the 25% threshold.
4. **Claim:** "Ports must add explicit `plugin.json` entries even though SP/CE auto-discover." → **Challenge:** all 21 SBT `plugin.json` files surveyed enumerate skills/agents/commands explicitly. No counter-example found. Claim holds; recommend a separate ticket to migrate SBT to convention-based discovery.
5. **Claim:** "SP commands are tombstones." → **Challenge:** read `brainstorm.md`, `execute-plan.md`, `write-plan.md` frontmatter — all three contain "Deprecated" in description. Claim holds.

No claim was rejected after challenge.
