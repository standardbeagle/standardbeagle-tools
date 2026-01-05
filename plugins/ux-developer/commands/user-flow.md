---
name: user-flow
description: Design, document, or analyze user flows with UX best practices and friction point identification
---

# User Flow Command

Design new user flows or analyze existing ones for UX optimization.

## Process

### 1. Define the Flow

Gather flow context:
- **Goal**: What is the user trying to accomplish?
- **Entry points**: Where do users enter this flow?
- **Success criteria**: What defines successful completion?
- **User context**: What state/knowledge do users have entering?

### 2. Map the Current/Proposed Flow

Create a flow diagram:

```
[Entry Point]
     ↓
[Step 1: Action]
     ↓
[Decision Point] → [Alternative Path]
     ↓                    ↓
[Step 2: Action]    [Step 2a: Action]
     ↓                    ↓
[Success State]    [Rejoin or End]
```

### 3. Analyze Each Step

For each step in the flow, evaluate:

#### Cognitive Load
- How much does the user need to remember?
- Is information provided at point of need?
- Are options overwhelming? (aim for 5-7 max)

#### Effort Required
- Number of clicks/taps
- Data entry required
- Decisions to make

#### Error Potential
- What can go wrong?
- How do users recover?
- Is progress saved?

#### Feedback
- Does user know where they are?
- Is progress visible?
- Are actions confirmed?

### 4. Friction Point Analysis

Identify and categorize friction:

| Step | Friction Type | Severity | Issue | Recommendation |
|------|---------------|----------|-------|----------------|
| | Cognitive | High/Med/Low | | |
| | Technical | High/Med/Low | | |
| | Emotional | High/Med/Low | | |
| | Time | High/Med/Low | | |

**Friction Types:**
- **Cognitive**: Confusion, unclear next steps, too many options
- **Technical**: Slow loading, errors, compatibility issues
- **Emotional**: Anxiety, distrust, frustration
- **Time**: Too many steps, unnecessary waiting

### 5. Accessibility in Flows

Ensure flow works for everyone:

- [ ] Can complete entire flow with keyboard only
- [ ] Screen reader can navigate and understand progress
- [ ] Error messages are announced and actionable
- [ ] Timeouts are generous or adjustable
- [ ] Complex steps have alternatives (e.g., CAPTCHA alternatives)
- [ ] Progress is not lost on back navigation
- [ ] Form data persists on validation errors

### 6. Mobile Flow Considerations

- [ ] Steps fit on mobile viewport without horizontal scroll
- [ ] Touch targets adequate throughout
- [ ] Native input types used (tel, email, date)
- [ ] Autofill supported where appropriate
- [ ] Camera/file upload works on mobile

### 7. Flow Optimization Recommendations

Apply these principles:

#### Reduce Steps
- Combine related inputs
- Remove optional fields (or make progressive)
- Use smart defaults
- Enable autofill

#### Provide Progress
- Show step indicators for multi-step flows
- Indicate completion percentage
- Allow saving progress

#### Enable Recovery
- Clear back/undo paths
- Save state automatically
- Helpful error messages with solutions

#### Build Confidence
- Show security indicators where relevant
- Provide cost/time estimates
- Preview before final action
- Easy cancellation

### 8. Generate Flow Documentation

```markdown
# [Flow Name] User Flow

## Overview
- **Purpose**: [What users accomplish]
- **Target users**: [Who uses this]
- **Entry points**: [Where users start]
- **Success metric**: [How we measure success]

## Flow Diagram
[Visual diagram]

## Step-by-Step Breakdown

### Step 1: [Name]
- **User action**: [What they do]
- **System response**: [What happens]
- **Required data**: [What we need]
- **Validation**: [Rules applied]
- **Error handling**: [What if it fails]
- **Accessibility**: [A11y considerations]

[Repeat for each step]

## Edge Cases
| Scenario | Handling |
|----------|----------|
| User abandons mid-flow | [Save state for 30 days] |
| Validation error | [Inline, preserve data] |
| Session timeout | [Warn at 5min, save state] |

## Metrics to Track
- Completion rate
- Drop-off by step
- Time to complete
- Error rate by step

## Testing Checklist
- [ ] Complete flow with keyboard only
- [ ] Complete flow with screen reader
- [ ] Complete flow on mobile
- [ ] Test all error scenarios
- [ ] Test session timeout handling
- [ ] Test back button behavior
```

### 9. Testing with agnt

For existing flows:
```
1. Use mcp__agnt__proxy to proxy the application
2. Walk through the flow capturing interactions
3. Use mcp__agnt__currentpage to analyze each step
4. Check for JavaScript errors at each step
5. Monitor network for failed requests
```

### 10. Implementation Tracking

Offer to create Dart tasks for:
- Each step requiring UX improvements
- Accessibility fixes needed
- Performance optimizations
- A/B test setups
