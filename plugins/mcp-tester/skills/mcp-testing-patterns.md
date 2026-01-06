---
name: mcp-testing-patterns
description: Best practices and patterns for testing MCP servers
---

# MCP Testing Patterns

Comprehensive guide to testing Model Context Protocol servers effectively.

## Testing Levels

### 1. Unit Testing (Tool Logic)

Test individual tool implementations in isolation:

```go
func TestEchoTool(t *testing.T) {
    result, err := echoTool(map[string]any{"message": "hello"})
    assert.NoError(t, err)
    assert.Equal(t, "hello", result)
}
```

**Best Practices**:
- Test pure business logic without MCP transport
- Mock external dependencies (databases, APIs)
- Cover edge cases and error conditions
- Test input validation

### 2. Integration Testing (MCP Protocol)

Test the full MCP server with protocol handling:

```bash
# Use mcp-tui for integration tests
mcp-tui --porcelain tool call echo message="test" | jq -e '.content[0].text == "test"'
```

**Best Practices**:
- Test tool discovery (`tools/list`)
- Test tool execution (`tools/call`)
- Test resource listing and reading
- Test prompt generation
- Verify JSON-RPC compliance

### 3. Contract Testing (Session Replay)

Validate implementations against recorded behavior:

```bash
# Record baseline
mcp-debug --proxy --record baseline.jsonl ...

# Test new version
mcp-debug --playback-client baseline.jsonl --target "./new-server"
```

**Best Practices**:
- Record "golden" sessions for critical flows
- Include edge cases in recordings
- Version recordings with server releases
- Use in CI/CD pipelines

### 4. Load Testing

Test server performance under load:

```bash
# Parallel tool calls
for i in {1..100}; do
    mcp-tui --porcelain tool call expensive_operation &
done
wait
```

**Best Practices**:
- Test concurrent tool calls
- Measure response times
- Check memory usage
- Identify bottlenecks

## Test Categories

### Tool Testing Checklist

- [ ] Tool appears in `tools/list` response
- [ ] Tool schema matches implementation
- [ ] Required parameters enforced
- [ ] Optional parameters work correctly
- [ ] Invalid parameters return proper errors
- [ ] Tool executes successfully with valid input
- [ ] Tool handles edge cases gracefully
- [ ] Tool returns proper content types

### Resource Testing Checklist

- [ ] Resource appears in `resources/list`
- [ ] Resource URI is valid and accessible
- [ ] Resource content matches expected format
- [ ] Resource handles not-found gracefully
- [ ] Resource subscriptions work (if supported)

### Error Handling Checklist

- [ ] Invalid JSON-RPC returns error response
- [ ] Unknown method returns method-not-found
- [ ] Invalid params returns invalid-params error
- [ ] Server errors return internal-error
- [ ] Error messages are helpful
- [ ] Error codes follow JSON-RPC spec

## CI/CD Integration

### GitHub Actions Example

```yaml
name: MCP Server Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install mcp-tui
        run: npm install -g @standardbeagle/mcp-tui

      - name: Build server
        run: go build -o server ./cmd/server

      - name: Test tool discovery
        run: |
          ./server &
          sleep 2
          mcp-tui --porcelain -f json tool list | jq -e 'length > 0'

      - name: Test core tools
        run: |
          mcp-tui tool call echo message="test" | grep -q "test"

      - name: Replay regression tests
        run: |
          npm install -g mcp-debug
          mcp-debug --playback-client tests/baseline.jsonl --target "./server"
```

## Debugging Strategies

### 1. Verbose Logging
Enable detailed logging to understand flow:
```bash
mcp-debug --proxy --log debug.log --config config.yaml
```

### 2. Session Recording
Capture problematic interactions:
```bash
mcp-debug --proxy --record issue.jsonl --config config.yaml
# Reproduce issue, then analyze issue.jsonl
```

### 3. Interactive Exploration
Use TUI to manually test:
```bash
mcp-tui "./server"
# Navigate tabs, test tools, inspect responses
```

### 4. Diff Analysis
Compare expected vs actual:
```bash
mcp-debug --playback-client expected.jsonl --diff-only --target "./server"
```
