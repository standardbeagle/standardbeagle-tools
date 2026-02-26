#!/usr/bin/env node
/**
 * agnt Workflow Engine - Self-transitioning state machine for task completion
 * Enforces multi-phase workflows with review cycles before allowing completion
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const WORKFLOW_DIR = path.join(PROJECT_ROOT, '.agnt');
const WORKFLOW_FILE = path.join(WORKFLOW_DIR, 'workflow.json');
const STATE_FILE = path.join(WORKFLOW_DIR, 'workflow-state.json');

// Read stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => { main(input); });

function isAgntAvailable() {
  try {
    execSync('which agnt', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function transitionState(workflow, state, currentState, newState, reason) {
  // Update state file
  state.current_state = newState;
  state.history = state.history || [];
  state.history.push({
    from: currentState,
    to: newState,
    reason: reason,
    time: new Date().toISOString()
  });

  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {
    // Ignore errors
  }

  // Get new state's entry prompt
  const entryPrompt = workflow.states?.[newState]?.prompt;

  if (entryPrompt) {
    try {
      execSync(`agnt session send --project "${PROJECT_ROOT}" --message "${entryPrompt}"`, { stdio: 'ignore' });
    } catch {
      // Ignore errors
    }
  }

  // Notify browser
  try {
    execSync(`agnt notify --type "workflow-transition" --title "Workflow: ${newState}" --message "${reason}"`, { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }
}

function incrementAttempts(state, currentState) {
  state.attempts = state.attempts || {};
  state.attempts[currentState] = (state.attempts[currentState] || 0) + 1;
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {
    // Ignore errors
  }
  return state.attempts[currentState];
}

function main(input) {
  // Ensure workflow directory exists
  if (!fs.existsSync(WORKFLOW_DIR)) {
    fs.mkdirSync(WORKFLOW_DIR, { recursive: true });
  }

  if (!isAgntAvailable()) {
    process.exit(0);
  }

  // Check if workflow exists
  if (!fs.existsSync(WORKFLOW_FILE)) {
    process.exit(0);
  }

  // Initialize state file if missing
  if (!fs.existsSync(STATE_FILE)) {
    const initialState = {
      current_state: 'init',
      history: [],
      attempts: {},
      started_at: null
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(initialState, null, 2));
  }

  // Load workflow and state
  let workflow, state;
  try {
    workflow = JSON.parse(fs.readFileSync(WORKFLOW_FILE, 'utf-8'));
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    process.exit(0);
  }

  const currentState = state.current_state;

  // Parse input
  let data = {};
  try {
    data = JSON.parse(input || '{}');
  } catch {
    // Ignore parse errors
  }

  const eventType = process.env.AGNT_EVENT_TYPE || 'response';
  const toolName = data.tool_name || '';
  const responseText = data.response || data.message || '';

  // Get current state definition
  const stateDef = workflow.states?.[currentState];
  if (!stateDef) {
    process.exit(0);
  }

  // Check for completion signals in response
  const completionSignals = ['complete', 'done', 'finished', 'all tasks', 'implemented', 'ready for review'];
  let foundCompletion = false;

  const lowerResponse = responseText.toLowerCase();
  for (const signal of completionSignals) {
    if (lowerResponse.includes(signal)) {
      foundCompletion = true;
      break;
    }
  }

  // Get state properties
  const stateType = stateDef.type || 'work';
  const nextState = stateDef.next || '';
  const onComplete = stateDef.on_complete || '';
  const reviewPrompt = stateDef.review_prompt || '';
  const maxAttempts = stateDef.max_attempts || 3;

  // Get attempt count for current state
  let attempts = state.attempts?.[currentState] || 0;

  // Handle based on state type
  if (foundCompletion) {
    switch (stateType) {
      case 'work':
        attempts = incrementAttempts(state, currentState);
        if (onComplete) {
          transitionState(workflow, state, currentState, onComplete, 'Work phase reported complete, moving to review');
        } else if (nextState) {
          transitionState(workflow, state, currentState, nextState, 'Work phase complete');
        }
        break;

      case 'review':
        attempts = incrementAttempts(state, currentState);
        if (attempts < maxAttempts) {
          // Not enough review cycles - send review prompt
          if (reviewPrompt) {
            try {
              execSync(`agnt session send --project "${PROJECT_ROOT}" --message "${reviewPrompt}"`, { stdio: 'ignore' });
              execSync(`agnt notify --type "workflow-review" --title "Review Required" --message "Attempt ${attempts}/${maxAttempts}"`, { stdio: 'ignore' });
            } catch {
              // Ignore errors
            }
          }
        } else {
          // Enough attempts, allow transition
          if (onComplete) {
            transitionState(workflow, state, currentState, onComplete, `Review complete after ${attempts} attempts`);
          } else if (nextState) {
            transitionState(workflow, state, currentState, nextState, 'Review complete');
          }
        }
        break;

      case 'gate':
        if (nextState) {
          transitionState(workflow, state, currentState, nextState, 'Gate passed');
        }
        break;

      case 'fix':
        if (onComplete) {
          transitionState(workflow, state, currentState, onComplete, 'Fixes applied, returning to review');
        }
        break;

      case 'final':
        try {
          execSync('agnt notify --type "workflow-complete" --title "Workflow Complete" --message "All phases finished successfully"', { stdio: 'ignore' });
        } catch {
          // Ignore errors
        }
        // Reset for next workflow
        const resetState = {
          current_state: 'init',
          history: [],
          attempts: {},
          completed_at: new Date().toISOString()
        };
        try {
          fs.writeFileSync(STATE_FILE, JSON.stringify(resetState, null, 2));
        } catch {
          // Ignore errors
        }
        break;
    }
  }

  process.exit(0);
}
