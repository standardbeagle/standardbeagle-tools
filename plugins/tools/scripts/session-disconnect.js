#!/usr/bin/env node
/**
 * agnt Session Disconnect hook
 */

const { execSync } = require('child_process');

const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const SESSION_CODE = process.env.AGNT_SESSION_CODE || '';

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

if (SESSION_CODE) {
  try {
    execSync(`agnt session unregister --code "${SESSION_CODE}"`, { stdio: 'ignore' });
  } catch {}
} else {
  try {
    execSync(`agnt session unregister --project "${PROJECT_ROOT}"`, { stdio: 'ignore' });
  } catch {}
}

try {
  execSync('agnt notify --type "session-disconnect" --title "Session Ended" --message "Claude Code session disconnected"', { stdio: 'ignore' });
} catch {}

process.exit(0);
