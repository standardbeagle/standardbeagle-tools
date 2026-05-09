---
name: prompt-engineer-claude-optimization
description: "Claude-specific prompt optimization patterns for Opus, Sonnet, and Haiku. Claude 專屬提示優化模式，適用 Opus、Sonnet、Haiku。 Use when: writing system prompts for Claude, tuning agentic Claude workflows, applying XML structure or explicit-action framing."
disable-model-invocation: true
---

# Claude Optimization Reference

汝為 Claude 優化專家。此参考涵 Claude Opus、Sonnet、Haiku 之專屬模式與最佳實踐。

## Core Characteristics

Claude 模型訓練於**精確指令遵循**。特性：
- 字面遵循指令
- 需顯式請求方「超額完成」
- 對指令之背景/動機回應良好
- 高度關注示例

## Key Optimization Patterns

### 1. Explicit Action Framing

Claude 字面解讀指令。行動須明確。

**Less effective** (Claude 可能僅建議):
```
Can you suggest some changes to improve this function?
```

**More effective** (Claude 將執行):
```
Make these changes to improve this function's performance.
```

**默認行動模式**:
```xml
<default_to_action>
By default, implement changes rather than only suggesting them.
If the user's intent is unclear, infer the most useful likely action
and proceed, using tools to discover any missing details.
</default_to_action>
```

### 2. Context Motivation

說明指令原因以提升遵從性。

**Less effective**:
```
NEVER use ellipses
```

**More effective**:
```
Your response will be read aloud by text-to-speech, so never use
ellipses since the TTS engine cannot pronounce them.
```

### 3. Positive Framing

告知 Claude 應做之事，而非應避之事。

**Less effective**:
```
Don't use markdown in your response
Don't be verbose
Never make up information
```

**More effective**:
```
Write in flowing prose paragraphs without formatting.
Keep responses under 200 words.
Only use information from the provided context.
```

### 4. XML Structure

Claude 對 XML 結構化提示回應極佳。

```xml
<identity>
You are a senior code reviewer specializing in Python.
</identity>

<task>
Review the provided code for security vulnerabilities,
performance issues, and style violations.
</task>

<guidelines>
- Focus on critical issues first
- Provide specific line numbers
- Suggest concrete fixes
</guidelines>

<output_format>
Structure your review as:
1. Critical Issues (security, crashes)
2. Performance Concerns
3. Style Improvements
</output_format>

<code>
{{code_to_review}}
</code>
```

### 5. Example Alignment

Claude 高度關注示例。確保示例與期望行為完全一致。

**關鍵**：示例須展示所需的**確切**格式與風格。不一致示例產生不一致輸出。

```xml
<examples>
<example>
<input>Summarize this article about AI safety</input>
<output>
**Summary**: The article discusses three key AI safety concerns:
alignment, robustness, and oversight. The author argues for...
[2-3 paragraphs]
</output>
</example>
</examples>
```

## Extended Thinking

### When to Use Extended Thinking
- 複雜多步推理
- 數學問題
- 代碼分析與調試
- 策略規劃
- 需五步以上推理之任務

### Extended Thinking Tips

**引導初始思考**:
```
After receiving tool results, carefully reflect on their quality
and determine optimal next steps before proceeding. Use your
thinking to plan and iterate based on this new information.
```

**對 Claude**：擴展思考返回摘要思路（非完整推理），防止濫用同時保留智能優勢。

**Interleaved thinking**（僅 Claude）：在工具調用間啟用思考。使用 beta header `interleaved-thinking-2025-05-14`。

**避免「think」觸發詞**：擴展思考禁用時，Claude Opus 對「think」變體敏感。改用「consider」、「evaluate」、「analyze」。

## Long-Horizon Task Optimization

### Context Awareness

Claude 追蹤剩餘語境預算。對具壓縮功能之代理框架：

```
Your context window will be automatically compacted as it approaches
its limit, allowing you to continue working indefinitely. Therefore:
- Do not stop tasks early due to token budget concerns
- Save progress and state before context refreshes
- Be persistent and autonomous
- Complete tasks fully, even near budget limits
```

### Multi-Context Window Workflows

```
For tasks spanning multiple context windows:

1. First window: Set up framework (write tests, create setup scripts)
2. Later windows: Iterate on todo-list

State management:
- Write tests in structured format (tests.json)
- Create setup scripts (init.sh) for graceful restarts
- Use git for state tracking across sessions
- Save progress notes in freeform text (progress.txt)
```

### State Tracking Structure

```json
// Structured state (tests.json)
{
  "tests": [
    {"id": 1, "name": "auth_flow", "status": "passing"},
    {"id": 2, "name": "user_mgmt", "status": "failing"}
  ]
}
```

```text
// Progress notes (progress.txt)
Session 3:
- Fixed token validation
- Updated user model for edge cases
- Next: investigate test #2 failures
```

## Tool Usage Optimization

### Parallel Tool Calling

Claude（尤其 Sonnet）積極並行調用工具。

**最大化並行**:
```xml
<use_parallel_tool_calls>
If calling multiple tools with no dependencies between them,
make all independent calls in parallel. Prioritize simultaneous
actions over sequential when possible. Never use placeholders
or guess missing parameters.
</use_parallel_tool_calls>
```

**減少並行**（若出現問題）:
```
Execute operations sequentially with brief pauses between
each step to ensure stability.
```

### Native Tool Calling

Claude 支持原生工具調用。優先使用，勿用 XML 工具輸出格式。

## Output Format Control

### Minimize Markdown

```xml
<avoid_excessive_markdown>
When writing reports or explanations, write in clear, flowing
prose using complete paragraphs. Reserve markdown for:
- `inline code`
- code blocks (```)
- simple headings (##, ###)

Avoid **bold**, *italics*, and bullet lists unless explicitly
requested or truly discrete items.
</avoid_excessive_markdown>
```

### Match Prompt Style to Output

提示格式影響 Claude 回應風格。從提示中去除 markdown 可減少輸出中的 markdown。

## Agentic Coding Patterns

### Code Exploration

```xml
<code_exploration>
ALWAYS read and understand relevant files before proposing edits.
Do not speculate about code you haven't inspected.
If the user references a file, you MUST open and inspect it first.
Be rigorous and persistent in searching code for key facts.
</code_exploration>
```

### Avoid Over-Engineering

```xml
<simplicity>
Avoid over-engineering. Only make directly requested changes.
Keep solutions simple and focused.

Don't add:
- Features beyond what was asked
- Unnecessary abstractions
- Error handling for impossible scenarios
- Backwards-compatibility shims
- Helpers for one-time operations
</simplicity>
```

### Minimize Hallucinations

```xml
<investigate_before_answering>
Never speculate about code you have not opened.
If the user references a specific file, read it before answering.
Never make claims about code before investigating.
Give grounded, hallucination-free answers.
</investigate_before_answering>
```

### File Creation Control

```
If you create temporary files for iteration, clean them up
by removing them at the end of the task.
```

## Frontend Design

Claude 擅長前端但可能默認「AI 泛美學」：

```xml
<frontend_aesthetics>
Avoid generic "AI slop" aesthetic. Create distinctive, creative
frontends that surprise and delight.

Focus on:
- Typography: Beautiful, unique fonts (not Arial, Inter, Roboto)
- Color: Cohesive aesthetic with dominant + sharp accents
- Motion: CSS-only animations, staggered reveals
- Backgrounds: Atmosphere and depth, not solid colors

Vary between light/dark themes, different fonts, different aesthetics.
Think outside the box!
</frontend_aesthetics>
```

## Model-Specific Notes

### Claude Opus
- 最高能力、最強智能
- 擴展思考禁用時對「think」更敏感
- 因響應系統提示可能過度觸發工具/技能
- 將激進語言（「MUST」、「CRITICAL」）調節為普通提示語氣

### Claude Sonnet
- 多數任務之最佳選擇
- 積極並行工具調用
- 強大代理能力
- 追蹤令牌預算的語境感知

### Claude Haiku
- 最快、最具成本效益
- 適合簡單任務
- 可能需比大模型更明確的指令
