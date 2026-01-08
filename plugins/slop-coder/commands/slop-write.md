---
name: slop-write
description: Write SLOP code with AI assistance - generates correct, safe, and idiomatic SLOP code
---

# Write SLOP Code

Generate SLOP code based on requirements. This command helps you write correct, safe, and idiomatic SLOP code.

## Usage

```bash
/slop-write <description of what you want>
```

## Examples

```bash
/slop-write an agent that summarizes articles
/slop-write a data pipeline that filters and transforms user records
/slop-write a batch processor that calls an API with rate limiting
```

## What You Should Do

When asked to write SLOP code, follow these guidelines:

### 1. Understand the Requirements

- What is the input?
- What is the output?
- Are there external services (LLM, API, MCP)?
- Are there performance constraints (rate limits, timeouts)?

### 2. Apply SLOP Best Practices

**Always:**
- Bound all loops with `limit()`, `rate()`, or bounded collections
- Use `emit` for streaming output
- Handle errors with `try/catch`
- Use schemas for LLM calls

**Prefer:**
- Pipelines over nested loops
- Lambda functions for simple transforms
- `match` expressions for branching
- Meaningful variable names

### 3. Structure the Code

```python
# 1. Define helper functions first
def process_item(item):
    ...

def validate(data):
    ...

# 2. Main logic
items = get_items()

for item in items with limit(1000):
    result = process_item(item)
    emit result

# 3. Final output
emit(status: "complete")
```

### 4. Use Appropriate Patterns

**For AI agents:**
```python
def agent(input):
    response = llm.call(
        prompt: input,
        schema: {output: string}
    )
    return response.output

result = agent(user_input)
emit result
```

**For data pipelines:**
```python
result = data
    | filter(x -> condition(x))
    | map(x -> transform(x))
    | take(limit)

emit result
```

**For batch processing:**
```python
for item in items with limit(1000), rate(10/s):
    try:
        result = process(item)
        emit(item: item.id, status: "success")
    catch:
        emit(item: item.id, status: "failed")
```

**For MCP services:**
```python
result = service.method(arg1: val1, arg2: val2)
emit result
```

## Code Generation Template

When generating SLOP code, produce output in this format:

```python
# Description: <what the code does>
# Input: <expected input>
# Output: <what is emitted>

# Helper functions
def helper_function():
    ...

# Main logic
# ... processing code ...

# Output
emit(result: result, status: "complete")
```

## Validation Checklist

Before presenting code, verify:

- [ ] All loops are bounded (limit, rate, or finite collection)
- [ ] LLM calls have schemas defined
- [ ] Error handling is present for risky operations
- [ ] Variables are properly scoped
- [ ] Output uses emit statements
- [ ] No infinite recursion possible
- [ ] String interpolation uses `{variable}` syntax
- [ ] Pipelines use `|` operator correctly
- [ ] Lambda syntax is `x -> expression` or `(a, b) -> expression`

## Common Mistakes to Avoid

### Wrong: Unbounded loop
```python
# BAD
for item in stream:
    process(item)

# GOOD
for item in stream with limit(1000):
    process(item)
```

### Wrong: Missing schema
```python
# BAD
response = llm.call(prompt: "Question")

# GOOD
response = llm.call(
    prompt: "Question",
    schema: {answer: string}
)
```

### Wrong: Silent failures
```python
# BAD
result = risky_call()

# GOOD
try:
    result = risky_call()
catch:
    emit(error: "Call failed")
    stop
```

### Wrong: Incorrect string interpolation
```python
# BAD
msg = "Hello " + name + "!"
msg = f"Hello {name}!"

# GOOD
msg = "Hello, {name}!"
```

### Wrong: Incorrect lambda syntax
```python
# BAD
items.map(x => x * 2)
items.map(lambda x: x * 2)

# GOOD
items | map(x -> x * 2)
```
