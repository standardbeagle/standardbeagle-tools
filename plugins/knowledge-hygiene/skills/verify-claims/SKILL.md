---
name: knowledge-hygiene-verify-claims
description: "Run multi-source-research + rationalization-trap-check on each load-bearing claim in target doc, spec, or PR. Surfaces conflicts + rationalization-traps before commit/merge. 對目標跑多源+陷阱檢核。 Use when: pre-merge fact-check on doc/PR, post-spec audit before locking architectural decision, validating claim contradicting Phase 0 high-confidence bullet, periodic audit of /docs/research/ outputs."
disable-model-invocation: true
argument-hint: "\"[target — file path, directory, or PR ref like #123 or owner/repo#123]\""
---

# Verify-Claims Command

對目標文檔或 PR 之每 load-bearing claim 跑 knowledge-hygiene 全管道：採集 ≥2 源 → 衝突檢核 → 理性化陷阱檢核 → 結構化報告。本命令為 `multi-source-research` skill 與 `rationalization-trap-check` skill 之 orchestrator，**不**自身做 source 採集或 conflict 判定——彼皆委下游。

## Usage

```
/knowledge-hygiene:verify-claims docs/research/K2-knowledge-hygiene-from-papers.md
/knowledge-hygiene:verify-claims docs/superpowers/specs/2026-04-26-knowledge-hygiene-design.md
/knowledge-hygiene:verify-claims plugins/knowledge-hygiene/
/knowledge-hygiene:verify-claims #123
/knowledge-hygiene:verify-claims standardbeagle/standardbeagle-tools#123
```

## Provenance

- **K2 design doc:** `docs/research/K2-knowledge-hygiene-from-papers.md` §3.1 (provenance per claim) + §3.3 (rationalization-trap)
- **Pipeline composition:** this command is a thin orchestrator over the two skills + one agent in this plugin. No new logic lives here.

## Process

### Step 1 — Identify Target

If `$ARGUMENTS` is provided, use it. Otherwise ask the user for the target.

Resolve the target shape:

- **File path** → read the file with `Read`.
- **Directory path** → glob for `*.md`, `*.txt`, `*.rst` candidates with `Glob`; iterate per file.
- **PR ref** (`#NNN` or `owner/repo#NNN`) → use `gh pr view <ref> --json title,body,files` to fetch the PR body + changed files; treat each as a target file.

### Step 2 — Extract Load-Bearing Claims

For each target document, identify **load-bearing claims** — assertions that, if false, would change a downstream decision. Heuristics:

- Numeric / boolean assertions about runtime behavior (TTLs, version numbers, feature flags).
- Causal claims ("X causes Y", "without X, Y fails").
- Authority claims ("the spec says", "the docs require", "per RFC NNNN").
- Architectural decisions and the rationale section of design docs.
- Security / data-integrity assertions.

Skip:

- Stylistic / aesthetic statements.
- Hedged exploratory prose ("we might consider", "one option is").
- Comments / examples that are illustrative only.

When in doubt, prefer to include the claim — false-positives are cheap (an extra conflict-detector call), false-negatives let an ungrounded assertion ship.

### Step 3 — Run multi-source-research per claim

For each extracted claim:

1. Invoke the `multi-source-research` skill (this plugin, `skills/multi-source-research/SKILL.md`) with the claim as the topic.
2. The skill runs gather → conflict-detect → synthesize-with-provenance per its own pipeline.
3. Capture the output JSON.

### Step 4 — Run rationalization-trap-check on the surrounding reasoning

If the target document includes a reasoning trace, plan, or rationale section adjacent to the claim (e.g., a "Why" section in a PR body, a "Decision" section in a design doc, a CoT block in a spec):

1. Invoke the `rationalization-trap-check` skill (this plugin) with:
   - `cot_text` = the reasoning section.
   - `change_text` = the claim itself.
   - `prior_claims` = any prior high-confidence claims this claim might override (gathered from project memory `.dartai/memory/`, `CLAUDE.md`, or git history if relevant).
2. Capture the verdict.

If no reasoning trace is adjacent (claim stands alone), skip Step 4 for that claim and record `rationalization_check: skipped:no-reasoning-trace`.

### Step 5 — Report

Emit a structured report — one section per claim — for the user:

```markdown
## Verify-Claims Report — <target>

**Claims audited:** N
**Conflicts surfaced:** M (of which K escalate-to-user)
**Rationalization flags:** P (of which Q flag-strong)

### Claim 1: "<claim text>"

- **Sources gathered:** <count> (<list of source ids>)
- **Conflict check:** <conflict_type> — <recommended_resolution>
- **Reasoning:** <conflict-detector reasoning verbatim>
- **Rationalization check:** <verdict> (<positive signal count>/3 signals)
- **Recommendation:** <one-sentence next action>

### Claim 2: ...
```

Sort the report so `escalate-to-user` and `flag-strong` claims appear first.

**Related (optional rendering):** 報告默為 inline markdown。若 user 欲瀏覽器可視化（多 claim、需篩排 severity）→ 將 §Step 5 之各 claim section 作 `sections` 傳 `present:html-report`，per-claim severity/rationalization 作 badge。純 CI gate 場景無需渲染。

### Step 6 — Exit Behavior

The command does NOT modify the target file or block the PR. It surfaces. The user (or a downstream automation invoking this command) decides what to do with the report.

When invoked from a CI pipeline (e.g., a pre-merge GitHub Action), the caller may parse the report's summary line (`Conflicts surfaced: M ... Rationalization flags: P`) and gate the merge on `M == 0 && P == 0`. That gating policy lives in the caller, not in this command.

## Output

A single markdown report (Step 5 shape). No file writes by default. If the user requests `--save-report <path>`, write the report to `<path>`.

## Composition Diagram

```
/knowledge-hygiene:verify-claims <target>
                     │
                     ├── (Step 2) extract load-bearing claims
                     │
                     ├── (Step 3, per claim)
                     │      ▼
                     │   skills/multi-source-research/SKILL.md
                     │      │
                     │      ├── Step 1: gather ≥2 sources
                     │      ├── Step 2: invoke agents/conflict-detector.md
                     │      └── Step 3: synthesize-with-provenance
                     │
                     ├── (Step 4, per claim, when reasoning adjacent)
                     │      ▼
                     │   skills/rationalization-trap-check/SKILL.md
                     │
                     └── (Step 5) emit structured report
```

## Anti-Patterns

- **Auto-blocking merges from this command** — the command surfaces; gating is the caller's policy. Hard-blocking would prevent legitimate overrides documented per the brainstorming `Conflict-Detect Integration` audit-trail rule.
- **Running on every doc indiscriminately** — `verify-claims` is for load-bearing artifacts (specs, research docs, PR descriptions). Running it on README updates is overkill and trains reviewers to ignore the report.
- **Modifying the target file** — this command is read-only on the target. If the report recommends a change, the user (or a subsequent edit) makes it.

## Forward References

- **Citation-verifier agent** (`qvd3VBUROdw2`, deferred Tier-3) — will add a Step 3.5 between conflict-detect and synthesize: retroactively verify each `provenance` tag still resolves (file:line exists, web:url loads, git:sha in history). Until it lands, `verify-claims` trusts the provenance tags as emitted.
