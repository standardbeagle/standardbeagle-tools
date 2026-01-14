---
name: memory-management
description: Memory preservation patterns for workflow learnings before context compaction
---

# Memory Management for Workflow Loops

Preserve valuable learnings and patterns as memories before context compaction.

## Why Memory Management Matters

```yaml
problem:
  context_compaction: "Valuable context gets compressed or lost"
  forgotten_learnings: "Patterns discovered are forgotten"
  repeated_mistakes: "Same issues found multiple times"
  lost_decisions: "Architecture rationale disappears"

solution:
  proactive_preservation: "Save memories before compaction"
  structured_storage: "Organize by category and scope"
  future_retrieval: "Tag for easy search"
  continuous_learning: "Build knowledge base over time"
```

## Memory Categories

### 1. Workflow Patterns

**What:** Successful execution strategies discovered during loops

**Examples:**
- "For auth tasks, always include rate limiting in security verification"
- "UI tasks benefit from parallel verifier + screenshot comparison"
- "Database migrations should run in refactor loop, not quality loop"

**When to Save:**
- A pattern works well repeatedly
- You discover a better approach
- You avoid a common pitfall

**Scope:** Usually `project` or `user`

### 2. Technical Decisions

**What:** Architecture choices with rationale

**Examples:**
- "Using JWT authentication with 24h expiry - rationale: stateless auth for microservices"
- "Chose PostgreSQL over MongoDB - rationale: ACID requirements for financial data"
- "Using bcrypt cost factor 12 - OWASP recommendation"

**When to Save:**
- Significant architecture decision made
- Technology choice with specific rationale
- Security-related configuration

**Scope:** Usually `project`

### 3. Code Patterns

**What:** Project-specific coding conventions and patterns

**Examples:**
- "API endpoints follow pattern: /api/v1/{resource}/{action}"
- "All database queries use parameterized queries (prevent SQL injection)"
- "Error responses include correlation ID for debugging"

**When to Save:**
- Consistent pattern emerges
- Convention established
- Pattern prevents bugs

**Scope:** `project` (rarely `user` if preferred across projects)

### 4. Verification Strategies

**What:** Effective approaches to verification discovered

**Examples:**
- "Mutation testing caught 3 weak tests in auth module"
- "Adversarial XSS testing should include stored, reflected, and DOM-based"
- "Edge case testing: always check null, empty, max values"

**When to Save:**
- Verification approach proves valuable
- Edge case pattern discovered
- Test strategy works well

**Scope:** `user` (applies across projects)

### 5. Lessons Learned

**What:** Failures, vulnerabilities, and insights

**Examples:**
- "XSS found in user profile - lesson: always sanitize HTML, even from authenticated users"
- "Race condition in payment processing - lesson: use database transactions"
- "Memory leak from unclosed connections - lesson: always use try-finally"

**When to Save:**
- Bug found and fixed
- Vulnerability discovered
- Mistake made and corrected

**Scope:** `user` or `project` depending on specificity

## Memory Structure

### Standard Format

```yaml
title: "Brief descriptive title (max 60 chars)"
category: "workflow_pattern|technical_decision|code_pattern|verification|lesson"
scope: "project|user|global"
created: "ISO timestamp"
updated: "ISO timestamp (if modified)"
confidence: "high|medium|low"
tags: ["tag1", "tag2", "tag3"]
source: "task-id or context"
related: ["memory-id-1", "memory-id-2"]

content: |
  ## What
  Clear description of the pattern/decision/lesson

  ## Why
  Rationale, context, motivation

  ## When
  When to apply this (conditions, triggers)

  ## How
  Implementation details, steps, code examples

  ## Evidence
  What validated this (test results, metrics, incidents)

  ## Caveats
  When NOT to use, exceptions, edge cases
```

### Minimal Format

For quick memories:
```yaml
title: "Brief title"
category: "category"
scope: "scope"
tags: ["tags"]
content: "Concise description with key points"
```

## Memory Lifecycle

### 1. Identification (PreCompact Hook)

**Trigger:** Context compaction imminent

**Process:**
1. Analyze workflow state (completed/failed tasks)
2. Review conversation for patterns
3. Identify valuable knowledge
4. Generate 3-5 specific suggestions

**Criteria for Valuable Memories:**
```yaml
include:
  - Specific and actionable (not generic)
  - Project or user relevant (not universal truths)
  - Discovered through work (not pre-existing knowledge)
  - Useful for future tasks (saves time/prevents bugs)

exclude:
  - Generic advice ("write good code")
  - Common knowledge ("use version control")
  - One-time facts (unless pattern)
  - Obvious information
```

### 2. Review and Approval

**User Interaction:**
- Present suggestions clearly
- Allow editing before saving
- Support bulk approve/reject
- Provide preview of saved format

**Options per Memory:**
- ✓ Save as-is
- ✏️ Edit before saving
- ⏭️ Skip this memory
- ⏭️⏭️ Skip all and continue

### 3. Storage

**Location:**
```
.claude/memories/
├── 2026-01-14-auth-rate-limiting.md
├── 2026-01-14-jwt-architecture.md
├── 2026-01-14-xss-lesson.md
└── index.json                        # Searchable index
```

**Format:** Markdown with YAML frontmatter

**Index:** JSON file for fast searching

### 4. Retrieval

**When to Retrieve:**
- Starting new workflow loop
- Beginning similar task
- User asks related question
- Pattern matching on task description

**Search Methods:**
- By category
- By tags
- By scope (project/user/global)
- By confidence level
- Full-text search in content

### 5. Update and Refinement

**Update Triggers:**
- Memory proves incorrect (update with correction)
- Memory evolves (add new learnings)
- Memory becomes obsolete (archive or delete)

**Versioning:** Keep history of changes

## Integration with slop-mcp

### Storage in slop-mcp

If slop-mcp memory tools are available:

```bash
# Save memory using slop-mcp
slop-mcp memory save \
  --title "Auth tasks require rate limiting" \
  --category "workflow_pattern" \
  --scope "project" \
  --tags "auth,security,rate-limiting" \
  --content "$(cat memory-content.md)"

# Search memories
slop-mcp memory search --tags "auth,security"

# Retrieve memory
slop-mcp memory get --id "memory-123"

# Update memory
slop-mcp memory update --id "memory-123" --content "Updated content"
```

### Fallback Storage

If slop-mcp not available:
- Store in `.claude/memories/` as markdown files
- Maintain JSON index for searching
- Manual retrieval via Read tool

## PreCompact Hook Flow

```yaml
hook_execution:
  trigger: "PreCompact event fires"

  step_1_generate_prompt:
    script: "suggest-memories.sh"
    output: "Prompt with instructions and context"

  step_2_analyze:
    agent: "Primary agent (you)"
    task: |
      1. Read workflow state file
      2. Identify patterns from recent tasks
      3. Generate 3-5 specific memory suggestions

  step_3_present:
    tool: "AskUserQuestion"
    format: "Multiple choice per memory"
    options: ["Save", "Edit", "Skip", "Skip All"]

  step_4_save:
    approved_memories: "Save to .claude/memories/ or slop-mcp"
    edited_memories: "Present edit interface, then save"
    skipped_memories: "Discard"

  step_5_confirm:
    message: "Saved N memories before compaction"
    details: "List titles of saved memories"

  step_6_continue:
    action: "Allow compaction to proceed"
```

## Example Workflow

### Scenario: After 3 completed tasks

**Task 1:** Implemented JWT authentication
**Task 2:** Added rate limiting
**Task 3:** Fixed XSS vulnerability

**PreCompact Hook Fires:**

**Memory Suggestion 1:**
```yaml
title: "JWT auth with 24h expiry for this project"
category: technical_decision
scope: project
tags: [authentication, jwt, architecture]
confidence: high
content: |
  Decided to use JWT authentication with 24-hour token expiry.

  Rationale: Stateless auth suitable for our microservices architecture.
  Balance between UX (don't re-login too often) and security.

  Implementation: auth.ts with jsonwebtoken library
  Refresh tokens: Stored in httpOnly cookies
  Secret: From environment variable (not hardcoded)

  Verified in Task 1 security loop - no vulnerabilities found.
```

**Memory Suggestion 2:**
```yaml
title: "Rate limiting pattern: 5 attempts/min/IP for auth"
category: workflow_pattern
scope: project
tags: [rate-limiting, security, authentication]
confidence: high
content: |
  Standard rate limiting for authentication endpoints:
  - Login: 5 attempts per minute per IP
  - Password reset: 3 attempts per hour per email
  - Registration: 10 per hour per IP

  Implementation: express-rate-limit middleware
  Returns: 429 Too Many Requests with Retry-After header

  Discovered in Task 2 when security loop found brute force vulnerability.
  Now part of standard security verification for auth endpoints.
```

**Memory Suggestion 3:**
```yaml
title: "XSS in user-generated content - always sanitize"
category: lesson
scope: user
tags: [security, xss, user-input, sanitization]
confidence: high
content: |
  Critical lesson from Task 3: Found stored XSS in user profile bio.

  Vulnerability: Displayed user HTML without sanitization
  Attack: <script>alert('XSS')</script> in bio field
  Impact: Could steal session tokens

  Fix: DOMPurify.sanitize() on all user-generated content
  Applies to: comments, bios, descriptions, any user text

  Key insight: Never trust user input, even from authenticated users.
  Always sanitize HTML before rendering, even in "safe" contexts.

  Testing: Add XSS test cases to security loop for all UGC features.
```

**User Review:**
- Suggestion 1: ✓ Save as-is
- Suggestion 2: ✓ Save as-is
- Suggestion 3: ✏️ Edit (user adds project-specific details)

**Result:** 3 memories saved, available for future retrieval

## Best Practices

### DO:
- ✓ Be specific and concrete
- ✓ Include rationale and context
- ✓ Tag thoroughly for retrieval
- ✓ Set appropriate scope (project/user/global)
- ✓ Include evidence (what validated this)
- ✓ Update memories as they evolve

### DON'T:
- ✗ Save generic advice ("write tests")
- ✗ Save common knowledge ("use git")
- ✗ Over-save (every small detail)
- ✗ Under-save (lose valuable patterns)
- ✗ Duplicate existing memories
- ✗ Skip context and rationale

### Memory Quality Checklist:
```yaml
quality_check:
  - [ ] Title clearly describes content
  - [ ] Category and scope appropriate
  - [ ] Tags enable future retrieval
  - [ ] Content includes What, Why, When, How
  - [ ] Specific to this project/user (not generic)
  - [ ] Actionable (can apply in future)
  - [ ] Evidence-based (not speculation)
  - [ ] Non-duplicate (doesn't already exist)
```

## Future Enhancements

**Possible improvements:**
- Auto-suggest memories based on task patterns
- Link related memories (graph structure)
- Memory retrieval at task start
- Memory validation (test if still applicable)
- Memory analytics (most useful, rarely used)
- Team memory sharing (beyond user scope)
- Memory templates for common categories

## Usage

This skill is triggered by PreCompact hook and guides memory preservation process.

See `suggest-memories.sh` script for implementation details.
