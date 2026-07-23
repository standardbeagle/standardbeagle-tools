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

```

## Reading Verdicts (file-streaming via Monitor)

The driver gates on **verdict file content**, not subagent stdout. Stdout is a ≤5-line pointer; the transcript is dropped after the path is captured.

```yaml
verdict_consumption:
  channel: "file"
  reads:
    - ".dartai/reports/<task-id>/quality.md"       # code-quality-reviewer
    - ".dartai/reports/<task-id>/qa.md"            # qa-reviewer
    - ".dartai/reports/<task-id>/security.md"      # post-task-reviewer; written in Phase 5

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
```

## Verification Criteria

```yaml
pass_if:
  - code_quality_reviewer_verdict: "PASS"
  - qa_reviewer_verdict: "PASS"
fail_if:
  - any_dispatched_verdict_fail_after_retries: true
```
