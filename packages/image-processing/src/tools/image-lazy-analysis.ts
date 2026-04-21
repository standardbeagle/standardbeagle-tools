import { stat } from 'fs/promises';
import sharp from 'sharp';
import type { ImageLazyAnalysisInput, ImageLazyAnalysisOutput, ImageLazyAnalysisItem } from './image-lazy-analysis.schema.js';

export async function imageLazyAnalysis(input: ImageLazyAnalysisInput): Promise<ImageLazyAnalysisOutput> {
  const results: ImageLazyAnalysisItem[] = [];

  for (const imagePath of input.images) {
    const metadata = await sharp(imagePath).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const renderWeight = width * height;

    let fileSize = 0;
    try {
      const stats = await stat(imagePath);
      fileSize = stats.size;
    } catch {
      // ignore stat errors
    }

    let recommendation: 'eager' | 'lazy' | 'native';
    if (renderWeight > 1_000_000) {
      recommendation = 'eager';
    } else if (renderWeight > 250_000) {
      recommendation = 'lazy';
    } else {
      recommendation = 'native';
    }

    results.push({
      path: imagePath,
      width,
      height,
      fileSize,
      renderWeight,
      recommendation,
    });
  }

  return { results };
}
