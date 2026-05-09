---
name: debug
description: "Systematically find root causes and fix bugs. Use when: debugging errors, investigating test failures, reproducing bugs from issue trackers (GitHub/Linear/Jira), stuck after failed fixes, 'debug this', 'why is this failing', 'fix this bug', 'trace this error', stack-trace paste. Skip: feature design (use brainstorm), architecture redesign."
disable-model-invocation: true
argument-hint: "[issue ref, error message, test path, or description of broken behavior]"
---

# Debug and Fix

Find root causes, then fix them. Investigates bugs systematically — full causal chain before proposing fix — optionally implements fix with test-first discipline.

<bug_description> #$ARGUMENTS </bug_description>

## Core Principles

1. **Investigate before fixing.** No fix proposal until full causal chain explained from trigger to symptom with no gaps. "Somehow X leads to Y" = gap.
2. **Predictions for uncertain links.** Causal chain has uncertain/non-obvious link → form prediction (something in different code path or scenario that must also be true). Prediction wrong but fix "works" → found symptom not cause. Obvious chain (missing import, clear null reference) → chain explanation sufficient.
3. **One change at a time.** Test one hypothesis, change one thing. Changing multiple things to "see if it helps" → stop. Shotgun debugging.
4. **Stuck → diagnose why. Don't try harder.**

## Execution Flow

| Phase | Name | Purpose |
|-------|------|---------|
| 0 | Triage | Parse input, fetch issue if referenced, proceed to investigation |
| 1 | Investigate | Reproduce bug, trace code path |
| 2 | Root Cause | Hypotheses with predictions, test, **causal chain gate**, smart escalation |
| 3 | Fix | Only if user chose to fix. Test-first with workspace safety checks |
| 4 | Handoff | Structured summary, prompt for next action |

Beyond Phase 0 trivial-bug fast-path, no further phase skipping. Complex bugs spend more time in each phase naturally.

---

### Phase 0: Triage

Parse input, reach clear problem statement.

**Input references issue tracker** → fetch:
- GitHub (`#123`, `org/repo#123`, github.com URL): parse from `<bug_description>`, fetch `gh issue view <number> --json title,body,comments,labels`. URLs → pass directly to `gh`.
- Other trackers (Linear URL/ID, Jira URL/key, any tracker URL): use available MCP tools or fetch URL content. Fetch fails (auth, missing tool, non-public) → ask user to paste issue content. Ensure full comment thread, not just opening.

Read full conversation — original description AND every comment, especially latest. Comments often contain updated repro steps, narrowed scope, prior failed attempts, additional traces, or pivot to different suspected cause. Treating opening post as whole picture often misroutes investigation. Extract symptoms, expected behavior, repro steps, environment from combined thread. Proceed to Phase 1.

**Everything else** (stack traces, test paths, error messages, behavior descriptions): problem statement = input itself.

**Trivial-bug fast-path:** Once problem clear, decide if framework needed. Cause immediately readable (single-file typo, missing import, obvious null deref or off-by-one with one-line fix) and verification doesn't require deep tracing → present cause + proposed one-line fix, run Phase 2's **Fix it now / Diagnosis only** user-choice gate before editing. Fast-path saves investigation ceremony, not user's choice over fix application. User picks fix → run Phase 3's workspace + branch check (uncommitted-work confirmation, default-branch creation prompt), apply fix, leave one-line note explaining cause, skip to Phase 4 summary. Diagnosis only → write summary, stop. In doubt → run full framework. Wrong root cause costs more than ceremony minutes.

**Otherwise** → Phase 1.

**Questions:**
- Don't ask by default → investigate first (read code, run tests, trace errors)
- Ask only when genuine ambiguity blocks investigation and can't resolve by reading code or running tests
- Asking → one specific question

**Prior-attempt awareness:** User indicates prior failed attempts ("I've been trying", "keeps failing", "stuck") → ask what they tried before investigating. Avoids repeating failed approaches. One of few cases where asking first is right.

---

### Phase 1: Investigate

#### 1.1 Reproduce the bug

Confirm bug exists, understand behavior. Run test, trigger error, follow reported repro — whatever matches input.

- **Browser bugs:** Prefer `agnt` if installed. Otherwise: MCP browser tools, direct URL testing, screenshot capture.
- **Manual setup required:** Reproduction needs specific conditions agent can't create alone (data states, user roles, external services, env config) → document exact setup steps, guide user through. Clear step-by-step saves time even when fully manual.
- **Doesn't reproduce after 2-3 attempts:** Read `references/investigation-techniques.md` for intermittent-bug techniques.
- **Cannot reproduce in this environment:** Document what tried, missing conditions.
- **Writing reproduction test:** Project has testing-conventions guidance (dedicated testing skill, `AGENTS.md`/`CLAUDE.md` testing section, clear style across existing tests) → apply when authoring failing test. Otherwise minimal isolated test failing on current bug, passing once corrected. Name descriptively so failure message itself explains bug.

#### 1.2 Verify environment sanity

Before deep tracing, confirm environment is what you think:
- Correct branch checked out; no unintended uncommitted changes
- Dependencies installed and up to date (`bun install`, `npm install`, `bundle install`) — stale `node_modules`/`vendor` is frequent false lead
- Expected interpreter/runtime version (`.tool-versions`, `.nvmrc`, `Gemfile` vs actual active)
- Required env vars present and non-empty
- No stale build artifacts (`dist/`, `.next/`, compiled binaries from earlier branch)
- Dependent local services (DB, cache, queue) running at expected versions *when bug plausibly involves them*

#### 1.3 Trace the code path

Trace data flow backward from symptom to where valid state first became invalid. Read code-shape to form hypothesis, verify with observed values. Don't theorize from code alone.

Recipe:
1. Read stack trace bottom-to-top, opening each frame's source. Bottom frame = symptom; root cause upstream.
2. Identify first frame where input data already invalid — upper bound on where to look.
3. Instrument boundaries around that frame: targeted log/print, debugger breakpoints, test assertions capturing *actual* values at function entry/exit. Assumed values lie. Observed values don't.
4. Walk boundaries until valid input becomes invalid output. Transition = root cause site.

Don't stop at first function that looks wrong. Root cause = where bad state originates, not where first observed.

As you trace:
- Check recent changes in files: `git log --oneline -10 -- [file]`
- Bug looks like regression ("worked before") → use `git bisect` (see `references/investigation-techniques.md`)
- Check project observability tools for additional evidence:
  - Error trackers (Sentry, AppSignal, Datadog, BetterStack, Bugsnag)
  - Application logs
  - Browser console output
  - Database state
- Each project has different systems. Use whatever gives more complete picture.

---

### Phase 2: Root Cause

*Reminder: investigate before fixing. No fix proposal until full causal chain explained with no gaps.*

Read `references/anti-patterns.md` before forming hypotheses. Stop and re-examine if internal monologue contains:
- "Quick fix for now, investigate later"
- "This should work" (without tested prediction)
- "Let me just try..." (without hypothesis)

Phrases mark mode-drift toward symptom patches, not progress on root cause.

**Assumption audit (before hypothesis formation):** List concrete "this must be true" beliefs your understanding depends on — framework behaves as expected here, function returns what name implies, config loads before this runs, caller passes non-null, DB in state test implies. Mark each *verified* (read code, checked state, ran it) or *assumed*. Assumptions = most common stuck-debugging source. Many "wrong hypotheses" are correct hypotheses tested against wrong assumption.

**Form hypotheses** ranked by likelihood. Each:
- What is wrong and where (file:line)
- **At least one concrete observation supporting it** — runtime variable value, log line, instrumented boundary capture, behavior delta against working comparison case, specific code reference. "X seems off" ≠ evidence. "X equals null at line 42 because Y was never initialized in constructor path running under condition Z" = evidence. Hypotheses without grounding observations = theorizing → back to Phase 1, instrument.
- Causal chain: trigger → observed symptom, step by step
- **Uncertain links in chain**: prediction — something in different code path or scenario that must also be true if link correct

Causal chain obvious, no uncertain links (missing import, clear type error, explicit null deref) → chain explanation = gate, no prediction required. Predictions = tool for testing uncertain links, not ritual for every hypothesis.

Before forming new hypothesis, review what's already ruled out and why.

**Causal chain gate:** No Phase 3 until full causal chain explainable — original trigger through every step to observed symptom — no gaps. User can explicitly authorize proceeding with best-available hypothesis if investigation stuck.

*Reminder: prediction wrong but fix appears to work → found symptom. Real cause still active.*

#### Present findings

Root cause confirmed → present:
- Root cause (causal chain summary with file:line refs)
- Proposed fix and which files would change
- Tests to add/modify preventing recurrence (specific test file, test case description, what assertion verifies)
- Whether existing tests should have caught this and why didn't

Then offer next steps via `AskUserQuestion` (call `ToolSearch` with `select:AskUserQuestion` first if schema not loaded). Fall back to numbered options only if blocking tool errors. Never silently skip.

Options:
1. **Fix it now** — proceed Phase 3
2. **Diagnosis only — I'll take it from here** — skip fix, go to Phase 4 summary, end
3. **Rethink the design** — only when root cause reveals design problem (see below)

Don't assume user wants action right now. Test recommendations part of diagnosis regardless of path.

**When to suggest brainstorm:** Only when investigation reveals bug can't be properly fixed within current design. Concrete signals:
- **Root cause = wrong responsibility or interface**, not wrong logic. Module shouldn't be doing this at all, or boundary between components in wrong place. (Observable: fix requires moving responsibility between modules, not correcting code within one.)
- **Requirements wrong or incomplete.** System behaves as designed but design doesn't match user need. "Bug" really product gap. (Observable: code doing exactly what written to do — spec is problem.)
- **Every fix is a workaround.** Can patch symptom but can't articulate clean fix because surrounding code built on assumption no longer holds. (Observable: keep wanting special cases or flags rather than direct correction.)

Don't suggest brainstorm for bugs that are large but have clear fix. Size alone ≠ design problem.

#### Smart escalation

2-3 hypotheses exhausted without confirmation → diagnose why:

| Pattern | Diagnosis | Next move |
|---------|-----------|-----------|
| Hypotheses point to different subsystems | Architecture/design problem, not localized bug | Present findings, suggest brainstorm |
| Evidence contradicts itself | Wrong mental model of code | Step back, re-read code path without assumptions |
| Works locally, fails in CI/prod | Environment problem | Focus on env differences, config, deps, timing |
| Fix works but prediction wrong | Symptom fix, not root cause | Real cause still active — keep investigating |

**Parallel investigation option:** Hypotheses evidence-bottlenecked across clearly independent subsystems → dispatch read-only sub-agents in parallel, each with explicit hypothesis + structured evidence-return format. No code edits by sub-agents. Skip when hypotheses depend on each other's outcomes. Platform doesn't support parallel dispatch → run same hypothesis probes sequentially in ranked-likelihood order.

Present diagnosis to user before proceeding.

---

### Phase 3: Fix

*Reminder: one change at a time. Changing multiple things → stop.*

User chose "Diagnosis only" at end of Phase 2 → skip phase, go to Phase 4 summary. Skill's job was diagnosis. "Rethink the design" → control transferred to brainstorm, skill ends.

**Workspace and branch check:** Before editing files:
- Check uncommitted changes (`git status`). User has unstaged work in files needing modification → confirm before editing. Don't overwrite in-progress changes.
- Current branch is default branch → ask whether to create feature branch first via `AskUserQuestion`. Detect default: compare against `main`, `master`, or `git rev-parse --abbrev-ref origin/HEAD` with `origin/` prefix stripped (raw output is `origin/<name>`, unstripped comparison never matches local branch). Default to creating; derive name from bug, run `git checkout -b <name>`. Other branch → proceed.

**Test-first:**
1. Write failing test capturing bug (or use existing failing test)
2. Verify it fails for right reason — root cause, not unrelated setup
3. Implement minimal fix — root cause and nothing else. No drive-by refactors, formatting, unrelated cleanup bundled into bug-fix change. Separate commits.
4. Verify test passes
5. Run broader test suite for regressions
6. Self-review diff before declaring done: read every changed line, check for style violations, missed edge cases, regressions in adjacent behavior, missing test coverage. Non-trivial fixes (multiple files, risky surface area) → also run `/review` (Claude Code lightweight review). Not full multi-agent code review — that's PR-tier, oversized for single bug fix.

**Failed fix:** return to Phase 2 and *explicitly invalidate current hypothesis* before forming new one. State out loud what evidence ruled out prior hypothesis, then form new one with own grounding observation and prediction. Don't retry variants of same theory ("maybe it was the other branch", "let me also catch this case") — rationalization spiral, not iteration.

**3 failed fix attempts = smart escalation.** Diagnose using same table from Phase 2. Fixes keep failing → root cause identification likely wrong. Return to Phase 2.

**Conditional defense-in-depth** (trigger: grep for root-cause pattern found 3+ other files OR bug would have been catastrophic in production): Read `references/defense-in-depth.md` for four-layer model (entry validation, invariant check, environment guard, diagnostic breadcrumb). Choose which layers apply. Skip when root cause one-off error with no realistic recurrence path.

**Conditional post-mortem** (trigger: bug was in production OR pattern appears 3+ locations): analyze how introduced and what allowed it to survive. Note systemic gap or repeated pattern — informs Phase 4 decision on offering learning capture.

---

### Phase 4: Handoff

**Structured summary** — always write first:

```
## Debug Summary
**Problem**: [what was broken]
**Root Cause**: [full causal chain, file:line refs]
**Recommended Tests**: [tests to add/modify, specific file + assertion guidance]
**Fix**: [what was changed — or "diagnosis only" if Phase 3 skipped]
**Prevention**: [test coverage added; defense-in-depth if applicable]
**Confidence**: [High/Medium/Low]
```

**Phase 3 skipped** (user chose "Diagnosis only" in Phase 2) → stop after summary. User said taking from here. Don't prompt.

**Phase 3 ran** → next move depends on whether skill created branch in Phase 3.

#### Skill-owned branch (created in Phase 3): default to commit-and-PR without prompting

1. **Check contextual overrides first.** Original prompt, loaded memories, user/repo `AGENTS.md` or `CLAUDE.md` for preferences conflicting with auto commit-and-PR — "always review before pushing", "open PRs as drafts", "don't open PRs from skills". Signal must be explicit instruction or clearly applicable rule, not vague tonal cue. Any apply → honor them. Switch to pre-existing-branch menu below or skip PR step entirely.
2. **Briefly preview what will happen** — what will be committed, on what branch, that PR will be opened — proceed without waiting for confirmation. Preview exists so user can interrupt; not blocking question. Format/length your call. Keep scannable.
3. **Run commit-push-pr workflow.** Entry came from issue tracker → include appropriate auto-close syntax for that tracker (most parse PR descriptions: `Fixes #N` GitHub, `Closes ABC-123` Linear; some only parse commit messages: Jira Smart Commits) so diagnosis and fix flow back to issue and close on merge. Surface resulting PR URL.

#### Pre-existing branch (skill did not create): ask user

Use `AskUserQuestion`. Options:
1. **Commit and open a PR** — default for most cases
2. **Commit the fix** — local commit only
3. **Stop here** — user takes from there

#### After PR open (either path): consider learning capture

Most bugs are localized mechanical fixes (typo, missed null check, missing import) where only "lesson" is bug itself. Compounding clutters `docs/solutions/` without adding value. Decide:
- **Skip silently** when fix mechanical, no generalizable insight. Default in doubt.
- **Offer neutrally** when lesson stateable in one sentence — "X.foo() returns T | undefined when Y, not just T", "diagnostic path was non-obvious worth recording". Can't articulate lesson → skip.
- **Lean into offer** when pattern appears 3+ locations OR root cause reveals wrong assumption about shared dependency, framework, or convention other code likely repeats.

Offering → use `AskUserQuestion`. User accepts → run compound learning capture, commit resulting learning doc to same branch, push so open PR picks up new commit.
