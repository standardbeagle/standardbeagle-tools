#!/usr/bin/env node
/**
 * Track when security-auditor subagent completes
 */

const fs = require('fs');
const path = require('path');

const workflowDir = path.join(process.cwd(), '.claude');
const sessionFile = path.join(workflowDir, 'workflow-session.json');

// Update security audit count
if (fs.existsSync(sessionFile)) {
  try {
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
    sessionData.security_audits = (sessionData.security_audits || 0) + 1;
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
  } catch {
    // Ignore errors
  }
}

// Log audit
const logPath = path.join(workflowDir, 'workflow-security.log');
try {
  fs.appendFileSync(logPath, `Security audit completed at ${new Date().toISOString()}\n`);
} catch {
  // Ignore errors
}

process.exit(0);
