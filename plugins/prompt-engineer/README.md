# Prompt Engineer Plugin

State-of-the-art prompt and context engineering toolkit for 2026.

## Overview

This plugin provides comprehensive tools for designing, optimizing, and evaluating prompts using the latest research and best practices from 2026.

## Commands

| Command | Description |
|---------|-------------|
| `/analyze-prompt` | Analyze prompts for clarity, effectiveness, and optimization opportunities |
| `/optimize-prompt` | Apply state-of-the-art optimization techniques to improve a prompt |
| `/create-system-prompt` | Guided wizard for creating effective system prompts |
| `/context-audit` | Audit context window usage and identify optimization opportunities |
| `/few-shot-design` | Design effective few-shot examples using the DICE framework |
| `/eval-prompt` | Evaluate prompt effectiveness using metrics and test cases |
| `/scaffold-prompt` | Create defensive prompt scaffolding with guardrails |
| `/compress-context` | Compress context while preserving signal |

## Skills

| Skill | Description |
|-------|-------------|
| `prompt-patterns` | Comprehensive reference for prompt engineering patterns (zero-shot, few-shot, CoT, ToT, ReAct, etc.) |
| `context-engineering` | Context window optimization, memory hierarchies, compression strategies |
| `claude-optimization` | Claude 4.x specific patterns (XML structure, explicit actions, extended thinking) |
| `rag-prompting` | RAG-specific techniques (retrieval optimization, grounding, citations) |
| `multi-agent-prompts` | Multi-agent orchestration, task decomposition, context handoff |
| `chain-of-thought` | CoT patterns for standard LLMs vs reasoning models (o1/o3/R1) |
| `prompt-scaffolding` | Security patterns, injection prevention, safety guardrails |
| `automatic-optimization` | DSPy, OPRO, and programmatic prompt optimization |
| `model-specific` | Guidelines for GPT, DeepSeek, Qwen, Grok, Kimi K2, GLM |

## Agents

| Agent | Description |
|-------|-------------|
| `prompt-optimizer` | Autonomous agent for analyzing and optimizing prompts |
| `context-architect` | Specialist for designing context window architecture and memory systems |
| `eval-specialist` | Agent for prompt evaluation, testing, and continuous improvement |

## Key Features

### 2026 Research Integration

Based on the latest research including:
- Context engineering principles from Anthropic
- DSPy and OPRO automatic optimization frameworks
- Reasoning model best practices (o1/o3, DeepSeek R1)
- Claude 4.x precise instruction following patterns

### Model-Specific Optimization

Covers major LLM families:
- **Claude 4.x** (Anthropic): XML structure, explicit actions, extended thinking
- **GPT-4.1/5 & o1/o3** (OpenAI): Structured output, reasoning vs standard modes
- **DeepSeek R1/V3.1**: Minimal prompts, thinking mode selection
- **Qwen 2.5**: Math patterns, multilingual, structured output
- **Kimi K2**: Native tool calling, agentic workflows
- **Grok**: Code optimization, XML/MD structure
- **GLM-4.7**: Thinking mode, long context

### Critical 2026 Findings

**Reasoning Models Changed Everything:**
- Explicit CoT prompting often DEGRADES performance in o1/o3/R1
- Few-shot examples hurt reasoning model performance
- Simple, clear prompts work best for thinking models
- Use CoT only with standard LLMs (GPT-4o, Claude without thinking)

**Context Engineering > Prompt Engineering:**
- "Find the smallest set of high-signal tokens"
- Hierarchical memory (hot/warm/cold)
- Just-in-time loading beats pre-loading
- Context rot degrades recall as tokens increase

## Usage Examples

### Analyze an Existing Prompt
```
/analyze-prompt
```
Then provide the prompt to analyze or a file path.

### Create a New System Prompt
```
/create-system-prompt
```
Follow the guided wizard to build a comprehensive system prompt.

### Optimize for a Specific Model
```
/optimize-prompt
```
When asked, specify the target model (Claude, GPT, DeepSeek, etc.) for model-specific optimizations.

### Audit Context Usage
```
/context-audit
```
Get a detailed analysis of how context is being used and optimization recommendations.

## Research Sources

This plugin synthesizes research from:
- [Anthropic: Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Claude 4.x Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [DSPy Framework](https://dspy.ai)
- [DeepSeek Prompting Guide](https://docs.together.ai/docs/prompting-deepseek-r1)
- [Prompting Guide](https://www.promptingguide.ai)
