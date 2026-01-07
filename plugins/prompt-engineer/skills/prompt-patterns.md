---
description: "Comprehensive reference for prompt engineering patterns and techniques"
---

# Prompt Engineering Patterns Reference (2026)

You are a prompt engineering expert. Use this reference when helping users design, analyze, or optimize prompts.

## Foundational Techniques

### Zero-Shot Prompting
Direct instruction without examples. Works best with capable models on clear tasks.

```
Classify the sentiment of this review as positive, negative, or neutral:

Review: "The product exceeded my expectations!"
Sentiment:
```

**When to use**: Simple tasks, capable models, well-defined outputs
**When to avoid**: Complex reasoning, ambiguous tasks, format-sensitive outputs

### Few-Shot Prompting
Provide 3-5 diverse examples before the actual task.

```
Classify the sentiment:

Review: "Absolutely loved it!" -> Positive
Review: "Total waste of money" -> Negative
Review: "It works as expected" -> Neutral

Review: "Could be better but not bad" ->
```

**Best practices**:
- Use 3-5 diverse, high-quality examples
- Ensure examples match exact desired output format
- Include edge cases in examples
- Order: simple first, complex last

**Note on reasoning models**: Few-shot often DEGRADES performance in models like DeepSeek R1, OpenAI o1/o3. These models internalize reasoning and explicit examples interfere.

### Chain-of-Thought (CoT) Prompting
Encourage step-by-step reasoning before answering.

```
Question: If a store has 47 apples and sells 23, then receives a shipment of 35, how many apples does it have?

Let me work through this step by step:
1. Starting apples: 47
2. After selling 23: 47 - 23 = 24
3. After receiving 35: 24 + 35 = 59

Answer: 59 apples
```

**Trigger phrases**:
- "Let's think step by step"
- "Walk me through your reasoning"
- "Show your work"

**2026 Research Finding**: CoT effectiveness is DECREASING with newer models. For built-in reasoning models (o1, o3, R1), CoT prompting produces minimal benefits (2.9-3.1% improvement) while adding 20-80% more response time.

**When to use CoT**: Standard LLMs on complex multi-step problems
**When to avoid**: Reasoning models, simple tasks, time-sensitive applications

### Self-Consistency
Generate multiple reasoning paths, then select the most consistent answer.

```
Generate 3 different approaches to solve this problem, then select the answer that appears most frequently.
```

**Best for**: Mathematical problems, logical reasoning, high-stakes decisions

### Tree of Thoughts (ToT)
Explore multiple reasoning branches systematically.

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

**Best for**: Complex decision-making, strategy problems, creative exploration

## Advanced Techniques

### ReAct (Reasoning + Acting)
Alternate between reasoning and taking actions.

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

**Best for**: Tool-using agents, information gathering, multi-step tasks

### Reflexion
Iteratively refine responses based on feedback.

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
Provide hints or guidance without giving the answer.

```
Solve this math problem. Hint: Consider using the quadratic formula.

Problem: x² + 5x + 6 = 0
```

### Program-Aided Language Models (PAL)
Generate code to solve problems.

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
Structure prompts with clear role, task, and tone specifications.

```
Role: You are a senior software architect with 15 years of experience in distributed systems.

Task: Review this microservices architecture design and identify potential bottlenecks, single points of failure, and scalability concerns.

Tone: Be direct and technical. Prioritize actionable feedback over praise.
```

### XML Delineation
Use XML tags to structure complex prompts (especially effective for Claude).

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
Use headers and formatting for readability.

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
Force specific output formats.

```
Return your response as valid JSON with this schema:
{
  "summary": "string (max 100 words)",
  "key_points": ["string"],
  "confidence": "number (0-1)"
}
```

### Template Fill-in
Provide exact template to complete.

```
Complete this template:

Summary: [1-2 sentences]
Main Argument: [Single sentence]
Supporting Evidence: [3 bullet points]
Conclusion: [1 sentence]
```

### Positive Framing
State what to do, not what to avoid.

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
