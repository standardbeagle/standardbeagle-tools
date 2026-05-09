---
name: prompt-engineer-analyze-prompt
description: "\"Analyze prompts for clarity, effectiveness, and optimization opportunities. 分析提示之清晰度、有效性及優化機會。 Use when: reviewing existing prompts, identifying issues before deployment, generating improvement recommendations.\""
disable-model-invocation: true
allowed-tools: "[\"Read\", \"Write\", \"AskUserQuestion\"]"
---

以 2026 最新提示工程原則分析提示或系統提示，識別改進機會。

## Analysis Framework

### 1. Gather the Prompt

首先獲取待分析提示：
- 若用戶提供文件路徑，以 Read 工具讀取
- 若用戶直接粘貼，直接使用
- 若未提供，以 AskUserQuestion 請求

### 2. Structural Analysis

以 **TCRTE 框架**（Task、Context、Role、Tone、Examples）評估提示結構：

| Component | Description | Present? | Quality (1-5) | Notes |
|-----------|-------------|----------|---------------|-------|
| **Task** | Clear directive of what to do | | | |
| **Context** | Background information and constraints | | | |
| **Role** | Who the model should act as | | | |
| **Tone** | Style and voice guidance | | | |
| **Examples** | Few-shot demonstrations | | | |

### 3. Clarity Assessment

檢查常見清晰度問題：

- **Ambiguity**：可多種解讀之模糊指令
- **Missing constraints**：未定義之範圍、長度或格式
- **Conflicting instructions**：矛盾引導
- **Assumed context**：引用但未提供之信息
- **Implicit expectations**：期望但未明確說明之行為

### 4. Claude Compatibility

Claude 模型精確遵循指令。檢查：

- [ ] **Explicit action requests**："Create X" vs "Can you suggest X?"
- [ ] **Specificity**：格式、長度、風格是否精確指定
- [ ] **Context motivation**：是否說明指令之原因
- [ ] **Example alignment**：示例是否與期望輸出完全一致
- [ ] **Negative framing**："Don't do X" 應改為 "Do Y instead"

### 5. Context Window Efficiency

評估令牌效率：

- **Redundancy**：重複信息
- **Verbosity**：可壓縮之冗長段落
- **Dead weight**：對任務成功無貢獻之信息
- **Missing high-signal content**：缺失之重要語境

### 6. Advanced Pattern Check

尋找應用機會：

- **Structured output**：JSON/XML 輸出能否提升可靠性？
- **Chain-of-thought**：逐步推理能否有益？
- **Few-shot examples**：3-5 個示例能否顯著改善輸出？
- **Prompt scaffolding**：是否需要防禦護欄？
- **XML delineation**：結構化節段能否改善解析？

### 7. Generate Report

生成結構化分析報告：

```markdown
## Prompt Analysis Report

### Overall Score: X/10

### Strengths
- [List what the prompt does well]

### Critical Issues
1. **[Issue name]**: [Description and impact]
   - **Fix**: [Specific recommendation]

### Optimization Opportunities
1. **[Opportunity]**: [How it would improve results]

### Recommended Rewrite
[If significant changes needed, provide optimized version]

### Quick Wins
- [Small changes with high impact]

### Token Efficiency
- Current estimated tokens: ~X
- Potential reduction: ~Y tokens (Z%)
- Key areas for compression: [List]
```

## Common Patterns to Flag

### Red Flags
- "Do whatever you think is best"（過於模糊）
- "Be creative" without constraints（範圍未定義）
- 長串「don't do」指令（應改為正面表述）
- 示例與期望輸出格式不符
- 缺少成功標準

### Green Flags
- 首句清晰陳述任務
- 明確格式規格
- 指令附動機語境
- 多樣高品質示例
- 具體成功標準

## Example Analysis

**Poor Prompt**:
```
Help me write better code
```

**Analysis**:
- Task: Vague ("better" is undefined)
- Context: None
- Role: None
- Tone: None
- Examples: None
- Score: 2/10

**Optimized**:
```
Review this Python function and improve its performance, readability, and error handling.

Focus on:
1. Time complexity optimization
2. PEP 8 style compliance
3. Proper exception handling with specific exception types
4. Clear variable names and docstrings

Return the improved code with inline comments explaining each change.

<code>
[code here]
</code>
```

Score: 8/10 - Clear task, specific focus areas, defined output format
