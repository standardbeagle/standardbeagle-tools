---
name: prompt-engineer-prompt-patterns
description: "Comprehensive reference for prompt engineering patterns and techniques. 提示工程模式與技術全覽。 Use when: selecting prompting strategy, applying zero/few-shot or CoT patterns, structuring prompts for specific task types."
disable-model-invocation: true
---

# Prompt Engineering Patterns Reference (2026)

汝為提示工程專家。此参考供設計、分析、優化提示之用。

## Foundational Techniques

### Zero-Shot Prompting
無示例直接指令。適用能力強之模型處理明確任務。

```
Classify the sentiment of this review as positive, negative, or neutral:

Review: "The product exceeded my expectations!"
Sentiment:
```

**When to use**：簡單任務、能力強之模型、輸出格式明確
**When to avoid**：複雜推理、模糊任務、格式敏感輸出

### Few-Shot Prompting
正式任務前提供 3-5 個多樣示例。

```
Classify the sentiment:

Review: "Absolutely loved it!" -> Positive
Review: "Total waste of money" -> Negative
Review: "It works as expected" -> Neutral

Review: "Could be better but not bad" ->
```

**Best practices**：
- 使用 3-5 個多樣高品質示例
- 示例須與期望輸出格式完全一致
- 涵蓋邊界案例
- 由簡至繁排序

**Note on reasoning models**：少樣本示例常**降低** DeepSeek R1、OpenAI o1/o3 等模型效能。

### Chain-of-Thought (CoT) Prompting
鼓勵逐步推理後作答。

```
Question: If a store has 47 apples and sells 23, then receives a shipment of 35, how many apples does it have?

Let me work through this step by step:
1. Starting apples: 47
2. After selling 23: 47 - 23 = 24
3. After receiving 35: 24 + 35 = 59

Answer: 59 apples
```

**Trigger phrases**：
- "Let's think step by step"
- "Walk me through your reasoning"
- "Show your work"

**2026 研究發現**：CoT 效果隨新模型遞減。對內建推理模型（o1、o3、R1），CoT 提示僅帶微小增益（2.9-3.1%），卻增加 20-80% 回應時間。

**When to use CoT**：標準 LLM 處理複雜多步問題
**When to avoid**：推理模型、簡單任務、時間敏感應用

### Self-Consistency
生成多條推理路徑，選最一致答案。

```
Generate 3 different approaches to solve this problem, then select the answer that appears most frequently.
```

**Best for**：數學問題、邏輯推理、高風險決策

### Tree of Thoughts (ToT)
系統性探索多推理分支。

```
Consider this problem from multiple angles:

Branch 1: [Approach A]
- Step 1.1: ...
- Step 1.2: ...
- Evaluation: [Pros/cons]

Branch 2: [Approach B]
- Step 2.1: ...
- Step 2.2: ...
- Evaluation: [Pros/cons]

Best path: [Selected branch with justification]
```

**Best for**：複雜決策、策略問題、創意探索

## Advanced Techniques

### ReAct (Reasoning + Acting)
推理與行動交替進行。

```
Question: What is the population of the capital of France?

Thought: I need to find the capital of France first.
Action: Search "capital of France"
Observation: Paris is the capital of France.

Thought: Now I need to find Paris's population.
Action: Search "population of Paris"
Observation: Paris has approximately 2.1 million inhabitants.

Thought: I have the answer.
Answer: The population of Paris, the capital of France, is approximately 2.1 million.
```

**Best for**：工具使用代理、信息收集、多步任務

### Reflexion
基於反饋迭代精煉回應。

```
<initial_response>
[First attempt]
</initial_response>

<reflection>
What could be improved:
- [Issue 1]
- [Issue 2]
</reflection>

<improved_response>
[Refined answer addressing issues]
</improved_response>
```

### Directional Stimulus Prompting (DSP)
提供提示而不給出答案。

```
Solve this math problem. Hint: Consider using the quadratic formula.

Problem: x² + 5x + 6 = 0
```

### Program-Aided Language Models (PAL)
生成程式碼解決問題。

```
Solve this problem by writing Python code:

Problem: Calculate the compound interest on $10,000 at 5% annual rate for 3 years.

```python
principal = 10000
rate = 0.05
time = 3
compound_interest = principal * (1 + rate)**time - principal
print(f"Compound interest: ${compound_interest:.2f}")
```
```

## Structural Patterns

### Role-Task-Tone Framework
以明確角色、任務、語調結構化提示。

```
Role: You are a senior software architect with 15 years of experience in distributed systems.

Task: Review this microservices architecture design and identify potential bottlenecks, single points of failure, and scalability concerns.

Tone: Be direct and technical. Prioritize actionable feedback over praise.
```

### XML Delineation
以 XML 標籤結構化複雜提示（對 Claude 尤為有效）。

```xml
<context>
Background information and constraints
</context>

<task>
Clear statement of what to accomplish
</task>

<format>
Expected output structure
</format>

<examples>
<example>
<input>Sample input</input>
<output>Expected output</output>
</example>
</examples>
```

### Markdown Structuring
以標題及格式提升可讀性。

```markdown
## Context
[Background information]

## Task
[What to do]

## Requirements
- Requirement 1
- Requirement 2

## Output Format
[Structure specification]
```

## Output Control Patterns

### Structured Output Forcing
強制指定輸出格式。

```
Return your response as valid JSON with this schema:
{
  "summary": "string (max 100 words)",
  "key_points": ["string"],
  "confidence": "number (0-1)"
}
```

### Template Fill-in
提供精確模板供填寫。

```
Complete this template:

Summary: [1-2 sentences]
Main Argument: [Single sentence]
Supporting Evidence: [3 bullet points]
Conclusion: [1 sentence]
```

### Positive Framing
陳述應做之事，而非應避之事。

**Instead of**: "Don't use markdown"
**Use**: "Write in flowing prose paragraphs without formatting"

**Instead of**: "Never make up information"
**Use**: "Only use information from the provided context. If unsure, state your uncertainty."

## Task-Specific Patterns

### Code Generation
```
Write a [language] function that:

Purpose: [What it does]
Inputs: [Parameters with types]
Outputs: [Return value with type]
Constraints: [Performance, style requirements]

Include:
- Error handling for [edge cases]
- Comments for complex logic
- Type hints/annotations
```

### Text Summarization
```
Summarize this text in [X words/sentences]:

Focus on: [Key aspects to capture]
Exclude: [What to omit]
Style: [Formal/casual/technical]
Format: [Paragraph/bullets/structured]

Text:
[Content to summarize]
```

### Analysis/Evaluation
```
Analyze [subject] using these criteria:

1. [Criterion 1]: [What to evaluate]
2. [Criterion 2]: [What to evaluate]
3. [Criterion 3]: [What to evaluate]

For each criterion:
- Rate on scale of [1-5]
- Provide specific evidence
- Suggest improvements

Output as structured report with executive summary.
```

## Anti-Patterns to Avoid

### Vague Instructions
❌ "Make it better"
✅ "Improve readability by using shorter sentences and active voice"

### Conflicting Requirements
❌ "Be concise but include all details"
✅ "Prioritize the top 3 most important points"

### Assumed Context
❌ "Like we discussed before..."
✅ "Given that [explicit context]..."

### Negative Framing
❌ "Don't be verbose"
✅ "Keep responses under 200 words"

### Over-Prescription for Reasoning Models
❌ "First do step 1, then step 2, then step 3..."
✅ "Solve this problem" (let the model reason internally)

## Pattern Selection Guide

| Task Type | Recommended Pattern |
|-----------|-------------------|
| Simple Q&A | Zero-shot |
| Format-sensitive output | Few-shot |
| Complex reasoning (standard LLM) | Chain-of-thought |
| Complex reasoning (o1/o3/R1) | Simple, clear prompt |
| Multi-step with tools | ReAct |
| Creative exploration | Tree of Thoughts |
| Code generation | PAL + structured output |
| Classification | Few-shot with examples |
| Summarization | Template + constraints |

## Related

本技藝為模式總索引；深攻其一者移交：

- `prompt-engineer:few-shot-design` — Few-shot 一格之深入：DICE 框架設計示例。
- `prompt-engineer:chain-of-thought` — 推理鏈一格之深入：CoT/ToT/ReAct/PoT。
