/**
 * Vague link-text phrases for the link_text_check tool.
 *
 * A link's accessible name should describe its destination or purpose without
 * relying on surrounding context. Phrases below convey nothing on their own
 * and trip WCAG 2.4.4 (Link Purpose, In Context) / 2.4.9 (Link Purpose,
 * Link Only) when used as the entire visible text of an `<a>`.
 *
 * Comparison is case-insensitive and trimmed; entries here MUST be stored
 * lowercase and pre-trimmed so the lookup can match `text.trim().toLowerCase()`
 * directly without further normalization.
 */
export const VAGUE_PHRASES: string[] = [
  'click here',
  'here',
  'more',
  'read more',
  'learn more',
  'details',
  'this',
  'link',
  'this link',
  'go',
  'go here',
  'click this',
  'info',
  'click',
  'more info',
  'additional info',
  'find out more',
  'see more',
  'view more',
  'read on',
  'continue',
  'open',
  'open link',
  'this page',
  'website',
];
