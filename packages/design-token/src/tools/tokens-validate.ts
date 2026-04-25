import {
  DtcgIssue,
  DtcgIssueCode,
  DtcgNode,
  DtcgValueSchemas,
  isLeafNode,
  isObjectNode,
} from '../schema/dtcg.js';
import type { TokensValidateInput, TokensValidateOutput } from './tokens-validate.schema.js';

/**
 * Validate a W3C DTCG token tree.
 *
 * Algorithm:
 *  1. Recurse the input object; track dotted path.
 *  2. Treat any object node with `$value` as a leaf (token); everything else as a group.
 *  3. Resolve each leaf's $type by walking up the inherited $type chain from ancestor groups.
 *  4. For each leaf:
 *       - If $type is missing entirely → MISSING_TYPE error.
 *       - If $type is unknown:
 *           strict:true  → UNKNOWN_TYPE error.
 *           strict:false → UNKNOWN_TYPE warning.
 *       - If $type is known: run the type-specific Zod validator on $value;
 *         on failure → INVALID_VALUE error.
 *  5. Detect a "leaf-looking" node that has $type but no $value → MISSING_VALUE error.
 *  6. Empty input → valid: true with empty arrays.
 */
export function tokensValidate(input: TokensValidateInput): TokensValidateOutput {
  const { tokens, strict } = input;
  const errors: DtcgIssue[] = [];
  const warnings: DtcgIssue[] = [];

  walk(tokens, '', undefined, strict, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function walk(
  node: unknown,
  path: string,
  inheritedType: string | undefined,
  strict: boolean,
  errors: DtcgIssue[],
  warnings: DtcgIssue[],
): void {
  if (!isObjectNode(node)) {
    if (path !== '') {
      errors.push({
        path,
        message: 'Expected object node (group or token)',
        code: DtcgIssueCode.INVALID_NODE,
      });
    }
    return;
  }

  // Leaf: has $value.
  if (isLeafNode(node)) {
    validateLeaf(node, path, inheritedType, strict, errors, warnings);
    return;
  }

  // Group: recurse over non-reserved children with (possibly inherited) $type.
  const ownType = typeof (node as DtcgNode).$type === 'string' ? ((node as DtcgNode).$type as string) : undefined;
  const groupType = ownType ?? inheritedType;
  const childKeys = Object.keys(node).filter((k) => !k.startsWith('$'));

  // Quasi-leaf detection: node has $type, has NO $value, and has NO child keys.
  // That signature means the author wrote a token and forgot the $value (a group with $type
  // is legitimate — it's an inheritable default for descendants — so we only fire when
  // there are also no descendants to inherit it).
  if (ownType && childKeys.length === 0) {
    errors.push({
      path: path || '<root>',
      message: 'Token node has $type but no $value',
      code: DtcgIssueCode.MISSING_VALUE,
    });
    return;
  }

  for (const key of childKeys) {
    const childPath = path === '' ? key : `${path}.${key}`;
    walk((node as DtcgNode)[key], childPath, groupType, strict, errors, warnings);
  }
}

function validateLeaf(
  node: DtcgNode,
  path: string,
  inheritedType: string | undefined,
  strict: boolean,
  errors: DtcgIssue[],
  warnings: DtcgIssue[],
): void {
  const issuePath = path || '<root>';
  const ownType = typeof node.$type === 'string' ? (node.$type as string) : undefined;
  const resolvedType = ownType ?? inheritedType;

  if (!resolvedType) {
    errors.push({
      path: issuePath,
      message: 'Token has $value but no $type (and none inherited)',
      code: DtcgIssueCode.MISSING_TYPE,
    });
    return;
  }

  const validator = DtcgValueSchemas[resolvedType];
  if (!validator) {
    const issue: DtcgIssue = {
      path: issuePath,
      message: `Unknown $type: "${resolvedType}"`,
      code: DtcgIssueCode.UNKNOWN_TYPE,
    };
    if (strict) {
      errors.push(issue);
    } else {
      warnings.push(issue);
    }
    return;
  }

  const result = validator.safeParse(node.$value);
  if (!result.success) {
    const reason = result.error.issues
      .map((i) => i.message)
      .join('; ');
    errors.push({
      path: issuePath,
      message: `Invalid $value for $type "${resolvedType}": ${reason}`,
      code: DtcgIssueCode.INVALID_VALUE,
    });
  }
}
