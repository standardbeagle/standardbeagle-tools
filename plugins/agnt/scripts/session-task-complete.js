#!/usr/bin/env node
/**
 * agnt Session Task Complete hook - handles task completion events
 * Can trigger scheduled follow-ups and browser notifications
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

  const taskDesc = data.description || '';
  const taskStatus = data.status || 'completed';
  const taskOutput = data.output || '';

  // Skip if no task description
  if (!taskDesc) {
    process.exit(0);
  }

  // Build task data
  const taskData = JSON.stringify({
    description: taskDesc,
    status: taskStatus,
    output: taskOutput
  });

  // Broadcast task completion to browser
  const escapedData = taskData.replace(/"/g, '\\"');
  try {
    execSync(`agnt notify --type "task-complete" --title "Task ${taskStatus}" --message "${taskDesc}" --data "${escapedData}"`, { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }

  process.exit(0);
}
