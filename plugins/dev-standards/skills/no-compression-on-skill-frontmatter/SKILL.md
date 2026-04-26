---
name: no-compression-on-skill-frontmatter
description: "Skill description fields in SKILL.md frontmatter are load-bearing for retrieval — never compress, never apply Wenyan or caveman style, never abbreviate. The 'description' field is the indexed signal Claude Code's skill matcher uses to decide whether to load a skill, so terse or compressed prose silently degrades skill discoverability across the entire project. Cites K2 §3.1 (provenance / metadata integrity). Use when: writing or editing the description frontmatter field on any SKILL.md in this repository, reviewing a PR that adds or modifies a SKILL.md, auditing existing skills for retrieval quality, dispatching a subagent that will write a skill (brief them in Wenyan but require uncompressed English in the description field). Skip when: editing the body of a SKILL.md (compression rules for body content live elsewhere — this rule scopes only to the frontmatter description field), editing non-skill markdown (rules/, commands/, agents/ have their own frontmatter conventions)."
---

# No Compression on Skill Frontmatter

Project-level value-layer rule. The `description` field in SKILL.md frontmatter is **not prose for humans** — it is **retrieval metadata** consumed by Claude Code's skill matcher. Compressing it (Wenyan, caveman, abbreviation, single-language reduction) trades a tiny token saving in the source file for a measurable degradation in retrieval quality across every future session that might benefit from the skill.

## Provenance

- **K2 design doc:** `docs/research/K2-knowledge-hygiene-from-papers.md` §3.1 (Provenance per claim — metadata integrity is the same discipline as cite-trail integrity; both are load-bearing for downstream consumers)
- **Project memory:** `feedback_prefer_soft_guidance.md` (this is one of the few places where a hard "must" is justified — see Why This Is A `Must` below)
- **Source pattern:** existing dev-standards skills (`update-rules`, `verification-before-completion`, `add-skill`) all keep their description fields in plain English with bilingual `Use when:` / `Skip when:` triggers — that is the in-repo template this rule formalizes.

## The Value-Layer Rule

> **The `description` field in any SKILL.md frontmatter MUST be written in uncompressed natural English (with optional bilingual gloss), MUST contain explicit `Use when:` triggers, and SHOULD contain explicit `Skip when:` triggers. Wenyan, caveman, and other compression schemes are forbidden in this field — even if the rest of the project uses them for body content or chain-of-thought.**

This is the second `must` in the dev-standards plugin (alongside `verification-before-completion`'s evidence rule). Other rules in this plugin are `prefer` / `default toward` with escape valves; this one is not.

## Why This Is A `Must`

Most rules in this repo follow the soft-guidance memory feedback (`feedback_prefer_soft_guidance.md`) and frame guidance as `prefer`/`default toward` rather than `must`/`never`. This rule is one of the rare exceptions, for a specific structural reason:

1. **The description field is consumed by an automated retriever, not by a human reviewer.** A reviewer can re-interpret compressed prose; the retriever cannot. Soft guidance has no escape valve here because there is no human-in-the-loop to apply it.
2. **The cost of getting this wrong is silent and project-wide.** A skill with a compressed description still loads if explicitly requested by name, so the failure mode is invisible: skills simply stop being suggested when they should be. There is no error message, no test that fails, no log line. Only retrospective audit catches the regression.
3. **The cost of compliance is trivial.** The description field is ~50–500 characters. Writing it in plain English costs nothing measurable; compressing it saves nothing measurable. The asymmetry justifies a hard rule.

The escape valve (consistent with this repo's soft-guidance posture) is **scope**: this rule applies only to the `description` frontmatter field. SKILL body content can use whatever compression style fits its audience.

## What "Uncompressed" Means Concretely

A description field is uncompressed when **all five** of the following hold:

1. **Sentences parse as natural English.** A reader unfamiliar with Wenyan/caveman conventions can read the description and understand what the skill does. Test: paste the description into a fresh Claude session and ask "what does this skill do?" — if the answer is correct on the first try, it parses.
2. **Trigger phrases are explicit and bilingual-friendly.** The description contains a literal `Use when:` followed by 2–4 concrete trigger conditions (verbs + objects, e.g., "writing a load-bearing assertion in a spec"). When bilingual gloss is present, the English form is primary and the gloss is supplementary, never replacement. `Skip when:` is strongly preferred to scope the negative space.
3. **Domain terms appear in their full form.** Do not abbreviate domain identifiers (`PROVENANCE-CONTRACT`, `Phase 0`, `dart-query`, `lci_get_context`) or replace them with shorthand. The retriever indexes these terms verbatim.
4. **No single-character or pictographic substitutions for full words.** Wenyan-style 1-char compression (`需`/`乃`/`勿`/`毋`) is fine in body content but is a retrieval anti-pattern in the description field. Caveman omissions (article-dropping, `do X. else Y.`-shape) are similarly out of scope here.
5. **Length follows the repo norm: 200–800 characters is typical.** Shorter descriptions usually fail Use-when explicitness; longer ones usually drift into body content. There is no hard cap, but a description at 50 characters or 2000 characters is a soft signal of compression-too-far or scope-creep-into-body respectively.

## What This Rule Does NOT Cover

- **SKILL body content.** Bodies can use Wenyan, caveman, code-only, ASCII art, whatever fits the audience. Compression rules for body text are out of scope here.
- **Frontmatter `name` field.** The `name` is a kebab-case identifier already, not a retrieval signal — naming conventions live in `add-skill/SKILL.md`.
- **`commands/*.md`, `agents/*.md`, `rules/*.md` frontmatter.** Each has its own frontmatter shape; this rule scopes only to `skills/**/SKILL.md`. Sibling skills in this plugin (`add-skill`, `update-rules`) handle the broader template question.
- **Subagent prompts and internal CoT.** Project-global guidance (`/home/beagle/.claude/CLAUDE.md` Communication Mode section) routes those through Wenyan deliberately — this rule does not override that guidance for non-skill artifacts.

## Self-Application (Eat Your Own Dogfood)

The description field on **this** SKILL.md is itself uncompressed, contains an explicit `Use when:` clause with four trigger conditions, contains an explicit `Skip when:` clause with two scope-exclusion triggers, cites the load-bearing claim (K2 §3.1) by section, and runs ~700 characters. If a reviewer can read it as natural English on first pass, this skill is following its own rule.

## Anti-Patterns

| Anti-pattern | Example | Why it fails |
|---|---|---|
| Wenyan description | `description: "需即用之以驗skill前。先讀。後述。常然。"` | Retriever indexes the literal characters; the skill becomes invisible to anyone querying in English. |
| Caveman compression | `description: "Skill desc field load-bearing. No compress. K2 §3.1."` | Article-dropped fragments score lower on semantic similarity than full sentences for English queries. |
| Bilingual-only-gloss | `description: "管理項目開發規則。"` (no English form) | Cuts retrieval coverage for English-language queries by ~half; the bilingual gloss should supplement, not replace. |
| Missing `Use when:` | description ends after one summary sentence | The retriever cannot match against trigger conditions that are not stated; missed-suggestion failure mode. |
| Single-char domain shorthand | `"...via PC contract per K2 §3.1."` (where PC = PROVENANCE-CONTRACT) | The retriever cannot resolve the abbreviation back to the indexed term unless the term itself appears verbatim. |

## When Compression Looks Tempting

The most common temptation is "this description is repetitive across N skills, let me factor out the common preamble into shorthand." Resist this. The retriever does not deduplicate across skills — each skill's description is scored independently, and any skill whose description is too short to contain the relevant trigger phrases will lose retrieval to one whose description carries them in full. Repetition across skills is a feature of this metadata layer, not a bug.

## Relationship To Other Plugin Skills

- **`add-skill/SKILL.md`** — defines the broader template for new skills. This rule narrows one specific field within that template.
- **`update-rules/SKILL.md`** — manages `.claude/rules/*.md` files (a different metadata layer); does not overlap with skill frontmatter.
- **`verification-before-completion/SKILL.md`** — the other `must` in this plugin, scoped to evidence-before-claims rather than metadata-integrity.
- **`knowledge-hygiene:multi-source-research/SKILL.md`** — load-bearing claims need ≥2 sources; this rule's claim about retrieval-quality cost has both a paper-source (K2 §3.1) and an in-repo-source (existing skill descriptions match this template), satisfying its own multi-source dependency.
