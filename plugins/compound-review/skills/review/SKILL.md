---
name: review
description: "Single-pass, context-owned code review. Read one supplied diff once; check spec, correctness, maintainability, and conditionally testing, TypeScript, CLI, rationalization. Fan out only for a genuinely distinct repository context body. Returns one provider-neutral structured result. Use for diff/PR review and review gates."
disable-model-invocation: true
argument-hint: "[diff, branch, PR, or file scope]"
---

# Context-owned review

Review one change set without persona-per-lens fan-out. The caller supplies or identifies a **review packet**:

- unified diff and changed files;
- acceptance criteria, if any;
- commit/PR text, if relevant;
- applicable project conventions;
- optional machine-checkable test evidence.

Derive the diff once when it is not supplied. Every rubric below uses that same packet.

## Execution rule

**One context body = one reviewer.** Different rubrics over the same diff are sequential checks in this pass, not separate agents. Never launch finder agents by lens and never launch one verifier per candidate.

Fan out only when a check needs context the reviewer does not own. Valid examples:

- searching the wider repository capability surface for an existing helper;
- validating an architecture, security, or performance claim against live code outside the packet.

Pass the shared diff inline to such a context-owning spoke. The spoke returns only evidence/findings and must not rederive the diff. Clean or ordinary diffs require no spokes.

## Review order

### 1. Specification compliance

When acceptance criteria exist, map every criterion to concrete diff evidence. A missing or contradicted criterion is a `major` finding and short-circuits the remaining quality rubrics: do not spend review effort polishing a change that solves the wrong problem.

With no acceptance criteria, skip this rubric explicitly; do not invent requirements.

### 2. Correctness

Mentally execute changed paths and their touched callers/callees. Report only a concrete trigger state leading to wrong output, crash, data loss, invalid transition, race, or broken error propagation. Check:

- boundary and off-by-one behavior;
- null/optional propagation;
- ordering and concurrency assumptions;
- state transitions and partial updates;
- exception/error preservation;
- removed guards or invariants;
- changed call contracts across files.

A correctness finding must state `failureScenario`. Suppress speculation without a reachable trigger.

### 3. Maintainability

Flag objectively costly structure introduced by the change:

- duplicated capability already present in the repository or platform;
- needless indirection or speculative generality;
- duplicated state or parallel control flows likely to drift;
- dead code and debug artifacts;
- responsibility or dependency boundaries made less coherent;
- repeated I/O, hot-path work, or unbounded resource retention.

Naming/style preferences are not findings. Prefer deletion and direct reuse over new abstraction.

### 4. Conditional rubrics

Apply these **inside this same pass** when their trigger matches.

#### Testing

**Trigger:** production behavior changed, tests changed, or acceptance criteria require a regression guard.

Check that tests exercise the real boundary, assert observable behavior, cover the changed failure path, and would discriminate the implementation from the prior behavior. Reuse supplied green-suite evidence; do not rerun an already-green full suite. Run only a targeted test when determining whether a new test actually discriminates.

#### TypeScript strictness

**Trigger:** changed files include `.ts`, `.tsx`, `.mts`, or `.cts`.

Check for `any`, unchecked casts, lost generic constraints, nullable flows not narrowed, unsafe indexed access, type/runtime disagreement, and exported types broader than implementation guarantees. Do not request modernization unrelated to the diff.

#### CLI readiness

**Trigger:** the diff touches command definitions, argument parsing, command handlers, output contracts, or exit-code behavior.

Check discoverability, non-interactive operation, stable machine-readable output, actionable stderr, meaningful exit codes, idempotent retry behavior, and absence of hidden prompts. Judge the CLI from an autonomous caller's perspective.

#### Rationalization

**Trigger:** the diff is large or critical-path and explanatory text is supplied.

Flag only when at least two signals hold: explanation-to-change ratio is disproportionate, a prior high-confidence decision is silently overridden, or repeated hedging substitutes argument for verification. This surfaces unsupported overrides; it is not a license to infer private chain-of-thought.

## Confidence and deduplication

- `high`: complete trigger-to-failure trace or objectively proven structural cost.
- `medium`: mechanism is visible but one runtime/caller condition remains unconfirmed.
- Suppress low confidence.

Deduplicate findings by mechanism, not merely file/line. Keep the clearest failure scenario. Correctness/spec findings outrank cleanup findings.

## Result contract

Return exactly one provider-neutral object:

```json
{
  "schema": "compound_review_result_v1",
  "status": "passed",
  "rubricsApplied": ["spec", "correctness", "maintainability"],
  "findings": [
    {
      "severity": "major",
      "file": "src/example.ts",
      "line": 42,
      "message": "Concrete defect statement",
      "failureScenario": "Input or state leads to wrong result",
      "fixHint": "Direct correction",
      "confidence": "high",
      "evidence": "Quoted diff/source evidence"
    }
  ]
}
```

`status` is `failed` when any `critical` or `major` finding exists; otherwise `passed`. `minor` findings are advisory. Omit `line` only when no precise line exists. Never persist this result to task/workflow storage—the caller owns adaptation and persistence.

## Anti-patterns

- Do not spawn correctness, testing, maintainability, TypeScript, or CLI personas over the same diff.
- Do not run eight finder angles over the same packet.
- Do not launch one verifier per candidate.
- Do not rederive or reread the same diff in spokes.
- Do not rerun full tests already proven green.
- Do not widen review into unrelated repository debt.
- Do not emit provider-specific verdict files.
