# PR Mode (secondary)

Read this reference when Mode Detection routes to **PR Full** or **PR Targeted** — input is a PR number or a GitHub comment/thread URL, OR no local reviewer output exists and the current branch has an open PR.

This is the secondary flow. Local-reviewer output is the primary path (see `local-mode.md`). Use PR mode when:

- A teammate's PR review needs to be processed
- A bot reviewer (CodeRabbit, Codex, Gemini Code Assist, Copilot) posted feedback on a PR
- The user explicitly passes a PR number / URL

Pipeline shape mirrors local mode (triage → cluster gate → parallel dispatch → validate → commit → reply/resolve → verify → summary). Differences are I/O — GitHub GraphQL via the bundled scripts.

## 1. Fetch Unresolved Threads

If no PR number was given, detect from the current branch:

```bash
gh pr view --json number -q .number
```

Then fetch all feedback via [scripts/get-pr-comments](../scripts/get-pr-comments):

```bash
bash scripts/get-pr-comments PR_NUMBER
```

Returns a JSON object with four keys:

| Key | Contents | Has file/line? | Resolvable? |
|-----|----------|---------------|-------------|
| `review_threads` | Unresolved inline review threads (includes outdated; each carries `isOutdated`) | Yes | Yes (GraphQL) |
| `pr_comments` | Top-level PR conversation comments (excludes PR author + CI bots) | No | No |
| `review_bodies` | Review submission bodies with non-empty text (same filtering) | No | No |
| `cross_invocation` | `signal` flag + last 10 resolved threads for cluster analysis | — | — |

The script paginates each top-level connection (`reviewThreads`, `comments`, `reviews`) independently because `gh api graphql --paginate` only follows the outermost `pageInfo` per response. Combining them silently dropped page 2+ on long-lived PRs.

If the script fails:

```bash
gh pr view PR_NUMBER --json reviews,comments
gh api repos/{owner}/{repo}/pulls/PR_NUMBER/comments
```

## 2. Triage: Separate New from Pending

Same logic as local mode, mapped to PR objects.

**Review threads**: read the thread's comments. A substantive deferral reply (e.g. "need to align on this", "going to think through this", or options-without-decision) is a **pending decision** — don't re-process. Original reviewer comment(s) only → **new**.

**PR comments and review bodies**: no resolve mechanism, so they reappear every run. Two filters in order:

1. **Actionability**: drop wrappers, approvals, status badges, CI summaries with no follow-up. Silent drop — do not announce, list, or count.
2. **Already replied**: check the PR conversation for an existing reply that quotes and addresses the feedback. If yes, skip. If no, it's new.

Bot wrappers from CodeRabbit, Codex, Gemini, Copilot ("Here are some automated review suggestions...") commonly appear. Recognize by content, drop silently. CI/status bots like Codecov are pre-filtered at the script level. Everything else relies on this content-aware check so bot format changes can't silently hide actionable findings.

If no new items across all feedback types, skip steps 3–9 and go to step 10.

## 3. Cross-Invocation Cluster Analysis (Gated)

Two stages, both must pass or skip to step 4:

1. **Signal**: `cross_invocation.signal == true` (resolved threads exist alongside new ones; first-round reviews always fail this).
2. **Spatial overlap**: at least one new `review_thread` shares an exact file path or directory subtree with a thread in `cross_invocation.resolved_threads`. Path comparison only — no category inference, no LLM calls. Skip stage 2 if resolved threads lack file paths; the signal stage governs alone.

Only inline `review_threads` participate in the precheck. `pr_comments` and `review_bodies` lack file paths and are always dispatched individually.

Single-round clustering (grouping new-only threads by theme + proximity within one review) is deliberately not performed — false-positive rate too high. First-round "one helper would fix all of these" opportunities are handled as individual fixes until repeated reviewer evidence promotes the pattern into cross-invocation mode.

If both gates pass, build clusters by `(category, spatial proximity)`. Categories: `error-handling`, `validation`, `type-safety`, `naming`, `performance`, `testing`, `security`, `documentation`, `style`, `architecture`, `other`. A cluster requires **at least one previously-resolved thread**.

Cluster brief format:

```xml
<cluster-brief>
  <theme>[concern category]</theme>
  <area>[common directory path]</area>
  <files>[comma-separated file paths]</files>
  <threads>[comma-separated new thread/comment IDs]</threads>
  <hypothesis>[one sentence about the deeper issue]</hypothesis>
  <prior-resolutions>
    <thread id="PRRT_..." path="..." category="..."/>
  </prior-resolutions>
</cluster-brief>
```

`<prior-resolutions>` is always present and lists previously-resolved threads in the cluster — IDs, paths, categories. Gives the resolver the full cross-round picture.

Items not in any cluster stay individual. Previously-resolved threads that don't cluster are dropped — they only contributed signal.

## 4. Plan

Task list of new unresolved items grouped by type. Include cluster items alongside individual items.

## 5. Implement (PARALLEL)

Process all three feedback types. Review threads are primary; `pr_comments` and `review_bodies` are secondary but should not be ignored.

### Dispatch boundary

Previously-resolved threads (from `cross_invocation.resolved_threads`) appear only as cluster context. Never individually dispatched.

### Individual dispatch

**Review threads**: spawn a resolver subagent per new non-clustered thread. Each receives:

- Thread ID
- File path + location fields: `line`, `originalLine`, `startLine`, `originalStartLine` (any can be null; outdated and file-level threads often have `line == null` and must fall back to `originalLine`)
- Full comment text (all comments in the thread)
- PR number
- Feedback type: `review_thread`
- `isOutdated` flag — line may have drifted since the thread was opened

**PR comments and review bodies**: no file/line context. Spawn a resolver per actionable non-clustered item. Agent receives comment ID, body text, PR number, feedback type (`pr_comment` or `review_body`). Agent must identify relevant files from the comment text and PR diff.

### Cluster dispatch

For each cluster, dispatch ONE resolver receiving the `<cluster-brief>` plus all thread details. Cluster agent reads the broader area before targeted fixes. Returns one record per thread plus `cluster_assessment`.

### Agent return format

Each agent returns:

- **verdict**: `fixed` / `fixed-differently` / `replied` / `not-addressing` / `declined` / `needs-human`
- **feedback_id**: thread ID or comment ID
- **feedback_type**: `review_thread` / `pr_comment` / `review_body`
- **reply_text**: markdown reply quoting the relevant feedback
- **files_changed**: list of files modified
- **reason**: brief explanation

Cluster agents additionally return **cluster_assessment**.

### Batching and conflict avoidance

Clusters count as 1 dispatch unit. 1–4 units → all parallel. 5+ units → batch in groups of 4.

No two units touching the same file run in parallel. Check file overlaps across all units before dispatch; serialize overlapping ones. Non-overlapping units can still run in parallel. Within a unit handling multiple threads on one file, the agent addresses them sequentially.

Sequential fallback: cluster units first (higher leverage), then individual items.

Fixes can occasionally expand beyond their referenced file (renaming a method updates callers). Step 6 (combined validation) catches test breakage; step 9 (verify) catches unresolved threads. If either surfaces inconsistent changes from parallel fixes, re-run affected agents sequentially.

## 6. Validate Combined State

Aggregate `files_changed`. Empty → skip steps 6–7, go to step 8.

Run project validation **once** against the combined diff:

- Green → step 7.
- Red, failures touch resolver-changed files → one inline diagnose-and-fix pass. Re-run. Still red → escalate `needs-human` with output; do **not** commit.
- Red, failures only in untouched files → pre-existing. Proceed, footer the commit: `Note: pre-existing failure in <test> not addressed by this PR.`

Record outcome for step 10.

## 7. Commit and Push

Stage only files reported by sub-agents. Keep commits atomic — if resolutions span unrelated concerns, split into one commit per logical unit rather than a single lumped commit:

```bash
git add [files from agent summaries]
git commit -m "Address PR review feedback (#PR_NUMBER)

- [list changes from agent summaries]"
```

Push:

```bash
git push
```

## 8. Reply and Resolve

After push succeeds, post replies and resolve where applicable.

### Reply format

Quote the relevant part of the original feedback for continuity. Quote the specific sentence being addressed, not the entire comment if long.

Fixed:

```markdown
> [quoted relevant part]

Addressed: [brief description of the fix]
```

Not addressing:

```markdown
> [quoted relevant part]

Not addressing: [reason with evidence, e.g., "null check already exists at line 85"]
```

Declined:

```markdown
> [quoted relevant part]

Declined: [specific harm cited, e.g., "this would add a defensive null check the type system already guarantees"]
```

For `needs-human`, post the reply but do NOT resolve. Leave open for human input.

### Review threads

Reply via [scripts/reply-to-pr-thread](../scripts/reply-to-pr-thread):

```bash
echo "REPLY_TEXT" | bash scripts/reply-to-pr-thread THREAD_ID
```

Resolve via [scripts/resolve-pr-thread](../scripts/resolve-pr-thread):

```bash
bash scripts/resolve-pr-thread THREAD_ID
```

### PR comments and review bodies

No GraphQL resolve. Reply with a top-level PR comment quoting the original:

```bash
gh pr comment PR_NUMBER --body "REPLY_TEXT"
```

Include enough quoted context that the reader can follow without scrolling.

## 9. Verify

Re-fetch:

```bash
bash scripts/get-pr-comments PR_NUMBER
```

`review_threads` should be empty (except `needs-human` items).

If new threads remain, check iteration count:

- **First or second fix-verify cycle**: repeat from step 2. Re-fetch picks up newly-resolved threads in `cross_invocation.resolved_threads`, so the cross-invocation gate fires naturally.
- **After the second cycle**: stop. Surface the pattern to the user — "Multiple rounds of feedback on [area/theme] suggest a deeper issue. Here's what we've fixed so far and what keeps appearing." Use the `needs-human` escalation pattern.

`pr_comments` and `review_bodies` always reappear — verify replies were posted by checking the PR conversation.

## 10. Summary

Same shape as local mode (see `local-mode.md` step 10). Group by verdict, one line per item describing *what was done*. Append cluster investigations and `needs-human` decisions if any.

Use `AskUserQuestion` for blocking decisions if available (call `ToolSearch` with `select:AskUserQuestion` first if needed). Fall back to inline conversation only when no blocking tool exists. Never silently skip — `needs-human` threads stay open on the PR for later handling.

---

## Targeted Mode (single thread)

When the argument is a comment URL: `https://github.com/OWNER/REPO/pull/NUMBER#discussion_rCOMMENT_ID`.

### 1. Extract Thread Context

REST fetch comment details + GraphQL node ID:

```bash
gh api repos/OWNER/REPO/pulls/comments/COMMENT_ID \
  --jq '{node_id, path, line, body}'
```

Map to thread via [scripts/get-thread-for-comment](../scripts/get-thread-for-comment):

```bash
bash scripts/get-thread-for-comment PR_NUMBER COMMENT_NODE_ID [OWNER/REPO]
```

Fetches thread IDs and first-comment IDs (minimal fields), returns the matching thread with full comment details.

### 2. Fix, Reply, Resolve

Spawn one resolver subagent for the thread. Pass the same fields full mode does — `isOutdated` and location fields (`line`, `originalLine`, `startLine`, `originalStartLine`). Targeted threads can be outdated too. Then validate → commit → push → reply → resolve (steps 6–8 above).
