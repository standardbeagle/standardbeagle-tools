import { describe, it, expect } from 'vitest';
import { imageMetadataExtract } from './image-metadata-extract.js';
import { createTestPng, getTempDir } from '../test-helpers/fixtures.js';
import { join } from 'path';

describe('imageMetadataExtract', () => {
  it('extracts metadata from a png', async () => {
    const input = await createTestPng('meta-input.png', 80, 60, { r: 255, g: 0, b: 0 });
    const result = await imageMetadataExtract({ input });
    expect(result.width).toBe(80);
    expect(result.height).toBe(60);
    expect(result.format).toBe('png');
    expect(result.channels).toBe(3);
    expect(result.hasAlpha).toBe(false);
  });

  it('throws on missing input file', async () => {
    await expect(
      imageMetadataExtract({ input: join(getTempDir(), 'nonexistent.png') }),
    ).rejects.toThrow();
  });
});
