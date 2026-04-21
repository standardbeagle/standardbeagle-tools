import { AuditFormInputSchema } from './audit-form.schema.js';
import { runAudit } from './run-audit.js';

export async function auditForm(input: unknown) {
  const parsed = AuditFormInputSchema.parse(input);
  return runAudit({
    html: parsed.html,
    tags: parsed.tags,
    rules: parsed.rules,
    defaultTags: ['cat.forms'],
  });
}
