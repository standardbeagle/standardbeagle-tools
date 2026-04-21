import { describe, it, expect } from 'vitest';
import { imageOptimize } from './image-optimize.js';
import { createTestPng, getTempDir } from '../test-helpers/fixtures.js';
import { join } from 'path';
import { existsSync } from 'fs';

describe('imageOptimize', () => {
  it('optimizes to webp with quality', async () => {
    const input = await createTestPng('optimize-input.png', 50, 50, { r: 255, g: 0, b: 0 });
    const output = join(getTempDir(), 'optimize-output.webp');
    const result = await imageOptimize({ input, output, format: 'webp', quality: 85 });
    expect(result.format).toBe('webp');
    expect(result.quality).toBe(85);
    expect(existsSync(output)).toBe(true);
  });

  it('optimizes jpeg progressively', async () => {
    const input = await createTestPng('optimize-prog.png', 50, 50, { r: 0, g: 255, b: 0 });
    const output = join(getTempDir(), 'optimize-prog.jpg');
    const result = await imageOptimize({ input, output, format: 'jpeg', progressive: true });
    expect(result.format).toBe('jpeg');
    expect(existsSync(output)).toBe(true);
  });

  it('throws on missing input file', async () => {
    const output = join(getTempDir(), 'optimize-missing.webp');
    await expect(
      imageOptimize({ input: join(getTempDir(), 'nonexistent.png'), output, format: 'webp' }),
    ).rejects.toThrow();
  });
});
