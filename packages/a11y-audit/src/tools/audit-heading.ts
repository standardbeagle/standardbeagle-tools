import { AuditHeadingInputSchema } from './audit-heading.schema.js';
import { runAudit } from './run-audit.js';

export async function auditHeading(input: unknown) {
  const parsed = AuditHeadingInputSchema.parse(input);
  return runAudit({
    html: parsed.html,
    tags: parsed.tags,
    rules: parsed.rules,
    defaultTags: ['cat.structure'],
  });
}
