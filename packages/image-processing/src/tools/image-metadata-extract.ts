import sharp from 'sharp';
import type { ImageMetadataExtractInput, ImageMetadataExtractOutput } from './image-metadata-extract.schema.js';

export async function imageMetadataExtract(input: ImageMetadataExtractInput): Promise<ImageMetadataExtractOutput> {
  const metadata = await sharp(input.input).metadata();

  return {
    width: metadata.width ?? undefined,
    height: metadata.height ?? undefined,
    format: metadata.format ?? undefined,
    space: metadata.space ?? undefined,
    density: metadata.density ?? undefined,
    hasAlpha: metadata.hasAlpha ?? undefined,
    channels: metadata.channels ?? undefined,
    size: metadata.size ?? undefined,
  };
}
