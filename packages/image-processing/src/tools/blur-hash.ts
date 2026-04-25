import sharp from 'sharp';
import { encode } from 'blurhash';
import type { BlurHashInput, BlurHashOutput } from './blur-hash.schema.js';

export async function blurHash(input: BlurHashInput): Promise<BlurHashOutput> {
  const metadata = await sharp(input.input_path).metadata();
  const sourceWidth = metadata.width ?? 0;
  const sourceHeight = metadata.height ?? 0;
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error(`Cannot read source dimensions from ${input.input_path}`);
  }

  const { data, info } = await sharp(input.input_path)
    .raw()
    .ensureAlpha()
    .resize(32)
    .toBuffer({ resolveWithObject: true });

  const blurhash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    input.components_x,
    input.components_y,
  );

  let lqip_base64: string | undefined;
  if (input.include_lqip) {
    const jpegBuf = await sharp(input.input_path)
      .resize(32)
      .jpeg({ quality: 40 })
      .toBuffer();
    lqip_base64 = `data:image/jpeg;base64,${jpegBuf.toString('base64')}`;
  }

  return {
    blurhash,
    lqip_base64,
    original_dimensions: { w: sourceWidth, h: sourceHeight },
  };
}
