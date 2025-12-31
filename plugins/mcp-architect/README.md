# MCP Architect

Design high-quality Model Context Protocol (MCP) servers with progressive discovery, context compression, and token-efficient responses.

## Overview

MCP Architect helps you design complex, multi-tool MCP servers following battle-tested patterns for:
- **Progressive Discovery** - Info/help tools that guide users through capabilities
- **Context Compression** - Token-efficient responses that maximize value per token
- **Response Optimization** - Human/LLM readable formats with JSON flags for automation
- **Cross-Tool Integration** - ID/token systems for referencing data between tools
- **Adaptive Detail** - Varying detail levels based on relevance (strong matches get more detail)

## Features

### Skills (6)
Knowledge base for MCP server design patterns:
- **mcp-architecture** - Organizing multi-tool MCP servers
- **progressive-discovery** - The info tool pattern for capability enumeration
- **response-optimization** - Human/LLM readable responses with automation flags
- **context-compression** - Token efficiency techniques
- **tool-design** - Individual MCP tool best practices
- **mcp-examples** - Real-world patterns from code search, browser proxy, process management

### Commands (2)
- **`/design-mcp`** - Interactive MCP design with comprehensive JSON skeleton generation
- **`/analyze-mcp`** - Analyze existing MCP implementations for optimization opportunities

### Agents (3)
- **mcp-architect** - Autonomous MCP design assistance (access to all tools)
- **tool-designer** - Individual tool design with response optimization (access to all tools)
- **mcp-fuzzer** - MCP testing and fuzzing agent (access to all tools, markdown output)

## Design Philosophy

### Accept Extra Parameters with Warnings
**Critical Pattern:** Always accept extra/hallucinated parameters with warnings in the output, unless they cause severe security or functional issues. This makes MCP servers more robust and user-friendly.

### Sparse Tables Over Object Lists
Use concise table formats instead of verbose object listings for human readability while maintaining standard JSON arrays for machine parsing.

### Pseudocode Over Implementation
Focus on architectural specs and design patterns, not language-specific implementations. Outputs should be handoff-ready for junior developers.

### Example-Heavy
This plugin emphasizes:
- Good description examples
- Output format examples
- Progressive detail examples
- **Not** heavy on actual code (pseudocode for validation only)

## Use Cases

- Designing complex MCP servers with 10+ tools
- Implementing progressive discovery/help systems
- Optimizing token usage in MCP responses
- Creating cross-tool data reference systems (IDs/tokens)
- Generating comprehensive design specs for developer handoff
- Testing and fuzzing MCP implementations

## Installation

```bash
# From marketplace
claude mcp add mcp-architect --plugin mcp-architect@standardbeagle-tools

# Local testing
claude mcp add mcp-architect --source ./plugins/mcp-architect
```

## Quick Start

### Design a New MCP Server
```bash
/design-mcp
```
Generates a comprehensive JSON skeleton with:
- Tool relationships and data flow
- Parameter schemas (input/output)
- ID/token systems for cross-tool references
- Use cases and user stories
- Implementation guide with required functions
- Progressive discovery structure

### Analyze Existing MCP
```bash
/analyze-mcp /path/to/mcp-server
```
Reviews organization, identifies optimization opportunities, suggests improvements.

### Invoke Design Agent
The `mcp-architect` agent triggers automatically when you discuss MCP server design, or invoke explicitly for autonomous multi-step design assistance.

## Example Output Formats

### Sparse Table (Human Readable)
```
Tool          | Type     | Generates IDs | Consumes IDs | Token Cost
------------- | -------- | ------------- | ------------ | ----------
search        | query    | result_id     | -            | ~50
get_details   | lookup   | -             | result_id    | ~200
```

### JSON Array (Machine Parseable)
```json
{
  "tools": [
    {
      "name": "search",
      "type": "query",
      "generates": ["result_id"],
      "consumes": [],
      "avg_tokens": 50
    }
  ]
}
```

### Progressive Detail Example
```json
{
  "results": [
    {
      "id": "a1b2",
      "confidence": 0.95,
      "name": "User.authenticate",
      "full_details": { /* comprehensive data */ }
    },
    {
      "id": "c3d4",
      "confidence": 0.70,
      "name": "User.validate",
      "summary": "Basic validation method"
    },
    {
      "id": "e5f6",
      "confidence": 0.40,
      "name": "User.check"
      // Minimal data - use id with get_details for more
    }
  ],
  "has_more": true,
  "total": 127
}
```

## License

MIT

## Author

[Standard Beagle](https://github.com/standardbeagle)
