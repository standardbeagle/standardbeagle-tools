import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ContrastCheckInputSchema } from './tools/contrast-check.schema.js';
import { contrastCheck } from './tools/contrast-check.js';
import { HarmonyGenerateInputSchema } from './tools/harmony-generate.schema.js';
import { generateHarmony } from './tools/harmony-generate.js';
import { ColorBlindnessInputSchema } from './tools/color-blindness.schema.js';
import { colorBlindness } from './tools/color-blindness.js';

export function createServer(): Server {
  const server = new Server(
    { name: '@standardbeagle/color', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'contrast_check',
        description: 'Calculate WCAG contrast ratio between two colors and check compliance',
        inputSchema: {
          type: 'object',
          properties: {
            foreground: { type: 'string', description: 'Foreground color (hex or rgb)' },
            background: { type: 'string', description: 'Background color (hex or rgb)' },
            target: { type: 'string', enum: ['AA', 'AAA'], default: 'AA' },
            text_size: { type: 'string', enum: ['normal', 'large'], default: 'normal' },
          },
          required: ['foreground', 'background'],
        },
      },
      {
        name: 'harmony_generate',
        description: 'Generate color harmony palettes from a base color',
        inputSchema: {
          type: 'object',
          properties: {
            base: { type: 'string', description: 'Base color hex' },
            scheme: { type: 'string', enum: ['complementary', 'triadic', 'analogous', 'split-complementary', 'tetradic', 'monochromatic'] },
            count: { type: 'integer', description: 'Number of colors for monochromatic/analogous' },
          },
          required: ['base', 'scheme'],
        },
      },
      {
        name: 'color_blindness_simulate',
        description: 'Simulate color vision deficiency on hex colors',
        inputSchema: {
          type: 'object',
          properties: {
            colors: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
            type: { type: 'string', enum: ['deuteranopia', 'protanopia', 'tritanopia', 'all'], default: 'all' },
            severity: { type: 'number', minimum: 0, maximum: 1, default: 1 },
          },
          required: ['colors'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'contrast_check') {
      const parsed = ContrastCheckInputSchema.parse(args);
      const result = contrastCheck(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'harmony_generate') {
      const parsed = HarmonyGenerateInputSchema.parse(args);
      const result = generateHarmony(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'color_blindness_simulate') {
      const parsed = ColorBlindnessInputSchema.parse(args);
      const result = colorBlindness(parsed);
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
