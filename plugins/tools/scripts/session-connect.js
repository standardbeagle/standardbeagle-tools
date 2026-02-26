#!/usr/bin/env node
/**
 * agnt Session Connect hook - registers Claude Code session with daemon
 * Called on SessionStart to enable bidirectional communication
 */

const { execSync } = require('child_process');

const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const SESSION_ID = process.env.CLAUDE_SESSION_ID || '';

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
  process.exit(0); // Don't block session start
}

// Get or generate a session code
let sessionCode = '';
if (SESSION_ID) {
  sessionCode = `claude-${SESSION_ID.substring(0, 8)}`;
}

// Build command args
const args = ['session', 'register', '--project', PROJECT_ROOT];
if (sessionCode) {
  args.push('--code', sessionCode);
}

try {
  const result = execSync(`agnt ${args.join(' ')}`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  if (result) {
    try {
      const parsed = JSON.parse(result);
      if (parsed.code) {
        console.log(`Session registered: ${parsed.code}`);
      }
    } catch {
      // Result might not be JSON, that's okay
    }
  }
} catch {
  // Ignore errors - don't block session start
}

process.exit(0);
