/**
 * Discriminator union of supported color spaces.
 *
 * Used as the `space` tag on the {@link Color} discriminated union so consumers
 * can switch on a single string instead of inspecting object shape.
 */
export type ColorSpace = 'rgb' | 'hsl' | 'hsv' | 'lab' | 'oklch' | 'hex';

/**
 * sRGB color with 8-bit channels and optional alpha.
 *
 * Channel ranges: `r`,`g`,`b` 0-255; `a` 0-1 (omitted means fully opaque).
 */
export interface RGB {
  /** Red channel, 0-255. */
  r: number;
  /** Green channel, 0-255. */
  g: number;
  /** Blue channel, 0-255. */
  b: number;
  /** Optional alpha, 0-1. */
  a?: number;
}

/**
 * HSL color (hue/saturation/lightness) with optional alpha.
 *
 * Channel ranges: `h` 0-360 degrees; `s`,`l` 0-100 percent; `a` 0-1.
 */
export interface HSL {
  /** Hue in degrees, 0-360. */
  h: number;
  /** Saturation percent, 0-100. */
  s: number;
  /** Lightness percent, 0-100. */
  l: number;
  /** Optional alpha, 0-1. */
  a?: number;
}

/**
 * HSV color (hue/saturation/value) with optional alpha.
 *
 * Channel ranges: `h` 0-360 degrees; `s`,`v` 0-100 percent; `a` 0-1.
 */
export interface HSV {
  /** Hue in degrees, 0-360. */
  h: number;
  /** Saturation percent, 0-100. */
  s: number;
  /** Value (brightness) percent, 0-100. */
  v: number;
  /** Optional alpha, 0-1. */
  a?: number;
}

/**
 * CIE L*a*b* color with optional alpha.
 *
 * Channel ranges: `l` 0-100; `a` -128 to 127 (green-red); `b` -128 to 127
 * (blue-yellow); `alpha` 0-1. Named `alpha` to avoid colliding with the `a` channel.
 */
export interface LAB {
  /** Lightness, 0-100. */
  l: number;
  /** Green-red axis, -128 to 127. */
  a: number;
  /** Blue-yellow axis, -128 to 127. */
  b: number;
  /** Optional alpha, 0-1. */
  alpha?: number;
}

/**
 * OKLCH color (perceptually uniform lightness/chroma/hue) with optional alpha.
 *
 * Channel ranges: `l` 0-1; `c` 0-0.4 (values above ~0.37 are typically out of
 * sRGB gamut); `h` 0-360 degrees; `alpha` 0-1.
 */
export interface OKLCH {
  /** Lightness, 0-1. */
  l: number;
  /** Chroma, 0-0.4. */
  c: number;
  /** Hue in degrees, 0-360. */
  h: number;
  /** Optional alpha, 0-1. */
  alpha?: number;
}

/**
 * Hex color string in `#RRGGBB` or `#RRGGBBAA` form.
 *
 * Short `#RGB` is not part of this type — normalize to 6 or 8 hex digits first.
 */
export type Hex = string;

/**
 * Discriminated union of every supported color representation.
 *
 * Switch on `space` to narrow `value` to the matching shape — {@link RGB},
 * {@link HSL}, {@link HSV}, {@link LAB}, {@link OKLCH}, or {@link Hex}.
 */
export type Color =
  | { space: 'rgb'; value: RGB }
  | { space: 'hsl'; value: HSL }
  | { space: 'hsv'; value: HSV }
  | { space: 'lab'; value: LAB }
  | { space: 'oklch'; value: OKLCH }
  | { space: 'hex'; value: Hex };
