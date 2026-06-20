#!/usr/bin/env bash
# fallback-no-agent.sh — verify §5.3.1 inline-delegation kicks in when Agent unavailable
# Invokes claude -p WITHOUT the Agent tool in --tools list, asks the model to
# describe what /dartai:start §5.3 would do. Expected: model reports it would
# fall back to inline-delegation per §5.3.1.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "${REPO_ROOT}/tests/lib/claude-probe.sh"

SKILL_PATH="${REPO_ROOT}/plugins/dartai/skills/start/SKILL.md"

PROMPT=$(cat <<EOF
Read the file at $SKILL_PATH. Section 5.3 dispatches the task-executor via the
Agent tool. Section 5.3.1 covers fallback when Agent is unavailable.

In your CURRENT session, the Agent tool is NOT in the available toolset (check
your tool list — only Read, Grep, Glob, Bash are available; no Agent or Task).

Emit ONLY a JSON object with this schema:

{
  "agent_tool_available": false,
  "expected_path": "<one of: 5.3 normal dispatch | 5.3.1 inline delegation | abort>",
  "preflight_check_present": <bool, was a hard pre-flight check found in the skill?>,
  "fallback_section": "5.3.1",
  "termination_conditions": [
    "<list the conditions in §5.3.1 that terminate inline delegation>"
  ],
  "report_emits_yaml": <bool, does §5.3.1 emit a structured YAML report on termination?>
}

Required: expected_path == "5.3.1 inline delegation". preflight_check_present
must be false (regression guard for commit c4f6b85). report_emits_yaml must
be true.
EOF
)

echo "fallback-no-agent: prompting claude -p WITHOUT Agent tool..."
# Critical: Agent is NOT in --tools. Read/Grep/Glob/Bash only.
result=$(probe_run --tools "Read,Grep,Glob,Bash" --prompt "$PROMPT")

json=$(extract_json_block "$result") || {
    echo "fallback-no-agent: FAIL — could not extract JSON:" >&2
    echo "$result" >&2
    exit 1
}

FAILS=0
assert_jq "$json" '.agent_tool_available' "false" "Agent tool reported absent" || FAILS=$((FAILS+1))
assert_jq_match "$json" '.expected_path' "5.3.1" "expected path is §5.3.1" || FAILS=$((FAILS+1))
assert_jq "$json" '.preflight_check_present' "false" "no pre-flight check (c4f6b85 regression guard)" || FAILS=$((FAILS+1))
assert_jq "$json" '.report_emits_yaml' "true" "§5.3.1 emits structured YAML report" || FAILS=$((FAILS+1))

term_count=$(echo "$json" | jq -r '.termination_conditions | length')
if (( term_count >= 3 )); then
    echo "  ok: $term_count termination conditions enumerated"
else
    echo "  FAIL: only $term_count termination conditions (expected >=3)" >&2
    FAILS=$((FAILS+1))
fi

if (( FAILS > 0 )); then
    echo "fallback-no-agent: $FAILS failure(s)" >&2
    exit 1
fi
echo "fallback-no-agent: OK"
