#!/usr/bin/env node
/**
 * Track loop iteration when task-executor subagent completes
 */

const fs = require('fs');
const path = require('path');

const workflowDir = path.join(process.cwd(), '.workflow');
const sessionFile = path.join(workflowDir, 'session.json');
const stateFile = path.join(workflowDir, 'loop-state.json');

// Update session metrics
if (fs.existsSync(sessionFile)) {
  try {
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
    sessionData.subagent_completions = (sessionData.subagent_completions || 0) + 1;
    sessionData.context_barriers_enforced = (sessionData.context_barriers_enforced || 0) + 1;
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
  } catch {
    // Fallback: append completion record
    const logPath = path.join(workflowDir, 'completions.log');
    fs.appendFileSync(logPath, `Task executor completed at ${new Date().toISOString()}\n`);
  }
}

// Track completion in state file if it exists
if (fs.existsSync(stateFile)) {
  try {
    const stateData = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    stateData.stats = stateData.stats || {};
    stateData.stats.total_iterations = (stateData.stats.total_iterations || 0) + 1;
    fs.writeFileSync(stateFile, JSON.stringify(stateData, null, 2));
  } catch {
    // Ignore errors
  }
}

// Success
process.exit(0);
