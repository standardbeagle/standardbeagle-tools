---
description: "Evaluate prompt effectiveness using metrics and test cases"
allowed-tools: ["Read", "Write", "AskUserQuestion", "Bash"]
---

Evaluate prompt effectiveness using systematic metrics and test cases inspired by DSPy and OPRO methodologies.

## Evaluation Framework

### 1. Define Success Criteria

Use AskUserQuestion to establish metrics:

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

Generate a scoring rubric:

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

Create comprehensive test cases:

```markdown
## Test Cases

### Category 1: Happy Path
Tests that should succeed with high scores.

**Test 1.1: [Name]**
- Input: [Test input]
- Expected behavior: [What should happen]
- Success criteria: [Specific measurable outcome]

**Test 1.2: [Name]**
[Same structure]

### Category 2: Edge Cases
Tests at boundaries of expected behavior.

**Test 2.1: [Name]**
- Input: [Edge case input]
- Expected behavior: [Handling strategy]
- Success criteria: [What counts as success]

### Category 3: Adversarial Cases
Tests that should trigger refusals or special handling.

**Test 3.1: [Name]**
- Input: [Adversarial input]
- Expected behavior: [Refusal/redirect]
- Success criteria: [Appropriate handling]

### Category 4: Stress Tests
Tests with complex or large inputs.

**Test 4.1: [Name]**
- Input: [Complex/large input]
- Expected behavior: [Quality maintenance]
- Success criteria: [Performance requirements]
```

### 4. Run Evaluation

Execute tests and record results:

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

Identify patterns in underperforming tests:

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

Based on analysis, suggest prompt improvements:

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

If comparing two prompts:

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
Use Claude to evaluate outputs:

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
Test output stability:

```markdown
## Consistency Test Protocol

1. Run same input N times (N=5 recommended)
2. Compare outputs for:
   - Factual consistency
   - Format consistency
   - Key point coverage
3. Calculate agreement rate
4. Flag high-variance cases
```

### Regression Testing
Track changes over prompt iterations:

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
