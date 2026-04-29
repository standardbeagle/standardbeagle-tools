#!/usr/bin/env bash
# branches.sh — claude -p enumerates decision branches in /dartai:start
# Verifies the model can identify all major control-flow forks.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "${REPO_ROOT}/tests/lib/claude-probe.sh"

SKILL_PATH="${REPO_ROOT}/plugins/dartai/commands/start.md"

PROMPT=$(cat <<EOF
Read the file at $SKILL_PATH (the /dartai:start skill body) and enumerate every
decision branch in the loop driver. A "branch" is any if/else/switch/try-fail
fork that changes which code path runs.

Emit ONLY a JSON object — no prose before or after — with this schema:

{
  "branches": [
    {
      "section": "1.5",
      "trigger": "previous loop interrupted",
      "paths": ["resume", "start fresh"]
    }
  ],
  "total_count": <int>,
  "expected_min": 8
}

Required: include branches at sections 1, 1.5, 2.5, 3, 5.1, 5.1.5 (claim conflict),
5.3 (Agent dispatch try/fail), 5.6 (success/failure handling). total_count must be
>= expected_min.

Do not execute any tools beyond Read/Grep. Do not modify any files.
EOF
)

echo "branches: prompting claude -p..."
result=$(probe_run --tools "Read,Grep,Glob" --prompt "$PROMPT")

if [[ -z "$result" ]]; then
    echo "branches: FAIL — empty result" >&2
    exit 1
fi

json=$(extract_json_block "$result") || {
    echo "branches: FAIL — could not extract JSON from result:" >&2
    echo "$result" >&2
    exit 1
}

FAILS=0
total=$(echo "$json" | jq -r '.total_count // 0')
expected_min=$(echo "$json" | jq -r '.expected_min // 8')

if (( total < expected_min )); then
    echo "  FAIL: total_count=$total < expected_min=$expected_min" >&2
    FAILS=$((FAILS+1))
else
    echo "  ok: enumerated $total branches (>= $expected_min)"
fi

# Spot-check that the 5.3 Agent dispatch branch was identified
if ! echo "$json" | jq -e '.branches[] | select(.section | startswith("5.3"))' >/dev/null; then
    echo "  FAIL: §5.3 Agent dispatch branch not enumerated" >&2
    FAILS=$((FAILS+1))
else
    echo "  ok: §5.3 Agent dispatch branch present"
fi

if (( FAILS > 0 )); then
    echo "branches: $FAILS failure(s)" >&2
    exit 1
fi
echo "branches: OK"
