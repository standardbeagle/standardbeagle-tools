# Local Mode (primary)

Read this reference when Mode Detection routes to **Local Full** or **Local Targeted** — input is a local reviewer output file, pasted findings, or blank (auto-discovered latest reviewer file).

This is the primary flow: pre-commit, no remote round-trip. The structure mirrors PR mode (see `pr-mode.md`) — same triage, parallel dispatch, validate, record-resolution pipeline — but the I/O is files on disk, not GitHub GraphQL.

## 1. Locate Reviewer Output

If the user passed a path or pasted findings, use that directly.

Otherwise auto-detect latest reviewer output, in this priority order:
1. `.dart/verdicts/*.md` — most recent by mtime
2. `.dartai/reports/**/*.md` — most recent
3. Reviewer findings already pasted in the current conversation

If none exist and the current branch has an open PR, switch to `pr-mode.md`. Otherwise stop and ask the user to point at a reviewer file.

## 2. Parse Findings

Findings come in several loose shapes. Extract a normalized list of items, each with:

- **id**: stable identifier — heading anchor, numeric prefix, or hash of `(path, line, first-words)` if nothing stable exists
- **path** + **line range** (optional; some findings are repo-wide)
- **finding text**: full reviewer prose
- **suggested fix** (optional)
- **severity / category** (optional; honor reviewer's labels if present)

Recognized formats:

- **dartai/workflow verdict YAML block**: `verdict: ...` plus a list of `blockers:` / `findings:` entries, optionally with an `evidence_path` markdown file. Read the evidence file too.
- **`lci:pre-commit-review` output**: structured by category (duplicates, naming, complexity); each entry has file:line.
- **`compound-review` reviewer markdown**: numbered findings, often with `## Finding N` headings.
- **Generic markdown**: bulleted/numbered list with file references in backticks.

When the schema is fully loose, default ids to `finding-1`, `finding-2`, ... in document order — the only requirement is stability across re-runs.

## 3. Triage: Separate New from Already-Handled

Before processing, classify each finding as **new** or **already handled**.

Check for prior resolutions in either of these locations:
- A `## Resolutions` section appended to the reviewer file
- A sibling `<original-name>.resolved.md`

A finding is **already handled** when its id appears in a prior resolution record with a verdict (fixed / fixed-differently / replied / not-addressing / declined). It is **pending** when there's a prior `needs-human` record without a follow-up — re-surface those at step 10, do not re-process.

A finding is **new** when there's no prior record for its id.

Apply an actionability filter to surviving items: drop wrappers, approvals, status badges, and "this looks great!" prose. **Silent drop** — do not announce, list, or count dropped non-actionable items.

If there are no new actionable items, skip steps 4–9 and go straight to step 10.

## 4. Cross-Invocation Cluster Analysis (Gated)

Same gate as PR mode. Both stages must pass:

1. **Signal**: prior `## Resolutions` records exist alongside new findings (multi-round review).
2. **Spatial overlap**: at least one new finding shares a file path or directory subtree with a previously-resolved finding from `## Resolutions`.

If both pass, group new findings + matching previously-resolved findings into clusters by `(category, spatial proximity)`. Categories: `error-handling`, `validation`, `type-safety`, `naming`, `performance`, `testing`, `security`, `documentation`, `style`, `architecture`, `other`. Each finding gets exactly one.

A cluster requires **at least one previously-resolved finding** — new-only groups stay individual. Single-round bundling ("one helper would fix all of these") is deliberately not done; evidence is too thin.

For each cluster, build a `<cluster-brief>` block:

```xml
<cluster-brief>
  <theme>[concern category]</theme>
  <area>[common directory path]</area>
  <files>[comma-separated file paths]</files>
  <findings>[comma-separated new finding IDs]</findings>
  <hypothesis>[one sentence: what the recurring feedback across rounds suggests]</hypothesis>
  <prior-resolutions>
    <finding id="..." path="..." category="..."/>
  </prior-resolutions>
</cluster-brief>
```

Findings not in any cluster stay individual. Previously-resolved findings that don't cluster are dropped — they only contributed signal.

## 5. Plan

Create a task list of all new findings grouped by type. Use `TaskCreate` (Claude Code) or the local-only equivalent — this is intra-turn scratch tracking, no Dart task needed unless the user asks.

Include cluster items alongside individual findings.

## 6. Implement (PARALLEL)

### Dispatch boundary

Previously-resolved findings appear only as cluster context (`<prior-resolutions>`). Never re-dispatch them — they were already resolved.

### Individual dispatch

Spawn one resolver subagent per non-clustered new finding. Each agent receives:

- Finding ID
- File path + line range (when present; otherwise the finding text alone)
- Full finding text and any suggested fix
- The source reviewer file path (for context)
- Feedback type: `local_review`

If the project has a dedicated resolver agent (e.g. `compound-review:reviewer-resolver` or a project-local equivalent), use it. Otherwise dispatch a generic implementation subagent with the finding as its task brief.

### Cluster dispatch

For each cluster, dispatch ONE resolver subagent with the `<cluster-brief>` plus all finding details. The cluster agent reads the broader area first, then makes targeted fixes informed by that context. It returns one record per finding it handled, plus a `cluster_assessment` field.

### Agent return format

Each resolver returns:

- **verdict**: `fixed`, `fixed-differently`, `replied`, `not-addressing`, `declined`, or `needs-human`
- **finding_id**: the id it handled
- **feedback_type**: `local_review` (or for PR mode: `review_thread`, `pr_comment`, `review_body`)
- **reply_text**: markdown reply quoting the relevant part of the original finding
- **files_changed**: list of files modified (empty if replied/not-addressing/declined)
- **reason**: brief explanation

Cluster agents additionally return **cluster_assessment**.

Verdict meanings:

- `fixed` — code change made as requested
- `fixed-differently` — code change made, but with a better approach than suggested
- `replied` — no code change needed; answered a question, acknowledged, or explained a design decision
- `not-addressing` — feedback is factually wrong about the code; skip with evidence
- `declined` — observation may be valid, but the suggested fix would actively make the code worse; reply cites the specific harm
- `needs-human` — cannot determine the right action

### Batching and conflict avoidance

Clusters count as 1 dispatch unit. 1–4 units total → all parallel. 5+ units → batch in groups of 4.

No two units that touch the same file run in parallel. Detect file overlaps across units before dispatch and serialize overlapping ones. Within a single unit handling multiple findings on one file, the agent addresses them sequentially.

Sequential fallback: if parallel dispatch is unavailable, run cluster units first (higher leverage), then individual items.

## 7. Validate Combined State

After all agents complete, aggregate `files_changed`. If empty (all verdicts are `replied` / `not-addressing` / `declined` / `needs-human`), skip steps 7–8 and go to step 9.

Run the project's full validation **once** against the combined diff (test suite, type check, whatever AGENTS.md/CLAUDE.md specifies). Resolvers ran only targeted tests on their own changes; this catches cross-agent interactions.

- **Green** → step 8.
- **Red, failures touch resolver-changed files** → one inline diagnose-and-fix pass. Re-run validation. Still red → escalate as `needs-human` with the test output; do **not** commit.
- **Red, failures only in untouched files** → treat as pre-existing. Proceed, but note in the commit footer: `Note: pre-existing failure in <test> not addressed by this run.`

Record outcome (command, pass/fail counts, pre-existing notes) for step 10.

## 8. Commit (Optional in Local Mode)

Local mode does NOT auto-commit by default — pre-commit-first means the user is still in the staging loop and may want to inspect or batch with other changes.

After successful validation, **prompt the user**: "Ready to commit these resolutions? (or stage for combined commit / hold)". Honor the project memory note about prompting after coherent units.

If the user opts to commit, stage only resolver-changed files and commit with a message like:

```
Resolve reviewer findings from <reviewer-source>

- [list of changes from agent summaries]
```

Then capture the commit SHA for the resolution record.

## 9. Record Resolutions and Verify

Append (or update — keyed by finding id) records to a `## Resolutions` section in the reviewer file, OR write to a `<original-name>.resolved.md` sibling. Choice depends on whether the reviewer file is writable / treated as immutable in the project; default to sibling `.resolved.md` for files under `.dart/` or `.dartai/` to keep the originals as audit artifacts.

Each record:

```markdown
### <finding-id>

> [quoted relevant part of original finding]

**Verdict**: fixed | fixed-differently | replied | not-addressing | declined | needs-human
**Commit**: <sha or "uncommitted">
**Files**: path1, path2
**Reply**: [agent's reply_text]
```

For `needs-human`, record the verdict but flag for step 10 surfacing — the finding stays open for user input.

**Verify**: re-parse the reviewer file (steps 1–3). The set of new actionable findings should now be empty (minus intentionally-open `needs-human` items).

If new findings remain after the second fix-verify cycle, stop looping and surface the recurring pattern to the user (see SKILL.md "Stop Conditions").

## 10. Summary

Concise summary, grouped by verdict, one line per item describing *what was done* not just *where*. Primary user-facing output.

```
Resolved N of M new findings from <reviewer-source>:

Fixed (count): [brief description of each fix]
Fixed differently (count): [what was changed and why]
Replied (count): [what was answered]
Not addressing (count): [what was skipped and why]
Declined (count): [what was declined and the harm cited]

Validation: [one line, e.g., "bun test passed (893/893)"; omit when no code changes]
```

Append cluster investigations if any:

```
Cluster investigations (count):

1. [theme] in [area]: [cluster_assessment]
```

Append `needs-human` decisions if any. Each agent's `decision_context` is already structured — present it directly:

```
Needs your input (count):

1. [decision_context: quoted feedback, investigation findings,
   why it needs a decision, options with tradeoffs, agent's lean]
```

If pending decisions from a previous run exist (step 3 detected them), surface after new work:

```
Still pending from a previous run (count):

1. [finding-id] — [brief description]
   Previous record: [path:section]
```

Use `AskUserQuestion` (Claude Code) to ask about all pending decisions together if available — call `ToolSearch` with `select:AskUserQuestion` first if the schema isn't loaded. Fall back to inline conversation only when no blocking tool exists. Never silently skip.

---

## Targeted Mode (single finding)

When the argument is a finding ID, heading anchor, or pasted single-finding block:

1. Locate the finding (steps 1–2 above, scoped to one item).
2. Spawn a single resolver subagent with the finding details.
3. Run validate → optional commit → record resolution → verify (steps 7–9 for that one finding).

Skip triage clustering and parallel dispatch — it's one finding.
