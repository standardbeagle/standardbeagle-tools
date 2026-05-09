---
name: prompt-engineer-automatic-optimization
description: "Automatic prompt optimization via DSPy, OPRO, and evaluation-driven methods. 自動提示優化：DSPy、OPRO 及評估驅動法。 Use when: iterating prompts programmatically, defining optimization metrics, running A/B or regression tests on prompt variants."
disable-model-invocation: true
---

# Automatic Prompt Optimization Reference (2026)

汝為自動提示優化專家。此参考涵 DSPy、OPRO 及程序化提示優化之術。

## The Optimization Paradigm

### From Manual to Automatic

傳統提示工程為手動迭代：
```
1. Write prompt
2. Test on examples
3. Identify failures
4. Manually revise
5. Repeat
```

自動優化為程序化：
```
1. Define signature (input → output)
2. Define metric (what makes output "good")
3. Provide training examples
4. Run optimizer
5. Get optimized prompt automatically
```

## DSPy Framework

### Core Concept

DSPy 視提示為**可學習程序**，非靜態文字。定義：
- **Signatures**：輸入/輸出規格
- **Modules**：處理步驟
- **Metrics**：成功標準

框架自動優化提示、示例、鏈路。

### Basic Signature

```python
# Define what you want
class SentimentClassifier(dspy.Signature):
    """Classify the sentiment of a text."""

    text: str = dspy.InputField()
    sentiment: Literal["positive", "negative", "neutral"] = dspy.OutputField()

# Create predictor
classifier = dspy.Predict(SentimentClassifier)

# Use it
result = classifier(text="I love this product!")
print(result.sentiment)  # "positive"
```

### Chain of Thought Module

```python
class ReasonedAnswer(dspy.Signature):
    """Answer a question with reasoning."""

    question: str = dspy.InputField()
    reasoning: str = dspy.OutputField(desc="Step-by-step reasoning")
    answer: str = dspy.OutputField(desc="Final answer")

# Use CoT module
reasoner = dspy.ChainOfThought(ReasonedAnswer)
```

### Multi-Step Pipeline

```python
class QuestionAnsweringPipeline(dspy.Module):
    def __init__(self):
        self.retriever = dspy.Retrieve(k=3)
        self.generator = dspy.ChainOfThought("context, question -> answer")

    def forward(self, question):
        context = self.retriever(question)
        answer = self.generator(context=context, question=question)
        return answer
```

## DSPy Optimizers

### COPRO (Coordinate Ascent)

逐步精煉指令：

```python
from dspy.teleprompt import COPRO

optimizer = COPRO(
    metric=your_metric,
    depth=3,  # Number of refinement iterations
    breadth=5  # Candidates per iteration
)

optimized_program = optimizer.compile(
    your_program,
    trainset=your_examples
)
```

**Best for**: 指令優化、單模組程序

### MIPROv2 (Bayesian Optimization)

同時優化指令與少樣本示例：

```python
from dspy.teleprompt import MIPROv2

optimizer = MIPROv2(
    metric=your_metric,
    num_candidates=10,
    num_trials=50
)

optimized_program = optimizer.compile(
    your_program,
    trainset=train_examples,
    valset=val_examples
)
```

**Best for**: 複雜程序、示例影響顯著之情形

### SIMBA (Mini-Batch Sampling)

聚焦難例：

```python
from dspy.teleprompt import SIMBA

optimizer = SIMBA(
    metric=your_metric,
    batch_size=8,
    num_iterations=20
)

# Identifies challenging examples with high variance
# Generates improvement rules from failure analysis
```

**Best for**: 提升穩健性、處理邊界案例

## Defining Metrics

### Exact Match

```python
def exact_match(example, prediction, trace=None):
    return example.answer.lower() == prediction.answer.lower()
```

### F1 Score

```python
def token_f1(example, prediction, trace=None):
    gold_tokens = set(example.answer.lower().split())
    pred_tokens = set(prediction.answer.lower().split())

    if not pred_tokens:
        return 0

    precision = len(gold_tokens & pred_tokens) / len(pred_tokens)
    recall = len(gold_tokens & pred_tokens) / len(gold_tokens)

    if precision + recall == 0:
        return 0

    return 2 * precision * recall / (precision + recall)
```

### LLM-as-Judge

```python
class JudgeSignature(dspy.Signature):
    """Judge if the answer is correct and complete."""

    question: str = dspy.InputField()
    gold_answer: str = dspy.InputField()
    predicted_answer: str = dspy.InputField()
    judgment: Literal["correct", "partially_correct", "incorrect"] = dspy.OutputField()

judge = dspy.Predict(JudgeSignature)

def llm_judge_metric(example, prediction, trace=None):
    result = judge(
        question=example.question,
        gold_answer=example.answer,
        predicted_answer=prediction.answer
    )
    return {"correct": 1.0, "partially_correct": 0.5, "incorrect": 0.0}[result.judgment]
```

### Composite Metrics

```python
def composite_metric(example, prediction, trace=None):
    accuracy = exact_match(example, prediction)
    format_score = 1.0 if prediction.answer.startswith("Answer:") else 0.5
    length_score = 1.0 if len(prediction.answer) < 200 else 0.7

    return 0.6 * accuracy + 0.2 * format_score + 0.2 * length_score
```

## OPRO (Optimization by Prompting)

以 LLM 進行元提示優化：

### Meta-Prompt Structure

```
You are optimizing prompts for a [task] system.

Current best prompts and their scores:
1. "[Prompt A]" - Score: 0.75
2. "[Prompt B]" - Score: 0.72
3. "[Prompt C]" - Score: 0.70

Recent attempts that didn't improve:
- "[Failed prompt D]" - Score: 0.65 (issue: too vague)
- "[Failed prompt E]" - Score: 0.60 (issue: wrong format)

Task description: [What the prompt should accomplish]
Evaluation criteria: [How prompts are scored]

Generate 3 new prompt candidates that might score higher.
Focus on addressing the issues found in failed attempts.
```

### OPRO Workflow

```python
def opro_optimize(initial_prompts, evaluator, iterations=10):
    history = []

    for prompt in initial_prompts:
        score = evaluator(prompt)
        history.append((prompt, score))

    for _ in range(iterations):
        # Sort by score
        history.sort(key=lambda x: x[1], reverse=True)

        # Generate meta-prompt
        meta_prompt = create_meta_prompt(
            top_prompts=history[:3],
            failed_prompts=history[-3:],
            task_description=TASK_DESC
        )

        # Generate new candidates
        candidates = llm.generate(meta_prompt, n=3)

        # Evaluate candidates
        for candidate in candidates:
            score = evaluator(candidate)
            history.append((candidate, score))

    return max(history, key=lambda x: x[1])
```

## Evaluation-Driven Optimization

### Test Set Design

```python
test_cases = [
    # Happy path cases (60%)
    {"input": "typical input 1", "expected": "expected output 1", "category": "happy"},
    {"input": "typical input 2", "expected": "expected output 2", "category": "happy"},

    # Edge cases (25%)
    {"input": "empty input", "expected": "appropriate handling", "category": "edge"},
    {"input": "very long input...", "expected": "still works", "category": "edge"},

    # Adversarial cases (15%)
    {"input": "injection attempt", "expected": "safe handling", "category": "adversarial"},
]
```

### A/B Testing Framework

```python
def ab_test_prompts(prompt_a, prompt_b, test_set, metric):
    results_a = [metric(prompt_a, case) for case in test_set]
    results_b = [metric(prompt_b, case) for case in test_set]

    mean_a, mean_b = np.mean(results_a), np.mean(results_b)
    _, p_value = stats.ttest_ind(results_a, results_b)

    return {
        "prompt_a_mean": mean_a,
        "prompt_b_mean": mean_b,
        "winner": "A" if mean_a > mean_b else "B",
        "p_value": p_value,
        "significant": p_value < 0.05
    }
```

### Regression Testing

```python
def check_regression(new_prompt, baseline_prompt, test_set, metric, tolerance=0.05):
    baseline_scores = [metric(baseline_prompt, case) for case in test_set]
    new_scores = [metric(new_prompt, case) for case in test_set]

    regressions = []
    for i, (old, new) in enumerate(zip(baseline_scores, new_scores)):
        if new < old - tolerance:
            regressions.append({
                "case": test_set[i],
                "baseline_score": old,
                "new_score": new,
                "delta": new - old
            })

    return {
        "has_regressions": len(regressions) > 0,
        "regressions": regressions,
        "overall_improvement": np.mean(new_scores) - np.mean(baseline_scores)
    }
```

## Best Practices

### Start Simple

```
1. Define clear signature
2. Use simple metric (exact match)
3. Run basic optimizer (COPRO)
4. Analyze failures
5. Refine metric and re-optimize
```

### Iterative Refinement

```
1. Optimize for accuracy first
2. Add format constraints to metric
3. Add robustness tests
4. Optimize for efficiency (fewer tokens)
5. Final polish
```

### Metric Design Tips

- **Start binary**：正確/錯誤
- **Add granularity**：部分分數
- **Include format**：結構要求
- **Consider cost**：令牌效率
- **Test edge cases**：穩健性

### Common Pitfalls

- **Overfitting**：測試示例過少
- **Wrong metric**：優化方向偏差
- **Local optima**：需要多樣起點
- **Cost explosion**：LLM 調用過多
- **Regression**：未檢查已損壞項
