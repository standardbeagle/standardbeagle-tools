import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TokenCreateInputSchema } from './tools/token-create.schema.js';
import { tokenCreate } from './tools/token-create.js';
import { TokenTransformInputSchema } from './tools/token-transform.schema.js';
import { tokenTransform } from './tools/token-transform.js';
import { TokensValidateInputSchema } from './tools/tokens-validate.schema.js';
import { tokensValidate } from './tools/tokens-validate.js';
import { TokenExportInputSchema } from './tools/token-export.schema.js';
import { tokenExport } from './tools/token-export.js';
import { TokenImportInputSchema } from './tools/token-import.schema.js';
import { tokenImport } from './tools/token-import.js';

export function createServer(): Server {
  const server = new Server(
    { name: '@standardbeagle/design-token', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'token_create',
        description: 'Create a design token with name, value, type, optional description, and optional reference to another token. Returns the resolved token with computed value.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Token name' },
            value: { type: 'string', description: 'Token value' },
            type: { type: 'string', enum: ['color', 'size', 'spacing', 'font', 'border', 'radius', 'shadow'], description: 'Token type' },
            description: { type: 'string', description: 'Optional description' },
            reference: { type: 'string', description: 'Optional reference to another token name' },
            tokens: { type: 'array', description: 'Optional context tokens for reference resolution' },
          },
          required: ['name', 'value', 'type'],
        },
      },
      {
        name: 'token_transform',
        description: 'Transform tokens between formats (css-vars, scss, json, android-xml, ios-swift)',
        inputSchema: {
          type: 'object',
          properties: {
            tokens: { type: 'array', description: 'Array of tokens to transform' },
            format: { type: 'string', enum: ['css-vars', 'scss', 'json', 'android-xml', 'ios-swift'], description: 'Output format' },
          },
          required: ['tokens', 'format'],
        },
      },
      {
        name: 'tokens_validate',
        description: 'Validate a W3C DTCG (Design Tokens Community Group) token tree. Recursively walks groups, validates each leaf $value against its $type-specific schema (12+ types: color, dimension, fontFamily, fontWeight, duration, cubicBezier, number, strokeStyle, border, transition, shadow, gradient, typography). Strict mode treats unknown $type as error; default treats it as warning.',
        inputSchema: {
          type: 'object',
          properties: {
            tokens: { type: 'object', description: 'DTCG token tree (nested object of groups and leaf tokens with $value/$type)' },
            strict: { type: 'boolean', description: 'If true, unknown $type produces an error instead of a warning', default: false },
          },
          required: ['tokens'],
        },
      },
      {
        name: 'token_export',
        description: 'Export tokens to a specific platform format with optional prefix and category filtering',
        inputSchema: {
          type: 'object',
          properties: {
            tokens: { type: 'array', description: 'Array of tokens to export' },
            format: { type: 'string', enum: ['css-vars', 'scss', 'json', 'android-xml', 'ios-swift'], description: 'Output format' },
            prefix: { type: 'string', description: 'Optional prefix for token names' },
            includeCategories: { type: 'array', items: { type: 'string', enum: ['color', 'size', 'spacing', 'font', 'border', 'radius', 'shadow'] }, description: 'Categories to include' },
            excludeCategories: { type: 'array', items: { type: 'string', enum: ['color', 'size', 'spacing', 'font', 'border', 'radius', 'shadow'] }, description: 'Categories to exclude' },
          },
          required: ['tokens', 'format'],
        },
      },
      {
        name: 'token_import',
        description: 'Import tokens from json, css, or scss format into the internal token format',
        inputSchema: {
          type: 'object',
          properties: {
            source: { type: 'string', description: 'Source string to parse' },
            format: { type: 'string', enum: ['json', 'css', 'scss'], description: 'Input format' },
          },
          required: ['source', 'format'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'token_create') {
      const parsed = TokenCreateInputSchema.parse(args);
      const result = tokenCreate(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'token_transform') {
      const parsed = TokenTransformInputSchema.parse(args);
      const result = tokenTransform(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'tokens_validate') {
      const parsed = TokensValidateInputSchema.parse(args);
      const result = tokensValidate(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'token_export') {
      const parsed = TokenExportInputSchema.parse(args);
      const result = tokenExport(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'token_import') {
      const parsed = TokenImportInputSchema.parse(args);
      const result = tokenImport(parsed);
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
