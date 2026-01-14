---
name: review-memories
description: Review, search, and manage workflow memories
argument-hint: "[search-query]"
---

# Review Workflow Memories

Search, review, and manage memories saved from previous workflow loops.

## Purpose

Memories preserve valuable learnings from workflow execution:
- Patterns that worked well
- Technical decisions with rationale
- Security lessons learned
- Verification strategies
- Code patterns and conventions

This command helps you:
- Search existing memories
- Review what's been learned
- Apply learnings to current work
- Update or remove obsolete memories
- Export memories for sharing

## Usage

### Search All Memories

```bash
/workflow:review-memories
```

Shows all memories organized by category.

### Search by Query

```bash
/workflow:review-memories authentication

/workflow:review-memories "rate limiting"

/workflow:review-memories security xss
```

Searches memory titles, tags, and content.

### Search by Category

```bash
/workflow:review-memories --category=workflow_pattern

/workflow:review-memories --category=lesson
```

### Search by Scope

```bash
/workflow:review-memories --scope=project

/workflow:review-memories --scope=user
```

### Search by Tags

```bash
/workflow:review-memories --tags=security,authentication

/workflow:review-memories --tags=xss
```

## Process

### 1. Load Memories

**From slop-mcp** (if available):
```bash
# Use slop-mcp to fetch memories
slop-mcp memory list --scope=project
slop-mcp memory list --scope=user
```

**From local storage** (fallback):
```bash
# Read from .claude/memories/
ls -1 .claude/memories/*.md

# Parse YAML frontmatter and content
for file in .claude/memories/*.md; do
  # Extract metadata and content
done
```

### 2. Filter and Sort

Apply filters:
- Query match (title, tags, content)
- Category filter
- Scope filter
- Tag filter
- Confidence level

Sort by:
- Relevance (if query provided)
- Date (newest first)
- Confidence (high first)
- Category (grouped)

### 3. Display Results

**Summary View:**
```
Workflow Memories
=================
Found 12 memories

Workflow Patterns (4):
  ✓ Auth tasks require rate limiting verification
  ✓ UI tasks benefit from screenshot comparison
  ✓ Database migrations in refactor loop only
  ✓ API errors include correlation ID

Technical Decisions (3):
  ✓ JWT authentication with 24h expiry
  ✓ PostgreSQL over MongoDB for ACID
  ✓ bcrypt cost factor 12 for passwords

Lessons Learned (3):
  ⚠ XSS in user profile - always sanitize
  ⚠ Race condition in payments - use transactions
  ⚠ Memory leak from unclosed connections

Code Patterns (2):
  ✓ API pattern: /api/v1/{resource}/{action}
  ✓ Parameterized queries for SQL injection prevention

To view a memory: /workflow:view-memory <title>
```

**Detailed View:**

If specific query or only 1-3 results:
```
Memory: Auth tasks require rate limiting verification
=========================================================
Category: workflow_pattern
Scope: project
Tags: authentication, security, rate-limiting
Confidence: high
Created: 2026-01-14 10:23:15
Source: Task 2

## What
When implementing authentication endpoints, always include rate limiting
in the security verification phase.

## Why
Brute force vulnerabilities discovered in Task 2 could have been prevented
with upfront rate limiting verification.

## When
Apply to all authentication-related tasks:
- Login endpoints
- Password reset
- Registration
- 2FA verification

## How
Checklist for verification phase:
- [ ] Rate limit login endpoint (5 attempts/min/IP)
- [ ] Rate limit password reset (3 attempts/hour/email)
- [ ] Test with concurrent requests
- [ ] Verify 429 responses include Retry-After header

## Evidence
Security loop in Task 2 found brute force vulnerability.
After adding rate limiting, no further vulnerabilities found.

---

Related memories: 2
  - JWT authentication with 24h expiry
  - Rate limiting pattern: 5 attempts/min/IP for auth
```

### 4. Action Menu

After displaying memories, offer actions:

```yaml
actions:
  view_details: "Show full content of a memory"
  apply_to_task: "Use memory in current task"
  update_memory: "Edit memory content"
  delete_memory: "Remove obsolete memory"
  export_memories: "Export to file for sharing"
  link_memories: "Connect related memories"
```

**Interactive:**
```
What would you like to do?
1. View details of a specific memory
2. Apply memory to current task
3. Update a memory
4. Delete a memory
5. Export memories to file
6. Nothing, just browsing
```

## Memory Operations

### View Details

Show full memory with all fields:
```bash
/workflow:view-memory "Auth tasks require rate limiting"
```

Displays complete content with metadata.

### Apply to Task

Incorporate memory into current work:
```
Applying memory: "Auth tasks require rate limiting"

This memory suggests:
- Add rate limiting to authentication endpoints
- Test with concurrent requests
- Verify 429 responses

Should I:
1. Add this to current task checklist
2. Create a new task for rate limiting
3. Just keep it in mind
```

### Update Memory

Modify existing memory:
```
Update memory: "XSS in user profile"

Current content:
[Shows current memory]

What would you like to change?
1. Update content (new learnings)
2. Add tags
3. Change confidence level
4. Update related memories
5. Cancel
```

Save updated version with timestamp.

### Delete Memory

Remove obsolete memory:
```
Delete memory: "Use Redux for state management"

This memory is from 3 months ago.
Has it become obsolete?

1. Yes, delete it (moved to Zustand)
2. No, keep it
3. Archive it (keep but mark obsolete)
```

Confirm before deletion, optionally archive instead.

### Export Memories

Generate file for sharing:
```
Export memories

Options:
1. Export all memories (12 total)
2. Export by category (choose: workflow_pattern, lesson, etc.)
3. Export by scope (choose: project, user, global)
4. Export search results

Format:
1. Markdown (readable)
2. JSON (structured)
3. YAML (human-friendly structured)

Output:
1. File: .claude/memories-export-2026-01-14.md
2. Clipboard
3. Display inline
```

## Search Algorithms

### Simple Search (Default)

- Match query words in title, tags, content
- Case-insensitive
- Sort by relevance (number of matches)

### Tag-Based Search

- Match exact tags
- Support multiple tags (AND/OR)
- Fast lookup via index

### Full-Text Search

- Search entire content
- Highlight matches
- Rank by relevance

### Smart Search

Semantic search if available:
- Understand intent ("show me security issues")
- Related terms (search "auth" finds "authentication")
- Synonym expansion

## Memory Statistics

Show overview stats:
```
Memory Statistics
=================
Total memories: 42
By category:
  - Workflow patterns: 12
  - Technical decisions: 8
  - Code patterns: 7
  - Lessons learned: 10
  - Verification strategies: 5

By scope:
  - Project: 28
  - User: 12
  - Global: 2

By confidence:
  - High: 35
  - Medium: 6
  - Low: 1

Most used tags:
  1. security (15 memories)
  2. authentication (12)
  3. testing (10)
  4. api (8)
  5. database (7)

Recent activity:
  - 3 memories added this week
  - 1 memory updated yesterday
  - 0 memories deleted this month

Oldest memory: 3 months ago
Newest memory: 2 hours ago
```

## Integration with Current Work

### At Task Start

Suggest relevant memories:
```
Starting task: "Add OAuth2 authentication"

Relevant memories found (3):
  1. JWT authentication with 24h expiry
  2. Auth tasks require rate limiting verification
  3. XSS in user-generated content

Would you like to:
1. Review these memories before starting
2. Apply patterns from memories
3. Continue without reviewing
```

### During Execution

Alert if memory applies:
```
[During security verification phase]

💡 Memory reminder: "Auth tasks require rate limiting verification"

This task involves authentication. Don't forget to:
- [ ] Rate limit login endpoint
- [ ] Test with concurrent requests
- [ ] Verify 429 responses

View full memory: /workflow:view-memory "Auth tasks require rate limiting"
```

### Before Completion

Check if memory was useful:
```
Task completed: "Add OAuth2 authentication"

You referenced memory: "JWT authentication with 24h expiry"

Was this memory helpful?
1. Yes, very helpful (increase confidence)
2. Somewhat helpful
3. Not helpful (needs update?)
4. Memory is now obsolete (archive?)
```

## Memory Maintenance

### Regular Review

Periodically review memories:
- Every 10 completed tasks
- Every month
- On project milestones

Check for:
- Obsolete memories (update or archive)
- Duplicate memories (merge)
- Low-confidence memories (validate or delete)
- Missing links (connect related memories)

### Memory Health Report

```
Memory Health Report
====================
Status: Good

Concerns:
  ⚠ 2 memories not accessed in 3 months (possibly obsolete)
  ⚠ 1 low-confidence memory (needs validation)
  ✓ No duplicate memories detected
  ✓ All memories properly tagged

Recommendations:
  1. Review: "Old database pattern" (3 months old, not used)
  2. Validate: "Experimental caching strategy" (low confidence)
  3. Update: "API versioning" (new v2 API released)
```

## Examples

### Example 1: Search for security lessons
```bash
/workflow:review-memories security

Found 5 memories:
  1. XSS in user profile - always sanitize (lesson)
  2. Auth tasks require rate limiting (workflow_pattern)
  3. SQL injection prevention with parameterized queries (code_pattern)
  4. JWT authentication with 24h expiry (technical_decision)
  5. OWASP Top 10 verification checklist (verification)
```

### Example 2: Review lessons learned
```bash
/workflow:review-memories --category=lesson

Lessons Learned (10 memories):
  1. XSS in user profile - always sanitize
  2. Race condition in payments - use transactions
  3. Memory leak from unclosed connections
  4. N+1 query problem in user list endpoint
  5. CORS misconfiguration exposed API
  ...
```

### Example 3: Apply memory to current task
```bash
# Starting task: Add password reset
/workflow:review-memories password

Found 2 relevant memories:
  1. Auth tasks require rate limiting verification
  2. Password reset flow security checklist

Apply "Password reset flow security checklist" to current task?
1. Yes, add to task context
2. View full memory first
3. Skip

[User selects 1]

Applied to task. Checklist added:
  - [ ] Rate limit: 3 attempts/hour/email
  - [ ] Email token expires in 1 hour
  - [ ] One-time use tokens
  - [ ] Log all reset attempts
  - [ ] Verify email ownership
```

## Notes

- Memories are stored per-project in `.claude/memories/`
- User-scope memories can be shared across projects
- Global memories are rare (universal patterns only)
- Regular review prevents memory bloat
- Quality over quantity - be selective

## Success Criteria

Memory review is successful when:
- ✓ Relevant memories easily found
- ✓ Learnings applied to current work
- ✓ Obsolete memories removed
- ✓ Memory quality maintained
- ✓ Knowledge compound over time
