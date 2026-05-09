---
name: prompt-engineer-optimize-prompt
description: "\"Apply current optimization techniques to improve a prompt. 應用最新優化技術改善提示。 Use when: improving accuracy, consistency, creativity, speed, or safety of an existing prompt.\""
disable-model-invocation: true
allowed-tools: "[\"Read\", \"Write\", \"AskUserQuestion\"]"
---

以最新提示工程技術優化提示。

## Optimization Process

### 1. Obtain the Prompt

獲取待優化提示：
- 提供路徑則讀取文件
- 接受直接輸入
- 若需要則以 AskUserQuestion 詢問

### 2. Identify Optimization Goals

以 AskUserQuestion 了解優先事項：

**Question**: "What's most important for this prompt?"
- Accuracy (correct, factual outputs)
- Creativity (novel, diverse outputs)
- Consistency (predictable, reproducible outputs)
- Speed (concise prompts, faster inference)
- Safety (guardrails, refusals for misuse)

### 3. Apply Optimization Techniques

根據目標應用相關技術：

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

### 4. Apply Claude-Specific Optimizations

對 Claude 模型應用專屬模式：

```markdown
## Claude Optimizations

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

輸出優化結果：

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

提供針對不同目標之 2-3 個變體：

- **Minimal**：最短有效版本
- **Balanced**：全面涵蓋所有目標
- **Maximum**：最完整、最長版本

## Optimization Checklist

最終化前驗證：

- [ ] 首句清晰陳述任務
- [ ] 所有模糊術語已定義
- [ ] 格式已明確指定
- [ ] 示例（如有）與期望輸出完全一致
- [ ] 否定指令已轉為正面表述
- [ ] 語境提供指令之動機
- [ ] 令牌數與任務複雜度相稱
- [ ] 無冗餘或重複信息
