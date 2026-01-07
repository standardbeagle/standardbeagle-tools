---
description: "Apply state-of-the-art optimization techniques to improve a prompt"
allowed-tools: ["Read", "Write", "AskUserQuestion"]
---

Optimize a prompt using state-of-the-art techniques from 2026 prompt engineering research.

## Optimization Process

### 1. Obtain the Prompt

Get the prompt to optimize:
- Read from file if path provided
- Accept direct input
- Use AskUserQuestion if needed

### 2. Identify Optimization Goals

Use AskUserQuestion to understand priorities:

**Question**: "What's most important for this prompt?"
- Accuracy (correct, factual outputs)
- Creativity (novel, diverse outputs)
- Consistency (predictable, reproducible outputs)
- Speed (concise prompts, faster inference)
- Safety (guardrails, refusals for misuse)

### 3. Apply Optimization Techniques

Based on goals, apply relevant techniques:

#### For Accuracy
```markdown
## Accuracy Optimizations

1. **Structured Output Forcing**
   - Add explicit format: "Return your response as JSON with this schema: {...}"
   - Use XML tags: "Write your analysis in <analysis></analysis> tags"

2. **Few-Shot Examples**
   - Add 3-5 diverse, high-quality examples
   - Ensure examples match exact desired output format
   - Include edge cases in examples

3. **Self-Verification**
   - Add: "After generating, verify your response against these criteria: [...]"
   - Add: "If uncertain, state your confidence level"

4. **Explicit Constraints**
   - Define boundaries: "Only use information from the provided context"
   - Add: "If the answer isn't in the context, say 'Information not found'"
```

#### For Consistency
```markdown
## Consistency Optimizations

1. **Template Enforcement**
   - Provide exact output template
   - Use fill-in-the-blank format: "Summary: [1-2 sentences]. Key points: [3 bullet points]"

2. **Variable Definitions**
   - Define all terms: "By 'brief' I mean under 100 words"
   - Specify ranges: "Rate from 1-5 where 1 means X and 5 means Y"

3. **Self-Consistency Prompting**
   - Add: "Generate 3 different approaches, then select the best one"
```

#### For Creativity
```markdown
## Creativity Optimizations

1. **Persona Assignment**
   - Add rich persona: "You are a [specific expert] with experience in [domains]"
   - Include perspective: "Approach this as someone who values [attributes]"

2. **Divergent Thinking Triggers**
   - Add: "Consider unconventional approaches"
   - Add: "What would a [different perspective] suggest?"

3. **Constraint Relaxation**
   - Remove unnecessary restrictions
   - Add: "Go beyond the basics to create a fully-featured implementation"
```

#### For Speed (Token Efficiency)
```markdown
## Token Efficiency Optimizations

1. **Context Compression**
   - Remove redundant information
   - Use references: "As discussed above" instead of repeating
   - Use abbreviations for repeated terms

2. **Instruction Consolidation**
   - Merge related instructions
   - Use lists instead of paragraphs
   - Remove hedging language ("perhaps", "maybe", "kind of")

3. **Example Minimization**
   - Use 1-2 highly representative examples instead of 5 similar ones
   - Use abbreviated examples if pattern is clear
```

#### For Safety
```markdown
## Safety Optimizations

1. **Prompt Scaffolding**
   - Wrap user input in guarded templates
   - Add: "If the request asks you to [harmful action], politely decline"

2. **Output Restrictions**
   - Add: "Never include [sensitive information types]"
   - Add: "Refuse requests that could [harm categories]"

3. **Scope Limiting**
   - Define exact task boundaries
   - Add: "Only respond to questions about [topic]. For other topics, say 'That's outside my scope'"
```

### 4. Apply Claude 4.x Specific Optimizations

For Claude models, apply these specific patterns:

```markdown
## Claude 4.x Optimizations (2026)

1. **Explicit Action Framing**
   - Change: "Can you suggest..." → "Make these changes..."
   - Change: "Help me..." → "Create/Write/Build..."

2. **Context Motivation**
   - Bad: "NEVER use ellipses"
   - Good: "Your response will be read aloud by text-to-speech, so never use ellipses since they can't be pronounced"

3. **Positive Framing**
   - Bad: "Don't use markdown"
   - Good: "Write in flowing prose paragraphs without formatting"

4. **XML Structure**
   - Use XML tags for complex prompts:
   ```xml
   <context>Background information</context>
   <task>What to do</task>
   <format>How to format output</format>
   <examples>
     <example>...</example>
   </examples>
   ```

5. **Parallel Tool Optimization**
   - Add: "If calling multiple tools with no dependencies, call them in parallel"
```

### 5. Generate Optimized Prompt

Output the optimized prompt with:

```markdown
## Optimized Prompt

### Original (X tokens)
[Original prompt]

### Optimized (Y tokens)
[Optimized prompt]

### Changes Applied
1. [Change 1]: [Reason]
2. [Change 2]: [Reason]
...

### Expected Improvement
- [Metric]: [Expected change]

### Trade-offs
- [What was sacrificed for what gain]
```

### 6. Offer Variations

Provide 2-3 variations optimized for different goals:

- **Minimal**: Shortest effective version
- **Balanced**: Good coverage of all goals
- **Maximum**: Most thorough, longest version

## Optimization Checklist

Before finalizing, verify:

- [ ] First sentence clearly states the task
- [ ] All ambiguous terms are defined
- [ ] Format is explicitly specified
- [ ] Examples (if present) match desired output exactly
- [ ] Negative instructions converted to positive
- [ ] Context provides motivation for instructions
- [ ] Token count is reasonable for task complexity
- [ ] No redundant or repeated information
