import { auditHtml } from './audit-html.js';
import { WCAG_CRITERIA, type WcagLevel } from '../lib/wcag-criteria.js';
import type {
  WcagScoreInput,
  WcagScoreOutput,
  CriterionResult,
  LevelSummary,
} from './wcag-score.schema.js';

const ALL_WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa'] as const;

export async function wcagScore(input: WcagScoreInput): Promise<WcagScoreOutput> {
  const auditResult = await auditHtml({
    html: input.html,
    tags: [...ALL_WCAG_TAGS],
  });

  const violatedRuleIds = new Set(auditResult.violations.map((v) => v.id));

  const criteria: CriterionResult[] = WCAG_CRITERIA.map((sc) => {
    let status: CriterionResult['status'];
    if (sc.applicable_axe_rules.length === 0) {
      status = 'untestable';
    } else if (sc.applicable_axe_rules.some((rule) => violatedRuleIds.has(rule))) {
      status = 'fail';
    } else {
      // axe ran rules covering this SC and none failed → pass
      status = 'pass';
    }
    return {
      id: sc.id,
      title: sc.title,
      level: sc.level,
      status,
    };
  });

  const level_a = summarize(criteria, 'A');
  const level_aa = summarize(criteria, 'AA');
  const level_aaa = summarize(criteria, 'AAA');

  const compliance_report_markdown = renderMarkdown(criteria, input.target_level, {
    A: level_a,
    AA: level_aa,
    AAA: level_aaa,
  });

  return {
    level_a,
    level_aa,
    level_aaa,
    criteria,
    compliance_report_markdown,
  };
}

function summarize(criteria: CriterionResult[], level: WcagLevel): LevelSummary {
  const atLevel = criteria.filter((c) => c.level === level);
  const passed = atLevel.filter((c) => c.status === 'pass').length;
  const failed = atLevel.filter((c) => c.status === 'fail').length;
  const denom = passed + failed;
  const score = denom === 0 ? 1 : passed / denom;
  return { passed, failed, score };
}

function renderMarkdown(
  criteria: CriterionResult[],
  targetLevel: WcagLevel,
  summaries: Record<WcagLevel, LevelSummary>,
): string {
  const lines: string[] = [];
  lines.push(`# WCAG 2.2 Compliance Report`);
  lines.push('');
  lines.push(`**Target conformance level:** ${targetLevel}`);
  lines.push('');
  lines.push(`## Summary`);
  lines.push('');
  lines.push(`| Level | Passed | Failed | Score |`);
  lines.push(`| ----- | -----: | -----: | ----: |`);
  for (const lvl of ['A', 'AA', 'AAA'] as const) {
    const s = summaries[lvl];
    lines.push(`| ${lvl} | ${s.passed} | ${s.failed} | ${formatScore(s.score)} |`);
  }
  lines.push('');

  for (const lvl of ['A', 'AA', 'AAA'] as const) {
    lines.push(`## Level ${lvl}`);
    lines.push('');
    const atLevel = criteria.filter((c) => c.level === lvl);
    lines.push(`| SC | Title | Status |`);
    lines.push(`| -- | ----- | ------ |`);
    for (const c of atLevel) {
      lines.push(`| ${c.id} | ${c.title} | ${c.status} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function formatScore(score: number): string {
  return (Math.round(score * 1000) / 1000).toString();
}
