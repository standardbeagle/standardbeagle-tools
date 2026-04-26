---
title: Critical patterns — always check before plugin/agent/skill work in this repo
module: standardbeagle-tools
date: 2026-04-26
problem_type: best_practice
component: documentation
severity: high
tags:
  - plugin-development
  - agent-frontmatter
  - skill-frontmatter
  - mcp-config
  - critical-patterns
applies_when:
  - Creating or editing a plugin, agent, skill, or command
  - Auditing plugin manifests
  - Porting agents from external marketplaces (CE, SP)
  - Reviewing frontmatter for discoverability
---

# Critical Patterns — standardbeagle-tools

`learnings-researcher` reads this file on every search. Patterns here are
high-severity gotchas that recur across plugin/agent/skill work. Scan for
items relevant to the current task before proceeding.

## Plugin manifest enumeration is required (not auto-discovered)

This repo uses **strict-list** plugin manifests: every command, skill, and
agent must be enumerated in `plugins/<name>/.claude-plugin/plugin.json` under
`commands`, `skills`, or `agents`. Dropping a file in `agents/foo.md` or
`skills/foo/SKILL.md` does **not** make it discoverable — Claude Code will not
surface it.

**Symptom:** new agent/skill exists on disk but is not selectable from the
Skill or Task tool.

**Fix:** add the path to the corresponding array in `plugin.json`. See
R1-plugin-manifest-audit.md §2.1 for the full convention divergence vs SP/CE.

## `mcp.json` is intentionally disabled — do not re-enable

All plugins ship `mcp.json.disabled` rather than `mcp.json`. This is **not** a
bug. The repo uses slop-mcp to manage MCP servers; plugin-level `mcp.json` is
incompatible with slop-mcp's registration model. Audit reports that
recommend re-enabling `mcp.json` are wrong for this project. See
`/home/beagle/.claude/projects/-home-beagle-work-standardbeagle-tools/memory/MEMORY.md`
for the full rationale.

## Agent frontmatter uses `allowed-tools`, not `tools`

CE and SP agents use `tools:` in frontmatter. SBT uses `allowed-tools:`. Both
parse, but ports must normalize to `allowed-tools:` for consistency with the
rest of the SBT fleet. Other R1 §2.2 conventions:

- `name:` and `description:` required on every agent and skill
- `description:` includes both Wenyan and English, plus a `Use when:` and
  `Skip when:` trigger list
- Optional MIT attribution `<!-- ... -->` comment on the line after
  frontmatter for ported content (CE upstream is MIT)

See R1 §2.2 for full frontmatter spec.

## `dart-query` priority and size are strings, not integers

`mcp__plugin_slop-mcp_slop-mcp__execute_tool` with `dart-query`'s `create_task`
rejects integer `priority` and `size` despite some schema hints suggesting
numeric. Always pass:

- `priority`: `"critical" | "high" | "medium" | "low"` (lowercase strings)
- `size`: `"XS" | "S" | "M" | "L" | "XL"`

See repo memory `feedback_dart_query_priority_size_strings.md` for the full
trace.

## `dart-query` parent linkage requires `subtask_ids` on the parent

`create_task`'s `parentId` field is silently ignored. To create a subtask:

1. Create the child first (without `parentId`).
2. Update the parent with `subtask_ids: [child_id, ...]`.

See repo memory `feedback_dart_query_parent_via_subtask_ids.md` for the trace.

## Skills must not declare `allowed-tools`

Skills in this repo recommend tools via prose; they do not block them with
`allowed-tools:`. Adding `allowed-tools:` to a skill SKILL.md frontmatter
breaks invocation in some Claude Code versions. See repo memory
`feedback_no_allowed_tools_skills.md`.

## When porting CE/SP content

R1 §6 binding decision: **no SessionStart-injected content**. SP's pattern of
injecting a full skill body into every session inflates context for all
sessions whether or not the skill fires. SBT ports lazy-load via the Skill or
Task tool only. Do not add SessionStart hooks that inject prose, even when
porting from a source that does.
