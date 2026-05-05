#!/usr/bin/env bash
# phase-coalesce.sh — verify task-executor.md coalesces phase rotation to one DartQL UPDATE at completion.
set -uo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
file="${REPO_ROOT}/plugins/dartai/agents/task-executor.md"

# At most one literal mid-phase tag reference may remain (the section header may keep an example).
phase_writes=$(grep -cE 'loop-phase:(understanding|implementing|testing|review)' "$file" || true)
if [ "${phase_writes:-0}" -gt 1 ]; then
  echo "FAIL: $phase_writes mid-phase tag refs remain — expected ≤ 1 (coalesce)"
  exit 1
fi

# Completion path uses execute_dartql with loop-complete tag.
grep -q 'loop-complete' "$file" || { echo "FAIL: completion tag 'loop-complete' missing"; exit 1; }
grep -q 'execute_dartql' "$file" || { echo "FAIL: execute_dartql missing — completion path not migrated"; exit 1; }

# Failure path uses execute_dartql with loop-blocked tag.
grep -q 'loop-blocked' "$file" || { echo "FAIL: failure tag 'loop-blocked' missing"; exit 1; }

# Local phase tracking documented.
grep -q 'loop-state\.json' "$file" || { echo "FAIL: missing reference to loop-state.json local phase tracking"; exit 1; }

echo "PASS phase-coalesce"
