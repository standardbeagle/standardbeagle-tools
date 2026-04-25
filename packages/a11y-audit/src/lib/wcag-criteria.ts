/**
 * Static catalog of WCAG 2.2 Success Criteria.
 *
 * Each entry contains the SC id (e.g. "1.1.1"), title, conformance level
 * (A, AA, or AAA), and `applicable_axe_rules` — the set of axe-core rule ids
 * that test this SC. Empty `applicable_axe_rules` means axe-core does not
 * provide automated coverage for that criterion (status will resolve to
 * `untestable` in scoring).
 *
 * The `applicable_axe_rules` mapping was derived from axe-core 4.x rule
 * metadata (rule.tags entries like `wcag111`, `wcag2a`, `wcag21aa`) — see
 * scripts in audit-html for how axe-core exposes this. Other SCs reflect the
 * full WCAG 2.2 SC inventory from W3C.
 */

export type WcagLevel = 'A' | 'AA' | 'AAA';

export interface WcagCriterion {
  id: string;
  title: string;
  level: WcagLevel;
  applicable_axe_rules: string[];
}

export const WCAG_CRITERIA: readonly WcagCriterion[] = [
  // 1. Perceivable
  // 1.1 Text Alternatives
  { id: '1.1.1', title: 'Non-text Content', level: 'A',
    applicable_axe_rules: ['aria-meter-name', 'aria-progressbar-name', 'image-alt', 'input-image-alt', 'object-alt', 'role-img-alt', 'svg-img-alt'] },

  // 1.2 Time-based Media
  { id: '1.2.1', title: 'Audio-only and Video-only (Prerecorded)', level: 'A',
    applicable_axe_rules: ['audio-caption'] },
  { id: '1.2.2', title: 'Captions (Prerecorded)', level: 'A',
    applicable_axe_rules: ['video-caption'] },
  { id: '1.2.3', title: 'Audio Description or Media Alternative (Prerecorded)', level: 'A',
    applicable_axe_rules: [] },
  { id: '1.2.4', title: 'Captions (Live)', level: 'AA',
    applicable_axe_rules: [] },
  { id: '1.2.5', title: 'Audio Description (Prerecorded)', level: 'AA',
    applicable_axe_rules: [] },
  { id: '1.2.6', title: 'Sign Language (Prerecorded)', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '1.2.7', title: 'Extended Audio Description (Prerecorded)', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '1.2.8', title: 'Media Alternative (Prerecorded)', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '1.2.9', title: 'Audio-only (Live)', level: 'AAA',
    applicable_axe_rules: [] },

  // 1.3 Adaptable
  { id: '1.3.1', title: 'Info and Relationships', level: 'A',
    applicable_axe_rules: ['aria-hidden-body', 'aria-required-children', 'aria-required-parent', 'definition-list', 'dlitem', 'list', 'listitem', 'p-as-heading', 'table-fake-caption', 'td-has-header', 'td-headers-attr', 'th-has-data-cells'] },
  { id: '1.3.2', title: 'Meaningful Sequence', level: 'A',
    applicable_axe_rules: [] },
  { id: '1.3.3', title: 'Sensory Characteristics', level: 'A',
    applicable_axe_rules: [] },
  { id: '1.3.4', title: 'Orientation', level: 'AA',
    applicable_axe_rules: ['css-orientation-lock'] },
  { id: '1.3.5', title: 'Identify Input Purpose', level: 'AA',
    applicable_axe_rules: ['autocomplete-valid'] },
  { id: '1.3.6', title: 'Identify Purpose', level: 'AAA',
    applicable_axe_rules: [] },

  // 1.4 Distinguishable
  { id: '1.4.1', title: 'Use of Color', level: 'A',
    applicable_axe_rules: ['link-in-text-block'] },
  { id: '1.4.2', title: 'Audio Control', level: 'A',
    applicable_axe_rules: ['no-autoplay-audio'] },
  { id: '1.4.3', title: 'Contrast (Minimum)', level: 'AA',
    applicable_axe_rules: ['color-contrast'] },
  { id: '1.4.4', title: 'Resize Text', level: 'AA',
    applicable_axe_rules: ['meta-viewport'] },
  { id: '1.4.5', title: 'Images of Text', level: 'AA',
    applicable_axe_rules: [] },
  { id: '1.4.6', title: 'Contrast (Enhanced)', level: 'AAA',
    applicable_axe_rules: ['color-contrast-enhanced'] },
  { id: '1.4.7', title: 'Low or No Background Audio', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '1.4.8', title: 'Visual Presentation', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '1.4.9', title: 'Images of Text (No Exception)', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '1.4.10', title: 'Reflow', level: 'AA',
    applicable_axe_rules: [] },
  { id: '1.4.11', title: 'Non-text Contrast', level: 'AA',
    applicable_axe_rules: [] },
  { id: '1.4.12', title: 'Text Spacing', level: 'AA',
    applicable_axe_rules: ['avoid-inline-spacing'] },
  { id: '1.4.13', title: 'Content on Hover or Focus', level: 'AA',
    applicable_axe_rules: [] },

  // 2. Operable
  // 2.1 Keyboard Accessible
  { id: '2.1.1', title: 'Keyboard', level: 'A',
    applicable_axe_rules: ['frame-focusable-content', 'scrollable-region-focusable', 'server-side-image-map'] },
  { id: '2.1.2', title: 'No Keyboard Trap', level: 'A',
    applicable_axe_rules: [] },
  { id: '2.1.3', title: 'Keyboard (No Exception)', level: 'AAA',
    applicable_axe_rules: ['scrollable-region-focusable'] },
  { id: '2.1.4', title: 'Character Key Shortcuts', level: 'A',
    applicable_axe_rules: [] },

  // 2.2 Enough Time
  { id: '2.2.1', title: 'Timing Adjustable', level: 'A',
    applicable_axe_rules: ['meta-refresh'] },
  { id: '2.2.2', title: 'Pause, Stop, Hide', level: 'A',
    applicable_axe_rules: ['blink', 'marquee'] },
  { id: '2.2.3', title: 'No Timing', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '2.2.4', title: 'Interruptions', level: 'AAA',
    applicable_axe_rules: ['meta-refresh-no-exceptions'] },
  { id: '2.2.5', title: 'Re-authenticating', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '2.2.6', title: 'Timeouts', level: 'AAA',
    applicable_axe_rules: [] },

  // 2.3 Seizures and Physical Reactions
  { id: '2.3.1', title: 'Three Flashes or Below Threshold', level: 'A',
    applicable_axe_rules: [] },
  { id: '2.3.2', title: 'Three Flashes', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '2.3.3', title: 'Animation from Interactions', level: 'AAA',
    applicable_axe_rules: [] },

  // 2.4 Navigable
  { id: '2.4.1', title: 'Bypass Blocks', level: 'A',
    applicable_axe_rules: ['bypass'] },
  { id: '2.4.2', title: 'Page Titled', level: 'A',
    applicable_axe_rules: ['document-title'] },
  { id: '2.4.3', title: 'Focus Order', level: 'A',
    applicable_axe_rules: [] },
  { id: '2.4.4', title: 'Link Purpose (In Context)', level: 'A',
    applicable_axe_rules: ['area-alt', 'link-name'] },
  { id: '2.4.5', title: 'Multiple Ways', level: 'AA',
    applicable_axe_rules: [] },
  { id: '2.4.6', title: 'Headings and Labels', level: 'AA',
    applicable_axe_rules: [] },
  { id: '2.4.7', title: 'Focus Visible', level: 'AA',
    applicable_axe_rules: [] },
  { id: '2.4.8', title: 'Location', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '2.4.9', title: 'Link Purpose (Link Only)', level: 'AAA',
    applicable_axe_rules: ['identical-links-same-purpose'] },
  { id: '2.4.10', title: 'Section Headings', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '2.4.11', title: 'Focus Not Obscured (Minimum)', level: 'AA',
    applicable_axe_rules: [] },
  { id: '2.4.12', title: 'Focus Not Obscured (Enhanced)', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '2.4.13', title: 'Focus Appearance', level: 'AAA',
    applicable_axe_rules: [] },

  // 2.5 Input Modalities
  { id: '2.5.1', title: 'Pointer Gestures', level: 'A',
    applicable_axe_rules: [] },
  { id: '2.5.2', title: 'Pointer Cancellation', level: 'A',
    applicable_axe_rules: [] },
  { id: '2.5.3', title: 'Label in Name', level: 'A',
    applicable_axe_rules: ['label-content-name-mismatch'] },
  { id: '2.5.4', title: 'Motion Actuation', level: 'A',
    applicable_axe_rules: [] },
  { id: '2.5.5', title: 'Target Size (Enhanced)', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '2.5.6', title: 'Concurrent Input Mechanisms', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '2.5.7', title: 'Dragging Movements', level: 'AA',
    applicable_axe_rules: [] },
  { id: '2.5.8', title: 'Target Size (Minimum)', level: 'AA',
    applicable_axe_rules: ['target-size'] },

  // 3. Understandable
  // 3.1 Readable
  { id: '3.1.1', title: 'Language of Page', level: 'A',
    applicable_axe_rules: ['html-has-lang', 'html-lang-valid', 'html-xml-lang-mismatch'] },
  { id: '3.1.2', title: 'Language of Parts', level: 'AA',
    applicable_axe_rules: ['valid-lang'] },
  { id: '3.1.3', title: 'Unusual Words', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '3.1.4', title: 'Abbreviations', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '3.1.5', title: 'Reading Level', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '3.1.6', title: 'Pronunciation', level: 'AAA',
    applicable_axe_rules: [] },

  // 3.2 Predictable
  { id: '3.2.1', title: 'On Focus', level: 'A',
    applicable_axe_rules: [] },
  { id: '3.2.2', title: 'On Input', level: 'A',
    applicable_axe_rules: [] },
  { id: '3.2.3', title: 'Consistent Navigation', level: 'AA',
    applicable_axe_rules: [] },
  { id: '3.2.4', title: 'Consistent Identification', level: 'AA',
    applicable_axe_rules: [] },
  { id: '3.2.5', title: 'Change on Request', level: 'AAA',
    applicable_axe_rules: ['meta-refresh-no-exceptions'] },
  { id: '3.2.6', title: 'Consistent Help', level: 'A',
    applicable_axe_rules: [] },

  // 3.3 Input Assistance
  { id: '3.3.1', title: 'Error Identification', level: 'A',
    applicable_axe_rules: [] },
  { id: '3.3.2', title: 'Labels or Instructions', level: 'A',
    applicable_axe_rules: ['form-field-multiple-labels'] },
  { id: '3.3.3', title: 'Error Suggestion', level: 'AA',
    applicable_axe_rules: [] },
  { id: '3.3.4', title: 'Error Prevention (Legal, Financial, Data)', level: 'AA',
    applicable_axe_rules: [] },
  { id: '3.3.5', title: 'Help', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '3.3.6', title: 'Error Prevention (All)', level: 'AAA',
    applicable_axe_rules: [] },
  { id: '3.3.7', title: 'Redundant Entry', level: 'A',
    applicable_axe_rules: [] },
  { id: '3.3.8', title: 'Accessible Authentication (Minimum)', level: 'AA',
    applicable_axe_rules: [] },
  { id: '3.3.9', title: 'Accessible Authentication (Enhanced)', level: 'AAA',
    applicable_axe_rules: [] },

  // 4. Robust
  // 4.1 Compatible
  { id: '4.1.1', title: 'Parsing (Obsolete and Removed)', level: 'A',
    applicable_axe_rules: ['duplicate-id-active', 'duplicate-id'] },
  { id: '4.1.2', title: 'Name, Role, Value', level: 'A',
    applicable_axe_rules: ['area-alt', 'aria-allowed-attr', 'aria-braille-equivalent', 'aria-command-name', 'aria-conditional-attr', 'aria-deprecated-role', 'aria-hidden-body', 'aria-hidden-focus', 'aria-input-field-name', 'aria-prohibited-attr', 'aria-required-attr', 'aria-roledescription', 'aria-roles', 'aria-toggle-field-name', 'aria-tooltip-name', 'aria-valid-attr-value', 'aria-valid-attr', 'button-name', 'duplicate-id-aria', 'frame-title-unique', 'frame-title', 'input-button-name', 'input-image-alt', 'label', 'link-name', 'nested-interactive', 'select-name', 'summary-name'] },
  { id: '4.1.3', title: 'Status Messages', level: 'AA',
    applicable_axe_rules: [] },
] as const;
