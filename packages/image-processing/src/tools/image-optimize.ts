import sharp from 'sharp';
import { readFile, stat } from 'fs/promises';
import { extname } from 'path';
import type { ImageOptimizeInput, ImageOptimizeOutput } from './image-optimize.schema.js';

// Map user-facing format aliases to sharp's canonical format names.
// User spec: 'png' | 'jpg' | 'webp' | 'avif'.  Sharp uses 'jpeg' instead of 'jpg'.
type SharpFormat = 'png' | 'jpeg' | 'webp' | 'avif';

const EXT_TO_FORMAT: Record<string, SharpFormat> = {
  '.png': 'png',
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.webp': 'webp',
  '.avif': 'avif',
};

function resolveFormat(
  explicit: ImageOptimizeInput['format'] | undefined,
  outputPath: string,
): SharpFormat {
  if (explicit) {
    return explicit === 'jpg' ? 'jpeg' : explicit;
  }
  const ext = extname(outputPath).toLowerCase();
  const fromExt = EXT_TO_FORMAT[ext];
  if (!fromExt) {
    throw new Error(
      `Cannot infer format from output_path "${outputPath}"; pass format explicitly (png, jpg, webp, or avif).`,
    );
  }
  return fromExt;
}

export async function imageOptimize(input: ImageOptimizeInput): Promise<ImageOptimizeOutput> {
  const inputBuffer = await readFile(input.input_path);
  const inputBytes = inputBuffer.length;

  const format = resolveFormat(input.format, input.output_path);

  let pipeline = sharp(inputBuffer).toFormat(format, { quality: input.quality });

  // strip_metadata=false: preserve EXIF/orientation by passing through metadata.
  // strip_metadata=true (default): no withMetadata() call → sharp drops it.
  if (!input.strip_metadata) {
    pipeline = pipeline.withMetadata();
  }

  const info = await pipeline.toFile(input.output_path);

  // Re-stat the output: sharp's `info.size` is reliable, but stat() handles
  // any platform quirk where size is reported as 0.
  const outputStat = await stat(input.output_path);
  const outputBytes = outputStat.size;

  const reductionPercent = inputBytes > 0
    ? Number((((inputBytes - outputBytes) / inputBytes) * 100).toFixed(2))
    : 0;

  return {
    input_bytes: inputBytes,
    output_bytes: outputBytes,
    reduction_percent: reductionPercent,
    format_used: info.format,
    dimensions: {
      width: info.width,
      height: info.height,
    },
  };
}
