export class UXCoreError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'UXCoreError';
  }
}

export class InvalidColorError extends UXCoreError {
  constructor(value: unknown, space?: string) {
    super(
      `Invalid color: ${JSON.stringify(value)}${space ? ` for space ${space}` : ''}`,
      'E_INVALID_COLOR',
    );
    this.name = 'InvalidColorError';
  }
}

export class OutOfRangeError extends UXCoreError {
  constructor(value: unknown, param: string, min: number, max: number) {
    super(
      `Value out of range: ${JSON.stringify(value)} for ${param} (expected ${min}..${max})`,
      'E_OUT_OF_RANGE',
    );
    this.name = 'OutOfRangeError';
  }
}

export class UnsupportedSpaceError extends UXCoreError {
  constructor(space: unknown) {
    super(`Unsupported color space: ${JSON.stringify(space)}`, 'E_UNSUPPORTED_SPACE');
    this.name = 'UnsupportedSpaceError';
  }
}
