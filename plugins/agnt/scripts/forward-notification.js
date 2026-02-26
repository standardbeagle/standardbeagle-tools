#!/usr/bin/env node
/**
 * Forward Claude notifications to the browser
 * Receives Notification event JSON on stdin
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
    process.exit(0);
  }

  const title = data.title || 'Notification';
  const message = data.message || '';

  if (!message) {
    process.exit(0);
  }

  // Forward via agnt
  try {
    execSync(`agnt notify --type "claude-notification" --title "${title}" --message "${message}"`, { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }

  process.exit(0);
}
