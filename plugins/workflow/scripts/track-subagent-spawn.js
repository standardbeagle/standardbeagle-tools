#!/usr/bin/env node
/**
 * Track when subagents are spawned (PostToolUse for Task tool)
 */

const fs = require('fs');
const path = require('path');

const workflowDir = path.join(process.cwd(), '.claude');
const sessionFile = path.join(workflowDir, 'workflow-session.json');

// Update spawn count
if (fs.existsSync(sessionFile)) {
  try {
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
    sessionData.subagent_spawns = (sessionData.subagent_spawns || 0) + 1;
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
  } catch {
    // Ignore errors
  }
}

// Log spawn (helps track context isolation)
const logPath = path.join(workflowDir, 'workflow-spawns.log');
try {
  fs.appendFileSync(logPath, `Subagent spawned at ${new Date().toISOString()}\n`);
} catch {
  // Ignore errors
}

process.exit(0);
