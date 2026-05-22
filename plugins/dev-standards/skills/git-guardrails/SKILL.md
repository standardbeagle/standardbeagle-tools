---
name: dev-standards-git-guardrails
description: "Set up a Claude Code PreToolUse hook that blocks destructive git commands (push, reset --hard, clean -f, branch -D, checkout .) before they run. Use when: prevent destructive git, add git safety hook, block git push/reset, git guardrails"
disable-model-invocation: true
---

# Git Guardrails

Set up a PreToolUse hook intercepting dangerous git commands before Claude executes them. The blocked list is a **default, not a mandate** — the user picks scope and edits the patterns.

## Default blocked patterns

`git push` (incl. `--force`), `git reset --hard`, `git clean -f` / `-fd`, `git branch -D`, `git checkout .` / `git restore .`. On a match the hook exits 2 and prints a BLOCKED message to stderr; Claude is told it lacks authority for that command.

## Steps

1. **Ask scope.** This project (`.claude/settings.json`) or all projects (`~/.claude/settings.json`)?
2. **Copy the hook script** from this skill's `scripts/block-dangerous-git.sh` to:
   - Project: `.claude/hooks/block-dangerous-git.sh`
   - Global: `~/.claude/hooks/block-dangerous-git.sh`
   Then `chmod +x` it.
3. **Register the hook** in the chosen settings file under `hooks.PreToolUse` with matcher `Bash` and the script path (project: `"$CLAUDE_PROJECT_DIR"/.claude/hooks/block-dangerous-git.sh`; global: `~/.claude/hooks/block-dangerous-git.sh`). Merge into any existing `PreToolUse` array — do not overwrite other hooks.
4. **Offer customization.** Ask whether to add or remove patterns; edit the copied script accordingly. This is the escape valve — keep it explicit.
5. **Verify:**
   ```bash
   echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
   ```
   Expect exit code 2 + a BLOCKED message on stderr.

> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Original: `skills/misc/git-guardrails-claude-code`.
