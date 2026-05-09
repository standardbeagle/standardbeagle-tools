---
description: SLOP module system - creating, using, and composing reusable code modules. SLOP模組系統，創建、使用、組合可復用模組。Use when: structuring multi-file projects, declaring module dependencies, remapping module implementations, testing with mocks.
---

# SLOP Module System

SLOP以SOURCE/USE/MAIN三段式支持模組化組織，實現可復用、可組合之代碼。

---

## Module Structure

SLOP文件含模組者，分三節：

1. **SOURCE** — 定義可復用模組
2. **USE** — 導入模組
3. **MAIN** — 入口點

```python
===SOURCE: utils===
id: "mycompany/utils@v1"
uses: {}
provides: [clean, normalize]
---
def clean(s):
    return strip(s)

def normalize(s):
    return " ".join(split(s))

===USE: mycompany/utils===

===MAIN===
result = utils.clean("  hello world  ")
emit result
```

---

## Defining Modules (SOURCE)

### Basic Module

```python
===SOURCE: math_utils===
id: "mycompany/math-utils@v1"
uses: {}
provides: [add, multiply, square]
---
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

def square(x):
    return x ** 2
```

### Module Metadata

| Field | Description | Required |
|-------|-------------|----------|
| `id` | Unique identifier with version | Yes |
| `uses` | Dependencies on other modules | Yes (can be `{}`) |
| `provides` | Exported function names | Yes |

### Module ID Format

```
<namespace>/<name>@<version>
```

Examples:
- `mycompany/utils@v1`
- `stdlib/strings@v2.1`
- `team/data-processing@v1.0.0`

---

## Using Modules (USE)

### Import a Module

```python
===USE: mycompany/utils===

===MAIN===
# Access via module name
result = utils.clean(input)
```

### Module Alias

模組以ID末段短名訪問：

```python
===USE: mycompany/data-utils===

===MAIN===
# Use 'data-utils' prefix
data-utils.process(data)
```

---

## Module Dependencies

### Declaring Dependencies

模組可依賴其他模組：

```python
===SOURCE: processor===
id: "mycompany/processor@v1"
uses: {utils: "mycompany/utils@v1"}
provides: [process]
---
def process(item):
    # Use the utils module
    cleaned = utils.clean(item)
    return utils.normalize(cleaned)
```

### Wiring Dependencies

使用含依賴之模組時，需導入全部所需模組：

```python
===USE: mycompany/processor===
===USE: mycompany/utils===

===MAIN===
result = processor.process("  messy  input  ")
emit result
```

### Dependency Remapping

覆蓋模組所用實現：

```python
===USE: mycompany/processor with {utils: custom/utils}===
===USE: custom/utils===

===MAIN===
# processor now uses custom/utils instead of mycompany/utils
result = processor.process(input)
```

---

## Complete Example

### Library Module

```python
===SOURCE: text-processing===
id: "stdlib/text-processing@v1"
uses: {}
provides: [tokenize, clean_tokens, count_words]
---

def tokenize(text):
    return split(lower(text), " ")

def clean_tokens(tokens):
    return tokens
        | filter(t -> len(t) > 0)
        | filter(t -> not contains(t, "@"))
        | map(t -> strip(t, ".,!?"))

def count_words(text):
    tokens = clean_tokens(tokenize(text))
    counts = {}
    for token in tokens with limit(10000):
        current = get(counts, token, 0)
        counts = merge(counts, {token: current + 1})
    return counts
```

### Analysis Module (depends on text-processing)

```python
===SOURCE: text-analysis===
id: "mycompany/text-analysis@v1"
uses: {text: "stdlib/text-processing@v1"}
provides: [analyze, summarize]
---

def analyze(document):
    words = text.count_words(document)
    total = sum(values(words))
    unique = len(keys(words))

    return {
        total_words: total,
        unique_words: unique,
        word_counts: words
    }

def summarize(document):
    analysis = analyze(document)

    summary = llm.call(
        prompt: "Summarize this document in one sentence: {document}",
        schema: {summary: string}
    )

    return merge(analysis, {summary: summary.summary})
```

### Main Program

```python
===USE: mycompany/text-analysis===
===USE: stdlib/text-processing===

===MAIN===
document = "This is a sample document. This document contains sample text."

result = text-analysis.summarize(document)

emit(
    total: result.total_words,
    unique: result.unique_words,
    summary: result.summary
)
```

---

## Module Best Practices

### 1. Single Responsibility

各模組職責單一：

```python
# GOOD: Focused modules
===SOURCE: validators===
provides: [validate_email, validate_phone, validate_url]

===SOURCE: formatters===
provides: [format_date, format_currency, format_phone]

# BAD: Catch-all module
===SOURCE: utilities===
provides: [everything_under_the_sun]
```

### 2. Explicit Dependencies

顯式聲明所有依賴：

```python
# GOOD: Clear dependencies
===SOURCE: report-generator===
uses: {
    data: "mycompany/data-loader@v1",
    charts: "stdlib/charts@v2",
    pdf: "stdlib/pdf-export@v1"
}
```

### 3. Semantic Versioning

模組ID使用語義版本：

- `@v1` — 主版本（預期兼容變更）
- `@v1.2` — 次版本（新功能，向後兼容）
- `@v1.2.3` — 補丁版本（僅修復缺陷）

### 4. Minimal Exports

僅導出所需接口：

```python
# GOOD: Export public API only
provides: [process, validate]

# Internal helpers stay private
def _internal_helper():
    ...
```

### 5. Documentation in Modules

模組內含使用示例：

```python
===SOURCE: email===
id: "mycompany/email@v1"
uses: {}
provides: [send, validate, parse]
---
# Email utilities
# Usage:
#   result = email.send(to: "user@example.com", subject: "Hi", body: "Hello!")
#   valid = email.validate("user@example.com")

def send(to, subject, body):
    ...
```

---

## Module Resolution

### Resolution Order

1. 查SOURCE節中匹配ID
2. 查USE語句中匹配ID
3. 未找到則報錯

### Circular Dependencies

SLOP禁止循環依賴：

```python
# ERROR: Circular dependency detected
===SOURCE: a===
uses: {b: "pkg/b@v1"}

===SOURCE: b===
uses: {a: "pkg/a@v1"}  # Not allowed!
```

### Version Conflicts

多版本請求時，以首次導入者勝：

```python
===USE: mycompany/utils@v1===      # This version wins
===USE: mycompany/utils@v2===      # Ignored (same module)
```

---

## Testing Modules

### Inline Tests

```python
===SOURCE: math===
id: "mycompany/math@v1"
provides: [add, multiply]
---
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

# Test section (runs with slop test)
===TEST===
assert(add(2, 3) == 5, "add should work")
assert(multiply(3, 4) == 12, "multiply should work")
```

### Mock Dependencies

```python
===SOURCE: mock-api===
id: "test/mock-api@v1"
provides: [fetch]
---
def fetch(url):
    return {status: 200, body: "mock response"}

===USE: mycompany/service with {api: test/mock-api}===

===MAIN===
# service now uses mock API
result = service.get_data()
assert(result.status == 200)
```

---

## Organizing Large Projects

### Directory Structure

```
project/
├── lib/
│   ├── utils.slop         # Core utilities
│   ├── validators.slop    # Validation functions
│   └── formatters.slop    # Formatting functions
├── services/
│   ├── user.slop          # User service
│   └── order.slop         # Order service
├── agents/
│   ├── chat.slop          # Chat agent
│   └── search.slop        # Search agent
└── main.slop              # Entry point
```

### Module File Template

```python
# Module: <description>
# Author: <name>
# Version: <version>

===SOURCE: <module-name>===
id: "<namespace>/<module-name>@<version>"
uses: {
    # dependency: "namespace/module@version"
}
provides: [
    # exported functions
]
---

# Implementation

def exported_function():
    ...

def _private_helper():
    ...
```

---

## Quick Reference

| Element | Syntax |
|---------|--------|
| Define module | `===SOURCE: name===` |
| Module ID | `id: "namespace/name@version"` |
| Dependencies | `uses: {alias: "id"}` |
| Exports | `provides: [func1, func2]` |
| Import module | `===USE: namespace/name===` |
| Remap dependency | `===USE: module with {dep: other}===` |
| Main entry | `===MAIN===` |
| Access function | `module_name.function()` |
