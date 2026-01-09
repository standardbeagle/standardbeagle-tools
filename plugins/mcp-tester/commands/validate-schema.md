---
name: validate-schema
description: Validate MCP tool JSON schemas and optionally test input against schemas
arguments:
  - name: server
    description: Server name to validate
    required: true
  - name: tool
    description: Specific tool to validate (optional - validates all if omitted)
    required: false
  - name: input
    description: JSON input to validate against tool schema (optional)
    required: false
---

# Validate MCP Tool Schemas

You are validating JSON schemas for MCP server tools.

## Instructions

1. Use the `mcp-debug` MCP server's `schema_validate` tool with:
   - `server`: {{server}}
   - `tool`: {{tool}} (if provided)
   - `input`: {{input}} (if provided - must be valid JSON string)

2. Report validation results:
   - For schema validation: whether the tool's input schema is valid JSON Schema
   - For input validation: whether the provided input conforms to the tool's schema
   - Any validation errors with specific location and issue details

3. If validating all tools (no specific tool provided), summarize:
   - Total tools checked
   - Valid vs invalid schemas
   - List any tools with schema issues

## Usage Examples

```
/validate-schema myserver                                    # Validate all tool schemas
/validate-schema myserver process_data                       # Validate specific tool
/validate-schema myserver process_data '{"data": [1, 2]}'   # Validate input against schema
```

## Why Schema Validation Matters

- Invalid schemas can cause tool calls to fail unexpectedly
- Input validation ensures your data matches what the server expects
- Catch schema issues before deployment
