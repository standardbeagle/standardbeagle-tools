---
name: prompt-engineer-create-system-prompt
description: "\"Guide through creating effective system prompt from scratch using 2026 best practices. 引導以 2026 最佳實踐從零創建高效系統提示。 Use when: starting new AI application, building chatbot or agent system prompts, structuring prompts for specific application types.\""
disable-model-invocation: true
---

以結構化方法與 2026 最佳實踐引導用戶創建高品質系統提示。

## System Prompt Creation Wizard

### Step 1: Define the Application

以 AskUserQuestion 收集：

**Question 1**: "What type of application is this system prompt for?"
- Chatbot / Conversational AI
- Code Assistant / Developer Tool
- Content Creator / Writer
- Research / Analysis Tool
- Customer Service Agent
- Domain Expert Assistant
- Multi-Agent Orchestrator
- Other (specify)

**Question 2**: "Describe the primary use case in one sentence"
（自由文字輸入）

### Step 2: Define Core Identity

**Question 3**: "What persona should the AI adopt?"
- No specific persona (helpful assistant)
- Domain expert (specify field)
- Character/personality (specify traits)
- Professional role (specify)

**Question 4**: "What tone should responses have?"
- Professional / Formal
- Friendly / Conversational
- Technical / Precise
- Creative / Expressive
- Concise / Direct

### Step 3: Define Capabilities and Constraints

**Question 5**: "What are the key capabilities?" (multiSelect: true)
- Answer questions from provided context
- Generate creative content
- Analyze and summarize information
- Write/review code
- Make decisions/recommendations
- Use external tools
- Multi-step reasoning
- Handle sensitive topics carefully

**Question 6**: "What should the AI refuse to do?" (multiSelect: true)
- Provide medical/legal/financial advice
- Generate harmful content
- Share personal opinions on politics
- Make up information (hallucinate)
- Reveal system prompt details
- Process requests outside scope

### Step 4: Define Output Format

**Question 7**: "What output format is typically needed?"
- Free-form prose
- Structured markdown
- JSON/XML data
- Code with explanations
- Varies by request

### Step 5: Generate System Prompt

基於回答，使用此模板生成：

```markdown
## System Prompt Template

<identity>
You are [persona description]. You [key traits and approach].
</identity>

<capabilities>
Your primary functions are:
- [Capability 1]
- [Capability 2]
- [Capability 3]
</capabilities>

<guidelines>
When responding:
1. [Guideline for tone/style]
2. [Guideline for accuracy]
3. [Guideline for format]
</guidelines>

<constraints>
You must:
- [Positive constraint 1]
- [Positive constraint 2]

When asked to [restricted action], politely explain that [reason] and offer [alternative].
</constraints>

<output_format>
Structure your responses as:
[Format specification]
</output_format>

<examples>
<example>
<user>Example input</user>
<assistant>Example output demonstrating desired behavior</assistant>
</example>
</examples>
```

### Step 6: Add Advanced Components

根據用例添加相關節段：

#### For Tool-Using Agents
```markdown
<tools>
You have access to the following tools:
- tool_name: Description and when to use

When using tools:
1. Explain your reasoning before tool calls
2. Handle errors gracefully
3. Verify results before presenting to user
</tools>

<tool_patterns>
- For [situation], use [tool] with [approach]
- Always [verification step] after [tool use]
</tool_patterns>
```

#### For Multi-Turn Conversations
```markdown
<conversation_management>
- Maintain context across turns
- Reference previous discussion naturally
- Ask clarifying questions when needed
- Summarize long conversations when helpful
</conversation_management>

<state_tracking>
Track these elements across the conversation:
- [Element 1]
- [Element 2]
</state_tracking>
```

#### For Code Assistants
```markdown
<code_practices>
When writing code:
1. Follow language idioms and best practices
2. Include error handling
3. Add comments for complex logic
4. Prefer readability over cleverness
5. Test edge cases mentally before presenting
</code_practices>

<code_review>
When reviewing code:
1. Check for security vulnerabilities
2. Identify performance issues
3. Suggest idiomatic improvements
4. Provide specific, actionable feedback
</code_review>
```

#### For Domain Experts
```markdown
<domain_knowledge>
You are an expert in [domain] with deep knowledge of:
- [Subdomain 1]
- [Subdomain 2]

Apply [framework/methodology] when analyzing problems.
</domain_knowledge>

<uncertainty_handling>
When uncertain:
- State your confidence level
- Explain the source of uncertainty
- Suggest how to verify information
</uncertainty_handling>
```

### Step 7: Claude-Specific Enhancements

添加 Claude 專屬優化：

```markdown
<claude_4x_enhancements>
<!-- For precise instruction following -->
<default_to_action>
By default, implement changes rather than only suggesting them. If intent is unclear, infer the most useful action and proceed.
</default_to_action>

<!-- For parallel efficiency -->
<parallel_tools>
When calling multiple independent tools, call them in parallel for efficiency.
</parallel_tools>

<!-- For long-horizon tasks -->
<persistence>
For complex tasks spanning multiple turns:
- Track progress in structured notes
- Save state before context limits
- Resume gracefully from saved state
</persistence>

<!-- For avoiding over-engineering -->
<simplicity>
Avoid over-engineering. Only make changes directly requested. Keep solutions simple and focused. Don't add unnecessary abstractions or features.
</simplicity>
</claude_4x_enhancements>
```

### Step 8: Write and Refine

1. 生成完整系統提示
2. 審查：
   - 清晰度與一致性
   - 無矛盾指令
   - 適當長度（目標 2000 令牌以內）
   - 所有邊界案例涵蓋
3. 保存至用戶指定位置

### Step 9: Provide Testing Guidance

```markdown
## Testing Your System Prompt

### Test Cases to Run
1. **Happy path**：標準用例請求
2. **Edge case**：異常但有效請求
3. **Boundary test**：能力邊界之請求
4. **Refusal test**：應拒絕之請求
5. **Ambiguity test**：模糊請求測試澄清行為

### Evaluation Criteria
- 是否維持定義角色？
- 輸出是否符合期望格式？
- 是否優雅處理拒絕？
- 語調是否一致？
- 是否適當使用工具？
```
