# Phase 3: Reviewer Dispatch Playbook

Loaded by `adversarial-quality-loop` when the executor enters Phase 3 (Concurrent Adversarial Review). Reviewers deliver verdicts via files; this reference holds the full dispatch + consumption protocol.

## Prepare Reports Directory (verdict-file channel)

Reviewers deliver their decision via **verdict files** under `.dartai/reports/<task-id>/`, not via stdout body. Before dispatching reviewers:

```yaml
prepare_reports_dir:
  step_1_clear:
    action: "rm -rf .dartai/reports/<task-id>/"
    why: "Stale-verdict mitigation — a previous run's verdict file would otherwise be parsed as the current gate decision"
  step_2_recreate:
    action: "mkdir -p .dartai/reports/<task-id>/"
    why: "Reviewer subagents write into this dir; create empty before dispatch"
  invariant: "Always clear before each Phase 3 entry, even on retry-after-fix"
```

The reviewer file paths are role-fixed (the loop driver does not need to discover filenames):

| reviewer                  | verdict file path                              |
| ------------------------- | ---------------------------------------------- |
| `qa-reviewer`             | `.dartai/reports/<task-id>/qa.md`              |
| `code-quality-reviewer`   | `.dartai/reports/<task-id>/quality.md`         |
| `post-task-reviewer`      | `.dartai/reports/<task-id>/security.md`        |
| (aggregator output)       | `.dartai/reports/<task-id>/verdict-summary.kdl`|

File format is line-oriented per `plugins/dartai/skills/verdict-schema.md` ("Verdict File Delivery") — line 1 `verdict:`, line 2 `confidence:`, then `blocker:` / `advisory:` / `evidence:` lines.

## Dispatch Review Agents

並發派遣多名審查代理。各以新鮮上下文運行，**將裁決寫入檔案，stdout 僅 ≤5 行 pointer**。此為快速對抗門——安全深度審查及PM審查在Phase 5進行。

**Dispatch in parallel using the Task tool:**

```yaml
concurrent_agents:
  code_quality_reviewer:
    subagent_type: "dartai:code-quality-reviewer"
    description: "Review code quality for [task-title]"
    prompt: |
      Review code quality for task [TASK_ID].

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      Focus on: project coherence, best practices, no bloat,
      no fallbacks/TODOs, code duplication, cleanup and refactoring.

      ## Output
      Write verdict to .dartai/reports/[TASK_ID]/quality.md per
      verdict-schema "Verdict File Delivery" (line-oriented:
      verdict:/confidence:/blocker:/advisory:/evidence:). Stdout ≤5
      lines: verdict-file: <path> then verdict: <pass|fail|warn>.

  qa_reviewer:
    subagent_type: "dartai:qa-reviewer"
    description: "Review QA and requirements for [task-title]"
    prompt: |
      Review QA, test quality, and requirements for task [TASK_ID].

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      Focus on: assertion quality, edge case coverage, e2e testing,
      TDD compliance (RED/GREEN), test distribution, test isolation,
      requirements traceability, and testability.

      ## Output
      Write verdict to .dartai/reports/[TASK_ID]/qa.md per
      verdict-schema "Verdict File Delivery" (line-oriented:
      verdict:/confidence:/blocker:/advisory:/evidence:). Stdout ≤5
      lines: verdict-file: <path> then verdict: <pass|fail|warn>.

  # INT1 wave-1: always-on review personas (correctness, maintainability, testing).
  # Diff-conditional dispatch per R2 §3 — these three are unconditional because
  # their agent frontmatter is always-on (no Skip-when filter on file type).
  correctness_reviewer:
    subagent_type: "compound-review:correctness-reviewer"
    description: "Correctness review for [task-title]"
    prompt: |
      Run correctness review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Logic errors, edge cases, off-by-one, null/undefined propagation,
      race conditions, state-transition bugs, swallowed errors,
      intent-vs-implementation mismatch.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.

  maintainability_reviewer:
    subagent_type: "compound-review:maintainability-reviewer"
    description: "Maintainability review for [task-title]"
    prompt: |
      Run maintainability review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Premature abstraction, unnecessary indirection, dead code,
      cross-module coupling, naming that obscures intent,
      duplication (jscpd), YAGNI violations.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.

  testing_reviewer:
    subagent_type: "compound-review:testing-reviewer"
    description: "Testing review for [task-title]"
    prompt: |
      Run testing review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of files changed]

      ## Acceptance Criteria
      [criteria from task]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Untested branches, weak/brittle assertions, implementation-coupled
      tests, missing error-path coverage, behavior changes without tests.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.

  # Conditional reviewers — only dispatch when diff matches the trigger.
  # Predicate syntax: JavaScript-expression evaluated against the changed-files
  # list; `file` iterates each path. See R2 §6.1 for canonical form.
  typescript_strict_reviewer:
    enabled_when: "any(file.endsWith('.ts') || file.endsWith('.tsx'))"
    subagent_type: "compound-review:typescript-strict-reviewer"
    description: "TypeScript-strict review for [task-title]"
    prompt: |
      Run TypeScript-strict review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of *.ts / *.tsx files changed]

      ## Acceptance Criteria
      [criteria from task]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Type-system loopholes (`any`, unchecked casts, broad `unknown as Foo`),
      nullable narrowing, hidden regressions in refactors/deletions,
      five-second-rule failures, hard-to-test structure-vs-behavior gaps.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.

  cli_readiness_reviewer:
    enabled_when: |
      any(file.includes('/cli/') || file.includes('/commands/')
          || file.includes('/bin/') || /\.cli\./.test(file)
          || /docs\/plans\/.*cli.*\.md$/.test(file)
          || /docs\/research\/.*cli.*\.md$/.test(file))
    subagent_type: "compound-review:cli-readiness-reviewer"
    description: "CLI agent-readiness review for [task-title]"
    prompt: |
      Run CLI agent-readiness review for task [TASK_ID].

      ## Task ID
      [TASK_ID]

      ## Changed Files
      [list of CLI source/spec/plan files changed]

      ## Acceptance Criteria
      [criteria from task]

      ## Risk Vector
      [risk_vector dict from telemetry, if enabled]

      ## Focus
      Non-interactive defaults (TTY guards, --yes flags), structured
      output (--json/--format), actionable errors, idempotent retries,
      bounded list output, stdout/stderr separation, help-text completeness.
      Severity caps at P1; all findings advisory/manual.

      ## Return
      Return structured review_report (per R2 §4.1) as the final message
      body, no preamble. verdict ∈ {PASS, FAIL, NEEDS_WORK}.
```

## Reading Verdicts (file-streaming via Monitor)

The driver gates on **verdict file content**, not subagent stdout. Stdout is a ≤5-line pointer; the transcript is dropped after the path is captured.

```yaml
verdict_consumption:
  channel: "file"
  reads:
    - ".dartai/reports/<task-id>/quality.md"
    - ".dartai/reports/<task-id>/qa.md"
    - ".dartai/reports/<task-id>/security.md"  # post-task; written in Phase 5

  preferred_signal: "subagent-completion notification"
  why: "Completion notifications are the durable signal — file-system events alone can drop under load. Parse the verdict file at completion time."

  fallback_signal: "Monitor stream over the verdict file path"
  why: "Harnesses without completion notifications can still react to file appearance/change. Keep the Monitor stream open to catch late writes (e.g. an evidence file the reviewer writes after the verdict file)."

  parse_rule:
    - "Read line 1 — must start with 'verdict:'; extract token (pass/fail/warn)"
    - "Read line 2 — must start with 'confidence:'; extract token (high/med/low)"
    - "Read remaining lines — collect 'blocker:' lines (required when verdict=fail), 'advisory:' lines, optional trailing 'evidence:' line"
    - "Lines starting with '#' are comments; trailing whitespace and blank lines ignored"

  never:
    - "Consume the subagent stdout body into driver context"
    - "Parse the legacy fenced YAML block when a verdict file is present"
    - "Re-dispatch a reviewer just to re-read a verdict — the file is replayable"
```

**Replay**: A gate decision can be reconstructed from the verdict file alone — re-running the gate means re-reading the file, no need to re-dispatch the reviewer. The reports dir is the durable record for the iteration.

## Handling Results

```yaml
result_handling:
  all_pass:
    action: "Proceed to Phase 4"
    note: "All dispatched reviewers' verdict files report pass (or warn)"

  any_needs_work:
    action: "Fix issues, re-dispatch ONLY the failing reviewer(s)"
    note: |
      Re-dispatching a reviewer overwrites its verdict file in place
      (the dir was cleared at Phase 3 entry; subsequent retries within
      the same Phase 3 do NOT re-clear, they overwrite per-reviewer).
    max_retries: 2

  any_fail:
    action: "Fix issues, re-dispatch ONLY the failing reviewer(s)"
    max_retries: 2
    escalate_after: "If still failing after 2 retries, RETURN with failure"

  conditional_skip:
    note: |
      Reviewers gated by enabled_when (typescript_strict, cli_readiness)
      are skipped when the diff does not match. Skipped reviewers do NOT
      block pass_if — only dispatched reviewers' verdicts join the AND.
      Skipped reviewers do not write a verdict file; absence is treated
      as skipped, not failed.
```

## Verification Criteria

```yaml
pass_if:
  # Always-dispatched reviewers — verdicts must all be PASS
  - code_quality_reviewer_verdict: "PASS"
  - qa_reviewer_verdict: "PASS"
  - correctness_reviewer_verdict: "PASS"
  - maintainability_reviewer_verdict: "PASS"
  - testing_reviewer_verdict: "PASS"
  # Conditional reviewers — verdict must be PASS when dispatched, ignored when skipped
  - typescript_strict_reviewer_verdict_if_dispatched: "PASS"
  - cli_readiness_reviewer_verdict_if_dispatched: "PASS"
fail_if:
  - any_dispatched_verdict_fail_after_retries: true
```
