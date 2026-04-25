import type { ModularScaleInput, ModularScaleOutput } from './modular-scale.schema.js';

// Default labels: caption, small, body(0), h6..h1.
// Order: ascending step from -steps_down to +steps_up.
function defaultLabels(stepsDown: number, stepsUp: number): string[] {
  const labels: string[] = [];

  // Below body: use caption (deepest), small (next), then step-N for any extras.
  const belowNames = ['small', 'caption']; // index 0 = -1 (small), index 1 = -2 (caption)
  for (let i = stepsDown; i >= 1; i--) {
    const named = belowNames[i - 1];
    if (named !== undefined) {
      labels.push(named);
    } else {
      labels.push(`step-${-i}`);
    }
  }

  // Body
  labels.push('body');

  // Above body: h6, h5, h4, h3, h2, h1 — h6 is smallest, h1 largest.
  // step 1 → h6, step 2 → h5, ..., step 6 → h1. Beyond step 6 → step-N.
  for (let i = 1; i <= stepsUp; i++) {
    if (i <= 6) {
      labels.push(`h${7 - i}`);
    } else {
      labels.push(`step-${i}`);
    }
  }

  return labels;
}

export function modularScale(input: ModularScaleInput): ModularScaleOutput {
  const { base, ratio, steps_up, steps_down, output, root_px, labels } = input;

  const totalCount = steps_down + steps_up + 1;
  const resolvedLabels = labels ?? defaultLabels(steps_down, steps_up);

  if (resolvedLabels.length !== totalCount) {
    throw new Error(
      `labels length ${resolvedLabels.length} does not match steps_down + steps_up + 1 = ${totalCount}`,
    );
  }

  const includeRem = output === 'rem' || output === 'both';
  const includePx = true; // px is the canonical representation; always emit.

  const scale = [];
  for (let i = 0; i < totalCount; i++) {
    const step = -steps_down + i;
    const sizePx = base * Math.pow(ratio, step);
    const label = resolvedLabels[i] ?? `step-${step}`;
    const entry: { label: string; step: number; px: string; rem?: string } = {
      label,
      step,
      px: includePx ? sizePx.toFixed(2) : '',
    };
    if (includeRem) {
      entry.rem = (sizePx / root_px).toFixed(3);
    }
    scale.push(entry);
  }

  return { scale };
}
