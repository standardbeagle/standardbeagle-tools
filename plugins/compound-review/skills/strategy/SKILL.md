---
name: strategy
description: "Create or maintain STRATEGY.md — product target problem, approach, users, key metrics, tracks of work. Use when: starting new product, updating direction, 'write our strategy', 'update roadmap', 'what are we working on'. Also: ce-ideate/brainstorm/plan need upstream grounding without strategy doc. Skip: implementation planning (use plan), feature spec (use brainstorm)."
disable-model-invocation: true
argument-hint: "[optional section to revisit, e.g. 'metrics' or 'approach']"
---

# Product Strategy

**Note: current year is 2026.** Use when dating strategy doc.

`strategy` produces and maintains `STRATEGY.md` — short durable anchor doc capturing what product is, who it serves, how it succeeds, where team invests. Lives at repo root, peer of `README.md`. Downstream skills (ideate, brainstorm, plan) read it as grounding when present.

Doc is short and structured on purpose. Sharp answers to a handful of pointed questions beat any amount of prose. This skill asks those questions, pushes back on weak answers, writes the doc.

## Interaction Method

Default to `AskUserQuestion` (Claude Code). Call `ToolSearch` with `select:AskUserQuestion` first if schema not loaded. Fallback: numbered options in chat if blocking tool errors. Never silently skip the question.

Ask one question at a time. Free-form for substantive sections (problem, approach, persona); single-select for routing (which section to revisit). Each option label self-contained.

## Focus Hint

<focus_hint> #$ARGUMENTS </focus_hint>

Argument = optional focus: section name (`metrics`, `approach`, `tracks`) or scope hint. No argument → proceed open-ended, file state decides path.

## Core Principles

1. **Anchor, not plan.** Strategy = what product is and why. Features → brainstorm; schedules → issue tracker. Don't let either creep in.
2. **Rigor in questions, not headings.** Plain English headers. Interview questions enforce strategy discipline.
3. **Short is a feature.** Constrained template. Adding sections costs more than it looks. Push back on expansion.
4. **Durable across runs.** Rerunnable. Second run updates in place, preserves what works, only challenges stale/weak sections.

## Execution Flow

### Phase 0: Route by File State

Read `STRATEGY.md` (native file-read tool).

- **File missing** → first run → Phase 1
- **File exists, argument names section** → targeted update → Phase 2
- **File exists, no argument** → ask which sections to revisit → Phase 2

Announce path one line: "Strategy doc not found — let's write it." or "Found existing strategy — let's review and update."

### Phase 1: First-Run Interview

Read `references/interview.md`. Non-optional load — pushback rules, anti-pattern examples, quality bar live there. Improvising from memory produces passive transcription, not strategy doc.

Run interview in section order:

1. Target problem
2. Our approach
3. Who it's for
4. Key metrics
5. Tracks
6. Milestones (optional)
7. Not working on (optional)
8. Marketing (optional)

Each section: ask opening question, apply pushback, capture in user's own language. Don't skip pushback — core of skill. Two rounds max per section; capture what user gave after that, note section worth revisiting next run.

All required sections (1-5) captured → read `references/strategy-template.md`, fill it, present full draft in chat before writing. Offer one round of edits. Then write `STRATEGY.md`.

### Phase 2: Update Run

Read existing `STRATEGY.md` thoroughly. Summarize current state in 3-5 lines so user sees what's on file.

Argument named section → jump there in `references/interview.md`. Preserve other sections exactly. Apply pushback as if first run — don't rubber-stamp existing weak content.

No specific target → ask user which section via blocking tool. Options:
- "Target problem"
- "Our approach"
- "Who it's for"
- "Metrics, tracks, or other"

Each revisited section: re-interview with full pushback. User confirms still accurate → leave untouched. Update `last_updated` in YAML frontmatter to today's ISO date.

Write updated doc back to `STRATEGY.md`.

### Phase 3: Downstream Handoff

After write, note one line where file lives, that ideate/brainstorm/plan will pick it up as grounding next run.

No downstream skill ran yet on repo → suggest ideate or brainstorm as next step.

## What This Skill Does Not Do

- Doesn't update issue tracker or reconcile in-flight work. Strategy = doc; execution lives elsewhere.
- Doesn't prioritize backlog. Separate workflow.
- Doesn't write product requirements or implementation plans — that's brainstorm and plan.
- Doesn't compute metric values. Records which metrics matter and where they live, not what they read today.

## Learn More

"Target problem / Our approach / Tracks" structure informed by Richard Rumelt's *Good Strategy Bad Strategy* — kernel of diagnosis, guiding policy, coherent action. Interview questions in `references/interview.md` push past "bad strategy" patterns: fluff, goals dressed as strategy, feature lists as guiding choice. Recommended reading if slogan-vs-strategy distinction not yet sharp.
