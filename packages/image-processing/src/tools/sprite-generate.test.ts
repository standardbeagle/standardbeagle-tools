import { describe, it, expect } from 'vitest';
import { spriteGenerate } from './sprite-generate.js';
import { createTestPng, getTempDir } from '../test-helpers/fixtures.js';
import { join } from 'path';
import { existsSync } from 'fs';

describe('spriteGenerate', () => {
  it('generates a sprite sheet from multiple images', async () => {
    const img1 = await createTestPng('sprite-1.png', 20, 20, { r: 255, g: 0, b: 0 });
    const img2 = await createTestPng('sprite-2.png', 30, 30, { r: 0, g: 255, b: 0 });
    const output = join(getTempDir(), 'sprite-output.png');
    const result = await spriteGenerate({ images: [img1, img2], output });
    expect(result.width).toBe(50);
    expect(result.height).toBe(30);
    expect(result.icons.length).toBe(2);
    expect(result.icons[0]!.x).toBe(0);
    expect(result.icons[1]!.x).toBe(20);
    expect(existsSync(output)).toBe(true);
    expect(result.css).toContain('background-position');
  });

  it('uses custom css class prefix', async () => {
    const img1 = await createTestPng('sprite-prefix.png', 10, 10, { r: 0, g: 0, b: 255 });
    const output = join(getTempDir(), 'sprite-prefix-out.png');
    const result = await spriteGenerate({ images: [img1], output, cssClassPrefix: 'logo' });
    expect(result.css).toContain('.logo-sprite-prefix');
  });

  it('throws on empty images array', async () => {
    const output = join(getTempDir(), 'sprite-empty.png');
    await expect(spriteGenerate({ images: [], output })).rejects.toThrow('No images provided');
  });

  it('throws on missing image file', async () => {
    const output = join(getTempDir(), 'sprite-missing.png');
    await expect(
      spriteGenerate({ images: [join(getTempDir(), 'nonexistent.png')], output }),
    ).rejects.toThrow();
  });
});
