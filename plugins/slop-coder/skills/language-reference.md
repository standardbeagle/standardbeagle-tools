---
name: slop-language
description: Complete SLOP language reference - syntax, data types, operators, control flow, and LLM integration
---

# SLOP Language Reference

SLOP (Structured Language for Orchestrating Prompts) is a domain-specific language for building AI agents and LLM orchestration workflows. It features Python-like syntax with built-in safety guarantees.

## Key Characteristics

- **Python-like syntax** - Familiar indentation-based blocks
- **Safety-first** - All loops must be bounded, no infinite recursion
- **AI-native** - Built-in LLM calls and schema validation
- **Streaming** - `emit` statements for progressive output

---

## Data Types

### Primitives

```python
# None (null value)
none

# Booleans
true
false

# Integers (64-bit)
42
-17
0

# Floats (64-bit)
3.14
-0.5
1.0e10

# Strings (UTF-8, double-quoted)
"hello world"
"line1\nline2"
"tab\there"
```

### String Interpolation

```python
name = "Alice"
greeting = "Hello, {name}!"  # "Hello, Alice!"

count = 5
msg = "Found {count} items"  # "Found 5 items"
```

### Collections

```python
# Lists (ordered, mutable)
items = [1, 2, 3]
mixed = [1, "two", true, none]
nested = [[1, 2], [3, 4]]

# Maps (ordered by insertion)
user = {name: "Alice", age: 30}
config = {"api-key": "xxx", "timeout": 30}

# Sets (unordered, unique)
tags = {"red", "green", "blue"}
```

### Collection Access

```python
# List indexing (0-based)
items[0]      # First element
items[-1]     # Last element
items[1:3]    # Slice [1, 2]
items[::2]    # Every other element

# Map access
user["name"]  # "Alice"
user.name     # "Alice" (dot notation)

# Safe access (returns none if missing)
user?.email   # none (no error)
items?[10]    # none (no error)
```

---

## Operators

### Arithmetic

```python
a + b    # Addition
a - b    # Subtraction
a * b    # Multiplication
a / b    # Division (float)
a % b    # Modulo
a ** b   # Power
```

### Comparison

```python
a == b   # Equal
a != b   # Not equal
a < b    # Less than
a > b    # Greater than
a <= b   # Less or equal
a >= b   # Greater or equal
```

### Logical

```python
a and b  # Logical AND
a or b   # Logical OR
not a    # Logical NOT
```

### Membership

```python
x in items       # True if x is in items
x not in items   # True if x is not in items
```

### Assignment

```python
x = 5      # Simple assignment
x += 1     # Add and assign
x -= 1     # Subtract and assign
x *= 2     # Multiply and assign
x /= 2     # Divide and assign
```

### Pipeline

```python
# Chain function calls left-to-right
data | filter(x -> x > 0) | map(x -> x * 2) | take(5)

# Equivalent to:
take(map(filter(data, x -> x > 0), x -> x * 2), 5)
```

### Lambda (Arrow Functions)

```python
# Single parameter
x -> x * 2

# Multiple parameters (parentheses required)
(a, b) -> a + b

# In context
items | map(x -> x.upper())
items | filter(item -> item.active)
```

---

## Control Flow

### If/Elif/Else

```python
if condition:
    do_something()
elif other_condition:
    do_other()
else:
    do_default()
```

### For Loops

All loops must be bounded for safety.

```python
# Iterate over collection
for item in items:
    process(item)

# With index
for i, item in enumerate(items):
    print(i, item)

# Parallel iteration
for a, b in zip(list1, list2):
    combine(a, b)

# Range iteration
for i in range(10):
    print(i)  # 0 to 9

for i in range(1, 11):
    print(i)  # 1 to 10

for i in range(0, 10, 2):
    print(i)  # 0, 2, 4, 6, 8
```

### Loop Modifiers

```python
# Limit iterations
for item in items with limit(100):
    process(item)

# Rate limiting
for item in items with rate(10/s):
    call_api(item)

# Parallel execution
for item in items with parallel(5):
    fetch(item)

# Timeout
for item in items with timeout(30s):
    slow_operation(item)

# Combined modifiers
for item in items with limit(100), rate(5/s), timeout(60s):
    process(item)
```

### Match Expressions

```python
# Expression form (returns value)
status = match code:
    200 -> "ok"
    404 -> "not found"
    500 -> "server error"
    _ -> "unknown"

# Statement form
match response.status:
    "success" -> emit(response.data)
    "error" -> emit(error: response.message)
    _ -> emit(warning: "unexpected status")
```

### Try/Catch

```python
try:
    result = risky_operation()
    emit result
catch:
    emit(error: "operation failed")
```

### Control Statements

```python
return value   # Return from function
break          # Exit loop
continue       # Skip to next iteration
stop           # Halt entire program execution
```

---

## Functions

### Definition

```python
def greet(name):
    return "Hello, " + name

# With type hints (documentation only, not enforced)
def add(a: int, b: int) -> int:
    return a + b

# Default parameters
def connect(host, port=8080):
    return create_connection(host, port)
```

### Calling Functions

```python
# Positional arguments
greet("Alice")

# Keyword arguments
connect(host="localhost", port=3000)

# Mixed
connect("localhost", port=3000)
```

### Lambda Functions

```python
# Single expression
double = x -> x * 2

# Multiple parameters
add = (a, b) -> a + b

# In pipelines
items | map(x -> x * 2)
items | filter(x -> x > 0)
```

---

## LLM Integration

### Basic LLM Call

```python
response = llm.call(
    prompt: "What is the capital of France?"
)
emit response
```

### With Schema (Structured Output)

```python
response = llm.call(
    prompt: "Extract the person's name and age from: 'John is 25 years old'",
    schema: {
        name: string,
        age: int
    }
)
emit(name: response.name, age: response.age)
```

### With Parameters

```python
response = llm.call(
    prompt: user_input,
    schema: {answer: string, confidence: float},
    model: "claude-3-5-sonnet",
    temperature: 0.7,
    max_tokens: 1024
)
```

### Schema Types

```python
# Primitives
{name: string}
{count: int}
{score: float}
{active: bool}

# Arrays
{items: [string]}
{numbers: [int]}

# Nested objects
{
    user: {
        name: string,
        email: string
    },
    posts: [{
        title: string,
        content: string
    }]
}

# Optional with defaults
{
    name: string,
    nickname: string | none
}
```

---

## Output with Emit

### Basic Emit

```python
emit "Hello, World!"
emit result
```

### Multiple Values

```python
emit(a, b, c)
```

### Named Values

```python
emit(
    result: computed_value,
    status: "success",
    count: len(items)
)
```

### Streaming Pattern

```python
for item in items with limit(100):
    processed = transform(item)
    emit(item: processed)

emit(status: "complete", total: len(items))
```

---

## List Comprehensions

```python
# Basic
squares = [x ** 2 for x in range(10)]

# With filter
evens = [x for x in numbers if x % 2 == 0]

# With transform and filter
processed = [x.upper() for x in items if x.startswith("a")]

# Nested
pairs = [(x, y) for x in xs for y in ys]
```

---

## Comments

```python
# Single-line comment

# Multi-line comments use multiple #
# This is line 1
# This is line 2
```

---

## Truthiness

Values that are **falsy** (evaluate to false in boolean context):

- `none`
- `false`
- `0` (integer zero)
- `0.0` (float zero)
- `""` (empty string)
- `[]` (empty list)
- `{}` (empty map/set)

Everything else is **truthy**.

---

## Reserved Keywords

```
if elif else for in with match def return emit stop
and or not true false none range limit rate parallel timeout
try catch break continue source use main export input output
```

---

## Best Practices

1. **Always bound loops** - Use `limit()`, `rate()`, or bounded collections
2. **Use schemas for LLM calls** - Get structured, type-safe responses
3. **Emit incrementally** - Stream results for long operations
4. **Handle errors** - Use try/catch for risky operations
5. **Use pipelines** - Chain transformations for readability
6. **Keep functions small** - Single responsibility
7. **Use meaningful names** - Self-documenting code
