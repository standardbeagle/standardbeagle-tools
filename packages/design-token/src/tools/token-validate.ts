import type { Token } from './token-create.schema.js';
import type { TokenValidateInput, TokenValidateOutput } from './token-validate.schema.js';

function isValidColor(value: string): boolean {
  const hexRegex = /^#([0-9a-fA-F]{3}){1,2}$/;
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i;
  const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0?\.?\d+|1(\.0)?)\s*\)$/i;
  const hslRegex = /^hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)$/i;
  const hslaRegex = /^hsla\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*,\s*(0?\.?\d+|1(\.0)?)\s*\)$/i;
  return hexRegex.test(value) || rgbRegex.test(value) || rgbaRegex.test(value) || hslRegex.test(value) || hslaRegex.test(value);
}

function isValidSize(value: string): boolean {
  return /^-?\d+(\.\d+)?(px|rem|em|pt|%|vw|vh|vmin|vmax|ex|ch|cm|mm|in|pc)?$/.test(value);
}

function isValidFont(value: string): boolean {
  return value.trim().length > 0;
}

function isValidBorder(value: string): boolean {
  return value.trim().length > 0;
}

function isValidRadius(value: string): boolean {
  return /^-?\d+(\.\d+)?(px|rem|em|pt|%|vw|vh)?$/.test(value) || /^\d+(\.\d+)?%$/.test(value);
}

function isValidShadow(value: string): boolean {
  return value.trim().length > 0;
}

function validateTokenValue(token: Token): string | null {
  switch (token.type) {
    case 'color':
      return isValidColor(token.value) ? null : `Token "${token.name}" has invalid color value: ${token.value}`;
    case 'size':
      return isValidSize(token.value) ? null : `Token "${token.name}" has invalid size value: ${token.value}`;
    case 'spacing':
      return isValidSize(token.value) ? null : `Token "${token.name}" has invalid spacing value: ${token.value}`;
    case 'font':
      return isValidFont(token.value) ? null : `Token "${token.name}" has invalid font value: ${token.value}`;
    case 'border':
      return isValidBorder(token.value) ? null : `Token "${token.name}" has invalid border value: ${token.value}`;
    case 'radius':
      return isValidRadius(token.value) ? null : `Token "${token.name}" has invalid radius value: ${token.value}`;
    case 'shadow':
      return isValidShadow(token.value) ? null : `Token "${token.name}" has invalid shadow value: ${token.value}`;
    default:
      return null;
  }
}

function hasCircularReference(tokens: Token[], token: Token, visited: Set<string>): boolean {
  if (!token.reference) return false;
  if (visited.has(token.name)) return true;
  const ref = tokens.find((t) => t.name === token.reference);
  if (!ref) return false;
  visited.add(token.name);
  return hasCircularReference(tokens, ref, visited);
}

export function tokenValidate(input: TokenValidateInput): TokenValidateOutput {
  const { tokens } = input;
  const errors: string[] = [];
  const warnings: string[] = [];
  const names = new Set<string>();

  for (const token of tokens) {
    if (names.has(token.name)) {
      errors.push(`Duplicate token name: "${token.name}"`);
    } else {
      names.add(token.name);
    }

    const valueError = validateTokenValue(token);
    if (valueError) {
      errors.push(valueError);
    }

    if (token.reference) {
      const ref = tokens.find((t) => t.name === token.reference);
      if (!ref) {
        errors.push(`Token "${token.name}" references unresolved token: "${token.reference}"`);
      } else if (hasCircularReference(tokens, token, new Set())) {
        errors.push(`Token "${token.name}" has a circular reference`);
      }
    }
  }

  return { errors, warnings };
}
