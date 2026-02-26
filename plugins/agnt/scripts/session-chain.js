#!/usr/bin/env node
/**
 * agnt Session Chain hook - executes chained commands on task/tool completion
 * Reads pending chains from .agnt/chains.json and executes matching triggers
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const CHAINS_FILE = path.join(PROJECT_ROOT, '.agnt', 'chains.json');

// Check if agnt is available
function isAgntAvailable() {
  try {
    execSync('which agnt', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Read stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => { main(input); });

function main(input) {
  if (!isAgntAvailable()) {
    process.exit(0);
  }

  // Check if chains file exists
  if (!fs.existsSync(CHAINS_FILE)) {
    process.exit(0);
  }

  // Parse input
  let data = {};
  try {
    data = JSON.parse(input || '{}');
  } catch {
    // Ignore parse errors
  }

  const eventType = process.env.AGNT_EVENT_TYPE || 'tool_complete';
  const toolName = data.tool_name || '';
  const taskStatus = data.status || 'completed';
  const toolSuccess = data.tool_result?.success ?? true;

  // Read chains
  let chainsData;
  try {
    chainsData = JSON.parse(fs.readFileSync(CHAINS_FILE, 'utf-8'));
  } catch {
    process.exit(0);
  }

  const chains = chainsData.chains || [];

  // Process each chain
  for (const chain of chains) {
    const trigger = chain.trigger || '';
    const condition = chain.condition || 'success';
    const command = chain.command || '';
    const session = chain.session || '';
    const chainId = chain.id || '';
    const oneshot = chain.oneshot || false;

    // Skip if no trigger or command
    if (!trigger || !command) continue;

    // Check if trigger matches
    let match = false;

    if (trigger === `tool:${toolName}` || trigger === 'tool:*') {
      match = true;
    } else if (trigger === 'task:complete' && eventType === 'task_complete') {
      match = true;
    } else if (trigger.startsWith('task:') && eventType === 'task_complete') {
      match = true;
    } else {
      // Try regex match
      try {
        const regex = new RegExp(trigger);
        if (regex.test(toolName)) {
          match = true;
        }
      } catch {
        // Invalid regex, skip
      }
    }

    if (!match) continue;

    // Check condition
    if (condition === 'success' && toolSuccess !== true) continue;
    if (condition === 'failure' && toolSuccess === true) continue;
    // 'always' condition doesn't need checking

    // Execute the chained command
    try {
      if (session) {
        execSync(`agnt session send --code "${session}" --message "${command}"`, { stdio: 'ignore' });
      } else {
        execSync(`agnt session send --project "${PROJECT_ROOT}" --message "${command}"`, { stdio: 'ignore' });
      }

      // Log execution
      const chainData = JSON.stringify({ chain_id: chainId, trigger: trigger });
      execSync(`agnt notify --type "chain-executed" --title "Chain Triggered" --message "${command}" --data "${chainData.replace(/"/g, '\\"')}"`, { stdio: 'ignore' });
    } catch {
      // Ignore errors
    }

    // Remove one-shot chains
    if (oneshot && chainId) {
      try {
        chainsData.chains = chainsData.chains.filter(c => c.id !== chainId);
        fs.writeFileSync(CHAINS_FILE, JSON.stringify(chainsData, null, 2));
      } catch {
        // Ignore errors
      }
    }
  }

  process.exit(0);
}
