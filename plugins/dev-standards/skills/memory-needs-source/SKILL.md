---
name: dev-standards-memory-needs-source
description: "New memory entries need ISO 8601 timestamp + source-event tag (loop-id/task-id/commit-sha) for temporal conflict resolution. Soft guidance — backfill on next touch. Use when: writing new memory, creating per-memory file, reviewing PR adding memory, subagent appending memory. Skip: existing files lacking fields, CLAUDE.md preferences."
---

# Memories Require Timestamp and Source

Project-level soft-guidance rule for the memory layer. Memory entries that lack temporal grounding silently accumulate staleness — six months from now, the entry "this project uses OAuth" still claims OAuth even after the project moved to API keys, because no field tells the conflict-resolver "the OAuth claim is older than the new evidence." Adding a timestamp + source-event tag at write time is the cheapest possible insurance against that failure mode.

## Provenance

- **K2 design doc:** `docs/research/K2-knowledge-hygiene-from-papers.md` §3.4 (Temporal normalization — date-bearing claims must be tagged "as of date X" rather than ambient-present-tense)
- **Source paper:** OmniMEM `(2604.01007)` — lifelong-multimodal-agent framing requires memory to survive across sessions, which requires temporal grounding to detect drift.
- **Sibling plugin pattern:** `plugins/research/agents/learnings-researcher.md` `verified_at` + `verified_against` fields (commit `d3c4669`) and `plugins/research/agents/session-historian.md` `surfaced_from.{session_id, session_date}` shape (same commit). Those patterns are the upstream sibling discipline this rule formalizes for the memory layer.
- **Reused contract:** brainstorming `<PROVENANCE-CONTRACT>` (commit `ebd136a`) defines the source-event tag vocabulary — `git:sha`, `memory:id`, `file:path:line`, `web:url`, literal `"guess"`. The source-event tag in this rule reuses that vocabulary, extended with `loop:<id>`, `task:<dart-id>`, and `conversation:<id>` for memory-specific sources.

## The Soft-Guidance Rule

> **A new memory entry should carry both a `written_at` ISO 8601 timestamp and a `source_event` tag identifying what produced it. The pair is the minimum metadata required for downstream conflict resolution to be temporally aware. Existing memory entries without these fields are not retroactively rewritten; they are backfilled when the file is next touched for any other reason.**

This is soft guidance (`should`, not `must`) because the memory layer is append-mostly and bulk rewrites would churn the git history without proportionate value. The rule applies to new writes; existing files migrate gradually.

## Field Shapes

The two fields are kept simple — string + string — to avoid breaking existing parsers that read MEMORY.md as plain markdown. Both are encoded as a small frontmatter or inline-tag block at the head of each memory entry.

### Field 1 — `written_at`

ISO 8601 UTC timestamp at the time the memory entry was created. Format:

```
written_at: 2026-04-26T15:30:00Z
```

- **Granularity:** date-only (`2026-04-26`) is acceptable for low-frequency memory; full timestamp is preferred for high-frequency entries that may be written multiple times per day.
- **Timezone:** UTC (`Z` suffix) is preferred to avoid timezone ambiguity across contributors. Local timezones are accepted with explicit offset (`-07:00`) when the memory captures wall-clock significance.
- **Updates:** when a memory entry is meaningfully revised (not a typo fix), append a `revised_at` field rather than overwriting `written_at`. The original write time is the temporal anchor for staleness calculations.

### Field 2 — `source_event`

A tag identifying what produced this memory. Reuses the brainstorming `<PROVENANCE-CONTRACT>` vocabulary, extended for memory-layer specifics:

| Form | Example | When to use |
|---|---|---|
| `loop:<id>` | `loop:pUtvC2dRaW1P` | Memory written during a Ralph Wiggum loop — captures which loop produced the lesson |
| `task:<dart-id>` | `task:6mgXiXbw9G1B` | Memory written during a single Dart-task execution outside a loop |
| `conversation:<id>` | `conversation:abc123def456` | Memory written during an ad-hoc conversation that has a session/conversation identifier |
| `git:<sha>` | `git:b28aa0f` | Memory tied to a specific commit (e.g., "this pattern was introduced in b28aa0f") |
| `file:<path>:<line>` | `file:plugins/research/agents/web-researcher.md:42` | Memory citing a specific file location as its origin |
| `web:<url>` | `web:https://example.com/post` | Memory derived from a web source |
| `guess` | literal `guess` | Memory the author cannot trace to a specific event — uses the same literal-`guess` discipline as `<PROVENANCE-CONTRACT>` for unverifiable inferences |

**Multi-source memories** can carry an array: `source_event: [loop:pUtvC2dRaW1P, git:b28aa0f]`. Order does not matter; downstream consumers treat the array as a set.

## Encoding Patterns

The two fields can appear in any of three forms depending on the memory file's existing structure:

### Pattern A — YAML frontmatter (per-memory files)

For per-memory files under `.claude/projects/<project>/memory/`, use YAML frontmatter:

```markdown
---
written_at: 2026-04-26T15:30:00Z
source_event: loop:pUtvC2dRaW1P
---

# Memory Title

Memory body.
```

### Pattern B — Inline tag block (MEMORY.md entries)

For entries inside a shared `MEMORY.md` (where each entry is one bullet or section), prepend an inline tag line:

```markdown
- [feature_name](feature_name.md) `[written_at: 2026-04-26 source_event: task:6mgXiXbw9G1B]` — One-line description.
```

This keeps MEMORY.md scannable while still carrying the metadata.

### Pattern C — Section-header tag (longer entries)

For longer entries with their own section heading inside a shared file:

```markdown
## Decision: switch from OAuth to API keys

**written_at:** 2026-04-26T15:30:00Z
**source_event:** git:b28aa0f, loop:pUtvC2dRaW1P

Body text...
```

Pick the form that least disrupts the existing file's structure. The point is the metadata, not the encoding.

## What This Rule Does NOT Require

- **Bulk rewrites of existing memory.** Existing entries without these fields are valid-but-untyped. Backfill happens opportunistically when the file is touched for any other reason.
- **Sub-second precision.** Date-only timestamps are fine for most memory. Sub-second precision is over-engineering for a layer that decays on the scale of weeks-to-months.
- **Cryptographic source attestation.** The `source_event` tag is for audit, not authentication. A loop-id or task-id is sufficient; signed attestations are out of scope.
- **A new tool to enforce the rule.** This is guidance for human reviewers and skill-using subagents. No hooks, no validators, no pre-commit gates are added by this rule. Enforcement is conventional, eat-your-own-dogfood-style.

## Interaction With Existing Memory

The project's existing memory files are a mix of timestamped (`feedback_*.md` typically have an implicit timestamp via git history) and untimestamped (`reference_*.md`, `project_*.md`). The migration plan is:

1. **New entries (post this rule):** carry both fields from the start.
2. **Existing entries (pre this rule):** unchanged. When next touched for any other reason — e.g., revision, reformatting, citation by another rule — backfill `written_at` from `git log --follow --diff-filter=A -- <file>` (file creation date) and `source_event: git:<creation-sha>` as the safest default.
3. **MEMORY.md index file:** can be backfilled in one pass when convenient, but is not blocking. The index references files; the files carry the canonical metadata.

## Worked Example

Before this rule:

```markdown
## Feedback

- [No allowed-tools in skills](feedback_no_allowed_tools_skills.md) - Skills must not use allowed-tools; recommend tools, don't block them
```

After this rule (using Pattern B inline-tag form):

```markdown
## Feedback

- [No allowed-tools in skills](feedback_no_allowed_tools_skills.md) `[written_at: 2026-02-14 source_event: task:Yk8Lq2NaH1Pk]` — Skills must not use allowed-tools; recommend tools, don't block them
```

The cost is one inline tag block per entry. The benefit is that six months from now, when a new memory entry contradicts this one, a conflict-detector can compare timestamps and pick the more recent claim — or, if both are recent, escalate to the user as a real conflict rather than silently picking one.

## Anti-Patterns

| Anti-pattern | Why it fails |
|---|---|
| Bulk-rewriting all existing memory in one PR to add timestamps | Churns git history without proportionate value; opportunistic backfill is cheaper. |
| Using `written_at: now` (literal string) instead of an actual ISO date | The conflict-detector cannot order memories by `now`; the field becomes useless. |
| Using `source_event: claude` or `source_event: anthropic` (too coarse) | Tag must identify a *specific* event (a particular loop, task, commit, or conversation), not a class of events. |
| Adding a `confidence` field as well | Out of scope here. Memory confidence is handled by the consumer (e.g., `learnings-researcher`'s `verified_at` staleness rules); the memory layer itself carries only timestamp + source. Adding more fields is scope creep. |
| Treating the rule as a hard pre-commit gate | This is soft guidance. The rule says "should", not "must". Reviewers nudge new entries toward the shape; they do not block PRs over missing tags. |

## Relationship To Other Skills

- **`knowledge-hygiene:multi-source-research/SKILL.md`** — operates on retrieved sources at synthesis time; this rule operates on the memory layer at write time. Together they form the temporal-normalization → multi-source → conflict-detect pipeline.
- **`plugins/research/agents/learnings-researcher.md`** — `verified_at` + 90-day staleness threshold pattern. This rule is the analogous discipline for the memory layer (with no fixed staleness threshold — memory decay is consumer-specific, not layer-wide).
- **`plugins/research/agents/session-historian.md`** — `surfaced_from.{session_id, session_date}` pattern with 30-day staleness. Same family of disciplines; this rule is the project-memory-layer member.
- **`no-compression-on-skill-frontmatter`** (sibling skill) — applies to skill metadata; this rule applies to memory metadata. Both protect downstream retrievers from silent degradation.
