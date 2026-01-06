---
name: replay-session
description: Replay a recorded MCP session for testing
argument-hint: "<session-file> [--client|--server]"
---

# Replay MCP Session

Replay a previously recorded session to test server implementations against known traffic patterns.

## Process

### 1. Choose Replay Mode

**Client Playback** (test your server):
- mcp-debug acts as a client
- Sends recorded requests to your server
- Compares responses against recorded expectations

**Server Playback** (test your client):
- mcp-debug acts as a server
- Responds with recorded responses
- Validates client sends expected requests

### 2. Run Playback

```bash
# Client playback - test a server against recorded requests
mcp-debug --playback-client session.jsonl --target "npx -y my-server stdio"

# Server playback - test a client against recorded responses
mcp-debug --playback-server session.jsonl
```

### 3. Analyze Results

Playback reports:
- Matching responses (PASS)
- Mismatched responses (FAIL with diff)
- Missing or extra messages
- Timing differences

## Usage

```
/mcp-tester:replay-session ./recordings/auth-flow.jsonl --client
/mcp-tester:replay-session ./recordings/tool-calls.jsonl --server
```

## Use Cases

### Regression Testing
```bash
# Record a known-good session
mcp-debug --proxy --record baseline.jsonl ...

# Later, test against new server version
mcp-debug --playback-client baseline.jsonl --target "npx my-server@2.0 stdio"
```

### Contract Testing
```bash
# Record expected behavior
mcp-debug --proxy --record contract.jsonl ...

# Test different implementations
mcp-debug --playback-client contract.jsonl --target "python my_server.py"
mcp-debug --playback-client contract.jsonl --target "go run ./server"
```

### Bug Reproduction
```bash
# Share session file in bug report
# Maintainer can replay exact sequence
mcp-debug --playback-client bug-report.jsonl --target "./server-debug-build"
```

## Comparison Options

- `--strict`: Fail on any difference (default)
- `--ignore-timing`: Ignore timestamp differences
- `--ignore-ids`: Ignore JSON-RPC ID differences
- `--diff-only`: Show diffs without pass/fail judgment
