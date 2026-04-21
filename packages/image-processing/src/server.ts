import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { ImageResizeInputSchema } from './tools/image-resize.schema.js';
import { imageResize } from './tools/image-resize.js';
import { ImageCropInputSchema } from './tools/image-crop.schema.js';
import { imageCrop } from './tools/image-crop.js';
import { ImageFormatConvertInputSchema } from './tools/image-format-convert.schema.js';
import { imageFormatConvert } from './tools/image-format-convert.js';
import { ImageOptimizeInputSchema } from './tools/image-optimize.schema.js';
import { imageOptimize } from './tools/image-optimize.js';
import { ImageMetadataExtractInputSchema } from './tools/image-metadata-extract.schema.js';
import { imageMetadataExtract } from './tools/image-metadata-extract.js';
import { ImageWatermarkInputSchema } from './tools/image-watermark.schema.js';
import { imageWatermark } from './tools/image-watermark.js';
import { SpriteGenerateInputSchema } from './tools/sprite-generate.schema.js';
import { spriteGenerate } from './tools/sprite-generate.js';
import { ImageLazyAnalysisInputSchema } from './tools/image-lazy-analysis.schema.js';
import { imageLazyAnalysis } from './tools/image-lazy-analysis.js';

export function createServer(): Server {
  const server = new Server(
    { name: '@standardbeagle/image-processing', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'image_resize',
        description: 'Resize an image to specified dimensions',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Absolute path to input image' },
            output: { type: 'string', description: 'Absolute path to output image' },
            width: { type: 'integer', description: 'Target width in pixels' },
            height: { type: 'integer', description: 'Target height in pixels' },
            fit: { type: 'string', enum: ['cover', 'contain', 'fill', 'inside', 'outside'], description: 'Resize fit mode' },
            withoutEnlargement: { type: 'boolean', description: 'Prevent enlargement if input is smaller than target' },
          },
          required: ['input', 'output'],
        },
      },
      {
        name: 'image_crop',
        description: 'Crop a region from an image',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Absolute path to input image' },
            output: { type: 'string', description: 'Absolute path to output image' },
            left: { type: 'integer', description: 'Left offset in pixels' },
            top: { type: 'integer', description: 'Top offset in pixels' },
            width: { type: 'integer', description: 'Crop width in pixels' },
            height: { type: 'integer', description: 'Crop height in pixels' },
          },
          required: ['input', 'output', 'left', 'top', 'width', 'height'],
        },
      },
      {
        name: 'image_format_convert',
        description: 'Convert an image to a different format',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Absolute path to input image' },
            output: { type: 'string', description: 'Absolute path to output image' },
            format: { type: 'string', enum: ['jpeg', 'png', 'webp', 'avif', 'gif'], description: 'Target format' },
            quality: { type: 'integer', minimum: 1, maximum: 100, description: 'Output quality' },
          },
          required: ['input', 'output', 'format'],
        },
      },
      {
        name: 'image_optimize',
        description: 'Optimize an image for web use',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Absolute path to input image' },
            output: { type: 'string', description: 'Absolute path to output image' },
            quality: { type: 'integer', minimum: 1, maximum: 100, description: 'Output quality' },
            format: { type: 'string', enum: ['jpeg', 'png', 'webp', 'avif'], description: 'Target format' },
            progressive: { type: 'boolean', description: 'Use progressive encoding for JPEG' },
          },
          required: ['input', 'output'],
        },
      },
      {
        name: 'image_metadata_extract',
        description: 'Extract metadata from an image file',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Absolute path to input image' },
          },
          required: ['input'],
        },
      },
      {
        name: 'image_watermark',
        description: 'Add a text watermark to an image',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Absolute path to input image' },
            output: { type: 'string', description: 'Absolute path to output image' },
            text: { type: 'string', description: 'Watermark text' },
            position: { type: 'string', enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'], description: 'Watermark position' },
            fontSize: { type: 'integer', description: 'Font size in pixels' },
            color: { type: 'string', description: 'Text color' },
            opacity: { type: 'number', minimum: 0, maximum: 1, description: 'Text opacity' },
          },
          required: ['input', 'output', 'text'],
        },
      },
      {
        name: 'sprite_generate',
        description: 'Generate a CSS sprite sheet from multiple images',
        inputSchema: {
          type: 'object',
          properties: {
            images: { type: 'array', items: { type: 'string' }, description: 'Absolute paths to input images' },
            output: { type: 'string', description: 'Absolute path to output sprite image' },
            cssClassPrefix: { type: 'string', description: 'Prefix for CSS class names' },
          },
          required: ['images', 'output'],
        },
      },
      {
        name: 'image_lazy_analysis',
        description: 'Analyze images for lazy-loading suitability',
        inputSchema: {
          type: 'object',
          properties: {
            images: { type: 'array', items: { type: 'string' }, description: 'Absolute paths to images' },
          },
          required: ['images'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'image_resize') {
      const parsed = ImageResizeInputSchema.parse(args);
      const result = await imageResize(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'image_crop') {
      const parsed = ImageCropInputSchema.parse(args);
      const result = await imageCrop(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'image_format_convert') {
      const parsed = ImageFormatConvertInputSchema.parse(args);
      const result = await imageFormatConvert(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'image_optimize') {
      const parsed = ImageOptimizeInputSchema.parse(args);
      const result = await imageOptimize(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'image_metadata_extract') {
      const parsed = ImageMetadataExtractInputSchema.parse(args);
      const result = await imageMetadataExtract(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'image_watermark') {
      const parsed = ImageWatermarkInputSchema.parse(args);
      const result = await imageWatermark(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'sprite_generate') {
      const parsed = SpriteGenerateInputSchema.parse(args);
      const result = await spriteGenerate(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'image_lazy_analysis') {
      const parsed = ImageLazyAnalysisInputSchema.parse(args);
      const result = await imageLazyAnalysis(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}

export async function startServer(): Promise<void> {
  const server = createServer();
  await server.connect(new StdioServerTransport());
}
