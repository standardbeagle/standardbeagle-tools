---
name: compound-review-recommender
description: "Routes preventive diff/PR review to the context-owned compound-review:review skill. Use when: review code, review diff, PR review, correctness review, testing review, TypeScript review, CLI readiness review, or uncertainty about review depth."
---

# compound-review recommender

Route preventive code-review intent to `Skill(compound-review:review)`.

The review skill owns all lenses over one change packet. Do not dispatch separate correctness, testing, maintainability, TypeScript, or CLI agents. Those are conditional rubrics within the single pass.

For other intent:

- Existing failure requiring root-cause investigation → `Skill(dev-standards:diagnose)`.
- Quality-only cleanup with fixes → `/simplify` or `Skill(lci:pre-commit-review)` as appropriate.
- Security-specific audit → `/security-review`.
- Product strategy or pulse reporting → use the product/ideation tooling; this plugin does not own those concerns.

Use exhaustive multi-agent orchestration only when the user explicitly requests it. Routine review is one context-owning reviewer.
