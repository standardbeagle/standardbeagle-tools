# Wenyan Internal Docs + Bilingual Descriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite 279 internal plugin `.md` files across 15 plugins so that body prose is Classical Chinese (Wenyan "full"), `description:` frontmatter is bilingual (English triggers + Wenyan summary + explicit `Use when:` list), and cross-skill references use explicit `Skill`-tool invocations with fully-qualified `plugin:skill` namespaces.

**Architecture:** Per-plugin Sonnet translator subagent dispatched with a strict transformation prompt that embeds the content carve-out rules from the spec. The main orchestrator runs a pre-translation inventory, the translator subagent writes modifications directly, then the orchestrator runs automated + sampled validation, and commits one plugin per commit. The `workflow` plugin is the pilot; a validation gate after the pilot decides whether to proceed. All work happens on branch `feat/wenyan-internal-docs`.

**Tech Stack:** bash, git, ripgrep (`rg`), Claude Code `Agent` tool with `subagent_type: general-purpose` running Sonnet, plain `.md` edits.

**Spec:** `docs/superpowers/specs/2026-04-16-wenyan-internal-docs-design.md`

---

## File Structure

### Files created by this plan

| File | Responsibility |
|---|---|
| `scripts/wenyan/in-scope.sh` | Enumerate in-scope `.md` files for a given plugin (or all). Single source of truth for scope filtering. |
| `scripts/wenyan/validate-plugin.sh` | Run post-translation validation: soft-reference grep, bilingual-description grep, excluded-file untouched check. Exit nonzero on any failure. |
| `scripts/wenyan/translator-prompt.md` | Canonical transformer prompt loaded by the orchestrator and embedded in every Sonnet subagent dispatch. Contains carve-out rules and before/after examples. |
| `docs/superpowers/plans/2026-04-16-wenyan-internal-docs.md` | This plan. |

### Files modified by this plan

- 279 `.md` files under `plugins/<plugin>/{skills,agents,commands,rules}/` (exact count per plugin listed in §Rollout Order).
- `docs/superpowers/specs/2026-04-16-wenyan-internal-docs-design.md` — appended "Completion notes" section at end of rollout.

### Files untouched by this plan

Everything else, explicitly: all `README.md`, `CHANGELOG.md`, `CLAUDE.md`, `.json` manifests, hook scripts under `plugins/*/scripts/`, anything under `plugins/*/assets/templates/`, and anything outside `plugins/`.

---

## Rollout Order

Per spec §5. Pilot is `workflow` (17 files). Remaining 14 plugins alphabetically:

| # | Plugin | In-scope files |
|---|---|---|
| 1 (pilot) | `workflow` | 17 |
| 2 | `agnt` | 41 |
| 3 | `dart-query` | 10 |
| 4 | `dartai` | 31 |
| 5 | `dev-standards` | 8 |
| 6 | `figma-query` | 35 |
| 7 | `lci` | 19 |
| 8 | `mcp-architect` | 13 |
| 9 | `mcp-tester` | 12 |
| 10 | `photino` | 14 |
| 11 | `prompt-engineer` | 20 |
| 12 | `slop-coder` | 7 |
| 13 | `slop-mcp` | 15 |
| 14 | `ux-design` | 14 |
| 15 | `ux-developer` | 23 |
| **Total** | | **279** |

Spot-check of trigger matching happens after pilot (task set 2) and after every third rollout plugin (after plugins 4, 7, 10, 13).

---

## Resolved Open Questions from Spec §8

- **Translator mechanism:** Sonnet subagent (`Agent` tool, `subagent_type: general-purpose`, model override Sonnet). Rationale: 279 files make Opus-by-hand token-prohibitive; Haiku fails reliably on technical prose transformation with mixed code fences; Sonnet balances cost with fidelity; a pure regex pipeline cannot do Chinese translation.
- **`allowed-tools` cleanup:** Deferred to a separate refactor (tracked in user memory `feedback_no_allowed_tools_skills.md`). This plan touches prose and description lines only; it does not add, remove, or change any other frontmatter key.

---

## Phase 0: Tooling

### Task 0.1: Write in-scope enumerator script

**Files:**
- Create: `scripts/wenyan/in-scope.sh`

- [ ] **Step 1: Create the script**

```bash
#!/usr/bin/env bash
# Usage: in-scope.sh [<plugin-name>]
# Prints absolute paths of all in-scope .md files. If plugin-name given,
# restricts to that plugin.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
PLUGIN="${1:-}"

BASE="$ROOT/plugins"
if [[ -n "$PLUGIN" ]]; then
  BASE="$ROOT/plugins/$PLUGIN"
fi

find "$BASE" -type f -name "*.md" \
  \( -path "*/skills/*" -o -path "*/agents/*" \
     -o -path "*/commands/*" -o -path "*/rules/*" \) \
  ! -path "*/assets/*" \
  ! -name "README.md" ! -name "CHANGELOG.md" ! -name "CLAUDE.md"
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x scripts/wenyan/in-scope.sh`

- [ ] **Step 3: Verify it matches the baseline count**

Run: `scripts/wenyan/in-scope.sh | wc -l`
Expected: `279` (estimate from 2026-04-16). If the count differs, treat the script as authoritative and update the per-plugin table in §Rollout Order. Do not treat a mismatch as a hard failure.

Run: `scripts/wenyan/in-scope.sh workflow | wc -l`
Expected: `17`

- [ ] **Step 4: Commit**

```bash
git add scripts/wenyan/in-scope.sh
git commit -m "tooling(wenyan): add in-scope file enumerator"
```

---

### Task 0.2: Write validation script

**Files:**
- Create: `scripts/wenyan/validate-plugin.sh`

- [ ] **Step 1: Create the script**

```bash
#!/usr/bin/env bash
# Usage: validate-plugin.sh <plugin-name>
# Runs post-translation validation. Exits nonzero on any failure.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
PLUGIN="${1:?usage: validate-plugin.sh <plugin-name>}"
FAIL=0

cd "$ROOT"

echo "== validating $PLUGIN =="

# Check 1: soft-reference English prose has been upgraded to Skill-tool calls.
# Character class [a-z-] assumes plugin/skill names are lowercase-kebab (true
# today). If a future plugin or skill uses uppercase or digits, extend the
# class to [A-Za-z0-9-] before running.
echo "-- soft-reference grep --"
if rg -n -i '(see the [a-z-]+ skill|use the [a-z-]+ skill|invoke the [a-z-]+ skill|via the [a-z-]+ skill)' \
      "plugins/$PLUGIN" --glob '*.md' ; then
  echo "FAIL: soft-reference phrasing found"
  FAIL=1
fi

# Check 2: every in-scope file has a bilingual description line containing
# both at least one ASCII letter cluster and at least one CJK character in
# its description: frontmatter value.
#
# Limitation: this extraction reads the first line after `description:` only.
# If a description uses YAML folded-scalar form (`description: >` spanning
# multiple lines), the executor must either inline-collapse that description
# to a single line before validation, or widen the awk block to consume the
# folded scalar. Single-line descriptions (the default per spec §2) are the
# common case and pass this check correctly.
echo "-- bilingual description check --"
while IFS= read -r file; do
  # extract description line from YAML frontmatter (first block delimited by ---)
  desc=$(awk '/^---$/{c++; next} c==1 && /^description:/ {sub(/^description: */,""); print; exit}' "$file")
  if [[ -z "$desc" ]]; then
    continue # no description, fine (some rule files have no frontmatter)
  fi
  if ! echo "$desc" | grep -q '[A-Za-z]'; then
    echo "FAIL: $file description missing English"
    FAIL=1
  fi
  if ! echo "$desc" | rg -q '\p{Han}'; then
    echo "FAIL: $file description missing Wenyan (Han chars)"
    FAIL=1
  fi
done < <(scripts/wenyan/in-scope.sh "$PLUGIN")

# Check 3: excluded files untouched since branch point.
echo "-- excluded-file integrity --"
BASE=$(git merge-base HEAD main)
if ! git diff --name-only "$BASE" HEAD -- \
     "plugins/$PLUGIN/README.md" \
     "plugins/$PLUGIN/CHANGELOG.md" \
     "plugins/$PLUGIN/CLAUDE.md" \
     "plugins/$PLUGIN/.claude-plugin/plugin.json" \
     "plugins/$PLUGIN/mcp.json" \
     "plugins/$PLUGIN/mcp.json.disabled" \
     "plugins/$PLUGIN/hooks/hooks.json" 2>/dev/null | grep -q . ; then
  echo "ok: excluded files untouched"
else
  # present-and-changed == failure; absent-from-diff is fine
  changed=$(git diff --name-only "$BASE" HEAD -- \
     "plugins/$PLUGIN/README.md" \
     "plugins/$PLUGIN/CHANGELOG.md" \
     "plugins/$PLUGIN/CLAUDE.md" \
     "plugins/$PLUGIN/.claude-plugin/plugin.json" \
     "plugins/$PLUGIN/mcp.json" \
     "plugins/$PLUGIN/mcp.json.disabled" \
     "plugins/$PLUGIN/hooks/hooks.json" 2>/dev/null)
  if [[ -n "$changed" ]]; then
    echo "FAIL: excluded files changed: $changed"
    FAIL=1
  fi
fi

# Check 4: assets/templates under this plugin untouched.
echo "-- assets/templates integrity --"
assets_changed=$(git diff --name-only "$BASE" HEAD -- "plugins/$PLUGIN/assets/templates" 2>/dev/null || true)
if [[ -n "$assets_changed" ]]; then
  echo "FAIL: assets/templates changed: $assets_changed"
  FAIL=1
fi

if [[ $FAIL -ne 0 ]]; then
  echo ""
  echo "VALIDATION FAILED for $PLUGIN"
  exit 1
fi
echo ""
echo "VALIDATION PASSED for $PLUGIN"
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x scripts/wenyan/validate-plugin.sh`

- [ ] **Step 3: Verify it runs against an unchanged plugin and reports clean excluded-files + soft-reference**

The bilingual-description check will fail for unchanged plugins (no Wenyan yet). That is expected — it is a post-translation check. Run it against `workflow` before any translation to confirm the check correctly *fails* and stop on the expected failure mode:

Run: `scripts/wenyan/validate-plugin.sh workflow || echo "expected-failure exit=$?"`
Expected output ends with: `expected-failure exit=1` and the failure message references "description missing Wenyan (Han chars)".

- [ ] **Step 4: Commit**

```bash
git add scripts/wenyan/validate-plugin.sh
git commit -m "tooling(wenyan): add post-translation validation script"
```

---

### Task 0.3: Write translator-prompt.md

**Files:**
- Create: `scripts/wenyan/translator-prompt.md`

- [ ] **Step 1: Create the prompt**

```markdown
# Wenyan Translator Subagent Prompt

You are a content-preserving translator. Rewrite Markdown files in place: body
prose becomes Classical Chinese (文言文) at "full" intensity; `description:`
frontmatter values become bilingual; cross-skill references become explicit
`Skill`-tool invocations. You make no other changes.

## Non-negotiable invariants

You MUST preserve, byte-for-byte, all of the following:

- Fenced code blocks (```lang … ``` and ~~~ … ~~~).
- Inline code spans (single or double backticks).
- URLs, file paths, CLI commands, CLI flag names, env var names.
- YAML frontmatter keys and all frontmatter values EXCEPT the
  `description:` value.
- Table cells that contain identifiers, tool names, flags, or paths.
- Quoted error messages and quoted tool output.
- Markdown headings whose text is, or contains, a literal tool name,
  command name, or file path.
- Security warnings, destructive-action notices, irreversible-op call-outs
  (these stay in English for safety).

If in doubt about whether a token is an identifier, preserve it unchanged.

## Transformations

### 1. Body prose → Wenyan "full"

Rewrite paragraphs, prose list items, and prose headings (headings that are
not identifiers) into Classical Chinese "full" intensity. Drop particles,
auxiliaries, and function words. Use classical single-character equivalents
where unambiguous. Keep the original markdown structure, bullet order, and
heading hierarchy.

### 2. `description:` → bilingual

Rewrite the `description:` frontmatter value as:

```
<English trigger phrases + concise summary>. <文言 summary>. Use when: <trigger-one>, <trigger-two>, <trigger-three>
```

Rules:
- English half first (it dominates English trigger matching).
- Wenyan half no longer than the English half.
- `Use when:` clause enumerates 3–6 concrete English phrases a user might
  type, comma-separated.
- Single YAML line unless > 300 chars, then use YAML `>` folded scalar.

Before:
```yaml
description: Use when debugging browser issues using agnt proxy diagnostics
```
After:
```yaml
description: Debug browser issues via agnt proxy — DOM, console, network, layout inspection. 覗瀏覽器諸患，藉agnt proxy以察DOM、控臺、網路、版面. Use when: debug browser bug, check DOM, inspect network request, check console errors, diagnose layout issue
```

### 3. Cross-skill references → explicit `Skill` invocation

Any prose of the form "see the X skill", "use X skill", "invoke X skill",
"via the X skill" becomes:

> Invoke the `Skill` tool with `skill: <plugin>:<skill-name>` — <purpose in Wenyan>.

Rules:
- Always fully qualify `<plugin>:<skill-name>`, even when referencing a
  skill in the same plugin.
- "Skill" tool name and the `skill:` argument key stay in English verbatim.
- Same rule for agent references: `Agent` tool with `subagent_type:
  <plugin>:<agent-name>`.

## Scope of this dispatch

You are given exactly one plugin directory. You modify every `.md` file
matching the in-scope filter (provided by the orchestrator as a list). You
do not touch any other file.

## Output contract

For each file you modify:
1. Overwrite the file with the transformed content.
2. Return a short summary: `<relative-path>: <brief note>`.
3. If a file contained content you could not safely transform (e.g., already
   Wenyan, or ambiguous identifier collision), skip it and report:
   `<relative-path>: skipped — <reason>`.

Never delete files. Never create files. Never modify frontmatter keys other
than rewriting the value of `description:`.
```

- [ ] **Step 2: Commit**

```bash
git add scripts/wenyan/translator-prompt.md
git commit -m "tooling(wenyan): add canonical translator subagent prompt"
```

---

## Phase 1: Pilot — `workflow` plugin

### Task 1.1: Capture pre-pilot baseline

**Files:**
- No files changed. Read-only inventory.

- [ ] **Step 1: List in-scope files**

Run: `scripts/wenyan/in-scope.sh workflow`
Expected: 17 lines, all under `plugins/workflow/{skills,agents,commands,rules}/`.

- [ ] **Step 2: Confirm validator-pre-state exits nonzero with the expected reason**

Run: `scripts/wenyan/validate-plugin.sh workflow ; echo exit=$?`
Expected: output ends with `exit=1` and the failure reason references "description missing Wenyan (Han chars)". If any other failure appears (soft-reference, excluded-file, assets change), investigate before proceeding.

- [ ] **Step 3: Record baseline commit sha for rollback**

Run: `git rev-parse HEAD`
Write the sha to the clipboard/notes. You will `git reset --hard <sha>` if the pilot fails validation and cannot be repaired.

---

### Task 1.2: Dispatch Sonnet translator on `workflow`

**Files:**
- Modify: 17 files under `plugins/workflow/{skills,agents,commands,rules}/`.

- [ ] **Step 1: Collect the file list**

Run: `scripts/wenyan/in-scope.sh workflow > /tmp/wenyan-workflow-files.txt && cat /tmp/wenyan-workflow-files.txt`
Verify every listed path is expected.

- [ ] **Step 2: Dispatch the translator subagent**

Using the `Agent` tool (`subagent_type: general-purpose`), dispatch a single Sonnet-model subagent with a prompt that is the concatenation of:

1. The full contents of `scripts/wenyan/translator-prompt.md`.
2. A dispatch-specific footer:

```
## Dispatch

Plugin: workflow
Files to transform (absolute paths, exactly these — no others):
<paste contents of /tmp/wenyan-workflow-files.txt>

After you finish, respond with a per-file summary. Do not ask for
confirmation; write the modifications directly using the Edit tool.
```

Expected: subagent returns a summary listing 17 entries, each with a brief note or "skipped — <reason>".

- [ ] **Step 3: Inspect returned summary**

Read the summary. For every "skipped" entry, read the file and decide whether the skip reason is legitimate (already Wenyan, or content fully carved-out). If not legitimate, re-dispatch with a targeted note for that specific file.

- [ ] **Step 4: Verify diff scope**

Run: `git diff --name-only | sort`
Expected: only paths listed in `/tmp/wenyan-workflow-files.txt`. If any unexpected path appears, `git checkout -- <path>` to revert it and re-dispatch with a correction note.

---

### Task 1.3: Spot-check translator output

**Files:**
- No files changed. Read-only review.

- [ ] **Step 1: Pick 3 files at random**

Run: `scripts/wenyan/in-scope.sh workflow | shuf -n 3`
Read each of the 3 files.

- [ ] **Step 2: Verify each file against checklist**

For each file, confirm:

- Code blocks unchanged (byte-identical to pre-pilot `git show HEAD~:<path>`).
- All URLs, file paths, CLI commands unchanged.
- `description:` value is bilingual with an English half, a Wenyan half, and a `Use when:` clause.
- Body narrative prose is Wenyan.
- No soft-reference phrasing remains.

Run for each file: `diff <(git show HEAD~:<path>) <(cat <path>)` and scan only for code-block / identifier regressions.

- [ ] **Step 3: If any check fails, fix inline**

Use the `Edit` tool to fix the specific regressions. Do not re-dispatch the whole plugin for isolated fixes.

---

### Task 1.4: Upgrade residual cross-references

**Files:**
- Modify: subset of the 17 pilot files.

- [ ] **Step 1: Search for residual soft references**

Run: `rg -n -i '(see the [a-z-]+ skill|use the [a-z-]+ skill|invoke the [a-z-]+ skill|via the [a-z-]+ skill)' plugins/workflow --glob '*.md'`

- [ ] **Step 2: Rewrite each match to explicit `Skill`-tool invocation per spec §4**

Pattern:
> Invoke the `Skill` tool with `skill: <plugin>:<skill-name>` — <purpose in Wenyan>.

Use the `Edit` tool per match. Keep the surrounding Wenyan prose context.

- [ ] **Step 3: Re-run the grep**

Run: `rg -n -i '(see the [a-z-]+ skill|use the [a-z-]+ skill|invoke the [a-z-]+ skill|via the [a-z-]+ skill)' plugins/workflow --glob '*.md'`
Expected: zero matches.

---

### Task 1.5: Run validation script

**Files:**
- No files changed.

- [ ] **Step 1: Run validator**

Run: `scripts/wenyan/validate-plugin.sh workflow`
Expected: final line `VALIDATION PASSED for workflow`, exit 0.

- [ ] **Step 2: If FAIL, fix and re-run**

Read the failure lines, fix using `Edit`, re-run the validator. Do not proceed until it passes.

---

### Task 1.6: Pilot smoke test — trigger matching

**Files:**
- No files changed. Runtime verification.

- [ ] **Step 1: Pick three skills from the pilot**

Run: `ls plugins/workflow/skills/`
Pick three skill filenames. Read the `description:` of each and note two English trigger phrases you expect to match.

- [ ] **Step 2: Manually verify trigger matching**

**This step is human-gated.** If the executor is running unattended, pause here and surface to the user: the fresh-session trigger match cannot be self-verified from inside the orchestrator session. The user runs the check in a new Claude Code session.

In a fresh Claude Code session in this repo, type each trigger phrase as if asking Claude for help. Confirm Claude offers the correct skill (the one whose description contains the phrase). All three must succeed.

If any fails, the bilingual-description approach regressed matching. Follow the fallback plan:

1. `git reset --hard <baseline sha from task 1.1>`.
2. Re-present to the user: propose English-only descriptions, Wenyan bodies only.

- [ ] **Step 3: Verify command invocation by slash path**

Type `/workflow:setup-workflow` or any other `workflow` command. Expected: the command runs its rewritten body. Commands match by filename, so this must work regardless of description content.

---

### Task 1.7: Commit the pilot

**Files:**
- Commit only. No further changes.

- [ ] **Step 1: Review diff scope one last time**

Run: `git status` and `git diff --stat`
Confirm only `plugins/workflow/{skills,agents,commands,rules}/` paths appear.

- [ ] **Step 2: Commit**

```bash
git add plugins/workflow
git commit -m "$(cat <<'EOF'
refactor(workflow): wenyan body prose + bilingual descriptions

Rewrites narrative prose in skills/agents/commands/rules into Classical
Chinese (Wenyan "full"). Keeps descriptions bilingual with explicit
English trigger phrases for fuzzy match. Upgrades cross-skill references
to the explicit Skill-tool invocation pattern with fully-qualified
plugin:skill namespaces. Code, identifiers, URLs, paths, and JSON
manifests unchanged.

Pilot plugin; validated with scripts/wenyan/validate-plugin.sh.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2: Rollout — remaining 14 plugins

For each plugin in the rollout order (§Rollout Order, #2 through #15), repeat the per-plugin task set below. Each plugin produces exactly one commit.

### Per-plugin task template (applied 14 times)

- [ ] **Step 1: Inventory**

Run: `scripts/wenyan/in-scope.sh <plugin>`
Confirm the count matches the §Rollout Order table for that plugin.

- [ ] **Step 2: Dispatch Sonnet translator**

Same pattern as Task 1.2, substituting the plugin name and file list. Prompt is `scripts/wenyan/translator-prompt.md` + dispatch footer.

- [ ] **Step 3: Verify diff scope**

Run: `git diff --name-only | sort`
Confirm only paths under `plugins/<plugin>/` appear.

- [ ] **Step 4: Upgrade residual cross-references**

Same grep + Edit pattern as Task 1.4, scoped to this plugin.

- [ ] **Step 5: Run validator**

Run: `scripts/wenyan/validate-plugin.sh <plugin>`
Must pass before committing.

- [ ] **Step 6: Spot-check 3 random files**

Same as Task 1.3, scoped to this plugin.

- [ ] **Step 7: Commit**

```bash
git add plugins/<plugin>
git commit -m "refactor(<plugin>): wenyan body prose + bilingual descriptions"
```

### Per-plugin checkboxes (one per plugin)

- [ ] **Plugin 2: `agnt` (41 files)** — run template above
- [ ] **Plugin 3: `dart-query` (10 files)** — run template above
- [ ] **Plugin 4: `dartai` (31 files)** — run template above
- [ ] **Spot-check trigger matching after plugin 4** — **human-gated**; pause unattended runs. Pick one skill each from `agnt`, `dart-query`, `dartai`; verify fuzzy trigger matching in a fresh Claude Code session. On regression, halt rollout and surface to user.
- [ ] **Plugin 5: `dev-standards` (8 files)** — run template above
- [ ] **Plugin 6: `figma-query` (35 files)** — run template above
- [ ] **Plugin 7: `lci` (19 files)** — run template above
- [ ] **Spot-check trigger matching after plugin 7** — **human-gated**; pause unattended runs. Pick one skill from `dev-standards`/`figma-query`/`lci`; verify fuzzy trigger matching in a fresh Claude Code session.
- [ ] **Plugin 8: `mcp-architect` (13 files)** — run template above
- [ ] **Plugin 9: `mcp-tester` (12 files)** — run template above
- [ ] **Plugin 10: `photino` (14 files)** — run template above
- [ ] **Spot-check trigger matching after plugin 10** — **human-gated**; pause unattended runs. Pick one skill from the last three plugins; verify fuzzy trigger matching in a fresh Claude Code session.
- [ ] **Plugin 11: `prompt-engineer` (20 files)** — run template above
- [ ] **Plugin 12: `slop-coder` (7 files)** — run template above
- [ ] **Plugin 13: `slop-mcp` (15 files)** — run template above
- [ ] **Spot-check trigger matching after plugin 13** — **human-gated**; pause unattended runs. Pick one skill from the last three plugins; verify fuzzy trigger matching in a fresh Claude Code session.
- [ ] **Plugin 14: `ux-design` (14 files)** — run template above
- [ ] **Plugin 15: `ux-developer` (23 files)** — run template above

---

## Phase 3: Final validation and PR

### Task 3.1: Full-repo soft-reference grep

**Files:**
- No files changed.

- [ ] **Step 1: Run the grep across all plugins**

Run: `rg -n -i '(see the [a-z-]+ skill|use the [a-z-]+ skill|invoke the [a-z-]+ skill|via the [a-z-]+ skill)' plugins --glob '*.md' --glob '!README.md' --glob '!CHANGELOG.md' --glob '!CLAUDE.md' --glob '!**/assets/**'`
Expected: zero matches.

- [ ] **Step 2: If any match appears, fix inline and commit amendment**

Use `Edit`. Commit as `fix(<plugin>): upgrade residual cross-reference`.

---

### Task 3.2: Per-plugin validator sweep

**Files:**
- No files changed.

- [ ] **Step 1: Run validator for every plugin**

```bash
for p in agnt dart-query dartai dev-standards figma-query lci mcp-architect mcp-tester photino prompt-engineer slop-coder slop-mcp ux-design ux-developer workflow; do
  scripts/wenyan/validate-plugin.sh "$p" || echo "FAIL: $p"
done
```

Expected: every plugin reports `VALIDATION PASSED`.

- [ ] **Step 2: Any FAIL gets fixed and re-validated before PR**

---

### Task 3.3: 10-file random manual sample across plugins

**Files:**
- No files changed.

- [ ] **Step 1: Sample**

Run: `scripts/wenyan/in-scope.sh | shuf -n 10`
Read each file end-to-end.

- [ ] **Step 2: Verify each file**

For each, confirm:
- Bilingual description with `Use when:` clause.
- Body is predominantly Wenyan, not English paragraphs.
- Code, URLs, paths, identifiers unchanged.
- Any cross-skill reference uses explicit `Skill` invocation with fully-qualified name.

- [ ] **Step 3: Any defect gets fixed inline and committed as `fix(<plugin>): <note>`**

---

### Task 3.4: Append completion notes to spec

**Files:**
- Modify: `docs/superpowers/specs/2026-04-16-wenyan-internal-docs-design.md`

- [ ] **Step 1: Append a "Completion notes" section**

Append at end of spec:

```markdown

## Completion notes

- Rollout completed on YYYY-MM-DD.
- Per-plugin file counts transformed: <fill from §Rollout Order>.
- Deviations from plan: <list or "none">.
- Known follow-ups: `allowed-tools` frontmatter cleanup (separate refactor).
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-04-16-wenyan-internal-docs-design.md
git commit -m "docs(spec): add wenyan rollout completion notes"
```

---

### Task 3.5: Open PR to main

**Files:**
- No files changed.

- [ ] **Step 1: Push branch**

Run: `git push -u origin feat/wenyan-internal-docs`

- [ ] **Step 2: Open PR**

```bash
gh pr create --title "refactor: wenyan internal docs + bilingual skill descriptions" --body "$(cat <<'EOF'
## Summary
- Rewrites 279 internal plugin .md files across 15 plugins into Classical Chinese ("Wenyan full") body prose while keeping skill/agent/command `description:` frontmatter bilingual (English triggers + Wenyan summary + explicit `Use when:` clause) for fuzzy trigger matching.
- Upgrades all cross-skill references to the explicit `Skill`-tool invocation pattern with fully-qualified `plugin:skill` namespaces, per current Claude Code practice.
- Adds `scripts/wenyan/` tooling (in-scope enumerator, validator, canonical translator prompt).

Spec: `docs/superpowers/specs/2026-04-16-wenyan-internal-docs-design.md`
Plan: `docs/superpowers/plans/2026-04-16-wenyan-internal-docs.md`

## Test plan
- [ ] `scripts/wenyan/validate-plugin.sh` passes for every plugin
- [ ] Full-repo soft-reference grep returns zero matches
- [ ] 10-file random manual sample reviewed
- [ ] Trigger matching manually verified for one skill per rollout checkpoint

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Record PR URL in completion notes and amend spec commit if desired**

---

## Rollback Plan

At any failure point before the PR merges:

- **Pilot failure (Task 1.6 trigger regression):** `git reset --hard <baseline sha from Task 1.1>`; present fallback (English-only descriptions, Wenyan bodies only) to user; do not proceed without explicit reapproval.
- **Per-plugin validator failure that cannot be fixed inline:** Run `git log -1` first to confirm the top commit is the plugin commit you intend to drop (not an unrelated later commit if the validator was run out of order). Then `git reset --hard HEAD~1` to drop the plugin's commit; investigate; re-dispatch with a corrective note.
- **Full branch abandonment:** `git checkout main && git branch -D feat/wenyan-internal-docs` (destructive; only with user approval).

---

## Notes for the Executor

- **No code behaviour changes.** This is a prose refactor. If any `.json` manifest, hook script, or `*.original.md` shows up in a diff, stop and investigate.
- **One commit per plugin.** Do not combine plugins in a single commit. This preserves reviewability and localises rollback.
- **Sonnet, not Opus, for translation.** The orchestrator (you) is Opus; the translator subagent is Sonnet. Do not run translation inline in the orchestrator session.
- **Diff scope discipline.** After every translator dispatch, verify with `git diff --name-only` before doing any further edit. Unexpected paths get reverted immediately.
- **Security-sensitive prose stays English.** If a paragraph is a destructive-operation warning or irreversible-action notice, the translator prompt instructs it to stay in English. Spot-check these during Task 1.3 and Task 3.3.
