import sharp from 'sharp';
import { stat } from 'fs/promises';
import { basename, extname, join } from 'path';
import type {
  ResponsiveGenerateInput,
  ResponsiveGenerateOutput,
  ResponsiveGenerateVariant,
} from './responsive-generate.schema.js';

type SupportedFormat = 'webp' | 'avif' | 'jpg';

function toSharpFormat(format: SupportedFormat): 'webp' | 'avif' | 'jpeg' {
  return format === 'jpg' ? 'jpeg' : format;
}

export async function responsiveGenerate(
  input: ResponsiveGenerateInput,
): Promise<ResponsiveGenerateOutput> {
  const metadata = await sharp(input.input_path).metadata();
  const sourceWidth = metadata.width ?? 0;
  if (sourceWidth <= 0) {
    throw new Error(`Cannot read source width from ${input.input_path}`);
  }

  const ext = extname(input.input_path);
  const stem = basename(input.input_path, ext);
  const sharpFormat = toSharpFormat(input.format);

  // Skip breakpoints wider than source (no upscaling), preserve user-supplied order
  const eligible = input.breakpoints.filter((w) => w <= sourceWidth);

  const variants: ResponsiveGenerateVariant[] = [];
  for (const width of eligible) {
    const outPath = join(input.output_dir, `${stem}-${width}.${input.format}`);
    await sharp(input.input_path)
      .resize({ width })
      .toFormat(sharpFormat, { quality: input.quality })
      .toFile(outPath);
    const { size } = await stat(outPath);
    variants.push({ width, path: outPath, bytes: size });
  }

  const srcset = variants.map((v) => `${v.path} ${v.width}w`).join(', ');
  const sizes_suggestion =
    variants.length >= 2 ? '(max-width: 640px) 100vw, 50vw' : '100vw';

  return { variants, srcset, sizes_suggestion };
}
