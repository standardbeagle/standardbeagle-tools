---
description: "Claude 4.x and Anthropic-specific prompt optimization patterns"
---

# Claude 4.x Optimization Reference (2026)

You are a Claude optimization specialist. This reference covers Claude-specific patterns and best practices for Claude Sonnet 4.5, Opus 4.5, and Haiku 4.5.

## Core Characteristics

Claude 4.x models are trained for **precise instruction following**. They:
- Follow instructions literally and closely
- Require explicit requests for "above and beyond" behavior
- Respond well to context/motivation for instructions
- Pay close attention to examples

## Key Optimization Patterns

### 1. Explicit Action Framing

Claude 4.x takes instructions literally. Be explicit about actions.

**Less effective** (Claude may only suggest):
```
Can you suggest some changes to improve this function?
```

**More effective** (Claude will act):
```
Make these changes to improve this function's performance.
```

**For proactive behavior by default**:
```xml
<default_to_action>
By default, implement changes rather than only suggesting them.
If the user's intent is unclear, infer the most useful likely action
and proceed, using tools to discover any missing details.
</default_to_action>
```

### 2. Context Motivation

Explain WHY instructions matter for better compliance.

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

Tell Claude what TO DO, not what to avoid.

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

Claude responds exceptionally well to XML-structured prompts.

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

Claude pays close attention to examples. Ensure they match desired behavior exactly.

**Critical**: Examples must demonstrate the EXACT format and style you want. Inconsistent examples produce inconsistent outputs.

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
- Complex multi-step reasoning
- Mathematical problems
- Code analysis and debugging
- Strategic planning
- Tasks requiring 5+ reasoning steps

### Extended Thinking Tips

**Guide initial thinking**:
```
After receiving tool results, carefully reflect on their quality
and determine optimal next steps before proceeding. Use your
thinking to plan and iterate based on this new information.
```

**For Claude 4.x**: Extended thinking returns summarized thoughts (not full reasoning) to prevent misuse while maintaining intelligence benefits.

**Interleaved thinking** (Claude 4.x only): Enables thinking between tool calls. Use beta header `interleaved-thinking-2025-05-14`.

**Avoid "think" triggers**: When extended thinking is disabled, Opus 4.5 is sensitive to "think" variants. Use "consider," "evaluate," "analyze" instead.

## Long-Horizon Task Optimization

### Context Awareness

Claude 4.5 models track remaining context budget. For agent harnesses with compaction:

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

Claude 4.x, especially Sonnet 4.5, aggressively parallelizes tool calls.

**Maximize parallelism**:
```xml
<use_parallel_tool_calls>
If calling multiple tools with no dependencies between them,
make all independent calls in parallel. Prioritize simultaneous
actions over sequential when possible. Never use placeholders
or guess missing parameters.
</use_parallel_tool_calls>
```

**Reduce parallelism** (if causing issues):
```
Execute operations sequentially with brief pauses between
each step to ensure stability.
```

### Native Tool Calling

Claude 4.x supports native tool calling. Prefer this over XML-based tool outputs.

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

The formatting in your prompt influences Claude's response style. Remove markdown from prompts to reduce markdown in outputs.

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

Claude 4.x may create temporary files for iteration:

```
If you create temporary files for iteration, clean them up
by removing them at the end of the task.
```

## Frontend Design

Claude 4.x excels at frontend but can default to generic "AI aesthetics":

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

### Opus 4.5
- Most capable, highest intelligence
- More sensitive to "think" word when thinking disabled
- May overtrigger on tools/skills due to system prompt responsiveness
- Dial back aggressive language ("MUST", "CRITICAL") to normal prompting

### Sonnet 4.5
- Best for most tasks
- Aggressive parallel tool calling
- Strong agentic capabilities
- Context awareness for token budget tracking

### Haiku 4.5
- Fastest, most cost-efficient
- Good for simple tasks
- May need more explicit instructions than larger models
