import * as cheerio from 'cheerio';
import {
  AriaValidateInputSchema,
  type AriaValidateIssue,
  type AriaValidateOutput,
} from './aria-validate.schema.js';
import { ARIA_ROLE_INDEX, ARIA_VALUE_ENUMS } from '../lib/aria-roles.js';

/**
 * Compute the implicit ARIA role for an HTML element, including the few
 * conditional rules from HTML-AAM. Returns `undefined` when the element has
 * no defined implicit role. Conservative — when the rule is conditional and
 * the condition cannot be checked statically (e.g. region requires an
 * accessible name) we return `undefined` rather than guess.
 */
function implicitRole(
  tag: string,
  attribs: Record<string, string>,
): string | undefined {
  switch (tag) {
    case 'a':
    case 'area':
      return attribs['href'] !== undefined ? 'link' : undefined;
    case 'input': {
      const type = (attribs['type'] ?? 'text').toLowerCase();
      if (type === 'button' || type === 'submit' || type === 'reset' || type === 'image') return 'button';
      if (type === 'checkbox') return 'checkbox';
      if (type === 'radio') return 'radio';
      if (type === 'range') return 'slider';
      if (type === 'number') return 'spinbutton';
      if (type === 'search' && attribs['list'] === undefined) return 'searchbox';
      if (
        type === 'text' || type === 'email' || type === 'tel' || type === 'url' || type === 'password'
      ) {
        return attribs['list'] === undefined ? 'textbox' : 'combobox';
      }
      return undefined;
    }
    case 'select':
      return attribs['multiple'] !== undefined || Number(attribs['size'] ?? '1') > 1
        ? 'listbox'
        : 'combobox';
    case 'img':
      // <img> with empty alt is `presentation` per HTML-AAM; with non-empty
      // alt or no alt at all it is `img`. The presentation case is deliberately
      // not flagged as redundant because `role="img"` would change semantics.
      return attribs['alt'] === '' ? 'presentation' : 'img';
    case 'th':
      // Ambiguous: row vs column header depends on scope/position. Skip.
      return undefined;
    case 'td':
      // <td> in a <table> is `cell`, but only when ancestor is a data table.
      // Not statically determinable in isolation; skip to avoid false positives.
      return undefined;
    case 'header':
    case 'footer':
      // Conditional on scope. Skip.
      return undefined;
    case 'section':
    case 'form':
      // Need an accessible name to be a landmark. Skip.
      return undefined;
    default:
      return undefined;
  }
}

/**
 * Build a stable CSS-like selector for an element. Prefers `#id`; falls back
 * to tag plus the role attribute when present, then aria-label, then a
 * `tag:nth-of-type(n)` form. Mirrors the locator style used in audit-aria.
 */
function buildSelector(
  $: cheerio.CheerioAPI,
  el: unknown,
  tag: string,
  attribs: Record<string, string>,
): string {
  const id = attribs['id'];
  if (id) return `#${id}`;
  const role = attribs['role'];
  if (role) return `${tag}[role="${role}"]`;
  const label = attribs['aria-label'];
  if (label) return `${tag}[aria-label="${label}"]`;
  // Position among siblings of the same tag for stability.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = $(el as any);
  const parent = node.parent();
  if (parent.length === 0) return tag;
  const siblings = parent.children(tag).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const index = siblings.indexOf(el as any) + 1;
  return `${tag}:nth-of-type(${index})`;
}

export async function ariaValidate(input: unknown): Promise<AriaValidateOutput> {
  const { html } = AriaValidateInputSchema.parse(input);
  const $ = cheerio.load(html);
  const issues: AriaValidateIssue[] = [];

  $('*').each((_, el) => {
    const tag = (el as { tagName?: string }).tagName?.toLowerCase() ?? '';
    const attribs = (el as unknown as { attribs?: Record<string, string> }).attribs ?? {};

    // Collect aria-* attributes once.
    const ariaAttrs: Array<[string, string]> = Object.entries(attribs).filter(
      ([k]) => k.startsWith('aria-'),
    );
    const declaredRole = attribs['role']?.trim().toLowerCase();
    const hasRole = declaredRole !== undefined && declaredRole.length > 0;

    // Skip elements with no role and no aria-* attributes.
    if (!hasRole && ariaAttrs.length === 0) return;

    const selector = buildSelector($, el, tag, attribs);

    // 1. invalid-role
    const spec = hasRole ? ARIA_ROLE_INDEX.get(declaredRole as string) : undefined;
    if (hasRole && !spec) {
      issues.push({
        selector,
        role: declaredRole,
        violation: 'invalid-role',
        detail: `Role "${declaredRole}" is not a valid WAI-ARIA 1.2 role.`,
      });
      // Stop further role-driven checks; we still validate prop values below.
    }

    // 2. redundant-role
    if (hasRole && spec) {
      const implicit = implicitRole(tag, attribs);
      const isImplicit =
        spec.implicit_role_tags.includes(tag) || implicit === declaredRole;
      if (isImplicit) {
        issues.push({
          selector,
          role: declaredRole,
          violation: 'redundant-role',
          detail: `Element <${tag}> already has implicit role "${declaredRole}"; remove the redundant role attribute.`,
        });
      }
    }

    // 3. missing-required-prop
    if (spec && spec.required.length > 0) {
      for (const req of spec.required) {
        if (attribs[req] === undefined) {
          issues.push({
            selector,
            role: declaredRole,
            violation: 'missing-required-prop',
            detail: `Role "${declaredRole}" requires "${req}" but it is not set.`,
          });
        }
      }
    }

    // 4. prohibited-prop
    if (spec && spec.prohibited.length > 0) {
      for (const prohib of spec.prohibited) {
        if (attribs[prohib] !== undefined) {
          issues.push({
            selector,
            role: declaredRole,
            violation: 'prohibited-prop',
            detail: `Role "${declaredRole}" prohibits "${prohib}".`,
          });
        }
      }
    }

    // 5. invalid-prop-value (closed-set enums only)
    for (const [prop, rawValue] of ariaAttrs) {
      const enumValues = ARIA_VALUE_ENUMS[prop];
      if (!enumValues) continue;
      const value = rawValue.trim().toLowerCase();
      // Empty-string is permitted for boolean-ish props with default fallback;
      // we mirror axe and treat it as invalid since the author wrote it.
      if (!enumValues.includes(value)) {
        const issue: AriaValidateIssue = {
          selector,
          violation: 'invalid-prop-value',
          detail: `Attribute "${prop}" has value "${rawValue}" which is not one of: ${enumValues.join(', ')}.`,
        };
        if (declaredRole) issue.role = declaredRole;
        issues.push(issue);
      }
    }
  });

  return { issues };
}
