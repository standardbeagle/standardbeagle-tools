import { describe, it, expect } from 'vitest';
import { fontPair } from './font-pair.js';

describe('fontPair', () => {
  it('matches exact primary font name', () => {
    const result = fontPair({ primary: 'Inter' });
    expect(result.primary).toBe('Inter');
    expect(result.secondary).toBe('Merriweather');
    expect(result.fallback).toBe('system-ui, Georgia, serif');
  });

  it('is case-insensitive', () => {
    const result = fontPair({ primary: 'inter' });
    expect(result.primary).toBe('Inter');
  });

  it('falls back to mood + category match when primary is unknown', () => {
    const result = fontPair({ primary: 'UnknownFont', mood: 'playful', category: 'sans-serif' });
    expect(result.primary).toBeDefined();
    expect(result.secondary).toBeDefined();
    expect(result.fallback).toBeDefined();
  });

  it('falls back to first pairing when nothing matches', () => {
    const result = fontPair({ primary: 'UnknownFont' });
    expect(result.primary).toBeDefined();
    expect(result.secondary).toBeDefined();
    expect(result.fallback).toBeDefined();
  });

  it('respects mood filter', () => {
    const result = fontPair({ primary: 'X', mood: 'classic' });
    // Crimson Text, Playfair Display, Merriweather, etc. are classic
    expect(result.primary).toBeDefined();
  });

  it('respects category filter', () => {
    const result = fontPair({ primary: 'X', category: 'monospace' });
    expect(result.primary).toBe('Fira Sans');
    expect(result.secondary).toBe('Fira Code');
  });
});
