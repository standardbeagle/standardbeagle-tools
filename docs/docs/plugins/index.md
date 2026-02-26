---
title: Claude Code Plugins Overview
description: Explore the complete collection of Standard Beagle Tools plugins for Claude Code. Browser debugging, code intelligence, workflow automation, and more.
keywords: [Claude Code plugins, MCP plugins, browser debugging, code search, workflow automation]
sidebar_position: 1
---

# Plugins Overview

Standard Beagle Tools provides a curated collection of plugins that extend Claude Code with powerful capabilities.

## Plugin Categories

### 🔍 Code Intelligence

| Plugin | Description |
|--------|-------------|
| [**lci**](/docs/plugins/lci) | Lightning-fast semantic code search with sub-millisecond responses |

### 🌐 Browser & Frontend

| Plugin | Description |
|--------|-------------|
| [**agnt**](/docs/plugins/agnt) | Browser superpowers with reverse proxy, screenshots, and sketch mode |
| [**tools**](/docs/plugins/tools) | Combined agnt + lci in one package |

### ⚡ Workflow & Automation

| Plugin | Description |
|--------|-------------|
| [**workflow**](/docs/plugins/workflow) | Adversarial quality loops and task automation |
| [**dartai**](/docs/plugins/dartai) | Dart task management integration |

### 🎨 Design Tools

| Plugin | Description |
|--------|-------------|
| [**figma-query**](/docs/plugins/figma-query) | Extract designs from Figma for code generation |

### 🛠️ Infrastructure

| Plugin | Description |
|--------|-------------|
| [**slop-mcp**](/docs/plugins/slop-mcp) | Unified MCP server management with SLOP |

## Choosing the Right Plugin

### For Frontend Developers

**Recommended**: `agnt` or `tools`

- Debug web applications in real-time
- Take screenshots for UI review
- Use sketch mode for wireframing
- Run accessibility and performance audits

### For Backend Developers

**Recommended**: `lci` or `tools`

- Search codebases semantically
- Navigate symbol dependencies
- Get context for complex functions

### For Full-Stack Developers

**Recommended**: `tools`

- Combined browser debugging + code intelligence
- Single plugin for all needs
- Simplified configuration

### For Quality-Focused Teams

**Recommended**: `workflow`

- Adversarial verification loops
- Automatic quality checks
- Process improvement suggestions

## Installation Quick Reference

```bash
# Add marketplace (all plugins)
claude mcp add-dir https://github.com/standardbeagle/standardbeagle-tools

# Individual plugins
claude mcp add agnt --source ./plugins/agnt
claude mcp add lci --source ./plugins/lci
claude mcp add tools --source ./plugins/tools
claude mcp add workflow --source ./plugins/workflow
claude mcp add dartai --source ./plugins/dartai
claude mcp add figma-query --source ./plugins/figma-query
claude mcp add slop-mcp --source ./plugins/slop-mcp
```

## Plugin Architecture

Each plugin follows a consistent structure:

```
plugins/<name>/
├── .claude-plugin/
│   └── plugin.json      # Plugin manifest
├── commands/            # Slash commands (*.md)
├── skills/              # Specialized prompts (*.md)
├── agents/              # Autonomous agents (*.md)
├── hooks/
│   └── hooks.json       # Lifecycle hooks
├── scripts/             # Hook implementation scripts
└── mcp.json             # MCP server configuration
```

## Version Compatibility

| Plugin | Minimum Claude Code | Node.js |
|--------|---------------------|---------|
| agnt | 1.0.0 | 18+ |
| lci | 1.0.0 | 18+ |
| tools | 1.0.0 | 18+ |
| workflow | 1.0.0 | 18+ |
| dartai | 1.0.0 | 18+ |
| figma-query | 1.0.0 | 18+ |
| slop-mcp | 1.0.0 | 18+ |
