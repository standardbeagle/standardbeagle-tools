#!/usr/bin/env node
/**
 * Session initialization for workflow plugin
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Get workflow directory
const workflowDir = path.join(process.cwd(), '.workflow');

// Ensure directory exists
if (!fs.existsSync(workflowDir)) {
  fs.mkdirSync(workflowDir, { recursive: true });
}

const sessionFile = path.join(workflowDir, 'session.json');

if (!fs.existsSync(sessionFile)) {
  const sessionData = {
    session_id: `session-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    started_at: new Date().toISOString(),
    workflow_version: '0.1.0',
    subagent_spawns: 0,
    subagent_completions: 0,
    context_barriers_enforced: 0,
    loops_started: 0,
    tasks_completed: 0,
    tasks_failed: 0
  };

  fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
}

// Success - silent unless error
process.exit(0);
