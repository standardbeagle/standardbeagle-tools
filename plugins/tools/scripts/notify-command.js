#!/usr/bin/env node
/**
 * Notify browser when Claude runs a bash command
 */

const { execSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => { main(input); });

function main(input) {
  let data = {};
  try {
    data = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }

  const command = data.tool_input?.command || '';
  if (!command) {
    process.exit(0);
  }

  const displayCmd = command.length > 50 ? command.substring(0, 47) + '...' : command;

  try {
    execSync(`agnt notify --type "command" --title "Command Executed" --message "${displayCmd}"`, { stdio: 'ignore' });
  } catch {}

  process.exit(0);
}
