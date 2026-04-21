import type { TypeScaleGenerateInput, TypeScaleGenerateOutput } from './type-scale-generate.schema.js';

const stepNames: Record<number, string> = {
  [-2]: 'xs',
  [-1]: 'sm',
  0: 'base',
  1: 'lg',
  2: 'xl',
  3: '2xl',
  4: '3xl',
  5: '4xl',
  6: '5xl',
  7: '6xl',
};

function roundToEven(value: number): number {
  return Math.round(value / 2) * 2;
}

export function typeScaleGenerate(input: TypeScaleGenerateInput): TypeScaleGenerateOutput {
  const base = input.base;
  const ratio = input.ratio;
  const steps = input.steps;

  const scale = steps.map((step) => {
    const size = base * Math.pow(ratio, step);
    const lineHeight = roundToEven(size * 1.5);
    return {
      name: stepNames[step] ?? `step-${step}`,
      size: Number(size.toFixed(2)),
      lineHeight,
    };
  });

  return { scale };
}
