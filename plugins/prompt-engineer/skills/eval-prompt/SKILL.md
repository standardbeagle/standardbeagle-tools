---
name: prompt-engineer-eval-prompt
description: "\"Evaluate prompt effectiveness using metrics and test cases inspired by DSPy and OPRO. 以 DSPy/OPRO 啟發之指標與測試案例評估提示效果。 Use when: measuring prompt quality before/after changes, running A/B comparisons, building regression test suites.\""
disable-model-invocation: true
allowed-tools: "[\"Read\", \"Write\", \"AskUserQuestion\", \"Bash\"]"
---

以系統指標與測試案例評估提示效果，方法取自 DSPy 與 OPRO 方法論。

## Evaluation Framework

### 1. Define Success Criteria

以 AskUserQuestion 建立指標：

**Question 1**: "What does success look like for this prompt?"
- Accurate/factual outputs
- Consistent format
- Appropriate tone/style
- Task completion
- Safety/refusals working

**Question 2**: "What specific metrics matter most?" (multiSelect: true)
- Accuracy (factual correctness)
- Format compliance (matches schema)
- Relevance (addresses the question)
- Completeness (covers all aspects)
- Conciseness (no unnecessary content)
- Safety (appropriate refusals)
- Consistency (reproducible results)

### 2. Create Evaluation Rubric

生成評分量規：

```markdown
## Evaluation Rubric

### Dimension 1: [Metric Name]
**Weight**: X%

| Score | Criteria |
|-------|----------|
| 5 | [Excellent - specific criteria] |
| 4 | [Good - specific criteria] |
| 3 | [Acceptable - specific criteria] |
| 2 | [Needs improvement - specific criteria] |
| 1 | [Unacceptable - specific criteria] |

### Dimension 2: [Metric Name]
**Weight**: X%
[Same structure]

### Overall Score Calculation
Score = (D1 * W1) + (D2 * W2) + ... / Total Weights
```

### 3. Design Test Cases

創建完整測試案例：

```markdown
## Test Cases

### Category 1: Happy Path
應以高分通過之測試。

**Test 1.1: [Name]**
- Input: [Test input]
- Expected behavior: [What should happen]
- Success criteria: [Specific measurable outcome]

**Test 1.2: [Name]**
[Same structure]

### Category 2: Edge Cases
預期行為邊界之測試。

**Test 2.1: [Name]**
- Input: [Edge case input]
- Expected behavior: [Handling strategy]
- Success criteria: [What counts as success]

### Category 3: Adversarial Cases
應觸發拒絕或特殊處理之測試。

**Test 3.1: [Name]**
- Input: [Adversarial input]
- Expected behavior: [Refusal/redirect]
- Success criteria: [Appropriate handling]

### Category 4: Stress Tests
複雜或大型輸入之測試。

**Test 4.1: [Name]**
- Input: [Complex/large input]
- Expected behavior: [Quality maintenance]
- Success criteria: [Performance requirements]
```

### 4. Run Evaluation

執行測試並記錄結果：

```markdown
## Evaluation Results

### Test Results Summary

| Test | Score | D1 | D2 | D3 | Notes |
|------|-------|----|----|----|----- |
| 1.1 | X/5 | X | X | X | [Observation] |
| 1.2 | X/5 | X | X | X | [Observation] |
| 2.1 | X/5 | X | X | X | [Observation] |
| ... | ... | ... | ... | ... | ... |

### Aggregate Metrics
- **Mean Score**: X.XX / 5
- **Std Deviation**: X.XX
- **Min Score**: X.XX (Test [ID])
- **Max Score**: X.XX (Test [ID])

### Category Performance
- Happy Path: X.XX / 5 (N tests)
- Edge Cases: X.XX / 5 (N tests)
- Adversarial: X.XX / 5 (N tests)
- Stress Tests: X.XX / 5 (N tests)
```

### 5. Analyze Failure Modes

識別表現不佳測試之模式：

```markdown
## Failure Analysis

### Pattern 1: [Failure Type]
**Affected Tests**: [List]
**Symptoms**: [What goes wrong]
**Root Cause**: [Why it happens]
**Recommendation**: [How to fix]

### Pattern 2: [Failure Type]
[Same structure]

### Severity Matrix

| Failure Pattern | Frequency | Severity | Priority |
|-----------------|-----------|----------|----------|
| [Pattern 1] | X% | High | P1 |
| [Pattern 2] | X% | Medium | P2 |
```

### 6. Generate Improvement Recommendations

基於分析提出提示改進建議：

```markdown
## Improvement Recommendations

### High Priority (Address Immediately)
1. **[Issue]**: [Specific prompt change]
   - Expected impact: +X% on [metric]
   - Affected tests: [List]

### Medium Priority (Significant Improvement)
1. **[Issue]**: [Specific prompt change]
   - Expected impact: +X% on [metric]

### Low Priority (Polish)
1. **[Issue]**: [Specific prompt change]
   - Expected impact: +X% on [metric]

### Recommended Iterations
1. Apply high-priority changes
2. Re-run evaluation
3. Compare scores
4. Iterate until target met
```

### 7. Comparison Report (for A/B Testing)

比較兩個提示時：

```markdown
## A/B Comparison Report

### Prompt A vs Prompt B

| Metric | Prompt A | Prompt B | Delta | Winner |
|--------|----------|----------|-------|--------|
| Overall | X.XX | X.XX | +X.XX | A/B |
| Accuracy | X.XX | X.XX | +X.XX | A/B |
| Format | X.XX | X.XX | +X.XX | A/B |
| Consistency | X.XX | X.XX | +X.XX | A/B |

### Statistical Significance
- Sample size: N tests
- P-value: X.XXX
- Confidence: XX%

### Recommendation
[Which prompt to use and why]
```

## Advanced Evaluation Patterns

### LLM-as-Judge Pattern
以 Claude 評估輸出：

```markdown
## LLM Evaluation Prompt

You are evaluating an AI response. Score it on:
1. Accuracy (1-5): Is the information correct?
2. Relevance (1-5): Does it address the question?
3. Format (1-5): Does it follow the required format?

<input>{{original_input}}</input>
<response>{{ai_response}}</response>
<expected>{{expected_output}}</expected>

Provide scores and brief justification for each.
```

### Self-Consistency Check
測試輸出穩定性：

```markdown
## Consistency Test Protocol

1. 以相同輸入運行 N 次（推薦 N=5）
2. 比較輸出之：
   - 事實一致性
   - 格式一致性
   - 關鍵點覆蓋
3. 計算一致率
4. 標記高方差案例
```

### Regression Testing
跨提示迭代追蹤變化：

```markdown
## Regression Test Suite

### Baseline: Prompt v1.0
[Stored evaluation results]

### Current: Prompt vX.X
[New evaluation results]

### Regressions
- Test [ID]: Score dropped from X to Y
- Test [ID]: New failure mode detected

### Improvements
- Test [ID]: Score improved from X to Y
- Test [ID]: New edge case handled
```
