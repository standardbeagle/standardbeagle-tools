import sharp from 'sharp';
import { kmeans } from '../lib/kmeans.js';
import type { PaletteExtractInput, PaletteExtractOutput } from './palette-extract.schema.js';

function rgbToHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

export async function paletteExtract(input: PaletteExtractInput): Promise<PaletteExtractOutput> {
  const { data, info } = await sharp(input.image)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const pixels: Array<{ x: number; y: number; z: number }> = [];

  // Random subsample
  const totalPixels = width * height;
  const sampleCount = Math.min(input.sample_pixels, totalPixels);
  const stride = Math.floor(totalPixels / sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const idx = Math.min(i * stride, totalPixels - 1) * 4;
    pixels.push({
      x: data[idx]!,
      y: data[idx + 1]!,
      z: data[idx + 2]!,
    });
  }

  const clusters = kmeans(pixels, input.k, 50, 1.0);

  // Assign all sampled pixels to nearest centroid for percentages
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
      rgb: { r: Math.round(c.centroid.x), g: Math.round(c.centroid.y), b: Math.round(c.centroid.z) },
      percentage: Number(((counts[i] / pixels.length) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return { palette };
}
