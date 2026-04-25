import { describe, it, expect } from 'vitest';
import { linkTextCheck } from './link-text-check.js';
import { VAGUE_PHRASES } from '../lib/vague-phrases.js';

describe('linkTextCheck', () => {
  it('lexicon has at least 20 vague phrases, all lowercase and trimmed', () => {
    expect(VAGUE_PHRASES.length).toBeGreaterThanOrEqual(20);
    for (const phrase of VAGUE_PHRASES) {
      expect(phrase).toBe(phrase.toLowerCase());
      expect(phrase).toBe(phrase.trim());
      expect(phrase.length).toBeGreaterThan(0);
    }
  });

  it("flags vague-text on '<a href='/x'>click here</a>'", async () => {
    const result = await linkTextCheck({
      html: "<a href='/x'>click here</a>",
    });
    expect(result.links).toHaveLength(1);
    expect(result.links[0]!.text).toBe('click here');
    expect(result.links[0]!.href).toBe('/x');
    expect(result.links[0]!.issues).toContain('vague-text');
  });

  it("flags duplicate-text-different-href when 'More' links to /x and /y", async () => {
    const result = await linkTextCheck({
      html: "<a href='/x'>More</a><a href='/y'>More</a>",
    });
    expect(result.links).toHaveLength(2);
    for (const link of result.links) {
      expect(link.issues).toContain('duplicate-text-different-href');
    }
  });

  it("flags empty-text on '<a href='/x'></a>' with no aria-label and no img alt", async () => {
    const result = await linkTextCheck({
      html: "<a href='/x'></a>",
    });
    expect(result.links).toHaveLength(1);
    expect(result.links[0]!.text).toBe('');
    expect(result.links[0]!.issues).toContain('empty-text');
  });

  it("does NOT flag empty-text when anchor has aria-label", async () => {
    const result = await linkTextCheck({
      html: "<a href='/x' aria-label='Open settings'></a>",
    });
    expect(result.links[0]!.issues).not.toContain('empty-text');
  });

  it("does NOT flag empty-text when anchor wraps img with non-empty alt", async () => {
    const result = await linkTextCheck({
      html: "<a href='/x'><img src='/i.png' alt='Home'></a>",
    });
    expect(result.links[0]!.issues).not.toContain('empty-text');
  });

  it("flags empty-text when img alt is empty / whitespace", async () => {
    const result = await linkTextCheck({
      html: "<a href='/x'><img src='/i.png' alt=''></a>",
    });
    expect(result.links[0]!.issues).toContain('empty-text');
  });

  it("returns no issues for descriptive link text 'Download PDF'", async () => {
    const result = await linkTextCheck({
      html: "<a href='/x'>Download PDF</a>",
    });
    expect(result.links).toHaveLength(1);
    expect(result.links[0]!.issues).toEqual([]);
    expect(result.links[0]!.suggested_text).toBeUndefined();
  });

  it("flags url-as-text when visible text is an http(s) URL", async () => {
    const result = await linkTextCheck({
      html: "<a href='/x'>https://example.com</a>",
    });
    expect(result.links[0]!.issues).toContain('url-as-text');
  });

  it('handles nested elements: <a><span>click</span> here</a> → vague-text', async () => {
    const result = await linkTextCheck({
      html: "<a href='/x'><span>click</span> here</a>",
    });
    expect(result.links).toHaveLength(1);
    expect(result.links[0]!.text).toBe('click here');
    expect(result.links[0]!.issues).toContain('vague-text');
  });

  it('case-insensitive vague match (CLICK HERE, More)', async () => {
    const result = await linkTextCheck({
      html: "<a href='/a'>CLICK HERE</a><a href='/b'>More</a>",
    });
    expect(result.links[0]!.issues).toContain('vague-text');
    expect(result.links[1]!.issues).toContain('vague-text');
  });

  it('suggested_text uses aria-label when issue is present', async () => {
    const result = await linkTextCheck({
      html: "<a href='/docs' aria-label='Read the documentation'>more</a>",
    });
    expect(result.links[0]!.issues).toContain('vague-text');
    expect(result.links[0]!.suggested_text).toBe('Read the documentation');
  });

  it('suggested_text falls back to title when no aria-label', async () => {
    const result = await linkTextCheck({
      html: "<a href='/docs' title='Documentation'>more</a>",
    });
    expect(result.links[0]!.suggested_text).toBe('Documentation');
  });

  it('suggested_text falls back to preceding heading text', async () => {
    const result = await linkTextCheck({
      html: '<h2>Pricing plans</h2><p>Compare options. <a href="/p">click here</a></p>',
    });
    expect(result.links[0]!.issues).toContain('vague-text');
    expect(result.links[0]!.suggested_text).toBe('Pricing plans');
  });

  it('suggested_text omitted when no fallback is available', async () => {
    const result = await linkTextCheck({
      html: "<a href='/x'>more</a>",
    });
    expect(result.links[0]!.issues).toContain('vague-text');
    expect(result.links[0]!.suggested_text).toBeUndefined();
  });

  it('does not flag duplicate-text-different-href when both links share the same href', async () => {
    const result = await linkTextCheck({
      html: "<a href='/x'>More</a><a href='/x'>More</a>",
    });
    for (const link of result.links) {
      expect(link.issues).not.toContain('duplicate-text-different-href');
    }
  });

  it('handles anchor without href (returns href as empty string)', async () => {
    const result = await linkTextCheck({
      html: '<a>plain anchor</a>',
    });
    expect(result.links).toHaveLength(1);
    expect(result.links[0]!.href).toBe('');
    expect(result.links[0]!.text).toBe('plain anchor');
  });

  it('does no network I/O — pure parse on a string', async () => {
    const result = await linkTextCheck({
      html:
        "<a href='https://example.com/page'>Read more</a><img src='https://example.com/never-fetch.png'>",
    });
    expect(result.links).toHaveLength(1);
    expect(result.links[0]!.issues).toContain('vague-text');
  });

  it('returns empty list when no anchors are present', async () => {
    const result = await linkTextCheck({
      html: '<p>no links here</p>',
    });
    expect(result.links).toEqual([]);
  });
});
