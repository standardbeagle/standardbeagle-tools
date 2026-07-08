---
name: prompt-engineer-context-audit
description: "\"Audit context window usage and identify optimization opportunities. 審計語境視窗使用情況並識別優化機會。 Use when: analyzing system prompt bloat, diagnosing context rot, planning token budget restructuring.\""
disable-model-invocation: true
---

以 2026 語境工程最佳實踐審計語境視窗使用情況，識別優化機會。

## Context Audit Process

### 1. Gather Context Sources

識別語境消耗來源：

**Question**: "What context sources should I audit?"
- System prompt file(s)
- Tool definitions
- Retrieved documents (RAG)
- Conversation history
- Code files
- Examples/demonstrations

### 2. Measure Token Usage

對每個語境來源估算令牌：

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

對每個來源以**信噪比**評估：

```markdown
## Context Quality Analysis

### System Prompt
- **High-signal content**: [直接貢獻任務成功之內容]
- **Low-signal content**: [可移除而無影響之內容]
- **Redundancy**: [重複或重疊信息]
- **SNR Score**: X/10

### Retrieved Documents
- **Relevance**: 塊與查詢匹配程度？
- **Freshness**: 信息是否最新？
- **Overlap**: 塊間是否重複信息？
- **SNR Score**: X/10

### Tool Definitions
- **Clarity**: 描述是否無歧義？
- **Overlap**: 工具是否有冗餘能力？
- **Completeness**: 所有參數是否已記錄？
- **SNR Score**: X/10
```

### 4. Identify Context Rot

檢查「語境腐蝕」— 語境增加時召回精度下降：

```markdown
## Context Rot Analysis

### Position Effects
- **Primacy bias**: 關鍵信息是否置於開頭？
- **Recency bias**: 重要語境是否置末？
- **Lost in the middle**: 關鍵信息是否埋藏於大塊中間？

### Recommendations
1. Move critical instructions to [position]
2. Split large document into [sections]
3. Add summary headers for [content type]
```

### 5. Apply Compression Techniques

推薦壓縮策略：

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

根據用例推薦記憶策略：

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
在具體性與靈活性間取得平衡：
- 過高：模糊引導，假設未共享之語境
- 過低：每種情形之脆弱 if-else 邏輯
- 適當層次：清晰原則，輔以適度靈活性

### The "Minimal Viable Context" Principle
「尋找最小可能高信號令牌集，最大化期望結果之可能性。」

### The "Just-in-Time" Principle
維護輕量標識符，動態加載數據：
- 存儲文件路徑，非文件內容
- 存儲查詢模板，非查詢結果
- 按需加載，策略性緩存

### The "Hierarchical Memory" Principle
按訪問頻率組織信息：
- Hot：始終在語境中（身份、核心指令）
- Warm：按需取回（領域知識）
- Cold：外部存儲（歷史數據、日誌）
