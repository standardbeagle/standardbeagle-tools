#!/usr/bin/env node
/**
 * Notify browser when Claude finishes responding
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
  } catch {}

  const stopReason = data.stop_reason || 'completed';

  try {
    execSync(`agnt notify --type "response-complete" --title "Claude Finished" --message "${stopReason}"`, { stdio: 'ignore' });
  } catch {}

  process.exit(0);
}
