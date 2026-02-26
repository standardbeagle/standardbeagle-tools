#!/usr/bin/env node
/**
 * agnt Session Task Complete hook
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

  const taskDesc = data.description || '';
  const taskStatus = data.status || 'completed';
  const taskOutput = data.output || '';

  if (!taskDesc) {
    process.exit(0);
  }

  const taskData = JSON.stringify({ description: taskDesc, status: taskStatus, output: taskOutput });
  const escapedData = taskData.replace(/"/g, '\\"');

  try {
    execSync(`agnt notify --type "task-complete" --title "Task ${taskStatus}" --message "${taskDesc}" --data "${escapedData}"`, { stdio: 'ignore' });
  } catch {}

  process.exit(0);
}
