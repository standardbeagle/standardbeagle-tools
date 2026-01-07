---
description: "Model-specific prompt engineering guidelines for major LLMs"
---

# Model-Specific Prompting Reference (2026)

You are a multi-model prompt engineering specialist. This reference covers model-specific optimizations for major LLMs.

## Quick Reference Matrix

| Model Family | Best For | Key Patterns | Avoid |
|--------------|----------|--------------|-------|
| Claude 4.x | Agentic tasks, code | XML tags, explicit actions | "think" without extended thinking |
| GPT-4.1/5 | General, instruction-following | JSON/structured output | Over-prompting (follows well) |
| o1/o3/o4 | Complex reasoning | Simple prompts | Few-shot, explicit CoT |
| DeepSeek R1 | Deep reasoning | Minimal prompts | System prompts, examples |
| DeepSeek V3.1 | Hybrid (thinking + fast) | Mode selection | Mixing modes confusingly |
| Qwen 2.5 | Multilingual, math | \boxed{} for math | Long context without headers |
| Kimi K2 | Agentic, tool use | temp=0.6, native tools | XML tool outputs |
| Grok | Code, real-time | XML/MD sections | Vague prompts |
| GLM-4.7 | Code, Chinese | Thinking mode toggle | Unstructured long tasks |

## Claude (Anthropic)

### Claude 4.x (Sonnet/Opus/Haiku 4.5)

**Key characteristics**:
- Precise instruction following
- Excellent with XML structure
- Strong agentic capabilities
- Context-aware (tracks token budget)

**Best patterns**:
```xml
<!-- Claude loves XML structure -->
<task>Clear directive here</task>
<context>Background information</context>
<format>Expected output structure</format>
<guidelines>
- Guideline 1
- Guideline 2
</guidelines>
```

**Model-specific tips**:
- **Opus 4.5**: May overtrigger on tools; dial back aggressive language
- **Sonnet 4.5**: Aggressive parallel tool calling; great for agents
- **Haiku 4.5**: Needs more explicit instructions than larger models

**Avoid**:
- "think" variants when extended thinking is disabled
- Negative framing ("don't do X")
- Assuming it will go "above and beyond" without asking

[See: claude-optimization.md for full details]

## OpenAI GPT Models

### GPT-4.1 / GPT-4o

**Key characteristics**:
- Strong instruction following
- Good with JSON/structured output
- Multi-modal capable
- Fast responses

**Best patterns**:
```
Role: You are a [specific role with expertise].

Task: [Clear, specific task description]

Requirements:
1. [Specific requirement]
2. [Format specification]
3. [Constraints]

Output Format:
Return as JSON: {"field": "type", ...}
```

**Tips**:
- Pin to specific model snapshots for production
- Use `instructions` API parameter for highest priority guidance
- Provide context examples for best results
- Be specific about format requirements

### GPT-5

**Key characteristics**:
- Most capable GPT model
- Reasoning capabilities built-in
- Strong agentic potential

**Best patterns**:
- Similar to GPT-4.1 but can handle more complexity
- Less need for explicit step-by-step guidance
- Good at inferring intent

## OpenAI Reasoning Models (o1/o3/o4)

### o1, o3, o4-mini

**Key characteristics**:
- Internal chain-of-thought reasoning
- Excellent for complex problems
- Higher latency and cost
- Best for 5+ step problems

**Best patterns**:
```
Solve this problem:

[Clear problem statement]

Constraints:
- [Constraint 1]
- [Constraint 2]

Provide your final answer with explanation.
```

**Critical differences from standard LLMs**:
1. **NO few-shot examples** - degrades performance
2. **NO explicit CoT** ("think step by step") - they reason internally
3. **Simple, clear prompts** - don't over-engineer
4. **Let them think** - don't prescribe steps

**When to use**:
- Complex math/logic problems
- Multi-step planning
- Tasks requiring deep analysis
- When accuracy > speed/cost

## DeepSeek

### DeepSeek R1

**Key characteristics**:
- Dedicated reasoning model
- Open weights
- Very different prompting style

**Best patterns**:
```
[Direct problem statement]

[Any necessary context]

[Clear output expectation]
```

**Critical tips**:
- **Temperature**: 0.5-0.7 (0.6 recommended)
- **Top-p**: 0.95
- **No system prompt** (original R1)
- **No few-shot examples** - hurts performance
- **No CoT prompting** - it reasons internally

**Encourage thorough reasoning**:
```
"Take your time and think carefully about this problem."
```

### DeepSeek V3.1

**Key characteristics**:
- Hybrid model (thinking + non-thinking modes)
- 671B parameters, 37B activated
- 128K context

**Mode selection**:
```
# Thinking mode (like R1)
Use for: complex reasoning, math, analysis

# Non-thinking mode (like V3)
Use for: quick responses, simple tasks
```

## Qwen (Alibaba)

### Qwen 2.5

**Key characteristics**:
- Strong multilingual (29+ languages)
- Good at structured data (tables, JSON)
- Long context (128K)
- Strong math capabilities

**Best patterns for math**:
```
Please reason step by step, and put your final answer within \boxed{}.

Problem: [math problem]
```

**For tool-integrated reasoning (TIR)**:
```
Please integrate step-by-step reasoning and Python code to solve math problems.
Present the final result in LaTeX using a \boxed{} without any units.
```

**Tips**:
- Resilient to diverse system prompts
- Good at generating structured outputs (JSON)
- Can generate 8K+ tokens

## Kimi K2 (Moonshot AI)

### Kimi-K2-Instruct

**Key characteristics**:
- 1T total parameters, 32B activated (MoE)
- Strong agentic/tool-calling
- OpenAI/Anthropic API compatible

**Best patterns**:
```
# Native tool calling preferred
# Temperature: 0.6 recommended
# Clear, direct instructions
```

**Tips**:
- Strong tool-calling capabilities - use native format
- May require prompt iteration for optimal results
- Good default system prompt available
- Anthropic API maps temperature (real_temp = request_temp * 0.6)

### Kimi K2 Thinking

**For complex analysis**:
```
Please use K2 Thinking to analyze: [problem]

Requirements:
1) Display complete analysis approach
2) Provide step-by-step optimization strategy
3) Estimate improvement effects
```

## Grok (xAI)

### grok-code-fast-1

**Key characteristics**:
- 4x faster, 1/10th cost of competitors
- Optimized for agentic/coding tasks
- Strong tool calling support

**Best patterns**:
```markdown
## Context
[Thorough background information]

## Task
[Clear directive]

## Requirements
- [Requirement 1]
- [Requirement 2]

## Expected Output
[Format specification]
```

**Tips**:
- **Be thorough** in system prompts - makes huge difference
- Use **XML tags or Markdown** for structure
- Use **native tool calling** (not XML-based outputs)
- **Iterate quickly** - fast enough for rapid refinement
- Better for **agentic tasks** than one-shot queries

### Grok 3 Features

- **Think Mode**: For math, coding, science (auto chain-of-thought)
- **DeepSearch**: Explicitly request for current info
- **Image Generation**: Supports visual output

## GLM (Zhipu AI / Z.ai)

### GLM-4.7

**Key characteristics**:
- ~400B parameters
- 200K context window, 128K output
- Strong at code and math
- Chinese language excellence

**Best patterns**:
- Supports "Interleaved Thinking" mode
- Similar structure to other models
- Good for multi-step tasks

**Tips**:
- Available via BigModel.cn API
- Integrated into z.ai development environment
- Thinking mode for complex reasoning

## Code vs Text Prompting

### Code Generation Specifics

```xml
<code_request>
<language>Python</language>
<purpose>Calculate compound interest</purpose>
<inputs>
- principal: float
- rate: float (annual)
- years: int
</inputs>
<output>float (final amount)</output>
<constraints>
- Handle edge cases (negative values)
- Include docstring
- Type hints required
</constraints>
</code_request>
```

**Key differences from text**:
- Shorter prompts often work better (<50 words ideal)
- Specify language, inputs, outputs explicitly
- Include edge case handling requirements
- Request specific code style (comments, types)

### Text Generation

```
Write a [genre] piece about [topic].

Style: [tone, voice]
Length: [word count]
Audience: [target reader]
Include: [specific elements]
Avoid: [things to exclude]
```

## Reasoning vs Non-Reasoning Selection

### Use Reasoning Models (o1/o3/R1) When:
- Problem requires 5+ reasoning steps
- Accuracy is critical
- Task is math/logic/analysis heavy
- Time/cost are acceptable trade-offs

### Use Standard LLMs When:
- Task is straightforward
- Speed matters
- Format/examples are important
- Cost is a concern
- Few-shot learning helps

## Universal Best Practices

1. **Know your model**: Each has unique strengths
2. **Start simple**: Add complexity only if needed
3. **Test and iterate**: What works varies by model
4. **Check documentation**: Models evolve rapidly
5. **Match technique to model**: Don't use CoT on reasoning models
6. **Structure helps**: XML/Markdown improves most models
7. **Be explicit**: Newer models follow instructions literally
