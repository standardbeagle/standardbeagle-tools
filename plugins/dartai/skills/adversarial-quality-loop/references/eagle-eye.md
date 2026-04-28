# Eagle-Eyed Violations (IMMEDIATE REJECTION)

Loaded by `adversarial-quality-loop` when the verifier role enters self-review or Phase 3 review. Each violation class below is grounds for immediate rejection and rework.

## 1. Scope Creep & Gold Plating

```yaml
scope_violations:
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

  premature_abstraction:
    description: "Creating abstractions before needed"
    examples:
      - "Creating interfaces with single implementation"
      - "Building factory patterns for one class"
      - "Adding plugin systems when not requested"
      - "Designing for 'extensibility' not in requirements"
    detection: "Count implementations per abstraction"
    verdict: "REJECT - inline until actually needed"
```

## 2. Over-Engineering & Complexity

```yaml
complexity_violations:
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

  complexity_metrics:
    cyclomatic_complexity: "max 10 per function"
    nesting_depth: "max 3 levels"
    function_length: "max 30 lines"
    parameter_count: "max 4 parameters"
```

## 3. Incomplete Work Markers

```yaml
marker_violations:
  todo_comments:
    patterns: ["TODO", "TODO:", "// TODO", "# TODO", "/* TODO", "@todo"]
    verdict: "REJECT - complete or remove, no exceptions"

  fixme_comments:
    patterns: ["FIXME", "FIXME:", "// FIXME", "# FIXME", "/* FIXME", "@fixme"]
    verdict: "REJECT - fix now or document why impossible"

  hack_markers:
    patterns: ["HACK", "XXX", "KLUDGE", "WORKAROUND", "TEMPORARY", "TEMP"]
    verdict: "REJECT - implement properly or escalate"

  incomplete_markers:
    patterns:
      - "NOT IMPLEMENTED"
      - "STUB"
      - "PLACEHOLDER"
      - "WIP"
      - "TBD"
      - "TBC"
      - "..."  # in function bodies
      - "pass"  # empty Python functions
      - "throw new NotImplementedError"
    verdict: "REJECT - complete implementation required"

  debt_markers:
    patterns: ["TECH DEBT", "REFACTOR", "CLEANUP", "OPTIMIZE LATER", "NEEDS WORK"]
    verdict: "REJECT - do the work now or remove the code"
```

## 4. Giving Up / "Too Hard" Cop-outs

```yaml
cop_out_violations:
  surrender_phrases:
    in_code_comments:
      - "This is too complex to..."
      - "I couldn't figure out how to..."
      - "This might not work for..."
      - "Not sure if this handles..."
      - "Hopefully this works"
      - "Should be good enough"
      - "Works on my machine"
    verdict: "REJECT - uncertainty is not acceptable"

  incomplete_error_handling:
    patterns:
      - "catch (e) { }"  # empty catch
      - "catch (e) { console.log(e) }"  # log and continue
      - "// ignore errors"
      - "try { } catch { return null }"  # swallow and return
      - "except: pass"  # Python catch-all
    verdict: "REJECT - handle errors properly or let them propagate"

  partial_implementations:
    signs:
      - "Only handles the common case"
      - "Edge cases not implemented"
      - "Works for most inputs"
      - "Assuming valid input"
      - "Happy path only"
    verdict: "REJECT - complete implementation or document as limitation"

  complexity_surrender:
    phrases:
      - "This is a known limitation"
      - "Out of scope for this task"
      - "Would require significant refactoring"
      - "Too risky to change"
      - "Legacy code constraint"
    required_response: |
      If genuinely blocked, STOP and report:
      1. Specific technical blocker
      2. What would be needed to resolve
      3. Request task reassessment
      DO NOT commit partial or broken code
```

## 5. Codebase Integration Requirement

```yaml
seamless_integration:
  principle: "Code must be indistinguishable from existing codebase"

  requirements:
    style:
      - "Match exact formatting, indentation, spacing"
      - "Follow same naming conventions"
      - "Use same comment style"
      - "Match existing file organization"

    patterns:
      - "Use same error handling approach"
      - "Use same logging patterns"
      - "Use same test patterns"
      - "Reuse existing utilities"

    architecture:
      - "Follow established module boundaries"
      - "Use existing abstractions"
      - "No new patterns unless requested"
      - "Fit naturally into existing structure"

  detection:
    question: "Could this code have been written by original author?"
    test: "Can you tell which code is new vs existing?"

  verification:
    - Use LCI to find similar patterns in codebase
    - Compare style with surrounding code
    - Check for reuse of existing helpers
    - Verify naming matches conventions

  verdict: "REJECT if new code stands out as an addition"
```

## 6. Test Ownership Rule

```yaml
test_ownership:
  rule: "ALL tests must pass - no exceptions, no blame"

  forbidden_excuses:
    - "This test failure is unrelated to my change"
    - "That's a pre-existing failure"
    - "The test was already flaky"
    - "Not my test, not my problem"
    - "That failure is in a different module"
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

## 7. Eagle-Eye Verification Checklist

```yaml
eagle_eye_scan:
  run_before_any_approval: true

  automated_checks:
    - grep_for_todo: "grep -rn 'TODO\\|FIXME\\|XXX\\|HACK' --include='*.{js,ts,py,go,rs}'"
    - grep_for_debug: "grep -rn 'console\\.log\\|print(\\|debugger' --include='*.{js,ts,py}'"
    - count_new_abstractions: "diff --stat | count new class/interface definitions"
    - measure_complexity: "run complexity analyzer on changed files"

  manual_checks:
    scope_check:
      question: "Does every change trace to a specific requirement?"
      fail_action: "Remove any change that cannot be justified"

    simplicity_check:
      question: "Is this the simplest solution that works?"
      fail_action: "Simplify until a junior dev would understand"

    completeness_check:
      question: "Are there any TODO/FIXME/incomplete markers?"
      fail_action: "Complete the work or escalate as blocker"

    confidence_check:
      question: "Are there any uncertain comments or partial implementations?"
      fail_action: "Make it work completely or report as blocked"

    seamless_check:
      question: "Does new code blend seamlessly with existing codebase?"
      fail_action: "Refactor to match existing patterns exactly"

    test_check:
      question: "Do ALL tests pass?"
      fail_action: "Fix failing tests - no exceptions"

  verdict_rules:
    any_violation: "REJECT immediately"
    borderline_case: "REJECT - when in doubt, simplify"
    disputed_feature: "REJECT - if not in requirements, remove it"
    failing_test: "REJECT - fix it first"
    non_seamless_code: "REJECT - must blend with codebase"
```
