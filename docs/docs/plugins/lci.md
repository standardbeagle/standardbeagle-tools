---
title: lci - Lightning Code Intelligence Plugin for Claude Code
description: Sub-millisecond semantic code search with 79.8% context reduction. Navigate codebases, find symbols, and understand dependencies instantly.
keywords: [Claude Code code search, semantic search, code intelligence, symbol navigation, code exploration, Lightning Code Index]
sidebar_position: 3
---

# lci - Lightning Code Intelligence

**lci** (Lightning Code Index) provides sub-millisecond semantic code search with intelligent context reduction, helping you navigate and understand codebases instantly.

## Why lci?

:::tip 79.8% Context Reduction
lci reduces context needed by nearly 80% through intelligent semantic indexing. Find what you need without reading entire files.
:::

### Key Features

- **⚡ Sub-Millisecond Search**: Find symbols in <1ms regardless of codebase size
- **🎯 Semantic Understanding**: Search by meaning, not just text matching
- **📊 Context Reduction**: Get relevant context without noise
- **🔗 Dependency Tracking**: Understand symbol relationships and call hierarchies
- **🚫 Force-LCI Mode**: Block Grep/Glob to enforce semantic search

## Installation

```bash
# Install from marketplace
claude mcp add-dir https://github.com/standardbeagle/standardbeagle-tools
claude mcp add lci --source ./plugins/lci

# Or install directly
claude mcp add lci --source ./plugins/lci
```

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/search` | Semantic code search | `/search authentication logic` |
| `/explore` | Explore codebase structure | `/explore src/components` |
| `/context` | Get symbol context | `/context UserService.login` |

## Usage Examples

### Search for Code

```bash
# Semantic search
/search user authentication flow

# Find specific patterns
/search error handling in API calls

# Locate implementations
/search payment processing logic
```

### Explore Codebase

```bash
# Explore directory structure
/explore src/

# Understand module organization
/explore components --depth 2
```

### Get Symbol Context

```bash
# Get context for a function
/context UserService.authenticate

# Understand class relationships
/context OrderProcessor dependencies
```

## Force-LCI Mode

Enforce semantic search by blocking traditional search tools:

```bash
# Enable force mode
touch ~/.config/claude-code/lci-force-mode

# Disable force mode
rm ~/.config/claude-code/lci-force-mode
```

When enabled, Grep and Glob tools are blocked, encouraging semantic search patterns.

## MCP Server

lci includes an MCP server providing tools for:

- `search` - Semantic code search
- `get_context` - Get detailed context for symbols
- `explore` - Explore codebase structure

### NPM Package

```bash
npm install @standardbeagle/lci
```

### MCP Configuration

```json
{
  "mcpServers": {
    "lci": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/lci@latest", "mcp"]
    }
  }
}
```

## How It Works

### Semantic Indexing

lci builds a semantic index of your codebase:

1. **Parses** source code into abstract syntax trees
2. **Extracts** symbols, relationships, and documentation
3. **Indexes** for fast semantic search
4. **Tracks** dependencies and call hierarchies

### Context Reduction

Instead of returning entire files, lci provides:

- **Symbol signatures**: Function/method signatures
- **Relevant context**: Only the code that matters
- **Relationship info**: How symbols connect
- **Documentation**: Comments and docstrings

### Performance

| Codebase Size | Search Time | Context Reduction |
|---------------|-------------|-------------------|
| 10K lines | <0.5ms | 75% |
| 100K lines | <1ms | 79% |
| 1M lines | <2ms | 82% |

## Hooks

lci includes a PreToolUse hook for force-LCI mode:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Grep|Glob",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/block-search-tools.js\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

## Comparison with Traditional Tools

| Feature | Grep/Glob | lci |
|---------|-----------|-----|
| Search Type | Text matching | Semantic understanding |
| Speed | Fast | Sub-millisecond |
| Context | Full files | Reduced (80% less) |
| Relationships | No | Yes |
| Meaning | No | Yes |

## Best Practices

### 1. Use Semantic Queries

Instead of:
```bash
grep -r "function login"
```

Use:
```bash
/search user login authentication
```

### 2. Leverage Context

Instead of reading entire files:
```bash
/context AuthService.login
```

### 3. Explore Before Searching

Get oriented first:
```bash
/explore src/auth/
/search login implementation
```

## Troubleshooting

### Index Not Building

```bash
# Rebuild index
rm -rf .lci-index
lci index rebuild
```

### Slow Searches

1. Check index is built: `ls .lci-index`
2. Verify codebase size isn't too large
3. Consider excluding vendor directories

### Force Mode Not Working

```bash
# Verify force mode file exists
ls ~/.config/claude-code/lci-force-mode

# Check hook is running
claude mcp list
```

## Related Resources

- [tools Plugin](./tools) - Combined agnt + lci
- [MCP Server Documentation](/docs/mcp/lci-server)
- [GitHub Repository](https://github.com/standardbeagle/lci)
- [NPM Package](https://www.npmjs.com/package/@standardbeagle/lci)

## Version History

| Version | Changes |
|---------|---------|
| 0.3.0 | Cross-platform Node.js hooks |
| 0.2.0 | Force-LCI mode |
| 0.1.0 | Initial release |
