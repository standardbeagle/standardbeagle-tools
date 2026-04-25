import * as cheerio from 'cheerio';
import { VAGUE_PHRASES } from '../lib/vague-phrases.js';
import {
  LinkTextCheckInputSchema,
  type LinkTextCheckOutput,
  type LinkTextIssue,
} from './link-text-check.schema.js';

const VAGUE_SET = new Set(VAGUE_PHRASES);
const URL_PATTERN = /^https?:\/\//i;

interface LinkRecord {
  text: string;
  href: string;
  issues: LinkTextIssue[];
  suggested_text?: string;
}

export async function linkTextCheck(input: unknown): Promise<LinkTextCheckOutput> {
  const { html } = LinkTextCheckInputSchema.parse(input);
  const $ = cheerio.load(html);

  const records: LinkRecord[] = [];
  // Track text -> distinct hrefs to detect duplicate-text-different-href.
  // Indexes here align 1:1 with `records` so we can patch issues in a second pass.
  const textToHrefs = new Map<string, Set<string>>();
  const textToIndices = new Map<string, number[]>();

  $('a').each((_, el) => {
    const $a = $(el);
    const rawText = $a.text();
    const text = rawText.trim();
    const normalized = text.toLowerCase();
    const href = $a.attr('href') ?? '';

    const issues: LinkTextIssue[] = [];

    if (text !== '' && VAGUE_SET.has(normalized)) {
      issues.push('vague-text');
    }

    if (text !== '' && URL_PATTERN.test(text)) {
      issues.push('url-as-text');
    }

    if (text === '') {
      const ariaLabel = $a.attr('aria-label')?.trim() ?? '';
      const hasAriaLabel = ariaLabel.length > 0;
      let hasImgAlt = false;
      $a.find('img').each((__, img) => {
        const alt = $(img).attr('alt')?.trim() ?? '';
        if (alt.length > 0) hasImgAlt = true;
      });
      if (!hasAriaLabel && !hasImgAlt) {
        issues.push('empty-text');
      }
    }

    const record: LinkRecord = { text, href, issues };

    // Suggested-text fallback chain only matters when an issue exists.
    // Resolution order: aria-label → title → preceding heading text.
    // We compute lazily: track placeholder, fill after issues finalized below.
    if (issues.length > 0) {
      const suggestion = resolveSuggestedText($, $a);
      if (suggestion !== undefined) {
        record.suggested_text = suggestion;
      }
    }

    records.push(record);

    if (text !== '') {
      const seen = textToHrefs.get(normalized);
      if (seen) {
        seen.add(href);
      } else {
        textToHrefs.set(normalized, new Set([href]));
      }
      const idx = textToIndices.get(normalized);
      if (idx) {
        idx.push(records.length - 1);
      } else {
        textToIndices.set(normalized, [records.length - 1]);
      }
    }
  });

  // Second pass: flag duplicate-text-different-href on every affected link.
  for (const [normalized, hrefs] of textToHrefs) {
    if (hrefs.size > 1) {
      const indices = textToIndices.get(normalized) ?? [];
      for (const i of indices) {
        const rec = records[i];
        if (!rec) continue;
        if (!rec.issues.includes('duplicate-text-different-href')) {
          rec.issues.push('duplicate-text-different-href');
        }
        // Add suggestion if not already set (issue introduced in second pass).
        if (rec.suggested_text === undefined) {
          // Re-locate the element to compute a suggestion. We can't keep the
          // Cheerio handle around because the iteration scope above closed,
          // so resolve via index using a fresh selector.
          const $a = $('a').eq(i);
          const suggestion = resolveSuggestedText($, $a);
          if (suggestion !== undefined) {
            rec.suggested_text = suggestion;
          }
        }
      }
    }
  }

  return { links: records };
}

/**
 * Suggested-text fallback chain:
 *   1. aria-label attribute (trimmed, non-empty)
 *   2. title attribute (trimmed, non-empty)
 *   3. closest preceding heading (h1-h6) text (trimmed, non-empty)
 *   4. undefined (omit field)
 */
function resolveSuggestedText(
  $: cheerio.CheerioAPI,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $a: any,
): string | undefined {
  const ariaLabel = ($a.attr('aria-label') as string | undefined)?.trim();
  if (ariaLabel) return ariaLabel;

  const title = ($a.attr('title') as string | undefined)?.trim();
  if (title) return title;

  // Walk all headings in document order; pick the last one whose position
  // precedes this anchor. Cheerio doesn't expose document position directly,
  // so we compare against an ordered list of all h1-h6 + a elements.
  const ordered = $('h1, h2, h3, h4, h5, h6, a').toArray();
  const anchorEl = $a.get(0);
  if (!anchorEl) return undefined;
  const anchorIdx = ordered.indexOf(anchorEl);
  if (anchorIdx <= 0) return undefined;

  for (let i = anchorIdx - 1; i >= 0; i--) {
    const candidate = ordered[i];
    if (!candidate) continue;
    const tag = (candidate as { tagName?: string }).tagName?.toLowerCase() ?? '';
    if (/^h[1-6]$/.test(tag)) {
      const headingText = $(candidate).text().trim();
      if (headingText) return headingText;
    }
  }

  return undefined;
}
