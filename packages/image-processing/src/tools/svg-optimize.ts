import { readFile, writeFile } from 'fs/promises';
import { basename, extname } from 'path';
import { optimize } from 'svgo';
import type { Config } from 'svgo';
import type { SvgOptimizeInput, SvgOptimizeOutput } from './svg-optimize.schema.js';

function buildConfig(aggressive: boolean): Config {
  if (aggressive) {
    // `removeDimensions` is a standalone plugin (not part of preset-default), so it
    // must be listed alongside the preset rather than as an override.
    return {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              cleanupIds: { force: true },
            },
          },
        },
        'removeDimensions',
      ],
    };
  }
  return {
    plugins: [{ name: 'preset-default' }],
  };
}

function deriveIconId(svgPath: string | undefined): string {
  if (!svgPath) return 'icon';
  const base = basename(svgPath, extname(svgPath));
  return base.length > 0 ? base : 'icon';
}

const SVG_OPEN_RE = /<svg\b([^>]*)>/i;
const VIEWBOX_RE = /viewBox\s*=\s*"([^"]*)"/i;
const XMLNS_RE = /xmlns\s*=\s*"([^"]*)"/i;

function extractViewBox(svg: string): string | undefined {
  const openMatch = svg.match(SVG_OPEN_RE);
  if (!openMatch) return undefined;
  const m = (openMatch[1] ?? '').match(VIEWBOX_RE);
  return m?.[1];
}

function wrapAsSymbolSprite(
  optimized: string,
  iconId: string,
  originalViewBox: string | undefined,
): string {
  const openMatch = optimized.match(SVG_OPEN_RE);
  if (!openMatch) {
    throw new Error('Cannot create symbol sprite: optimized output has no <svg> root element');
  }
  const attrs = openMatch[1] ?? '';
  // Prefer viewBox preserved by SVGO; otherwise fall back to the original source's viewBox
  // (preset-default drops viewBox when it matches width/height).
  const viewBox = attrs.match(VIEWBOX_RE)?.[1] ?? originalViewBox;
  const xmlns = attrs.match(XMLNS_RE)?.[1] ?? 'http://www.w3.org/2000/svg';

  const symbolAttrs: string[] = [`id="${iconId}"`];
  if (viewBox) {
    symbolAttrs.push(`viewBox="${viewBox}"`);
  }

  const replacedOpen = optimized.replace(
    SVG_OPEN_RE,
    `<svg xmlns="${xmlns}" style="display:none"><symbol ${symbolAttrs.join(' ')}>`,
  );
  const lastClose = replacedOpen.lastIndexOf('</svg>');
  if (lastClose === -1) {
    throw new Error('Cannot create symbol sprite: optimized output has no closing </svg> tag');
  }
  return replacedOpen.slice(0, lastClose) + '</symbol></svg>';
}

export async function svgOptimize(input: SvgOptimizeInput): Promise<SvgOptimizeOutput> {
  let source: string;
  if (input.svg !== undefined) {
    source = input.svg;
  } else if (input.svg_path !== undefined) {
    source = await readFile(input.svg_path, 'utf8');
  } else {
    // Schema refine guards this branch, but keep a defensive throw for type narrowing.
    throw new Error('Either svg or svg_path required');
  }

  const config = buildConfig(input.aggressive);
  const result = optimize(source, config);
  let optimized = result.data;

  if (input.symbol_sprite) {
    const iconId = deriveIconId(input.svg_path);
    const originalViewBox = extractViewBox(source);
    optimized = wrapAsSymbolSprite(optimized, iconId, originalViewBox);
  }

  if (input.output_path) {
    await writeFile(input.output_path, optimized, 'utf8');
  }

  const originalBytes = Buffer.byteLength(source, 'utf8');
  const optimizedBytes = Buffer.byteLength(optimized, 'utf8');
  const reductionPercent =
    originalBytes === 0 ? 0 : ((originalBytes - optimizedBytes) / originalBytes) * 100;

  return {
    optimized,
    original_bytes: originalBytes,
    optimized_bytes: optimizedBytes,
    reduction_percent: reductionPercent,
  };
}
