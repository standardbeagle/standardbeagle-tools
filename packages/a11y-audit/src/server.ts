import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { AuditHtmlInputSchema } from './tools/audit-html.schema.js';
import { auditHtml } from './tools/audit-html.js';
import { AuditCssInputSchema } from './tools/audit-css.schema.js';
import { auditCss } from './tools/audit-css.js';
import { AuditAriaInputSchema } from './tools/audit-aria.schema.js';
import { auditAria } from './tools/audit-aria.js';
import { AuditTableInputSchema } from './tools/audit-table.schema.js';
import { auditTable } from './tools/audit-table.js';
import { AuditFormInputSchema } from './tools/audit-form.schema.js';
import { auditForm } from './tools/audit-form.js';
import { AuditHeadingInputSchema } from './tools/audit-heading.schema.js';
import { auditHeading } from './tools/audit-heading.js';
import { WcagScoreInputSchema } from './tools/wcag-score.schema.js';
import { wcagScore } from './tools/wcag-score.js';

export function createServer(): Server {
  const server = new Server(
    { name: '@standardbeagle/a11y-audit', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'audit_html',
        description: 'Run an axe-core accessibility audit on an HTML string',
        inputSchema: {
          type: 'object',
          properties: {
            html: { type: 'string', description: 'HTML string to audit' },
            rules: { type: 'array', items: { type: 'string' }, description: 'Specific axe rule IDs to enable' },
            tags: {
              type: 'array',
              items: { type: 'string', enum: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'best-practice'] },
              default: ['wcag21aa'],
              description: 'WCAG tag filters for the audit',
            },
          },
          required: ['html'],
        },
      },
      {
        name: 'audit_css',
        description: 'Audit CSS and visual accessibility: color contrast, sensory cues',
        inputSchema: {
          type: 'object',
          properties: {
            html: { type: 'string', description: 'HTML string to audit' },
            rules: { type: 'array', items: { type: 'string' }, description: 'Specific axe rule IDs to enable' },
            tags: {
              type: 'array',
              items: { type: 'string', enum: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'best-practice'] },
              description: 'Override tag filters',
            },
          },
          required: ['html'],
        },
      },
      {
        name: 'audit_aria',
        description: 'Audit ARIA accessibility: roles, attributes, name-role-value',
        inputSchema: {
          type: 'object',
          properties: {
            html: { type: 'string', description: 'HTML string to audit' },
            rules: { type: 'array', items: { type: 'string' }, description: 'Specific axe rule IDs to enable' },
            tags: {
              type: 'array',
              items: { type: 'string', enum: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'best-practice'] },
              description: 'Override tag filters',
            },
          },
          required: ['html'],
        },
      },
      {
        name: 'audit_table',
        description: 'Audit table accessibility: headers, scope, data cells',
        inputSchema: {
          type: 'object',
          properties: {
            html: { type: 'string', description: 'HTML string to audit' },
            rules: { type: 'array', items: { type: 'string' }, description: 'Specific axe rule IDs to enable' },
            tags: {
              type: 'array',
              items: { type: 'string', enum: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'best-practice'] },
              description: 'Override tag filters',
            },
          },
          required: ['html'],
        },
      },
      {
        name: 'audit_form',
        description: 'Audit form accessibility: labels, autocomplete, field names',
        inputSchema: {
          type: 'object',
          properties: {
            html: { type: 'string', description: 'HTML string to audit' },
            rules: { type: 'array', items: { type: 'string' }, description: 'Specific axe rule IDs to enable' },
            tags: {
              type: 'array',
              items: { type: 'string', enum: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'best-practice'] },
              description: 'Override tag filters',
            },
          },
          required: ['html'],
        },
      },
      {
        name: 'audit_heading',
        description: 'Audit heading and landmark structure: order, empty headings, regions',
        inputSchema: {
          type: 'object',
          properties: {
            html: { type: 'string', description: 'HTML string to audit' },
            rules: { type: 'array', items: { type: 'string' }, description: 'Specific axe rule IDs to enable' },
            tags: {
              type: 'array',
              items: { type: 'string', enum: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'best-practice'] },
              description: 'Override tag filters',
            },
          },
          required: ['html'],
        },
      },
      {
        name: 'wcag_score',
        description: 'Score HTML against WCAG 2.2 success criteria across A/AA/AAA conformance levels and emit a markdown compliance report',
        inputSchema: {
          type: 'object',
          properties: {
            html: { type: 'string', description: 'HTML string to score' },
            target_level: {
              type: 'string',
              enum: ['A', 'AA', 'AAA'],
              default: 'AA',
              description: 'Target WCAG conformance level for the report',
            },
          },
          required: ['html'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'audit_html') {
      const parsed = AuditHtmlInputSchema.parse(args);
      const result = await auditHtml(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'audit_css') {
      const parsed = AuditCssInputSchema.parse(args);
      const result = await auditCss(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'audit_aria') {
      const parsed = AuditAriaInputSchema.parse(args);
      const result = await auditAria(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'audit_table') {
      const parsed = AuditTableInputSchema.parse(args);
      const result = await auditTable(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'audit_form') {
      const parsed = AuditFormInputSchema.parse(args);
      const result = await auditForm(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'audit_heading') {
      const parsed = AuditHeadingInputSchema.parse(args);
      const result = await auditHeading(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'wcag_score') {
      const parsed = WcagScoreInputSchema.parse(args);
      const result = await wcagScore(parsed);
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
