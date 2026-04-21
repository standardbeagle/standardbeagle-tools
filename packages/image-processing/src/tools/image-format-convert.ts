import sharp from 'sharp';
import type { ImageFormatConvertInput, ImageFormatConvertOutput } from './image-format-convert.schema.js';

export async function imageFormatConvert(input: ImageFormatConvertInput): Promise<ImageFormatConvertOutput> {
  const options: sharp.JpegOptions | sharp.PngOptions | sharp.WebpOptions | sharp.AvifOptions | sharp.GifOptions = {};
  if (input.quality !== undefined) {
    (options as { quality?: number }).quality = input.quality;
  }

  await sharp(input.input)
    .toFormat(input.format, options)
    .toFile(input.output);

  return {
    input: input.input,
    output: input.output,
    format: input.format,
  };
}
