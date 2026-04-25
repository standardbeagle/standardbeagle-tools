import * as cheerio from 'cheerio';
import {
  HeadingStructureInputSchema,
  type HeadingStructureOutput,
} from './heading-structure.schema.js';

interface HeadingEntry {
  level: number;
  text: string;
  id?: string;
}

interface Issue {
  type: 'skipped_level' | 'missing_h1' | 'multiple_h1' | 'empty_heading';
  location: string;
  fix: string;
}

export async function headingStructure(input: unknown): Promise<HeadingStructureOutput> {
  const { html } = HeadingStructureInputSchema.parse(input);
  const $ = cheerio.load(html);

  const outline: HeadingEntry[] = [];
  const issues: Issue[] = [];

  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tagName = (el as { tagName?: string }).tagName?.toLowerCase() ?? '';
    const level = Number.parseInt(tagName.substring(1), 10);
    const rawText = $(el).text();
    const text = rawText.trim();
    const id = $(el).attr('id');
    const entry: HeadingEntry = { level, text };
    if (id) entry.id = id;
    outline.push(entry);
  });

  // Track per-level occurrence numbers for stable locations
  const levelCounts = new Map<number, number>();
  const locations: string[] = outline.map((entry) => {
    const next = (levelCounts.get(entry.level) ?? 0) + 1;
    levelCounts.set(entry.level, next);
    return `h${entry.level} #${next}`;
  });

  // Skipped-level detection
  let prevLevel = 0;
  outline.forEach((entry, i) => {
    if (prevLevel > 0 && entry.level > prevLevel + 1) {
      issues.push({
        type: 'skipped_level',
        location: locations[i]!,
        fix: `Heading level jumped from h${prevLevel} to h${entry.level}; insert an h${prevLevel + 1} or demote this heading to h${prevLevel + 1}.`,
      });
    }
    prevLevel = entry.level;
  });

  // h1 count
  const h1Indices = outline
    .map((entry, i) => (entry.level === 1 ? i : -1))
    .filter((i) => i >= 0);
  const h1Count = h1Indices.length;

  if (h1Count === 0) {
    issues.push({
      type: 'missing_h1',
      location: 'document',
      fix: 'Add a single top-level <h1> that names the page or main content.',
    });
  } else if (h1Count > 1) {
    // One issue per extra h1 (skip the first, flag the rest).
    h1Indices.slice(1).forEach((idx) => {
      issues.push({
        type: 'multiple_h1',
        location: locations[idx]!,
        fix: 'Demote this <h1> to <h2> (or deeper) so the document has exactly one top-level heading.',
      });
    });
  }

  // Empty heading detection
  outline.forEach((entry, i) => {
    if (entry.text === '') {
      issues.push({
        type: 'empty_heading',
        location: locations[i]!,
        fix: `Provide visible text inside this h${entry.level}, or remove it if it is decorative.`,
      });
    }
  });

  const has_h1 = h1Count >= 1;
  const max_depth = outline.reduce((max, entry) => Math.max(max, entry.level), 0);

  return {
    outline,
    issues,
    has_h1,
    max_depth,
  };
}
