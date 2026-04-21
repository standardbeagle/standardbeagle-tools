import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { FontPairInputSchema } from './tools/font-pair.schema.js';
import { fontPair } from './tools/font-pair.js';
import { TypeScaleGenerateInputSchema } from './tools/type-scale-generate.schema.js';
import { typeScaleGenerate } from './tools/type-scale-generate.js';
import { ReadableWidthInputSchema } from './tools/readable-width.schema.js';
import { readableWidth } from './tools/readable-width.js';
import { LineHeightInputSchema } from './tools/line-height.schema.js';
import { lineHeight } from './tools/line-height.js';
import { LetterSpacingInputSchema } from './tools/letter-spacing.schema.js';
import { letterSpacing } from './tools/letter-spacing.js';

export function createServer(): Server {
  const server = new Server(
    { name: '@standardbeagle/typography', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'font_pair',
        description: 'Suggest font pairings based on primary font, mood, and category',
        inputSchema: {
          type: 'object',
          properties: {
            primary: { type: 'string', description: 'Primary font name' },
            mood: { type: 'string', enum: ['modern', 'classic', 'playful', 'serious', 'minimal'], description: 'Desired mood' },
            category: { type: 'string', enum: ['serif', 'sans-serif', 'display', 'monospace'], description: 'Font category' },
          },
          required: ['primary'],
        },
      },
      {
        name: 'type_scale_generate',
        description: 'Generate a modular type scale',
        inputSchema: {
          type: 'object',
          properties: {
            base: { type: 'number', description: 'Base font size in px' },
            ratio: { type: 'number', default: 1.25, description: 'Modular scale ratio' },
            steps: { type: 'array', items: { type: 'number' }, default: [-2, -1, 0, 1, 2, 3, 4], description: 'Scale steps' },
          },
          required: ['base'],
        },
      },
      {
        name: 'readable_width',
        description: 'Calculate optimal line length for readability',
        inputSchema: {
          type: 'object',
          properties: {
            fontSize: { type: 'number', description: 'Font size in px' },
            contentWidth: { type: 'number', description: 'Available content width in px' },
            measure: { type: 'string', enum: ['narrow', 'medium', 'wide'], description: 'Desired measure' },
          },
          required: ['fontSize'],
        },
      },
      {
        name: 'line_height',
        description: 'Calculate optimal line height for a font size and column width',
        inputSchema: {
          type: 'object',
          properties: {
            fontSize: { type: 'number', description: 'Font size in px' },
            width: { type: 'number', description: 'Column width in px' },
            xHeight: { type: 'number', description: 'X-height of the font' },
            language: { type: 'string', description: 'Language code' },
          },
          required: ['fontSize'],
        },
      },
      {
        name: 'letter_spacing',
        description: 'Calculate letter-spacing for a given font size and use case',
        inputSchema: {
          type: 'object',
          properties: {
            fontSize: { type: 'number', description: 'Font size in px' },
            useCase: { type: 'string', enum: ['body', 'heading', 'display', 'caption', 'button'], default: 'body', description: 'Typographic use case' },
          },
          required: ['fontSize'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'font_pair') {
      const parsed = FontPairInputSchema.parse(args);
      const result = fontPair(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'type_scale_generate') {
      const parsed = TypeScaleGenerateInputSchema.parse(args);
      const result = typeScaleGenerate(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'readable_width') {
      const parsed = ReadableWidthInputSchema.parse(args);
      const result = readableWidth(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'line_height') {
      const parsed = LineHeightInputSchema.parse(args);
      const result = lineHeight(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'letter_spacing') {
      const parsed = LetterSpacingInputSchema.parse(args);
      const result = letterSpacing(parsed);
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
