#!/usr/bin/env bash
# start-snapshot.sh — verify start.md integrates dartai_loop_snapshot for §2.5 assignee + §3 queue.
set -uo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
file="${REPO_ROOT}/plugins/dartai/commands/start.md"

# Snapshot tool referenced.
grep -q 'dartai_loop_snapshot' "$file" || { echo "FAIL: dartai_loop_snapshot not referenced anywhere"; exit 1; }

# §3 no longer calls batch_update_tasks for queue scan (Task 1 introduced it; Task 7 replaces with snapshot read).
section_3=$(awk '/^### 3\. Fetch Active Tasks/,/^### 4\. /' "$file")
if echo "$section_3" | grep -E 'tool_name:[[:space:]]*"batch_update_tasks"' >/dev/null; then
  echo "FAIL: §3 still calls batch_update_tasks — expects read from snapshot.queue"; exit 1
fi
if echo "$section_3" | grep -E 'tool_name:[[:space:]]*"list_tasks"' >/dev/null; then
  echo "FAIL: §3 still calls list_tasks"; exit 1
fi
echo "$section_3" | grep -q 'snapshot\.queue' || { echo "FAIL: §3 missing read from snapshot.queue"; exit 1; }
echo "$section_3" | grep -q '\.dartai-locks\.json' || { echo "FAIL: §3 claim filter against locks removed"; exit 1; }

# §2.5 step 3 reads snapshot.config.assignees instead of get_config(['assignees']).
section_2_5=$(awk '/^### 2\.5\. Resolve Runner Identity/,/^### 3\. Fetch Active Tasks/' "$file")
echo "$section_2_5" | grep -q 'snapshot\.config\.assignees' || { echo "FAIL: §2.5 missing read from snapshot.config.assignees"; exit 1; }

# §1 dartboard selection still allows get_config(['dartboards']) fallback.
section_1=$(awk '/^### 1\. Determine Target Dartboard/,/^### 1\.5/' "$file")
echo "$section_1" | grep -q 'get_config' || { echo "FAIL: §1 dartboard fallback get_config removed (must remain for uncached path)"; exit 1; }

echo "PASS start-snapshot"
