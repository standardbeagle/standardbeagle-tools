import { AuditTableInputSchema } from './audit-table.schema.js';
import { runAudit } from './run-audit.js';

export async function auditTable(input: unknown) {
  const parsed = AuditTableInputSchema.parse(input);
  return runAudit({
    html: parsed.html,
    tags: parsed.tags,
    rules: parsed.rules,
    defaultTags: ['cat.tables'],
  });
}
