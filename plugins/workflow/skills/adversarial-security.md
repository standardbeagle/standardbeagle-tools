---
name: adversarial-security
description: Security-focused adversarial audit with OWASP patterns
---

# Adversarial Security Loop

Security audit with adversarial thinking and OWASP Top 10 patterns.

**Context Rule**: Runs INSIDE a subagent (fresh context for this security audit only).

## Execution Phases

### Phase 1: Threat Modeling (10% of time)

**Objective**: Map attack surface and identify threats

**Steps**:
1. Read task specification
2. Identify all entry points (APIs, forms, file uploads, etc.)
3. Map data flows (input → processing → storage → output)
4. Identify trust boundaries
5. List threat actors and motivations
6. Create attack vector checklist

**Output**: Threat model document

### Phase 2: Injection Testing (20% of time)

**Focus**: OWASP A03 - Injection

**Attack Vectors**:
- SQL injection
- NoSQL injection
- Command injection
- XSS (stored, reflected, DOM-based)
- Template injection
- LDAP injection

**Test Cases**:
```yaml
injection_tests:
  sql:
    - "' OR '1'='1"
    - "'; DROP TABLE users--"
    - "1 UNION SELECT * FROM passwords"

  xss:
    - "<script>alert('XSS')</script>"
    - "javascript:alert(1)"
    - "<img src=x onerror=alert(1)>"

  command:
    - "; ls -la"
    - "| cat /etc/passwd"
    - "`rm -rf /`"
```

### Phase 3: Authentication & Authorization (20% of time)

**Focus**: OWASP A01, A07 - Broken Auth, Identification and Auth Failures

**Test Cases**:
```yaml
auth_tests:
  authentication:
    - "Brute force protection exists?"
    - "Credentials properly hashed (bcrypt/argon2)?"
    - "Session management secure?"
    - "Multi-factor authentication available?"

  authorization:
    - "Horizontal privilege escalation possible?"
    - "Vertical privilege escalation possible?"
    - "Direct object reference protection?"
    - "Role-based access control correct?"
```

### Phase 4: Data Protection (20% of time)

**Focus**: OWASP A02, A04 - Cryptographic Failures, Insecure Design

**Test Cases**:
```yaml
data_protection_tests:
  encryption:
    - "Sensitive data encrypted at rest?"
    - "TLS used for data in transit?"
    - "Strong algorithms (AES-256, RSA-2048+)?"
    - "No hardcoded secrets?"

  exposure:
    - "PII properly protected?"
    - "Error messages don't leak info?"
    - "Debug info disabled in production?"
    - "Sensitive data in logs?"
```

### Phase 5: Configuration & Dependencies (15% of time)

**Focus**: OWASP A05, A06, A08 - Security Misconfiguration, Vulnerable Components, Software and Data Integrity Failures

**Test Cases**:
```yaml
config_tests:
  configuration:
    - "Default credentials changed?"
    - "Unnecessary features disabled?"
    - "Security headers present?"
    - "CORS properly configured?"

  dependencies:
    - "Vulnerable dependencies (npm audit)?"
    - "Dependency pinning?"
    - "Regular updates scheduled?"
```

### Phase 6: Security Report (15% of time)

**Objective**: Document findings and recommendations

**Report Structure**:
```yaml
security_report:
  executive_summary: "High-level overview"

  critical_findings:
    - title: "Issue title"
      severity: "Critical"
      owasp: "A03"
      description: "What's vulnerable"
      exploit: "How to exploit"
      impact: "What happens"
      remediation: "How to fix"
      status: "found|fixed|accepted_risk"

  high_findings: [...]
  medium_findings: [...]
  low_findings: [...]

  positive_findings:
    - "What was done well"

  recommendations:
    - "Actionable security improvements"

  next_steps:
    - "What must be fixed before release"
```

## Adversarial Mindset

Throughout audit:

```yaml
attacker_mindset:
  questions:
    - "What's the worst I can do?"
    - "How would I steal data?"
    - "How would I gain admin access?"
    - "What crashes the system?"
    - "Where are secrets leaked?"

  techniques:
    - "Assume all input is malicious"
    - "Trust nothing from client"
    - "Question every boundary"
    - "Look for subtle logic flaws"
```

## Critical Finding Protocol

If critical security issue found:

```yaml
critical_protocol:
  immediate:
    - "Document finding in detail"
    - "Mark task as FAILED with security flag"
    - "Update loop state file"
    - "Return to main loop with STOP recommendation"

  main_loop:
    - "Stop loop immediately"
    - "Notify user of critical issue"
    - "Require explicit acknowledgment to continue"
```

## Context Management

**Between Phases**: Write checkpoint, explicitly reset focus

**Verifier Spawn**: For independent security review, spawn security-auditor agent

## Usage

This skill is invoked by workflow:task-executor agent when loop type is "security".
