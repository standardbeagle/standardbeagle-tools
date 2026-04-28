# Phase 5.5: Lightweight Cite Verify

Loaded by `adversarial-quality-loop` when the executor enters Phase 5.5 (post-commit, pre-Done). Lightweight verifier — full 4-layer citation verification (Tier 3, including web URL fetching) is deferred to the dedicated `citation-verifier` agent (Dart task `qvd3VBUROdw2`).

Cite: mcp-architect `citation-verification-pattern` skill (commit 44bf8e0), brainstorming PROVENANCE-CONTRACT (commit ebd136a), dev-standards `multi-source-for-load-bearing-claims` rule (commit 9ab9c47).

## Task: Verify Citations in Commit Message and PR Body

**DO:**
- Parse all citations from the commit message body and (if a PR body was generated) the PR body
- For each citation form, run the form-specific check below
- On obviously broken cite (per definitions below), do **one** retry: dispatch a fresh sub-agent to re-derive the cite from the same source and replace it
- If retry still fails, surface the broken cite in the completion comment but do **not** block marking the task Done
- Record verification outcome (per-cite pass/fail/skipped) in the completion comment for audit trail

**DO NOT:**
- Run full Tier 3 4-layer verification — that is `citation-verifier`'s job (deferred)
- Fetch web URLs (skip `web:url` form entirely at this tier)
- Block the task on a broken cite — surface and proceed
- Retry more than once per cite — single retry is the budget
- Edit the commit (already pushed) on broken cite — only fix in the comment trail

## Form-specific verify rules 各引用形式核驗規則

```yaml
cite_forms:
  file_path_line:
    pattern: "<path>:<line>" or "<path>:<line-range>"  # e.g. "src/foo.ts:42" or "src/foo.ts:42-58"
    verify:
      - "File exists at the path (relative to repo root)"
      - "Line number is within file's line count (1-indexed)"
      - "For ranges, both endpoints in range AND start <= end"
    obviously_broken:
      - "File does not exist"
      - "Line number > file line count"
      - "Negative or zero line number"
      - "Range with start > end"

  symbol:
    pattern: "function <name>" | "class <name>" | "method <name>" | "<Type>.<member>"
    verify:
      - "Resolvable via mcp__lci__search with query=<symbol-name>"
      - "At least one match returned with kind matching the cite (function/class/method)"
    obviously_broken:
      - "lci search returns zero matches"
      - "lci returns matches but none of the cited kind"
    skip_if:
      - "lci MCP unavailable in current environment (degrade silently, mark cite as 'skipped:lci-unavailable')"

  git_sha:
    pattern: "git:<sha>" or "<7+-char hex>" with git: prefix or in obvious commit context
    verify:
      - "git rev-parse --verify <sha>^{commit} succeeds"
    obviously_broken:
      - "git rev-parse exits non-zero"
      - "sha shorter than 7 chars (ambiguous)"

  web_url:
    pattern: "http://..." or "https://..."
    verify: "SKIP at this tier"
    note: |
      Full URL liveness + content match is Tier 3 (deferred to citation-verifier
      task qvd3VBUROdw2). Lightweight verify deliberately does not WebFetch
      to keep this phase fast.

  memory_id:
    pattern: "memory:<id>" or reference to a memory file by id
    verify:
      - "File exists at ~/.claude/projects/<project-slug>/memory/<id>.md"
      - "Project slug derives from current working directory (replace / with -)"
    obviously_broken:
      - "Memory file does not exist at the resolved path"
```

## "Obviously broken" 顯然破損之定義

A cite is "obviously broken" only when the form-specific check above returns a definite negative (file doesn't exist, line out of range, sha invalid, memory file missing, lci returns zero hits). Ambiguous cases (e.g. lci returns multiple symbols and none clearly match) are **not** obviously broken — they pass at this tier; deeper disambiguation is Tier 3.

## Retry protocol 重試協議

```yaml
retry_on_broken_cite:
  budget: 1  # one retry per broken cite, no more
  dispatch:
    tool: Task
    subagent_type: "general-purpose"
    description: "Re-derive cite for [broken-cite-text]"
    prompt: |
      The cite "[broken-cite-text]" failed lightweight verification:
      - Form: [file_path_line | symbol | git_sha | memory_id]
      - Failure reason: [from form-specific check]

      Re-derive a corrected cite from the same intended source.
      If the source genuinely cannot be cited correctly, return
      {status: "ungrounded", explanation: "..."}.

      Otherwise return {status: "corrected", cite: "<new cite>"}.
  on_corrected:
    - "Replace the cite in the completion comment (NOT in the already-pushed commit)"
    - "Mark cite as 'fixed-on-retry' in audit trail"
  on_ungrounded:
    - "Surface in completion comment as 'broken cite (ungrounded after retry)'"
    - "Do NOT block task Done"
```

## Verification Criteria

```yaml
pass_if:
  - all_cites_parsed: true
  - per_cite_outcome_recorded: true  # pass | fail | skipped | fixed-on-retry
  - completion_comment_includes_cite_audit: true
fail_if:
  - cite_parser_crashed: true  # implementation bug, not a cite bug
  - retry_budget_exceeded: true  # >1 retry per cite is a protocol violation
note: |
  Broken cites that survive retry do NOT trigger fail_if. They are surfaced
  in the comment and the task still moves to Done. Only protocol violations
  fail this phase.
```

## Plan Adjustment Point 5.5

```yaml
checkpoint:
  validate:
    - cite_audit_complete: true
    - broken_cites_surfaced_or_fixed: true
  auto_adjust:
    cite_fixed_on_retry: "Update completion comment, CONTINUE"
    cite_ungrounded_after_retry: "Surface in comment, CONTINUE — do not block"
    no_cites_in_commit: "No-op, CONTINUE"
    lci_unavailable: "Mark symbol cites as skipped, CONTINUE"
  stop_only_if:
    cite_parser_bug: "Implementation crashed — fix parser, do not skip phase"
  then: "Proceed immediately to Phase 6"
```

## Tier separation 層級分離說明

This phase is intentionally narrow.

- **Tier 1 (this phase)**: cheap shape checks — file/line/sha/memory existence, lci symbol resolve. Fast, runs every task.
- **Tier 2 (existing)**: provenance presence in commit (covered by review agents Phase 3).
- **Tier 3 (deferred to `citation-verifier` task `qvd3VBUROdw2`)**: web URL liveness, content-match against cited content, semantic agreement, multi-source corroboration per the `multi-source-for-load-bearing-claims` rule.

Lightweight verify catches the dumbest mistakes (file doesn't exist, sha typo) at near-zero cost. The full pass remains a separate, scheduled phase.
