#!/usr/bin/env bash
# Usage: in-scope.sh [<plugin-name>]
# Prints absolute paths of all in-scope .md files. If plugin-name given,
# restricts to that plugin.
# Must be run inside a git checkout (uses `git rev-parse --show-toplevel`).
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
PLUGIN="${1:-}"

BASE="$ROOT/plugins"
if [[ -n "$PLUGIN" ]]; then
  BASE="$ROOT/plugins/$PLUGIN"
fi

if [[ ! -d "$BASE" ]]; then
  echo "error: $BASE does not exist" >&2
  exit 1
fi

find "$BASE" -type f \( \
    -name "*.md" \
    \( -path "*/skills/*" -o -path "*/agents/*" \
       -o -path "*/commands/*" -o -path "*/rules/*" \) \
    ! -path "*/assets/*" \
    ! -name "README.md" ! -name "CHANGELOG.md" ! -name "CLAUDE.md" \
  \) -print
