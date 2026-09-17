#!/bin/bash
# Setup git filters for local development
# This allows mcp.json files to use local binaries while committing npx versions

set -e

cd "$(dirname "$0")/.."

echo "Setting up git smudge/clean filters for local development..."

# slop-mcp filter: npx @standardbeagle/slop-mcp@latest serve <-> slop-mcp serve
git config filter.slop-mcp-local.clean 'sed -e '\''s|"command": "slop-mcp"|"command": "npx"|'\'' -e '\''s|"args": \["serve"\]|"args": ["-y", "@standardbeagle/slop-mcp@latest", "serve"]|'\'''
git config filter.slop-mcp-local.smudge 'sed -e '\''s|"command": "npx"|"command": "slop-mcp"|'\'' -e '\''s|"args": \["-y", "@standardbeagle/slop-mcp@latest", "serve"\]|"args": ["serve"]|'\'''

# agnt filter: npx @standardbeagle/agnt@latest mcp <-> agnt mcp
git config filter.agnt-local.clean 'sed -e '\''s|"command": "agnt"|"command": "npx"|'\'' -e '\''s|"args": \["mcp"\]|"args": ["-y", "@standardbeagle/agnt@latest", "mcp"]|'\'''
git config filter.agnt-local.smudge 'sed -e '\''s|"command": "npx"|"command": "agnt"|'\'' -e '\''s|"args": \["-y", "@standardbeagle/agnt@latest", "mcp"\]|"args": ["mcp"]|'\'''

# ux-developer filter: same as agnt (single agnt MCP)
git config filter.ux-developer-local.clean 'sed -e '\''s|"command": "agnt"|"command": "npx"|'\'' -e '\''s|"args": \["mcp"\]|"args": ["-y", "@standardbeagle/agnt@latest", "mcp"]|'\'''
git config filter.ux-developer-local.smudge 'sed -e '\''s|"command": "npx"|"command": "agnt"|'\'' -e '\''s|"args": \["-y", "@standardbeagle/agnt@latest", "mcp"\]|"args": ["mcp"]|'\'''

# mcp-debug filter: npx @standardbeagle/mcp-debug@latest <-> mcp-debug
git config filter.mcp-debug-local.clean 'sed -e '\''s|"command": "mcp-debug"|"command": "npx"|'\'' -e '\''s|"args": \[\]|"args": ["-y", "@standardbeagle/mcp-debug@latest"]|'\'''
git config filter.mcp-debug-local.smudge 'sed -e '\''s|"command": "npx"|"command": "mcp-debug"|'\'' -e '\''s|"args": \["-y", "@standardbeagle/mcp-debug@latest"\]|"args": []|'\'''

echo "Filters configured. Re-checking out mcp.json files to apply smudge filter..."

# Re-checkout files to apply smudge filter
git checkout plugins/slop-mcp/mcp.json 2>/dev/null || true
git checkout plugins/agnt/mcp.json 2>/dev/null || true
git checkout plugins/ux-developer/mcp.json 2>/dev/null || true
git checkout plugins/mcp-tester/mcp.json 2>/dev/null || true

echo ""
echo "Done! Local mcp.json files now use local binaries:"
echo "  - slop-mcp: uses 'slop-mcp serve' locally"
echo "  - agnt: uses 'agnt mcp' locally"
echo "  - ux-developer: uses 'agnt mcp' locally"
echo "  - mcp-tester: uses 'mcp-debug' locally"
echo ""
echo "Commits will automatically use npx versions for deployment."
