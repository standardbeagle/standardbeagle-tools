---
name: prompt-engineer-chain-of-thought
description: "Chain-of-thought and reasoning technique patterns for standard and reasoning LLMs. 思維鏈及推理技術模式，適用標準模型與推理模型。 Use when: multi-step math or logic tasks, deciding CoT vs reasoning-model strategy, implementing Tree-of-Thoughts or ReAct patterns."
disable-model-invocation: true
---

# Chain-of-Thought & Reasoning Reference (2026)

汝為推理優化專家。此参考涵思維鏈提示、推理模型最佳實踐，及各方法適用時機。

## The 2026 Landscape

### Critical Update: Reasoning Models Changed Everything

2025-2026 年，專用推理模型（OpenAI o1/o3/o4、DeepSeek R1、Claude 擴展思考）改變提示範式：

| Model Type | CoT Prompting Effect |
|------------|---------------------|
| Standard LLMs | +10-20% improvement |
| Reasoning Models | +2-3% or NEGATIVE |

**關鍵洞見**：推理模型內化思維鏈。顯式 CoT 提示常**降低**其效能，干擾原生推理。

## Standard LLM CoT Prompting

### When to Use (Standard LLMs)

標準 LLM（GPT-4o、Claude 無思考模式、Qwen 等）適用顯式 CoT 之情形：
- 多步數學問題
- 邏輯推理
- 複雜分析
- 含取捨之決策
- 需三步以上推理之任務

### Basic CoT Patterns

**Zero-shot CoT**:
```
Question: [Problem]

Let's approach this step by step.
```

**Trigger phrases**:
- "Let's think step by step"
- "Walk me through your reasoning"
- "Show your work"
- "Break this down"

**Few-shot CoT** (示範推理示例):
```
Q: If a train travels 60 mph for 2 hours, how far does it go?
A: Let me work through this:
- Speed: 60 mph
- Time: 2 hours
- Distance = Speed × Time = 60 × 2 = 120 miles
Answer: 120 miles

Q: If a car travels 45 mph for 3 hours, how far does it go?
A:
```

### Advanced CoT Patterns

**Self-Consistency** (多路徑):
```
Generate 3 different approaches to solve this problem.
For each approach, show your reasoning.
Then select the answer that appears most frequently.
```

**Structured CoT**:
```xml
<problem>
[Problem statement]
</problem>

<reasoning>
<step number="1">
<thought>[Initial analysis]</thought>
<action>[What I'll do]</action>
</step>
<step number="2">
<thought>[Building on step 1]</thought>
<action>[Next action]</action>
</step>
...
</reasoning>

<conclusion>
[Final answer with justification]
</conclusion>
```

## Reasoning Model Prompting (o1/o3/R1)

### Core Principles

1. **簡潔明確提示最佳**
2. **避免顯式 CoT 指令**（內部自行推理）
3. **勿用少樣本示例**（降低效能）
4. **讓其思考**（勿以逐步引導打斷）

### What NOT to Do

```
❌ WRONG for reasoning models:

"Let's think step by step. First, analyze X, then consider Y,
finally conclude Z. Here are some examples of how to approach
similar problems:

Example 1: [detailed example]
Example 2: [detailed example]

Now solve this problem following the same approach..."
```

### What TO Do

```
✅ CORRECT for reasoning models:

"Solve this optimization problem:
[Clear problem statement]

Constraints:
- [Constraint 1]
- [Constraint 2]

Find the optimal solution and explain your reasoning."
```

### Recommended Settings (DeepSeek R1)

```
Temperature: 0.5-0.7 (0.6 recommended)
Top-p: 0.95
No system prompt (original R1)
All instructions in user prompt
```

### Encouraging Deep Reasoning

以鼓勵徹底分析代替規定步驟：

```
"Take your time and think carefully about this problem."

"This is a complex problem that may have subtle aspects.
Consider multiple angles before concluding."

"I'd rather have a thorough analysis than a quick answer."
```

## When to Use Which Approach

### Decision Matrix

| Task Complexity | Standard LLM | Reasoning Model |
|-----------------|--------------|-----------------|
| Simple (1-2 steps) | Zero-shot | Overkill, slower |
| Medium (3-5 steps) | CoT recommended | Slight improvement |
| Complex (5+ steps) | CoT essential | Best choice |
| Time-sensitive | Preferred | Too slow |
| Accuracy-critical | Good + CoT | Best |

### Cost-Benefit Analysis

推理模型內部生成令牌多 10-100 倍：

```
Simple question:
- Standard LLM: ~100 tokens, $0.001
- Reasoning model: ~2000 tokens, $0.02

Complex problem:
- Standard LLM: ~500 tokens, $0.005 (may be wrong)
- Reasoning model: ~10000 tokens, $0.10 (likely correct)

Choose based on: accuracy needs vs cost tolerance
```

## Tree of Thoughts (ToT)

複雜問題需探索多路徑時：

```xml
<problem>
[Complex problem statement]
</problem>

<exploration>
<branch id="A" approach="Conservative">
<step>First consideration...</step>
<step>Second consideration...</step>
<evaluation>Pros: [list] | Cons: [list]</evaluation>
<score>7/10</score>
</branch>

<branch id="B" approach="Aggressive">
<step>Alternative first step...</step>
<step>Following step...</step>
<evaluation>Pros: [list] | Cons: [list]</evaluation>
<score>6/10</score>
</branch>

<branch id="C" approach="Hybrid">
<step>Combined approach...</step>
<step>Refined step...</step>
<evaluation>Pros: [list] | Cons: [list]</evaluation>
<score>8/10</score>
</branch>
</exploration>

<selection>
Branch C selected because: [justification]
</selection>

<final_answer>
[Detailed solution following Branch C]
</final_answer>
```

## Reflexion Pattern

自我批判循環改進：

```xml
<initial_response>
[First attempt at answer]
</initial_response>

<reflection>
Analyzing my response:
- Strengths: [what worked]
- Weaknesses: [what could improve]
- Errors: [mistakes identified]
- Missing: [gaps in reasoning]
</reflection>

<improved_response>
[Refined answer addressing issues]
</improved_response>

<confidence>
After revision: [HIGH/MEDIUM/LOW] because [justification]
</confidence>
```

## Program of Thought (PoT)

可由程式解決之問題：

```
Problem: Calculate compound interest on $10,000 at 5%
annually for 10 years with monthly compounding.

Approach: I'll write code to compute this precisely.

```python
principal = 10000
annual_rate = 0.05
years = 10
compounds_per_year = 12

monthly_rate = annual_rate / compounds_per_year
total_periods = years * compounds_per_year

final_amount = principal * (1 + monthly_rate) ** total_periods
interest_earned = final_amount - principal

print(f"Final amount: ${final_amount:.2f}")
print(f"Interest earned: ${interest_earned:.2f}")
```

Result: Final amount: $16,470.09, Interest earned: $6,470.09
```

## ReAct (Reasoning + Acting)

需工具使用之任務：

```
Question: What was Apple's stock price on the day the iPhone 15 was announced?

Thought: I need to find when iPhone 15 was announced, then look up stock price.

Action: search("iPhone 15 announcement date")
Observation: iPhone 15 was announced on September 12, 2023.

Thought: Now I need to find AAPL stock price on that date.

Action: get_stock_price("AAPL", "2023-09-12")
Observation: AAPL closed at $176.30 on September 12, 2023.

Thought: I have both pieces of information.

Answer: Apple's stock price was $176.30 on September 12, 2023,
the day iPhone 15 was announced.
```

## Hybrid Approaches

### Standard LLM with CoT Verification

```
[Standard prompt with CoT]

After reaching your answer, verify by:
1. Re-reading the original question
2. Checking each step for errors
3. Confirming the answer makes sense
4. If doubt remains, try an alternative approach
```

### Reasoning Model with Structured Output

```
Solve this problem. Your response should end with:

<answer>
<value>[numerical or categorical answer]</value>
<confidence>[HIGH/MEDIUM/LOW]</confidence>
<key_insight>[one sentence summarizing the critical reasoning step]</key_insight>
</answer>
```

## Common Mistakes

### Over-Prescribing Steps
```
❌ "First do A, then B, then C, then D..."
✅ "Solve this problem thoroughly"
```

### Using CoT on Simple Tasks
```
❌ "Let's think step by step about what 2+2 equals"
✅ "What is 2+2?"
```

### Few-Shot with Reasoning Models
```
❌ [Examples] for o1/o3/R1
✅ Clear problem statement only
```

### Interrupting Native Reasoning
```
❌ "Explain each step as you go"
✅ "Solve this and provide your final answer with reasoning"
```

## Related

- `prompt-engineer:prompt-patterns` — 模式總索引；本技藝為其推理鏈一格之深入展開。
