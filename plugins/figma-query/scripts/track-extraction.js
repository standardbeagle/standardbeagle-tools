#!/usr/bin/env node
/**
 * Track library-extractor subagent completion
 */

const fs = require('fs');
const path = require('path');

const workflowDir = path.join(process.cwd(), '.claude');
const stateFile = path.join(workflowDir, 'figma-extraction-state.json');

// Ensure directory exists
if (!fs.existsSync(workflowDir)) {
  fs.mkdirSync(workflowDir, { recursive: true });
}

// Initialize or update state
if (fs.existsSync(stateFile)) {
  try {
    const stateData = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    stateData.extraction_iterations = (stateData.extraction_iterations || 0) + 1;
    stateData.last_extraction_at = Date.now();
    stateData.status = 'extraction_complete';
    fs.writeFileSync(stateFile, JSON.stringify(stateData, null, 2));
  } catch {
    // Ignore errors
  }
} else {
  const initialState = {
    extraction_iterations: 1,
    status: 'extraction_complete',
    continue_loop: true
  };
  fs.writeFileSync(stateFile, JSON.stringify(initialState, null, 2));
}

console.log('{"success": true, "message": "Library extraction completed, ready for next phase"}');
process.exit(0);
