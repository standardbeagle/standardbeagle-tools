import { describe, it, expect } from 'vitest';
import { imageLazyAnalysis } from './image-lazy-analysis.js';
import { createTestPng, getTempDir } from '../test-helpers/fixtures.js';
import { join } from 'path';

describe('imageLazyAnalysis', () => {
  it('recommends native for small images', async () => {
    const img = await createTestPng('lazy-small.png', 100, 100, { r: 255, g: 0, b: 0 });
    const result = await imageLazyAnalysis({ images: [img] });
    expect(result.results.length).toBe(1);
    expect(result.results[0]!.recommendation).toBe('native');
    expect(result.results[0]!.renderWeight).toBe(10000);
  });

  it('recommends lazy for medium images', async () => {
    const img = await createTestPng('lazy-medium.png', 600, 500, { r: 0, g: 255, b: 0 });
    const result = await imageLazyAnalysis({ images: [img] });
    expect(result.results[0]!.recommendation).toBe('lazy');
  });

  it('recommends eager for very large images', async () => {
    const img = await createTestPng('lazy-large.png', 1200, 1000, { r: 0, g: 0, b: 255 });
    const result = await imageLazyAnalysis({ images: [img] });
    expect(result.results[0]!.recommendation).toBe('eager');
  });

  it('analyzes multiple images', async () => {
    const img1 = await createTestPng('lazy-multi-1.png', 50, 50, { r: 255, g: 0, b: 0 });
    const img2 = await createTestPng('lazy-multi-2.png', 800, 800, { r: 0, g: 255, b: 0 });
    const result = await imageLazyAnalysis({ images: [img1, img2] });
    expect(result.results.length).toBe(2);
    expect(result.results[0]!.recommendation).toBe('native');
    expect(result.results[1]!.recommendation).toBe('lazy');
  });

  it('throws on missing image file', async () => {
    await expect(
      imageLazyAnalysis({ images: [join(getTempDir(), 'nonexistent.png')] }),
    ).rejects.toThrow();
  });
});
