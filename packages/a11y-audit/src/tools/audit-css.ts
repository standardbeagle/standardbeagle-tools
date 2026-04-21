import { AuditCssInputSchema } from './audit-css.schema.js';
import { runAudit } from './run-audit.js';

export async function auditCss(input: unknown) {
  const parsed = AuditCssInputSchema.parse(input);
  return runAudit({
    html: parsed.html,
    tags: parsed.tags,
    rules: parsed.rules,
    defaultTags: ['cat.color', 'cat.sensory-and-visual-cues'],
  });
}
