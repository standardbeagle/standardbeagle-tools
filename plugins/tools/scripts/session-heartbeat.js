#!/usr/bin/env node
/**
 * agnt Session Heartbeat hook - keeps session alive
 */

const { execSync } = require('child_process');

const SESSION_CODE = process.env.AGNT_SESSION_CODE || '';
const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();

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

const args = SESSION_CODE
  ? ['session', 'heartbeat', '--code', SESSION_CODE]
  : ['session', 'heartbeat', '--project', PROJECT_ROOT];

try {
  execSync(`agnt ${args.join(' ')}`, { stdio: 'ignore' });
} catch {
  // Ignore errors
}

process.exit(0);
