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
import { HeadingStructureInputSchema } from './tools/heading-structure.schema.js';
import { headingStructure } from './tools/heading-structure.js';
import { WcagScoreInputSchema } from './tools/wcag-score.schema.js';
import { wcagScore } from './tools/wcag-score.js';
import { AriaValidateInputSchema } from './tools/aria-validate.schema.js';
import { ariaValidate } from './tools/aria-validate.js';
import { LinkTextCheckInputSchema } from './tools/link-text-check.schema.js';
import { linkTextCheck } from './tools/link-text-check.js';

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
        name: 'heading_structure',
        description: 'Pure-parse heading outline + issue detector (skipped levels, missing/multiple h1, empty headings)',
        inputSchema: {
          type: 'object',
          properties: {
            html: { type: 'string', description: 'HTML string to analyze' },
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
      {
        name: 'aria_validate',
        description: 'Pure-parse WAI-ARIA 1.2 validator: invalid roles, missing required props, prohibited props, redundant roles, invalid prop values',
        inputSchema: {
          type: 'object',
          properties: {
            html: { type: 'string', description: 'HTML string to validate' },
          },
          required: ['html'],
        },
      },
      {
        name: 'link_text_check',
        description: 'Pure-parse link-text auditor: vague phrases, URL-as-text, empty links, duplicate text with different hrefs; emits suggested_text fallback chain (aria-label → title → preceding heading)',
        inputSchema: {
          type: 'object',
          properties: {
            html: { type: 'string', description: 'HTML string to analyze' },
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

    if (name === 'heading_structure') {
      const parsed = HeadingStructureInputSchema.parse(args);
      const result = await headingStructure(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'wcag_score') {
      const parsed = WcagScoreInputSchema.parse(args);
      const result = await wcagScore(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'aria_validate') {
      const parsed = AriaValidateInputSchema.parse(args);
      const result = await ariaValidate(parsed);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }

    if (name === 'link_text_check') {
      const parsed = LinkTextCheckInputSchema.parse(args);
      const result = await linkTextCheck(parsed);
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
