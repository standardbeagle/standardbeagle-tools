---
description: "RAG-specific prompt engineering techniques and best practices. RAG 專屬提示工程技術與最佳實踐。 Use when: building retrieval-augmented generation pipelines, grounding LLM answers in documents, handling missing or conflicting retrieval results."
---

# RAG Prompting Reference (2026)

汝為 RAG（檢索增強生成）專家。此参考涵 RAG 系統專屬提示工程技術。

## RAG vs Fine-tuning vs Prompt Engineering

| Approach | Best For | Time | Cost |
|----------|----------|------|------|
| Prompt Engineering | Quick iteration | Hours/days | Low |
| RAG | Real-time data, large knowledge bases | Days/weeks | $70-1000/mo |
| Fine-tuning | Deep specialization | Months | 6x inference |

**決策規則**：先用提示工程，需外部/實時數據時升級至 RAG，深度領域專業化方用微調。

## RAG Prompt Architecture

### Basic Structure

```xml
<instructions>
You are a helpful assistant that answers questions using the
provided context. Follow these rules:
1. Use ONLY information from the context to answer
2. If the answer isn't in the context, say "I don't have
   information about that in my knowledge base"
3. Cite sources using [Source: document_name] format
4. If multiple sources conflict, acknowledge the discrepancy
</instructions>

<context>
{{retrieved_chunks}}
</context>

<question>
{{user_question}}
</question>
```

### Advanced Structure with Metadata

```xml
<system>
You are an expert assistant with access to a curated knowledge base.
Base your answers on the provided context. Cite sources.
</system>

<retrieval_context>
<chunk id="1" source="API Documentation v2.3" section="Authentication"
       relevance="0.92" updated="2025-12-01">
[Chunk content about authentication]
</chunk>

<chunk id="2" source="FAQ" section="Common Issues"
       relevance="0.87" updated="2025-11-15">
[Chunk content about common issues]
</chunk>
</retrieval_context>

<query metadata="category:technical, priority:high">
{{user_question}}
</query>

<response_format>
Answer in 2-3 paragraphs. Include:
- Direct answer to the question
- Relevant details from context
- Citations in [Source: name, section] format
</response_format>
```

## Retrieval Optimization

### Chunking Strategies

**Fixed-size**（簡單但可能截斷概念）:
- 每塊 200-300 字
- 50-100 字重疊

**Semantic**（保留概念完整）:
- 在節/段邊界分塊
- 保留標題與內容
- 代碼塊保持完整

**Hierarchical**（複雜文檔最佳）:
```
Document → Sections → Subsections → Paragraphs
          (summary)   (summary)     (full text)
```

### Contextual Headers

塊中始終包含標題：

```
❌ Poor chunk:
"The token expires after 24 hours and must be refreshed..."

✅ Better chunk:
"## API Authentication > Token Management
The token expires after 24 hours and must be refreshed..."
```

### Hybrid Retrieval

結合語義與關鍵詞搜索：

```python
# Pseudocode
semantic_results = embed_and_search(query, top_k=10)
keyword_results = bm25_search(query, top_k=10)
combined = reciprocal_rank_fusion(semantic_results, keyword_results)
reranked = cross_encoder_rerank(query, combined, top_k=5)
```

## Prompt Patterns for RAG

### Grounding Instructions

**Strong grounding**（最小化幻覺）:
```
Base your response EXCLUSIVELY on the provided context.
Do not use prior knowledge or make assumptions.
If information is not in the context, clearly state:
"This information is not available in the provided documents."
```

**Flexible grounding**（允許通用知識）:
```
Prioritize information from the provided context.
You may supplement with general knowledge, but clearly
distinguish between context-based and general information.
```

### Handling Missing Information

```
When the context doesn't contain the answer:
1. Acknowledge what WAS found that's related
2. State specifically what's missing
3. Suggest what additional information might help
4. Do NOT make up information to fill gaps
```

### Multi-Document Synthesis

```
When synthesizing from multiple sources:
1. Identify common themes across sources
2. Note any contradictions or varying perspectives
3. Prefer recent sources for time-sensitive information
4. Weight authoritative sources (official docs) higher
```

### Citation Instructions

```
Cite sources using this format:
- For direct quotes: "exact quote" [Source: document_name, p.X]
- For paraphrasing: Information summary [Source: document_name]
- For synthesis: Combined conclusion [Sources: doc1, doc2]

If confidence is low, indicate: "Based on limited context..."
```

## Query Transformation

### Query Augmentation

通過轉換查詢改善取回：

```
Original: "How do I fix the error?"

Augmented queries:
1. "error troubleshooting steps"
2. "common errors and solutions"
3. "error handling best practices"
```

### HyDE (Hypothetical Document Embeddings)

生成假設答案，再搜索相似內容：

```
Query: "How does authentication work?"

Hypothetical answer: "Authentication uses JWT tokens issued after
verifying credentials against the user database. Tokens expire
after 24 hours and can be refreshed using the refresh endpoint..."

→ Use this hypothetical answer for semantic search
```

### Multi-Turn Context

對話式 RAG：

```xml
<conversation_context>
<turn role="user">What authentication methods are supported?</turn>
<turn role="assistant">The system supports OAuth 2.0, API keys,
and JWT tokens. [Source: Auth Docs]</turn>
<turn role="user">How do I implement OAuth?</turn>
</conversation_context>

<retrieval_query>
Synthesized: OAuth 2.0 implementation guide
Context: User asking follow-up about OAuth after learning
about supported auth methods
</retrieval_query>
```

## Error Handling

### Low Relevance Results

```
When retrieval confidence is below threshold (e.g., <0.7):

<low_confidence_response>
I found some potentially related information, but it may not
directly answer your question:

[Present best available info with caveats]

For a more accurate answer, you might:
- Rephrase your question with more specific terms
- Ask about [related topic that has better coverage]
</low_confidence_response>
```

### Contradictory Sources

```
When sources conflict:

<conflict_handling>
I found conflicting information on this topic:

Source A (API Docs, 2025): "Tokens expire after 24 hours"
Source B (FAQ, 2024): "Tokens expire after 12 hours"

The more recent source (API Docs) is likely accurate, but
please verify with the latest documentation.
</conflict_handling>
```

### No Results

```
When no relevant chunks retrieved:

<no_results_response>
I couldn't find information about [topic] in my knowledge base.

What I CAN help with:
- [List related topics with good coverage]

Alternatively, this might be a topic not yet documented.
Would you like me to explain based on general knowledge?
</no_results_response>
```

## Advanced RAG Patterns

### Agentic RAG

以工具調用迭代取回：

```xml
<system>
You have access to a knowledge base tool:
search_docs(query: str, filters: dict) → list[chunks]

Strategy:
1. Initial search with user's question
2. If results insufficient, reformulate query
3. If topic is complex, search sub-topics
4. Synthesize final answer from all retrieved context
</system>
```

### Self-RAG (Self-Reflective RAG)

```xml
<self_rag_instructions>
After retrieving context, evaluate:
1. Is this context relevant to the question? (yes/no)
2. Does it fully answer the question? (fully/partially/no)
3. Are additional searches needed? (yes/no)

If partially answered, generate follow-up queries.
If fully answered, synthesize response with citations.
</self_rag_instructions>
```

### Corrective RAG

```xml
<corrective_rag>
Before finalizing your response:
1. Check each claim against the source context
2. Remove any claims not supported by context
3. Strengthen supported claims with citations
4. Flag any logical inferences (vs direct statements)
</corrective_rag>
```

## Evaluation Metrics

### Retrieval Quality
- **Precision**：相關塊/取回塊
- **Recall**：取回相關/全部相關
- **MRR**：首個相關結果之平均倒數排名

### Generation Quality
- **Faithfulness**：回應是否植根語境？
- **Relevance**：回應是否解答問題？
- **Completeness**：各方面是否涵蓋？
- **Citation accuracy**：引用是否對應內容？

### Testing Checklist

- [ ] 優雅處理缺失信息
- [ ] 正確引用來源
- [ ] 不幻覺超出語境
- [ ] 良好綜合多來源
- [ ] 適當處理矛盾
- [ ] 邊界查詢正常運作
