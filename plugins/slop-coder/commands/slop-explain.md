---
name: slop-explain
description: Explain SLOP code - understand what SLOP code does and how it works
---

# Explain SLOP Code

Analyze and explain SLOP code, breaking down its structure, logic, and behavior.

## Usage

```bash
/slop-explain
```

Then provide or paste the SLOP code you want explained.

## What You Should Do

When explaining SLOP code:

### 1. Identify the Structure

- Is it a simple script or modular code?
- What functions are defined?
- What is the main entry point?
- What external services are used (LLM, MCP)?

### 2. Explain Each Section

**For functions:**
- What does it take as input?
- What does it return?
- What side effects does it have?

**For loops:**
- What is being iterated?
- What are the bounds (limit, rate, etc.)?
- What happens in each iteration?

**For LLM calls:**
- What prompt is being sent?
- What schema is expected?
- How is the response used?

### 3. Trace the Data Flow

Follow data from input to output:
1. Where does data come from?
2. How is it transformed?
3. Where does it go (emit, return)?

### 4. Identify Patterns

Recognize common SLOP patterns:
- AI agent pattern
- Data pipeline pattern
- Batch processing pattern
- Chain of thought pattern

### 5. Note Safety Features

- Loop bounds (limit, rate, timeout)
- Error handling (try/catch)
- Input validation

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
This code classifies a list of text samples into sentiment categories using an LLM.

## Structure
- **Functions defined:** `classify(text, categories)`
- **External services:** LLM (for classification)
- **Entry point:** Main loop over `texts` list

## Detailed Walkthrough

### Function: classify
Takes a text string and list of categories. Calls the LLM with a classification prompt and expects a structured response containing:
- `category`: The chosen classification
- `confidence`: A confidence score (0.0-1.0)

### Main Loop
Iterates over the `texts` list with a safety limit of 100 iterations.
For each text:
1. Calls `classify()` with the text and category options
2. Emits the original text, assigned category, and confidence score

### Final Output
Emits a completion status with the total count processed.

## Data Flow
1. Input: List of text strings
2. Transform: Each text → LLM classification → category + confidence
3. Output: Stream of (text, category, confidence) tuples, then status

## Output
- **Per item:** `{text: "...", category: "positive", confidence: 0.95}`
- **Final:** `{status: "complete", count: 3}`

## Safety Features
- Loop bounded with `limit(100)`
- LLM call has defined schema for structured output
