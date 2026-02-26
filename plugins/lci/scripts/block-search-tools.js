#!/usr/bin/env node
/**
 * Force-LCI mode hook: blocks Grep and Glob when force mode is enabled
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// State file location
const forceModeFile = path.join(os.homedir(), '.config', 'claude-code', 'lci-force-mode');

// Check if force mode is enabled
if (!fs.existsSync(forceModeFile)) {
  // Force mode disabled, allow all tools
  process.exit(0);
}

// Get the tool name from environment variable set by Claude Code
const toolName = process.env.TOOL_NAME || '';

// Block Grep and Glob tools
if (toolName === 'Grep' || toolName === 'Glob') {
  const message = `❌ Force-LCI mode is enabled. The ${toolName} tool is blocked.

Please use Lightning Code Index (LCI) tools instead:
  • Use the LCI MCP search tool for code searches
  • Use /search command for semantic code search
  • Use /explore command to explore the codebase

To disable force-LCI mode, run:
  rm -f ~/.config/claude-code/lci-force-mode

Or ask Claude to disable force-LCI mode using the force-lci skill.
`;
  console.error(message);
  process.exit(1);
}

// Allow all other tools
process.exit(0);
