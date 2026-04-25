import { z } from 'zod';

/**
 * W3C Design Tokens Community Group (DTCG) format schemas.
 * Spec: https://tr.designtokens.org/format/
 *
 * A DTCG document is a JSON tree where every leaf node ("token") has $value
 * and $type, and every non-leaf node ("group") is a recursive object.
 * Groups MAY also carry $type (inheritable default for descendants) but never $value.
 *
 * Twelve token types are defined in the spec:
 *   color, dimension, fontFamily, fontWeight, duration, cubicBezier,
 *   number, strokeStyle, border, transition, shadow, gradient, typography
 */

// ---------- Type-specific $value validators ----------

/** color: 6/8-digit hex, 3/4-digit hex, rgb(), rgba(), hsl(), hsla(), or CSS named color. */
const ColorValueSchema = z.string().refine(
  (v) => {
    if (typeof v !== 'string') return false;
    const s = v.trim();
    if (/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return true;
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*(0|1|0?\.\d+|1\.0+)\s*)?\)$/i.test(s)) return true;
    if (/^hsla?\(\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?%\s*,\s*\d+(\.\d+)?%\s*(,\s*(0|1|0?\.\d+|1\.0+)\s*)?\)$/i.test(s)) return true;
    // CSS named colors — accept any pure-alpha identifier as a permissive named-color match.
    if (/^[a-zA-Z]+$/.test(s)) return true;
    return false;
  },
  { message: 'Invalid color: expected hex (#rgb/#rrggbb/#rrggbbaa), rgb(a)(), hsl(a)(), or CSS named color' },
);

/** dimension: number followed by unit (px, rem, em, %, vh, vw, etc.) or a structured object. */
const DimensionStringSchema = z
  .string()
  .regex(
    /^-?\d+(\.\d+)?(px|rem|em|pt|%|vw|vh|vmin|vmax|ex|ch|cm|mm|in|pc)$/,
    'Invalid dimension: expected "<number><unit>" (e.g. "16px", "1.5rem")',
  );
const DimensionObjectSchema = z.object({
  value: z.number(),
  unit: z.string().min(1),
});
const DimensionValueSchema = z.union([DimensionStringSchema, DimensionObjectSchema]);

/** fontFamily: a single name string OR an array of fallback names. */
const FontFamilyValueSchema = z.union([
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
]);

/** fontWeight: numeric (1..1000) OR a recognized weight keyword. */
const FONT_WEIGHT_KEYWORDS = new Set([
  'thin',
  'hairline',
  'extra-light',
  'ultra-light',
  'light',
  'normal',
  'regular',
  'book',
  'medium',
  'semi-bold',
  'demi-bold',
  'bold',
  'extra-bold',
  'ultra-bold',
  'black',
  'heavy',
  'extra-black',
  'ultra-black',
]);
const FontWeightValueSchema = z.union([
  z
    .number()
    .int()
    .min(1)
    .max(1000),
  z
    .string()
    .refine((v) => FONT_WEIGHT_KEYWORDS.has(v.toLowerCase()), {
      message: 'Invalid fontWeight: expected 1..1000 or a CSS weight keyword',
    }),
]);

/** duration: number+unit string ("100ms", "0.3s") OR structured object. */
const DurationStringSchema = z
  .string()
  .regex(/^-?\d+(\.\d+)?(ms|s)$/, 'Invalid duration: expected "<number>ms" or "<number>s"');
const DurationObjectSchema = z.object({
  value: z.number(),
  unit: z.enum(['ms', 's']),
});
const DurationValueSchema = z.union([DurationStringSchema, DurationObjectSchema]);

/** cubicBezier: array of exactly 4 numbers; index 0 and 2 must be in [0,1]. */
const CubicBezierValueSchema = z
  .tuple([z.number(), z.number(), z.number(), z.number()])
  .refine((arr) => arr[0] >= 0 && arr[0] <= 1 && arr[2] >= 0 && arr[2] <= 1, {
    message: 'Invalid cubicBezier: x1 (index 0) and x2 (index 2) must be within [0, 1]',
  });

/** number: any finite JSON number. */
const NumberValueSchema = z.number().finite();

/** strokeStyle: keyword string OR composite object {dashArray, lineCap}. */
const STROKE_STYLE_KEYWORDS = new Set([
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'outset',
  'inset',
]);
const StrokeStyleValueSchema = z.union([
  z.string().refine((v) => STROKE_STYLE_KEYWORDS.has(v), {
    message: 'Invalid strokeStyle: expected one of solid|dashed|dotted|double|groove|ridge|outset|inset',
  }),
  z.object({
    dashArray: z.array(DimensionValueSchema).min(1),
    lineCap: z.enum(['round', 'butt', 'square']),
  }),
]);

/** border: composite object {color, width, style}. */
const BorderValueSchema = z.object({
  color: ColorValueSchema,
  width: DimensionValueSchema,
  style: StrokeStyleValueSchema,
});

/** transition: composite object {duration, delay, timingFunction}. */
const TransitionValueSchema = z.object({
  duration: DurationValueSchema,
  delay: DurationValueSchema,
  timingFunction: CubicBezierValueSchema,
});

/** shadow: a single composite or an array of composites. */
const SingleShadowSchema = z.object({
  color: ColorValueSchema,
  offsetX: DimensionValueSchema,
  offsetY: DimensionValueSchema,
  blur: DimensionValueSchema,
  spread: DimensionValueSchema,
  inset: z.boolean().optional(),
});
const ShadowValueSchema = z.union([SingleShadowSchema, z.array(SingleShadowSchema).min(1)]);

/** gradient: array of stops, each {color, position in [0,1]}. */
const GradientStopSchema = z.object({
  color: ColorValueSchema,
  position: z.number().min(0).max(1),
});
const GradientValueSchema = z.array(GradientStopSchema).min(2);

/** typography: composite object aggregating font + sizing properties. */
const TypographyValueSchema = z.object({
  fontFamily: FontFamilyValueSchema,
  fontSize: DimensionValueSchema,
  fontWeight: FontWeightValueSchema,
  letterSpacing: DimensionValueSchema.optional(),
  lineHeight: z.union([NumberValueSchema, DimensionValueSchema]),
});

/**
 * Map of all 12 DTCG $type names to their $value validator.
 * Handler imports this directly and is the canonical source of truth.
 */
export const DtcgValueSchemas: Record<string, z.ZodTypeAny> = {
  color: ColorValueSchema,
  dimension: DimensionValueSchema,
  fontFamily: FontFamilyValueSchema,
  fontWeight: FontWeightValueSchema,
  duration: DurationValueSchema,
  cubicBezier: CubicBezierValueSchema,
  number: NumberValueSchema,
  strokeStyle: StrokeStyleValueSchema,
  border: BorderValueSchema,
  transition: TransitionValueSchema,
  shadow: ShadowValueSchema,
  gradient: GradientValueSchema,
  typography: TypographyValueSchema,
};

/** Set of recognized $type values, derived from DtcgValueSchemas. */
export const DtcgTypes = Object.keys(DtcgValueSchemas) as readonly string[];

/** Reserved DTCG keys that may appear on a token leaf or group. */
export const DtcgReservedKeys = ['$value', '$type', '$description', '$extensions'] as const;

/**
 * A leaf token: must have $value; $type may be inherited from an ancestor group at validate time.
 * The Zod schema is intentionally permissive on $value (z.unknown()) because the type-specific
 * validation happens in the handler after we know the resolved $type.
 */
export const TokenSchema = z
  .object({
    $value: z.unknown(),
    $type: z.string().optional(),
    $description: z.string().optional(),
    $extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

/**
 * A group: any object that is not a leaf. May carry $type (inheritable default), $description,
 * $extensions; all other keys are child tokens or nested groups.
 */
export const GroupSchema = z
  .object({
    $type: z.string().optional(),
    $description: z.string().optional(),
    $extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

/** A node in the DTCG tree is either a token (has $value) or a group (any other object). */
export type DtcgNode = Record<string, unknown>;

/**
 * The whole DTCG document: the root group. Structurally identical to DtcgNode (any object
 * keyed by token/group names), but named separately so exporter signatures read as
 * "consumes the tree" rather than "consumes a node". Use this in public APIs.
 */
export type DTCGTree = DtcgNode;

/**
 * Validation issue produced by the validator. `path` is dotted JSON-pointer-ish
 * (e.g. "color.brand.primary"); `code` is a stable machine-readable identifier.
 */
export interface DtcgIssue {
  path: string;
  message: string;
  code: string;
}

/** Stable issue codes returned by the validator. */
export const DtcgIssueCode = {
  MISSING_VALUE: 'MISSING_VALUE',
  MISSING_TYPE: 'MISSING_TYPE',
  UNKNOWN_TYPE: 'UNKNOWN_TYPE',
  INVALID_VALUE: 'INVALID_VALUE',
  INVALID_NODE: 'INVALID_NODE',
} as const;
export type DtcgIssueCodeValue = (typeof DtcgIssueCode)[keyof typeof DtcgIssueCode];

/** Heuristic: a node is a leaf iff it has the `$value` key. */
export function isLeafNode(node: unknown): node is { $value: unknown } & DtcgNode {
  return typeof node === 'object' && node !== null && '$value' in (node as object);
}

/** Heuristic: a node is a plain object eligible to act as a group/token (not array, not null). */
export function isObjectNode(node: unknown): node is DtcgNode {
  return typeof node === 'object' && node !== null && !Array.isArray(node);
}
