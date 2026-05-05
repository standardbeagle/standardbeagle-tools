#!/usr/bin/env bash
# queue-dartql.sh — verify §3 of start.md uses batch_update_tasks selector for queue scan.
set -uo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
file="${REPO_ROOT}/plugins/dartai/commands/start.md"

section_3=$(awk '/^### 3\. Fetch Active Tasks/,/^### 4\. /' "$file")

echo "$section_3" | grep -q 'batch_update_tasks' || { echo "FAIL: §3 missing batch_update_tasks"; exit 1; }
echo "$section_3" | grep -q 'dry_run' || { echo "FAIL: §3 missing dry_run flag"; exit 1; }
echo "$section_3" | grep -q 'selector' || { echo "FAIL: §3 missing selector key"; exit 1; }
if echo "$section_3" | grep -E 'tool_name:\s*"list_tasks"' >/dev/null; then
  echo "FAIL: §3 still calls list_tasks for queue scan"; exit 1
fi
echo "$section_3" | grep -q '\.dartai-locks\.json' || { echo "FAIL: claim filter against locks file removed"; exit 1; }
echo "PASS queue-dartql"
