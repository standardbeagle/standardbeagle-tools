---
name: nielsen-heuristics
description: Apply Nielsen's 10 Usability Heuristics to evaluate interface design
---

# Nielsen's 10 Usability Heuristics

Use these heuristics to evaluate any user interface systematically.

## The 10 Heuristics

### 1. Visibility of System Status

**Principle**: Keep users informed about what's going on through appropriate feedback within reasonable time.

**Check for**:
- Loading indicators for async operations
- Progress bars for multi-step processes
- Confirmation messages after actions
- Status indicators (online/offline, sync state)
- Real-time validation feedback

**Examples**:
- "Saving..." indicator when auto-saving
- Upload progress percentage
- "3 items in cart" badge
- "Last synced 2 minutes ago"

**Red flags**:
- Silent failures
- Actions with no feedback
- Unclear loading states
- No indication of completion

---

### 2. Match Between System and Real World

**Principle**: Use language and concepts familiar to users, not system-oriented terms.

**Check for**:
- User's vocabulary, not technical jargon
- Familiar icons and metaphors
- Logical information ordering
- Cultural appropriateness

**Examples**:
- "Shopping Cart" not "Order Queue"
- Folder icon for file organization
- Calendar for date selection
- Trash can for deletion

**Red flags**:
- Technical error codes shown to users
- Unfamiliar terminology
- Illogical categorization
- Developer-speak in UI

---

### 3. User Control and Freedom

**Principle**: Provide clearly marked "emergency exits" and support undo/redo.

**Check for**:
- Cancel buttons on dialogs
- Undo functionality
- Easy navigation back
- Clear exit paths
- Draft/save states

**Examples**:
- "Undo" after deleting email
- Close button on modals
- Back button support
- "Save as draft" option

**Red flags**:
- No way to cancel mid-action
- Irreversible destructive actions
- Forced linear flows
- Hidden exit options

---

### 4. Consistency and Standards

**Principle**: Follow platform conventions; same words/actions mean same things.

**Check for**:
- Consistent terminology throughout
- Standard icon usage
- Predictable component behavior
- Platform convention adherence

**Examples**:
- All primary buttons same style
- "Save" always in same location
- Standard link styling (underlined, colored)
- Platform-native controls where appropriate

**Red flags**:
- Different words for same action
- Inconsistent button styles
- Non-standard icons
- Varying layouts for similar pages

---

### 5. Error Prevention

**Principle**: Design to prevent problems from occurring in the first place.

**Check for**:
- Constraints on inputs (date pickers, dropdowns)
- Confirmation for destructive actions
- Clear formatting requirements
- Smart defaults
- Validation before submission

**Examples**:
- Disable past dates in booking calendar
- "Are you sure you want to delete?"
- Phone number formatting assistance
- Suggested search completions

**Red flags**:
- Free text where constrained input possible
- No confirmation on delete
- Silent validation failures
- Easy to make irreversible mistakes

---

### 6. Recognition Rather Than Recall

**Principle**: Minimize memory load by making objects, actions, and options visible.

**Check for**:
- Visible options vs. requiring memorization
- Recent items and favorites
- Contextual help
- Recognizable icons with labels
- Autocomplete and suggestions

**Examples**:
- Dropdown menus vs. typing commands
- "Recent documents" list
- Tooltips on icons
- Search suggestions

**Red flags**:
- Required memorization of commands
- Hidden navigation
- Icon-only interfaces without labels
- No search/filter for large lists

---

### 7. Flexibility and Efficiency of Use

**Principle**: Accommodate both novice and expert users with accelerators.

**Check for**:
- Keyboard shortcuts for experts
- Customizable interfaces
- Shortcuts for frequent actions
- Multiple ways to accomplish tasks
- Power user features

**Examples**:
- Cmd/Ctrl+S to save
- Customizable dashboard widgets
- Bulk actions for multiple items
- Recently used items list

**Red flags**:
- No keyboard navigation
- Forced multi-step processes
- No shortcuts for power users
- One-size-fits-all interface

---

### 8. Aesthetic and Minimalist Design

**Principle**: Avoid irrelevant or rarely needed information; every extra element competes for attention.

**Check for**:
- Essential information only
- Progressive disclosure
- Visual hierarchy
- Clean, uncluttered layouts
- Purposeful decoration

**Examples**:
- Key actions prominent, secondary actions subdued
- Advanced options hidden in expandable sections
- Whitespace for visual breathing room
- Color used meaningfully, not decoratively

**Red flags**:
- Information overload
- Competing visual elements
- Decorative elements that distract
- All options shown at once

---

### 9. Help Users Recognize, Diagnose, and Recover from Errors

**Principle**: Error messages should be plain language, indicate the problem, and suggest a solution.

**Check for**:
- Clear error messages in plain language
- Specific problem identification
- Constructive solution suggestions
- Preserve user input on error
- Easy correction path

**Examples**:
- "Password must be at least 8 characters" not "Invalid input"
- Highlight specific field with error
- "Check your email for a reset link"
- Keep form data when validation fails

**Red flags**:
- Technical error messages
- Generic "Something went wrong"
- No guidance on how to fix
- Loss of user input on error

---

### 10. Help and Documentation

**Principle**: Provide help that is easy to search, focused on tasks, and provides concrete steps.

**Check for**:
- Searchable help content
- Task-oriented documentation
- Contextual help where needed
- Tooltips and hints
- Onboarding for new users

**Examples**:
- "?" icon next to complex fields
- Searchable FAQ
- Guided tours for new features
- Contextual tips during first use

**Red flags**:
- No help available
- Documentation requires external search
- Help written in technical language
- No onboarding for complex features

---

## Evaluation Template

| Heuristic | Score (1-5) | Issues Found | Recommendations |
|-----------|-------------|--------------|-----------------|
| Visibility of system status | | | |
| Match between system and real world | | | |
| User control and freedom | | | |
| Consistency and standards | | | |
| Error prevention | | | |
| Recognition rather than recall | | | |
| Flexibility and efficiency of use | | | |
| Aesthetic and minimalist design | | | |
| Help users with errors | | | |
| Help and documentation | | | |

**Scoring Guide**:
- 5: Excellent, no issues
- 4: Good, minor issues
- 3: Acceptable, some issues
- 2: Poor, significant issues
- 1: Critical, major violations
