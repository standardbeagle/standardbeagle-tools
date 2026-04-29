#!/usr/bin/env bash
# claude-probe.sh — invoke claude -p with hermetic flags, return final JSON
#
# Usage:
#   source tests/lib/claude-probe.sh
#   probe_run --tools "Read,Grep,Glob" --prompt "your prompt"
#
# Outputs the final assistant message text on stdout. Caller pipes to jq.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLUGIN_DIR="${REPO_ROOT}/plugins/dartai"
FIXTURE_DIR="${REPO_ROOT}/tests/fixtures/empty-workspace"

# Defaults — override via flags
DEFAULT_TOOLS="Read,Grep,Glob,Bash"
DEFAULT_BUDGET="0.50"
# Haiku 4.5 keeps probe cost ~5-10x lower than Opus while staying capable
# enough to follow strict-JSON-output prompts.
DEFAULT_MODEL="claude-haiku-4-5-20251001"

probe_run() {
    local tools="$DEFAULT_TOOLS"
    local prompt=""
    local budget="$DEFAULT_BUDGET"
    local model="$DEFAULT_MODEL"
    local extra_args=()

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --tools) tools="$2"; shift 2 ;;
            --prompt) prompt="$2"; shift 2 ;;
            --budget) budget="$2"; shift 2 ;;
            --model) model="$2"; shift 2 ;;
            --) shift; extra_args=("$@"); break ;;
            *) extra_args+=("$1"); shift ;;
        esac
    done

    if [[ -z "$prompt" ]]; then
        echo "probe_run: --prompt required" >&2
        return 2
    fi

    mkdir -p "$FIXTURE_DIR"

    # Note: NOT using --bare. --bare strips OAuth/keychain auth and forces
    # ANTHROPIC_API_KEY only — most users authenticate via OAuth, so --bare
    # breaks them. Probes only Read the skill file directly; no need to load
    # /dartai:start as a slash command. Skill body is just a markdown file
    # the model reads.
    #
    # --disable-slash-commands: skip skill loading (faster, no plugin sync)
    # --tools: restrict tool surface (omit Agent for fallback probes)
    # --max-budget-usd: hard cap
    # --output-format json: one-shot final JSON
    # --add-dir: allow access to skill source for reads
    # --permission-mode bypassPermissions: no interactive prompts
    cd "$FIXTURE_DIR"
    local out
    if ! out=$(claude -p \
            --model "$model" \
            --disable-slash-commands \
            --tools "$tools" \
            --max-budget-usd "$budget" \
            --output-format json \
            --add-dir "$REPO_ROOT" \
            --permission-mode bypassPermissions \
            --no-session-persistence \
            "${extra_args[@]}" \
            "$prompt" 2>&1); then
        echo "probe_run: claude -p failed" >&2
        echo "$out" >&2
        return 1
    fi

    if [[ "${VERBOSE:-0}" == "1" ]]; then
        echo "--- raw claude -p output ---" >&2
        echo "$out" >&2
        echo "--- end raw ---" >&2
    fi

    # --output-format json emits {result: "...", ...}
    echo "$out" | jq -r '.result // .'
}

# Extract JSON code block from assistant text (model often wraps in ```json ... ```)
extract_json_block() {
    local text="$1"
    # Try fenced block first
    local fenced
    fenced=$(echo "$text" | awk '/^```json$/,/^```$/' | sed '1d;$d')
    if [[ -n "$fenced" ]] && echo "$fenced" | jq -e . >/dev/null 2>&1; then
        echo "$fenced"
        return 0
    fi
    # Try raw
    if echo "$text" | jq -e . >/dev/null 2>&1; then
        echo "$text"
        return 0
    fi
    return 1
}

assert_jq() {
    local json="$1" filter="$2" expected="$3" name="$4"
    local actual
    actual=$(echo "$json" | jq -r "$filter")
    if [[ "$actual" == "$expected" ]]; then
        echo "  ok: $name ($filter == $expected)"
        return 0
    else
        echo "  FAIL: $name ($filter expected '$expected', got '$actual')" >&2
        return 1
    fi
}

assert_jq_match() {
    local json="$1" filter="$2" pattern="$3" name="$4"
    local actual
    actual=$(echo "$json" | jq -r "$filter")
    if [[ "$actual" =~ $pattern ]]; then
        echo "  ok: $name ($filter matches /$pattern/)"
        return 0
    else
        echo "  FAIL: $name ($filter='$actual' did not match /$pattern/)" >&2
        return 1
    fi
}
