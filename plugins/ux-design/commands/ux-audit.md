---
name: ux-audit
description: Conduct a comprehensive UX evaluation using Nielsen's heuristics and usability best practices
---

# UX Heuristic Audit

You are conducting a thorough UX evaluation using Nielsen's 10 heuristics and modern usability principles. Use the ux-heuristics skill as your foundation.

## Audit Setup

### 1. Define Scope
"What are we evaluating?
- Entire application
- Specific user flow(s)
- Single feature or page
- Comparison between versions"

### 2. Gather Materials
Request from user:
- Screenshots or access to the interface
- Key user flows to evaluate
- User personas or target audience description
- Known pain points (if any)
- Business goals for the experience

### 3. Establish Context
"What context should I keep in mind?
- Target users (expertise level, demographics)
- Platform constraints (mobile, desktop, both)
- Domain-specific conventions
- Competitive context"

## Systematic Evaluation

Evaluate each heuristic systematically:

### Evaluation Template Per Screen/Flow

```
SCREEN: [Name]
USER GOAL: [What user is trying to accomplish]

──────────────────────────────────────────────────────────────
1. VISIBILITY OF SYSTEM STATUS
──────────────────────────────────────────────────────────────
Observations:
[What status feedback exists?]

Issues Found:
[ ] #001 | Severity: X | [Issue description]
[ ] #002 | Severity: X | [Issue description]

Recommendations:
- [Specific improvement suggestion]
──────────────────────────────────────────────────────────────

2. MATCH BETWEEN SYSTEM AND REAL WORLD
──────────────────────────────────────────────────────────────
Observations:
[Does language/iconography match user expectations?]

Issues Found:
[ ] #003 | Severity: X | [Issue description]

Recommendations:
- [Specific improvement suggestion]
──────────────────────────────────────────────────────────────

[Continue for all 10 heuristics...]
```

### Severity Rating Scale

```
Severity 0: Not a usability problem
Severity 1: Cosmetic only - fix if time allows
Severity 2: Minor - low priority
Severity 3: Major - important to fix
Severity 4: Catastrophic - must fix before release
```

### Severity Assessment Criteria

```
           │ Low Frequency │ High Frequency │
───────────┼───────────────┼────────────────│
Low Impact │ 1 (Cosmetic)  │ 2 (Minor)      │
High Impact│ 3 (Major)     │ 4 (Critical)   │
```

## Issue Documentation

For each issue found, document:

```
Issue #[XXX]
────────────────────────────────────────
Heuristic: [Which heuristic violated]
Severity:  [0-4]
Location:  [Screen/element where found]

Description:
[Clear description of the problem]

Impact:
[How this affects users]

Evidence:
[Screenshot reference or specific observation]

Recommendation:
[Concrete suggestion for improvement]

Priority: [Low / Medium / High / Critical]
Effort:   [Low / Medium / High]
────────────────────────────────────────
```

## Quick Checks to Perform

### Visual Scan
- [ ] Clear visual hierarchy (squint test)
- [ ] Consistent styling throughout
- [ ] Adequate contrast for text/UI
- [ ] Clear focus indicators
- [ ] Appropriate whitespace

### Interaction Check
- [ ] All actions have feedback
- [ ] Loading states present
- [ ] Error states handled
- [ ] Undo available for destructive actions
- [ ] Keyboard navigation works

### Content Check
- [ ] Clear, jargon-free language
- [ ] Error messages are helpful
- [ ] Labels are descriptive
- [ ] Instructions provided where needed
- [ ] Empty states give guidance

### Navigation Check
- [ ] Current location clear
- [ ] Path to goals is logical
- [ ] Back/escape always available
- [ ] No dead ends
- [ ] Search available (if needed)

## Findings Summary

Compile findings into prioritized report:

### Executive Summary

```
UX AUDIT SUMMARY
═══════════════════════════════════════════════════════

Scope:     [What was evaluated]
Date:      [Date of evaluation]
Evaluator: [Who conducted]

OVERALL ASSESSMENT: [Strong / Acceptable / Needs Work / Critical Issues]

────────────────────────────────────────────────────────
Issue Distribution:
────────────────────────────────────────────────────────
Severity 4 (Critical):    X issues
Severity 3 (Major):       X issues
Severity 2 (Minor):       X issues
Severity 1 (Cosmetic):    X issues
────────────────────────────────────────────────────────
Total Issues:             X

Most Violated Heuristics:
1. [Heuristic name] - X violations
2. [Heuristic name] - X violations
3. [Heuristic name] - X violations
═══════════════════════════════════════════════════════
```

### Prioritized Issue List

```
CRITICAL (Must Fix)
───────────────────
#XXX - [Brief description] (Severity 4)
#XXX - [Brief description] (Severity 4)

HIGH PRIORITY
───────────────────
#XXX - [Brief description] (Severity 3)
#XXX - [Brief description] (Severity 3)

MEDIUM PRIORITY
───────────────────
#XXX - [Brief description] (Severity 2)

LOW PRIORITY
───────────────────
#XXX - [Brief description] (Severity 1)
```

### Positive Observations

Also note what works well:
```
STRENGTHS IDENTIFIED
───────────────────────────────────────
✓ [Positive observation 1]
✓ [Positive observation 2]
✓ [Positive observation 3]
```

## Recommendations

### Quick Wins
Issues that can be fixed easily with high impact:
- Issue #XXX: [Brief fix description]

### Strategic Improvements
Larger improvements for planning:
- [Improvement area]: [Description and rationale]

### Further Research Needed
Areas requiring user testing to validate:
- [Area]: [What to test and why]

## Follow-Up Actions

Suggest next steps:
1. Address critical issues immediately
2. Plan major issues into next sprint/cycle
3. Create backlog items for minor issues
4. Schedule re-evaluation after changes
5. Consider user testing for validation

## Deliverables

Provide:
1. **Executive Summary** - High-level findings
2. **Issue Log** - All issues with details
3. **Priority Matrix** - Issues by severity/effort
4. **Recommendations** - Actionable improvements
5. **Checklist** - Verification items for fixes
