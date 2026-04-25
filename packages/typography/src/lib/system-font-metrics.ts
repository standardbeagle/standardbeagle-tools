/**
 * Hardcoded metrics table for ~15 common system fonts.
 *
 * Values are unitsPerEm-normalized ratios so they can be used directly in
 * CSS percentage overrides:
 *   ascent-override:  (customFont.ascent / customFont.unitsPerEm)  / sizeAdjust * 100%
 *   descent-override: (|customFont.descent| / customFont.unitsPerEm) / sizeAdjust * 100%
 *   line-gap-override:(customFont.lineGap / customFont.unitsPerEm) / sizeAdjust * 100%
 *   size-adjust:      (customFont.xHeight / customFont.unitsPerEm) / fallback.xHeightRatio * 100%
 *
 * Source: capsize (https://github.com/seek-oss/capsize) entireMetricsCollection
 * cross-referenced with projectwallace.com font-fallback metrics (Mar 2024).
 * All ratios are dimensionless: metric / unitsPerEm.
 */

export interface SystemFontMetrics {
  /** Family name as used in CSS `local()` and `font-family`. */
  fontName: string;
  /** ascent / unitsPerEm — used to compute ascent-override. */
  ascentRatio: number;
  /** |descent| / unitsPerEm — stored as positive value for percentage math. */
  descentRatio: number;
  /** lineGap / unitsPerEm — used to compute line-gap-override. */
  lineGapRatio: number;
  /** xHeight / unitsPerEm — used as the size-adjust denominator. */
  xHeightRatio: number;
}

export type FamilyType = 'sans-serif' | 'serif' | 'monospace';

/* ---------------- sans-serif ---------------- */

const APPLE_SYSTEM: SystemFontMetrics = {
  fontName: '-apple-system',
  ascentRatio: 1980 / 2048,
  descentRatio: 432 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 1044 / 2048,
};

const SEGOE_UI: SystemFontMetrics = {
  fontName: 'Segoe UI',
  ascentRatio: 2210 / 2048,
  descentRatio: 514 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 1037 / 2048,
};

const ROBOTO: SystemFontMetrics = {
  fontName: 'Roboto',
  ascentRatio: 1900 / 2048,
  descentRatio: 500 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 1082 / 2048,
};

const HELVETICA: SystemFontMetrics = {
  fontName: 'Helvetica',
  ascentRatio: 1577 / 2048,
  descentRatio: 471 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 1038 / 2048,
};

const ARIAL: SystemFontMetrics = {
  fontName: 'Arial',
  ascentRatio: 1854 / 2048,
  descentRatio: 434 / 2048,
  lineGapRatio: 67 / 2048,
  xHeightRatio: 1062 / 2048,
};

const SYSTEM_UI: SystemFontMetrics = {
  fontName: 'system-ui',
  ascentRatio: 1980 / 2048,
  descentRatio: 432 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 1044 / 2048,
};

/* ---------------- serif ---------------- */

const TIMES_NEW_ROMAN: SystemFontMetrics = {
  fontName: 'Times New Roman',
  ascentRatio: 1825 / 2048,
  descentRatio: 443 / 2048,
  lineGapRatio: 87 / 2048,
  xHeightRatio: 916 / 2048,
};

const GEORGIA: SystemFontMetrics = {
  fontName: 'Georgia',
  ascentRatio: 1878 / 2048,
  descentRatio: 449 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 986 / 2048,
};

const CAMBRIA: SystemFontMetrics = {
  fontName: 'Cambria',
  ascentRatio: 1832 / 2048,
  descentRatio: 545 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 956 / 2048,
};

const GARAMOND: SystemFontMetrics = {
  fontName: 'Garamond',
  ascentRatio: 1620 / 2048,
  descentRatio: 480 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 820 / 2048,
};

const TIMES: SystemFontMetrics = {
  fontName: 'Times',
  ascentRatio: 1825 / 2048,
  descentRatio: 443 / 2048,
  lineGapRatio: 87 / 2048,
  xHeightRatio: 916 / 2048,
};

/* ---------------- monospace ---------------- */

const COURIER_NEW: SystemFontMetrics = {
  fontName: 'Courier New',
  ascentRatio: 1705 / 2048,
  descentRatio: 615 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 866 / 2048,
};

const MENLO: SystemFontMetrics = {
  fontName: 'Menlo',
  ascentRatio: 1972 / 2048,
  descentRatio: 480 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 1085 / 2048,
};

const CONSOLAS: SystemFontMetrics = {
  fontName: 'Consolas',
  ascentRatio: 1909 / 2048,
  descentRatio: 423 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 1015 / 2048,
};

const MONACO: SystemFontMetrics = {
  fontName: 'Monaco',
  ascentRatio: 2003 / 2048,
  descentRatio: 470 / 2048,
  lineGapRatio: 0,
  xHeightRatio: 1096 / 2048,
};

/**
 * Family-type → ordered fallback stack. The first entry is the metric source
 * (the font whose xHeight we use as the size-adjust denominator); subsequent
 * entries are emitted into the CSS `font-family` list in declaration order.
 */
export const SYSTEM_FONT_STACKS: Record<FamilyType, SystemFontMetrics[]> = {
  'sans-serif': [ARIAL, APPLE_SYSTEM, SEGOE_UI, ROBOTO, HELVETICA, SYSTEM_UI],
  serif: [GEORGIA, TIMES_NEW_ROMAN, CAMBRIA, GARAMOND, TIMES],
  monospace: [COURIER_NEW, MENLO, CONSOLAS, MONACO],
};

/** Total entries in the metrics table — currently 15. */
export const SYSTEM_FONT_METRICS_COUNT =
  SYSTEM_FONT_STACKS['sans-serif'].length +
  SYSTEM_FONT_STACKS.serif.length +
  SYSTEM_FONT_STACKS.monospace.length;
