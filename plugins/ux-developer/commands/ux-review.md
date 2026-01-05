---
name: ux-review
description: Comprehensive UX review of a page, component, or user flow using established heuristics and best practices
---

# UX Review Command

Perform a comprehensive UX review of the specified target (page, component, or flow).

## Process

### 1. Gather Context

First, understand what we're reviewing:
- Ask the user what they want reviewed (page URL, component, or code)
- If a URL is provided, use agnt proxy to capture and analyze the page
- If code is provided, analyze the implementation directly

### 2. Start Development Proxy (if reviewing live page)

```
Use mcp__agnt__proxy to start a proxy for the target URL
Use mcp__agnt__proxy exec to take a screenshot
Use mcp__agnt__currentpage to get page session data
```

### 3. Apply Nielsen's 10 Heuristics

Evaluate against each heuristic and score 1-5:

| Heuristic | Score | Issues | Recommendations |
|-----------|-------|--------|-----------------|
| Visibility of system status | | | |
| Match between system and real world | | | |
| User control and freedom | | | |
| Consistency and standards | | | |
| Error prevention | | | |
| Recognition rather than recall | | | |
| Flexibility and efficiency of use | | | |
| Aesthetic and minimalist design | | | |
| Help users recognize and recover from errors | | | |
| Help and documentation | | | |

### 4. Accessibility Quick Check

Run accessibility audit:
```
Use mcp__agnt__proxy exec with __devtool.auditAccessibility()
```

Flag critical issues:
- Missing alt text
- Insufficient color contrast
- Missing form labels
- Keyboard navigation issues
- Missing ARIA landmarks

### 5. Mobile/Responsive Check

Evaluate:
- Touch target sizes (minimum 44x44px)
- Content reflow at narrow widths
- Font sizes readable without zoom
- No horizontal scrolling required

### 6. Performance Impact on UX

Check via agnt:
```
Use mcp__agnt__currentpage to get performance metrics
```

Flag UX-impacting issues:
- Slow first contentful paint
- Layout shifts (CLS)
- Long blocking tasks

### 7. Generate Report

Provide structured report:

```markdown
## UX Review Summary

**Target**: [what was reviewed]
**Overall Score**: X/50

### Critical Issues (Must Fix)
1. [Issue]: [Impact] - [Recommendation]

### Major Issues (Should Fix)
1. [Issue]: [Impact] - [Recommendation]

### Minor Issues (Nice to Fix)
1. [Issue]: [Impact] - [Recommendation]

### Strengths
- [What's working well]

### Prioritized Action Items
1. [ ] [Highest priority fix]
2. [ ] [Second priority]
3. [ ] [Third priority]
```

## Integration with Development

After review, offer to:
1. Create tasks in Dart for each issue
2. Generate fix suggestions with code examples
3. Set up continuous monitoring with agnt proxy
