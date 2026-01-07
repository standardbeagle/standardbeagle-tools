---
description: "Audit context window usage and identify optimization opportunities"
allowed-tools: ["Read", "Glob", "Grep", "AskUserQuestion"]
---

Audit context window usage to identify optimization opportunities based on 2026 context engineering best practices.

## Context Audit Process

### 1. Gather Context Sources

Identify what's consuming context:

**Question**: "What context sources should I audit?"
- System prompt file(s)
- Tool definitions
- Retrieved documents (RAG)
- Conversation history
- Code files
- Examples/demonstrations

### 2. Measure Token Usage

For each context source, estimate tokens:

```markdown
## Token Usage Report

| Source | Estimated Tokens | % of Budget | Priority |
|--------|------------------|-------------|----------|
| System Prompt | ~X | Y% | High |
| Tool Definitions | ~X | Y% | Medium |
| Retrieved Docs | ~X | Y% | High |
| Conversation | ~X | Y% | Medium |
| Examples | ~X | Y% | Low |
| **Total** | **~X** | **Y%** | |

Token Budget: [Model's context window]
Available for Response: [Remaining tokens]
```

### 3. Analyze Context Quality

For each source, evaluate using the **Signal-to-Noise Ratio**:

```markdown
## Context Quality Analysis

### System Prompt
- **High-signal content**: [What directly contributes to task success]
- **Low-signal content**: [What could be removed without impact]
- **Redundancy**: [Repeated or overlapping information]
- **SNR Score**: X/10

### Retrieved Documents
- **Relevance**: How well do chunks match the query?
- **Freshness**: Is information current?
- **Overlap**: Do chunks repeat information?
- **SNR Score**: X/10

### Tool Definitions
- **Clarity**: Are descriptions unambiguous?
- **Overlap**: Do tools have redundant capabilities?
- **Completeness**: Are all parameters documented?
- **SNR Score**: X/10
```

### 4. Identify Context Rot

Check for "context rot" - degradation of recall with increased context:

```markdown
## Context Rot Analysis

### Position Effects
- **Primacy bias**: Is critical information at the start?
- **Recency bias**: Is important context near the end?
- **Lost in the middle**: Is key info buried in large blocks?

### Recommendations
1. Move critical instructions to [position]
2. Split large document into [sections]
3. Add summary headers for [content type]
```

### 5. Apply Compression Techniques

Recommend compression strategies:

```markdown
## Compression Recommendations

### 1. Summarization
**Before (500 tokens)**:
[Long passage]

**After (100 tokens)**:
[Summarized version preserving key facts]

**Savings**: 400 tokens (80%)

### 2. Reference Deduplication
**Issue**: Same information repeated in X places
**Solution**: Reference once, link elsewhere
**Savings**: ~Y tokens

### 3. Just-in-Time Loading
**Issue**: Static context includes rarely-used information
**Solution**: Load dynamically when needed using tools
**Savings**: ~Z tokens on average

### 4. Structured Compression
**Before**:
"The user's name is John. John lives in New York. John works as an engineer."

**After**:
"User: John | Location: New York | Role: Engineer"

**Savings**: ~X tokens
```

### 6. Memory Architecture Recommendations

Based on use case, recommend memory strategy:

```markdown
## Memory Architecture

### Recommended Pattern: [Pattern Name]

**Short-term (in-context)**:
- Current task context
- Recent conversation (last N turns)
- Active tool results

**Long-term (external)**:
- User preferences
- Historical summaries
- Reference documentation

**Implementation**:
1. Use [storage mechanism] for long-term
2. Retrieve with [retrieval strategy]
3. Compress with [compression technique]
4. Refresh every [interval]
```

### 7. Generate Optimization Plan

```markdown
## Context Optimization Plan

### Quick Wins (Immediate)
1. [Action]: Save ~X tokens
2. [Action]: Save ~Y tokens

### Medium-term Improvements
1. [Structural change]: Save ~X tokens, improve Y
2. [Architecture change]: Enable Z capability

### Long-term Refactoring
1. [Major change]: Estimated impact

### Projected Results
- **Current usage**: X tokens
- **After quick wins**: Y tokens (-Z%)
- **After full optimization**: W tokens (-V%)
```

### 8. Monitoring Recommendations

```markdown
## Context Monitoring

### Metrics to Track
- Average context size per request
- Context utilization vs. budget
- Retrieval relevance scores
- Response quality vs. context size

### Warning Signs
- Context consistently >80% of budget
- Retrieval precision dropping
- Response quality declining with larger contexts
- Frequent context limit errors

### Tools
- Token counter integration
- Context size logging
- Quality correlation analysis
```

## Context Engineering Best Practices (2026)

### The "Right Altitude" Principle
Balance specificity with flexibility:
- Too high: Vague guidance assuming unshared context
- Too low: Brittle if-else logic for every case
- Right level: Clear principles with appropriate flexibility

### The "Minimal Viable Context" Principle
"Find the smallest possible set of high-signal tokens that maximize the likelihood of the desired outcome."

### The "Just-in-Time" Principle
Maintain lightweight identifiers and load data dynamically:
- Store file paths, not file contents
- Store query templates, not query results
- Load on demand, cache strategically

### The "Hierarchical Memory" Principle
Structure information by access frequency:
- Hot: Always in context (identity, core instructions)
- Warm: Retrieved on demand (domain knowledge)
- Cold: Stored externally (historical data, logs)
