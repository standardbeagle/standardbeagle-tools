---
title: Agent frontmatter conventions for ported CE/SP agents (R1 §2.2)
module: standardbeagle-tools
date: 2026-04-26
problem_type: best_practice
component: documentation
severity: medium
tags:
  - agent-frontmatter
  - ce-port
  - sp-port
  - r1-conventions
  - allowed-tools
  - bilingual-description
applies_when:
  - Porting an agent from compound-engineering or superpowers
  - Authoring a new agent in this repo
  - Auditing agent discoverability across the fleet
---

# Context

Plugin discovery in Claude Code surfaces *frontmatter only* (name + description) as the index; bodies load on demand. R1-plugin-manifest-audit.md §2.2 codified the SBT convention so ported agents land consistently and remain discoverable without inflating the index.

# Guidance

When porting or authoring an agent in `plugins/<name>/agents/<agent>.md`:

1. **`name:`** — kebab-case, matches filename without extension. CE often relies on filename alone; SBT requires it explicitly.
2. **`description:`** — bilingual (Wenyan + English), plus a `Use when:` and `Skip when:` trigger list both languages. The trigger list is the discovery surface — make it specific (5–8 use-when triggers, 2–3 skip-when triggers). Keep total under ~600 bytes per the R1 cap math.
3. **`model:`** — set explicitly for ported agents (`sonnet`, `inherit`, `opus`). CE common is `inherit`; choose deliberately based on agent role.
4. **`allowed-tools:`** — **not** `tools:`. CE/SP use `tools:`; both parse but normalizing to `allowed-tools:` is the SBT convention. Skills do not declare this field at all (see critical-patterns).
5. **MIT attribution comment** — for ported content, include an HTML comment immediately after the frontmatter:

   ```markdown
   <!--
   Originally ported from Compound Engineering (`ce-<name>`).
   Upstream: https://github.com/every-org/compound-engineering — MIT License.
   Body content preserved verbatim; only frontmatter normalized per
   standardbeagle-tools R1 §2.2.
   -->
   ```

6. **Body content preserved verbatim** unless functional differences require edits. Document any edits in the attribution comment.

7. **Add to plugin.json** — strict-list manifests require explicit enumeration in the target plugin's `agents` array. Without this the agent is invisible.

# Why This Matters

R1's measurement: SBT ships ~244 plugin entry points (skills + agents + commands). The discovery index is the bottleneck, not body size — bodies load lazily. A consistent frontmatter shape across the fleet keeps the index dense and searchable. Convention drift (e.g. some agents using `tools:` and others `allowed-tools:`) creates per-agent surprise that compounds across the fleet.

# When to Apply

- Every new agent file
- Every CE/SP port (K-cluster work in progress)
- Audits prompted by R1 frontmatter cap concerns
- Reviews of agent description quality (do triggers actually describe when to dispatch?)

# Examples

## Before (CE upstream — `ce-web-researcher`)

```yaml
---
name: ce-web-researcher
description: Performs iterative web research and returns structured external grounding...
model: inherit
tools: WebSearch, WebFetch
---
```

## After (SBT port — `web-researcher`)

```yaml
---
name: web-researcher
description: "執行迭代式網路研究...Performs iterative web research and returns structured external grounding... Use when: ideating outside the codebase, validating prior art... 用於：構思碼庫外、查驗先前技術... Skip when: question is fully answerable from local repo or institutional memory; ..."
model: sonnet
allowed-tools: WebSearch, WebFetch
---

<!--
Originally ported from Compound Engineering (`ce-web-researcher`).
Upstream: https://github.com/every-org/compound-engineering — MIT License.
Body content preserved verbatim; only frontmatter normalized per
standardbeagle-tools R1 §2.2.
-->
```

# References

- `docs/research/R1-plugin-manifest-audit.md` §2.2 (agent frontmatter)
- `docs/research/R1-plugin-manifest-audit.md` §6 (no SessionStart injection)
- `docs/solutions/patterns/critical-patterns.md` — frontmatter quirks that affect discovery
