---
name: preflight-check
description: Pre-flight validation before starting a Figma extraction to prevent failures
---

# Pre-Flight Extraction Check

Validates all prerequisites before starting a Figma design library extraction to prevent mid-extraction failures.

## What This Checks

### 1. Figma Access
- ✓ Access token is set
- ✓ Can reach Figma API
- ✓ Can access the specific file
- ✓ Has permission to read file
- ✓ Can list components and styles

### 2. Local Environment
- ✓ Output directory is writable
- ✓ Sufficient disk space (> 500MB recommended)
- ✓ figma-query MCP server is connected
- ✓ All required tools are available

### 3. File Structure
- ✓ File contains components (not empty)
- ✓ File has design tokens/styles
- ✓ File has exportable content
- ✓ File is not too large (< 50k nodes recommended)

## Usage

Run before `/extract-library`:

```
# Check if ready to extract
Use this skill with:
- file_key: The Figma file to extract
- output_dir: Where to save the extraction
```

## Check Process

### Step 1: Verify Figma Connection
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: info
  parameters:
    topic: status
```

Expected output:
```
Connected: true
Token: set
API Status: operational
```

### Step 2: Test File Access
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_tree
  parameters:
    file_key: "FILE_KEY"
    depth: 1
```

Expected: Returns file structure without errors

### Step 3: Count Components
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: list_components
  parameters:
    file_key: "FILE_KEY"
```

Expected: At least 1 component found

### Step 4: Count Styles
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: list_styles
  parameters:
    file_key: "FILE_KEY"
```

Expected: At least 1 style (color, text, or grid)

### Step 5: Check Output Directory
```bash
# Check if directory exists and is writable
test -d "$OUTPUT_DIR" || mkdir -p "$OUTPUT_DIR"
test -w "$OUTPUT_DIR"
```

### Step 6: Estimate Size
```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: figma-query
  tool_name: get_tree
  parameters:
    file_key: "FILE_KEY"
    format: "json"
```

Count nodes to estimate extraction time and size.

## Output Format

### All Checks Pass
```
✓ PRE-FLIGHT CHECK PASSED

Figma Access:
  ✓ Token valid
  ✓ API reachable
  ✓ File accessible (lnwVxZrQ6pqvArfEr1EiXt)
  ✓ Read permission granted

File Content:
  ✓ 62 components found
  ✓ 56 styles found
  ✓ ~49,831 nodes (large file - extraction will take 5-10 minutes)
  ✓ Exportable content detected

Local Environment:
  ✓ Output directory: ./docs (writable)
  ✓ Disk space: 2.5 GB available
  ✓ figma-query MCP: connected

Ready to extract!
Estimated time: 5-10 minutes
Estimated output size: ~50-100 MB
```

### Check Fails
```
✗ PRE-FLIGHT CHECK FAILED

Figma Access:
  ✗ Token not set
  ✗ Cannot reach Figma API

File Content:
  - Not checked (no access)

Local Environment:
  ✓ Output directory: ./docs (writable)
  ✓ Disk space: 2.5 GB available
  ✗ figma-query MCP: not connected

Critical Issues (3):
1. Figma access token not set
   Fix: Run /setup-figma to configure token
   Or: Set FIGMA_ACCESS_TOKEN environment variable

2. Cannot reach Figma API
   Possible causes:
   - Network connectivity issue
   - Firewall blocking api.figma.com
   - Figma API is down (check status.figma.com)

3. figma-query MCP server not connected
   Fix: Restart Claude Code or check SLOP configuration

Cannot proceed with extraction.
```

## Common Issues and Fixes

### Issue: Token Invalid
```bash
# Fix: Update token in SLOP config
# ~/.config/slop-mcp/config.kdl
mcp "figma-query" {
    env {
        FIGMA_ACCESS_TOKEN "YOUR_NEW_TOKEN"
    }
}

# Then restart MCP server
```

### Issue: File Not Found
```
Error: File key "ABC123" not found

Fix: Check the file key in the Figma URL:
https://www.figma.com/design/CORRECT_KEY_HERE/...
```

### Issue: Permission Denied
```
Error: Cannot access file (403 Forbidden)

Fix: Ensure you have view access to the file in Figma:
1. Open the file in Figma
2. Check if you can see the content
3. Ask the owner to grant you view access
```

### Issue: No Components Found
```
Warning: File has 0 components

This is unusual. Possible causes:
- File is a work-in-progress
- Components are not published
- This is a pure design file without components

You can still extract:
- Design tokens (colors, typography)
- Pages (as mockups)
- Individual frames (as CSS)

Continue? [y/n]
```

## Warnings That Don't Block Extraction

### Large File Warning
```
⚠ WARNING: File is very large (>50k nodes)

Extraction may:
- Take 15-30 minutes
- Generate 200+ MB of output
- Require significant memory

Recommendations:
1. Extract specific pages only (use page-extraction skill)
2. Extract components in batches
3. Run extraction in background
4. Ensure stable network connection

Continue anyway? [y/n]
```

### No Styles Warning
```
⚠ WARNING: No design tokens or styles found

The file may not use:
- Figma variables
- Shared styles
- Design tokens

Impact:
- CSS will use hardcoded values
- No tokens.css will be generated
- Components won't reference tokens

This is OK for older files or files without a design system.

Continue? [y/n]
```

## Integration Example

```markdown
# In extract-library command

1. Run pre-flight check
2. If fails: Stop and show fixes
3. If warns: Ask user to confirm
4. If passes: Start extraction

# Example flow
User runs: /extract-library lnwVxZrQ6pqvArfEr1EiXt ./docs

Step 1: Pre-flight check
  ✓ All checks passed
  Estimated time: 5 minutes

Step 2: Begin extraction
  Phase 1: Sync file...
  Phase 2: Extract tokens...
  ...
```

## Automation Mode

Skip confirmations for CI/CD:

```bash
# Set environment variable
FIGMA_EXTRACT_AUTO=1

# Or pass flag
/extract-library file_key="..." output_dir="..." --auto --no-confirm
```

In automation mode:
- Warnings don't block (logged only)
- Errors still block
- No interactive prompts
- Exit codes indicate success/failure

## Exit Codes

```
0 = All checks passed
1 = Critical error (cannot extract)
2 = Warnings (can extract with confirmation)
```

## Checklist Template

After pre-flight check, generate an extraction checklist:

```markdown
# Extraction Checklist for FILE_KEY

## Pre-Flight
- [x] Figma access verified
- [x] 62 components found
- [x] 56 styles found
- [x] Output directory ready

## Extraction Phases
- [ ] Phase 1: Sync file locally
- [ ] Phase 2: Export design tokens
- [ ] Phase 3: Export component CSS
- [ ] Phase 4: Export assets
- [ ] Phase 5: Generate HTML examples
- [ ] Phase 6: Generate documentation

## Post-Extraction Validation
- [ ] tokens.css exists and valid
- [ ] Component CSS files created
- [ ] Assets directory populated
- [ ] HTML examples work
- [ ] All references resolve

## Ready to Extract?
Yes - all pre-flight checks passed.
```
