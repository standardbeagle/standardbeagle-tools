#!/usr/bin/env node
/**
 * Notify browser when Claude writes/edits a file
 * Receives PostToolUse JSON on stdin
 */

const { execSync } = require('child_process');
const path = require('path');

// Read stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  main(input);
});

function main(input) {
  // Parse input
  let data = {};
  try {
    data = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }

  const filePath = data.tool_input?.file_path || '';
  const toolName = data.tool_name || 'Edit';

  if (!filePath) {
    process.exit(0);
  }

  // Get just the filename for display
  const filename = path.basename(filePath);

  // Build data JSON
  const notifyData = JSON.stringify({
    path: filePath,
    tool: toolName
  });

  // Notify via agnt (broadcasts to all active proxies)
  const escapedData = notifyData.replace(/"/g, '\\"');
  try {
    execSync(`agnt notify --type "file-change" --title "File ${toolName}ed" --message "${filename}" --data "${escapedData}"`, { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }

  process.exit(0);
}
