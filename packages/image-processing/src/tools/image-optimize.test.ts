import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, statSync } from 'fs';
import { imageOptimize } from './image-optimize.js';
import { getTempDir } from '../test-helpers/fixtures.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '..', '..', 'test', 'fixtures');
const photoFixture = join(fixturesDir, 'photo.jpg');
const diagramFixture = join(fixturesDir, 'diagram.png');

describe('imageOptimize', () => {
  it('photo.jpg → photo.webp at quality=80 reduces bytes by >30%', async () => {
    const output = join(getTempDir(), 'photo.webp');
    const result = await imageOptimize({
      input_path: photoFixture,
      output_path: output,
      format: 'webp',
      quality: 80,
      strip_metadata: true,
    });

    expect(existsSync(output)).toBe(true);
    expect(result.format_used).toBe('webp');
    expect(result.dimensions).toEqual({ width: 320, height: 240 });
    expect(result.input_bytes).toBe(statSync(photoFixture).size);
    expect(result.output_bytes).toBe(statSync(output).size);
    expect(result.reduction_percent).toBeGreaterThan(30);
  });

  // AVIF encoding is CPU-heavy; under concurrent workspace test load a 5s
  // default timeout can be tight. Bump just this test to keep the rest fast.
  it('diagram.png → diagram.avif at quality=60 reduces bytes by >50%', { timeout: 30000 }, async () => {
    const output = join(getTempDir(), 'diagram.avif');
    const result = await imageOptimize({
      input_path: diagramFixture,
      output_path: output,
      format: 'avif',
      quality: 60,
      strip_metadata: true,
    });

    expect(existsSync(output)).toBe(true);
    expect(result.format_used).toBe('heif'); // sharp reports avif container as heif
    expect(result.dimensions).toEqual({ width: 320, height: 240 });
    expect(result.reduction_percent).toBeGreaterThan(50);
  });

  it('strip_metadata=true drops EXIF from output', async () => {
    const output = join(getTempDir(), 'photo-stripped.jpg');
    await imageOptimize({
      input_path: photoFixture,
      output_path: output,
      format: 'jpg',
      quality: 80,
      strip_metadata: true,
    });

    const meta = await sharp(output).metadata();
    expect(meta.exif).toBeUndefined();
  });

  it('strip_metadata=false preserves EXIF', async () => {
    const output = join(getTempDir(), 'photo-kept.jpg');
    await imageOptimize({
      input_path: photoFixture,
      output_path: output,
      format: 'jpg',
      quality: 80,
      strip_metadata: false,
    });

    const meta = await sharp(output).metadata();
    expect(meta.exif).toBeDefined();
  });

  it('produces non-empty output for each of the 4 supported formats', { timeout: 30000 }, async () => {
    const formats: Array<'png' | 'jpg' | 'webp' | 'avif'> = ['png', 'jpg', 'webp', 'avif'];
    for (const fmt of formats) {
      const output = join(getTempDir(), `multi.${fmt}`);
      const result = await imageOptimize({
        input_path: photoFixture,
        output_path: output,
        format: fmt,
        quality: 80,
        strip_metadata: true,
      });
      expect(result.output_bytes).toBeGreaterThan(0);
      expect(existsSync(output)).toBe(true);
    }
  });

  it('infers format from output_path extension when format omitted', async () => {
    const output = join(getTempDir(), 'inferred.webp');
    const result = await imageOptimize({
      input_path: photoFixture,
      output_path: output,
      quality: 80,
      strip_metadata: true,
    });
    expect(result.format_used).toBe('webp');
  });

  it('rejects when input_path does not exist', async () => {
    await expect(
      imageOptimize({
        input_path: join(getTempDir(), 'does-not-exist.jpg'),
        output_path: join(getTempDir(), 'out.webp'),
        format: 'webp',
        quality: 80,
        strip_metadata: true,
      }),
    ).rejects.toThrow();
  });

  it('rejects when format cannot be inferred and is not provided', async () => {
    await expect(
      imageOptimize({
        input_path: photoFixture,
        output_path: join(getTempDir(), 'no-extension'),
        quality: 80,
        strip_metadata: true,
      }),
    ).rejects.toThrow(/Cannot infer format/);
  });
});
