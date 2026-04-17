---
name: verify
description: Run adversarial verification on a target directory or file. 對目標目錄或文件運行對抗性驗證。 Use when: verify code quality, run review agents, adversarial verification, check implementation, post-implementation review
argument-hint: "[target]"
---

# Adversarial Verification Command

運行對抗性驗證循環以挑戰並驗證代碼品質。

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

Spawn two agents in parallel using the Task tool, then run a third sequentially:

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
