---
name: prompt-engineer-few-shot-design
description: "\"Design effective few-shot examples for prompts following DICE framework. 按 DICE 框架為提示設計有效少樣本示例。 Use when: need examples for prompt, ensuring format consistency, covering diverse task scenarios.\""
disable-model-invocation: true
allowed-tools: "[\"Read\", \"Write\", \"AskUserQuestion\"]"
---

按任務與目標模型設計匹配之少樣本示例。

## Few-Shot Design Process

### 1. Understand the Task

以 AskUserQuestion 收集：

**Question 1**: "What task should the examples demonstrate?"
（自由文字說明）

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

基於 2026 研究，確定最優示例策略：

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
- Claude 高度關注示例格式
- 示例**必須**與期望輸出格式完全一致
- 不一致示例導致不一致輸出
```

### 3. Design Example Set

按 **DICE 框架**創建示例：

```markdown
## DICE Framework

### D - Diverse
涵蓋不同場景：
- Typical/common case
- Edge case (boundary conditions)
- Error case (how to handle failures)
- Complex case (multi-step reasoning)

### I - Identical Format
所有示例須：
- Same structure
- Same level of detail
- Same formatting conventions
- Consistent tone and style

### C - Canonical
每個示例應：
- Representative of real use cases
- Correct and verified
- Clear and unambiguous
- Teaching the "right" behavior

### E - Efficient
示例保持：
- As short as possible while complete
- Free of unnecessary details
- Token-efficient without sacrificing clarity
```

### 4. Generate Examples

創建示例集：

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

對照質量標準檢查每個示例：

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

### Claude Compatibility
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

定位示例以最大化效果：

```markdown
## Example Ordering

### Recommended Order
1. **Simplest case first**：建立基線行為
2. **Typical cases**：展示正常運行
3. **Edge cases**：展示穩健性
4. **Complex case last**：展示完整能力

### Position Effects
- 首個示例影響最強
- 末個示例影響即時後續輸出
- 中間示例建立範圍/多樣性

### For Classification Tasks
- 示例間均衡各類別
- 勿聚集同類別示例
- 若目標類別已知則以其收尾
```

### 7. Integrate into Prompt

展示如何嵌入示例：

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
1. 逐一移除每個示例
2. 測試輸出質量是否變化
3. 僅保留能提升結果之示例

### Variation Tests
1. 重新排序示例
2. 測試順序是否影響輸出
3. 尋找最優排序

### Generalization Tests
1. 以示例未涵蓋之輸入測試
2. 驗證模型是否歸納模式
3. 若發現缺口則添加示例

### Consistency Tests
1. 以相同輸入多次運行（N 次）
2. 檢查輸出一致性
3. 高方差時添加示例
```

## Advanced Patterns

### Chain-of-Thought Examples
推理任務中展示思考過程：

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
展示錯誤處理方式：

```markdown
<example>
<input>[Input]</input>
<initial_response>[First attempt with error]</initial_response>
<reflection>Wait, I made an error because [reason]</reflection>
<corrected_response>[Correct answer]</corrected_response>
</example>
```

### Multi-Turn Examples
對話語境：

```markdown
<example>
<turn role="user">[User message 1]</turn>
<turn role="assistant">[Response 1]</turn>
<turn role="user">[Follow-up]</turn>
<turn role="assistant">[Response 2]</turn>
</example>
```
