#!/usr/bin/env node
/**
 * Track html-generator subagent completion
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
    stateData.html_gen_iterations = (stateData.html_gen_iterations || 0) + 1;
    stateData.last_html_gen_at = Date.now();
    stateData.status = 'html_generation_complete';
    fs.writeFileSync(stateFile, JSON.stringify(stateData, null, 2));
  } catch {
    // Ignore errors
  }
}

console.log('{"success": true, "message": "HTML generation completed"}');
process.exit(0);
