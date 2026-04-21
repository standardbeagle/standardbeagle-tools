import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ContrastCheckInputSchema } from './tools/contrast-check.schema.js';
import { contrastCheck } from './tools/contrast-check.js';

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
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'contrast_check') {
      const parsed = ContrastCheckInputSchema.parse(args);
      const result = contrastCheck(parsed);
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}

export async function startServer(): Promise<void> {
  const server = createServer();
  await server.connect(new StdioServerTransport());
}
