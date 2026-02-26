#!/usr/bin/env node
/**
 * Session cleanup for workflow plugin
 */

const fs = require('fs');
const path = require('path');

const workflowDir = path.join(process.cwd(), '.claude');
const sessionFile = path.join(workflowDir, 'workflow-session.json');

// Update session with end time
if (fs.existsSync(sessionFile)) {
  try {
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
    sessionData.ended_at = new Date().toISOString();
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
  } catch {
    // Ignore errors
  }
}

// Archive session to history (optional)
const historyDir = path.join(workflowDir, 'workflow-history');
if (!fs.existsSync(historyDir)) {
  fs.mkdirSync(historyDir, { recursive: true });
}

if (fs.existsSync(sessionFile)) {
  try {
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
    const sessionId = sessionData.session_id || 'unknown';
    const archivePath = path.join(historyDir, `session-${sessionId}.json`);
    fs.copyFileSync(sessionFile, archivePath);
  } catch {
    // Ignore errors
  }
}

// Output JSON response for Claude Code hook system
console.log('{"ok": true}');

process.exit(0);
