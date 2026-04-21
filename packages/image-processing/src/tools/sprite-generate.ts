import sharp from 'sharp';
import { basename, extname } from 'path';
import type { SpriteGenerateInput, SpriteGenerateOutput } from './sprite-generate.schema.js';

export async function spriteGenerate(input: SpriteGenerateInput): Promise<SpriteGenerateOutput> {
  const images = input.images;
  if (images.length === 0) {
    throw new Error('No images provided');
  }

  const metas: Array<{ path: string; width: number; height: number }> = [];
  for (const img of images) {
    const meta = await sharp(img).metadata();
    metas.push({ path: img, width: meta.width ?? 0, height: meta.height ?? 0 });
  }

  // Layout horizontally in a single row
  const totalWidth = metas.reduce((sum, m) => sum + m.width, 0);
  const maxHeight = Math.max(...metas.map((m) => m.height));

  const canvas = sharp({
    create: {
      width: totalWidth,
      height: maxHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const composites: Array<{ input: string; left: number; top: number }> = [];
  const icons: Array<{ name: string; width: number; height: number; x: number; y: number }> = [];

  let currentX = 0;
  const prefix = input.cssClassPrefix ?? 'icon';

  for (const meta of metas) {
    const name = basename(meta.path, extname(meta.path));
    composites.push({ input: meta.path, left: currentX, top: 0 });
    icons.push({ name, width: meta.width, height: meta.height, x: currentX, y: 0 });
    currentX += meta.width;
  }

  await canvas.composite(composites).png().toFile(input.output);

  const cssRules = icons
    .map((icon) => {
      return `.${prefix}-${icon.name} {\n  background-image: url('${input.output}');\n  background-position: -${icon.x}px -${icon.y}px;\n  width: ${icon.width}px;\n  height: ${icon.height}px;\n}`;
    })
    .join('\n');

  return {
    sprite: input.output,
    css: cssRules,
    width: totalWidth,
    height: maxHeight,
    icons,
  };
}
