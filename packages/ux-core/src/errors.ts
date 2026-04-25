/**
 * Base class for all `@standardbeagle/ux-core` errors.
 *
 * Carries a stable string {@link UXCoreError.code | `code`} so callers can
 * branch on error kind without `instanceof` checks across module boundaries.
 */
export class UXCoreError extends Error {
  /**
   * @param message Human-readable error text.
   * @param code Stable machine-readable identifier (e.g. `E_INVALID_COLOR`).
   */
  constructor(
    message: string,
    /** Stable machine-readable error identifier. */
    public code: string,
  ) {
    super(message);
    this.name = 'UXCoreError';
  }
}

/**
 * Thrown when a color value cannot be parsed or is structurally invalid.
 *
 * Code: `E_INVALID_COLOR`. The offending value is JSON-stringified into the
 * message for diagnostics.
 */
export class InvalidColorError extends UXCoreError {
  /**
   * @param value The bad input that failed validation.
   * @param space Optional color space the value was being parsed as.
   */
  constructor(value: unknown, space?: string) {
    super(
      `Invalid color: ${JSON.stringify(value)}${space ? ` for space ${space}` : ''}`,
      'E_INVALID_COLOR',
    );
    this.name = 'InvalidColorError';
  }
}

/**
 * Thrown when a numeric channel falls outside its declared range.
 *
 * Code: `E_OUT_OF_RANGE`. See the per-color-space interfaces for valid channel ranges.
 */
export class OutOfRangeError extends UXCoreError {
  /**
   * @param value The offending numeric value.
   * @param param Channel/parameter name (e.g. `"r"`, `"h"`).
   * @param min Inclusive minimum.
   * @param max Inclusive maximum.
   */
  constructor(value: unknown, param: string, min: number, max: number) {
    super(
      `Value out of range: ${JSON.stringify(value)} for ${param} (expected ${min}..${max})`,
      'E_OUT_OF_RANGE',
    );
    this.name = 'OutOfRangeError';
  }
}

/**
 * Thrown when a color space tag is not one of the supported values.
 *
 * Code: `E_UNSUPPORTED_SPACE`.
 */
export class UnsupportedSpaceError extends UXCoreError {
  /**
   * @param space The unrecognized space tag.
   */
  constructor(space: unknown) {
    super(`Unsupported color space: ${JSON.stringify(space)}`, 'E_UNSUPPORTED_SPACE');
    this.name = 'UnsupportedSpaceError';
  }
}
