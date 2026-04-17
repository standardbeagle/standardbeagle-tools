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
  # Frontmatter description is always inside the first ---…--- fence;
  # the `c==1` guard locks extraction to that block even if the body
  # contains a line that is literally `---`.
  desc=$(awk '/^---$/{c++; next} c==1 && /^description:/ {sub(/^description: */,""); print; exit}' "$file")
  if [[ -z "$desc" ]]; then
    continue # no description, fine (some rule files have no frontmatter)
  fi
  if ! rg -q '[A-Za-z]' <<<"$desc"; then
    echo "FAIL: $file description missing English"
    FAIL=1
  fi
  if ! rg -q '\p{Han}' <<<"$desc"; then
    echo "FAIL: $file description missing Wenyan (Han chars)"
    FAIL=1
  fi
done < <("$ROOT/scripts/wenyan/in-scope.sh" "$PLUGIN")

# Check 3: excluded files untouched since branch point.
echo "-- excluded-file integrity --"
if git rev-parse --verify --quiet main >/dev/null; then
  BASE=$(git merge-base HEAD main)
elif git rev-parse --verify --quiet origin/main >/dev/null; then
  BASE=$(git merge-base HEAD origin/main)
else
  echo "error: neither 'main' nor 'origin/main' is available locally" >&2
  exit 2
fi
changed=$(git diff --name-only "$BASE" HEAD -- \
     "plugins/$PLUGIN/README.md" \
     "plugins/$PLUGIN/CHANGELOG.md" \
     "plugins/$PLUGIN/CLAUDE.md" \
     "plugins/$PLUGIN/.claude-plugin/plugin.json" \
     "plugins/$PLUGIN/mcp.json" \
     "plugins/$PLUGIN/mcp.json.disabled" \
     "plugins/$PLUGIN/hooks/hooks.json" 2>/dev/null || true)
if [[ -n "$changed" ]]; then
  echo "FAIL: excluded files changed: $changed"
  FAIL=1
else
  echo "ok: excluded files untouched"
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
