---
title: Consolidate redundant researcher agents into a single agent with a mode flag
module: research
date: 2026-04-26
problem_type: developer_experience
component: documentation
severity: medium
tags:
  - research-agents
  - agent-consolidation
  - mode-flag
  - ce-port
  - web-researcher
  - best-practices-researcher
  - framework-docs-researcher
applies_when:
  - Multiple ported agents share substantial methodology with only narrow framing differences
  - Discovery-index density needs to stay tight (R1 frontmatter cap concerns)
  - A single mode parameter can preserve all capabilities while reducing the surface area
---

# Context

K0-ce-feature-stack-rank.md §4.1 identified that `best-practices-researcher` and `framework-docs-researcher` (both ported from CE earlier) share ~80% of their methodology with `web-researcher`. The differences are framing — one tilts toward "industry standards and conventions", the other toward "official framework docs and version constraints". Three full agent files cost three discovery-index entries plus three places to keep frontmatter and methodology in sync. K1b consolidates them into `web-researcher` with a `mode=` parameter.

# Guidance

When you have two or more research-style agents whose body is largely the same methodology with only narrow framing differences, prefer **one agent + mode parameter** over **multiple agents**. The collapse rule:

1. **Identify shared structure.** If two agents both run a phased web-research pipeline (range → narrow → fetch → synthesize), they're candidates for consolidation.
2. **Identify divergent framing.** Document the differences as bullet lists per mode: which queries to bias toward, which sources to prefer, which output sections to swap.
3. **Add a `Mode Parameter` section** to the kept agent's body that enumerates each mode with its scope-tightening rules. Default mode (no parameter) preserves the original behavior.
4. **Update integration points.** Skills and commands that previously dispatched the deleted agents now dispatch the kept agent with `mode=<name>`.
5. **Delete the redundant agent files** and remove their entries from `plugin.json`.

This is **only** appropriate when the methodology truly is shared. Agents that differ in their core search loop (e.g. `learnings-researcher` searching `docs/solutions/` vs `web-researcher` searching the open web) are not consolidation candidates — different methodologies need different bodies.

# Why This Matters

Discovery index density is the dominant lever per R1 §1: bodies load lazily but frontmatter loads eagerly. Three consolidatable agents cost ~1.8 KB of discovery index for capabilities that fit in ~600 bytes when expressed as one agent + mode docs. Across a dozen such consolidations the index headroom compounds. K0 §10 (R1 cap math) explicitly cites this kind of fold as the way to keep the wave-1+wave-2 ports under the 17% budget.

Beyond the byte math, consolidation reduces duplication: the next methodology improvement (e.g. a better depth-extraction heuristic) is a one-place edit instead of three.

# When to Apply

- Auditing a fleet of ported agents for redundancy (post-port consolidation step)
- When R4-style dedup audits flag agents as overlapping
- When R1 frontmatter cap headroom shrinks below ~10%
- When a port maintainer is tempted to copy-paste an existing agent and lightly edit framing — that's a mode-flag candidate

**Do not apply when:**

- Methodology truly differs (different search source, different output schema, different tool surface)
- One agent depends on a tool the other doesn't have (consolidation would over-grant tools)
- Documented external integrations dispatch the deleted agent by name and cannot be updated atomically — keep the alias or migrate carefully

# Examples

## Before (three agent files)

- `plugins/research/agents/web-researcher.md` — broad external grounding
- `plugins/research/agents/best-practices-researcher.md` — industry standards framing
- `plugins/research/agents/framework-docs-researcher.md` — official framework docs framing

Each ~3 KB body, each in `plugin.json`'s `agents` array, each independently maintained.

## After (one agent + mode)

- `plugins/research/agents/web-researcher.md` with a `Mode Parameter` section documenting `mode=best-practices` and `mode=framework-docs` (and the default mode).
- The other two files deleted; `plugin.json` updated to remove their entries.
- `ce-compound` Phase 3, `dev-standards:grill-task` external-research step, etc. dispatch as `Task subagent_type=research:web-researcher` with `mode=...` in the prompt.

## Mode parameter shape

The kept agent body documents per mode:

- When to use the mode (one-line trigger)
- How to tighten queries (§2 range, §3 narrow)
- Which sources to prefer (§4 fetch)
- Which output sections to swap (output format)
- Whether the deprecation check (former §1.5 of the deleted agents) is mandatory in this mode

The default mode preserves the un-folded behavior. Callers that pre-existed the consolidation continue to work without change.

# References

- `docs/research/K0-ce-feature-stack-rank.md` §4.1 (researcher mode-flag fold-in)
- `docs/research/R4-ce-agent-uniqueness-audit.md` §4 (dedup table that suggested the fold)
- `plugins/research/agents/web-researcher.md` §"Mode Parameter" — implementation
- K1b execution — first application of this pattern in this repo
