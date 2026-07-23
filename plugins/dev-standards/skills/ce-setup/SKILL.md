---
name: dev-standards-ce-setup
description: "Diagnose + configure compound-engineering env — CLI deps, plugin version, repo-local config. Guided install for missing tools, gitignore + config bootstrap. Use when: troubleshoot missing tools, verify CE setup, onboard repo, refresh config template, /ce-setup re-check. Skip: unrelated to compound-engineering tooling."
disable-model-invocation: true
---

# Compound Engineering Setup

## Interaction Method

Ask each question via Claude Code's `AskUserQuestion` (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded). On harnesses lacking a blocking question tool, fall back to numbered list in chat. Never silently skip or auto-configure. For multiSelect, accept comma-separated numbers (e.g. `1, 3`).

Interactive setup diagnoses environment health, cleans obsolete repo-local CE config, and helps configure required tools. Preventive review belongs to the active Worktrack workflow or a self-contained generic reviewer; project-specific review guidance belongs in `CLAUDE.md` or `AGENTS.md`.

## Phase 1: Diagnose

### Step 1: Determine Plugin Version

Read the compound-engineering plugin metadata (e.g., `plugin.json` from plugin root or cache). If found, pass to the check script via `--version`. Otherwise omit the flag.

### Step 2: Run the Health Check Script

Display: "Compound Engineering -- checking your environment..."

Run the bundled script. Do not perform manual dependency checks -- the script handles all CLI tools, agent skills, repo-local CE file checks, and `.gitignore` guidance in one pass.

```bash
bash scripts/check-health --version VERSION
```

Or without version:

```bash
bash scripts/check-health
```

Script reference: `scripts/check-health`

Display the script's output to the user.

### Step 3: Evaluate Results

**Plugin root (pre-resolved):** !`echo "${CLAUDE_PLUGIN_ROOT}"`

If the line above resolved to an absolute path (starts with `/`, no `${`), this is Claude Code and `/ce-update` is available. Empty, the literal `${CLAUDE_PLUGIN_ROOT}` token, or an unresolved `echo` command means non-Claude harness; omit `/ce-update` references.

After the report, check whether:

- any CLI tools are missing (yellow in Tools section)
- any agent skills are missing (yellow in Skills section)
- `compound-engineering.local.md` is present and needs cleanup
- `.compound-engineering/config.local.yaml` does not exist or is not gitignored
- `.compound-engineering/config.local.example.yaml` is missing or outdated

If everything is installed, no cleanup needed, and `.compound-engineering/config.local.yaml` exists and is gitignored, display the tool/skill list and completion message. Parse names from script output, list each with green circle. Omit Skills line if absent from script output:

```
 ✅ Compound Engineering setup complete

    Tools:  🟢 agent-browser  🟢 gh  🟢 jq  🟢 vhs  🟢 silicon  🟢 ffmpeg  🟢 ast-grep
    Skills: 🟢 ast-grep
    Config: ✅

    Run /ce-setup anytime to re-check.
```

If Claude Code session, append: "Run /ce-update to grab the latest plugin version."

Stop here.

Otherwise proceed to Phase 2. Handle repo-local cleanup (Step 4) first, then config bootstrapping (Step 5), then missing dependencies (Step 6).

## Phase 2: Fix

### Step 4: Resolve Repo-Local CE Issues

Resolve repo root (`git rev-parse --show-toplevel`). If `compound-engineering.local.md` exists at repo root, explain it is obsolete -- review-agent selection is automatic and CE now uses `.compound-engineering/config.local.yaml` for surviving machine-local state. Ask whether to delete. Use repo-root path when deleting.

### Step 5: Bootstrap Project Config

Resolve repo root (`git rev-parse --show-toplevel`). All paths below are relative to repo root, not cwd.

**Example file (always refresh):** Copy `references/config-template.yaml` to `<repo-root>/.compound-engineering/config.local.example.yaml`, creating the directory if needed. This file is committed and always overwritten with the latest template so teammates see available settings.

**Local config (create once):** If `.compound-engineering/config.local.yaml` does not exist, ask:

```
Set up a local config file for this project?
This saves your Compound Engineering preferences (like which tools to use and how workflows behave).
Everything starts commented out -- you only enable what you need.

1. Yes, create it (Recommended)
2. No thanks
```

If approved, copy `references/config-template.yaml` to `<repo-root>/.compound-engineering/config.local.yaml`. If not already covered by `.gitignore`, offer to add:

```text
.compound-engineering/*.local.yaml
```

If local config exists, check whether gitignored. If not, offer to add the entry above.

### Step 6: Offer Installation

Present missing tools and skills as a multiSelect with all items pre-selected. Use install commands and URLs from the script's diagnostic output. Group under `Tools:` and `Skills:`; omit a group whose items are all installed.

```
The following items are missing. Select which to install:
(All items are pre-selected)

Tools:
  [x] agent-browser - Browser automation for testing and screenshots
  [x] gh - GitHub CLI for issues and PRs
  [x] jq - JSON processor
  [x] vhs (charmbracelet/vhs) - Create GIFs from CLI output
  [x] silicon (Aloxaf/silicon) - Generate code screenshots
  [x] ffmpeg - Video processing for feature demos
  [x] ast-grep - Structural code search using AST patterns

Skills:
  [x] ast-grep - Agent skill for structural code search with ast-grep
```

Only show items that are missing. Omit installed ones.

### Step 7: Install Selected Dependencies

For each selected dependency, in order:

1. **Show the install command** (from diagnostic output) and ask for approval:

   ```
   Install agent-browser?
   Command: CI=true npm install -g agent-browser --no-audit --no-fund --loglevel=error && agent-browser install && npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser -g -y

   1. Run this command
   2. Skip - I'll install it manually
   ```

2. **If approved:** Run the install command via shell. After completion, verify:
   - For a CLI tool, run the dependency's check command (e.g., `command -v agent-browser`).
   - For an agent skill, prefer `npx --yes skills list --global --json | jq -r '.[].name' | grep -qx <skill-name>` when `npx` is available; otherwise fall back to checking that `~/.claude/skills/<skill-name>`, `~/.agents/skills/<skill-name>`, or `~/.codex/skills/<skill-name>` exists (file, directory, or symlink).

3. **If verification succeeds:** Report success.

4. **If verification fails or install errors:** Display the project URL as fallback and continue to the next dependency.

### Step 8: Summary

Display brief summary:

```
 ✅ Compound Engineering setup complete

    Installed: agent-browser, gh, jq
    Skipped:   rtk

    Run /ce-setup anytime to re-check.
```

If Claude Code session (per Step 3 detection), append: "Run /ce-update to grab the latest plugin version."
