#!/usr/bin/env bash
# sync-dartql.sh — verify §4 of sync.md uses execute_dartql UPDATE for bulk updates.
set -uo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
file="${REPO_ROOT}/plugins/dartai/skills/sync/SKILL.md"

section_4=$(awk '/^### 4\. Apply Updates/,/^### 5\. /' "$file")

echo "$section_4" | grep -q 'execute_dartql' || { echo "FAIL: §4 missing execute_dartql"; exit 1; }
echo "$section_4" | grep -q 'UPDATE WHERE dart_id IN' || { echo "FAIL: §4 missing UPDATE WHERE dart_id IN statement"; exit 1; }
echo "$section_4" | grep -q 'COMMENT' || { echo "FAIL: §4 missing audit COMMENT clause"; exit 1; }
echo "$section_4" | grep -q 'dry_run.*true' || { echo "FAIL: §4 missing dry_run preview step"; exit 1; }
if echo "$section_4" | grep -E 'tool_name:\s*"batch_update_tasks"' >/dev/null; then
  echo "FAIL: §4 still calls batch_update_tasks for bulk update"; exit 1
fi
echo "$section_4" | grep -q 'update_task' || { echo "FAIL: §4 missing per-task update_task fallback for N≤2"; exit 1; }
echo "PASS sync-dartql"
