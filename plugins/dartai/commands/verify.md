---
name: verify
description: "Run adversarial verification on a target directory or file. 對目標目錄或文件運行對抗性驗證。 Use when: verify code quality, run review agents, adversarial verification, check implementation, post-implementation review"
argument-hint: "[target]"
context: fork
agent: dartai:qa-reviewer
---

# Adversarial Verification Command

運行對抗性驗證循環以挑戰並驗證代碼品質。

## Agent Dispatch Prerequisites

This command dispatches reviewer subagents in parallel via `Agent` (alias `Task`).

1. **Top-level driver only.** Subagents cannot spawn subagents — if `/dartai:verify` runs inside a subagent, stop and report to the parent. The 2+1 review pattern collapses if the dispatcher tries to inline reviewer logic in a single context.
2. **Verify `Agent` schema before first dispatch.** Check the `<system-reminder>` deferred-tools list: if `Agent` is **absent** from it → preloaded, call directly (no ToolSearch needed). If `Agent` is **present** in the deferred list → `ToolSearch query="select:Agent" max_results=1` to load schema before calling.

## Usage

```
/dartai:verify ./src/module
/dartai:verify ./src/auth/
/dartai:verify .
```

## What It Does

對目標以2+1模式運行審查代理：

**Parallel phase** (concurrent):
1. **Code Quality Reviewer** - Code quality, security, coherence, performance, testability, bloat, duplication, cleanup
2. **QA Reviewer** - Assertion quality, edge cases, TDD compliance, test distribution, test plans

**Sequential phase** (after parallel agents complete):
3. **Post-Task Reviewer** - Requirements coverage, documentation accuracy, user flows, lean docs

各返回PASS/FAIL/NEEDS_WORK及詳細發現。

## Process

### 1. Identify Target

If target provided as argument, use it. Otherwise identify from current task context or ask.

### 3. Execute Concurrent Review

Spawn two agents in parallel using the Task tool, then run a third sequentially.

#### Dispatch prompt compression 派發提示壓縮

Reviewer dispatch prompts are compressed — same rules as `/dartai:task` §3 (keep paths/symbols/code/errors verbatim, strip articles/filler/recap). Reviewer agents accept compressed input. See `plugins/dartai/agents/task-executor.md` and the verdict-schema skill for the return format.

**Compressed dispatch shape (apply to all three reviewers):**
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

Drop role-preludes ("You are a...", "Your job is to..."). Reviewer agent specs already encode role and focus areas — driver supplies scope + verbatim artifacts only.

**Parallel:**
1. `dartai:code-quality-reviewer` - Implementation quality
2. `dartai:qa-reviewer` - Test coverage and quality

Wait for both to complete.

**Sequential:**
3. `dartai:post-task-reviewer` - Requirements coverage and documentation

Compile results from all three agents.

### 4. Plan Adjustment Protocol

At each plan adjustment point:
- Review discoveries from current phase
- Update remaining tasks based on findings
- Re-prioritize if blocking issues found
- Document adjustments for tracking

### 5. Report Results

Generate verification report with:
- Verdict: PASS/FAIL/NEEDS_WORK
- Issues found by severity
- Verification evidence
- Plan adjustments made
- Recommended next steps

## Context-Sized Task Rules

每個驗證任務遵循以下規則：

**範圍：**
- 每個驗證任務最多3-5個文件
- 每次命令調用一種驗證類型
- 每個階段有清晰通過/失敗標準

**指令格式：**
每個階段包含：
- **DO (Positive Instructions)**: Specific actions to take
- **DO NOT (Negative Instructions)**: Specific actions to avoid
- **Verification Criteria**: Clear pass/fail conditions

## Output

```
Adversarial Verification Report
================================
Target: [file/directory]
Verdict: [PASS|FAIL|NEEDS_WORK]

Issues Found:
- Critical: X
- High: X
- Medium: X
- Low: X

Agent Results:
- Code Quality Reviewer: [PASS|FAIL|NEEDS_WORK] - [summary]
- QA Reviewer:            [PASS|FAIL|NEEDS_WORK] - [summary]
- Post-Task Reviewer:     [PASS|FAIL|NEEDS_WORK] - [summary]

Plan Adjustments:
- [adjustment 1]
- [adjustment 2]

Recommended Actions:
1. [action]
2. [action]
```

## Integration with Dart

在Dart任務上下文中運行時：
- 將驗證結果鏈接至任務
- 添加含驗證摘要的評論
- 依結果更新任務狀態
- 為發現問題創建後續任務
