// Semantic overlap with @standardbeagle/color D6 palette_extract is intentional —
// image-processing MCP surface for the same algorithm. Both tools share the kmeans
// implementation in @standardbeagle/ux-core/lib/kmeans and emit the identical
// { palette: [{ hex, rgb, percentage }] } shape (percentage scaled 0-100).
import sharp from 'sharp';
import { kmeans } from '@standardbeagle/ux-core';
import type {
  PaletteFromImageInput,
  PaletteFromImageOutput,
} from './palette-from-image.schema.js';

function rgbToHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

export async function paletteFromImage(
  input: PaletteFromImageInput,
): Promise<PaletteFromImageOutput> {
  const { data, info } = await sharp(input.input_path)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const totalPixels = width * height;
  const sampleCount = Math.min(input.sample_pixels, totalPixels);
  const stride = Math.floor(totalPixels / sampleCount);

  const pixels: Array<{ x: number; y: number; z: number }> = [];
  for (let i = 0; i < sampleCount; i++) {
    const idx = Math.min(i * stride, totalPixels - 1) * 4;
    pixels.push({
      x: data[idx]!,
      y: data[idx + 1]!,
      z: data[idx + 2]!,
    });
  }

  const clusters = kmeans(pixels, input.count, 50, 1.0);

  const counts = new Array(clusters.length).fill(0);
  for (const p of pixels) {
    let minDist = Infinity;
    let closest = 0;
    for (let i = 0; i < clusters.length; i++) {
      const c = clusters[i]!.centroid;
      const d = Math.sqrt((p.x - c.x) ** 2 + (p.y - c.y) ** 2 + (p.z - c.z) ** 2);
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    }
    counts[closest]++;
  }

  const palette = clusters
    .map((c, i) => ({
      hex: rgbToHex(c.centroid.x, c.centroid.y, c.centroid.z),
      rgb: {
        r: Math.round(c.centroid.x),
        g: Math.round(c.centroid.y),
        b: Math.round(c.centroid.z),
      },
      percentage: Number(((counts[i] / pixels.length) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return { palette };
}
