import sharp from 'sharp';
import type { ImageResizeInput, ImageResizeOutput } from './image-resize.schema.js';

export async function imageResize(input: ImageResizeInput): Promise<ImageResizeOutput> {
  const transformer = sharp(input.input).resize({
    width: input.width,
    height: input.height,
    fit: input.fit,
    withoutEnlargement: input.withoutEnlargement,
  });

  await transformer.toFile(input.output);
  const metadata = await sharp(input.output).metadata();

  return {
    input: input.input,
    output: input.output,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}
