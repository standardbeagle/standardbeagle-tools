import { describe, it, expect } from 'vitest';
import { imageFormatConvert } from './image-format-convert.js';
import { createTestPng, getTempDir } from '../test-helpers/fixtures.js';
import { join } from 'path';
import { existsSync } from 'fs';

describe('imageFormatConvert', () => {
  it('converts png to jpeg', async () => {
    const input = await createTestPng('convert-input.png', 10, 10, { r: 255, g: 0, b: 0 });
    const output = join(getTempDir(), 'convert-output.jpg');
    const result = await imageFormatConvert({ input, output, format: 'jpeg' });
    expect(result.format).toBe('jpeg');
    expect(existsSync(output)).toBe(true);
  });

  it('converts with quality setting', async () => {
    const input = await createTestPng('convert-quality.png', 10, 10, { r: 0, g: 255, b: 0 });
    const output = join(getTempDir(), 'convert-quality.webp');
    const result = await imageFormatConvert({ input, output, format: 'webp', quality: 80 });
    expect(result.format).toBe('webp');
    expect(existsSync(output)).toBe(true);
  });

  it('throws on missing input file', async () => {
    const output = join(getTempDir(), 'convert-missing.jpg');
    await expect(
      imageFormatConvert({ input: join(getTempDir(), 'nonexistent.png'), output, format: 'jpeg' }),
    ).rejects.toThrow();
  });
});
