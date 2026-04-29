#!/usr/bin/env bash
# identity.sh — verify §2.5 runner identity resolution from canned env
# Sets CLAUDE_AGENT_ID + a stub git config, asks the model to compute
# runner_instance_id and agent_id per §2.5.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "${REPO_ROOT}/tests/lib/claude-probe.sh"

SKILL_PATH="${REPO_ROOT}/plugins/dartai/commands/start.md"

# Canned identity values — script asserts these specific outputs
export CLAUDE_AGENT_ID="ralph-test-runner-v1"
TEST_HOST="probe-host"
TEST_PID="12345"

PROMPT=$(cat <<EOF
Read $SKILL_PATH section 2.5 "Resolve Runner Identity".

Given this environment:
- hostname: $TEST_HOST
- shell pid (\$\$): $TEST_PID
- git user.email: probe@example.com
- env CLAUDE_AGENT_ID: $CLAUDE_AGENT_ID

Compute the values §2.5 prescribes and emit ONLY this JSON:

{
  "runner_instance_id": "<hostname-pid format per step 1>",
  "agent_id": "<step 5: CLAUDE_AGENT_ID env value if set, else hostname-pid fallback>",
  "agent_id_source": "<one of: env | fallback>",
  "tag_value": "<lowercase-kebab form of agent_id for §5.2 tag>"
}

Per §2.5 step 5: prefer CLAUDE_AGENT_ID env when set; fall back to hostname-pid only when unset.
Per §5.2: agent tag value must be lowercase-kebab.
EOF
)

echo "identity: prompting with CLAUDE_AGENT_ID=$CLAUDE_AGENT_ID..."
result=$(probe_run --tools "Read,Grep,Glob,Bash" --prompt "$PROMPT")

json=$(extract_json_block "$result") || {
    echo "identity: FAIL — could not extract JSON:" >&2
    echo "$result" >&2
    exit 1
}

FAILS=0
assert_jq "$json" '.runner_instance_id' "${TEST_HOST}-${TEST_PID}" "runner_instance_id = host-pid" || FAILS=$((FAILS+1))
assert_jq "$json" '.agent_id' "$CLAUDE_AGENT_ID" "agent_id from env" || FAILS=$((FAILS+1))
assert_jq "$json" '.agent_id_source' "env" "agent_id source = env" || FAILS=$((FAILS+1))
# Tag value should already be lowercase-kebab since input is
assert_jq "$json" '.tag_value' "$CLAUDE_AGENT_ID" "tag value preserves lowercase-kebab" || FAILS=$((FAILS+1))

if (( FAILS > 0 )); then
    echo "identity: $FAILS failure(s)" >&2
    exit 1
fi
echo "identity: OK"
