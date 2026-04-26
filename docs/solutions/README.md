# `docs/solutions/` — Documented Solutions

Documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`, `component`, `severity`).

This directory is searched by the `research:learnings-researcher` agent before
new feature or bugfix work begins, and written to by the
`dev-standards:ce-compound` skill after a non-trivial problem is solved and
verified. Treat it as compounding institutional memory: each documented
solution makes the next encounter of the same shape cheaper.

## Categories

**Bug track** (defects diagnosed and fixed):

- `build-errors/`
- `test-failures/`
- `runtime-errors/`
- `performance-issues/`
- `database-issues/`
- `security-issues/`
- `ui-bugs/`
- `integration-issues/`
- `logic-errors/`

**Knowledge track** (practices, patterns, workflow guidance):

- `best-practices/`
- `workflow-issues/`
- `developer-experience/`
- `documentation-gaps/`

**Cross-cutting:**

- `patterns/` — high-severity patterns the learnings-researcher reads on every
  search regardless of keyword match. Currently contains
  `critical-patterns.md`.

## Frontmatter contract

See `plugins/dev-standards/skills/ce-compound/references/schema.yaml` for the
canonical contract. Required fields on every entry: `title`, `module`, `date`,
`problem_type`, `component`, `severity`, `tags`. Bug-track entries also
require `symptoms`, `root_cause`, `resolution_type`. Knowledge-track entries
optionally include `applies_when`.

## How entries are added

Run `/ce-compound` (the `dev-standards:ce-compound` skill) right after solving
a non-trivial problem while context is fresh. The skill assembles the entry,
classifies it, and writes the file. Do not hand-edit unless refreshing an
existing entry per the skill's overlap rules.

## How entries are searched

The `research:learnings-researcher` agent runs Grep-first content searches
against frontmatter fields (`title:`, `tags:`, `module:`, `component:`),
filters candidates, and reads only matched files. Always also reads
`patterns/critical-patterns.md`. See the agent file for full search strategy.
