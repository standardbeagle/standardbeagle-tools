---
name: prompt-engineer-model-specific
description: "Model-specific prompt engineering guidelines for major LLMs. 主要 LLM 之模型專屬提示工程指引。 Use when: targeting a specific model family, avoiding model-specific anti-patterns, selecting between reasoning vs standard LLM for a task."
disable-model-invocation: true
---

# Model-Specific Prompting Reference (2026)

汝為多模型提示工程專家。此参考涵主要 LLM 之模型專屬優化。

## Quick Reference Matrix

| Model Family | Best For | Key Patterns | Avoid |
|--------------|----------|--------------|-------|
| Claude | Agentic tasks, code | XML tags, explicit actions | "think" without extended thinking |
| GPT-4.1/5 | General, instruction-following | JSON/structured output | Over-prompting (follows well) |
| o1/o3/o4 | Complex reasoning | Simple prompts | Few-shot, explicit CoT |
| DeepSeek R1 | Deep reasoning | Minimal prompts | System prompts, examples |
| DeepSeek V3.1 | Hybrid (thinking + fast) | Mode selection | Mixing modes confusingly |
| Qwen 2.5 | Multilingual, math | \boxed{} for math | Long context without headers |
| Kimi K2 | Agentic, tool use | temp=0.6, native tools | XML tool outputs |
| Grok | Code, real-time | XML/MD sections | Vague prompts |
| GLM-4.7 | Code, Chinese | Thinking mode toggle | Unstructured long tasks |

## Claude (Anthropic)

### Claude (Opus/Sonnet/Haiku)

**Key characteristics**:
- 精確指令遵循
- XML 結構效果優異
- 強大代理能力
- 語境感知（追蹤令牌預算）

**Best patterns**:
```xml
<!-- Claude loves XML structure -->
<task>Clear directive here</task>
<context>Background information</context>
<format>Expected output structure</format>
<guidelines>
- Guideline 1
- Guideline 2
</guidelines>
```

**Model-specific tips**:
- **Claude Opus**：可能過度觸發工具；調節激進語言
- **Claude Sonnet**：積極並行工具調用；代理任務首選
- **Claude Haiku**：需比大模型更明確指令

**Avoid**:
- 擴展思考禁用時使用「think」變體
- 負面表述（「don't do X」）
- 假設其會「超額完成」而不明確要求

> 詳細 Claude 優化指引：調用 `Skill` 工具，`skill: prompt-engineer:claude-optimization`。

## OpenAI GPT Models

### GPT-4.1 / GPT-4o

**Key characteristics**:
- 強指令遵循
- JSON/結構化輸出優良
- 多模態能力
- 回應速度快

**Best patterns**:
```
Role: You are a [specific role with expertise].

Task: [Clear, specific task description]

Requirements:
1. [Specific requirement]
2. [Format specification]
3. [Constraints]

Output Format:
Return as JSON: {"field": "type", ...}
```

**Tips**:
- 生產環境固定特定模型快照
- 最高優先級引導使用 `instructions` API 參數
- 提供語境示例效果最佳
- 格式要求需明確

### GPT-5

**Key characteristics**:
- 最強 GPT 模型
- 內建推理能力
- 強大代理潛力

**Best patterns**:
- 類似 GPT-4.1 但可處理更高複雜度
- 逐步引導需求更少
- 善於推斷意圖

## OpenAI Reasoning Models (o1/o3/o4)

### o1, o3, o4-mini

**Key characteristics**:
- 內部思維鏈推理
- 複雜問題表現優秀
- 延遲高、成本高
- 五步以上問題最佳

**Best patterns**:
```
Solve this problem:

[Clear problem statement]

Constraints:
- [Constraint 1]
- [Constraint 2]

Provide your final answer with explanation.
```

**與標準 LLM 之關鍵差異**:
1. **無少樣本示例** — 降低效能
2. **無顯式 CoT**（「think step by step」）— 內部推理
3. **簡潔明確提示** — 勿過度工程
4. **讓其思考** — 勿規定步驟

**When to use**:
- 複雜數學/邏輯問題
- 多步規劃
- 需深度分析之任務
- 精度 > 速度/成本

## DeepSeek

### DeepSeek R1

**Key characteristics**:
- 專用推理模型
- 開放權重
- 提示風格截然不同

**Best patterns**:
```
[Direct problem statement]

[Any necessary context]

[Clear output expectation]
```

**Critical tips**:
- **Temperature**: 0.5-0.7（推薦 0.6）
- **Top-p**: 0.95
- **No system prompt**（原版 R1）
- **No few-shot examples** — 損害效能
- **No CoT prompting** — 內部推理

**鼓勵深度推理**:
```
"Take your time and think carefully about this problem."
```

### DeepSeek V3.1

**Key characteristics**:
- 混合模型（思考 + 非思考模式）
- 671B 參數，37B 激活
- 128K 語境

**Mode selection**:
```
# Thinking mode (like R1)
Use for: complex reasoning, math, analysis

# Non-thinking mode (like V3)
Use for: quick responses, simple tasks
```

## Qwen (Alibaba)

### Qwen 2.5

**Key characteristics**:
- 強多語言能力（29+ 語言）
- 結構化數據（表格、JSON）表現良好
- 長語境（128K）
- 強數學能力

**Best patterns for math**:
```
Please reason step by step, and put your final answer within \boxed{}.

Problem: [math problem]
```

**For tool-integrated reasoning (TIR)**:
```
Please integrate step-by-step reasoning and Python code to solve math problems.
Present the final result in LaTeX using a \boxed{} without any units.
```

**Tips**:
- 對多樣系統提示具韌性
- 擅長生成結構化輸出（JSON）
- 可生成 8K+ 令牌

## Kimi K2 (Moonshot AI)

### Kimi-K2-Instruct

**Key characteristics**:
- 1T 總參數，32B 激活（MoE）
- 強代理/工具調用能力
- 兼容 OpenAI/Anthropic API

**Best patterns**:
```
# Native tool calling preferred
# Temperature: 0.6 recommended
# Clear, direct instructions
```

**Tips**:
- 工具調用能力強 — 使用原生格式
- 可能需要迭代提示以獲最優結果
- 可用默認系統提示
- Anthropic API 映射溫度（real_temp = request_temp * 0.6）

### Kimi K2 Thinking

**複雜分析**:
```
Please use K2 Thinking to analyze: [problem]

Requirements:
1) Display complete analysis approach
2) Provide step-by-step optimization strategy
3) Estimate improvement effects
```

## Grok (xAI)

### grok-code-fast-1

**Key characteristics**:
- 速度 4 倍、成本 1/10 競品
- 優化於代理/編碼任務
- 強工具調用支持

**Best patterns**:
```markdown
## Context
[Thorough background information]

## Task
[Clear directive]

## Requirements
- [Requirement 1]
- [Requirement 2]

## Expected Output
[Format specification]
```

**Tips**:
- 系統提示**需詳盡** — 影響顯著
- 使用 **XML 標籤或 Markdown** 結構化
- 使用**原生工具調用**（非 XML 輸出）
- **快速迭代** — 速度支持快速精煉
- 更適合**代理任務**而非單次查詢

### Grok 3 Features

- **Think Mode**：數學、編碼、科學（自動思維鏈）
- **DeepSearch**：顯式請求以獲取即時信息
- **Image Generation**：支持視覺輸出

## GLM (Zhipu AI / Z.ai)

### GLM-4.7

**Key characteristics**:
- ~400B 參數
- 200K 語境視窗，128K 輸出
- 編碼與數學能力強
- 中文語言優秀

**Best patterns**:
- 支持「交錯思考」模式
- 結構類似其他模型
- 適合多步任務

**Tips**:
- 通過 BigModel.cn API 可用
- 集成至 z.ai 開發環境
- 思考模式適用複雜推理

## Code vs Text Prompting

### Code Generation Specifics

```xml
<code_request>
<language>Python</language>
<purpose>Calculate compound interest</purpose>
<inputs>
- principal: float
- rate: float (annual)
- years: int
</inputs>
<output>float (final amount)</output>
<constraints>
- Handle edge cases (negative values)
- Include docstring
- Type hints required
</constraints>
</code_request>
```

**與文本生成之關鍵差異**:
- 較短提示通常效果更好（理想 <50 字）
- 明確指定語言、輸入、輸出
- 包含邊界案例處理要求
- 請求特定代碼風格（注釋、類型）

### Text Generation

```
Write a [genre] piece about [topic].

Style: [tone, voice]
Length: [word count]
Audience: [target reader]
Include: [specific elements]
Avoid: [things to exclude]
```

## Reasoning vs Non-Reasoning Selection

### Use Reasoning Models (o1/o3/R1) When:
- 問題需五步以上推理
- 精度關鍵
- 數學/邏輯/分析密集型任務
- 時間/成本可接受

### Use Standard LLMs When:
- 任務直接
- 速度重要
- 格式/示例重要
- 成本敏感
- 少樣本學習有益

## Universal Best Practices

1. **了解模型**：各有獨特優勢
2. **從簡開始**：需要時才增加複雜度
3. **測試迭代**：有效方法因模型而異
4. **查閱文檔**：模型快速演進
5. **技術匹配模型**：勿在推理模型用 CoT
6. **結構有益**：XML/Markdown 改善多數模型
7. **明確表述**：新模型字面遵循指令
