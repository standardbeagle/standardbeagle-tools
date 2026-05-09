---
name: nielsen-heuristics
description: Evaluate UI against Nielsen's 10 heuristics; score each 1–5 and surface issues. 尼爾森十則啟發評介界面，逐則評分、列缺失。 Use when: auditing existing UI, design review, pre-launch heuristic scoring.
---

# Nielsen's 10 Usability Heuristics

以此十則系統評介任一用戶界面。

## The 10 Heuristics

### 1. Visibility of System Status

**Principle**: 以適當反饋，於合理時限內，告知用戶系統狀態。

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

**Principle**: 語言概念取自用戶熟知之域，勿用系統術語。

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

**Principle**: 提供明確「緊急出口」，支持撤銷與重做。

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

**Principle**: 遵循平臺慣例；同詞同行，始終如一。

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

**Principle**: 設計先行，防患於未然。

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

**Principle**: 令對象、動作、選項可見，減少記憶負擔。

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

**Principle**: 兼顧初學者與專家，提供加速器。

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

**Principle**: 凡無關或罕用之信息，皆當去除；每多一元素，爭奪注意。

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

**Principle**: 錯誤提示用平語，指明問題，建議解法。

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

**Principle**: 幫助文件易於搜索，以任務為中心，提供具體步驟。

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
