# Eagle-Eyed Discipline Rules

**ALWAYS ACTIVE** - Be ruthlessly vigilant for these violations. REJECT immediately when found.

## Scope Discipline - NO Extra Features

```yaml
scope_violations_to_reject:
  extra_features:
    description: "Adding functionality not explicitly requested"
    examples:
      - "Adding a cache when not asked"
      - "Implementing additional API endpoints"
      - "Adding configuration options not in requirements"
      - "Building abstractions for 'future flexibility'"
    detection: "Compare every line to acceptance criteria"
    verdict: "REJECT - remove all unrequested features"

  gold_plating:
    description: "Polishing beyond requirements"
    examples:
      - "Adding extra logging 'just in case'"
      - "Implementing unused error codes"
      - "Adding comments explaining obvious code"
      - "Creating helper functions used only once"
    detection: "Ask: 'Is this strictly necessary for the task?'"
    verdict: "REJECT - simplify to minimum viable"
```

## Simplicity Discipline - NO Over-Engineering

```yaml
complexity_violations_to_reject:
  over_engineering:
    description: "Solutions more complex than the problem"
    examples:
      - "Using design patterns where simple code works"
      - "Adding layers of indirection"
      - "Creating class hierarchies for simple data"
      - "Implementing state machines for linear flows"
    detection: "Can a junior developer understand this in 5 minutes?"
    verdict: "REJECT - simplify until obvious"

  unnecessary_abstraction:
    description: "Abstractions that hide rather than clarify"
    examples:
      - "Wrapping simple operations in classes"
      - "Creating DSLs for straightforward logic"
      - "Building frameworks instead of solutions"
      - "Multiple layers doing the same validation"
    detection: "Count the call stack depth for simple operations"
    verdict: "REJECT - flatten and simplify"

  clever_code:
    description: "Code that prioritizes cleverness over clarity"
    examples:
      - "One-liners that do too much"
      - "Operator overloading for non-obvious behavior"
      - "Metaprogramming when explicit code works"
      - "Regex when string operations suffice"
    detection: "Would you need a comment to explain it?"
    verdict: "REJECT - write boring, obvious code"

  complexity_limits:
    cyclomatic_complexity: "max 10 per function"
    nesting_depth: "max 3 levels"
    function_length: "max 30 lines"
    parameter_count: "max 4 parameters"
```

## Completeness Discipline - NO Markers

```yaml
markers_to_reject:
  patterns:
    - "TODO", "TODO:", "// TODO", "# TODO"
    - "FIXME", "FIXME:", "// FIXME", "# FIXME"
    - "HACK", "XXX", "KLUDGE", "WORKAROUND"
    - "TEMPORARY", "TEMP"
    - "STUB", "PLACEHOLDER", "WIP", "TBD", "TBC"
    - "..."  # in function bodies
    - "pass"  # empty Python functions
    - "throw new NotImplementedError"
    - "NOT IMPLEMENTED"
  verdict: "REJECT - complete the work or don't start"

  debt_markers:
    patterns:
      - "TECH DEBT"
      - "REFACTOR"
      - "CLEANUP"
      - "OPTIMIZE LATER"
      - "NEEDS WORK"
    verdict: "REJECT - do the work now or remove the code"
```

## No Cop-outs Discipline

```yaml
cop_outs_to_reject:
  uncertainty:
    patterns:
      - "Hopefully this works"
      - "Should be good enough"
      - "Not sure if this handles..."
      - "This is too complex to..."
      - "I couldn't figure out how to..."
    verdict: "REJECT - uncertainty is not acceptable"

  incomplete:
    signs:
      - "Only handles common case"
      - "Edge cases not implemented"
      - "Happy path only"
      - "Assuming valid input"
    verdict: "REJECT - complete implementation"

  blame_shifting:
    patterns:
      - "This test failure is unrelated to my change"
      - "That's a pre-existing failure"
      - "The test was already flaky"
      - "Not my test, not my problem"
      - "Someone else broke that test"
      - "The CI was already red"
    verdict: "REJECT - ALL tests must pass, fix them"

  too_hard:
    patterns:
      - "This is a known limitation"
      - "Out of scope for this task"
      - "Would require significant refactoring"
      - "Too risky to change"
    response: |
      If genuinely blocked:
      1. STOP immediately
      2. Report specific blocker
      3. Do NOT ship partial work

  incomplete_error_handling:
    patterns:
      - "catch (e) { }"  # empty catch
      - "catch (e) { console.log(e) }"  # log and continue
      - "// ignore errors"
      - "try { } catch { return null }"  # swallow and return
      - "except: pass"  # Python catch-all
    verdict: "REJECT - handle errors properly or let them propagate"
```

## Seamless Integration Discipline

```yaml
integration_requirements:
  principle: "Code must be indistinguishable from existing codebase"

  code_must_be:
    - "Match exact formatting, indentation, spacing"
    - "Follow same naming conventions"
    - "Use same comment style"
    - "Match existing file organization"
    - "Use same error handling approach"
    - "Use same logging patterns"
    - "Use same test patterns"
    - "Reuse existing utilities"

  detection:
    question: "Could this code have been written by the original author?"
    test: "Can you tell which code is new vs existing?"

  verification:
    - Use LCI to find similar patterns in codebase
    - Compare style with surrounding code
    - Check for reuse of existing helpers
    - Verify naming matches conventions

  verdict: "REJECT if new code stands out as an addition"
```

## Test Ownership Rule

```yaml
test_ownership:
  rule: "ALL tests must pass - no exceptions, no blame"

  forbidden_excuses:
    - "This test failure is unrelated to my change"
    - "That's a pre-existing failure"
    - "The test was already flaky"
    - "Not my test, not my problem"
    - "Someone else broke that test"
    - "The CI was already red"

  required_behavior: |
    If ANY test fails:
    1. FIX IT - regardless of who wrote it or when it broke
    2. If truly blocking and unrelated: escalate as BLOCKER
    3. NEVER proceed with failing tests
    4. NEVER blame others or prior state
    The codebase must ALWAYS be green.

  verdict: "REJECT - cannot merge with ANY failing test"
```

## Eagle-Eye Scan (Run First)

```bash
# ALWAYS run these before any approval
grep -rn 'TODO\|FIXME\|XXX\|HACK' --include='*.{js,ts,py,go,rs}'
grep -rn 'console\.log\|print(\|debugger' --include='*.{js,ts,py}'
grep -rn 'Not implemented\|NotImplemented\|STUB\|PLACEHOLDER' .
grep -rn 'hopefully\|should work\|good enough\|might not' --include='*.{js,ts,py,go}'
```

## Verdict Rules

```yaml
verdicts:
  any_todo_marker: "REJECT IMMEDIATELY"
  any_fixme_marker: "REJECT IMMEDIATELY"
  any_debug_statement: "REJECT IMMEDIATELY"
  unrequested_feature: "REJECT - remove it"
  over_engineering: "REJECT - simplify it"
  uncertainty_comment: "REJECT - make it certain"
  incomplete_work: "REJECT - complete it"
  borderline_case: "REJECT - when in doubt, reject"
  disputed_feature: "REJECT - if not in requirements, remove it"
  failing_test: "REJECT - fix it first"
  non_seamless_code: "REJECT - must blend with codebase"
```
