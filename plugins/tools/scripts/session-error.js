#!/usr/bin/env node
/**
 * agnt Session Error hook
 */

const { execSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => { main(input); });

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

  let data = {};
  try {
    data = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }

  const errorType = data.error_type || 'error';
  const errorMsg = data.error || data.message || '';
  const toolName = data.tool_name || '';

  if (!errorMsg) {
    process.exit(0);
  }

  const errorData = JSON.stringify({ type: errorType, message: errorMsg, tool: toolName });
  const escapedData = errorData.replace(/"/g, '\\"');

  try {
    execSync(`agnt notify --type "session-error" --title "Agent Error" --message "${errorMsg}" --data "${escapedData}"`, { stdio: 'ignore' });
  } catch {}

  process.exit(0);
}
