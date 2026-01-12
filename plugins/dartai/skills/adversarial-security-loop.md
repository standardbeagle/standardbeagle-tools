---
name: adversarial-security-loop
description: Adversarial cooperation loop for security auditing with OWASP patterns and vulnerability verification
---

# Adversarial Security Loop (Ralph Wiggum Pattern)

A continuous execution loop where a security auditor adversarially attacks code while a defender hardens it. Based on OWASP Top 10 and security best practices.

## Core Principles

### Context-Sized Security Tasks
Each security task must be:
- **Scoped**: One attack vector or vulnerability class per task
- **Documented**: Clear threat model and attack surface
- **Testable**: Reproducible exploitation attempts
- **Prioritized**: Critical vulnerabilities first

### Security Priority Levels
```yaml
severity_levels:
  critical:
    description: "Remote code execution, data breach, auth bypass"
    response: "STOP all work, fix immediately"
    sla: "same day"

  high:
    description: "Privilege escalation, sensitive data exposure"
    response: "Fix before next release"
    sla: "24-48 hours"

  medium:
    description: "Session issues, minor data leaks"
    response: "Schedule fix in current sprint"
    sla: "1 week"

  low:
    description: "Information disclosure, best practice violations"
    response: "Track and fix when convenient"
    sla: "next quarter"
```

### Plan Adjustment Protocol
```yaml
plan_adjustment_rules:
  automatic_continuation:
    description: "Phase transitions are automatic, not approval gates"
    behavior: "Adjust plan silently and continue"

  when_to_stop:
    - "CRITICAL vulnerability found (fix IMMEDIATELY)"
    - "Active exploitation possible"
    - "Data breach risk"

  when_to_continue:
    - "Medium/low issues found (add fix tasks, continue)"
    - "Configuration issues (note and continue)"
    - "Missing hardening (add to plan, continue)"
    - "Best practice violations (add to backlog, continue)"

  never_ask:
    - "Should I continue the audit?"
    - "Is this secure enough?"
    - "Ready for next security phase?"

  critical_exception: |
    For CRITICAL security issues only:
    1. STOP immediately
    2. Report vulnerability
    3. Do NOT continue until fixed
    This is the ONLY valid stop condition.
```

---

## Eagle-Eyed Security Violations (IMMEDIATE REJECTION)

The security auditor must be **ruthlessly vigilant** for these violations. Security shortcuts are never acceptable.

### 1. Scope Creep & Over-Engineering Security
```yaml
security_scope_violations:
  excessive_hardening:
    description: "Adding security measures not required for the threat model"
    examples:
      - "Implementing enterprise SSO for internal tool"
      - "Adding WAF rules for localhost-only service"
      - "Military-grade encryption for non-sensitive data"
      - "Complex RBAC when simple auth suffices"
    detection: "Does this security measure address a real threat?"
    verdict: "REJECT - security proportional to threat"

  security_theater:
    description: "Security measures that look good but don't help"
    examples:
      - "Obscuring error codes without fixing root cause"
      - "Adding CAPTCHA without rate limiting"
      - "Hashing passwords with MD5 'but with salt'"
      - "Hiding admin URL instead of requiring auth"
    detection: "Does this actually prevent the attack?"
    verdict: "REJECT - implement real security or nothing"

  premature_security:
    description: "Security infrastructure before it's needed"
    examples:
      - "Building audit logging before any users"
      - "Implementing MFA for development environment"
      - "Creating security review workflows for POC"
    detection: "Is this proportional to current risk?"
    verdict: "REJECT - scale security with actual risk"
```

### 2. Over-Complicated Security Code
```yaml
security_complexity_violations:
  complex_auth:
    description: "Authentication logic too complex to verify"
    examples:
      - "Custom crypto implementations"
      - "Hand-rolled JWT validation"
      - "DIY password hashing"
      - "Complex session management state machines"
    detection: "Using battle-tested libraries?"
    verdict: "REJECT - use standard libraries or justify thoroughly"

  convoluted_access_control:
    description: "Authorization logic that can't be audited"
    examples:
      - "Dynamic permission generation"
      - "Recursive role inheritance"
      - "Context-dependent access rules"
      - "Multiple overlapping permission systems"
    detection: "Can you explain who has access to what in 1 minute?"
    verdict: "REJECT - simplify until auditable"

  obscure_security:
    description: "Security through obscurity or complexity"
    examples:
      - "Encoding instead of encrypting"
      - "Complex validation that misses simple attacks"
      - "Security checks buried in business logic"
      - "Non-standard protocols without justification"
    detection: "Would this survive Kerckhoffs's principle?"
    verdict: "REJECT - use transparent, standard approaches"
```

### 3. Incomplete Security Markers
```yaml
security_marker_violations:
  todo_security:
    patterns:
      - "// TODO: add input validation"
      - "# TODO: sanitize output"
      - "// FIXME: rate limiting needed"
      - "// TODO: add authentication"
      - "/* TODO: encrypt this */"
    verdict: "REJECT IMMEDIATELY - security TODOs are vulnerabilities"

  disabled_security:
    patterns:
      - "// SECURITY: disabled for testing"
      - "if (DEBUG) skip_auth()"
      - "verify: false  // temporary"
      - "# nosec  // will fix later"
      - "@SuppressWarnings('security')"
    verdict: "REJECT IMMEDIATELY - no disabled security in reviews"

  known_vulnerabilities:
    patterns:
      - "// Known issue: SQL injection possible"
      - "# WARNING: XSS not fully fixed"
      - "// VULNERABILITY: timing attack possible"
      - "// INSECURE: using for backwards compat"
    verdict: "REJECT IMMEDIATELY - fix before committing"

  placeholder_security:
    patterns:
      - "password = 'changeme'"
      - "secret_key = 'development'"
      - "api_key = 'xxx'"
      - "token = 'test123'"
    verdict: "REJECT IMMEDIATELY - no placeholder secrets"
```

### 4. Security Cop-outs
```yaml
security_cop_out_violations:
  surrender_phrases:
    comments:
      - "Security isn't perfect but it's good enough"
      - "This would be too hard to exploit"
      - "Only internal users have access anyway"
      - "We'll add proper security later"
      - "The firewall will stop this"
      - "Users won't try this"
    verdict: "REJECT - no excuses for security gaps"

  incomplete_fixes:
    patterns:
      - "Partial input validation"
      - "Some endpoints secured, others not"
      - "Sanitized in some places, not others"
      - "Rate limited on POST but not GET"
    verdict: "REJECT - security must be complete"

  shifting_responsibility:
    phrases:
      - "The frontend handles validation"
      - "The API gateway does auth"
      - "The database will reject bad data"
      - "Users should know better"
    verdict: "REJECT - defense in depth required"

  too_hard_excuses:
    phrases:
      - "Can't encrypt because performance"
      - "Rate limiting would break the API"
      - "Input validation is too complex"
      - "Would require rewriting the auth system"
    required_response: |
      If genuinely blocked by security requirements:
      1. Document specific technical constraint
      2. Propose alternative mitigation
      3. Escalate for architecture review
      DO NOT ship known vulnerabilities
```

### 5. Eagle-Eye Security Checklist
```yaml
eagle_eye_security_scan:
  run_before_any_approval: true

  automated_checks:
    - grep_for_secrets: "grep -rn 'password=\\|secret=\\|api_key=' --include='*.{js,ts,py,go,json,yaml}'"
    - grep_for_todo_security: "grep -rn 'TODO.*security\\|TODO.*auth\\|TODO.*valid\\|FIXME.*vuln' ."
    - grep_for_disabled: "grep -rn 'nosec\\|@Suppress\\|verify.*false' ."
    - find_hardcoded: "grep -rn \"['\\\"][a-zA-Z0-9]{32,}['\\\"]\" --include='*.{js,ts,py}'"

  manual_checks:
    threat_model_check:
      question: "Does every security control address a documented threat?"
      fail_action: "Remove controls without matching threats"

    simplicity_check:
      question: "Can the security be explained in 2 minutes?"
      fail_action: "Simplify until auditable"

    completeness_check:
      question: "Are there any security TODOs or disabled checks?"
      fail_action: "Fix immediately - no exceptions"

    standard_check:
      question: "Using standard libraries for crypto/auth/sessions?"
      fail_action: "Replace custom implementations"

  verdict_rules:
    security_todo: "REJECT IMMEDIATELY - critical"
    disabled_security: "REJECT IMMEDIATELY - critical"
    hardcoded_secrets: "REJECT IMMEDIATELY - critical"
    custom_crypto: "REJECT - use standard library"
    incomplete_validation: "REJECT - must be complete"
```

---

## Phase 1: Threat Modeling

### Task: Identify Attack Surface

**DO (Positive Instructions):**
- Map all entry points (APIs, inputs, files)
- Identify trust boundaries
- Document data flows
- List sensitive data locations
- Enumerate authentication/authorization points

**DO NOT (Negative Instructions):**
- Skip internal APIs
- Assume internal networks are safe
- Ignore configuration files
- Forget about logs containing sensitive data
- Overlook third-party integrations

**Attack Surface Map:**
```yaml
entry_points:
  external_apis:
    - endpoint: "/api/v1/*"
      auth_required: true
      input_validation: "to verify"
      rate_limited: "to verify"

  user_inputs:
    - forms: "list all form inputs"
    - file_uploads: "list all upload points"
    - url_parameters: "list all URL params"

  internal_services:
    - service_to_service: "list inter-service calls"
    - database_connections: "list DB connections"
    - message_queues: "list queue consumers"

trust_boundaries:
  - browser_to_server: "verify TLS"
  - server_to_database: "verify encryption"
  - service_to_service: "verify authentication"
```

**Verification Criteria:**
```yaml
pass_if:
  - all_endpoints_mapped: true
  - trust_boundaries_identified: true
  - data_flows_documented: true
  - sensitive_data_located: true
fail_if:
  - entry_points_missed: true
  - boundaries_unclear: true
  - sensitive_data_unknown: true
```

### Plan Adjustment Point 1
After threat modeling:
- If attack surface large: Prioritize critical paths
- If new entry points found: Add to scope
- If sensitive data discovered: Add data protection tasks
- If third-party risks: Add vendor assessment

---

## Phase 2: Injection Attacks (OWASP A03)

### Task: Test All Injection Vectors

**DO (Positive Instructions):**
- Test SQL injection in all database queries
- Test command injection in all system calls
- Test XSS in all output contexts
- Test LDAP injection if applicable
- Test template injection in all templates

**DO NOT (Negative Instructions):**
- Skip parameterized query verification
- Assume ORM prevents all injection
- Forget about second-order injection
- Ignore stored XSS vs reflected XSS
- Skip testing error messages for injection

**Injection Test Cases:**
```yaml
sql_injection:
  basic_tests:
    - input: "' OR '1'='1"
      verify: "Query fails or returns empty"
    - input: "'; DROP TABLE users;--"
      verify: "Query parameterized"
    - input: "1 UNION SELECT * FROM passwords"
      verify: "UNION blocked or ineffective"

  verification:
    - all_queries_parameterized: true
    - no_string_concatenation_in_sql: true
    - orm_used_correctly: true

xss_injection:
  basic_tests:
    - input: "<script>alert(1)</script>"
      verify: "Output encoded"
    - input: "javascript:alert(1)"
      verify: "Protocol blocked"
    - input: "<img onerror=alert(1) src=x>"
      verify: "Event handlers escaped"

  contexts:
    - html_body: "HTML entity encoding"
    - html_attribute: "Attribute encoding"
    - javascript: "JavaScript encoding"
    - url: "URL encoding"
    - css: "CSS encoding"

command_injection:
  basic_tests:
    - input: "; rm -rf /"
      verify: "Command not executed"
    - input: "| cat /etc/passwd"
      verify: "Pipe blocked"
    - input: "$(whoami)"
      verify: "Subshell blocked"

  verification:
    - no_shell_exec_with_user_input: true
    - subprocess_args_array: true
    - allowlist_commands: true
```

**Verification Criteria:**
```yaml
pass_if:
  - sql_injection_blocked: true
  - xss_encoded_all_contexts: true
  - command_injection_blocked: true
  - no_injection_paths_found: true
fail_if:
  - any_injection_succeeds: true
  - raw_sql_with_user_input: true
  - unencoded_output: true
  - shell_commands_injectable: true
```

### Plan Adjustment Point 2
After injection testing:
- If vulnerabilities found: Add fix task with CRITICAL priority
- If near-misses: Add hardening tasks
- If patterns emerge: Add systematic fix
- All secure: Proceed

---

## Phase 3: Authentication/Authorization (OWASP A01, A07)

### Task: Test Access Control

**DO (Positive Instructions):**
- Test horizontal privilege escalation
- Test vertical privilege escalation
- Test authentication bypass
- Test session management
- Test password policies

**DO NOT (Negative Instructions):**
- Skip testing as different user roles
- Assume frontend enforces authorization
- Forget to test direct object references
- Ignore session fixation attacks
- Skip password reset flow testing

**Auth Test Cases:**
```yaml
access_control:
  horizontal_escalation:
    - test: "Access other user's resources via ID manipulation"
      verify: "403 Forbidden returned"
    - test: "Enumerate user IDs"
      verify: "No information leakage"

  vertical_escalation:
    - test: "Access admin functions as regular user"
      verify: "403 Forbidden returned"
    - test: "Modify role in request payload"
      verify: "Server-side role check"

  direct_object_reference:
    - test: "Access resource by changing ID in URL"
      verify: "Authorization checked"
    - test: "Access file by path manipulation"
      verify: "Path validated"

authentication:
  bypass_attempts:
    - test: "Access protected endpoint without token"
      verify: "401 Unauthorized"
    - test: "Use expired token"
      verify: "401 Unauthorized"
    - test: "Use token from different user"
      verify: "403 Forbidden"

  session_management:
    - test: "Session fixation attack"
      verify: "New session ID on login"
    - test: "Session timeout"
      verify: "Session expires appropriately"
    - test: "Concurrent sessions"
      verify: "Policy enforced"

  password_security:
    - test: "Weak password accepted"
      verify: "Strong password required"
    - test: "Password in response"
      verify: "Never returned"
    - test: "Brute force login"
      verify: "Rate limiting active"
```

**Verification Criteria:**
```yaml
pass_if:
  - horizontal_escalation_blocked: true
  - vertical_escalation_blocked: true
  - authentication_enforced: true
  - sessions_secure: true
fail_if:
  - any_escalation_succeeds: true
  - auth_bypass_possible: true
  - session_vulnerable: true
```

### Plan Adjustment Point 3
After auth testing:
- If auth bypass found: CRITICAL fix task
- If escalation possible: HIGH priority fix
- If session issues: Add hardening task
- Secure: Proceed

---

## Phase 4: Data Protection (OWASP A02, A04)

### Task: Verify Sensitive Data Handling

**DO (Positive Instructions):**
- Check encryption at rest for sensitive data
- Verify TLS for data in transit
- Test for sensitive data in logs
- Check error messages for data leakage
- Verify secure credential storage

**DO NOT (Negative Instructions):**
- Skip checking backup encryption
- Assume HTTPS means all is secure
- Forget about client-side storage
- Ignore API response data exposure
- Skip checking temporary files

**Data Protection Checks:**
```yaml
encryption_at_rest:
  databases:
    - verify: "Sensitive columns encrypted"
    - verify: "Encryption keys properly managed"
  files:
    - verify: "Sensitive files encrypted"
    - verify: "Temp files cleaned up"
  backups:
    - verify: "Backups encrypted"
    - verify: "Backup access controlled"

encryption_in_transit:
  tls:
    - verify: "TLS 1.2+ required"
    - verify: "Strong cipher suites only"
    - verify: "Valid certificates"
  internal:
    - verify: "Service-to-service encrypted"
    - verify: "Database connections encrypted"

data_leakage:
  logs:
    - verify: "No passwords in logs"
    - verify: "No tokens in logs"
    - verify: "PII redacted"
  errors:
    - verify: "Stack traces not exposed"
    - verify: "SQL errors not exposed"
    - verify: "Internal paths not exposed"
  responses:
    - verify: "Minimal data returned"
    - verify: "No internal IDs exposed"
    - verify: "No debug information"

credential_storage:
  passwords:
    - verify: "Hashed with bcrypt/argon2"
    - verify: "Salt per password"
    - verify: "No reversible encryption"
  api_keys:
    - verify: "Encrypted storage"
    - verify: "Rotation policy"
    - verify: "Not in code/config"
```

**Verification Criteria:**
```yaml
pass_if:
  - sensitive_data_encrypted: true
  - tls_enforced: true
  - no_data_in_logs: true
  - credentials_secure: true
fail_if:
  - plaintext_sensitive_data: true
  - weak_encryption: true
  - data_leakage_found: true
  - weak_password_storage: true
```

### Plan Adjustment Point 4
After data protection:
- If plaintext secrets found: CRITICAL fix
- If data leakage: HIGH priority fix
- If weak encryption: Add upgrade task
- Secure: Proceed

---

## Phase 5: Security Configuration (OWASP A05)

### Task: Audit Security Configuration

**DO (Positive Instructions):**
- Check security headers
- Verify CORS configuration
- Test for misconfigurations
- Check default credentials
- Verify dependency vulnerabilities

**DO NOT (Negative Instructions):**
- Skip checking development settings in prod
- Assume cloud defaults are secure
- Ignore deprecated dependencies
- Skip checking file permissions
- Forget about exposed admin interfaces

**Configuration Audit:**
```yaml
security_headers:
  required:
    - "Content-Security-Policy": "strict"
    - "X-Frame-Options": "DENY"
    - "X-Content-Type-Options": "nosniff"
    - "Strict-Transport-Security": "max-age=31536000"
    - "X-XSS-Protection": "0 (rely on CSP)"

cors:
  verify:
    - "Allowlist specific origins"
    - "No wildcard in production"
    - "Credentials require specific origin"

dependencies:
  scan:
    - "npm audit / pip-audit / govulncheck"
    - "No critical vulnerabilities"
    - "No high vulnerabilities > 30 days"

defaults:
  check:
    - "No default admin passwords"
    - "Debug mode disabled"
    - "Verbose errors disabled"
    - "Test accounts removed"

permissions:
  verify:
    - "Principle of least privilege"
    - "No world-readable secrets"
    - "Proper file ownership"
```

**Verification Criteria:**
```yaml
pass_if:
  - security_headers_set: true
  - cors_configured_correctly: true
  - no_critical_vulns: true
  - no_default_credentials: true
fail_if:
  - missing_security_headers: true
  - cors_too_permissive: true
  - critical_vulns_present: true
  - defaults_in_production: true
```

### Plan Adjustment Point 5
After configuration audit:
- If critical vulns: Add upgrade task
- If headers missing: Add hardening task
- If misconfigs: Add fix tasks by priority
- Secure: Proceed

---

## Phase 6: Final Security Report

### Task: Generate Security Report

**DO (Positive Instructions):**
- Document all findings with severity
- Include reproduction steps for vulnerabilities
- Provide remediation recommendations
- Track fixes and retesting
- Update threat model

**Report Format:**
```yaml
security_report:
  summary:
    critical_findings: count
    high_findings: count
    medium_findings: count
    low_findings: count
    total_findings: count

  findings:
    - id: "SEC-001"
      title: "Description of vulnerability"
      severity: "critical|high|medium|low"
      location: "file:line or endpoint"
      reproduction: "Steps to reproduce"
      impact: "What could happen"
      remediation: "How to fix"
      status: "open|in_progress|fixed|verified"

  recommendations:
    immediate:
      - "Fix critical vulnerabilities"
    short_term:
      - "Address high severity"
    long_term:
      - "Implement security automation"

  metrics:
    attack_surface_coverage: percentage
    owasp_categories_tested: count
    time_spent: duration
```

---

## Loop Continuation Protocol

After Phase 6 completes:

1. **On Critical Finding:**
   - STOP all other work
   - Create CRITICAL fix task
   - Notify relevant stakeholders
   - Do not proceed until fixed

2. **On Non-Critical Findings:**
   - Create fix tasks by severity
   - Continue to next security area
   - Schedule fixes appropriately
   - Track in security backlog

3. **On Clean Audit:**
   - Document clean results
   - Update threat model
   - Schedule next audit
   - Proceed to next task

---

## OWASP Reference

Quick reference for OWASP Top 10 2021:
```yaml
A01_Broken_Access_Control: "Phase 3"
A02_Cryptographic_Failures: "Phase 4"
A03_Injection: "Phase 2"
A04_Insecure_Design: "Phase 1"
A05_Security_Misconfiguration: "Phase 5"
A06_Vulnerable_Components: "Phase 5"
A07_Auth_Failures: "Phase 3"
A08_Data_Integrity_Failures: "Phase 4"
A09_Logging_Failures: "Phase 4"
A10_SSRF: "Phase 2"
```
