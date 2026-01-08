---
name: slop-patterns
description: Common SLOP patterns and idioms for building AI agents, data processing, and orchestration workflows
---

# SLOP Patterns and Idioms

This guide covers common patterns for writing effective SLOP code.

---

## Pattern 1: Simple AI Agent

Basic pattern for an AI agent that processes user input.

```python
def agent(user_message: string) -> string:
    response = llm.call(
        prompt: user_message,
        schema: {answer: string}
    )
    return response.answer

# Usage
result = agent("What is 2 + 2?")
emit result
```

---

## Pattern 2: Structured Data Extraction

Extract structured data from unstructured text.

```python
def extract_entities(text: string):
    return llm.call(
        prompt: "Extract all people, places, and organizations from: {text}",
        schema: {
            people: [string],
            places: [string],
            organizations: [string]
        }
    )

# Usage
text = "John Smith met with Apple CEO Tim Cook in Cupertino yesterday."
entities = extract_entities(text)
emit(
    people: entities.people,
    places: entities.places,
    orgs: entities.organizations
)
```

---

## Pattern 3: Chain of Thought Reasoning

Multi-step reasoning with intermediate steps.

```python
def reason(question: string):
    # Step 1: Break down the problem
    analysis = llm.call(
        prompt: "Break down this problem into steps: {question}",
        schema: {steps: [string]}
    )

    # Step 2: Solve each step
    solutions = []
    for step in analysis.steps with limit(10):
        solution = llm.call(
            prompt: "Solve this step: {step}",
            schema: {result: string, explanation: string}
        )
        solutions = append(solutions, solution)
        emit(step: step, result: solution.result)

    # Step 3: Combine into final answer
    final = llm.call(
        prompt: "Combine these solutions into a final answer: {solutions}",
        schema: {answer: string}
    )

    return final.answer

result = reason("How many tennis balls fit in a school bus?")
emit(final_answer: result)
```

---

## Pattern 4: Data Pipeline

Transform and filter data through a pipeline.

```python
# Raw data
items = [
    {name: "apple", price: 1.50, category: "fruit"},
    {name: "bread", price: 2.00, category: "bakery"},
    {name: "banana", price: 0.75, category: "fruit"},
    {name: "cake", price: 15.00, category: "bakery"}
]

# Pipeline processing
result = items
    | filter(item -> item.category == "fruit")
    | map(item -> {name: item.name, price: item.price * 1.1})
    | filter(item -> item.price < 2.0)

emit result
```

---

## Pattern 5: Batch Processing with Rate Limiting

Process items with rate limiting and progress tracking.

```python
def process_batch(items):
    results = []
    errors = []

    for i, item in enumerate(items) with limit(1000), rate(10/s):
        try:
            result = process_item(item)
            results = append(results, result)
            emit(progress: i + 1, total: len(items), status: "processing")
        catch:
            errors = append(errors, {item: item, error: "failed"})

    emit(
        status: "complete",
        processed: len(results),
        failed: len(errors),
        errors: errors
    )

    return results

def process_item(item):
    response = llm.call(
        prompt: "Summarize: {item.content}",
        schema: {summary: string}
    )
    return {id: item.id, summary: response.summary}

# Usage
items = load_items()
process_batch(items)
```

---

## Pattern 6: Retry with Backoff

Retry failed operations with increasing delays.

```python
def with_retry(operation, max_attempts=3):
    attempt = 0
    for _ in range(max_attempts) with limit(max_attempts):
        attempt = attempt + 1
        try:
            result = operation()
            return {success: true, result: result, attempts: attempt}
        catch:
            emit(warning: "Attempt {attempt} failed, retrying...")

    return {success: false, result: none, attempts: attempt}

# Usage
def fetch_data():
    return api.call("get_data")

result = with_retry(fetch_data, max_attempts=5)
if result.success:
    emit result.result
else:
    emit(error: "All attempts failed")
```

---

## Pattern 7: Parallel Processing

Process items in parallel for better throughput.

```python
def fetch_all(urls):
    results = []

    for url in urls with parallel(10), timeout(30s):
        response = http.get(url)
        results = append(results, {url: url, data: response})
        emit(fetched: url)

    return results

# Usage
urls = [
    "https://api.example.com/item/1",
    "https://api.example.com/item/2",
    "https://api.example.com/item/3"
]
data = fetch_all(urls)
emit(total: len(data))
```

---

## Pattern 8: Conversational Agent

Multi-turn conversation with context.

```python
def chat_agent(messages):
    # Build conversation context
    context = ""
    for msg in messages with limit(20):
        role = msg.role
        content = msg.content
        context = context + "{role}: {content}\n"

    # Generate response
    response = llm.call(
        prompt: "Continue this conversation:\n{context}\nassistant:",
        schema: {
            reply: string,
            intent: string,
            entities: [string]
        }
    )

    return response

# Usage
messages = [
    {role: "user", content: "Hello!"},
    {role: "assistant", content: "Hi there! How can I help?"},
    {role: "user", content: "What's the weather like?"}
]

response = chat_agent(messages)
emit(reply: response.reply, intent: response.intent)
```

---

## Pattern 9: Classification with Confidence

Classify items with confidence scores.

```python
def classify(text, categories):
    response = llm.call(
        prompt: "Classify this text into one of these categories: {categories}\n\nText: {text}",
        schema: {
            category: string,
            confidence: float,
            reasoning: string
        }
    )

    # Only accept high-confidence classifications
    if response.confidence >= 0.8:
        return {
            category: response.category,
            confidence: response.confidence,
            status: "classified"
        }
    else:
        return {
            category: none,
            confidence: response.confidence,
            status: "uncertain"
        }

# Usage
categories = ["positive", "negative", "neutral"]
result = classify("This product is amazing!", categories)
emit result
```

---

## Pattern 10: Aggregation and Summary

Aggregate data and generate summaries.

```python
def summarize_feedback(reviews):
    # Aggregate statistics
    total = len(reviews)
    positive = len([r for r in reviews if r.sentiment == "positive"])
    negative = len([r for r in reviews if r.sentiment == "negative"])

    # Extract common themes
    all_text = " ".join([r.text for r in reviews])
    themes = llm.call(
        prompt: "Identify the top 5 themes from these reviews: {all_text}",
        schema: {themes: [{name: string, count: int, examples: [string]}]}
    )

    # Generate executive summary
    summary = llm.call(
        prompt: "Write a brief executive summary of {total} reviews. {positive} positive, {negative} negative. Themes: {themes.themes}",
        schema: {summary: string}
    )

    return {
        total: total,
        positive: positive,
        negative: negative,
        themes: themes.themes,
        summary: summary.summary
    }

# Usage
reviews = load_reviews()
report = summarize_feedback(reviews)
emit report
```

---

## Pattern 11: Validation and Sanitization

Validate and clean user input.

```python
def validate_user_input(input):
    # Basic validation
    if not input or len(input) == 0:
        return {valid: false, error: "Input cannot be empty"}

    if len(input) > 10000:
        return {valid: false, error: "Input too long (max 10000 chars)"}

    # Content validation with LLM
    check = llm.call(
        prompt: "Check if this input is appropriate and safe: {input}",
        schema: {
            appropriate: bool,
            issues: [string]
        }
    )

    if not check.appropriate:
        return {valid: false, error: "Content flagged", issues: check.issues}

    # Sanitize
    cleaned = input
        | strip()
        | replace("\n\n\n", "\n\n")

    return {valid: true, cleaned: cleaned}

# Usage
result = validate_user_input(user_input)
if result.valid:
    process(result.cleaned)
else:
    emit(error: result.error)
```

---

## Pattern 12: MCP Service Integration

Call external services via MCP.

```python
def search_and_summarize(query):
    # Search using MCP service
    results = search_service.search(query: query, limit: 10)

    # Summarize results
    summary = llm.call(
        prompt: "Summarize these search results for the query '{query}':\n{results}",
        schema: {
            summary: string,
            key_points: [string],
            sources: [string]
        }
    )

    return summary

# Usage
result = search_and_summarize("climate change effects")
emit(
    summary: result.summary,
    key_points: result.key_points
)
```

---

## Pattern 13: Decision Tree

Implement decision logic with match.

```python
def route_request(request):
    action = match request.type:
        "query" -> handle_query(request)
        "command" -> handle_command(request)
        "feedback" -> handle_feedback(request)
        _ -> handle_unknown(request)

    return action

def handle_query(request):
    response = llm.call(
        prompt: request.content,
        schema: {answer: string}
    )
    return {type: "answer", content: response.answer}

def handle_command(request):
    result = match request.command:
        "help" -> {type: "help", content: get_help()}
        "status" -> {type: "status", content: get_status()}
        _ -> {type: "error", content: "Unknown command"}
    return result

# Usage
request = {type: "query", content: "What is SLOP?"}
result = route_request(request)
emit result
```

---

## Pattern 14: Progress Tracking

Track and report progress for long operations.

```python
def process_with_progress(items):
    total = len(items)
    completed = 0
    failed = 0

    for item in items with limit(10000), rate(50/s):
        try:
            process(item)
            completed = completed + 1
        catch:
            failed = failed + 1

        # Emit progress every 10 items
        if (completed + failed) % 10 == 0:
            emit(
                progress: (completed + failed) / total * 100,
                completed: completed,
                failed: failed,
                remaining: total - completed - failed
            )

    emit(
        status: "complete",
        total: total,
        completed: completed,
        failed: failed,
        success_rate: completed / total * 100
    )
```

---

## Pattern 15: Configuration-Driven Processing

Use configuration to control behavior.

```python
def process_with_config(data, config):
    # Apply configured transformations
    result = data

    if config.normalize:
        result = normalize(result)

    if config.filter_threshold:
        result = result | filter(x -> x.score >= config.filter_threshold)

    if config.limit:
        result = result | take(config.limit)

    if config.enrich:
        for i, item in enumerate(result) with limit(len(result)):
            result[i] = enrich(item)

    return result

# Usage
config = {
    normalize: true,
    filter_threshold: 0.5,
    limit: 100,
    enrich: true
}

result = process_with_config(data, config)
emit result
```

---

## Anti-Patterns to Avoid

### 1. Unbounded Loops
```python
# BAD: No limit
for item in infinite_stream:
    process(item)

# GOOD: Always bounded
for item in infinite_stream with limit(1000):
    process(item)
```

### 2. Ignoring Errors
```python
# BAD: Silent failure
result = risky_operation()

# GOOD: Handle errors
try:
    result = risky_operation()
catch:
    emit(error: "Operation failed")
    stop
```

### 3. Inefficient Pipelines
```python
# BAD: Multiple iterations
filtered = filter(items, x -> x > 0)
mapped = map(filtered, x -> x * 2)
taken = take(mapped, 10)

# GOOD: Single pipeline
result = items | filter(x -> x > 0) | map(x -> x * 2) | take(10)
```

### 4. Hardcoded Values
```python
# BAD: Magic numbers
for item in items with rate(10/s):
    ...

# GOOD: Configurable
rate_limit = config.rate_limit or 10
for item in items with rate(rate_limit/s):
    ...
```
