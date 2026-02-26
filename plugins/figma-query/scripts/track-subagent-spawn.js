#!/usr/bin/env node
/**
 * Track subagent spawns for figma-query operations
 */

const fs = require('fs');
const path = require('path');

const workflowDir = path.join(process.cwd(), '.claude');
const stateFile = path.join(workflowDir, 'figma-extraction-state.json');

// Ensure directory exists
if (!fs.existsSync(workflowDir)) {
  fs.mkdirSync(workflowDir, { recursive: true });
}

if (fs.existsSync(stateFile)) {
  try {
    const stateData = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    stateData.subagent_spawns = (stateData.subagent_spawns || 0) + 1;
    fs.writeFileSync(stateFile, JSON.stringify(stateData, null, 2));
  } catch {
    // Ignore errors
  }
} else {
  const initialState = {
    subagent_spawns: 1,
    status: 'running'
  };
  fs.writeFileSync(stateFile, JSON.stringify(initialState, null, 2));
}

console.log('{"success": true}');
process.exit(0);
