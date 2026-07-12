---
name: marketplace-validation
description: Validate this plugin marketplace before committing — checks plugin manifests, hook wiring, skill/command/agent frontmatter, and marketplace.json consistency. Use when adding or editing a plugin, a skill, a command, an agent, or hooks; when a plugin's hooks or skills mysteriously do not load; or before any commit or release to this repo.
---

# Marketplace validation

Run before committing any change under `plugins/`:

```bash
node scripts/validate-marketplace.mjs            # whole repo
node scripts/validate-marketplace.mjs --staged   # only staged plugins (what the hook runs)
node scripts/validate-marketplace.mjs --fix      # auto-fix what is safely fixable
```

A `pre-commit` hook runs `--staged` automatically once `core.hooksPath` is set
(`npm install` does this; or `git config core.hooksPath .githooks`).

## Why this exists

**Claude fails these silently.** A broken plugin still reports as installed and
healthy — the error goes to a log nobody reads, and the plugin's hooks or skills
are simply dead. `agnt`'s hooks were disabled this way and nobody noticed.

## The failure modes it catches

**`hooks/hooks.json` listed in the manifest — fatal.** Claude auto-loads
`<plugin>/hooks/hooks.json`. Naming it *again* under `hooks` in
`.claude-plugin/plugin.json` raises `Duplicate hooks file detected` and
**disables every hook in the plugin**. `manifest.hooks` is only for *additional*
hook files. This is auto-fixable (`--fix`).

**`plugin.json` name ≠ directory name.** Claude resolves plugins by directory, so
`claude plugin update <name>` fails with "Plugin not found".

**Missing frontmatter.** Skills need `name` + `description`. Commands and agents
need `description` only — they are addressed by *filename*
(`agents/browser-debugger.md` → `agnt:browser-debugger`).

**Bloated descriptions (warning).** Every description is injected into every
agent's context and competes for a fixed budget — Codex allots ~2% of context to
skill descriptions and silently truncates when you exceed it. Keep them under
600 characters.

**`marketplace.json` drift.** A listed plugin with no directory is an error; a
directory not listed is a warning (it will not be installable).

**Committed secrets.** Blocks obvious API-key patterns.

## Skill naming convention

Claude namespaces plugin skills by **directory** (`plugin:skill`), so the
frontmatter `name` may differ. Two forms are accepted:

- `name: <skill>` — bare
- `name: <plugin>-<skill>` — prefixed, for standalone distribution via `npx skills`

Anything else still dispatches but is off-convention, so it warns.

## Cross-platform requirement

Scripts and hooks in this repo **must be cross-platform**: Node with zero
dependencies, or `/bin/sh` limited to what Git ships on Windows. No bash-isms,
no GNU-only flags, no POSIX-only assumptions (`chmod` does not control access on
NTFS; symlinks need privilege on Windows — use junctions or copies).
