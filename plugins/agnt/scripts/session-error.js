#!/usr/bin/env node
/**
 * agnt Session Error hook - forwards errors to browser and logs
 * Receives error events on stdin
 */

const { execSync } = require('child_process');

// Read stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  main(input);
});

function isAgntAvailable() {
  try {
    execSync('which agnt', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function main(input) {
  if (!isAgntAvailable()) {
    process.exit(0);
  }

  // Parse input
  let data = {};
  try {
    data = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }

  const errorType = data.error_type || 'error';
  const errorMsg = data.error || data.message || '';
  const toolName = data.tool_name || '';

  // Skip if no error message
  if (!errorMsg) {
    process.exit(0);
  }

  // Build error data
  const errorData = JSON.stringify({
    type: errorType,
    message: errorMsg,
    tool: toolName
  });

  // Broadcast error to browser
  const escapedData = errorData.replace(/"/g, '\\"');
  try {
    execSync(`agnt notify --type "session-error" --title "Agent Error" --message "${errorMsg}" --data "${escapedData}"`, { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }

  process.exit(0);
}
