---
description: "Design effective few-shot examples for prompts"
allowed-tools: ["Read", "Write", "AskUserQuestion"]
---

Design high-quality few-shot examples that dramatically improve prompt effectiveness.

## Few-Shot Design Process

### 1. Understand the Task

Use AskUserQuestion to gather:

**Question 1**: "What task should the examples demonstrate?"
(Free text description)

**Question 2**: "What's the input format?"
- Natural language text
- Structured data (JSON, CSV)
- Code
- Multi-part input (e.g., context + question)

**Question 3**: "What's the expected output format?"
- Natural language response
- Structured data (JSON, XML)
- Code
- Classification/label
- Numeric score

### 2. Analyze Example Requirements

Based on 2026 research, determine optimal example strategy:

```markdown
## Example Strategy Analysis

### Task Complexity
- **Simple**: 1-2 examples sufficient
- **Medium**: 3-5 examples recommended
- **Complex**: 5+ examples with edge cases

### Diversity Requirements
- Input types to cover: [list]
- Output variations to show: [list]
- Edge cases to include: [list]

### Format Sensitivity
- Claude 4.x pays close attention to example formatting
- Examples MUST match exact desired output format
- Inconsistent examples cause inconsistent outputs
```

### 3. Design Example Set

Create examples following the **DICE Framework**:

```markdown
## DICE Framework

### D - Diverse
Cover different scenarios:
- Typical/common case
- Edge case (boundary conditions)
- Error case (how to handle failures)
- Complex case (multi-step reasoning)

### I - Identical Format
All examples must have:
- Same structure
- Same level of detail
- Same formatting conventions
- Consistent tone and style

### C - Canonical
Each example should be:
- Representative of real use cases
- Correct and verified
- Clear and unambiguous
- Teaching the "right" behavior

### E - Efficient
Keep examples:
- As short as possible while complete
- Free of unnecessary details
- Token-efficient without sacrificing clarity
```

### 4. Generate Examples

Create the example set:

```markdown
## Few-Shot Examples

### Example Format
<example>
<input>
[Formatted input]
</input>
<output>
[Expected output matching exact format]
</output>
</example>

### Example 1: Typical Case
<example>
<input>
[Representative common input]
</input>
<output>
[Model output demonstrating ideal behavior]
</output>
</example>

### Example 2: Edge Case
<example>
<input>
[Boundary or unusual input]
</input>
<output>
[Handling showing robustness]
</output>
</example>

### Example 3: Complex Case
<example>
<input>
[Multi-step or challenging input]
</input>
<output>
[Demonstrating sophisticated reasoning]
</output>
</example>

### Example 4: Error/Refusal Case (if applicable)
<example>
<input>
[Input that should be refused or handled specially]
</input>
<output>
[Graceful handling/refusal with explanation]
</output>
</example>
```

### 5. Validate Examples

Check each example against quality criteria:

```markdown
## Example Validation Checklist

### Format Consistency
- [ ] All inputs have identical structure
- [ ] All outputs have identical structure
- [ ] Formatting (markdown, XML, etc.) is consistent
- [ ] Length/detail level is consistent

### Content Quality
- [ ] Examples are factually correct
- [ ] No ambiguous or confusing cases
- [ ] Each teaches one clear lesson
- [ ] Together they cover key scenarios

### Claude 4.x Compatibility
- [ ] Examples don't contradict instructions
- [ ] Examples align with desired behaviors
- [ ] No accidental patterns to avoid
- [ ] Demonstrates explicit action (not just suggestion)

### Token Efficiency
- [ ] No redundant information
- [ ] Shortest form that's still clear
- [ ] Could any example be shortened?
- [ ] Are 3-5 examples sufficient?
```

### 6. Order Examples Strategically

Position examples for maximum effectiveness:

```markdown
## Example Ordering

### Recommended Order
1. **Simplest case first**: Establishes baseline behavior
2. **Typical cases**: Shows normal operation
3. **Edge cases**: Demonstrates robustness
4. **Complex case last**: Shows full capability

### Position Effects
- First example has strongest influence
- Last example affects immediate next output
- Middle examples establish range/diversity

### For Classification Tasks
- Balance classes across examples
- Don't cluster same-class examples together
- End with target class if known
```

### 7. Integrate into Prompt

Show how to embed examples:

```markdown
## Integration Template

[Task description and instructions]

Here are examples of the expected behavior:

<examples>
[Example 1]

[Example 2]

[Example 3]
</examples>

Now, apply the same approach to this input:

<input>
{{user_input}}
</input>
```

### 8. Testing Recommendations

```markdown
## Testing Your Examples

### Ablation Tests
1. Remove each example one at a time
2. Test if output quality changes
3. Keep only examples that improve results

### Variation Tests
1. Reorder examples
2. Check if order affects output
3. Find optimal ordering

### Generalization Tests
1. Test with inputs not covered by examples
2. Verify model generalizes patterns
3. Add examples if gaps found

### Consistency Tests
1. Run same input multiple times
2. Check output consistency
3. Add examples if high variance
```

## Advanced Patterns

### Chain-of-Thought Examples
For reasoning tasks, show thinking process:

```markdown
<example>
<input>Question: [Problem]</input>
<reasoning>
Step 1: [First consideration]
Step 2: [Analysis]
Step 3: [Conclusion]
</reasoning>
<output>[Final answer]</output>
</example>
```

### Self-Correction Examples
Show how to handle mistakes:

```markdown
<example>
<input>[Input]</input>
<initial_response>[First attempt with error]</initial_response>
<reflection>Wait, I made an error because [reason]</reflection>
<corrected_response>[Correct answer]</corrected_response>
</example>
```

### Multi-Turn Examples
For conversational contexts:

```markdown
<example>
<turn role="user">[User message 1]</turn>
<turn role="assistant">[Response 1]</turn>
<turn role="user">[Follow-up]</turn>
<turn role="assistant">[Response 2]</turn>
</example>
```
