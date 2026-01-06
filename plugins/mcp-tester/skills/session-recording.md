---
name: session-recording
description: Techniques for recording and analyzing MCP sessions
---

# Session Recording

Master the art of recording, analyzing, and utilizing MCP session recordings.

## Recording Basics

### Start Recording

```bash
# Basic recording
mcp-debug --proxy --config servers.yaml --record session.jsonl

# With verbose logging
mcp-debug --proxy --config servers.yaml --record session.jsonl --log debug.log
```

### Session File Format

JSONL (JSON Lines) format - one JSON object per line:

```jsonl
{"ts":"2024-01-15T10:30:00.000Z","dir":"req","id":1,"method":"initialize","params":{...}}
{"ts":"2024-01-15T10:30:00.050Z","dir":"res","id":1,"result":{"capabilities":{...}}}
{"ts":"2024-01-15T10:30:01.000Z","dir":"req","id":2,"method":"tools/list"}
{"ts":"2024-01-15T10:30:01.020Z","dir":"res","id":2,"result":{"tools":[...]}}
{"ts":"2024-01-15T10:30:05.000Z","dir":"req","id":3,"method":"tools/call","params":{"name":"echo","arguments":{"message":"hello"}}}
{"ts":"2024-01-15T10:30:05.100Z","dir":"res","id":3,"result":{"content":[{"type":"text","text":"hello"}]}}
```

### Field Reference

| Field | Description |
|-------|-------------|
| `ts` | ISO 8601 timestamp |
| `dir` | Direction: `req` (request) or `res` (response) |
| `id` | JSON-RPC message ID |
| `method` | RPC method name (requests only) |
| `params` | Request parameters |
| `result` | Success response data |
| `error` | Error response data |

## Analysis Techniques

### Extract Tool Calls

```bash
# List all tool calls
jq -r 'select(.method == "tools/call") | .params.name' session.jsonl | sort | uniq -c

# Get specific tool call details
jq 'select(.method == "tools/call" and .params.name == "search")' session.jsonl
```

### Timing Analysis

```bash
# Calculate response times (requires both request and response)
# Use a script to match request/response pairs by ID
```

### Error Analysis

```bash
# Find all errors
jq 'select(.error != null)' session.jsonl

# Count errors by code
jq -r 'select(.error != null) | .error.code' session.jsonl | sort | uniq -c
```

### Traffic Statistics

```bash
# Count messages by type
jq -r '.method // "response"' session.jsonl | sort | uniq -c

# Calculate session duration
head -1 session.jsonl | jq -r '.ts'
tail -1 session.jsonl | jq -r '.ts'
```

## Use Cases

### 1. Bug Reports

Include session recording in bug reports:

```markdown
## Bug Report

**Steps to Reproduce**: See attached session.jsonl

**Expected**: Tool should return success
**Actual**: Tool returns error at message ID 47

**Session File**: [session.jsonl](./session.jsonl)
```

### 2. Regression Testing

Create baseline recordings:

```bash
# Record baseline for release v1.0
mcp-debug --proxy --record baseline-v1.0.jsonl ...

# Test v1.1 against baseline
mcp-debug --playback-client baseline-v1.0.jsonl --target "./server-v1.1"
```

### 3. Documentation

Generate examples from recordings:

```bash
# Extract example tool call and response
jq 'select(.id == 5)' session.jsonl > example-search.json
```

### 4. Performance Profiling

Identify slow operations:

```bash
# Find tool calls taking > 1 second
# (requires custom script to match request/response pairs)
```

## Best Practices

### Recording

1. **Clean state**: Start from fresh server state
2. **Minimal scope**: Record only relevant interactions
3. **Reproducible**: Use deterministic inputs when possible
4. **Documented**: Note what scenario the recording captures

### Storage

1. **Version control**: Store recordings with code
2. **Naming convention**: `<feature>-<scenario>-<date>.jsonl`
3. **Compression**: Gzip large recordings
4. **Retention**: Keep recordings for released versions

### Privacy

1. **Sanitize**: Remove sensitive data before sharing
2. **Review**: Check recordings before committing
3. **Anonymize**: Replace real data with test data

## Tools for Analysis

### jq Recipes

```bash
# Pretty print specific message
jq -r 'select(.id == 5)' session.jsonl | jq .

# Extract all tool names used
jq -r 'select(.method == "tools/call") | .params.name' session.jsonl | sort -u

# Find messages with specific content
jq 'select(.result.content[]?.text | contains("error"))' session.jsonl
```

### Custom Scripts

For complex analysis, write custom parsers:

```python
import json

def analyze_session(filename):
    requests = {}
    for line in open(filename):
        msg = json.loads(line)
        if msg.get('dir') == 'req':
            requests[msg['id']] = msg
        elif msg.get('dir') == 'res' and msg['id'] in requests:
            req = requests[msg['id']]
            # Calculate response time, analyze pairs, etc.
```
