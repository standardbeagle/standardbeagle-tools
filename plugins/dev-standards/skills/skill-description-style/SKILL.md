---
name: dev-standards-skill-description-style
description: "SKILL.md description style — conceptual conciseness then caveman/wenyan compression. Retriever is LLM semantic match, not keyword index, so terse-but-complete beats verbose prose. Use when: writing/editing SKILL.md description, reviewing PR adding/modifying SKILL.md, briefing subagent that writes skills, auditing skill retrieval quality. Skip: editing SKILL.md body (different rules), non-skill markdown."
---

# Skill Description Style

The `description` field in SKILL.md frontmatter is **retrieval metadata** consumed by Claude Code's skill matcher. The matcher is **LLM-driven semantic**, not regex/keyword indexing. Implication: aggressive compression is fine **as long as concept tokens and Use-when triggers stay semantically intact**.

This rule replaces the prior "no-compression" rule, which was based on the wrong assumption that the retriever was keyword-indexed.

## The Rule

> **Compress description in two passes: (1) conceptual conciseness — drop citations, examples, reasoning, redundant clauses; preserve concept tokens and Use-when keywords. (2) caveman/wenyan — drop articles, filler, hedging; use wenyan glue where natural. Never drop a concept the user might query for.**

Target length: **150–400 characters** for typical skills. Hard ceiling: **1024 characters** (some clients reject longer).

## Why Compression Is Now Fine

Earlier guidance assumed the retriever was a keyword/embedding index that scored on token overlap with the query. Under that model, every word mattered, so compression hurt recall.

The actual retriever is an LLM that reads all available skill descriptions in its context and decides which to invoke based on **semantic intent**. Under this model:

- **Concept tokens still matter** — the LLM needs to know *what domain* a skill covers (form / dialog / scroll / a11y / migration). Drop these and the LLM cannot connect a query to the skill.
- **Phrasings do not matter** — `"Use when: building forms"` and `"用於：建表單"` map to the same semantic intent. Style is free.
- **Articles, fillers, hedging do not matter** — the LLM ignores them. Caveman compression saves tokens with no recall cost.
- **Citations, reasoning, examples in the description do not matter** — the LLM gets all that from the body once it decides to invoke. Strip them from the description.

The new constraint is the **deterministic budget**: descriptions are loaded into context every turn while the skill is auto-invocable. Char budget is 1% of context window or 8K fallback. Long descriptions get truncated mechanically, possibly mid-sentence. **Compression protects against this truncation** — a 250-char description is invulnerable; a 900-char description gets sliced.

## The Two Passes

### Pass 1 — Conceptual conciseness

Drop these:
- **Citations and provenance refs**: `Cites K2 §3.1`, `(commit b28aa0f)`, `per ConflictQA arxiv 2604.11209`. The body carries provenance; the description does not need it.
- **Reasoning / motivation**: "the cheapest possible insurance against...", "because no field tells the conflict-resolver...". Move to body.
- **Examples in description**: long parenthetical "(e.g., choosing the wrong session-store changes every middleware...)". Body, not description.
- **Cross-skill linkage prose**: "and links to the X skill in the Y plugin", "reuses the Z pipeline as the canonical shape". Body.
- **Hedging**: "should generally", "may", "tends to", "typically". Drop or convert to direct verb.
- **Redundant en+zh full-prose duplicates**: keep one form for narrative clauses; the other form's keywords can stay as semantic anchors.

Keep these:
- **Core function** — what the skill does, in one short clause.
- **Concept tokens** — the domain words a query would contain (form, modal, bcrypt, container-query, dart-query).
- **Use when:** triggers — the verbs and objects that match user intent.
- **Skip:** triggers — the verbs and objects that exclude wrong matches.

### Pass 2 — Caveman/wenyan compression

After Pass 1, apply terse style:
- **Drop articles** (`a`, `an`, `the`).
- **Drop filler** (`just`, `really`, `basically`, `actually`, `simply`).
- **Wenyan glue** for technical phrasing where it shortens without losing concept — e.g., `「設計多index retrieval」` for `"designing a multi-index retrieval tool"`.
- **Short synonyms** — `fix` not `implement a solution for`, `kill` not `terminate the process`.
- **Bullet-list style** — `Use when: A, B, C, D` as a comma-separated keyword cluster, not as prose sentences.
- **Imperative voice** — `Replace JS modal lib with native dialog` not `This skill should be used when the user wants to replace...`.

Wenyan single-char glyphs (`需`, `乃`, `勿`) are **fine in description** — the LLM matches semantically, not on glyph identity. Use them where they save tokens without obscuring the concept.

## Example — Before / After

Before (823 chars):
> This skill should be used when the agent considers using a modern HTML, CSS, or DOM feature. It enforces the Baseline-tier decision tree: auto-adopt features that have been Widely available for at least 9 months (Tier A), prompt the user (or consult project CLAUDE.md memory) for Newly-available or recently-Widely features (Tier B), and avoid Limited features unless an explicit fallback is documented (Tier C). Use when: writing CSS or HTML, picking a UI pattern, replacing a JS library, choosing a layout or animation primitive, before reaching for popover, dialog, container queries, anchor positioning, view transitions, scroll-driven animations, color-mix, oklch, or :has(). Skip when: editing code in a non-UI domain, working in a language without HTML/CSS output, or when the user has explicitly stated they want Tier-C bleeding-edge features without prompting.

After Pass 1 (440 chars) — drop reasoning, drop "this skill should be used":
> Baseline-tier decision tree for HTML/CSS/DOM features — Tier A Widely-9mo auto-adopt, Tier B Newly prompt user, Tier C Limited avoid sans fallback. Use when: writing CSS or HTML, picking UI pattern, replacing JS library, choosing layout or animation primitive, before popover, dialog, container queries, anchor positioning, view transitions, scroll-driven animations, color-mix, oklch, :has(). Skip: non-UI code, language without HTML/CSS, user opted Tier-C.

After Pass 2 (368 chars) — drop articles, fragmentize:
> Baseline-tier decision tree for HTML/CSS/DOM features — Tier A Widely-9mo auto-adopt, Tier B Newly prompt user, Tier C Limited avoid sans fallback. Use when: writing CSS/HTML, picking UI pattern, replacing JS lib, choosing layout/animation primitive, before popover/dialog/container-queries/anchor-positioning/view-transitions/scroll-driven-animations/color-mix/oklch/:has(). Skip: non-UI code, language without HTML/CSS, user opted Tier-C.

Concept tokens preserved: `Baseline`, `HTML`, `CSS`, `DOM`, `Tier A/B/C`, `popover`, `dialog`, `container queries`, `oklch`, `:has()`. Triggers preserved as keyword cluster. Compressed 56% with no semantic loss.

## When To Stop Compressing

Stop when:
- Every concept token a likely query would contain still appears.
- Every Use-when trigger still parses as a verb+object pair.
- Skip clause still excludes obvious wrong matches.
- Length is in the 150–400 range (or under 1024 hard ceiling).

Do not over-compress to the point that:
- A reviewer cannot tell what the skill does without opening the body.
- Domain terms get abbreviated to single chars (`PC` for `PROVENANCE-CONTRACT`) — the LLM's semantic match weakens on opaque shorthand even though it still works.
- The description becomes a list of N keywords with no verb — the LLM needs at least one verb to map intent.

## Self-Application

This SKILL's own description is ~430 chars, two passes applied, all concept tokens (`description`, `style`, `caveman`, `wenyan`, `LLM-driven`, `semantic`) intact, Use-when and Skip clauses present.

## Migration Note

Existing skills with verbose descriptions are not retroactively rewritten unless the file is touched for another reason. The repository compression pass on 2026-05-09 (commit forthcoming) handled the auto-invocable plugins — descriptions in `disable-model-invocation: true` skills are lower priority since they cost no per-turn budget.
