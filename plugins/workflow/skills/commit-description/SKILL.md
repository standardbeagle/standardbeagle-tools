---
name: commit-description
description: "Write value-first commit message (subject + body) for staged/unstaged changes or branch work. Use when: writing commit message, about to stage changes, before commit, drafting commit body, summarizing branch work for commit. Also: writing PR description when user explicitly invokes --pr or says 'for the PR'. Returns title + body; never runs git commit / gh pr create itself."
disable-model-invocation: true
argument-hint: "[--pr | pr:NN | #NN | URL] [free-text steering]"
---

# Commit Description

Generate a conventional-commit-style subject line and a value-first body describing the work in scope. **Default mode is commit message** for the staged/unstaged diff or recent branch commits. PR description mode is opt-in.

This skill returns structured `{title, body}` to chat. It does NOT run `git commit`, `gh pr edit`, or `gh pr create`. It does NOT prompt for confirmation. The caller decides how to apply.

---

## Mode selection

Parse the input. Pick mode in this order:

| Input | Mode |
|---|---|
| `--pr`, `pr:` flag, `#NN`, full PR URL, or bare PR number | **PR mode** |
| Anything else, including empty arg or steering text | **Commit mode** (default) |

Steering text (e.g., "emphasize the perf story") is optional and combines with any mode.

**Examples:**

- `/commit-description` → commit mode, scope = staged + unstaged
- `/commit-description emphasize the cache fix` → commit mode + focus
- `/commit-description --pr` → PR mode for current branch
- `/commit-description pr:561` → PR mode for #561
- `/commit-description #561 emphasize safety` → PR #561 + focus

---

## Step 1: Resolve scope

### Commit mode (default)

Pick the scope by walking this priority:

1. **Staged changes exist** (`git diff --cached --quiet` returns nonzero) → scope = `git diff --cached`. This is the most common case: user is mid-stage, wants a message for what's about to commit.
2. **Unstaged changes only** → scope = `git diff HEAD`. Note in output that nothing is staged yet; suggest `git add -p` before commit.
3. **Working tree clean, branch has commits ahead of upstream** → scope = `git log @{upstream}..HEAD` + `git diff @{upstream}..HEAD`. Treats the un-pushed branch tip as the unit. Useful for "summarize what I've done on this branch into a single commit message" or for squash-commit drafting.
4. **No upstream configured** → fall back to `git diff main...HEAD` (or `master...HEAD` if `main` does not resolve). Report which base was used.
5. **All clean and nothing ahead** → exit gracefully: `"No changes to describe."`

Capture the commit list (when applicable) and full diff:

```bash
# Mode 1 — staged
git diff --cached --stat && git diff --cached

# Mode 2 — unstaged
git diff HEAD --stat && git diff HEAD

# Mode 3 — branch ahead of upstream
git log --oneline @{upstream}..HEAD
git diff @{upstream}..HEAD

# Mode 4 — branch ahead of main (no upstream)
BASE=$(git rev-parse --verify main 2>/dev/null && echo main || echo master)
git log --oneline ${BASE}..HEAD
git diff ${BASE}...HEAD
```

### PR mode (opt-in)

Normalize the reference into a form `gh pr view` accepts: bare number (`561`), full URL, or number extracted from `pr:561` / `#561`. For bare `--pr` with no number, use the current branch's PR.

```bash
gh pr view <pr-ref> --json number,state,title,body,baseRefName,baseRefOid,headRefName,headRefOid,commits,url
```

If `state != OPEN`, report `"PR <number> is <state>; cannot regenerate description"` and exit.

Read PR head SHA from `headRefOid`, fetch base + head, then gather diff:

```bash
PR_HEAD_SHA=<headRefOid>
git fetch --no-tags origin <baseRefName> $PR_HEAD_SHA
MERGE_BASE=$(git merge-base origin/<baseRefName> $PR_HEAD_SHA)
git log --oneline $MERGE_BASE..$PR_HEAD_SHA
git diff $MERGE_BASE...$PR_HEAD_SHA
```

If local fetch fails (shallow clone, cross-repo PR, GHES auth quirks), fall back to API-only:

```bash
gh pr diff <pr-ref>
gh pr view <pr-ref> --json commits --jq '.commits[] | [.oid[0:7], .messageHeadline] | @tsv'
```

Note the API fallback in the returned output.

Also capture the existing PR body for evidence preservation in Step 3.

---

## Step 2: Classify commits (branch / PR scope only)

When the scope spans multiple commits, classify each:

- **Feature commits** — implement the unit's purpose (new functionality, intentional refactors, design changes). These drive the message.
- **Fix-up commits** — iteration work (review fixes, lint fixes, test fixes, rebase resolutions). Invisible to the reader.

When sizing the message, mentally subtract fix-ups: 12 commits with 9 fix-ups is a 3-commit unit.

For staged/unstaged commit mode there is no commit list yet — the diff itself is the unit.

---

## Step 3: Decide on evidence

**Commit mode**: skip evidence. Commit messages don't carry image embeds. If the user has visual evidence worth preserving, surface it in PR mode later.

**PR mode**: if the existing PR body contains a `## Demo` or `## Screenshots` section with image embeds, preserve it verbatim unless steering text asks to refresh or remove. Place preserved evidence before any footer rule. Do not fabricate an evidence section. Do not label test output as "Demo".

This skill does not prompt the user to capture evidence. If the caller wants visuals, they capture separately and re-invoke this skill with updated steering, or splice the block into the returned body themselves.

---

## Step 4: Frame the narrative

Articulate the unit's frame:

1. **Before**: What was broken, limited, or missing? (One sentence.)
2. **After**: What's now possible or fixed? (One sentence.)
3. **Scope rationale** (only if 2+ separable concerns): Why ship together? (One sentence.)

For small + simple changes the "after" sentence alone may be the entire body.

---

## Step 5: Size the message

Match weight to change weight:

| Change profile | Body approach |
|---|---|
| Small + simple (typo, config, dep bump) | 1-2 sentences. No headers. Often subject line is enough — empty body is fine. |
| Small + non-trivial (bugfix, behavioral change) | 3-5 sentences. No headers unless two distinct concerns. |
| Medium feature or refactor | Narrative frame (before/after/scope), then what changed and why. Call out design decisions. |
| Large or architecturally significant | Full narrative: problem context, approach (and why), key decisions, migration/rollback if relevant. |
| Performance change | Include before/after measurements if available. |

When in doubt, shorter. **Commit messages should be tighter than PR descriptions** — readers are scrolling `git log`, not landing on a review page.

---

## Step 6: Apply writing principles

### Voice

- Active voice. No em dashes or `--` substitutes; use periods, commas, colons, parentheses.
- Vary sentence length. Never three similar-length sentences in a row.
- Plain English. Technical jargon fine; business jargon never.
- No filler: "it's worth noting", "importantly", "essentially", "in order to", "leverage", "utilize."
- Digits for numbers ("3 files"), not words ("three files").
- Imperative mood for the subject line ("add cache layer", not "added cache layer").

### Principles

- **Lead with value**: Open with what's now possible or fixed, not what was moved around. Subtler failure: leading with mechanism ("Replace the hardcoded capture block with a tiered skill") instead of outcome ("Evidence capture now works for CLI tools and libraries, not just web apps").
- **Describe net result, not the journey**: Cover the end state, not how you got there. No iteration history, debugging detours, intermediate failures, or bugs found and fixed mid-development. Exception: process detail critical to understanding a design choice.
- **Trust the final diff over the commit list**: When intermediate commits describe steps later revised or reverted, describe the end state from the full diff.
- **Explain the non-obvious**: If the diff is self-explanatory, don't narrate it. Spend space on why this approach, what was rejected, what the reader should watch.
- **Use structure when it earns its keep**: Headers, bullets, tables aid comprehension; not mandatory template sections. Commit bodies use them sparingly.
- **No empty sections**: Omit, don't write "N/A".
- **Test plan — only when non-obvious**: Include for tricky edge cases or hard-to-verify behavior. Omit when "run the tests" is the only useful guidance. PR mode only; commit messages skip test plans by default.

### Commit-mode specifics

- **Subject line**: under 72 chars, imperative, lowercase, no trailing period. Conventional-commit prefix.
- **Body wrap**: 72 chars per line. Blank line between subject and body.
- **No badges**: skip the Compound Engineering badge in commit-mode output.
- **No GitHub-flavored markdown that breaks plain `git log`**: tables and Mermaid render badly in `git log --oneline` previews, so reserve them for PR mode.

### Visual communication (PR mode)

Include a visual aid only when the change is structurally complex enough that prose alone leaves the reader reconstructing the mental model.

- **Mermaid** when the change has **topology** (components with directed relationships — calls, flows, dependencies, state transitions).
- **Markdown table** when the change has **parallel variation of one shape** (N items sharing attributes, differing in values — before/after measurements, option trade-offs, flag matrices).

Architecture changes are almost always topology → Mermaid is usually right. A table of "components that interact" loses the edges.

Skip any visual when sizing routes to "1-2 sentences", prose already communicates clearly, the diagram restates the diff visually, or the change is mechanical (rename, dep bump, formatting).

Format details: Mermaid `TB` direction, 5-10 nodes typical (up to 15 for genuinely complex changes), source readable as fallback. ASCII for annotated flows needing rich in-box content, 80-column max. Place inline at point of relevance. Prose is authoritative when it conflicts with a visual.

### Numbering and references

Never prefix list items with `#` in PR descriptions — GitHub auto-links `#1`, `#2` as issue references. Use `org/repo#123` or full URLs for real references.

### Applying the focus hint

If steering text was provided, incorporate alongside the diff-derived narrative. Steering, not override: do not invent content the diff doesn't support, do not suppress important content the diff demands. When steering and diff materially disagree, note the conflict in the output rather than fabricating.

---

## Step 7: Compose the title

Format: `type: description` or `type(scope): description`.

- **Type** by intent, not file extension: `feat`, `fix`, `refactor`, `docs`, `chore`, `perf`, `test`.
- **Scope** (optional): narrowest useful label — skill or agent name, CLI area, shared label. Omit when no single label adds clarity.
- **Description**: imperative, lowercase, under 72 chars total, no trailing period.
- Match recent commit titles in the repo if a convention is visible.
- Breaking changes: `feat!: ...` or `BREAKING CHANGE:` footer in the body.

---

## Step 8: Compose the body

### Commit-mode body order

1. **Opening** — narrative frame from Step 4 at depth chosen in Step 5. Bare paragraph; no `## Summary` heading.
2. **Body sections** (only if earning their keep) — what changed and why, design decisions. Bullets fine; tables/Mermaid skipped.
3. **Footer** — optional `Refs:` / `Closes:` / `BREAKING CHANGE:` lines.

Skip evidence blocks, badge, and `## Test plan` headings entirely in commit mode.

### PR-mode body order

1. **Opening** — narrative frame. Under `## Summary` heading if the body uses any other `##` headings; bare paragraph otherwise.
2. **Body sections** — only sections that earn their keep: what changed and why, design decisions, tables for data, visual aids when complexity warrants.
3. **Test plan** — only when non-obvious.
4. **Evidence block** — preserved from Step 3 only. Never fabricate.
5. **No badge by default** — this fork drops the Compound Engineering badge. Re-add only if the user explicitly asks.

---

## Step 9: Return `{title, body}`

Format the return as a clearly labeled block in chat:

```
=== TITLE ===
<title line>

=== BODY ===
<body markdown>
```

**Default**: write to chat. Caller decides how to apply.

**On request**, also offer to write to a file. Useful targets:

- `.git/COMMIT_EDITMSG` — picked up by `git commit` (no `-m`) as the editor's prefilled template
- A path the user names (e.g., `/tmp/commit-msg.txt` for review before committing)

PR-mode body output appears only when PR mode was selected in Step 1. Never write to a PR via `gh pr edit` / `gh pr create` from this skill.

If Step 1 exited gracefully (clean tree, closed PR, empty diff), return no title or body — just the reason string.

---

## Notes

- **Primary harness**: Claude Code. Other harnesses (Codex, Gemini CLI) can run this skill, but the steps above assume Claude Code semantics for tool invocation.
- **Knowledge capture**: when a commit body teaches a non-obvious design decision worth preserving beyond `git log` (e.g., "we rejected approach X because Y"), consider also adding a short note to project memory or `docs/solutions/` separately. This skill does not write those files itself.
- **No interactive prompts**: if the diff is ambiguous about something the caller should decide (focus conflicts with diff, evidence technically capturable but not pre-staged), surface the ambiguity in the returned output. Callers that need to ask the user own that flow.
