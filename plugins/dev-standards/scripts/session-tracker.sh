#!/usr/bin/env bash
# session-tracker.sh — Lightweight session observation for dev-standards plugin.
# Tracks file edits during a session and produces a review summary at session end.
# NEVER auto-modifies — only suggests.

set -euo pipefail

SESSION_FILE="/tmp/dev-standards-session-${PPID}"
ARCH_FILE=".claude/rules/architecture.md"

# ── track mode ────────────────────────────────────────────────────────────────
# Append file path + timestamp to session file. Must finish under 1 second.
track_file() {
  local input="$1"
  # Extract file_path from JSON-ish tool input. Handles both
  # "file_path": "/some/path" and "file_path":"/some/path" forms.
  local filepath
  filepath=$(printf '%s' "$input" | grep -oP '"file_path"\s*:\s*"([^"]+)"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/') || true

  if [[ -z "$filepath" ]]; then
    # Fallback: try to grab the first thing that looks like a path
    filepath=$(printf '%s' "$input" | grep -oP '(?<=/)[a-zA-Z0-9_./-]+' | head -1) || true
  fi

  [[ -z "$filepath" ]] && exit 0

  # Determine if file existed before this write (heuristic: if session file
  # already has this path, it's a modification; otherwise treat as creation).
  local action="created"
  if [[ -f "$SESSION_FILE" ]] && grep -qF "$filepath" "$SESSION_FILE" 2>/dev/null; then
    action="modified"
  elif [[ -f "$filepath" ]]; then
    action="modified"
  fi

  printf '%s\t%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$action" "$filepath" >> "$SESSION_FILE"
  exit 0
}

# ── review mode ───────────────────────────────────────────────────────────────
# Analyze accumulated session data and print structured suggestions.
review_session() {
  if [[ ! -f "$SESSION_FILE" ]]; then
    echo "=== Dev Standards Session Review ==="
    echo "No file activity recorded this session."
    exit 0
  fi

  local total created modified
  total=$(wc -l < "$SESSION_FILE")
  created=$(grep -c $'\tcreated\t' "$SESSION_FILE" 2>/dev/null) || true
  created=${created:-0}
  modified=$(grep -c $'\tmodified\t' "$SESSION_FILE" 2>/dev/null) || true
  modified=${modified:-0}

  echo "=== Dev Standards Session Review ==="
  echo "Files touched: $total ($created created, $modified modified)"
  echo ""

  # ── Pattern detection ─────────────────────────────────────────────────────
  # Group files by directory, look for 3+ files in the same directory.
  echo "Patterns detected:"

  local has_pattern=false

  # Get immediate parent directory for each file (no nested counting)
  while IFS=$'\t' read -r count dir; do
    if [[ "$count" -ge 3 ]]; then
      has_pattern=true
      # List basenames of files in that exact directory
      local files
      files=$(awk -F'\t' -v d="$dir" '{
        # Get immediate parent of this file
        n = $3
        if (match(n, /.*\//)) {
          fdir = substr(n, 1, RLENGTH - 1)
        } else {
          fdir = "."
        }
        if (fdir == d) {
          sub(".*/" , "", n)
          print n
        }
      }' "$SESSION_FILE" | sort -u | head -6 | tr '\n' ',' | sed 's/,$//')
      echo "- ${count} files in ${dir}/: ${files}"

      # Check for similar extensions in that directory
      local ext_count
      ext_count=$(awk -F'\t' -v d="$dir" '{
        n = $3
        if (match(n, /.*\//)) {
          fdir = substr(n, 1, RLENGTH - 1)
        } else {
          fdir = "."
        }
        if (fdir == d) {
          p = split(n, parts, ".")
          if (p > 1) print parts[p]
        }
      }' "$SESSION_FILE" | sort | uniq -c | sort -rn | head -1)

      local dominant_num dominant_ext
      dominant_num=$(echo "$ext_count" | awk '{print $1}')
      dominant_ext=$(echo "$ext_count" | awk '{print $2}')

      if [[ "${dominant_num:-0}" -ge 3 ]]; then
        local dirname_base
        dirname_base=$(basename "$dir")
        echo "    -> Consider creating an \"add-${dirname_base}\" skill for .${dominant_ext} files"
      fi
    fi
  done < <(awk -F'\t' '{
    n = $3
    # Get immediate parent directory only
    if (match(n, /.*\//)) {
      dir = substr(n, 1, RLENGTH - 1)
    } else {
      dir = "."
    }
    print dir
  }' "$SESSION_FILE" | sort | uniq -c | sort -rn | awk '{print $1 "\t" $2}')

  if [[ "$has_pattern" == false ]]; then
    echo "- No repeated structural patterns detected"
  fi

  echo ""

  # ── Active migrations ─────────────────────────────────────────────────────
  echo "Active migrations:"
  if [[ -f "$ARCH_FILE" ]]; then
    local has_migration=false
    while IFS= read -r line; do
      has_migration=true
      # Strip leading whitespace and list marker
      line=$(echo "$line" | sed 's/^[[:space:]]*-*[[:space:]]*//')
      echo "- $line"
      echo "    -> Check if migration is complete"
    done < <(grep -iE '^\s*-?\s*REPLACING:' "$ARCH_FILE" 2>/dev/null || true)

    if [[ "$has_migration" == false ]]; then
      echo "- No active migrations found in $ARCH_FILE"
    fi
  else
    echo "- No $ARCH_FILE found (run /setup-project to create one)"
  fi

  echo ""

  # ── Suggestions ───────────────────────────────────────────────────────────
  echo "Suggestions:"

  local suggestion_count=0

  # Suggest skills for repeated directory patterns
  if [[ "$has_pattern" == true ]]; then
    echo "- Review detected patterns above; repeated file creation in the same directory often indicates a missing skill template"
    suggestion_count=$((suggestion_count + 1))
  fi

  # Check for test file ratio
  local test_files non_test_files
  test_files=$(grep -cE '\.(test|spec|_test)\.' "$SESSION_FILE" 2>/dev/null) || true
  test_files=${test_files:-0}
  non_test_files=$((total - test_files))
  if [[ "$non_test_files" -gt 0 && "$test_files" -eq 0 ]]; then
    echo "- No test files were created or modified this session; consider adding tests"
    suggestion_count=$((suggestion_count + 1))
  fi

  # Check for config file changes
  local config_changes
  config_changes=$(grep -cE '(\.json|\.ya?ml|\.toml|\.kdl|\.env)' "$SESSION_FILE" 2>/dev/null) || true
  config_changes=${config_changes:-0}
  if [[ "$config_changes" -gt 2 ]]; then
    echo "- Multiple config files modified ($config_changes); verify consistency across configuration"
    suggestion_count=$((suggestion_count + 1))
  fi

  if [[ "$suggestion_count" -eq 0 ]]; then
    echo "- No additional suggestions"
  fi

  # Clean up session file
  rm -f "$SESSION_FILE"
}

# ── Main dispatch ─────────────────────────────────────────────────────────────
case "${1:-}" in
  track)
    track_file "${2:-}"
    ;;
  review)
    review_session
    ;;
  *)
    echo "Usage: session-tracker.sh {track|review}" >&2
    exit 1
    ;;
esac
