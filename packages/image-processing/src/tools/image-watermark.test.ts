import { describe, it, expect } from 'vitest';
import { imageWatermark } from './image-watermark.js';
import { createTestPng, getTempDir } from '../test-helpers/fixtures.js';
import { join } from 'path';
import { existsSync } from 'fs';

describe('imageWatermark', () => {
  it('adds watermark to bottom-right by default', async () => {
    const input = await createTestPng('watermark-input.png', 200, 200, { r: 0, g: 0, b: 255 });
    const output = join(getTempDir(), 'watermark-output.png');
    const result = await imageWatermark({ input, output, text: 'TEST' });
    expect(result.text).toBe('TEST');
    expect(result.position).toBe('bottom-right');
    expect(existsSync(output)).toBe(true);
  });

  it('adds watermark to center with custom options', async () => {
    const input = await createTestPng('watermark-center.png', 200, 200, { r: 0, g: 255, b: 0 });
    const output = join(getTempDir(), 'watermark-center-out.png');
    const result = await imageWatermark({
      input,
      output,
      text: 'Hello',
      position: 'center',
      fontSize: 30,
      color: 'white',
      opacity: 0.8,
    });
    expect(result.position).toBe('center');
    expect(existsSync(output)).toBe(true);
  });

  it('throws on missing input file', async () => {
    const output = join(getTempDir(), 'watermark-missing.png');
    await expect(
      imageWatermark({ input: join(getTempDir(), 'nonexistent.png'), output, text: 'X' }),
    ).rejects.toThrow();
  });
});
