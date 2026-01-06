---
name: scripting
description: Scripting and automation with SLOP's REST API
---

# SLOP Scripting and Automation

Use SLOP's REST API to script MCP interactions from any language or tool.

## SLOP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/info` | GET | Server info and capabilities |
| `/tools` | GET | List all available tools |
| `/tools` | POST | Execute a tool |
| `/resources` | GET | List all resources |
| `/resources` | POST | Read a resource |
| `/memory` | GET | Get memory entries |
| `/memory` | POST | Store memory entry |
| `/chat` | POST | Chat with context |

## cURL Examples

### List Tools

```bash
curl http://localhost:8080/tools | jq '.tools[].name'
```

### Execute Tool

```bash
curl -X POST http://localhost:8080/tools \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "filesystem.read_file",
    "arguments": {"path": "/etc/hosts"}
  }'
```

### Search Tools

```bash
curl "http://localhost:8080/tools?q=search" | jq '.tools'
```

### Store Memory

```bash
curl -X POST http://localhost:8080/memory \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user_preference",
    "value": {"theme": "dark", "language": "en"}
  }'
```

### Read Resource

```bash
curl -X POST http://localhost:8080/resources \
  -H "Content-Type: application/json" \
  -d '{
    "uri": "file:///home/user/README.md"
  }'
```

## Shell Scripts

### Execute Tool and Process Output

```bash
#!/bin/bash
# search-code.sh - Search code using lci via SLOP

PATTERN="$1"
MAX="${2:-10}"

curl -s -X POST http://localhost:8080/tools \
  -H "Content-Type: application/json" \
  -d "{
    \"tool\": \"lci.search\",
    \"arguments\": {\"pattern\": \"$PATTERN\", \"max\": $MAX}
  }" | jq -r '.result.matches[] | "\(.file):\(.line): \(.text)"'
```

### Batch Tool Execution

```bash
#!/bin/bash
# read-files.sh - Read multiple files

for file in "$@"; do
  echo "=== $file ==="
  curl -s -X POST http://localhost:8080/tools \
    -H "Content-Type: application/json" \
    -d "{\"tool\": \"filesystem.read_file\", \"arguments\": {\"path\": \"$file\"}}" \
    | jq -r '.result.content'
done
```

## Python Integration

```python
import requests
import json

class SlopClient:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url

    def list_tools(self, query=None):
        params = {"q": query} if query else {}
        resp = requests.get(f"{self.base_url}/tools", params=params)
        return resp.json()["tools"]

    def call_tool(self, tool, arguments):
        resp = requests.post(
            f"{self.base_url}/tools",
            json={"tool": tool, "arguments": arguments}
        )
        return resp.json()

    def get_memory(self, key=None):
        params = {"key": key} if key else {}
        resp = requests.get(f"{self.base_url}/memory", params=params)
        return resp.json()

    def set_memory(self, key, value):
        resp = requests.post(
            f"{self.base_url}/memory",
            json={"key": key, "value": value}
        )
        return resp.json()

# Usage
slop = SlopClient()

# List all search tools
tools = slop.list_tools("search")
print(f"Found {len(tools)} search tools")

# Execute tool
result = slop.call_tool("lci.search", {"pattern": "TODO", "max": 5})
for match in result.get("result", {}).get("matches", []):
    print(f"{match['file']}:{match['line']}")
```

## JavaScript/Node.js Integration

```javascript
const fetch = require('node-fetch');

class SlopClient {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async listTools(query) {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    const resp = await fetch(`${this.baseUrl}/tools${params}`);
    const data = await resp.json();
    return data.tools;
  }

  async callTool(tool, args) {
    const resp = await fetch(`${this.baseUrl}/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, arguments: args })
    });
    return resp.json();
  }
}

// Usage
const slop = new SlopClient();

async function main() {
  // Search for files
  const result = await slop.callTool('filesystem.search_files', {
    path: '/home/user',
    pattern: '*.md'
  });
  console.log('Found files:', result.result);
}

main();
```

## CI/CD Integration

### GitHub Actions

```yaml
name: MCP Validation

on: [push]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start SLOP
        run: |
          npm install -g @agnt-gg/slop
          slop start --config slop.yaml &
          sleep 5

      - name: Validate Tools
        run: |
          curl -s http://localhost:8080/tools | jq -e '.tools | length > 0'

      - name: Run Tool Tests
        run: |
          for tool in $(curl -s http://localhost:8080/tools | jq -r '.tools[].name'); do
            echo "Testing $tool..."
            curl -s "http://localhost:8080/tools?name=$tool" | jq -e '.tools[0].inputSchema'
          done
```

## Error Handling

```python
def safe_call(slop, tool, args):
    try:
        result = slop.call_tool(tool, args)
        if "error" in result:
            print(f"Tool error: {result['error']['message']}")
            return None
        return result.get("result")
    except requests.exceptions.ConnectionError:
        print("SLOP server not running")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None
```
