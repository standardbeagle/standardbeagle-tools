#!/usr/bin/env node
/**
 * Suggest memories to save before context compaction
 */

const PROMPT = `# Memory Preservation Before Context Compaction

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
\`\`\`yaml
category: workflow_pattern
scope: project|user|global
example: "For auth tasks, always include rate limiting verification"
\`\`\`

**2. Technical Decisions**
\`\`\`yaml
category: technical_decision
scope: project
example: "Using JWT with 24h expiry, bcrypt for password hashing"
\`\`\`

**3. Code Patterns**
\`\`\`yaml
category: code_pattern
scope: project
example: "API endpoints follow pattern: /api/v1/{resource}/{action}"
\`\`\`

**4. Verification Strategies**
\`\`\`yaml
category: verification
scope: user
example: "User prefers comprehensive mutation testing for critical paths"
\`\`\`

**5. Lessons Learned**
\`\`\`yaml
category: lesson
scope: project|user
example: "XSS vulnerabilities found in user profile - always sanitize HTML"
\`\`\`

## Process

1. **Review workflow state** - Read \`.claude/workflow-loop-state.json\` if it exists
2. **Analyze conversation** - Identify patterns from recent tasks
3. **Generate suggestions** - Create 3-5 memory suggestions
4. **Present to user** - Use AskUserQuestion for approval

### Memory Suggestion Format

For each suggested memory:
\`\`\`yaml
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
\`\`\`

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
`;

console.log(PROMPT);
process.exit(0);
