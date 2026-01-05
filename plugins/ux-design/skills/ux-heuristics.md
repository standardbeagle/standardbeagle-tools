---
name: ux-heuristics
description: UX evaluation using Nielsen's heuristics, cognitive principles, and modern usability patterns. Comprehensive framework for identifying and resolving usability issues in interface design.
---

# UX Heuristics & Usability Principles

You are a UX expert helping evaluate and improve interface designs using established usability heuristics and cognitive principles.

## Philosophy

Heuristics are experience-based guidelines that identify usability issues without formal user testing. They're not rules—they're lenses for critical evaluation that help spot problems before users encounter them.

## Nielsen's 10 Usability Heuristics

### 1. Visibility of System Status

**Principle**: Keep users informed about what's going on through timely, appropriate feedback.

**What to Look For**:
- Loading indicators during async operations
- Progress bars for multi-step processes
- Selection states for interactive elements
- Save/sync status indicators
- Connection state (online/offline)
- Current location in navigation

**Signs of Violation**:
- Actions complete silently
- Users wonder "did that work?"
- No indication of background processes
- Unclear what's selected/active

**Design Solutions**:
- Immediate visual feedback on interaction (ripples, color changes)
- Progress indicators with meaningful progress (not just spinning)
- Toast notifications for completed actions
- Persistent status in header/footer for global states

### 2. Match Between System and Real World

**Principle**: Speak the user's language, with words, phrases, and concepts familiar to them.

**What to Look For**:
- Terminology matches user vocabulary
- Icons use recognizable metaphors
- Information organized logically (user mental models)
- Cultural appropriateness

**Signs of Violation**:
- Technical jargon in user-facing content
- Unfamiliar icons or symbols
- Information structure doesn't match expectations
- Error codes instead of explanations

**Design Solutions**:
- User research to understand vocabulary
- Icon testing for recognition
- Card sorting for information architecture
- Plain language guidelines

### 3. User Control and Freedom

**Principle**: Users need clearly marked "emergency exits" to leave unwanted states without extended dialog.

**What to Look For**:
- Undo/redo functionality
- Cancel buttons on dialogs
- Back navigation always works
- Easy escape from dead ends
- Draft saving for long forms

**Signs of Violation**:
- No way to reverse actions
- Modal dialogs trap users
- Browser back breaks experience
- Losing work without warning

**Design Solutions**:
- Persistent undo with reasonable history
- Non-modal alternatives where possible
- Confirmation before destructive actions
- Autosave with recovery options
- Clear exit points always visible

### 4. Consistency and Standards

**Principle**: Users shouldn't have to wonder whether different words, situations, or actions mean the same thing.

**What to Look For**:
- Same action always looks the same
- Platform conventions followed
- Terminology consistent throughout
- Visual patterns repeated appropriately

**Signs of Violation**:
- Buttons that behave differently
- Mixed terminology for same concept
- Inconsistent visual treatment
- Breaking platform conventions without reason

**Design Solutions**:
- Design system with documented patterns
- Content style guide
- UI inventory to identify inconsistencies
- Regular audits for drift

### 5. Error Prevention

**Principle**: Even better than good error messages is preventing errors in the first place.

**What to Look For**:
- Constraints that prevent invalid input
- Confirmation for consequential actions
- Smart defaults
- Inline validation before submission

**Signs of Violation**:
- Errors only shown after submission
- Easy to select wrong options
- Destructive actions too easy to trigger
- Invalid states possible

**Design Solutions**:
- Input masks and format guidance
- Disabled states for unavailable options
- "Are you sure?" for destructive actions
- Real-time validation with clear feedback
- Sensible defaults pre-selected

### 6. Recognition Rather Than Recall

**Principle**: Minimize memory load by making objects, actions, and options visible.

**What to Look For**:
- Options visible rather than hidden
- Recent items accessible
- Context preserved across screens
- Examples and hints provided

**Signs of Violation**:
- Users must remember codes or commands
- Important options buried in menus
- No recent/frequent items
- Empty states with no guidance

**Design Solutions**:
- Show common actions prominently
- Recent/favorite item lists
- Search with suggestions
- Tooltips and contextual help
- Placeholder text with examples

### 7. Flexibility and Efficiency of Use

**Principle**: Accelerators—unseen by novices—may speed up interaction for experts.

**What to Look For**:
- Keyboard shortcuts available
- Power user features accessible
- Customization options
- Automation capabilities

**Signs of Violation**:
- No keyboard navigation
- Forced wizard flows for repeat users
- No way to save preferences
- Repetitive tasks without shortcuts

**Design Solutions**:
- Progressive disclosure (simple first, advanced available)
- Keyboard shortcut panel
- Customizable dashboards
- Saved searches/filters
- Batch operations for power users

### 8. Aesthetic and Minimalist Design

**Principle**: Dialogues should not contain irrelevant or rarely needed information.

**What to Look For**:
- Visual noise minimized
- Content prioritized by importance
- Progressive disclosure for complexity
- Clean, focused interfaces

**Signs of Violation**:
- Cluttered screens
- Competing visual elements
- Rarely-used features prominent
- Dense, overwhelming information

**Design Solutions**:
- Content audit (remove unnecessary)
- Visual hierarchy (one primary action)
- "Show more" for secondary content
- Whitespace as design element
- Card-based chunking of information

### 9. Help Users Recognize, Diagnose, and Recover from Errors

**Principle**: Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.

**What to Look For**:
- Error messages in plain language
- Specific about what went wrong
- Guidance on how to fix
- Links to help when appropriate

**Signs of Violation**:
- "Error 500" or technical codes
- "Something went wrong" with no detail
- No path to resolution
- Error state with no way forward

**Design Solutions**:
- Human-readable error messages
- Specific problem description
- Clear next steps
- Inline error placement near cause
- Recovery options or alternatives

### 10. Help and Documentation

**Principle**: Even though it's better if the system can be used without documentation, it may be necessary to provide help.

**What to Look For**:
- Help easily accessible
- Contextual help near complex features
- Search functionality in help
- Progressive complexity in documentation

**Signs of Violation**:
- No help available
- Help buried or hard to find
- Outdated documentation
- No contextual guidance

**Design Solutions**:
- ? icons near complex features
- Tooltips for unclear elements
- Onboarding for new users
- In-context help panels
- Searchable knowledge base

## Additional Usability Principles

### Fitts's Law

**Principle**: Time to acquire a target depends on distance and target size.

**Design Implications**:
- Important targets should be large
- Common actions near expected cursor position
- Edge/corner positions are faster (infinite depth)
- Touch targets: minimum 44x44px

### Hick's Law

**Principle**: Decision time increases with number and complexity of choices.

**Design Implications**:
- Limit options in any given view
- Group related options logically
- Use progressive disclosure
- Provide sensible defaults

### Miller's Law

**Principle**: Average person can hold 7±2 items in working memory.

**Design Implications**:
- Chunk information into groups
- Use visual grouping
- Limit navigation depth
- Don't require remembering across screens

### Jakob's Law

**Principle**: Users spend most time on other sites, so they expect yours to work similarly.

**Design Implications**:
- Follow platform conventions
- Standard patterns for common features
- Innovate where it adds value, not for novelty
- Match mental models from similar products

### Gestalt Principles

**Proximity**: Elements close together appear related
**Similarity**: Similar elements appear related
**Closure**: Mind completes incomplete shapes
**Continuity**: Eye follows smooth paths
**Figure/Ground**: Elements seen as foreground or background

### Serial Position Effect

**Principle**: Items at beginning and end of lists are remembered better.

**Design Implications**:
- Place important items first and last
- Navigation: Home at start, CTA at end
- Lists: Key items at extremes

### Peak-End Rule

**Principle**: Experiences judged by peak moment and ending.

**Design Implications**:
- Design memorable moments
- End interactions positively
- Confirmation screens matter
- Error recovery is critical (often the end)

## Conducting a Heuristic Evaluation

### Process

1. **Preparation**
   - Gather design artifacts (screens, flows)
   - Define scope (entire product or specific flows)
   - Identify user scenarios to evaluate

2. **Individual Review**
   - Each evaluator reviews independently
   - Walk through user scenarios
   - Document each issue found

3. **Issue Documentation**
   For each issue, capture:
   - Screen/location
   - Heuristic(s) violated
   - Severity rating
   - Description
   - Recommendation

4. **Consolidation**
   - Combine findings from evaluators
   - Remove duplicates
   - Prioritize by severity

### Severity Scale

```
0 - Not a usability problem
1 - Cosmetic: Fix if time permits
2 - Minor: Low priority to fix
3 - Major: High priority to fix
4 - Catastrophe: Must fix before release
```

### Prioritization Matrix

```
           | Low Frequency | High Frequency |
-----------+---------------+----------------|
High Impact| 3 (Major)     | 4 (Critical)   |
Low Impact | 1 (Cosmetic)  | 2 (Minor)      |
```

## Evaluation Templates

### Quick Check (Per Screen)

```
Screen: _______________
User Goal: _______________

[ ] System status visible
[ ] Language matches users
[ ] Easy exit/undo available
[ ] Consistent with rest of product
[ ] Errors prevented where possible
[ ] Recognition over recall
[ ] Efficient for repeat use
[ ] Design is minimal/focused
[ ] Error handling is helpful
[ ] Help available if needed
```

### Issue Log

```
ID:        ___
Screen:    ___
Heuristic: ___
Severity:  [ ] 1  [ ] 2  [ ] 3  [ ] 4
Description:
_______________

Recommendation:
_______________
```

## Red Flags by Component Type

### Forms
- No inline validation
- Submit before any validation
- Unclear required fields
- No error recovery path

### Navigation
- Current location unclear
- Dead ends possible
- Back button breaks
- Important items hidden

### Tables/Lists
- No sorting/filtering
- Pagination breaks context
- Row selection unclear
- Actions hidden until hover

### Modals/Dialogs
- No clear exit
- Destructive action prominent
- Content requires scrolling
- Blocks necessary context

### Empty States
- No guidance provided
- Looks like broken/loading
- No path to content creation

## Modern Additions to Heuristics

### Mobile-Specific

- Thumb zone optimization
- Touch target sizing
- Offline capability
- Minimal typing required

### Accessibility Additions

- Screen reader experience
- Keyboard-only navigation
- Color independence
- Motion reduction options

### Performance Perception

- Skeleton screens over spinners
- Optimistic UI updates
- Progressive content loading
- Performance as UX

## Resources

### Nielsen Norman Group
- nngroup.com/articles/ten-usability-heuristics/
- nngroup.com/articles/usability-101-introduction-to-usability/

### Laws of UX
- lawsofux.com - Visual cards of UX principles

### Cognitive Biases in UX
- growth.design/psychology - Interactive examples
