---
title: Strict-list plugin manifests require explicit enumeration of every command, skill, and agent
module: standardbeagle-tools
date: 2026-04-26
problem_type: workflow_issue
component: documentation
severity: high
tags:
  - plugin-manifest
  - plugin-json
  - strict-list
  - convention-divergence
  - discoverability
applies_when:
  - Adding a new command, skill, or agent file to any plugin in this repo
  - Porting CE or SP content that relies on directory-convention auto-discovery
  - Debugging "agent/skill exists on disk but is not selectable" symptoms
  - Reviewing a plugin's manifest for completeness
---

# Context

R1-plugin-manifest-audit.md §2.1 surfaced a quiet but recurring papercut: SBT plugins use **strict-list** manifests. CE and SP rely on Claude Code's directory-convention auto-discovery — drop a file in `agents/foo.md` and it works. SBT requires the same file to also be enumerated in `plugin.json`'s `agents` array. The two conventions parse identically; the divergence only bites when porting content from a convention-based source into a strict-list target.

# Guidance

Whenever you create, port, or rename a file under `plugins/<name>/{commands,skills,agents}/`, **also edit `plugins/<name>/.claude-plugin/plugin.json`** and add (or remove, on delete) the path. The rule:

1. Commands → `commands` array, path like `./commands/<name>.md`.
2. Skills → `skills` array, path like `./skills/<name>/SKILL.md` (skills are dir-per-skill in this repo).
3. Agents → `agents` array, path like `./agents/<name>.md`.

After the edit, run `claude plugin validate .` from the repo root to confirm the manifest is intact.

When deleting files (e.g. K1b consolidation removing `best-practices-researcher.md` and `framework-docs-researcher.md`), remove the corresponding entries from `plugin.json` in the same commit. Stale manifest entries pointing at deleted files break validation.

# Why This Matters

The discovery index is what the user (and downstream agents) see. A new agent that exists on disk but is missing from the manifest is invisible. The symptom looks like the file "didn't take" — but it's just unindexed. Catching this at port time costs seconds; debugging it later when a Task dispatch fails to find the target costs minutes plus context.

# When to Apply

- Every commit that adds, deletes, or renames a file under `commands/`, `skills/`, or `agents/` of any plugin
- Every CE/SP port (the source plugin's manifest doesn't enumerate; SBT's must)
- Pre-release validation runs

# Examples

## Adding a new agent

1. Write `plugins/research/agents/session-historian.md`.
2. Edit `plugins/research/.claude-plugin/plugin.json`:

   ```json
   {
     "agents": [
       "./agents/web-researcher.md",
       "./agents/learnings-researcher.md",
       "./agents/session-historian.md"
     ]
   }
   ```

3. Run `claude plugin validate .` to confirm.

## Deleting redundant agents

1. `rm plugins/research/agents/best-practices-researcher.md plugins/research/agents/framework-docs-researcher.md`.
2. Remove both paths from `plugins/research/.claude-plugin/plugin.json`'s `agents` array.
3. Validate.

## Migrating to convention-based discovery (deferred)

R1 §2.1 notes that SBT could move to convention-based discovery to remove this dual-maintenance burden. That migration is out of scope here; until then, dual-maintain.

# References

- `docs/research/R1-plugin-manifest-audit.md` §2.1 (convention divergence)
- `docs/solutions/patterns/critical-patterns.md` (plugin manifest enumeration entry)
- K1b execution (this commit) — first port to exercise the delete + add path simultaneously
