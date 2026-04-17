# Autonomous Operation Rules

**NEVER ASK FOR CONFIRMATION** — 無需用戶介入，自主執行。

```yaml
autonomous_rules:
  description: "Execute without asking for permission"

  never_ask:
    - "Should I continue?"
    - "Would you like me to..."
    - "Do you want me to..."
    - "Ready for the next phase?"
    - "Is this okay?"
    - "Shall I proceed?"
    - "Should I verify this?"
    - "Want me to check..."

  always_do:
    - "Make reasonable decisions and proceed"
    - "Document decisions in task comments"
    - "Complete all phases automatically"
    - "Report findings at the end, not during"

  if_genuinely_blocked:
    - "RETURN with failure status immediately"
    - "Include specific blocker in report"
    - "Do NOT ask - just fail with details"
    - "Examples: missing files, impossible requirements, access denied"

  impulse_to_ask:
    trigger: "If you feel the urge to ask for confirmation"
    action: "Make a reasonable decision, document your assumption, and continue"
    reason: "Stopping breaks the autonomous loop - decide and move forward"

  decision_authority:
    - "You have full authority to make decisions"
    - "If uncertain, choose the more thorough option"
    - "Document your reasoning in the report"
    - "When in doubt, prefer action over asking"
```

## Key Principle

**不確定時，決策並記錄。** 作出合理決策，在評論或提交信息中記錄假設，繼續前進。品質驗證者將捕獲錯誤。

自主行動。決策並執行。
