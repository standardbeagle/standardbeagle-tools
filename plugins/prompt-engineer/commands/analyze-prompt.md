---
description: "Analyze prompts for clarity, effectiveness, and optimization opportunities"
allowed-tools: ["Read", "Write", "AskUserQuestion"]
---

Analyze a prompt or system prompt for improvement opportunities using state-of-the-art prompt engineering principles from 2026.

## Analysis Framework

### 1. Gather the Prompt

First, obtain the prompt to analyze:
- If the user provides a file path, read it with the Read tool
- If the user pastes it directly, use that
- If no prompt provided, use AskUserQuestion to request it

### 2. Structural Analysis

Evaluate the prompt structure using the **TCRTE Framework** (Task, Context, Role, Tone, Examples):

| Component | Present? | Quality (1-5) | Notes |
|-----------|----------|---------------|-------|
| **Task** | Clear directive of what to do | | |
| **Context** | Background information and constraints | | |
| **Role** | Who the model should act as | | |
| **Tone** | Style and voice guidance | | |
| **Examples** | Few-shot demonstrations | | |

### 3. Clarity Assessment

Check for common clarity issues:

- **Ambiguity**: Vague instructions that could be interpreted multiple ways
- **Missing constraints**: Undefined scope, length, or format
- **Conflicting instructions**: Contradictory guidance
- **Assumed context**: References to information not provided
- **Implicit expectations**: Behaviors expected but not stated

### 4. Claude 4.x Compatibility (2026)

Claude 4.x models follow instructions precisely. Check for:

- [ ] **Explicit action requests**: "Create X" vs "Can you suggest X?"
- [ ] **Specificity**: Exact format, length, and style specified
- [ ] **Context motivation**: Explains WHY instructions matter
- [ ] **Example alignment**: Examples match desired output exactly
- [ ] **Negative framing**: "Don't do X" should be "Do Y instead"

### 5. Context Window Efficiency

Evaluate token efficiency:

- **Redundancy**: Repeated information
- **Verbosity**: Overly wordy sections that could be condensed
- **Dead weight**: Information that doesn't contribute to task success
- **Missing high-signal content**: Important context that's absent

### 6. Advanced Pattern Check

Look for opportunities to apply:

- **Structured output**: Would JSON/XML output improve reliability?
- **Chain-of-thought**: Would step-by-step reasoning help?
- **Few-shot examples**: Would 3-5 examples dramatically improve output?
- **Prompt scaffolding**: Does it need defensive guardrails?
- **XML delineation**: Would structured sections improve parsing?

### 7. Generate Report

Produce a structured analysis report:

```markdown
## Prompt Analysis Report

### Overall Score: X/10

### Strengths
- [List what the prompt does well]

### Critical Issues
1. **[Issue name]**: [Description and impact]
   - **Fix**: [Specific recommendation]

### Optimization Opportunities
1. **[Opportunity]**: [How it would improve results]

### Recommended Rewrite
[If significant changes needed, provide optimized version]

### Quick Wins
- [Small changes with high impact]

### Token Efficiency
- Current estimated tokens: ~X
- Potential reduction: ~Y tokens (Z%)
- Key areas for compression: [List]
```

## Common Patterns to Flag

### Red Flags
- "Do whatever you think is best" (too vague)
- "Be creative" without constraints (undefined scope)
- Long lists of "don't do" instructions (should be positive framing)
- Examples that don't match desired output format
- Missing success criteria

### Green Flags
- Clear task statement in first sentence
- Explicit format specification
- Motivational context for instructions
- Diverse, high-quality examples
- Specific success criteria

## Example Analysis

**Poor Prompt**:
```
Help me write better code
```

**Analysis**:
- Task: Vague ("better" is undefined)
- Context: None
- Role: None
- Tone: None
- Examples: None
- Score: 2/10

**Optimized**:
```
Review this Python function and improve its performance, readability, and error handling.

Focus on:
1. Time complexity optimization
2. PEP 8 style compliance
3. Proper exception handling with specific exception types
4. Clear variable names and docstrings

Return the improved code with inline comments explaining each change.

<code>
[code here]
</code>
```

Score: 8/10 - Clear task, specific focus areas, defined output format
