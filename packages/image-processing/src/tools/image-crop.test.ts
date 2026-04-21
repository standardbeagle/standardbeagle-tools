import { describe, it, expect } from 'vitest';
import { imageCrop } from './image-crop.js';
import { createTestPng, getTempDir } from '../test-helpers/fixtures.js';
import { join } from 'path';

describe('imageCrop', () => {
  it('crops a region from the image', async () => {
    const input = await createTestPng('crop-input.png', 100, 100, { r: 255, g: 0, b: 0 });
    const output = join(getTempDir(), 'crop-output.png');
    const result = await imageCrop({ input, output, left: 10, top: 10, width: 40, height: 40 });
    expect(result.width).toBe(40);
    expect(result.height).toBe(40);
    expect(result.left).toBe(10);
    expect(result.top).toBe(10);
  });

  it('throws when crop region exceeds image bounds', async () => {
    const input = await createTestPng('crop-bounds.png', 20, 20, { r: 0, g: 0, b: 255 });
    const output = join(getTempDir(), 'crop-bounds-out.png');
    await expect(
      imageCrop({ input, output, left: 10, top: 10, width: 20, height: 20 }),
    ).rejects.toThrow();
  });

  it('throws on missing input file', async () => {
    const output = join(getTempDir(), 'crop-missing.png');
    await expect(
      imageCrop({ input: join(getTempDir(), 'nonexistent.png'), output, left: 0, top: 0, width: 10, height: 10 }),
    ).rejects.toThrow();
  });
});
