---
description: "Context engineering principles and techniques for optimal LLM performance"
---

# Context Engineering Reference (2026)

You are a context engineering specialist. Context engineering is the systematic optimization of information payloads for LLMs, going beyond simple prompt design to manage everything the model encounters during inference.

## Core Principle

> "Find the smallest possible set of high-signal tokens that maximize the likelihood of your desired outcome."

Context is a finite resource with diminishing returns. As token count increases, model recall accuracy decreases (known as "context rot").

## Context Architecture

### Hierarchical Memory Model

```
┌─────────────────────────────────────────┐
│ HOT (Always in context)                 │
│ - System identity                       │
│ - Core instructions                     │
│ - Safety constraints                    │
│ Est: 500-2000 tokens                    │
├─────────────────────────────────────────┤
│ WARM (Retrieved on demand)              │
│ - Domain knowledge                      │
│ - User preferences                      │
│ - Relevant documentation                │
│ Est: Variable, budget-aware             │
├─────────────────────────────────────────┤
│ COLD (External storage)                 │
│ - Historical conversations              │
│ - Large documents                       │
│ - Logs and archives                     │
│ Storage: Database/files                 │
└─────────────────────────────────────────┘
```

### Token Budget Allocation

For a 128K context window:

| Component | Recommended % | Tokens |
|-----------|---------------|--------|
| System prompt | 2-5% | 2,500-6,400 |
| Tool definitions | 3-8% | 3,800-10,200 |
| Retrieved context | 20-40% | 25,600-51,200 |
| Conversation history | 10-20% | 12,800-25,600 |
| Current turn | 5-15% | 6,400-19,200 |
| Response buffer | 20-30% | 25,600-38,400 |

## Context Optimization Techniques

### 1. Just-in-Time Loading

Maintain lightweight identifiers and load data dynamically.

**Anti-pattern**:
```
System: Here's the entire user manual (50,000 words)...
```

**Pattern**:
```
System: You have access to the documentation tool.
Use `get_docs(topic)` to retrieve relevant sections.

Available topics: authentication, billing, API, troubleshooting
```

### 2. Summarization Strategies

#### Extractive (Keep key sentences)
```
Original (500 tokens):
"The quarterly report shows... [long details]"

Extractive (100 tokens):
"Key findings: Revenue up 15%, costs down 8%,
new market expansion successful, Q4 outlook positive."
```

#### Abstractive (Rewrite concisely)
```
Original: "The user expressed dissatisfaction with the product
delivery time, noting that it took significantly longer than
the estimated timeframe provided during purchase."

Abstractive: "User complained about slow delivery."
```

#### Structured (Convert to efficient format)
```
Original (narrative):
"John is a software engineer who lives in Seattle.
He has 5 years of experience and specializes in Python."

Structured (45% smaller):
User: John | Role: SWE | Location: Seattle | Exp: 5yr | Lang: Python
```

### 3. Context Compaction

For long-running conversations:

```xml
<session_summary>
<decisions>
- Chose PostgreSQL over MongoDB for ACID compliance
- Will use React for frontend, Next.js for SSR
</decisions>
<open_items>
- Auth provider selection pending (Auth0 vs Cognito)
- Performance benchmarks needed
</open_items>
<user_preferences>
- Prefers TypeScript
- Values maintainability over performance
</user_preferences>
</session_summary>

<recent_turns count="3">
[Last 3 exchanges in full]
</recent_turns>
```

### 4. Reference Deduplication

```
❌ Repeated context:
"The AuthenticationService handles login.
The AuthenticationService also handles logout.
The AuthenticationService manages tokens."

✅ Deduplicated:
"AuthService: handles login, logout, token management"
```

### 5. Semantic Chunking

For RAG/retrieval contexts:

```
❌ Fixed-size chunks (may split mid-concept):
"...the authentication flow works by first
---CHUNK BOUNDARY---
validating the JWT token..."

✅ Semantic chunks (preserve concepts):
<chunk topic="authentication_flow">
The authentication flow works by first validating
the JWT token, then checking user permissions...
</chunk>
```

## Position Effects

### Primacy Bias
Information at the beginning gets more attention.
- Place critical instructions early in system prompt
- Put most important retrieved docs first

### Recency Bias
Recent information strongly influences immediate output.
- Place current task/question at the end
- Recent conversation turns get more weight

### Lost in the Middle
Information in large middle sections gets less attention.
- Avoid placing critical info in long document middles
- Use section headers to create "anchors"
- Break large blocks into smaller, labeled sections

## Context Window Strategies

### For 8K-32K Windows (Small)
- Aggressive summarization
- Minimal conversation history (2-3 turns)
- Just-in-time retrieval only
- Short, focused system prompts

### For 32K-128K Windows (Medium)
- Balanced approach
- 5-10 turn history
- Moderate retrieval context
- Can include examples in system prompt

### For 128K-1M+ Windows (Large)
- Can include more reference material
- Longer conversation history
- But still watch for context rot!
- Consider hierarchical organization

## RAG Context Optimization

### Retrieval Best Practices

```
1. Hybrid retrieval (semantic + keyword)
2. Re-ranking with cross-encoder
3. Chunk size: 200-300 words optimal
4. Include contextual headers with chunks
5. Deduplicate overlapping chunks
```

### RAG Prompt Structure

```xml
<instructions>
Answer using ONLY the provided context.
If information isn't in the context, say "Information not found."
Cite sources by [Document: section] format.
</instructions>

<context>
<source document="API Docs" section="Authentication">
[Retrieved chunk 1]
</source>

<source document="FAQ" section="Troubleshooting">
[Retrieved chunk 2]
</source>
</context>

<question>
{{user_question}}
</question>
```

### Quality Signals for Retrieved Context

- **Relevance score**: Threshold at 0.7+ for inclusion
- **Freshness**: Prefer recent documents for time-sensitive queries
- **Source authority**: Weight official docs over user-generated
- **Overlap**: Deduplicate similar chunks

## Multi-Agent Context Management

### Sub-Agent Context Isolation

```
Main Agent Context:
- Full conversation history
- User preferences
- High-level task state

Sub-Agent Context (spawned for search):
- Specific search query
- Search tool definitions
- Minimal background

Sub-Agent Returns:
- 1,000-2,000 token summary
- Key findings only
- No tool details or reasoning
```

### Context Handoff

```xml
<agent_handoff>
<from>Research Agent</from>
<to>Writing Agent</to>
<summary>
Found 3 relevant sources on topic X:
1. [Source A]: Key point...
2. [Source B]: Key point...
3. [Source C]: Key point...
</summary>
<task>Write article incorporating these findings</task>
</agent_handoff>
```

## Monitoring and Metrics

### Key Metrics to Track

1. **Context utilization**: % of window used
2. **Retrieval precision**: Relevant chunks / total retrieved
3. **Response quality vs context size**: Correlation analysis
4. **Token cost per query**: Monitor for optimization

### Warning Signs

- Context consistently >80% of budget
- Response quality declining despite more context
- Frequent "I don't have information about..." despite relevant docs
- High retrieval volume but low answer quality

## Context Engineering vs Prompt Engineering

| Aspect | Prompt Engineering | Context Engineering |
|--------|-------------------|---------------------|
| Scope | Instructions for one task | All information in context |
| Focus | How to ask | What to include |
| Techniques | CoT, few-shot, etc. | Summarization, retrieval, memory |
| Optimization | Better instructions | Higher signal density |
| Scale | Single prompt | Entire system design |

Context engineering encompasses prompt engineering but extends to:
- Memory systems
- Retrieval strategies
- Tool definitions
- State management
- Multi-agent coordination
