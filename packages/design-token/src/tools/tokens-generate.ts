import type { TokensGenerateInput, TokensGenerateOutput } from './tokens-generate.schema.js';

/**
 * Generate a W3C DTCG token tree from a flat palette + modular type scale + linear spacing scale.
 *
 * Output shape (all leaves carry $value + $type so the result passes tokens_validate from F1):
 *   {
 *     color:   { <name>: { $value, $type: "color" }, ... }      // one per palette entry
 *     font:    { size: { caption|small|body|h6..h1: { $value: "<n>px", $type: "dimension" } } }
 *     spacing: { 0..steps: { $value: "<n>px", $type: "dimension" }, ... }                    }
 *
 * Determinism guarantees:
 *   - palette iteration uses Object.keys (insertion order preserved for string keys);
 *   - font.size names are emitted from a fixed ordered list;
 *   - spacing keys are emitted by ascending integer index.
 *   Calling tokensGenerate twice with the same input therefore yields object trees with
 *   identical key order and identical $value strings, so JSON.stringify of either is byte-equal.
 */

/**
 * Modular type-scale step names paired with their exponent n where size = round(base * ratio^n).
 * Order matters: this is the on-disk key order in the emitted font.size group. Negative n
 * produces sub-body sizes (caption, small); positive n produces heading sizes (h6 → h1).
 */
const TYPE_SCALE_STEPS: ReadonlyArray<{ name: string; n: number }> = [
  { name: 'caption', n: -2 },
  { name: 'small', n: -1 },
  { name: 'body', n: 0 },
  { name: 'h6', n: 1 },
  { name: 'h5', n: 2 },
  { name: 'h4', n: 3 },
  { name: 'h3', n: 4 },
  { name: 'h2', n: 5 },
  { name: 'h1', n: 6 },
];

export function tokensGenerate(input: TokensGenerateInput): TokensGenerateOutput {
  const { palette, type_scale, spacing } = input;

  // ---- color group ----
  const color: Record<string, { $value: string; $type: 'color' }> = {};
  for (const name of Object.keys(palette)) {
    color[name] = { $value: palette[name]!, $type: 'color' };
  }

  // ---- font.size group (modular scale) ----
  const fontSize: Record<string, { $value: string; $type: 'dimension' }> = {};
  for (const { name, n } of TYPE_SCALE_STEPS) {
    const px = Math.round(type_scale.base * Math.pow(type_scale.ratio, n));
    fontSize[name] = { $value: `${px}px`, $type: 'dimension' };
  }

  // ---- spacing group (linear, base*step px for step in 0..steps inclusive) ----
  const spacingGroup: Record<string, { $value: string; $type: 'dimension' }> = {};
  for (let step = 0; step <= spacing.steps; step++) {
    spacingGroup[String(step)] = {
      $value: `${spacing.base * step}px`,
      $type: 'dimension',
    };
  }

  return {
    color,
    font: { size: fontSize },
    spacing: spacingGroup,
  };
}
