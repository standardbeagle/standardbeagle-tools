import sharp from 'sharp';
import type { ImageWatermarkInput, ImageWatermarkOutput } from './image-watermark.schema.js';

const positionMap: Record<string, string> = {
  'top-left': 'northwest',
  'top-right': 'northeast',
  'bottom-left': 'southwest',
  'bottom-right': 'southeast',
  center: 'center',
};

export async function imageWatermark(input: ImageWatermarkInput): Promise<ImageWatermarkOutput> {
  const fontSize = input.fontSize ?? 48;
  const color = input.color ?? 'white';
  const opacity = input.opacity ?? 0.5;
  const position = input.position ?? 'bottom-right';
  const gravity = positionMap[position] ?? 'southeast';

  const meta = await sharp(input.input).metadata();
  const imgWidth = meta.width ?? 1000;
  const imgHeight = meta.height ?? 200;

  // Create an SVG text overlay sized to the image so composite succeeds
  const svg = `
    <svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="sans-serif" font-size="${fontSize}" fill="${color}" opacity="${opacity}">
        ${escapeXml(input.text)}
      </text>
    </svg>
  `;

  const svgBuffer = Buffer.from(svg);

  await sharp(input.input)
    .composite([{ input: svgBuffer, gravity: gravity as sharp.Gravity }])
    .toFile(input.output);

  return {
    input: input.input,
    output: input.output,
    text: input.text,
    position,
  };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
