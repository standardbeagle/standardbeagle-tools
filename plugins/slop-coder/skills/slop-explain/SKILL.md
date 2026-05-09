---
name: slop-coder-slop-explain
description: "\"Explain SLOP code - understand what SLOP code does and how it works. 解析SLOP代碼結構、邏輯與行為。 Use when: understanding unfamiliar SLOP code, tracing data flow, identifying patterns and safety features.\""
disable-model-invocation: true
---

# Explain SLOP Code

分析並解釋SLOP代碼，分解其結構、邏輯與行為。

## Usage

```bash
/slop-explain
```

然後提供或粘貼需解釋的SLOP代碼。

## What You Should Do

解釋SLOP代碼時：

### 1. Identify the Structure

- 簡單腳本還是模組化代碼？
- 定義了哪些函數？
- 主入口點在哪？
- 使用了哪些外部服務（LLM、MCP）？

### 2. Explain Each Section

**For functions:**
- 輸入為何？
- 返回何值？
- 有何副作用？

**For loops:**
- 迭代什麼？
- 邊界如何（limit、rate等）？
- 每次迭代發生什麼？

**For LLM calls:**
- 發送了什麼提示？
- 期望什麼模式？
- 響應如何使用？

### 3. Trace the Data Flow

從輸入到輸出追蹤數據：
1. 數據從哪裡來？
2. 如何轉換？
3. 去往何處（emit、return）？

### 4. Identify Patterns

識別常見SLOP範式：
- AI代理範式
- 數據管道範式
- 批處理範式
- 思維鏈範式

> Invoke the `Skill` tool with `skill: slop-coder:patterns` — 查閱範式詳解。

### 5. Note Safety Features

- 循環邊界（limit、rate、timeout）
- 錯誤處理（try/catch）
- 輸入校驗

## Explanation Template

```markdown
## Overview
<One sentence summary of what the code does>

## Structure
- **Functions defined:** <list>
- **External services:** <list>
- **Entry point:** <description>

## Detailed Walkthrough

### Section 1: <name>
<Explanation of what this section does>

### Section 2: <name>
<Explanation of what this section does>

## Data Flow
1. <Step 1>
2. <Step 2>
3. <Step 3>

## Output
<What is emitted and when>

## Safety Features
- <Feature 1>
- <Feature 2>
```

## Example Explanation

Given this code:

```python
def classify(text, categories):
    response = llm.call(
        prompt: "Classify this text into one of: {categories}\n\nText: {text}",
        schema: {
            category: string,
            confidence: float
        }
    )
    return response

texts = ["Great product!", "Terrible service", "It's okay"]

for text in texts with limit(100):
    result = classify(text, ["positive", "negative", "neutral"])
    emit(text: text, category: result.category, confidence: result.confidence)

emit(status: "complete", count: len(texts))
```

**Explanation:**

## Overview
此代碼使用LLM對文本樣本列表進行情感分類。

## Structure
- **Functions defined:** `classify(text, categories)`
- **External services:** LLM（用於分類）
- **Entry point:** 主循環，遍歷`texts`列表

## Detailed Walkthrough

### Function: classify
接受文本字符串與類別列表。以分類提示調用LLM，期望結構化響應含：
- `category`：所選分類
- `confidence`：置信分（0.0-1.0）

### Main Loop
遍歷`texts`列表，安全限制100次迭代。每次文本：
1. 以文本與類別選項調用`classify()`
2. emit原始文本、分配的類別與置信分

### Final Output
emit完成狀態與已處理總數。

## Data Flow
1. 輸入：文本字符串列表
2. 轉換：每條文本 → LLM分類 → 類別+置信分
3. 輸出：(text, category, confidence)元組流，最後輸出狀態

## Output
- **Per item:** `{text: "...", category: "positive", confidence: 0.95}`
- **Final:** `{status: "complete", count: 3}`

## Safety Features
- 循環以`limit(100)`有界
- LLM調用定義模式，確保結構化輸出
