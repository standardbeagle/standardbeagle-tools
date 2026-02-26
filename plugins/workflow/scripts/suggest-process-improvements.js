#!/usr/bin/env node
/**
 * Suggest process improvements based on common oversights during coding
 */

const PROMPT = `# Process Improvement Memory Suggestions

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

### 2. Documentation Updates

**Check for:**
- Was README updated for new features?
- Were API docs updated?
- Were inline comments added for complex logic?
- Was CHANGELOG updated?
- Were examples/tutorials updated?

### 3. Root Cause Analysis

**Check for:**
- Was root cause of bug actually found?
- Was just symptom fixed, not underlying issue?
- Could this bug happen elsewhere?
- Was preventive measure added?
- Was lesson documented?

### 4. Security Considerations

**Check for:**
- Was security review performed?
- Were common vulnerabilities checked? (OWASP)
- Was input validation thorough?
- Were secrets properly handled?
- Was authorization checked?

### 5. Error Handling and Logging

**Check for:**
- Are errors caught and handled?
- Are error messages helpful?
- Is logging comprehensive?
- Are errors traced (correlation IDs)?
- Is sensitive data excluded from logs?

### 6. Performance Considerations

**Check for:**
- Was performance tested?
- Are there obvious inefficiencies?
- Were database queries optimized?
- Was caching considered?
- Were resource limits checked?

### 7. Backward Compatibility

**Check for:**
- Were breaking changes identified?
- Was migration path provided?
- Were deprecation warnings added?
- Was versioning considered?
- Were existing users/integrations considered?

### 8. Code Review Quality

**Check for:**
- Was adversarial review thorough?
- Were edge cases questioned?
- Were alternatives considered?
- Was code actually challenged?
- Was verification rigorous?

### 9. Dependency Management

**Check for:**
- Were dependencies necessary?
- Are versions pinned?
- Were security vulnerabilities checked?
- Is dependency size reasonable?
- Are licenses compatible?

### 10. Deployment and Rollback

**Check for:**
- Was deployment process tested?
- Is rollback plan ready?
- Were environment differences handled?
- Are migrations reversible?
- Was monitoring configured?

## Analysis Process

1. **Review recent tasks** - Look at completed/failed tasks
2. **Check each category** - Were these practices followed?
3. **Identify patterns** - What's commonly missed?
4. **Generate suggestions** - Create 2-4 specific memories
5. **Present to user** - Get approval for saving

## Success Criteria

Process improvement suggestions are valuable when:
- ✓ Specific to actual work done (not generic advice)
- ✓ Actionable (clear checklist or practice)
- ✓ Prevents recurrence (addresses root cause)
- ✓ Includes context (why it matters)
- ✓ Based on real oversight (not hypothetical)

---

**Now analyze recent workflow execution and suggest specific process improvements.**
`;

console.log(PROMPT);
process.exit(0);
