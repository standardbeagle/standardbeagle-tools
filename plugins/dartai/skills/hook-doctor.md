---
name: hook-doctor
description: Diagnose and validate plugin hooks - check scripts exist, have permissions, and execute correctly
---

# Hook Doctor

Diagnose and validate plugin hooks to ensure they execute correctly.

## What This Checks

### 1. Hook Configuration
- ✓ hooks.json is valid JSON
- ✓ All event names are valid (SessionStart, PostToolUse, Stop, etc.)
- ✓ Hook structure matches expected schema

### 2. Script Existence
- ✓ All referenced scripts exist
- ✓ Scripts are in expected locations
- ✓ No broken ${CLAUDE_PLUGIN_ROOT} references

### 3. Script Permissions
- ✓ Scripts are readable
- ✓ Node scripts have node available
- ✓ Shell scripts are executable

### 4. Script Execution
- ✓ Scripts can be parsed (Node.js syntax check)
- ✓ Required dependencies are installed
- ✓ Environment variables are available

### 5. Critical Hook Validation
- ⚠️ SessionStart hooks - affect session initialization
- ⚠️ Stop hooks - affect cleanup (resources, connections)
- ⚠️ PreCompact hooks - affect memory preservation

## Usage

Run this skill to diagnose hook issues:

```
Check my dartai plugin hooks for issues
```

## Diagnostic Process

### Step 1: Locate Plugin and Hooks

```bash
# Find the plugin root
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:?CLAUDE_PLUGIN_ROOT must be set}"

# Check hooks.json exists
test -f "$PLUGIN_ROOT/hooks/hooks.json" && echo "✓ hooks.json found" || echo "✗ hooks.json missing"
```

### Step 2: Validate hooks.json Structure

```bash
# Parse and validate JSON
node -e "
const fs = require('fs');

const hooks = JSON.parse(fs.readFileSync('$PLUGIN_ROOT/hooks/hooks.json', 'utf8'));

const validEvents = new Set([
    'PreToolUse', 'PostToolUse', 'PostToolUseFailure',
    'Notification', 'UserPromptSubmit',
    'SessionStart', 'SessionEnd', 'Stop',
    'SubagentStart', 'SubagentStop',
    'PreCompact', 'PermissionRequest'
]);

const errors = [];
for (const event of Object.keys(hooks.hooks || {})) {
    if (!validEvents.has(event)) {
        errors.push('Invalid event: ' + event);
    }
}

if (errors.length > 0) {
    console.log('✗ Invalid events found:');
    for (const e of errors) {
        console.log('  - ' + e);
    }
    process.exit(1);
} else {
    console.log('✓ All events are valid');
}
"
```

### Step 3: Check Script References

```bash
# Extract and check all script paths
node -e "
const fs = require('fs');
const path = require('path');

const pluginRoot = '$PLUGIN_ROOT';

const hooks = JSON.parse(fs.readFileSync(pluginRoot + '/hooks/hooks.json', 'utf8'));

const errors = [];

for (const [event, eventHooks] of Object.entries(hooks.hooks || {})) {
    for (const hookGroup of eventHooks) {
        for (const hook of (hookGroup.hooks || [])) {
            if (hook.type === 'command') {
                const cmd = hook.command || '';
                // Handle: node \"\${CLAUDE_PLUGIN_ROOT}/scripts/foo.js\"
                if (cmd.includes('\${CLAUDE_PLUGIN_ROOT}')) {
                    const scriptPath = cmd.split('\${CLAUDE_PLUGIN_ROOT}')[1];
                    const cleanPath = scriptPath.replace(/\"/g, '').trim();
                    const fullPath = pluginRoot + cleanPath;

                    if (fs.existsSync(fullPath)) {
                        console.log('✓ ' + event + ': ' + path.basename(fullPath) + ' exists');
                    } else {
                        errors.push(event + ': ' + fullPath + ' NOT FOUND');
                    }
                }
            }
        }
    }
}

if (errors.length > 0) {
    console.log('');
    console.log('✗ Missing scripts:');
    for (const e of errors) {
        console.log('  - ' + e);
    }
    process.exit(1);
}
"
```

### Step 4: Check Node.js Script Syntax

```bash
# Syntax check all Node.js scripts
for script in "$PLUGIN_ROOT"/scripts/*.js; do
    if node --check "$script" 2>/dev/null; then
        echo "✓ $(basename $script) - syntax OK"
    else
        echo "✗ $(basename $script) - SYNTAX ERROR"
        node --check "$script" 2>&1 | head -5
    fi
done
```

### Step 5: Check Dependencies

```bash
# Check common dependencies
node -e "
const errors = [];

// Check built-in modules (should always work)
try {
    require('fs');
    require('path');
    require('os');
    console.log('✓ Built-in modules OK');
} catch (e) {
    errors.push('Built-in modules: ' + e.message);
}

// Check if package.json exists and has dependencies
const fs = require('fs');
const path = require('path');

const pluginRoot = '$PLUGIN_ROOT';
const pkgPath = path.join(pluginRoot, 'package.json');

if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    for (const dep of Object.keys(deps)) {
        try {
            require.resolve(dep);
            console.log('  ✓ ' + dep + ' installed');
        } catch (e) {
            console.log('  ✗ ' + dep + ' NOT INSTALLED');
            errors.push(dep);
        }
    }
}

if (errors.length > 0) {
    process.exit(1);
}
"
```

### Step 6: Dry-Run Critical Hooks

```bash
# Test SessionStart hook (critical for initialization)
echo "Testing SessionStart hook..."
cd "$PLUGIN_ROOT"
timeout 5 node scripts/session-init.js --dry-run 2>&1 || echo "⚠ SessionStart script may have issues"

# Test Stop hook (critical for cleanup)
echo "Testing Stop hook..."
timeout 5 node scripts/session-cleanup.js --dry-run 2>&1 || echo "⚠ Stop script may have issues"
```

## Output Format

### All Checks Pass
```
HOOK DOCTOR - dartai
====================

Configuration:
  ✓ hooks.json valid
  ✓ All events valid (SessionStart, PostToolUse, Stop)

Scripts:
  ✓ session-init.js exists, syntax OK
  ✓ on-task-update.js exists, syntax OK
  ✓ track-dartboard.js exists, syntax OK
  ✓ track-changes.js exists, syntax OK
  ✓ session-cleanup.js exists, syntax OK

Dependencies:
  ✓ node available
  ✓ All imports resolved

Critical Hooks:
  ✓ SessionStart: Ready
  ✓ Stop: Ready

Status: HEALTHY
```

### Issues Found
```
HOOK DOCTOR - dartai
====================

Configuration:
  ✓ hooks.json valid
  ✗ Invalid event: ToolError (should be PostToolUseFailure)

Scripts:
  ✓ session-init.js exists
  ✗ session-init.js SYNTAX ERROR at line 42
  ✓ session-cleanup.js exists, syntax OK

Dependencies:
  ✓ node available
  ✗ some-package NOT INSTALLED

Critical Hooks:
  ✗ SessionStart: Will fail (syntax error)
  ✓ Stop: Ready

Status: UNHEALTHY

Fixes Required:
1. Rename 'ToolError' to 'PostToolUseFailure' in hooks.json
2. Fix syntax error in session-init.js line 42
3. Install missing dependency: npm install some-package
```

## Common Issues and Fixes

### Issue: Invalid Hook Event Name
```
Error: Invalid event: ToolError

Valid events are:
- PreToolUse, PostToolUse, PostToolUseFailure
- SessionStart, SessionEnd, Stop
- SubagentStart, SubagentStop
- PreCompact, Notification, UserPromptSubmit, PermissionRequest

Fix: Update hooks.json to use valid event name
```

### Issue: Script Not Found
```
Error: Script not found: /path/to/scripts/missing.js

Fix:
1. Create the missing script
2. Or remove the hook referencing it
```

### Issue: Node.js Syntax Error
```
Error: SyntaxError in session-init.js line 42

Fix: Open the script and fix the syntax error
     node --check scripts/session-init.js
```

### Issue: Missing Dependency
```
Error: Cannot find module 'some-package'

Fix: npm install some-package
     Or: npm install
```

### Issue: Permission Denied
```
Error: Permission denied: scripts/session-init.js

Fix: chmod +x scripts/session-init.js
     Or ensure node can read the file
```

## Integration

This skill should be run:
1. After installing/updating the dartai plugin
2. When hook errors appear in Claude Code
3. Before deploying to production
4. As part of plugin CI/CD pipeline

## Automation

Add to CI workflow:
```yaml
- name: Validate Hooks
  run: |
    node -e "
    const fs = require('fs');
    const hooks = JSON.parse(fs.readFileSync('plugins/dartai/hooks/hooks.json', 'utf8'));
    // Validation logic here
    "
```
