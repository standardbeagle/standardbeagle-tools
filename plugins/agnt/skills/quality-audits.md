---
name: quality-audits
description: Page quality audits for DOM complexity, CSS architecture, security vulnerabilities, and SEO/meta tag validation
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Quality Audits Skill

This skill documents page quality audit functions available through the `__devtool` API. These audits detect DOM complexity issues, CSS architecture problems, security vulnerabilities, and SEO deficiencies.

## Invocation Format

All audit functions are called using proxy exec:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "<proxy_id>",
    "code": "__devtool.<function>(...)"
  }
}
```

**Prerequisites**: A proxy must be running and the browser must be connected via the proxy URL.

---

## Output Modes

All audit functions support two output modes:

| Mode | Flag | Description | Use Case |
|------|------|-------------|----------|
| **Default** | (none) | AI-optimized output with grouped issues, limited examples, token-efficient | Regular development workflow |
| **Raw** | `raw: true` | Verbose detailed format with all issues and full context | Deep investigation, manual review |

**When to use raw mode**:
- Need to see every individual issue
- Debugging specific elements
- Generating detailed reports
- Need full HTML context for fixes

---

## auditDOMComplexity

Analyze DOM structure for performance issues including depth, element count, and structural complexity.

**Signature**: `auditDOMComplexity(options?)`

**Parameters**:
- `options.raw`: boolean - Return verbose output (default: false)

**Thresholds (Lighthouse)**:
- Total nodes: < 1500 (optimal < 800)
- Max depth: < 32 (optimal < 15)
- Max children: < 60 (optimal < 30)

### Default Mode (AI-Optimized)

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditDOMComplexity()"
  }
}
```

**Response Structure**:
```json
{
  "totalNodes": 2500,
  "maxDepth": 45,
  "maxChildren": 120,
  "thresholds": {
    "nodes": { "value": 2500, "limit": 1500, "exceeded": true },
    "depth": { "value": 45, "limit": 32, "exceeded": true },
    "children": { "value": 120, "limit": 60, "exceeded": true }
  },
  "scores": {
    "nodes": 40,
    "depth": 20,
    "children": 20,
    "overall": 27
  },
  "rating": "poor",
  "issues": [
    {
      "type": "excessive-children",
      "severity": "error",
      "count": 3,
      "examples": ["ul.product-list", "div.sidebar", "table.data"]
    },
    {
      "type": "excessive-depth",
      "severity": "warning",
      "count": 5,
      "examples": ["div.nested > div > div"]
    }
  ],
  "recommendations": [
    "Reduce DOM nodes (current: 2500, recommended: <1500). Consider virtualization for lists.",
    "Flatten DOM structure (current depth: 45, recommended: <32)."
  ]
}
```

### Raw Mode (Verbose)

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditDOMComplexity({raw: true})"
  }
}
```

**Raw response includes**:
- Full selector path for every problematic element
- HTML snippets for context
- Individual impact scores per issue
- Specific fix recommendations per element

### Issue Types

| Type | Severity | Description | Fix |
|------|----------|-------------|-----|
| `duplicate-id` | error | Multiple elements with same ID | Ensure all IDs are unique |
| `excessive-children` | warning/error | >10 direct children (error if >50) | Componentization or grouping |
| `excessive-depth` | warning/error | >15 nesting levels (error if >20) | Flatten or extract to component |
| `excessive-attributes` | warning | >10 attributes on element | Use CSS classes instead |
| `large-list` | warning/error | List with >50 items (error if >200) | Virtualization or pagination |
| `large-table` | warning/error | Table with >100 rows (error if >500) | Pagination or virtual scroll |
| `large-form` | warning | Form with >20 inputs | Multi-step form or accordion |

---

## auditCSS

Comprehensive CSS architecture audit analyzing specificity, containment, responsive strategies, and design consistency.

**Signature**: `auditCSS(options?)`

**Parameters**:
- `options.raw`: boolean - Return verbose output (default: false)
- `options.includeTailwind`: boolean - Include Tailwind analysis (default: true)

### Default Mode (AI-Optimized)

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditCSS()"
  }
}
```

**Response Structure**:
```json
{
  "summary": {
    "totalSelectors": 450,
    "uniqueClasses": 234,
    "namingConvention": "utility",
    "responsiveStrategy": "hybrid",
    "uniqueColors": 34,
    "uniqueFontSizes": 12,
    "usingTailwind": true
  },
  "issues": [
    {
      "type": "excessive-ids",
      "severity": "warning",
      "count": 8,
      "message": "8 selectors use IDs - high specificity, hard to override"
    },
    {
      "type": "important-overuse",
      "severity": "error",
      "count": 15,
      "message": "15 !important declarations found"
    }
  ],
  "overallScore": 72,
  "grade": "C"
}
```

### Raw Mode (Verbose)

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditCSS({raw: true})"
  }
}
```

**Raw response includes**:
- Full `architecture` audit (specificity distribution, fragile patterns)
- Full `containment` audit (CSS containment usage, candidates)
- Full `responsive` audit (media queries, container queries)
- Full `consistency` audit (colors, fonts, spacing values)
- Full `tailwind` audit (if detected)

### Issue Types

| Type | Severity | Description |
|------|----------|-------------|
| `excessive-ids` | warning | Many ID selectors causing specificity issues |
| `deep-nesting` | warning | Selectors with >4 levels of nesting |
| `important-overuse` | error | Too many `!important` declarations (>10) |
| `specificity-wars` | warning | >10% of selectors have extreme specificity |
| `color-inconsistency` | warning | >30 unique colors |
| `fragile-patterns` | warning | Universal selectors, positional selectors |

### Score Interpretation

| Grade | Score | Interpretation |
|-------|-------|----------------|
| A | 90+ | Excellent CSS architecture |
| B | 80-89 | Good, minor improvements possible |
| C | 70-79 | Needs improvement |
| D | 60-69 | Significant issues |
| F | <60 | Major refactoring needed |

---

## auditSecurity

Comprehensive security audit checking for XSS vulnerabilities, mixed content, CSP issues, and framework security.

**Signature**: `auditSecurity(options?)`

**Parameters**:
- `options.raw`: boolean - Return verbose output (default: false)

### Default Mode (AI-Optimized)

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditSecurity()"
  }
}
```

**Response Structure**:
```json
{
  "summary": {
    "frameworkDetected": "React",
    "totalIssues": 12,
    "criticalIssues": 2,
    "httpsEnabled": true,
    "cspEnabled": true
  },
  "criticalIssues": [
    {
      "type": "javascript-urls",
      "severity": "error",
      "count": 2,
      "message": "javascript: URLs found - XSS risk"
    }
  ],
  "issues": [
    {
      "type": "inline-scripts",
      "severity": "warning",
      "count": 5,
      "message": "5 inline scripts found"
    },
    {
      "type": "missing-sri",
      "severity": "warning",
      "count": 3,
      "message": "3 external scripts without SRI"
    }
  ],
  "overallScore": 75,
  "grade": "C"
}
```

### Raw Mode (Verbose)

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditSecurity({raw: true})"
  }
}
```

**Raw response includes**:
- Full `headers` audit (CSP, HTTPS, mixed content)
- Full `domSecurity` audit (inline scripts, event handlers, javascript URLs)
- Full `framework` audit (dev builds, vulnerable libraries)
- Full `forms` audit (CSRF tokens, autocomplete)
- Full `resources` audit (external scripts, iframes, SRI)
- Full `prototype` audit (prototype pollution vulnerabilities)

### Security Issue Types

| Type | Severity | Description |
|------|----------|-------------|
| `javascript-urls` | error | `javascript:` URLs (XSS vector) |
| `inline-scripts` | warning | Inline `<script>` tags |
| `inline-event-handlers` | warning | onclick, onload, etc. |
| `missing-csp` | warning | No Content-Security-Policy |
| `mixed-content-active` | error | Scripts/CSS over HTTP |
| `mixed-content-passive` | warning | Images/iframes over HTTP |
| `missing-sri` | warning | External scripts without integrity |
| `unsandboxed-iframe` | warning | External iframe without sandbox |
| `missing-csrf` | warning | POST form without CSRF token |
| `react-dev-build` | error | React development build in production |
| `vue-v-html` | warning | Using v-html (potential XSS) |
| `jquery-vulnerable` | warning | jQuery < 3.5.0 |

### Score Components

| Component | Weight |
|-----------|--------|
| Security Headers | 25% |
| DOM Security | 25% |
| Form Security | 20% |
| Framework Quality | 15% |
| External Resources | 15% |

---

## auditPageQuality

Comprehensive page quality audit combining DOM, CSS, accessibility, security, and performance checks.

**Signature**: `auditPageQuality(options?)`

**Parameters**:
- `options.raw`: boolean - Return verbose output (default: false)

### Default Mode (AI-Optimized)

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditPageQuality()"
  }
}
```

**Response Structure**:
```json
{
  "scores": {
    "dom": 70,
    "tbt": 60,
    "memory": 100,
    "eventListeners": 70,
    "text": 85,
    "responsive": 90,
    "cls": 100
  },
  "overallScore": 78,
  "grade": "C",
  "criticalIssues": [
    { "category": "dom", "message": "Excessive DOM nodes: 2500" },
    { "category": "performance", "message": "High Total Blocking Time: 450ms" }
  ],
  "recommendations": [
    {
      "priority": 1,
      "category": "performance",
      "issue": "TBT is 450ms",
      "fix": "Break up long tasks. Use web workers for heavy computation."
    },
    {
      "priority": 2,
      "category": "dom",
      "issue": "DOM has 2500 nodes",
      "fix": "Target <1500 nodes. Use virtualization for long lists."
    }
  ]
}
```

### Raw Mode (Verbose)

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditPageQuality({raw: true})"
  }
}
```

**Raw response includes**:
- Full `dom` details (auditDOMComplexity results)
- Full `memory` details (captureMemoryMetrics results)
- Full `tbt` details (estimateTBT results)
- Full `eventListeners` details (auditEventListeners results)
- Full `performance` details (capturePerformanceMetrics results)
- Full `textFragility` and `responsiveRisk` details

### Score Categories

| Category | What It Measures | Good Threshold |
|----------|------------------|----------------|
| `dom` | DOM node count, depth, children | < 1500 nodes, < 32 depth |
| `tbt` | Total Blocking Time | < 200ms |
| `memory` | JS heap usage | < 50% of limit |
| `eventListeners` | Inline event handlers | < 10 handlers |
| `text` | Text fragility (overflow risk) | No critical issues |
| `responsive` | Responsive design robustness | No critical issues |
| `cls` | Cumulative Layout Shift | < 0.1 |

---

## Interpreting Audit Results

### Severity Levels

| Level | Description | Action Required |
|-------|-------------|-----------------|
| **error** | Blocks functionality or creates security risk | Must fix immediately |
| **warning** | Impacts performance or maintainability | Should fix before release |
| **info** | Optimization opportunity | Fix when convenient |

### Priority-Based Remediation

When fixing issues, follow this priority order:

1. **Critical/Error severity** - Fix immediately
2. **Security issues** - Fix before deployment
3. **Performance blockers** (TBT, DOM complexity) - Fix before release
4. **Maintainability issues** (CSS specificity, naming) - Plan for refactoring
5. **Informational** - Address during regular maintenance

---

## Common Workflows

### Workflow 1: Pre-Release Quality Check

Run comprehensive quality audit:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditPageQuality()"
  }
}
```

Check security separately:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditSecurity()"
  }
}
```

**Pass criteria**:
- Grade B or higher (score >= 80)
- No critical security issues
- No error-severity issues

---

### Workflow 2: DOM Performance Investigation

Start with AI-optimized audit:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditDOMComplexity()"
  }
}
```

If issues found, get detailed information:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditDOMComplexity({raw: true})"
  }
}
```

Highlight problematic elements:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.highlight('ul.product-list', {color: 'red', label: 'Heavy list'})"
  }
}
```

---

### Workflow 3: CSS Architecture Review

Check CSS health:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditCSS()"
  }
}
```

Get detailed breakdown for refactoring:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditCSS({raw: true})"
  }
}
```

**Key areas to review**:
- `architecture.idSelectors` - ID selectors to refactor
- `architecture.fragilePatterns` - Patterns to fix
- `consistency.colors` - Color palette consolidation
- `tailwind.usage.arbitraryValues` - Config extension candidates

---

### Workflow 4: Security Pre-Deploy Check

Run security audit:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditSecurity()"
  }
}
```

**Deployment blockers** (must pass):
- `httpsEnabled: true`
- `criticalIssues.length === 0`
- No `react-dev-build` issues
- No `javascript-urls` issues

If issues found, get raw details:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditSecurity({raw: true})"
  }
}
```

---

### Workflow 5: Comprehensive Page Analysis

Full quality check:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditPageQuality()"
  }
}
```

Take screenshot for visual reference:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.screenshot('quality-audit')"
  }
}
```

Check accessibility:

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "proxy",
  "parameters": {
    "action": "exec",
    "id": "dev",
    "code": "__devtool.auditAccessibility()"
  }
}
```

---

## Quick Reference Table

| Function | Purpose | Key Return Values |
|----------|---------|-------------------|
| `auditDOMComplexity(opts)` | DOM structure analysis | scores, rating, issues, recommendations |
| `auditCSS(opts)` | CSS architecture audit | grade, score, issues by type |
| `auditSecurity(opts)` | Security vulnerability check | grade, score, criticalIssues |
| `auditPageQuality(opts)` | Comprehensive quality check | scores by category, grade, recommendations |

---

## Performance Considerations

| Audit | Speed | Impact |
|-------|-------|--------|
| `auditDOMComplexity` | Fast (50-100ms) | Scans all elements |
| `auditCSS` | Moderate (100-500ms) | Analyzes stylesheets |
| `auditSecurity` | Moderate (100-300ms) | Multiple sub-audits |
| `auditPageQuality` | Slow (500-2000ms) | Runs all audits |

**Tips**:
- Use individual audits for targeted checks
- Use `auditPageQuality` for comprehensive pre-release review
- Default mode is faster than raw mode

---

## Audit Thresholds Reference

### DOM Complexity

| Metric | Good | Moderate | Poor |
|--------|------|----------|------|
| Total Nodes | < 800 | 800-1500 | > 1500 |
| Max Depth | < 15 | 15-32 | > 32 |
| Max Children | < 30 | 30-60 | > 60 |

### CSS Health

| Metric | Good | Moderate | Poor |
|--------|------|----------|------|
| ID Selectors | < 5 | 5-10 | > 10 |
| !important | < 5 | 5-10 | > 10 |
| Unique Colors | < 15 | 15-30 | > 30 |
| Nesting Depth | < 4 | 4-6 | > 6 |

### Performance

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| TBT | < 200ms | 200-600ms | > 600ms |
| LCP | < 2500ms | 2500-4000ms | > 4000ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |
