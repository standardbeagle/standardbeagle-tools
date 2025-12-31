---
name: design-mcp
description: Design a new MCP server with interactive guidance and generate comprehensive JSON skeleton specification
argument-hint: "[server-name]"
allowed-tools: [Read, Write, AskUserQuestion, Glob, Grep]
---

# MCP Server Design

Generate a comprehensive design specification for a new MCP server following best practices for multi-tool organization, progressive discovery, and token efficiency.

## Process

### Step 1: Understand Requirements

Ask the user about the MCP server:

1. **Purpose**: What problem does this MCP server solve?
2. **Domain**: What domain/area does it cover? (code, browser, process management, data, etc.)
3. **Tool count estimate**: Roughly how many tools? (5-10, 10-20, 20+)
4. **Key workflows**: What are 2-3 main workflows users will perform?
5. **Existing functions**: Are there existing functions/APIs that tools will wrap?

Use AskUserQuestion to gather this information interactively.

### Step 2: Design Tool Architecture

Based on requirements, recommend:

1. **Architectural pattern**: Hub-and-Spoke, CRUD, Discovery-Detail, Aggregation, or combination
2. **Tool grouping**: Logical categories (query, lookup, management, analysis)
3. **Token/ID systems**: What IDs will enable cross-tool references
4. **Progressive discovery**: How users will discover capabilities (info tool structure)

Present the recommended architecture to the user for approval.

### Step 3: Generate Comprehensive JSON Skeleton

Create a detailed JSON specification that includes:

**Required sections:**
```json
{
  "mcp_design": {
    "metadata": {
      "name": "server-name",
      "version": "0.1.0",
      "description": "...",
      "pattern": "Hub-and-Spoke",
      "tool_count": 12,
      "progressive_discovery": true
    },

    "architecture": {
      "tool_relationships": "How tools interact, data flow",
      "token_systems": {
        "result_id": {
          "generated_by": ["search"],
          "consumed_by": ["get_definition", "find_references"],
          "purpose": "Reference search results across tools"
        }
      },
      "dependencies": "Module structure, required libraries"
    },

    "enforced_questions": [
      "How should errors be handled?",
      "What authentication is needed?",
      "Should results be cached?",
      "What are rate limits?"
    ],

    "tools": [
      {
        "name": "search",
        "group": "query",
        "description": "Search for X",
        "parameters": {
          "input_schema": {
            "pattern": {
              "type": "string",
              "required": true,
              "description": "Search pattern"
            }
          },
          "output_schema": {
            "results": "Array<{id, name, preview, confidence}>",
            "has_more": "boolean",
            "total": "integer"
          }
        },
        "id_tokens": {
          "generates": ["result_id"],
          "consumes": []
        },
        "relationships": "Hub tool - feeds result_ids to detail tools",
        "use_cases": [
          "Find code patterns",
          "Discover relevant symbols"
        ],
        "user_stories": [
          "As a developer, I want to search code to find implementations"
        ],
        "implementation_guide": {
          "required_functions": [
            "existing_search_fn(pattern) - wraps existing search",
            "format_results(raw) - convert to standard format"
          ],
          "usage_patterns": "Call existing_search_fn, map results to schema with IDs",
          "pseudocode": "results = existing_search_fn(pattern); return results.map((r, i) => ({id: generateId(i), ...r}))"
        },
        "token_budget": 100,
        "performance": "fast"
      }
    ],

    "progressive_discovery": {
      "info_tool_structure": {
        "overview": "Tool categories and counts",
        "category_detail": "Tools in specific category",
        "tool_help": "Full documentation for tool"
      },
      "detail_levels": {
        "overview": "~50 tokens",
        "category": "~100 tokens",
        "tool": "~400 tokens"
      }
    },

    "workflows": [
      {
        "name": "Main Workflow 1",
        "steps": [
          "search(pattern) → result_ids",
          "get_definition(result_id) → full details"
        ],
        "token_cost": "~300 tokens total"
      }
    ],

    "implementation_notes": {
      "critical_patterns": [
        "Always accept extra parameters with warnings",
        "Use sparse tables in info tool",
        "Progressive detail by confidence/relevance",
        "ID references to save tokens"
      ],
      "handoff_checklist": [
        "Review tool schemas",
        "Implement required_functions",
        "Add error handling",
        "Test with example workflows",
        "Validate against MCP spec"
      ]
    }
  }
}
```

### Step 4: Write Skeleton to File

Save the JSON skeleton to a file:
- Ask user for output path (default: `./mcp-design-{name}.json`)
- Write comprehensive JSON using Write tool
- Confirm file written and provide next steps

### Step 5: Provide Guidance

After generating the skeleton, tell the user:

**Next steps:**
1. **Review the design** - Check tool organization and workflows
2. **Answer enforced questions** - Address design decisions
3. **Implement required_functions** - Build the actual functionality
4. **Test workflows** - Verify end-to-end flows work
5. **Validate with mcp-fuzzer** - Test edge cases and error handling

**Resources:**
- Use `/analyze-mcp` command to validate design
- Invoke mcp-architect agent for detailed assistance
- Reference mcp-examples skill for real-world patterns

## Output Format

**Sparse table summary:**
```
MCP Server Design: code-search
================================

Pattern: Hub-and-Spoke
Tools: 8 total

Tool Groups
-----------
Group     | Count | Pattern
--------- | ----- | --------
query     | 2     | Fast discovery
lookup    | 3     | Detail retrieval
analysis  | 2     | Deep analysis
discovery | 1     | Info tool

Token Systems
-------------
ID Type    | Generated By | Consumed By
---------- | ------------ | -----------
result_id  | search       | get_definition, find_references
symbol_id  | get_definition | analyze_dependencies

Workflows
---------
1. Find Implementation: search → get_definition
2. Understand Usage: search → find_references → get_context

Output: ./mcp-design-code-search.json
```

## Important Patterns to Include

### 1. Accept Extra Parameters
Always include in implementation_guide:
```
"Accept unknown parameters with warnings, don't reject unless severe issue"
```

### 2. Progressive Detail
For search/query tools, always include:
```
"High confidence (>0.8): full details
Medium confidence (0.5-0.8): summary
Low confidence (<0.5): ID only"
```

### 3. Automation Flags
Standard flags in all responses:
```json
{
  "has_more": boolean,
  "total": integer,
  "returned": integer,
  "complete": boolean
}
```

### 4. Sparse Tables
For info tool, recommend:
```
"Use sparse tables for human readability, provide JSON array option for automation"
```

## Examples

When user asks: "Design an MCP for managing Kubernetes pods"

Generate skeleton with:
- **Pattern:** CRUD (lifecycle management)
- **Tools:** list_pods, get_pod, create_pod, update_pod, delete_pod, get_logs, exec_command, info
- **Token systems:** pod_id, container_id
- **Workflows:** Deploy pod, Debug pod, Scale deployment
- **Required functions:** k8s client library methods
- **Implementation notes:** Authentication, namespace handling, error codes

When user asks: "Design an MCP for document search"

Generate skeleton with:
- **Pattern:** Hub-and-Spoke + Discovery-Detail
- **Tools:** search, get_document, find_related, summarize, info
- **Token systems:** doc_id, query_id
- **Workflows:** Find document, Explore related, Generate summary
- **Required functions:** search_engine.query(), doc_store.get()
- **Implementation notes:** Ranking algorithm, cache strategy

## Error Handling

If user requirements are unclear:
- Use AskUserQuestion to clarify
- Provide example options
- Don't guess critical design decisions

If output path already exists:
- Ask user if they want to overwrite
- Offer to save with different name

## Tips

- Focus skeleton on **architecture and relationships**, not implementation details
- Include **specific existing functions** user mentioned
- Provide **realistic token budgets** based on similar MCPs
- Make **workflows concrete** with actual tool calls
- Ensure **handoff-ready** for junior developer

The goal is a comprehensive design document that a developer can implement without needing to make major architectural decisions.
