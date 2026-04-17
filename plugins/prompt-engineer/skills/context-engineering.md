---
description: "Context engineering principles and techniques for optimal LLM performance. 語境工程原理與技術，優化 LLM 推理效能。 Use when: designing context architecture, managing token budgets, building RAG context pipelines, or structuring multi-agent handoffs."
---

# Context Engineering Reference (2026)

汝為語境工程專家。語境工程者，系統優化 LLM 推理所用信息負載之術，超越簡單提示設計，統管模型推理所遇一切。

## Core Principle

> "Find the smallest possible set of high-signal tokens that maximize the likelihood of your desired outcome."

語境為有限資源，邊際效益遞減。令牌增加，模型召回精度降低（即「語境腐蝕」）。

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

128K 語境視窗分配建議：

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

維護輕量標識符，動態加載數據。

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

#### Extractive (保留關鍵句)
```
Original (500 tokens):
"The quarterly report shows... [long details]"

Extractive (100 tokens):
"Key findings: Revenue up 15%, costs down 8%,
new market expansion successful, Q4 outlook positive."
```

#### Abstractive (精煉重寫)
```
Original: "The user expressed dissatisfaction with the product
delivery time, noting that it took significantly longer than
the estimated timeframe provided during purchase."

Abstractive: "User complained about slow delivery."
```

#### Structured (轉換高效格式)
```
Original (narrative):
"John is a software engineer who lives in Seattle.
He has 5 years of experience and specializes in Python."

Structured (45% smaller):
User: John | Role: SWE | Location: Seattle | Exp: 5yr | Lang: Python
```

### 3. Context Compaction

長對話壓縮：

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

RAG/取回語境之語義分塊：

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
開頭信息獲更多關注。
- 關鍵指令置於系統提示早部
- 最重要取回文檔置首

### Recency Bias
近期信息強烈影響即時輸出。
- 當前任務/問題置末
- 近期對話輪次權重更高

### Lost in the Middle
大段落中間信息受關注少。
- 避免將關鍵信息置於長文檔中部
- 以節標題創造「錨點」
- 大塊內容拆分為帶標籤的小節

## Context Window Strategies

### For 8K-32K Windows (Small)
- 積極摘要
- 最小對話歷史（2-3 輪）
- 僅即時取回
- 簡短聚焦系統提示

### For 32K-128K Windows (Medium)
- 均衡方式
- 5-10 輪歷史
- 適度取回語境
- 系統提示可包含示例

### For 128K-1M+ Windows (Large)
- 可包含更多参考材料
- 更長對話歷史
- 但仍需警惕語境腐蝕！
- 考慮分層組織

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

- **Relevance score**：閾值 0.7+ 方可納入
- **Freshness**：時間敏感查詢優先近期文檔
- **Source authority**：官方文檔優於用戶生成
- **Overlap**：去重相似塊

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

1. **Context utilization**：視窗佔用率
2. **Retrieval precision**：相關塊/取回總塊
3. **Response quality vs context size**：相關性分析
4. **Token cost per query**：監控以優化

### Warning Signs

- 語境持續 >80% 預算
- 語境增加但回應質量下降
- 頻繁出現「沒有相關信息」儘管文檔相關
- 取回量高但答案質量低

## Context Engineering vs Prompt Engineering

| Aspect | Prompt Engineering | Context Engineering |
|--------|-------------------|---------------------|
| Scope | Instructions for one task | All information in context |
| Focus | How to ask | What to include |
| Techniques | CoT, few-shot, etc. | Summarization, retrieval, memory |
| Optimization | Better instructions | Higher signal density |
| Scale | Single prompt | Entire system design |

語境工程涵蓋提示工程，並延伸至：
- 記憶系統
- 取回策略
- 工具定義
- 狀態管理
- 多代理協調
