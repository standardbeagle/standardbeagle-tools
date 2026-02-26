#!/usr/bin/env node
/**
 * agnt Session Activity hook - broadcasts tool/task activity to browser
 */

const { execSync } = require('child_process');
const path = require('path');

// Read stdin
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

  const toolName = data.tool_name || '';
  const toolInput = data.tool_input || {};
  const toolResult = data.tool_result?.success ?? true;

  if (!toolName) {
    process.exit(0);
  }

  let summary = toolName;
  switch (toolName) {
    case 'Read':
      summary = `Reading ${path.basename(toolInput.file_path || 'file')}`;
      break;
    case 'Write':
      summary = `Writing ${path.basename(toolInput.file_path || 'file')}`;
      break;
    case 'Edit':
      summary = `Editing ${path.basename(toolInput.file_path || 'file')}`;
      break;
    case 'Bash':
      const cmd = (toolInput.command || '').substring(0, 50);
      summary = `Running: ${cmd}...`;
      break;
    case 'Glob':
    case 'Grep':
      summary = `Searching: ${toolInput.pattern || ''}`;
      break;
    case 'Task':
      summary = `Task: ${toolInput.description || 'task'}`;
      break;
    case 'TodoWrite':
      summary = 'Updating task list';
      break;
  }

  const activityData = JSON.stringify({ tool: toolName, summary, success: toolResult });
  const escapedData = activityData.replace(/"/g, '\\"');

  try {
    execSync(`agnt notify --type "session-activity" --title "Agent Activity" --message "${summary}" --data "${escapedData}"`, { stdio: 'ignore' });
  } catch {}

  try {
    execSync(`agnt session heartbeat --project "${process.env.CLAUDE_PROJECT_DIR || process.cwd()}"`, { stdio: 'ignore' });
  } catch {}

  process.exit(0);
}
