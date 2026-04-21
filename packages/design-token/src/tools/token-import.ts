import type { Token } from './token-create.schema.js';
import type { TokenImportInput, TokenImportOutput } from './token-import.schema.js';

function inferType(name: string, value: string): Token['type'] {
  const lowerName = name.toLowerCase();
  const trimmed = value.trim();

  const colorRegex = /^#([0-9a-fA-F]{3}){1,2}$|^rgb\(|^rgba\(|^hsl\(|^hsla\(/i;
  if (colorRegex.test(trimmed)) {
    return 'color';
  }

  const sizeRegex = /^-?\d+(\.\d+)?(px|rem|em|pt|%|vw|vh|vmin|vmax|ex|ch|cm|mm|in|pc)$/;
  if (sizeRegex.test(trimmed)) {
    if (lowerName.includes('spacing') || lowerName.includes('margin') || lowerName.includes('padding') || lowerName.includes('gap')) {
      return 'spacing';
    }
    if (lowerName.includes('radius') || lowerName.includes('round')) {
      return 'radius';
    }
    if (lowerName.includes('size') || lowerName.includes('width') || lowerName.includes('height')) {
      return 'size';
    }
    return 'size';
  }

  if (lowerName.includes('shadow')) return 'shadow';
  if (lowerName.includes('border')) return 'border';
  if (lowerName.includes('font') || lowerName.includes('family') || lowerName.includes('typeface')) return 'font';
  if (lowerName.includes('spacing') || lowerName.includes('margin') || lowerName.includes('padding') || lowerName.includes('gap')) return 'spacing';
  if (lowerName.includes('radius') || lowerName.includes('round')) return 'radius';
  if (lowerName.includes('size') || lowerName.includes('width') || lowerName.includes('height')) return 'size';

  return 'color';
}

function parseCss(source: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    const name = match[1]!;
    const value = match[2]!.trim();
    tokens.push({
      name,
      value,
      type: inferType(name, value),
    });
  }
  return tokens;
}

function parseScss(source: string): Token[] {
  const tokens: Token[] = [];
  const regex = /\$([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    const name = `$${match[1]!}`;
    const value = match[2]!.trim();
    tokens.push({
      name,
      value,
      type: inferType(name, value),
    });
  }
  return tokens;
}

function flattenJson(obj: unknown, prefix = ''): Token[] {
  const tokens: Token[] = [];
  if (typeof obj !== 'object' || obj === null) return tokens;

  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object') {
      if ('value' in val && typeof val.value === 'string') {
        const type = val.type && typeof val.type === 'string' ? (val.type as Token['type']) : inferType(fullKey, val.value);
        tokens.push({
          name: fullKey,
          value: val.value,
          type,
          description: val.description && typeof val.description === 'string' ? val.description : undefined,
          reference: val.reference && typeof val.reference === 'string' ? val.reference : undefined,
        });
      } else {
        tokens.push(...flattenJson(val, fullKey));
      }
    }
  }
  return tokens;
}

function parseJson(source: string): Token[] {
  const parsed = JSON.parse(source);
  if (Array.isArray(parsed)) {
    return parsed
      .filter((item): item is Record<string, unknown> => item && typeof item === 'object')
      .map((item) => {
        const name = String(item.name ?? 'unnamed');
        const value = String(item.value ?? '');
        const inferredType = item.type && typeof item.type === 'string' ? (item.type as Token['type']) : inferType(name, value);
        return {
          name,
          value,
          type: inferredType,
          description: item.description && typeof item.description === 'string' ? item.description : undefined,
          reference: item.reference && typeof item.reference === 'string' ? item.reference : undefined,
        };
      });
  }
  return flattenJson(parsed);
}

export function tokenImport(input: TokenImportInput): TokenImportOutput {
  const { source, format } = input;

  let tokens: Token[];
  switch (format) {
    case 'css':
      tokens = parseCss(source);
      break;
    case 'scss':
      tokens = parseScss(source);
      break;
    case 'json':
      tokens = parseJson(source);
      break;
    default:
      throw new Error(`Unknown format: ${format}`);
  }

  return { tokens };
}
