---
name: Update Project
description: This skill should be used when the user asks to "update project", "refresh project settings", "re-detect languages", "update CLAUDE.md", "refresh hooks", or "reconfigure dev standards". Provides guidance for re-running detection, updating project configuration, and refreshing hooks.
---

# Update Project

Re-detect the project's tech stack, compare it against current configuration, and update rules, CLAUDE.md, and hooks to reflect the current state of the project.

## Step 1 -- Re-Detect Languages and Frameworks

Run the same detection logic as the setup-project command. Scan for:

- Languages: `package.json`, `tsconfig.json`, `*.csproj`, `*.sln`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `setup.py`, `requirements.txt`
- Frameworks: `next.config.*`, `angular.json`, `vite.config.*`, `nuxt.config.*`, `svelte.config.*`, `astro.config.*`, `remix.config.*`, `serverless.yml`, `cdk.json`, `Dockerfile`, `docker-compose*.yml`
- Test runners: `jest.config.*`, `vitest.config.*`, `pytest.ini`, `playwright.config.*`, `cypress.config.*`, `*_test.go`
- Linters: `.eslintrc*`, `eslint.config.*`, `.prettierrc*`, `biome.json`, `ruff.toml`, `.golangci.yml`
- Persistence: `prisma/`, `**/migrations/`, `drizzle.config.*`, `alembic/`, Entity Framework references
- MCP servers: `.claude/mcp.json` or project-level MCP configuration

Collect all findings into a detection summary.

## Step 2 -- Compare Against Current Configuration

Read the existing `.claude/rules/` directory and `.claude/CLAUDE.md`.

Build a comparison report:

```
Changes since last setup:

  New detections (no matching rule):
    + Python detected (pyproject.toml found) -- no .claude/rules/python.md
    + Playwright detected -- testing.md does not reference it

  Removed (rule exists but tech no longer detected):
    - .claude/rules/go.md exists but no go.mod found

  Unchanged:
    = TypeScript, Next.js, Vitest (all rules up to date)
```

Present this report to the user.

## Step 3 -- Ask What to Update

Present the available update operations and ask the user which to perform. Allow selecting multiple:

- **Add missing rules** for newly detected languages/frameworks
- **Remove stale rules** for technologies no longer in use
- **Update CLAUDE.md** project description and metadata
- **Add or remove MCP servers**
- **Refresh hooks** to match current plugin configuration
- **Skip** and finish without changes

Wait for the user's answer before proceeding.

## Step 4 -- Add Missing Rules

For each newly detected language or framework that lacks a corresponding rule:

1. Check if a template exists at `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/`
2. If a template exists, copy it to `.claude/rules/` with the generated-by comment header
3. If no template exists, ask the user what standards to encode and generate a new rule file
4. For new test runners or e2e frameworks, update `.claude/rules/testing.md` to reference them

After adding rules, show a summary of files created.

## Step 5 -- Remove Stale Rules

For each rule file whose corresponding technology is no longer detected:

1. Show the rule filename, description, and glob scope
2. Ask the user to confirm removal -- the technology might still be relevant even if auto-detection missed it
3. Delete confirmed files

After removing rules, show a summary of files deleted.

## Step 6 -- Update CLAUDE.md

Read the current `.claude/CLAUDE.md` file. Present its contents section by section and ask the user which parts to update:

### 6a -- Project Description

Show the current project description. Ask if it needs updating. If yes, ask for the new description and replace it.

### 6b -- Key Technologies

Show the current technology list. Update it based on the latest detection results. Ask the user to confirm the updated list.

### 6c -- Domain Concepts

Show the current domain concepts. Ask if new concepts should be added or existing ones removed.

### 6d -- Team Conventions

Show the current team conventions. Ask if conventions have changed or new ones should be added.

Write the updated `.claude/CLAUDE.md` file.

## Step 7 -- Add or Remove MCP Servers

Read the current MCP configuration (`.claude/mcp.json` if it exists).

### 7a -- Show Current Servers

List all currently configured MCP servers with their commands and descriptions.

### 7b -- Add a Server

If the user wants to add a server, ask for:

1. Server name (kebab-case identifier)
2. Command to run (e.g., `npx`, `uvx`, a local binary path)
3. Arguments (e.g., `["-y", "@package/name@latest", "mcp"]`)
4. Environment variables (if any)

Add the server to the MCP configuration file.

### 7c -- Remove a Server

If the user wants to remove a server, show the list and ask which to remove. Confirm before deleting.

## Step 8 -- Refresh Hooks

Read the current hook configuration from the dev-standards plugin.

Compare the installed hooks against the plugin's current hook definitions. If the plugin has been updated since setup, show the differences and offer to update.

If the user confirms, rewrite the hook configuration to match the latest plugin version.

## Step 9 -- Summary

Present a final summary of all changes made:

```
Project update complete:

  Rules added:    [list or "none"]
  Rules removed:  [list or "none"]
  CLAUDE.md:      [updated sections or "no changes"]
  MCP servers:    [changes or "no changes"]
  Hooks:          [refreshed or "no changes"]
```
