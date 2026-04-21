import { JSDOM } from 'jsdom';
import type { AuditHtmlOutput } from './audit-html.schema.js';

export interface RunAuditOptions {
  html: string;
  tags?: string[];
  rules?: string[];
  defaultTags: string[];
}

export async function runAudit(options: RunAuditOptions): Promise<AuditHtmlOutput> {
  const dom = new JSDOM(options.html, { url: 'https://example.com/' });
  const { default: axe } = await import('axe-core');

  const axeOptions: Record<string, unknown> = {};
  const tags = options.tags && options.tags.length > 0 ? options.tags : options.defaultTags;
  axeOptions.runOnly = {
    type: 'tag',
    values: tags,
  };
  if (options.rules && options.rules.length > 0) {
    axeOptions.rules = Object.fromEntries(options.rules.map((r) => [r, { enabled: true }]));
  }

  const results = await axe.run(dom.window.document.documentElement, axeOptions);
  // Do not call dom.window.close() — axe-core caches the window reference at
  // module load time and closing it breaks subsequent test files.

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
