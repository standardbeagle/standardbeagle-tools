import type { Token, TokenCreateInput, TokenCreateOutput } from './token-create.schema.js';

function resolveValue(token: Token, tokens: Token[], visited: Set<string>): string {
  if (token.reference) {
    if (visited.has(token.name)) {
      throw new Error('Circular reference');
    }
    const ref = tokens.find((t) => t.name === token.reference);
    if (ref) {
      visited.add(token.name);
      return resolveValue(ref, tokens, visited);
    }
  }
  return token.value;
}

export function tokenCreate(input: TokenCreateInput): TokenCreateOutput {
  const { name, value, type, description, reference, tokens = [] } = input;

  let computedValue = value;

  if (reference) {
    const refToken = tokens.find((t) => t.name === reference);
    if (refToken) {
      try {
        computedValue = resolveValue(refToken, tokens, new Set());
      } catch {
        computedValue = value;
      }
    }
  }

  return {
    name,
    value,
    type,
    description,
    reference,
    computedValue,
  };
}
