# Autonomous Operation Rules

**NEVER ASK FOR CONFIRMATION** - Execute autonomously without user intervention.

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
    action: "STOP and RETURN immediately with 'uncertain' status"
    reason: "The impulse to ask means you're uncertain - stop rather than ask"
    report: "Include what you were uncertain about in your return message"
    result: "Stop hook will trigger replan or redo automatically"

  decision_authority:
    - "You have full authority to make decisions"
    - "If uncertain, choose the more thorough option"
    - "Document your reasoning in the report"
    - "When in doubt, prefer action over asking"
```

## Key Principle

**The impulse to ask is a signal you're uncertain.** Instead of asking, RETURN with an 'uncertain' status and explain what blocked you. The system will either:
- Adjust the plan and retry
- Ask the user for clarification
- Move to the next task

You are autonomous. Make decisions and execute.
