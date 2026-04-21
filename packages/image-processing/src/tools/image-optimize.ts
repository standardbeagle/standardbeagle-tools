import sharp from 'sharp';
import type { ImageOptimizeInput, ImageOptimizeOutput } from './image-optimize.schema.js';

export async function imageOptimize(input: ImageOptimizeInput): Promise<ImageOptimizeOutput> {
  const format = input.format ?? 'jpeg';
  const options: sharp.JpegOptions | sharp.PngOptions | sharp.WebpOptions | sharp.AvifOptions = {};

  if (input.quality !== undefined) {
    (options as { quality?: number }).quality = input.quality;
  }

  if (format === 'jpeg' && input.progressive !== undefined) {
    (options as sharp.JpegOptions).progressive = input.progressive;
  }

  if (format === 'png') {
    (options as sharp.PngOptions).compressionLevel = 9;
  }

  await sharp(input.input)
    .toFormat(format, options)
    .toFile(input.output);

  return {
    input: input.input,
    output: input.output,
    format,
    quality: input.quality,
  };
}
