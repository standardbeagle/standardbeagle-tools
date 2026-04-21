import { JSDOM } from 'jsdom';
import type { AuditHtmlInput, AuditHtmlOutput } from './audit-html.schema.js';

export async function auditHtml(input: AuditHtmlInput): Promise<AuditHtmlOutput> {
  const dom = new JSDOM(input.html, { url: 'https://example.com/' });

  const { default: axe } = await import('axe-core');

  const axeOptions: Record<string, unknown> = {};
  if (input.tags && input.tags.length > 0) {
    axeOptions.runOnly = {
      type: 'tag',
      values: input.tags,
    };
  }
  if (input.rules && input.rules.length > 0) {
    axeOptions.rules = Object.fromEntries(input.rules.map((r) => [r, { enabled: true }]));
  }

  const results = await axe.run(dom.window.document.documentElement, axeOptions);

  return {
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: (v.impact as 'minor' | 'moderate' | 'serious' | 'critical') || 'moderate',
      help: v.help || '',
      wcag_refs: (v.tags || []).filter((t: string) => t.startsWith('wcag')),
      nodes: v.nodes.map((n) => ({
        html: n.html || '',
        target: n.target as string[],
        failure_summary: n.failureSummary || '',
      })),
    })),
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    inapplicable: results.inapplicable.length,
  };
}
