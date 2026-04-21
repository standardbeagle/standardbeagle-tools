import type { TokenExportInput, TokenExportOutput } from './token-export.schema.js';
import type { Token } from './token-create.schema.js';

function sanitizeName(name: string): string {
  return name.replace(/\s+/g, '-').toLowerCase();
}

function toCssVarName(name: string, prefix?: string): string {
  const sanitized = sanitizeName(name);
  return prefix ? `--${prefix}-${sanitized}` : `--${sanitized}`;
}

function toScssVarName(name: string, prefix?: string): string {
  const sanitized = sanitizeName(name);
  return prefix ? `$${prefix}-${sanitized}` : `$${sanitized}`;
}

function toCamelCase(name: string): string {
  return name
    .replace(/[-.\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^./, (c) => c.toLowerCase());
}

function filterTokens(
  tokens: Token[],
  includeCategories?: string[],
  excludeCategories?: string[],
): Token[] {
  return tokens.filter((t) => {
    if (includeCategories && !includeCategories.includes(t.type)) return false;
    if (excludeCategories && excludeCategories.includes(t.type)) return false;
    return true;
  });
}

function transformCssVars(tokens: Token[], prefix?: string): string {
  const lines = tokens.map((t) => `  ${toCssVarName(t.name, prefix)}: ${t.value};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

function transformScss(tokens: Token[], prefix?: string): string {
  return tokens.map((t) => `${toScssVarName(t.name, prefix)}: ${t.value};`).join('\n');
}

function transformJson(tokens: Token[]): string {
  const obj: Record<string, unknown> = {};
  for (const t of tokens) {
    obj[t.name] = {
      value: t.value,
      type: t.type,
      ...(t.description ? { description: t.description } : {}),
      ...(t.reference ? { reference: t.reference } : {}),
    };
  }
  return JSON.stringify(obj, null, 2);
}

function transformAndroidXml(tokens: Token[]): string {
  const lines = tokens.map((t) => {
    const name = sanitizeName(t.name).replace(/-/g, '_');
    switch (t.type) {
      case 'color':
        return `  <color name="${name}">${t.value}</color>`;
      case 'size':
      case 'spacing':
      case 'radius':
      case 'font':
        return `  <dimen name="${name}">${t.value}</dimen>`;
      case 'border':
      case 'shadow':
      default:
        return `  <string name="${name}">${t.value}</string>`;
    }
  });
  return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${lines.join('\n')}\n</resources>`;
}

function transformIosSwift(tokens: Token[]): string {
  const lines = tokens.map((t) => {
    const name = toCamelCase(t.name);
    switch (t.type) {
      case 'color':
        return `let ${name} = UIColor(named: "${t.value}") ?? UIColor()`;
      case 'size':
      case 'spacing':
      case 'radius':
      case 'font': {
        const num = parseFloat(t.value);
        return `let ${name}: CGFloat = ${Number.isNaN(num) ? 0 : num}`;
      }
      case 'border':
      case 'shadow':
      default:
        return `let ${name} = "${t.value}"`;
    }
  });
  return lines.join('\n');
}

export function tokenExport(input: TokenExportInput): TokenExportOutput {
  const { tokens, format, prefix, includeCategories, excludeCategories } = input;
  const filtered = filterTokens(tokens, includeCategories, excludeCategories);

  let result: string;
  switch (format) {
    case 'css-vars':
      result = transformCssVars(filtered, prefix);
      break;
    case 'scss':
      result = transformScss(filtered, prefix);
      break;
    case 'json':
      result = transformJson(filtered);
      break;
    case 'android-xml':
      result = transformAndroidXml(filtered);
      break;
    case 'ios-swift':
      result = transformIosSwift(filtered);
      break;
    default:
      throw new Error(`Unknown format: ${format}`);
  }

  return { result };
}
