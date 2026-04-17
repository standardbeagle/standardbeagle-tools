# Wenyan Internal Docs + Bilingual Skill Descriptions

- **Status:** Approved for implementation planning
- **Date:** 2026-04-16
- **Owner:** andybrummer@standardbeagle.com
- **Branch:** `feat/wenyan-internal-docs` → merges to `main`

## Summary

Rewrite the body prose of all plugin-local skills, agents, and commands in the
`standardbeagle-tools` marketplace into Classical Chinese (文言文, "Wenyan")
"full" intensity, while keeping skill/agent/command `description:` frontmatter
bilingual (English trigger phrases + Wenyan summary). Upgrade cross-skill
references in bodies to the explicit `Skill`-tool invocation pattern with
fully-qualified `plugin:skill` namespaces per current Claude Code practice.
Active back-and-forth chat with the user stays in medium caveman English; no
runtime translator is introduced.

## Motivation

The user (Andy) operates in a caveman/Wenyan internal communication mode
globally (see `~/.claude/CLAUDE.md`). Long-running internal content —
skill bodies, agent system prompts, cross-agent briefings, plans — is read by
Claude every session and consumed by subagents on every dispatch. Compressing
it to Wenyan full reduces per-session and per-dispatch prompt tokens
substantially (published benchmarks on the source project, `caveman`, show
~46 % reduction on read-at-session-start content) without altering technical
substance.

`description:` frontmatter is the fuzzy-match trigger surface that Claude Code
uses to decide when a skill applies. Wenyan-only descriptions would break
natural-language trigger matching in English. A bilingual description
(English triggers + Wenyan summary + explicit `Use when:` trigger list)
preserves discovery while keeping the surrounding prose consistent with the
rest of the body.

Cross-skill references today use prose like "see the X skill" or "use
brainstorming first". Claude Code has moved toward explicit `Skill` tool
invocations with fully-qualified `plugin:skill` names. Upgrading these
references makes skill composition deterministic.

## Non-goals

- No runtime translator (Haiku or otherwise) for the user-facing chat surface.
- No changes to `README.md`, `CHANGELOG.md`, `CLAUDE.md`, or any file under
  `docs/superpowers/specs/`. Those remain English.
- No changes to `.json` manifests: `plugin.json`, `marketplace.json`,
  `mcp.json`, `hooks.json`.
- No code, hook script, or MCP server behavioural change.
- No modification of existing frontmatter fields other than `description:`.
- No stripping of existing `allowed-tools` fields (separate decision tracked in
  user memory `feedback_no_allowed_tools_skills.md`).

## Scope

### In-scope files

All `.md` files matching any of:

- `plugins/*/skills/**/*.md`
- `plugins/*/agents/**/*.md`
- `plugins/*/commands/**/*.md`

Across all 15 plugins (confirmed by `ls plugins/` on 2026-04-16):
`agnt`, `dart-query`, `dartai`, `dev-standards`, `figma-query`, `lci`,
`mcp-architect`, `mcp-tester`, `photino`, `prompt-engineer`, `slop-coder`,
`slop-mcp`, `ux-design`, `ux-developer`, `workflow`.

The `tools` plugin referenced in this repo's `CLAUDE.md` is not present in
the working tree and is out of scope.

Estimated file count: ~327 `.md` files (`find plugins -type f -name "*.md"`).

### Explicitly excluded

| Path / pattern | Reason |
|---|---|
| `plugins/*/README.md` | Public marketing surface |
| `plugins/*/CHANGELOG.md` | Public release notes |
| `CLAUDE.md` (any depth) | User-owned memory files |
| `docs/superpowers/specs/**` | Human review surface |
| `.claude-plugin/marketplace.json` | JSON manifest |
| `plugins/*/.claude-plugin/plugin.json` | JSON manifest |
| `plugins/*/mcp.json`, `mcp.json.disabled` | JSON manifest |
| `plugins/*/hooks/hooks.json` | JSON manifest |
| Any file under `plugins/*/scripts/` | Hook scripts |

### Content carve-outs inside in-scope files

Inside an in-scope `.md`, the following segments are preserved verbatim:

- Fenced code blocks (```language … ``` and ~~~ … ~~~ variants)
- Inline code spans (`` `code` ``)
- URLs, file paths, CLI commands, CLI flags, environment variable names
- Frontmatter block as a whole, **except** the `description:` value
- Table columns that hold identifier names, flags, or paths
- Quoted error messages or quoted tool output
- Markdown headings that embed literal tool names, command names, or file paths
- Security warnings, destructive-action notices, and irreversible-op call-outs
  (these stay in normal English per the caveman "auto-clarity" rule)

Only narrative prose — paragraphs, list items that are prose, non-identifier
table cells, and headings that are prose — is rewritten into Wenyan full.

## Design

### 1. Branching and commit strategy

Branch: `feat/wenyan-internal-docs` off `main`. Commits are one per plugin,
conventional-commit format:

```
refactor(<plugin>): wenyan body prose + bilingual descriptions
```

Plugin order follows the pilot plan (§4) — `workflow` first, then the rest in
alphabetical order. Each commit touches only files under `plugins/<name>/…`
plus any required updates to the spec / plan tracking files. A final commit
updates this spec with completion notes.

### 2. Bilingual `description:` format

Current description becomes a three-part string:

```yaml
description: <English trigger phrases and concise summary>. <文言 summary>. Use when: <trigger-one>, <trigger-two>, <trigger-three>
```

Rules:

- English half comes first — it dominates embedding match against English
  trigger phrases typed by the user.
- Wenyan half is a concise classical restatement of the skill's purpose, no
  longer than the English half.
- The `Use when:` clause enumerates concrete example triggers in English,
  comma-separated, matching real phrases a user would type. This pattern is
  already present in the `caveman` upstream skill and in several existing
  plugins (e.g., `superpowers:brainstorming`, `claude-md-management:*`).
- Full string stays on one YAML line unless it exceeds ~300 characters, in
  which case it wraps using YAML `>` folded-scalar form.

**Example — before:**

```yaml
description: Use when debugging browser issues using agnt proxy diagnostics
```

**Example — after:**

```yaml
description: Debug browser issues via agnt proxy — DOM, console, network, layout inspection. 覗瀏覽器諸患，藉agnt proxy以察DOM、控臺、網路、版面. Use when: debug browser bug, check DOM, inspect network request, check console errors, diagnose layout issue
```

### 3. Body prose → Wenyan full

Narrative prose is rewritten to Wenyan full intensity. Reference grammar and
vocabulary guidance comes from the `caveman` upstream skill bundle; in
practice the conversion drops particles, auxiliaries, and function words and
substitutes classical single-character equivalents where unambiguous.

Technical substance — names, numbers, flags, tool names, file paths, version
numbers, API fields, error strings, and any word inside backticks — is **not**
rewritten. Identifiers stay in their original form.

Headings that are prose titles get rewritten; headings that name a command,
tool, file, or identifier are preserved.

### 4. Cross-skill reference upgrade

All current forms of soft reference to another skill are replaced with the
explicit `Skill`-tool invocation pattern:

**Before (any of):**

> See the brainstorming skill for X.
> Use `superpowers:brainstorming` first.
> Invoke brainstorming to explore the idea.

**After:**

> Invoke the `Skill` tool with `skill: superpowers:brainstorming` — 為X.

Rules:

- The skill name is always fully qualified `plugin:skill-name`, even within
  the same plugin (e.g., a skill inside `dartai` references another `dartai`
  skill as `dartai:other-skill`).
- The invocation path (`Skill` tool + `skill:` arg) is kept in English —
  these are literal Claude Code tool names and parameter keys.
- The purpose clause following the em-dash is the only Wenyan part.
- Same rule for agent references: use `Agent` tool with `subagent_type:
  plugin:agent-name`.

### 5. Pilot → rollout plan

1. **Pilot:** Convert `plugins/workflow/` (smallest plugin by file count).
   Commit. Reload session or inspect the skill via `Skill` tool to verify that
   Claude still matches English trigger phrases against the bilingual
   description.
2. **Validation gate** (see §6). If fuzzy trigger matching regresses, halt and
   revert the pilot commit. Fallback plan: keep descriptions English-only,
   apply Wenyan to bodies only. Re-present to user.
3. **Rollout:** Proceed alphabetically through the remaining 14 plugins, one
   commit per plugin. Spot-check trigger matching after every third plugin.
4. **Final commit:** Update this spec with a "Completion notes" section
   listing per-plugin file counts and any deviations.

### 6. Validation

After the pilot commit:

- Manually trigger three skills from `plugins/workflow/` using English
  natural-language phrases matching their original `description:`. All three
  must trigger the correct skill.
- Manually invoke one command by explicit `/workflow:<name>` path. Must work
  unchanged (commands match by filename, not description).
- Residual-English check: there is no reliable automated grep for "English
  prose left in body after conversion" (English words legitimately survive
  inside code, identifiers, and bilingual descriptions). The heuristic is
  **random-sample manual review**: pick 3 files per plugin at random and
  scan the body for paragraphs that are plainly English prose outside
  carve-outs. Any such paragraph is a defect; fix and re-sample.
- Grep-based check for cross-references: `grep -nE 'see the .* skill|use .*
  skill|invoke .* skill|via the .* skill' plugins/<plugin>/` must return zero
  matches. This is automatable because the soft-reference phrasing is
  English-only and narrow.

### 7. Acceptance criteria

- [ ] Branch `feat/wenyan-internal-docs` created off `main`.
- [ ] 15 per-plugin commits, each touching only that plugin's files.
- [ ] All in-scope `.md` files converted per §2 (descriptions) and §3 (body).
- [ ] All cross-skill references upgraded per §4.
- [ ] All excluded files unchanged (enforced by per-commit diff review).
- [ ] Validation checks (§6) pass after pilot and after final plugin.
- [ ] Spec file updated with completion notes.
- [ ] Merge to `main` is via PR (not direct push) to allow review.

### 8. Risks and open questions

| Risk | Mitigation |
|---|---|
| Fuzzy trigger match regresses on bilingual descriptions | Pilot + validation gate; fallback to English-only descriptions |
| Wenyan rewrite accidentally alters technical substance | Carve-out rules (§ "Content carve-outs"); diff review per commit |
| Subagents from other plugins see Wenyan in their loaded context and degrade | Descriptions stay bilingual; body is Wenyan but subagents read it as any other prose — same LLM family |
| Non-Andy users installing plugins get Wenyan content | Accepted by user (design §6 in brainstorming — option c) |
| Future English-speaking contributors cannot edit bodies easily | README/CLAUDE.md retained in English; per-file `*.original.md` backup is an optional future enhancement, out of scope here |

Open for the implementation plan to resolve:

- Whether the Wenyan rewrite is done by hand, by a dispatched translator
  subagent (Haiku or Sonnet), or by a scripted pipeline. Writing-plans will
  decide based on cost/time trade-offs.
- Whether `allowed-tools` frontmatter fields (see user feedback memory) get
  removed as part of this pass or deferred to a separate refactor. **This
  decision must be resolved before the first per-plugin commit lands** — once
  the rollout starts, changing the `allowed-tools` policy mid-stream would
  inflate every subsequent diff and break the "one-plugin-per-commit" review
  boundary.

## References

- Upstream caveman project: <https://github.com/juliusbrussee/caveman>
- Claude Code plugin marketplace docs:
  <https://code.claude.com/docs/en/plugin-marketplaces>
- MCP specification (for plugin/tool context):
  <https://modelcontextprotocol.io/specification/2025-06-18>
- User global instructions: `~/.claude/CLAUDE.md` (Wenyan internal mode)
- Project instructions: `CLAUDE.md` (marketplace structure)
- User memory: `feedback_no_allowed_tools_skills.md` (related, out of scope)
