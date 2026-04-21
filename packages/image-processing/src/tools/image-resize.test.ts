import { describe, it, expect } from 'vitest';
import { imageResize } from './image-resize.js';
import { createTestPng, getTempDir } from '../test-helpers/fixtures.js';
import { join } from 'path';

describe('imageResize', () => {
  it('resizes an image to specified width', async () => {
    const input = await createTestPng('resize-input.png', 100, 100, { r: 255, g: 0, b: 0 });
    const output = join(getTempDir(), 'resize-output.png');
    const result = await imageResize({ input, output, width: 50 });
    expect(result.width).toBe(50);
    expect(result.height).toBe(50);
  });

  it('resizes with fit contain', async () => {
    const input = await createTestPng('resize-contain.png', 200, 100, { r: 0, g: 255, b: 0 });
    const output = join(getTempDir(), 'resize-contain-out.png');
    const result = await imageResize({ input, output, width: 50, height: 50, fit: 'contain' });
    expect(result.width).toBe(50);
    expect(result.height).toBe(50);
  });

  it('throws on missing input file', async () => {
    const output = join(getTempDir(), 'resize-missing.png');
    await expect(
      imageResize({ input: join(getTempDir(), 'nonexistent.png'), output, width: 50 }),
    ).rejects.toThrow();
  });
});
