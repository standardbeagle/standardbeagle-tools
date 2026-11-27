---
title: figma-query - Figma Design Extraction Plugin for Claude Code
description: Extract complete design libraries from Figma with adversarial quality verification. Generate implementation-ready code from Figma designs.
keywords: [Claude Code Figma, design extraction, Figma to code, design system, component library, UI generation]
sidebar_position: 7
---

# figma-query - Figma Design Extraction

**figma-query** extracts complete design libraries from Figma with adversarial quality verification, enabling design-to-code workflows.

## Why figma-query?

:::tip Design to Code Pipeline
Extract Figma designs and generate implementation-ready HTML/CSS with automatic verification of asset accuracy and documentation completeness.
:::

### Key Features

- **🎨 Design Extraction**: Extract complete design libraries from Figma
- **📝 Documentation**: Generate comprehensive component documentation
- **✅ Asset Verification**: Adversarial verification of extracted assets
- **🌐 HTML Generation**: Create implementation-ready HTML mockups

## Installation

```bash
# Install from marketplace
claude mcp add-dir https://github.com/standardbeagle/standardbeagle-tools
claude mcp add figma-query --source ./plugins/figma-query
```

## Prerequisites

- **Figma Access Token**: Required for API access
- **Figma File Key**: The file to extract from

### Setup

```bash
# Set up figma-query MCP
/setup-figma
```

## Available Skills

| Skill | Description |
|-------|-------------|
| `setup-figma` | Configure figma-query MCP with SLOP and access token |

## Agents

### library-extractor
Main agent for extracting complete design libraries from Figma with adversarial quality verification.

**Workflow**:
1. Connect to Figma API
2. Extract component definitions
3. Extract design tokens
4. Verify completeness
5. Generate structured output

### component-documenter
Generate comprehensive documentation for extracted Figma components.

**Output includes**:
- README with usage examples
- API reference
- Props/variants documentation
- Accessibility notes

### asset-verifier
Adversarial verification agent that validates:
- Extracted asset accuracy
- CSS correctness
- Documentation completeness
- Cross-references

### html-generator
Generate implementation-ready HTML mockups from extracted Figma components and pages.

**Features**:
- Responsive layouts
- CSS extraction
- Component composition
- Page-level templates

## Hooks

figma-query includes tracking hooks:

| Hook | Script | Purpose |
|------|--------|---------|
| SubagentStop (library-extractor) | `track-extraction.js` | Track extraction completion |
| SubagentStop (component-documenter) | `track-documentation.js` | Track doc generation |
| SubagentStop (asset-verifier) | `track-verification.js` | Track verification |
| SubagentStop (html-generator) | `track-html-gen.js` | Track HTML generation |
| PostToolUse (Task) | `track-subagent-spawn.js` | Track subagent spawns |

## Usage Examples

### Extract Design Library

```bash
# In Claude Code session, use the library-extractor agent
# Provide Figma file key and output directory
```

### Generate Documentation

```bash
# After extraction, use component-documenter
# Generates README, usage examples, API reference
```

### Verify Assets

```bash
# Run asset-verifier for quality check
# Validates CSS accuracy, completeness, documentation
```

### Generate HTML

```bash
# Use html-generator for implementation-ready mockups
# Creates responsive HTML with extracted styles
```

## Output Structure

```
extracted-design/
├── components/
│   ├── Button/
│   │   ├── component.json
│   │   ├── styles.css
│   │   └── README.md
│   ├── Card/
│   └── Modal/
├── tokens/
│   ├── colors.json
│   ├── typography.json
│   └── spacing.json
├── pages/
│   ├── Homepage.html
│   └── Dashboard.html
└── README.md
```

## Configuration

### Environment Variables

```bash
# Figma access token
export FIGMA_ACCESS_TOKEN="your-token"

# Default output directory
export FIGMA_OUTPUT_DIR="./design-system"
```

### MCP Configuration

```json
{
  "mcpServers": {
    "figma-query": {
      "command": "npx",
      "args": ["-y", "figma-query-mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
      }
    }
  }
}
```

## State Tracking

Extraction state is tracked in `.claude/figma-extraction-state.json`:

```json
{
  "extraction_iterations": 2,
  "documentation_iterations": 1,
  "verification_iterations": 1,
  "html_gen_iterations": 1,
  "status": "complete",
  "subagent_spawns": 4
}
```

## Quality Verification

The adversarial verification process checks:

1. **Component Completeness**
   - All variants extracted
   - Props documented
   - States covered

2. **CSS Accuracy**
   - Colors match design tokens
   - Typography correct
   - Spacing consistent

3. **Documentation Quality**
   - Usage examples provided
   - Edge cases documented
   - Accessibility noted

4. **HTML Accuracy**
   - Responsive behavior
   - Component composition
   - Cross-browser compatibility

## Troubleshooting

### Figma API Errors

```bash
# Verify token is valid
curl -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" https://api.figma.com/v1/me

# Check file access
curl -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" https://api.figma.com/v1/files/FILE_KEY
```

### Incomplete Extraction

1. Check file permissions in Figma
2. Verify all pages are accessible
3. Ensure components are properly named

### CSS Discrepancies

1. Review design token mapping
2. Check for auto-layout vs. absolute positioning
3. Verify responsive breakpoint settings

## Related Resources

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Design Tokens Specification](https://design-tokens.github.io/community-group/format/)
- [GitHub Repository](https://github.com/standardbeagle/figma-query)

## Version History

| Version | Changes |
|---------|---------|
| 0.1.0 | Initial release with extraction, documentation, verification, and HTML generation |
