#!/usr/bin/env node
/**
 * Notify browser when Claude finishes responding
 * Receives Stop event JSON on stdin
 */

const { execSync } = require('child_process');

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
    // Ignore parse errors
  }

  const stopReason = data.stop_reason || 'completed';

  // Notify via agnt
  try {
    execSync(`agnt notify --type "response-complete" --title "Claude Finished" --message "${stopReason}"`, { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }

  process.exit(0);
}
