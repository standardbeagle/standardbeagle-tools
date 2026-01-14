#!/usr/bin/env bash
# Suggest process improvements based on common oversights during coding

set -euo pipefail

# This script generates prompts for suggesting process improvement memories
# Focuses on things commonly missed during development

cat <<'EOF'
# Process Improvement Memory Suggestions

**Analyze recent workflow execution for process improvements and oversights.**

## Common Oversights to Check

Before context compaction, review whether these important practices were followed or missed:

### 1. Testing Coverage and Quality

**Check for:**
- Was testing level appropriate? (unit/integration/e2e)
- Were edge cases tested thoroughly?
- Was mutation testing performed for critical code?
- Were tests written before or after code? (TDD vs after-the-fact)
- Did tests actually catch bugs or just pass?

**Memory Suggestions:**
```yaml
# If testing was weak
title: "Insufficient edge case testing in Task X"
category: process_improvement
scope: user
tags: [testing, edge-cases, quality]
content: |
  Task X had weak test coverage for edge cases.

  What was missed:
  - Null/undefined inputs not tested
  - Boundary conditions skipped
  - Error handling paths not covered

  Impact: Bug found in production/later review

  Process improvement: Add edge case checklist to verification phase
  - [ ] Test null/undefined/empty inputs
  - [ ] Test min/max boundary values
  - [ ] Test error conditions
  - [ ] Test concurrent access
```

### 2. Documentation Updates

**Check for:**
- Was README updated for new features?
- Were API docs updated?
- Were inline comments added for complex logic?
- Was CHANGELOG updated?
- Were examples/tutorials updated?

**Memory Suggestions:**
```yaml
# If docs were missed
title: "Forgot to update README after adding auth"
category: process_improvement
scope: project
tags: [documentation, process]
content: |
  Added JWT authentication in Task 1 but forgot to update README.

  What was missing:
  - Setup instructions for JWT secret
  - API authentication examples
  - Environment variable documentation

  Impact: Team members confused about setup

  Process improvement: Add documentation step to completion checklist
  - [ ] Update README.md
  - [ ] Update API docs
  - [ ] Update .env.example
  - [ ] Add inline comments for complex logic
```

### 3. Root Cause Analysis

**Check for:**
- Was root cause of bug actually found?
- Was just symptom fixed, not underlying issue?
- Could this bug happen elsewhere?
- Was preventive measure added?
- Was lesson documented?

**Memory Suggestions:**
```yaml
# If root cause not found
title: "Fixed symptom not root cause - payment bug"
category: process_improvement
scope: user
tags: [debugging, root-cause, quality]
content: |
  Fixed payment processing bug but didn't find root cause.

  Symptom: Duplicate charges occasionally
  Quick fix: Added deduplication check
  Root cause: Race condition in concurrent requests

  What was missed: Deeper investigation would have found race condition

  Impact: Fix prevented duplicates but didn't solve underlying concurrency issue

  Process improvement: Always ask "Why did this happen?" not just "How to fix?"
  - Don't just patch symptoms
  - Investigate underlying cause
  - Consider if same issue exists elsewhere
  - Add preventive measures
```

### 4. Security Considerations

**Check for:**
- Was security review performed?
- Were common vulnerabilities checked? (OWASP)
- Was input validation thorough?
- Were secrets properly handled?
- Was authorization checked?

**Memory Suggestions:**
```yaml
# If security oversight
title: "Missed input validation in file upload"
category: process_improvement
scope: project
tags: [security, validation, process]
content: |
  Implemented file upload but missed several security checks.

  What was missed:
  - File type validation (could upload .exe)
  - File size limit (could DoS with huge files)
  - Filename sanitization (path traversal possible)
  - Virus scanning consideration

  Impact: Security vulnerabilities discovered in later audit

  Process improvement: Security checklist for all user input features
  - [ ] Validate input type and format
  - [ ] Check size/length limits
  - [ ] Sanitize for injection attacks
  - [ ] Consider DoS scenarios
  - [ ] Test with malicious inputs
```

### 5. Error Handling and Logging

**Check for:**
- Are errors caught and handled?
- Are error messages helpful?
- Is logging comprehensive?
- Are errors traced (correlation IDs)?
- Is sensitive data excluded from logs?

**Memory Suggestions:**
```yaml
# If error handling weak
title: "Poor error handling in API endpoints"
category: process_improvement
scope: project
tags: [error-handling, logging, observability]
content: |
  API endpoints had inconsistent error handling.

  What was missing:
  - Generic 500 errors (not helpful)
  - No correlation IDs for tracing
  - Stack traces in production (info leak)
  - Errors not logged properly

  Impact: Hard to debug production issues

  Process improvement: Standardize error handling
  - Consistent error response format
  - Correlation ID in all requests
  - Proper logging levels (error/warn/info)
  - Sanitize errors in production
  - Include actionable error messages
```

### 6. Performance Considerations

**Check for:**
- Was performance tested?
- Are there obvious inefficiencies?
- Were database queries optimized?
- Was caching considered?
- Were resource limits checked?

**Memory Suggestions:**
```yaml
# If performance oversight
title: "N+1 query problem in user list endpoint"
category: process_improvement
scope: project
tags: [performance, database, optimization]
content: |
  Implemented user list but created N+1 query problem.

  What happened:
  - Load users: 1 query
  - Load each user's posts: N queries
  - Total: N+1 queries for N users

  Impact: Slow API response, high database load

  What was missed: Should have used JOIN or eager loading

  Process improvement: Check for N+1 patterns during review
  - Review all loops that query database
  - Use eager loading / JOINs
  - Test with realistic data volumes
  - Monitor query counts in logs
```

### 7. Backward Compatibility

**Check for:**
- Were breaking changes identified?
- Was migration path provided?
- Were deprecation warnings added?
- Was versioning considered?
- Were existing users/integrations considered?

**Memory Suggestions:**
```yaml
# If breaking change made
title: "Breaking API change without versioning"
category: process_improvement
scope: project
tags: [api, compatibility, versioning]
content: |
  Changed API response format without versioning.

  What happened:
  - Changed user endpoint from {id, name} to {userId, fullName}
  - Broke existing client integrations

  What was missed:
  - Should have used API versioning (/v2/)
  - Should have deprecated old format first
  - Should have documented breaking change

  Impact: Client applications broke, emergency rollback needed

  Process improvement: Breaking change checklist
  - [ ] Use API versioning
  - [ ] Deprecate before removing
  - [ ] Document breaking changes
  - [ ] Provide migration guide
  - [ ] Communicate to users/teams
```

### 8. Code Review Quality

**Check for:**
- Was adversarial review thorough?
- Were edge cases questioned?
- Were alternatives considered?
- Was code actually challenged?
- Was verification rigorous?

**Memory Suggestions:**
```yaml
# If review was superficial
title: "Superficial code review missed obvious bug"
category: process_improvement
scope: user
tags: [code-review, quality, adversarial]
content: |
  Code review passed but obvious bug was missed.

  What happened:
  - Reviewer said "looks good"
  - Didn't actually test the code
  - Didn't challenge assumptions
  - Missed null pointer scenario

  Impact: Bug found in production

  Process improvement: Adversarial review checklist
  - Actually run the code
  - Try to break it with edge cases
  - Question every assumption
  - Check error handling
  - Verify tests are meaningful
  - Don't just approve to be nice
```

### 9. Dependency Management

**Check for:**
- Were dependencies necessary?
- Are versions pinned?
- Were security vulnerabilities checked?
- Is dependency size reasonable?
- Are licenses compatible?

**Memory Suggestions:**
```yaml
# If dependency oversight
title: "Added dependency with known vulnerabilities"
category: process_improvement
scope: user
tags: [dependencies, security, supply-chain]
content: |
  Added npm package without security check.

  What was missed:
  - npm audit showed critical vulnerability
  - Package hadn't been updated in 2 years
  - Better alternative existed

  Impact: Security scan failed, had to replace package

  Process improvement: Dependency checklist
  - [ ] Run npm audit before adding
  - [ ] Check package maintenance status
  - [ ] Verify license compatibility
  - [ ] Consider bundle size impact
  - [ ] Look for alternatives
  - [ ] Pin versions in package.json
```

### 10. Deployment and Rollback

**Check for:**
- Was deployment process tested?
- Is rollback plan ready?
- Were environment differences handled?
- Are migrations reversible?
- Was monitoring configured?

**Memory Suggestions:**
```yaml
# If deployment oversight
title: "Database migration not reversible"
category: process_improvement
scope: project
tags: [deployment, database, rollback]
content: |
  Created database migration without down/rollback.

  What was missing:
  - No rollback script
  - Irreversible data transformation
  - No backup taken before migration

  Impact: When bug found, couldn't rollback easily

  Process improvement: Migration checklist
  - [ ] Write both up and down migrations
  - [ ] Test rollback before deploying
  - [ ] Backup database first
  - [ ] Make migrations idempotent
  - [ ] Test on staging environment
  - [ ] Have rollback plan ready
```

## Analysis Process

1. **Review recent tasks** - Look at completed/failed tasks
2. **Check each category** - Were these practices followed?
3. **Identify patterns** - What's commonly missed?
4. **Generate suggestions** - Create 2-4 specific memories
5. **Present to user** - Get approval for saving

## Memory Format for Process Improvements

```yaml
title: "Brief description of what was missed"
category: process_improvement
scope: user|project
tags: [relevant, tags, here]
created: "ISO timestamp"
confidence: high|medium

content: |
  ## What Was Missed
  Clear description of the oversight

  ## What Happened (Impact)
  Consequences of missing this practice

  ## Why It Was Missed
  Root cause of the oversight (rushed? forgot? didn't know?)

  ## Process Improvement
  Specific checklist or practice to prevent recurrence

  ## When to Apply
  Trigger: when does this checklist apply?

  ## Related Practices
  Other improvements that help
```

## Generating Suggestions

**Step 1:** Check workflow state
```bash
if [ -f ".claude/workflow-loop-state.json" ]; then
  # Check for tasks with specific patterns
  jq -r '.tasks[] | select(.status == "completed" or .status == "failed")' \
    .claude/workflow-loop-state.json
fi
```

**Step 2:** Look for indicators
```yaml
indicators:
  missing_tests:
    - Task completed quickly (< 20min)
    - No test files in changes
    - Tests not mentioned in report

  missing_docs:
    - README not in changed files
    - New API endpoints added
    - No documentation mentioned

  root_cause_missing:
    - Bug fix with "quick fix" language
    - No mention of investigation
    - No preventive measures added

  security_oversight:
    - User input handling
    - No validation mentioned
    - Security verification skipped
```

**Step 3:** Generate specific suggestions

Not generic ("write more tests") but specific:
- "Task 3 added file upload but missed security checks"
- "README not updated after adding JWT auth in Task 1"
- "Payment bug fixed symptom (dedup check) not root cause (race condition)"

**Step 4:** Present with context

Show user:
- What was missed
- Why it matters
- How to prevent next time
- Specific checklist to add

## Success Criteria

Process improvement suggestions are valuable when:
- ✓ Specific to actual work done (not generic advice)
- ✓ Actionable (clear checklist or practice)
- ✓ Prevents recurrence (addresses root cause)
- ✓ Includes context (why it matters)
- ✓ Based on real oversight (not hypothetical)

---

**Now analyze recent workflow execution and suggest specific process improvements.**
EOF

exit 0
