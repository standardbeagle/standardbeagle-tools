#!/usr/bin/env bash
# run-start-tests.sh — driver for /dartai:start probes
#
# Usage:
#   tests/run-start-tests.sh              # all probes
#   tests/run-start-tests.sh structure    # one probe
#   VERBOSE=1 tests/run-start-tests.sh    # dump claude -p raw output

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROBES_DIR="${REPO_ROOT}/probes"

PROBES=(structure branches fallback-no-agent identity queue-dartql)

# Pre-flight: required tools
for cmd in jq claude; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "missing required command: $cmd" >&2
        exit 2
    fi
done

if [[ $# -gt 0 ]]; then
    requested=("$@")
else
    requested=("${PROBES[@]}")
fi

PASS=0
FAIL=0
FAILED_NAMES=()

for probe in "${requested[@]}"; do
    script="${PROBES_DIR}/${probe}.sh"
    if [[ ! -x "$script" ]]; then
        if [[ -f "$script" ]]; then
            chmod +x "$script"
        else
            echo "unknown probe: $probe" >&2
            FAIL=$((FAIL+1))
            FAILED_NAMES+=("$probe (missing)")
            continue
        fi
    fi
    echo "=== probe: $probe ==="
    if "$script"; then
        PASS=$((PASS+1))
    else
        FAIL=$((FAIL+1))
        FAILED_NAMES+=("$probe")
    fi
    echo ""
done

echo "=== summary ==="
echo "passed: $PASS"
echo "failed: $FAIL"
if (( FAIL > 0 )); then
    echo "failed probes: ${FAILED_NAMES[*]}"
    exit 1
fi
