---
name: slop-migrate
description: Migrate existing MCP configurations to slop-mcp management
---

# Migrate MCP Configurations to slop-mcp

Read existing Claude Code MCP server configurations and register them with slop-mcp.

## Steps

1. Read the user's existing MCP configuration. Check these locations:
   - Claude Desktop: `~/.config/claude/claude_desktop_config.json` (Linux) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
   - VS Code: `.vscode/mcp.json`
   - Claude Code settings: `~/.claude/settings.json`
   - Project `.mcp.json`

2. Parse each `mcpServers` entry to extract name, command, args, and env.

3. Call `manage_mcps` with `action: "list"` to check what is already registered.

4. For each server not already registered, call `manage_mcps` with `action: "register"`:

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "register"
  name: "<server-name>"
  type: "command"
  command: "<command>"
  args: ["<arg1>", "<arg2>"]
  env: { "KEY": "value" }
  scope: "user"
```

5. Ask the user which scope to use:
   - `"user"` -- saved to `~/.config/slop-mcp/config.kdl`, persists across projects
   - `"project"` -- saved to `.slop-mcp.kdl`, persists for this project only
   - `"memory"` -- runtime only, for testing before committing

6. Report results: which servers were migrated, which were skipped (duplicates), and any errors.

## Safety

- Skip servers that are already registered (match by name).
- Report any servers that fail to register with the error message.
- Do not modify original config files.
