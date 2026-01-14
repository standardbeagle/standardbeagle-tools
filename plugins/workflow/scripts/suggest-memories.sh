#!/usr/bin/env bash
# Suggest memories to save before context compaction

set -euo pipefail

# This script runs before context compaction and generates a prompt
# for Claude to analyze context and suggest memories to save

cat <<'EOF'
# Memory Preservation Before Context Compaction

**Context compaction is about to occur.** Before losing valuable context, you should help preserve important learnings and patterns as memories.

## Your Task

Analyze the current conversation and workflow state to identify valuable knowledge that should be preserved as memories in slop-mcp.

### What to Look For

**Workflow Patterns Discovered:**
- Task execution strategies that worked well
- Common pitfalls and how to avoid them
- Effective verification approaches
- Successful refactoring patterns

**Technical Decisions:**
- Architecture choices and rationale
- Library/framework decisions
- Code patterns adopted
- Testing strategies

**Project-Specific Context:**
- File organization patterns
- Naming conventions
- API design patterns
- Security requirements

**User Preferences:**
- Coding style preferences
- Review thoroughness level
- Loop type preferences
- Task granularity preferences

**Learnings from Failures:**
- What tasks failed and why
- What edge cases were missed
- What assumptions proved wrong
- What verifications caught issues

### Memory Categories

Organize suggestions into these categories:

**1. Workflow Patterns**
```yaml
category: workflow_pattern
scope: project|user|global
example: "For auth tasks, always include rate limiting verification"
```

**2. Technical Decisions**
```yaml
category: technical_decision
scope: project
example: "Using JWT with 24h expiry, bcrypt for password hashing"
```

**3. Code Patterns**
```yaml
category: code_pattern
scope: project
example: "API endpoints follow pattern: /api/v1/{resource}/{action}"
```

**4. Verification Strategies**
```yaml
category: verification
scope: user
example: "User prefers comprehensive mutation testing for critical paths"
```

**5. Lessons Learned**
```yaml
category: lesson
scope: project|user
example: "XSS vulnerabilities found in user profile - always sanitize HTML"
```

## Process

1. **Review workflow state** - Read `.claude/workflow-loop-state.json` if it exists
2. **Analyze conversation** - Identify patterns from recent tasks
3. **Generate suggestions** - Create 3-5 memory suggestions
4. **Present to user** - Use AskUserQuestion for approval

### Memory Suggestion Format

For each suggested memory:
```yaml
title: "Brief title (max 60 chars)"
category: "workflow_pattern|technical_decision|code_pattern|verification|lesson"
scope: "project|user|global"
content: |
  Detailed content explaining:
  - What: The pattern/decision/lesson
  - Why: The reasoning or context
  - When: When to apply it
  - How: Implementation details if relevant
tags: ["tag1", "tag2", "tag3"]
confidence: "high|medium|low"
```

### User Interaction

Use AskUserQuestion to present suggestions:

```
Question: "Save these memories before context compaction?"

Options for each memory:
1. "Save as-is"
2. "Edit before saving"
3. "Skip this memory"
4. "Skip all and continue"
```

### Saving to slop-mcp

For approved memories, save using slop-mcp memory tools:

```bash
# Save a memory (pseudo-code - actual implementation depends on slop-mcp API)
echo "---
title: ${TITLE}
category: ${CATEGORY}
scope: ${SCOPE}
tags: [${TAGS}]
created: $(date -Iseconds)
---
${CONTENT}" > .claude/memories/${TIMESTAMP}-${SLUG}.md

# Or use slop-mcp tool if available
# slop-mcp memory save --title "${TITLE}" --content "${CONTENT}" ...
```

## Implementation

**Step 1:** Check if memories are worthwhile
```bash
# Read workflow state
if [ -f ".claude/workflow-loop-state.json" ]; then
  TASKS_COMPLETED=$(jq -r '.stats.completed // 0' .claude/workflow-loop-state.json)
  TASKS_FAILED=$(jq -r '.stats.failed // 0' .claude/workflow-loop-state.json)

  # Only suggest if we've done meaningful work
  if [ "$TASKS_COMPLETED" -gt 0 ] || [ "$TASKS_FAILED" -gt 0 ]; then
    echo "Workflow has completed $TASKS_COMPLETED tasks and failed $TASKS_FAILED tasks."
    echo "This context likely contains valuable learnings."
  fi
fi
```

**Step 2:** Analyze context for patterns
- Look for repeated successful patterns
- Identify unique solutions to problems
- Note any security issues discovered
- Capture architecture decisions

**Step 3:** Generate specific suggestions
- Be concrete, not generic
- Include enough context to be useful later
- Tag appropriately for retrieval
- Indicate confidence level

**Step 4:** Present and save
- Show user what will be saved
- Allow editing
- Save approved memories
- Confirm what was saved

## Example Suggestions

### Example 1: Workflow Pattern
```yaml
title: "Auth tasks require rate limiting verification"
category: workflow_pattern
scope: project
content: |
  When implementing authentication endpoints, always include rate limiting
  in the verification phase. We discovered brute force vulnerabilities in
  Task 3 that could have been prevented.

  Checklist:
  - [ ] Rate limit login endpoint (5 attempts/min/IP)
  - [ ] Rate limit password reset (3 attempts/hour/email)
  - [ ] Test with concurrent requests
  - [ ] Verify 429 responses with Retry-After header

  This should be part of the security loop for any auth task.
tags: [authentication, security, rate-limiting, adversarial-security]
confidence: high
```

### Example 2: Technical Decision
```yaml
title: "Using JWT with 24h expiry and bcrypt password hashing"
category: technical_decision
scope: project
content: |
  Architecture decision: JWT-based authentication with 24-hour token expiry.

  Rationale:
  - Stateless auth suitable for microservices
  - 24h expiry balances UX and security
  - Refresh tokens stored in httpOnly cookies

  Password hashing: bcrypt with cost factor 12
  - OWASP recommended
  - Future-proof against hardware improvements
  - Tested and verified in Task 1

  Files: auth.ts, token.service.ts
tags: [authentication, jwt, bcrypt, security, architecture]
confidence: high
```

### Example 3: Lesson Learned
```yaml
title: "XSS vulnerability in user profile - always sanitize HTML"
category: lesson
scope: user
content: |
  Critical finding from security loop on Task 5:

  Vulnerability: User profile display rendered HTML from bio field without
  sanitization, allowing stored XSS attacks.

  Root cause: Trusted user input without validation.

  Fix: DOMPurify.sanitize() on all user-generated content before rendering.

  Lesson: NEVER trust user input, even from authenticated users. Always
  sanitize HTML, even in "trusted" contexts like user profiles.

  This applies to: comments, bios, descriptions, any user-generated text
  that might contain markup.
tags: [security, xss, sanitization, user-input, lesson-learned]
confidence: high
```

## Notes

- **Be specific**: "Always sanitize user HTML" is better than "Security is important"
- **Include context**: Why, when, how - not just what
- **Tag thoroughly**: Enable future retrieval
- **Scope appropriately**: Project-specific vs user-general vs global patterns
- **Update existing**: If memory exists, suggest update instead of duplicate

## Success Criteria

Memory preservation is successful when:
- ✓ Valuable patterns are identified (not generic advice)
- ✓ User approves and understands suggestions
- ✓ Memories are saved with proper metadata
- ✓ Context is preserved for future retrieval
- ✓ Process is quick (< 2 minutes total)

---

**Now proceed to analyze context and generate memory suggestions for the user.**
EOF

exit 0
