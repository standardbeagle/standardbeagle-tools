#!/usr/bin/env bash
# structure.sh — pure-shell lint of /dartai:start
# - frontmatter parses
# - all §N.M section refs resolve to actual headings
# - all fenced YAML/JSON blocks parse (best-effort)

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SKILL="${REPO_ROOT}/plugins/dartai/skills/start/SKILL.md"
FAILS=0

echo "structure: linting $SKILL"

# 1. File exists
if [[ ! -f "$SKILL" ]]; then
    echo "  FAIL: skill file missing" >&2
    exit 1
fi

# 2. Frontmatter present
if ! head -1 "$SKILL" | grep -q '^---$'; then
    echo "  FAIL: missing frontmatter opener" >&2
    FAILS=$((FAILS+1))
fi

# 3. Frontmatter has name + description
fm=$(awk '/^---$/{c++; if(c==2) exit; next} c==1' "$SKILL")
for field in name description; do
    if ! echo "$fm" | grep -q "^$field:"; then
        echo "  FAIL: frontmatter missing '$field'" >&2
        FAILS=$((FAILS+1))
    fi
done

# 4. All §N.M / §N refs resolve to actual headings
# Extract refs like §5.3 §5.3.1 §1.5 — skip external refs prefixed by "K2 " or "RFC " etc.
# (perl-regex negative lookbehind: §N is internal unless preceded by a known external prefix)
refs=$(grep -oP '(?<!K2 )(?<!RFC )(?<!ISO )§[0-9]+(\.[0-9]+)*' "$SKILL" | sort -u)
# Extract heading numbers like "### 5.3 Title" or "### 5.3.1 Title" or "### 1.5 ..."
headings=$(grep -oE '^#+\s+[0-9]+(\.[0-9]+)*' "$SKILL" | grep -oE '[0-9]+(\.[0-9]+)*' | sort -u)

for ref in $refs; do
    num="${ref#§}"
    if ! echo "$headings" | grep -qx "$num"; then
        echo "  FAIL: ref $ref has no matching heading (looked for '## $num' or '### $num')" >&2
        FAILS=$((FAILS+1))
    fi
done
echo "  checked $(echo "$refs" | wc -l | tr -d ' ') section refs"

# 5. Fenced YAML/JSON blocks lint (best-effort — count failures, don't hard fail)
yaml_blocks=$(awk '/^```yaml$/,/^```$/' "$SKILL" | grep -c '^```yaml$' || true)
json_blocks=$(awk '/^```json$/,/^```$/' "$SKILL" | grep -c '^```json$' || true)
echo "  found $yaml_blocks yaml + $json_blocks json fenced blocks"

# Try to parse each json block
block_id=0
yaml_bad=0
json_bad=0
in_block=""
buffer=""
while IFS= read -r line; do
    if [[ -z "$in_block" ]]; then
        if [[ "$line" == '```json' ]]; then in_block=json; buffer=""; continue; fi
        if [[ "$line" == '```yaml' ]]; then in_block=yaml; buffer=""; continue; fi
    else
        if [[ "$line" == '```' ]]; then
            block_id=$((block_id+1))
            if [[ "$in_block" == "json" ]]; then
                if ! echo "$buffer" | jq -e . >/dev/null 2>&1; then
                    json_bad=$((json_bad+1))
                fi
            fi
            # YAML lint requires `yq`; skip if absent
            if [[ "$in_block" == "yaml" ]] && command -v yq >/dev/null 2>&1; then
                if ! echo "$buffer" | yq eval '.' - >/dev/null 2>&1; then
                    yaml_bad=$((yaml_bad+1))
                fi
            fi
            in_block=""
            buffer=""
            continue
        fi
        buffer+="$line"$'\n'
    fi
done < "$SKILL"

# Note: many fenced blocks contain placeholder syntax like [task-id] which is
# intentionally non-parseable. Don't fail on these — just report.
echo "  json blocks failing strict parse: $json_bad / $json_blocks (placeholder syntax expected)"
if command -v yq >/dev/null 2>&1; then
    echo "  yaml blocks failing strict parse: $yaml_bad / $yaml_blocks (placeholder syntax expected)"
fi

# 6. Verify pre-flight check is GONE (regression guard for c4f6b85)
if grep -q "Pre-flight" "$SKILL" || grep -q "pre-flight check" "$SKILL"; then
    # Allow the explicit "No pre-flight check" line; flag any actual implementation
    if grep -qE "Pre-?flight (Check|Validation|Detection)" "$SKILL"; then
        echo "  FAIL: pre-flight detection re-introduced (regression of c4f6b85)" >&2
        FAILS=$((FAILS+1))
    fi
fi

# 7. Verify attempt-then-fallback is present
# Behavior guard (wording-tolerant): skill must attempt `Agent` dispatch and
# fall back to §5.3.1 inline delegation on failure.
if ! grep -qiE "(try|attempts?) \`?Agent\`?( tool)?" "$SKILL"; then
    echo "  FAIL: attempt-then-fallback dispatch missing" >&2
    FAILS=$((FAILS+1))
fi
if ! grep -qiE "fall ?back to inline delegation|→ §5.3.1|treat as transient → §5.3.1" "$SKILL"; then
    echo "  FAIL: inline-delegation fallback path missing" >&2
    FAILS=$((FAILS+1))
fi
if ! grep -q "Inline Delegation" "$SKILL"; then
    echo "  FAIL: §5.3.1 Inline Delegation missing" >&2
    FAILS=$((FAILS+1))
fi

if [[ $FAILS -gt 0 ]]; then
    echo "structure: $FAILS failure(s)" >&2
    exit 1
fi
echo "structure: OK"
