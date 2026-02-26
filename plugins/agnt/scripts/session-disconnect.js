#!/usr/bin/env node
/**
 * agnt Session Disconnect hook - unregisters session on stop
 * Called when Claude Code session ends
 */

const { execSync } = require('child_process');

const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const SESSION_CODE = process.env.AGNT_SESSION_CODE || '';

// Check if agnt is available
function isAgntAvailable() {
  try {
    execSync('which agnt', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (!isAgntAvailable()) {
  process.exit(0);
}

// Unregister session
if (SESSION_CODE) {
  try {
    execSync(`agnt session unregister --code "${SESSION_CODE}"`, { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }
} else {
  // Try to find and unregister by project path
  try {
    execSync(`agnt session unregister --project "${PROJECT_ROOT}"`, { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }
}

// Notify browser of disconnect
try {
  execSync('agnt notify --type "session-disconnect" --title "Session Ended" --message "Claude Code session disconnected"', { stdio: 'ignore' });
} catch {
  // Ignore errors
}

process.exit(0);
