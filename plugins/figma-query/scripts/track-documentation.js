#!/usr/bin/env node
/**
 * Track component-documenter subagent completion
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
    stateData.documentation_iterations = (stateData.documentation_iterations || 0) + 1;
    stateData.last_doc_at = Date.now();
    stateData.status = 'documentation_complete';
    fs.writeFileSync(stateFile, JSON.stringify(stateData, null, 2));
  } catch {
    // Ignore errors
  }
}

console.log('{"success": true, "message": "Documentation completed"}');
process.exit(0);
