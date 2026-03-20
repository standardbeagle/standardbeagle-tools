#!/usr/bin/env node
/**
 * Track Dartboard - Save last used dartboard after Dart operations.
 * Reads hook input from stdin and extracts the dartboard parameter.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(process.cwd(), '.dartai');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.local.md');

function parseConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return { frontmatter: {}, content: '' };

  const text = fs.readFileSync(CONFIG_FILE, 'utf-8');
  if (text.startsWith('---')) {
    const parts = text.split('---', 3);
    if (parts.length >= 3) {
      const frontmatter = {};
      for (const line of parts[1].trim().split('\n')) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) frontmatter[match[1]] = match[2].trim();
      }
      return { frontmatter, content: parts[2].trim() };
    }
  }
  return { frontmatter: {}, content: text };
}

function writeConfig(frontmatter, content) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const yamlLines = Object.entries(frontmatter).map(([k, v]) => `${k}: ${v}`).join('\n');
  fs.writeFileSync(CONFIG_FILE, `---\n${yamlLines}\n---\n\n${content}`);
}

function saveDartboard(dartboard) {
  if (!dartboard) return;
  const config = parseConfig();
  config.frontmatter.last_dartboard = dartboard;
  config.frontmatter.last_dartboard_used_at = new Date().toISOString();
  writeConfig(config.frontmatter, config.content);
  return { saved: true, dartboard };
}

function main() {
  try {
    const input = fs.readFileSync(0, 'utf-8');
    if (!input) {
      console.log(JSON.stringify({ skipped: true, reason: 'no input' }));
      return;
    }

    const hookData = JSON.parse(input);
    const toolInput = hookData.tool_input || {};

    // For slop-mcp execute_tool, dig into parameters
    const dartboard = toolInput.parameters
      ? toolInput.parameters.dartboard
      : toolInput.dartboard;

    if (dartboard) {
      console.log(JSON.stringify(saveDartboard(dartboard)));
    } else {
      console.log(JSON.stringify({ skipped: true, reason: 'no dartboard in input' }));
    }
  } catch (e) {
    console.log(JSON.stringify({ error: e.message }));
  }
}

main();
