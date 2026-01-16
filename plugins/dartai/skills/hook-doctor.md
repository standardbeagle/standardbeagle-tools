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
- ✓ Python scripts have python3 available
- ✓ Shell scripts are executable

### 4. Script Execution
- ✓ Scripts can be imported (Python syntax check)
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
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-/home/beagle/work/standardbeagle-tools/plugins/dartai}"

# Check hooks.json exists
test -f "$PLUGIN_ROOT/hooks/hooks.json" && echo "✓ hooks.json found" || echo "✗ hooks.json missing"
```

### Step 2: Validate hooks.json Structure

```bash
# Parse and validate JSON
python3 -c "
import json
import sys

with open('$PLUGIN_ROOT/hooks/hooks.json') as f:
    hooks = json.load(f)

valid_events = {
    'PreToolUse', 'PostToolUse', 'PostToolUseFailure',
    'Notification', 'UserPromptSubmit',
    'SessionStart', 'SessionEnd', 'Stop',
    'SubagentStart', 'SubagentStop',
    'PreCompact', 'PermissionRequest'
}

errors = []
for event in hooks.get('hooks', {}):
    if event not in valid_events:
        errors.append(f'Invalid event: {event}')

if errors:
    print('✗ Invalid events found:')
    for e in errors:
        print(f'  - {e}')
    sys.exit(1)
else:
    print('✓ All events are valid')
"
```

### Step 3: Check Script References

```bash
# Extract and check all script paths
python3 -c "
import json
import os
import sys

plugin_root = '$PLUGIN_ROOT'

with open(f'{plugin_root}/hooks/hooks.json') as f:
    hooks = json.load(f)

errors = []
warnings = []

for event, event_hooks in hooks.get('hooks', {}).items():
    for hook_group in event_hooks:
        for hook in hook_group.get('hooks', []):
            if hook.get('type') == 'command':
                cmd = hook.get('command', '')
                # Extract script path from command
                # Handle: python3 \"\${CLAUDE_PLUGIN_ROOT}/scripts/foo.py\"
                if '\${CLAUDE_PLUGIN_ROOT}' in cmd:
                    script_path = cmd.split('\${CLAUDE_PLUGIN_ROOT}')[1]
                    script_path = script_path.strip('\"').strip()
                    full_path = plugin_root + script_path

                    if os.path.exists(full_path):
                        print(f'✓ {event}: {os.path.basename(full_path)} exists')
                    else:
                        errors.append(f'{event}: {full_path} NOT FOUND')

if errors:
    print()
    print('✗ Missing scripts:')
    for e in errors:
        print(f'  - {e}')
    sys.exit(1)
"
```

### Step 4: Check Python Script Syntax

```bash
# Syntax check all Python scripts
for script in "$PLUGIN_ROOT"/scripts/*.py; do
    if python3 -m py_compile "$script" 2>/dev/null; then
        echo "✓ $(basename $script) - syntax OK"
    else
        echo "✗ $(basename $script) - SYNTAX ERROR"
        python3 -m py_compile "$script" 2>&1 | head -5
    fi
done
```

### Step 5: Check Dependencies

```bash
# Check common dependencies
python3 -c "
import sys
errors = []

# Check standard library (should always work)
try:
    import json, os, sys, datetime
    print('✓ Standard library OK')
except ImportError as e:
    errors.append(f'Standard library: {e}')

# Check if scripts import anything unusual
import ast
import glob

plugin_root = '$PLUGIN_ROOT'
imports = set()

for script in glob.glob(f'{plugin_root}/scripts/*.py'):
    try:
        with open(script) as f:
            tree = ast.parse(f.read())
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.add(alias.name.split('.')[0])
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.add(node.module.split('.')[0])
    except:
        pass

# Filter to non-standard imports
stdlib = {'json', 'os', 'sys', 'datetime', 'pathlib', 'subprocess',
          'argparse', 'logging', 're', 'time', 'typing', 'collections',
          'functools', 'itertools', 'shutil', 'tempfile', 'glob', 'ast'}

external = imports - stdlib
if external:
    print(f'External dependencies: {external}')
    for dep in external:
        try:
            __import__(dep)
            print(f'  ✓ {dep} installed')
        except ImportError:
            print(f'  ✗ {dep} NOT INSTALLED')
            errors.append(dep)

if errors:
    sys.exit(1)
"
```

### Step 6: Dry-Run Critical Hooks

```bash
# Test SessionStart hook (critical for initialization)
echo "Testing SessionStart hook..."
cd "$PLUGIN_ROOT"
timeout 5 python3 scripts/session_init.py --dry-run 2>&1 || echo "⚠ SessionStart script may have issues"

# Test Stop hook (critical for cleanup)
echo "Testing Stop hook..."
timeout 5 python3 scripts/session_cleanup.py --dry-run 2>&1 || echo "⚠ Stop script may have issues"
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
  ✓ session_init.py exists, syntax OK
  ✓ on_task_update.py exists, syntax OK
  ✓ track_dartboard.py exists, syntax OK
  ✓ track_changes.py exists, syntax OK
  ✓ session_cleanup.py exists, syntax OK

Dependencies:
  ✓ python3 available
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
  ✓ session_init.py exists
  ✗ session_init.py SYNTAX ERROR at line 42
  ✓ session_cleanup.py exists, syntax OK

Dependencies:
  ✓ python3 available
  ✗ requests NOT INSTALLED

Critical Hooks:
  ✗ SessionStart: Will fail (syntax error)
  ✓ Stop: Ready

Status: UNHEALTHY

Fixes Required:
1. Rename 'ToolError' to 'PostToolUseFailure' in hooks.json
2. Fix syntax error in session_init.py line 42
3. Install missing dependency: pip install requests
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
Error: Script not found: /path/to/scripts/missing.py

Fix:
1. Create the missing script
2. Or remove the hook referencing it
```

### Issue: Python Syntax Error
```
Error: SyntaxError in session_init.py line 42

Fix: Open the script and fix the syntax error
     python3 -m py_compile scripts/session_init.py
```

### Issue: Missing Dependency
```
Error: ModuleNotFoundError: No module named 'requests'

Fix: pip install requests
     Or: pip install -r requirements.txt
```

### Issue: Permission Denied
```
Error: Permission denied: scripts/session_init.py

Fix: chmod +x scripts/session_init.py
     Or ensure python3 can read the file
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
    python3 -c "
    import json
    with open('plugins/dartai/hooks/hooks.json') as f:
        hooks = json.load(f)
    # Validation logic here
    "
```
