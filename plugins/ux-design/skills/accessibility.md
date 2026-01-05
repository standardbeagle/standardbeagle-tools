---
name: accessibility
description: Inclusive design principles and WCAG guidelines for creating accessible experiences. Covers visual, motor, cognitive, and auditory accessibility from a design perspective.
---

# Accessibility Design Principles

You are an accessibility expert helping designers create inclusive experiences that work for everyone, including people with disabilities.

## Philosophy

Accessibility is not a feature—it's a quality of design. Accessible design:

1. **Serves everyone** - Temporary and situational disabilities affect us all
2. **Improves usability** - What helps some, often helps all
3. **Is a legal requirement** - ADA, Section 508, EAA mandate compliance
4. **Expands your audience** - 15-20% of population has a disability

## Understanding Disabilities

### Visual

**Blindness**
- Complete vision loss
- Use screen readers exclusively
- Navigate by keyboard and audio

**Low Vision**
- Reduced visual acuity
- May use screen magnification
- Need high contrast, large text

**Color Blindness**
- Cannot distinguish certain colors
- Red-green most common (8% males)
- Blue-yellow less common

### Motor

**Limited Fine Motor Control**
- Difficulty with precise movements
- Need larger click targets
- Keyboard preferable to mouse

**Tremors**
- Unsteady hand movements
- Need stable, forgiving targets
- Time extensions for actions

**Single Hand Use**
- Temporary or permanent
- Keyboard shortcuts must be one-handed
- Touch zones matter on mobile

### Cognitive

**Attention Disorders**
- Difficulty maintaining focus
- Distracted by motion/clutter
- Need clear, simple layouts

**Memory Impairments**
- Difficulty retaining information
- Recognition over recall
- Persistent state and context

**Learning Disabilities**
- Processing challenges
- Simple language helps
- Multiple content formats

### Auditory

**Deafness**
- No access to audio content
- Visual alternatives required
- Captions and transcripts essential

**Hard of Hearing**
- Partial hearing loss
- Volume control needed
- Clear audio with captions

## WCAG Principles (POUR)

### Perceivable

Information must be presentable in ways users can perceive.

**Text Alternatives**
- Alt text for images
- Captions for video
- Transcripts for audio

**Adaptable Content**
- Structure conveyed programmatically
- Reading order makes sense
- Content not dependent on sensory characteristics

**Distinguishable**
- Foreground/background separation
- Text resizable
- Color not sole conveyor of meaning

### Operable

Interface components must be operable by all users.

**Keyboard Accessible**
- All functionality via keyboard
- No keyboard traps
- Logical focus order

**Enough Time**
- Adjustable time limits
- Pause/stop/hide for motion
- No time-dependent content

**Seizure Prevention**
- No flashing > 3 times/second
- Flashing area limits
- Motion reduction options

**Navigable**
- Skip navigation links
- Descriptive page titles
- Focus visible

### Understandable

Information and operation must be understandable.

**Readable**
- Language identified
- Unusual words explained
- Abbreviations expanded

**Predictable**
- Consistent navigation
- Consistent identification
- No unexpected context changes

**Input Assistance**
- Error identification
- Labels and instructions
- Error prevention for important actions

### Robust

Content must be robust enough for assistive technologies.

**Compatible**
- Valid markup
- Proper naming and roles
- Status messages accessible

## Color Accessibility

### Contrast Requirements

**WCAG AA (Minimum)**
```
Normal text:     4.5:1
Large text:      3:1  (18pt or 14pt bold)
UI components:   3:1
Graphics:        3:1
```

**WCAG AAA (Enhanced)**
```
Normal text:     7:1
Large text:      4.5:1
```

### Color Independence

Never use color as the only way to convey:
- Errors (add icon + text)
- Required fields (add asterisk + text)
- Links (add underline)
- Status (add shape or text)
- Data series in charts (add patterns)

**Good Example**:
```
Error state: Red border + error icon + error message
Not just: Red border alone
```

### Color Blindness Testing

Design with these simulations:
- Deuteranopia (red-green, most common)
- Protanopia (red-green)
- Tritanopia (blue-yellow)
- Achromatopsia (no color)

Tools: Stark (Figma), Sim Daltonism (Mac), Chrome DevTools

## Typography Accessibility

### Readable Text

**Size**
- Body text: 16px minimum (1rem)
- Small text: 12px minimum (sparingly)
- User must be able to zoom to 200%

**Line Length**
- 45-75 characters optimal
- 80 characters maximum
- Constrain with max-width

**Line Height**
- 1.5 minimum for body text
- Paragraph spacing: 1.5x font size minimum

**Letter Spacing**
- Never below default
- Wider for small or all-caps text

### Font Choices

**Accessible Font Characteristics**:
- Clear letterform distinction (I, l, 1)
- Open counters (a, e, o)
- Consistent stroke width
- x-height appropriate

**Fonts Known for Accessibility**:
- Atkinson Hyperlegible (designed for low vision)
- Open Sans
- Verdana
- Tahoma

**Avoid**:
- Decorative fonts for body text
- Light weights below 300
- Very condensed widths
- Script/handwriting fonts for content

### Text Styling

**Don't Rely Solely On**:
- Italics for emphasis (hard to read)
- Color for links
- Strikethrough (may not be announced)

**Do Use**:
- Bold for emphasis
- Underlines for links
- Clear visual distinction

## Focus States

### Visibility Requirements

Focus indicators must be:
- Visible (3:1 contrast minimum)
- Clear (not just color change)
- Obvious (users can find focused element)

### Focus Design

**Good Focus Styles**:
```
Outline: 2px solid, offset 2-4px
Ring: High contrast color
Background: Color change + outline
```

**Never Remove Focus Without Replacement**:
```css
/* DON'T */
:focus { outline: none; }

/* DO */
:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--focus-color);
}
```

### Focus Management

**Focus Order**:
- Logical, following visual layout
- Left-to-right, top-to-bottom (LTR languages)
- Modal focus trapped within modal

**Skip Links**:
- First focusable element
- "Skip to main content"
- "Skip to navigation"

## Touch Accessibility

### Target Sizes

**WCAG 2.2 Requirements**:
- Minimum: 24x24px
- Recommended: 44x44px
- Spacing: 8px between targets

### Touch Target Design

- Padding counts toward touch target
- Inline links need vertical spacing
- Icon buttons need sufficient padding
- Near screen edges = easier to tap

### Gesture Alternatives

For every gesture, provide alternative:
- Swipe → buttons
- Pinch zoom → buttons/slider
- Drag → click/tap alternative
- Long press → menu/button

## Motion & Animation

### Reduced Motion

Respect `prefers-reduced-motion`:
- Reduce or remove non-essential animation
- Keep functional transitions (state changes)
- Avoid parallax effects
- No autoplay video

**What to Reduce**:
- Decorative animations
- Parallax scrolling
- Large movement transitions
- Bouncing/zooming effects

**What to Keep**:
- State change indicators
- Loading feedback
- Simple opacity fades
- Micro-interactions (subtle)

### Motion Guidelines

- Duration: 200-500ms for UI
- Avoid flashing (3x/second max)
- Allow pause for all animation
- No motion that can't be stopped

## Form Accessibility

### Labels

Every input needs:
- Associated label (programmatically linked)
- Visible label (not placeholder only)
- Descriptive text

**Label Placement**:
- Above or to the left of input
- Consistent throughout form
- Checkboxes/radios: label to right

### Instructions & Errors

**Before Input**:
- Required field indicators (with legend)
- Format expectations
- Character limits

**During Input**:
- Real-time validation (optional but helpful)
- Clear error states

**After Submission**:
- Errors near fields, not just summary
- Clear path to correction
- Focus moves to first error

### Grouping

Related fields should be:
- Visually grouped
- Programmatically grouped (fieldset/legend)
- Logically ordered

## Icon & Image Accessibility

### Icons

**Decorative Icons** (next to text):
- Hide from assistive tech
- aria-hidden="true"

**Functional Icons** (standalone):
- Need accessible name
- aria-label or sr-only text
- Consider tooltip for discoverability

**Icon + Text**:
- Icon decorative (hidden)
- Text provides meaning

### Images

**Decorative Images**:
- Empty alt: alt=""
- No useful information conveyed

**Informative Images**:
- Descriptive alt text
- Describe function, not appearance
- 125 characters or less

**Complex Images** (charts, diagrams):
- Brief alt text
- Long description nearby or linked
- Consider data table alternative

## Designing for Screen Readers

### Content Order

Visual order should match DOM order:
- Most important content first
- Logical reading sequence
- Headings create structure

### Heading Structure

```
h1 - Page title (one per page)
  h2 - Major sections
    h3 - Subsections
      h4 - Further divisions
```

Never skip levels for visual styling.

### Meaningful Structure

**Lists** for groups of items
**Tables** for tabular data
**Landmarks** for page regions
**Links** must make sense out of context

## Mobile Accessibility

### Screen Reader Gestures

Design for swipe navigation:
- Linear content order
- Meaningful groupings
- Rotor-accessible elements

### Orientation

- Support both portrait and landscape
- Critical content in both orientations
- No orientation lock without reason

### Viewport

- Zoom not disabled
- Minimum 320px support
- Text scales with system settings

## Testing Checklist

### Quick Checks

- [ ] Color contrast passes (4.5:1 text, 3:1 UI)
- [ ] Color not only indicator
- [ ] Focus visible on all interactive elements
- [ ] Touch targets 44x44px minimum
- [ ] Text resizes to 200% without loss
- [ ] Heading hierarchy logical
- [ ] Images have appropriate alt text
- [ ] Forms have visible labels
- [ ] Errors clearly identified
- [ ] Skip link present

### Tools

**Contrast Checkers**:
- WebAIM Contrast Checker
- Stark (Figma plugin)
- Colour Contrast Analyser (desktop)

**Screen Readers**:
- VoiceOver (Mac/iOS)
- NVDA (Windows, free)
- JAWS (Windows)
- TalkBack (Android)

**Automated Testing**:
- axe DevTools (browser)
- WAVE (browser)
- Lighthouse (Chrome)

## Resources

### Guidelines
- **WCAG 2.2** (w3.org/WAI/WCAG22/quickref)
- **ARIA Authoring Practices** (w3.org/WAI/ARIA/apg)
- **Inclusive Components** (inclusive-components.design)

### Learning
- **A11y Project** (a11yproject.com)
- **Deque University** (dequeuniversity.com)
- **WebAIM** (webaim.org)

### Design Resources
- **Stark** (getstark.co) - Design tool plugins
- **Accessibility Insights** (accessibilityinsights.io)
- **Who Can Use** (whocanuse.com) - Color contrast visualization
