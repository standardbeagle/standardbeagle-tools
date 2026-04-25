import { basename } from 'node:path';
import * as fontkit from 'fontkit';
import type { Font, FontCollection } from 'fontkit';
import type {
  VariableFontAxesInput,
  VariableFontAxesOutput,
  VariableFontAxis,
  VariableFontInstance,
} from './variable-font-axes.schema.js';

interface FontWithVariations extends Font {
  variationAxes: Record<string, { name: string; min: number; default: number; max: number }>;
  namedVariations: Record<string, Record<string, number>>;
}

function isCollection(font: Font | FontCollection): font is FontCollection {
  return 'fonts' in font && Array.isArray((font as FontCollection).fonts);
}

function buildCssExample(
  family: string,
  fontPath: string,
  axes: VariableFontAxis[],
  instances: VariableFontInstance[],
): string {
  const filename = basename(fontPath);
  const wght = axes.find((a) => a.tag === 'wght');
  const fontWeightDecl = wght
    ? `  font-weight: ${wght.min} ${wght.max};`
    : '  font-weight: 400;';
  const wdth = axes.find((a) => a.tag === 'wdth');
  const fontStretchDecl = wdth ? `\n  font-stretch: ${wdth.min}% ${wdth.max}%;` : '';

  const sampleSettings = axes
    .map((a) => {
      const value = a.tag === 'wght' ? Math.min(a.max, Math.max(a.default, 700)) : a.default;
      return `'${a.tag}' ${value}`;
    })
    .join(', ');

  const heading = sampleSettings
    ? `.heading {\n  font-family: '${family}';\n  font-variation-settings: ${sampleSettings};\n}`
    : `.heading {\n  font-family: '${family}';\n}`;

  const instanceComments = instances
    .slice(0, 6)
    .map((inst) => {
      const settings = Object.entries(inst.coordinates)
        .map(([tag, val]) => `'${tag}' ${val}`)
        .join(', ');
      return `/* ${inst.name}: font-variation-settings: ${settings}; */`;
    })
    .join('\n');

  const fontFace = `@font-face {\n  font-family: '${family}';\n  src: url("${filename}") format("truetype-variations");\n${fontWeightDecl}${fontStretchDecl}\n  font-display: swap;\n}`;

  return instanceComments
    ? `${fontFace}\n\n${heading}\n\n${instanceComments}`
    : `${fontFace}\n\n${heading}`;
}

export function variableFontAxes(input: VariableFontAxesInput): VariableFontAxesOutput {
  const opened = fontkit.openSync(input.font_path);
  let font: Font;
  if (isCollection(opened)) {
    const first = opened.fonts[0];
    if (!first) {
      throw new Error(`Font collection at ${input.font_path} contains no fonts`);
    }
    font = first;
  } else {
    font = opened;
  }

  const variationFont = font as FontWithVariations;
  const variationAxes = variationFont.variationAxes ?? {};
  const namedVariations = variationFont.namedVariations ?? {};

  const axes: VariableFontAxis[] = Object.entries(variationAxes).map(([tag, info]) => ({
    tag,
    name: info.name,
    min: info.min,
    max: info.max,
    default: info.default,
  }));

  const instances: VariableFontInstance[] = Object.entries(namedVariations).map(
    ([name, coords]) => ({
      name,
      coordinates: { ...coords },
    }),
  );

  const isVariable = axes.length > 0;
  const cssExample = isVariable
    ? buildCssExample(font.familyName, input.font_path, axes, instances)
    : '';

  return {
    is_variable: isVariable,
    axes,
    instances,
    css_example: cssExample,
  };
}
