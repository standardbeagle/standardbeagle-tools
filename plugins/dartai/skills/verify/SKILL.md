---
name: dartai-verify
description: "\"Run adversarial verification on target directory or file. 對目標目錄或文件運行對抗性驗證。 Use when: verify code quality, run review agents, adversarial verification, check implementation, post-implementation review\""
disable-model-invocation: true
argument-hint: "\"[target]\""
context: fork
agent: "dartai:qa-reviewer"
---

# Adversarial Verification Command

跑對抗驗證，查 code quality。

## Agent Dispatch Prerequisites

Parallel reviewer subagents via `Agent`（alias `Task`）。

1. **Top-level only.** If inside subagent, stop+report to parent.
2. **Check `Agent` schema.** `Agent` absent → call direct; present → `ToolSearch query="select:Agent" max_results=1`.

## Usage

```text
/dartai:verify ./src/module
/dartai:verify ./src/auth/
/dartai:verify .
```

## What It Does

2+1 review:

**Parallel phase**:
1. **Code Quality Reviewer** - quality, security, coherence, perf, testability, bloat, dup, cleanup
2. **QA Reviewer** - assertions, edge cases, TDD, test split, test plan

**Sequential phase**:
3. **Post-Task Reviewer** - req coverage, docs accuracy, user flow, lean docs

Each returns PASS/FAIL/NEEDS_WORK + findings.

## Process

### 1. Identify Target

If arg given, use it. Else use task context or ask.

### 3. Execute Concurrent Review

Spawn 2 in parallel, 1 after.

#### Dispatch prompt compression 派發提示壓縮

Dispatch prompts compressed same as `/dartai:task` §3. Keep paths/symbols/code/errors; strip articles/filler/recap. See `plugins/dartai/agents/task-executor.md` + `verdict-schema`.

**Compressed shape (all 3):**
```yaml
Task tool call:
  subagent_type: "dartai:<reviewer>"
  description: "Review [scope]: [target]"
  prompt: |
    Review target: [path verbatim]
    Loop/task: [ids]
    Files changed: [paths verbatim]

    Acceptance (full sentences):
    [criteria verbatim]

    Focus: [reviewer-specific concerns — see agent spec]

    Return verdict-schema YAML block (verdict, confidence, blockers,
    advisories, evidence_path) per plugins/dartai/skills/verdict-schema.md.
```

Drop role-preludes. Spec already has role/focus; driver give scope + verbatim artifacts only.

**Parallel:**
1. `dartai:code-quality-reviewer` - Implementation quality
2. `dartai:qa-reviewer` - Test coverage and quality

Wait both.

**Sequential:**
3. `dartai:post-task-reviewer` - Requirements coverage and documentation

Compile all 3.

### 4. Plan Adjustment Protocol

At each adjust point:
- Review findings
- Update remaining tasks
- Re-rank blockers
- Log changes

### 5. Report Results

Report:
- Verdict: PASS/FAIL/NEEDS_WORK
- Issues by severity
- Evidence
- Plan changes
- Next steps

## Context-Sized Task Rules

Each verify task: context-sized (~3-5 files typical — judge by context cost, not raw count), one verify type per call, clear pass/fail.

**Per phase:** DO / DO NOT / Criteria.

## Output

```text
Adversarial Verification Report
===============================
Target: [file/directory]
Verdict: [PASS|FAIL|NEEDS_WORK]
```

## Integration with Dart

在Dart任務上下文中運行時：
- 將驗證結果鏈接至任務
- 添加含驗證摘要的評論
- 依結果更新任務狀態
- 為發現問題創建後續任務
