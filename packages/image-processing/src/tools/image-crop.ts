import sharp from 'sharp';
import type { ImageCropInput, ImageCropOutput } from './image-crop.schema.js';

export async function imageCrop(input: ImageCropInput): Promise<ImageCropOutput> {
  await sharp(input.input)
    .extract({
      left: input.left,
      top: input.top,
      width: input.width,
      height: input.height,
    })
    .toFile(input.output);

  return {
    input: input.input,
    output: input.output,
    left: input.left,
    top: input.top,
    width: input.width,
    height: input.height,
  };
}
