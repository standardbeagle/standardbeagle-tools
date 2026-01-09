---
name: validate-mcp-server
description: Use this skill when validating an MCP server implementation for correctness
---

# Validating MCP Server Implementations

You are helping validate an MCP server implementation using mcp-debug tools.

## Validation Checklist

### 1. Connection Validation

First, verify the server connects properly:

```
Use server_add tool:
- name: "test-server"
- command: "<server command>"

Then use server_list to verify connection
```

Check for:
- Server appears in list
- Status shows "connected"
- Tools are discovered

### 2. Tool Discovery Validation

After connection, verify tools are properly exposed:

```
Use server_list to see all tools
```

Check each tool has:
- Clear, descriptive name
- Proper prefix applied
- No duplicate names

### 3. Schema Validation

Validate all tool schemas are valid JSON Schema:

```
Use schema_validate tool:
- server: "test-server"
(omit tool parameter to validate all)
```

Look for:
- All schemas pass validation
- No missing required fields
- Proper type definitions

### 4. Individual Tool Schema Validation

For critical tools, validate specific schemas:

```
Use schema_validate tool:
- server: "test-server"
- tool: "process_data"
```

### 5. Input Validation Testing

Test that schemas correctly validate input:

```
Use schema_validate tool:
- server: "test-server"
- tool: "process_data"
- input: '{"data": [1, 2, 3]}'
```

Test both:
- Valid input (should pass)
- Invalid input (should fail with clear error)

## Common Schema Issues

### Missing Required Properties
```json
// Bad - no required array
{"type": "object", "properties": {...}}

// Good
{"type": "object", "properties": {...}, "required": ["data"]}
```

### Incorrect Type Definitions
```json
// Bad - accepts anything
{"type": "object"}

// Good - specific properties
{"type": "object", "properties": {"name": {"type": "string"}}}
```

### Missing Descriptions
```json
// Bad - no context for AI
{"type": "string"}

// Good - helps AI understand usage
{"type": "string", "description": "User's full name"}
```

## Functional Validation

After schema validation, test actual tool calls:

1. **Basic functionality** - Does the tool work?
2. **Error handling** - Does it return proper errors?
3. **Edge cases** - Empty input, large input, special characters

Use `debug_logs` after each test to inspect the actual JSON-RPC traffic.

## Validation Report Template

After validation, summarize:

```
Server: <name>
Status: <connected/error>
Tools discovered: <count>

Schema Validation:
- Passed: <count>
- Failed: <count with details>

Functional Tests:
- <tool>: <pass/fail with notes>
```
