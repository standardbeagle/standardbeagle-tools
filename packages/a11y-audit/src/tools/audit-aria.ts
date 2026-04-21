import { AuditAriaInputSchema } from './audit-aria.schema.js';
import { runAudit } from './run-audit.js';

export async function auditAria(input: unknown) {
  const parsed = AuditAriaInputSchema.parse(input);
  return runAudit({
    html: parsed.html,
    tags: parsed.tags,
    rules: parsed.rules,
    defaultTags: ['cat.aria', 'cat.name-role-value'],
  });
}
