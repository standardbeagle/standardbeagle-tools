---
name: knowledge-hygiene-rationalization-trap-check
description: "Detect rationalization trap long chain-of-thought before small load-bearing change, esp. CoT defending prior decision against fresh evidence. 理性化陷阱檢測。 Use when: long CoT before small commit, PR whose Why dwarfs diff, brainstorm picks overriding Phase 0 bullets, post-hoc audit of decision feels off. Skip: exploratory CoT with no commit, change big enough that long reasoning is proportionate."
disable-model-invocation: true
---

# Rationalization-Trap Check Skill

Light heuristic. Detects when a long chain-of-thought (CoT) precedes a small load-bearing change — the canonical signature of **rationalizing a prior decision against fresh contradicting evidence**, rather than updating the decision. K2 §3.3 names this an anti-pattern; commit `ebd136a` made `no silent rationalization` a value-layer rule (must be visible, not silent). This skill is the consumer-side check.

## Provenance

- **K2 design doc:** `docs/research/K2-knowledge-hygiene-from-papers.md` §3.3 (Rationalization-trap as value-rule)
- **Source paper:** ConflictQA + XoT — arxiv `2604.11209` §4 (rationalization failure mode in cross-source conflict scenarios)
- **Brainstorming anti-pattern:** commit `ebd136a` `Anti-Pattern: Silent Rationalization Through Conflict` section. The brainstorming skill emits the value rule; this skill checks for violations after the fact.

## The Value-Layer Rule

> **No silent rationalization.** If your reasoning trace contradicts a prior high-confidence claim, memory entry, or decision, you MUST surface that contradiction visibly — not absorb it into a longer justification. Visibility is the rule; the resolution can be any of the three named in `conflict-detector` (prefer-recent / prefer-authoritative / escalate-to-user).

This is the sole `must` in this plugin. Everything else is `prefer` / `default to`.

## Heuristic Rules

The check is light — three named signals, scored independently. Two-or-more positive signals → flag for human review. One signal → soft note. Zero → pass.

### Signal 1 — CoT-to-change ratio

Ratio of reasoning-trace token count (CoT, plan, design rationale) to load-bearing change token count (final commit diff, decision text, spec change).

| Ratio | Signal |
|---|---|
| ≤ 5:1 | clean — no signal |
| 5:1 – 20:1 | watch — may be exploratory; check Signal 2 + 3 |
| ≥ 20:1 | **positive** — long reasoning preceded small change, classic shape |

The ratio threshold is heuristic, not diagnostic. A 50:1 ratio on a one-line config change can be legitimate (the change has a deep blast radius). The signal is one input, not a verdict.

### Signal 2 — Override of prior high-confidence claim

Did the reasoning trace override a Phase 0 high-confidence bullet, an active memory entry, or a prior commit decision **without** invoking `conflict-detector` (this plugin) or recording the override per the brainstorming `Conflict-Detect Integration` audit-trail subsection?

- **Yes** → **positive** signal. The override happened silently — the rule violation.
- **Yes, with conflict-detector invocation and `overridden` field present** → no signal. The system worked: visible surface, then proceed.
- **No** → no signal.

### Signal 3 — Reasoning vocabulary

Search the CoT for hedging-and-absorbing phrases that characterize rationalization rather than re-evaluation:

- "on second thought, the original concern was overstated"
- "while X said Y, in practice Z is fine"
- "the constraint mentioned earlier is probably negotiable"
- "we can revisit this later" (when the change locks in a path that makes revisit costly)
- "this is consistent with [X] if we interpret [X] as..."

Two or more such phrases → **positive** signal. One → watch. Zero → no signal.

The vocabulary list is non-exhaustive and language-flexible; the check is for the **shape** (absorbing contradiction into a longer justification) not the literal phrasing.

## Scoring

| Positive signals | Verdict | Action |
|---|---|---|
| 0 | `pass` | No action; reasoning is proportionate or contradiction was surfaced. |
| 1 | `soft-note` | Emit a note in the output but do not block. Caller decides. |
| 2 | `flag` | Surface for human review. Recommend invoking `conflict-detector` on the contradicting source pair (CoT-asserted claim vs prior high-confidence claim). |
| 3 | `flag-strong` | Surface with strong recommendation: pause, invoke `conflict-detector`, document the override per the brainstorming audit-trail subsection. |

The skill does NOT auto-block. It surfaces. The value-layer rule is `no silent rationalization` — visibility, not refusal.

## Input Contract

Caller supplies:

```json
{
  "cot_text": "<the reasoning trace, plan, or design rationale text>",
  "change_text": "<the final commit diff, decision text, or spec change being justified>",
  "prior_claims": [
    {
      "id": "<stable id — Phase 0 bullet id, memory id, or commit sha>",
      "claim_text": "<the prior assertion>",
      "confidence": "<high | med | low>",
      "provenance": "<file:path:line | memory:id | git:sha | web:url | guess>"
    }
  ]
}
```

`prior_claims` may be empty (Signal 2 then auto-resolves to no-signal). `cot_text` and `change_text` are required.

## Output Contract

```json
{
  "verdict": "pass | soft-note | flag | flag-strong",
  "signals": {
    "cot_to_change_ratio": {"value": "<ratio as N:1>", "positive": true|false},
    "silent_override": {"value": "<id of overridden prior claim, or null>", "positive": true|false},
    "rationalization_vocabulary": {"matches": ["<matched phrase 1>", "..."], "positive": true|false}
  },
  "recommendation": "<one-sentence next action — e.g., 'invoke conflict-detector on prior claim X vs CoT assertion Y' or 'no action needed'>"
}
```

## Worked Example

**Input:**

- `cot_text`: 800 tokens of reasoning concluding that the chosen auth strategy "Auth0" is fine despite earlier concern about provider lock-in.
- `change_text`: 30-token commit diff: `+ "auth_provider": "auth0"` in a config file.
- `prior_claims`: one entry — Phase 0 risk bullet "provider lock-in" with `confidence: low` and `provenance: guess`.

**Signals:**

- Signal 1 — Ratio ~27:1. Positive.
- Signal 2 — The CoT overrides the prior risk bullet, but the bullet has `confidence: low` and `provenance: guess`. The override is light; record as **soft-positive** (a low-confidence guess being overridden is much less egregious than overriding a high-confidence file:line claim). The skill counts this as positive but with a note.
- Signal 3 — Vocabulary scan finds "the original concern was overstated" — one match. Watch, not positive.

**Verdict:** 2 positive signals → `flag`.

**Output:**

```json
{
  "verdict": "flag",
  "signals": {
    "cot_to_change_ratio": {"value": "27:1", "positive": true},
    "silent_override": {"value": "phase0-risk-provider-lock-in", "positive": true},
    "rationalization_vocabulary": {"matches": ["the original concern was overstated"], "positive": false}
  },
  "recommendation": "Invoke conflict-detector on the Phase 0 risk bullet (confidence:low, provenance:guess) vs the CoT's 'lock-in is fine' assertion. The override is permissible given the bullet's low confidence — but it must be visible per the brainstorming Conflict-Detect Integration audit-trail rule. Add an 'overridden' note to the spec citing the bullet and the driving signal."
}
```

The output is consumed by the caller (typically the `verify-claims` command or a brainstorming Phase 2 pre-converge gate). The skill does not modify the spec or block the commit.

## Anti-Patterns

- **Treating the verdict as a hard block** — this skill surfaces; it does not refuse. Hard-blocking would itself be the rationalization-trap inverted (refusing to update a decision in face of new reasoning).
- **Running on exploratory CoT with no commit** — the skill is for reasoning that lands in a load-bearing change. Throwaway exploration has no `change_text`; the input contract makes this explicit.
- **Overweighting Signal 1 alone** — long reasoning on a small change is sometimes legitimate (deep blast radius, security review). The two-or-more rule is the guardrail.
- **Adding Signal 4+ silently** — if the heuristic needs more signals, bump plugin version and update this SKILL.md. The signal set is the contract.

## Forward References

- **`verify-claims` command** (this plugin, `commands/verify-claims.md`) — invokes this skill once per load-bearing claim in a target doc/PR.
- **Brainstorming Phase 2 pre-converge gate** (commit `ebd136a` `Conflict-Detect Integration` section) — may invoke this skill before accepting a strategy pick that overrides a high-confidence bullet, as an auditable check before the surface-then-proceed step.
