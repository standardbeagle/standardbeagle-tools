#!/usr/bin/env node
/**
 * Track when code-quality-reviewer subagent completes
 */

const fs = require('fs');
const path = require('path');

const workflowDir = path.join(process.cwd(), '.workflow');
const sessionFile = path.join(workflowDir, 'session.json');

// Update verification count
if (fs.existsSync(sessionFile)) {
  try {
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
    sessionData.verification_completions = (sessionData.verification_completions || 0) + 1;
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
  } catch {
    // Ignore errors
  }
}

// Log verification
const logPath = path.join(workflowDir, 'verifications.log');
try {
  fs.appendFileSync(logPath, `Quality verification completed at ${new Date().toISOString()}\n`);
} catch {
  // Ignore errors
}

process.exit(0);
